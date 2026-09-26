import express from 'express';
import http from 'http';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { WebSocketServer, WebSocket } from 'ws';
import { Chess, Square } from 'chess.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;

interface ChatEntry {
  sender: string;
  text: string;
  timestamp: number;
}

interface WsPlayer {
  ws?: WebSocket;
  userId: string;
  username: string;
  rating: number;
}

interface ActiveGameRoom {
  id: string;
  timeControlKey: string;
  baseMinutes: number;
  incrementSeconds: number;
  white: WsPlayer;
  black: WsPlayer | null;
  chess: Chess;
  whiteTimeMs: number;
  blackTimeMs: number;
  turn: 'w' | 'b';
  lastMoveTime: number;
  timerInterval?: NodeJS.Timeout;
  moves: Array<{ from: string; to: string; san: string; fen: string }>;
  status: 'waiting' | 'in_progress' | 'completed';
  drawOfferedBy?: 'w' | 'b';
  spectators: WebSocket[];
  chatMessages: ChatEntry[];
  gameOverResult?: {
    winner: 'w' | 'b' | 'draw';
    reason: string;
    status: 'draw' | 'checkmate';
    eloChanges?: { white: number; black: number };
  };
}

interface QueuedPlayer {
  ws?: WebSocket;
  userId: string;
  username: string;
  rating: number;
  timeControl: string;
  enqueuedAt: number;
}

const app = express();
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

const rooms = new Map<string, ActiveGameRoom>();
const matchmakingQueue: QueuedPlayer[] = [];

// Helper to determine time config
function parseTimeControl(tc: string) {
  if (tc === '1+0') return { baseMinutes: 1, incrementSeconds: 0 };
  if (tc === '3+0') return { baseMinutes: 3, incrementSeconds: 0 };
  if (tc === '3+2') return { baseMinutes: 3, incrementSeconds: 2 };
  if (tc === '5+0') return { baseMinutes: 5, incrementSeconds: 0 };
  if (tc === '10+0') return { baseMinutes: 10, incrementSeconds: 0 };
  if (tc === '15+10') return { baseMinutes: 15, incrementSeconds: 10 };
  return { baseMinutes: 3, incrementSeconds: 0 };
}

// Calculate standard Elo changes
function calculateEloChanges(whiteRating: number, blackRating: number, scoreWhite: 1 | 0.5 | 0, k = 32) {
  const expectedWhite = 1 / (1 + Math.pow(10, (blackRating - whiteRating) / 400));
  const expectedBlack = 1 - expectedWhite;
  const deltaWhite = Math.round(k * (scoreWhite - expectedWhite));
  const deltaBlack = Math.round(k * ((1 - scoreWhite) - expectedBlack));
  return { white: deltaWhite, black: deltaBlack };
}

// End a game room cleanly
function finishGame(room: ActiveGameRoom, winner: 'w' | 'b' | 'draw', reason: string) {
  if (room.status === 'completed') return;
  room.status = 'completed';

  if (room.timerInterval) {
    clearInterval(room.timerInterval);
    room.timerInterval = undefined;
  }

  const scoreWhite = winner === 'w' ? 1 : winner === 'b' ? 0 : 0.5;
  const eloChanges = calculateEloChanges(
    room.white.rating,
    room.black ? room.black.rating : room.white.rating,
    scoreWhite
  );

  const gameOverPayload = JSON.stringify({
    type: 'game_over',
    winner,
    reason,
    status: winner === 'draw' ? 'draw' : 'checkmate',
    eloChanges,
  });

  room.gameOverResult = {
    winner,
    reason,
    status: winner === 'draw' ? 'draw' : 'checkmate',
    eloChanges,
  };

  if (room.white.ws && room.white.ws.readyState === WebSocket.OPEN) {
    room.white.ws.send(gameOverPayload);
  }
  if (room.black && room.black.ws && room.black.ws.readyState === WebSocket.OPEN) {
    room.black.ws.send(gameOverPayload);
  }
  room.spectators.forEach((spec) => {
    if (spec.readyState === WebSocket.OPEN) spec.send(gameOverPayload);
  });
}

// Start clock ticking for an active room
function startRoomClock(room: ActiveGameRoom) {
  if (room.timerInterval) clearInterval(room.timerInterval);

  room.lastMoveTime = Date.now();
  room.timerInterval = setInterval(() => {
    if (room.status !== 'in_progress') {
      if (room.timerInterval) clearInterval(room.timerInterval);
      return;
    }

    const now = Date.now();
    const elapsed = now - room.lastMoveTime;
    room.lastMoveTime = now;

    if (room.turn === 'w') {
      room.whiteTimeMs = Math.max(0, room.whiteTimeMs - elapsed);
      if (room.whiteTimeMs <= 0) {
        finishGame(room, 'b', 'Hết giờ (Đen thắng do Trắng hết thời gian)');
        return;
      }
    } else {
      room.blackTimeMs = Math.max(0, room.blackTimeMs - elapsed);
      if (room.blackTimeMs <= 0) {
        finishGame(room, 'w', 'Hết giờ (Trắng thắng do Đen hết thời gian)');
        return;
      }
    }

    // Broadcast tick every second
    const tickMsg = JSON.stringify({
      type: 'clock_tick',
      whiteTimeMs: room.whiteTimeMs,
      blackTimeMs: room.blackTimeMs,
    });

    if (room.white.ws && room.white.ws.readyState === WebSocket.OPEN) room.white.ws.send(tickMsg);
    if (room.black && room.black.ws && room.black.ws.readyState === WebSocket.OPEN) room.black.ws.send(tickMsg);
  }, 250);
}

// Matchmaking loop
function processMatchmaking() {
  if (matchmakingQueue.length < 2) return;

  for (let i = 0; i < matchmakingQueue.length; i++) {
    const playerA = matchmakingQueue[i];
    if (playerA.ws && playerA.ws.readyState !== WebSocket.OPEN) continue;

    for (let j = i + 1; j < matchmakingQueue.length; j++) {
      const playerB = matchmakingQueue[j];
      if (playerB.ws && playerB.ws.readyState !== WebSocket.OPEN) continue;

      if (playerA.timeControl === playerB.timeControl && playerA.userId !== playerB.userId) {
        // Match found!
        matchmakingQueue.splice(j, 1);
        matchmakingQueue.splice(i, 1);

        const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        const { baseMinutes, incrementSeconds } = parseTimeControl(playerA.timeControl);

        const isAWhite = Math.random() < 0.5;
        const whitePlayer: WsPlayer = isAWhite ? playerA : playerB;
        const blackPlayer: WsPlayer = isAWhite ? playerB : playerA;

        const chess = new Chess();
        const room: ActiveGameRoom = {
          id: roomId,
          timeControlKey: playerA.timeControl,
          baseMinutes,
          incrementSeconds,
          white: whitePlayer,
          black: blackPlayer,
          chess,
          whiteTimeMs: baseMinutes * 60 * 1000,
          blackTimeMs: baseMinutes * 60 * 1000,
          turn: 'w',
          lastMoveTime: Date.now(),
          moves: [],
          status: 'in_progress',
          spectators: [],
          chatMessages: [],
        };

        rooms.set(roomId, room);

        const gameSessionData = {
          id: roomId,
          roomId,
          whitePlayer: { id: whitePlayer.userId, username: whitePlayer.username, rating: whitePlayer.rating, connected: true },
          blackPlayer: { id: blackPlayer.userId, username: blackPlayer.username, rating: blackPlayer.rating, connected: true },
          timeControl: playerA.timeControl,
          whiteTimeMs: room.whiteTimeMs,
          blackTimeMs: room.blackTimeMs,
          turn: 'w',
          fen: chess.fen(),
          moves: [],
          status: 'in_progress',
        };

        if (whitePlayer.ws && whitePlayer.ws.readyState === WebSocket.OPEN) {
          whitePlayer.ws.send(JSON.stringify({ type: 'game_start', game: gameSessionData, yourColor: 'w' }));
        }
        if (blackPlayer.ws && blackPlayer.ws.readyState === WebSocket.OPEN) {
          blackPlayer.ws.send(JSON.stringify({ type: 'game_start', game: gameSessionData, yourColor: 'b' }));
        }

        startRoomClock(room);
        return;
      }
    }
  }
}

// WebSocket connection handler
wss.on('connection', (ws: WebSocket) => {
  let attachedRoomId: string | null = null;
  let attachedUserId: string | null = null;

  ws.on('message', (raw: string) => {
    try {
      const data = JSON.parse(raw);

      // 1. Join Matchmaking Pool
      if (data.type === 'join_pool') {
        attachedUserId = data.user.id;
        // Remove existing queue entries
        const existingIdx = matchmakingQueue.findIndex((p) => p.userId === data.user.id || p.ws === ws);
        if (existingIdx !== -1) matchmakingQueue.splice(existingIdx, 1);

        matchmakingQueue.push({
          ws,
          userId: data.user.id,
          username: data.user.username,
          rating: data.user.rating || 1500,
          timeControl: data.timeControl,
          enqueuedAt: Date.now(),
        });

        ws.send(JSON.stringify({ type: 'pool_waiting', queueCount: matchmakingQueue.length }));
        processMatchmaking();
      }

      // 2. Leave Pool
      if (data.type === 'leave_pool') {
        const idx = matchmakingQueue.findIndex((p) => p.ws === ws);
        if (idx !== -1) matchmakingQueue.splice(idx, 1);
      }

      // 3. Create Private Room
      if (data.type === 'create_room') {
        attachedUserId = data.user.id;
        const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        const { baseMinutes, incrementSeconds } = parseTimeControl(data.timeControl);

        const room: ActiveGameRoom = {
          id: roomId,
          timeControlKey: data.timeControl,
          baseMinutes,
          incrementSeconds,
          white: { ws, userId: data.user.id, username: data.user.username, rating: data.user.rating || 1500 },
          black: null,
          chess: new Chess(),
          whiteTimeMs: baseMinutes * 60 * 1000,
          blackTimeMs: baseMinutes * 60 * 1000,
          turn: 'w',
          lastMoveTime: Date.now(),
          moves: [],
          status: 'waiting',
          spectators: [],
          chatMessages: [],
        };

        rooms.set(roomId, room);
        attachedRoomId = roomId;

        ws.send(JSON.stringify({
          type: 'room_created',
          roomId,
          shareUrl: `/room/${roomId}`,
          timeControl: data.timeControl,
        }));
      }

      // 4. Join Private Room
      if (data.type === 'join_room') {
        const room = rooms.get(data.roomId);
        if (!room) {
          ws.send(JSON.stringify({ type: 'error', message: 'Phòng không tồn tại hoặc đã hết hạn.' }));
          return;
        }

        if (room.black && room.status !== 'waiting') {
          // Join as spectator
          room.spectators.push(ws);
          ws.send(JSON.stringify({
            type: 'game_start',
            game: {
              id: room.id,
              roomId: room.id,
              whitePlayer: { id: room.white.userId, username: room.white.username, rating: room.white.rating, connected: true },
              blackPlayer: { id: room.black.userId, username: room.black.username, rating: room.black.rating, connected: true },
              timeControl: room.timeControlKey,
              whiteTimeMs: room.whiteTimeMs,
              blackTimeMs: room.blackTimeMs,
              turn: room.turn,
              fen: room.chess.fen(),
              status: room.status,
            },
            yourColor: 'w', // spectator views as white
          }));
          return;
        }

        attachedUserId = data.user.id;
        attachedRoomId = room.id;
        room.black = {
          ws,
          userId: data.user.id,
          username: data.user.username,
          rating: data.user.rating || 1500,
        };
        room.status = 'in_progress';

        const gameSessionData = {
          id: room.id,
          roomId: room.id,
          whitePlayer: { id: room.white.userId, username: room.white.username, rating: room.white.rating, connected: true },
          blackPlayer: { id: room.black.userId, username: room.black.username, rating: room.black.rating, connected: true },
          timeControl: room.timeControlKey,
          whiteTimeMs: room.whiteTimeMs,
          blackTimeMs: room.blackTimeMs,
          turn: 'w',
          fen: room.chess.fen(),
          status: 'in_progress',
        };

        room.white.ws.send(JSON.stringify({ type: 'game_start', game: gameSessionData, yourColor: 'w' }));
        room.black.ws.send(JSON.stringify({ type: 'game_start', game: gameSessionData, yourColor: 'b' }));

        startRoomClock(room);
      }

      // 5. Make Move (Server Authority)
      if (data.type === 'make_move') {
        const room = rooms.get(data.roomId);
        if (!room || room.status !== 'in_progress') return;

        const isWhite = room.white.ws === ws;
        const isBlack = room.black && room.black.ws === ws;
        if (!isWhite && !isBlack) return;

        const expectedTurn = room.chess.turn();
        if ((isWhite && expectedTurn !== 'w') || (isBlack && expectedTurn !== 'b')) {
          ws.send(JSON.stringify({ type: 'error', message: 'Chưa tới lượt của bạn.' }));
          return;
        }

        try {
          const move = room.chess.move({
            from: data.from,
            to: data.to,
            promotion: data.promotion || 'q',
          });

          if (move) {
            // Apply increment seconds to the player who just moved
            if (isWhite) {
              room.whiteTimeMs += room.incrementSeconds * 1000;
            } else {
              room.blackTimeMs += room.incrementSeconds * 1000;
            }

            room.turn = room.chess.turn();
            room.lastMoveTime = Date.now();
            room.moves.push({ from: move.from, to: move.to, san: move.san, fen: room.chess.fen() });

            const movePayload = JSON.stringify({
              type: 'move_made',
              move,
              fen: room.chess.fen(),
              whiteTimeMs: room.whiteTimeMs,
              blackTimeMs: room.blackTimeMs,
              turn: room.turn,
            });

            if (room.white.ws.readyState === WebSocket.OPEN) room.white.ws.send(movePayload);
            if (room.black && room.black.ws.readyState === WebSocket.OPEN) room.black.ws.send(movePayload);
            room.spectators.forEach((s) => {
              if (s.readyState === WebSocket.OPEN) s.send(movePayload);
            });

            // Check End Game conditions
            if (room.chess.isCheckmate()) {
              const winner = isWhite ? 'w' : 'b';
              finishGame(room, winner, `Chiếu hết! Bên ${winner === 'w' ? 'Trắng' : 'Đen'} chiến thắng.`);
            } else if (room.chess.isDraw()) {
              const reason = room.chess.isStalemate()
                ? 'Hòa do Pat (Stalemate)'
                : room.chess.isThreefoldRepetition()
                ? 'Hòa do lặp thế cờ 3 lần'
                : 'Hòa do không đủ lực lượng chiếu hết';
              finishGame(room, 'draw', reason);
            }
          }
        } catch {
          ws.send(JSON.stringify({ type: 'error', message: 'Nước cờ không hợp lệ.' }));
        }
      }

      // 6. Resign
      if (data.type === 'resign') {
        const room = rooms.get(data.roomId);
        if (!room || room.status !== 'in_progress') return;
        const isWhite = room.white.ws === ws;
        const winner = isWhite ? 'b' : 'w';
        finishGame(room, winner, `Bên ${isWhite ? 'Trắng' : 'Đen'} đã đầu hàng.`);
      }

      // 7. Offer & Accept Draw
      if (data.type === 'offer_draw') {
        const room = rooms.get(data.roomId);
        if (!room || room.status !== 'in_progress') return;
        const isWhite = room.white.ws === ws;
        room.drawOfferedBy = isWhite ? 'w' : 'b';
        const opponentWs = isWhite ? room.black?.ws : room.white.ws;
        if (opponentWs && opponentWs.readyState === WebSocket.OPEN) {
          opponentWs.send(JSON.stringify({ type: 'draw_offered', byColor: room.drawOfferedBy }));
        }
      }

      if (data.type === 'accept_draw') {
        const room = rooms.get(data.roomId);
        if (!room || room.status !== 'in_progress') return;
        finishGame(room, 'draw', 'Hai bên đồng ý hòa cờ.');
      }

      // 8. Chat
      if (data.type === 'chat_message') {
        const room = rooms.get(data.roomId);
        if (!room) return;
        const isWhite = room.white.ws === ws;
        const sender = isWhite ? room.white.username : (room.black?.username || 'Đối thủ');
        const chatBroadcast = JSON.stringify({
          type: 'chat_broadcast',
          sender,
          text: data.text,
          timestamp: Date.now(),
        });
        if (room.white.ws.readyState === WebSocket.OPEN) room.white.ws.send(chatBroadcast);
        if (room.black && room.black.ws.readyState === WebSocket.OPEN) room.black.ws.send(chatBroadcast);
      }
    } catch (e) {
      console.error('Error handling WebSocket message:', e);
    }
  });

  ws.on('close', () => {
    // Remove from queue if present
    const qIdx = matchmakingQueue.findIndex((p) => p.ws === ws);
    if (qIdx !== -1) matchmakingQueue.splice(qIdx, 1);

    // Handle room disconnect
    if (attachedRoomId) {
      const room = rooms.get(attachedRoomId);
      if (room && room.status === 'in_progress') {
        const isWhite = room.white.ws === ws;
        const opponentWs = isWhite ? room.black?.ws : room.white.ws;
        if (opponentWs && opponentWs.readyState === WebSocket.OPEN) {
          opponentWs.send(JSON.stringify({
            type: 'player_status',
            color: isWhite ? 'w' : 'b',
            connected: false,
          }));
        }
      }
    }
  });
});

// REST APIs
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    activeRooms: rooms.size,
    queuedPlayers: matchmakingQueue.length,
    timestamp: Date.now(),
  });
});

// Create Room via HTTP
app.post('/api/rooms/create', (req, res) => {
  try {
    const { timeControl, user } = req.body || {};
    if (!user || !user.id) {
      return res.status(400).json({ error: 'Thiếu thông tin người chơi' });
    }
    const tc = timeControl || '3+0';
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { baseMinutes, incrementSeconds } = parseTimeControl(tc);

    const room: ActiveGameRoom = {
      id: roomId,
      timeControlKey: tc,
      baseMinutes,
      incrementSeconds,
      white: { userId: user.id, username: user.username || 'Kỳ thủ', rating: user.rating || 1500 },
      black: null,
      chess: new Chess(),
      whiteTimeMs: baseMinutes * 60 * 1000,
      blackTimeMs: baseMinutes * 60 * 1000,
      turn: 'w',
      lastMoveTime: Date.now(),
      moves: [],
      status: 'waiting',
      spectators: [],
      chatMessages: [],
    };

    rooms.set(roomId, room);

    res.json({
      type: 'room_created',
      roomId,
      shareUrl: `/room/${roomId}`,
      timeControl: tc,
    });
  } catch (err) {
    console.error('Error creating room via HTTP:', err);
    res.status(500).json({ error: 'Không thể tạo phòng lúc này' });
  }
});

// Join Room via HTTP
app.post('/api/rooms/join', (req, res) => {
  try {
    const { roomId, user } = req.body || {};
    if (!roomId || !user || !user.id) {
      return res.status(400).json({ error: 'Thiếu thông tin phòng hoặc người chơi' });
    }
    const code = roomId.trim().toUpperCase();
    const room = rooms.get(code);
    if (!room) {
      return res.status(404).json({ error: 'Phòng không tồn tại hoặc đã hết hạn.' });
    }

    // Already White
    if (room.white.userId === user.id) {
      const gameSessionData = {
        id: room.id,
        roomId: room.id,
        whitePlayer: { id: room.white.userId, username: room.white.username, rating: room.white.rating, connected: true },
        blackPlayer: room.black ? { id: room.black.userId, username: room.black.username, rating: room.black.rating, connected: true } : null,
        timeControl: room.timeControlKey,
        whiteTimeMs: room.whiteTimeMs,
        blackTimeMs: room.blackTimeMs,
        turn: room.turn,
        fen: room.chess.fen(),
        status: room.status,
        moves: room.moves,
      };
      return res.json({ type: 'game_start', game: gameSessionData, yourColor: 'w' });
    }

    // Already Black
    if (room.black && room.black.userId === user.id) {
      const gameSessionData = {
        id: room.id,
        roomId: room.id,
        whitePlayer: { id: room.white.userId, username: room.white.username, rating: room.white.rating, connected: true },
        blackPlayer: { id: room.black.userId, username: room.black.username, rating: room.black.rating, connected: true },
        timeControl: room.timeControlKey,
        whiteTimeMs: room.whiteTimeMs,
        blackTimeMs: room.blackTimeMs,
        turn: room.turn,
        fen: room.chess.fen(),
        status: room.status,
        moves: room.moves,
      };
      return res.json({ type: 'game_start', game: gameSessionData, yourColor: 'b' });
    }

    // Already full -> spectator
    if (room.black && room.status !== 'waiting') {
      const gameSessionData = {
        id: room.id,
        roomId: room.id,
        whitePlayer: { id: room.white.userId, username: room.white.username, rating: room.white.rating, connected: true },
        blackPlayer: { id: room.black.userId, username: room.black.username, rating: room.black.rating, connected: true },
        timeControl: room.timeControlKey,
        whiteTimeMs: room.whiteTimeMs,
        blackTimeMs: room.blackTimeMs,
        turn: room.turn,
        fen: room.chess.fen(),
        status: room.status,
        moves: room.moves,
      };
      return res.json({ type: 'game_start', game: gameSessionData, yourColor: 'w', isSpectator: true });
    }

    // Join as Black
    room.black = {
      userId: user.id,
      username: user.username || 'Đối thủ',
      rating: user.rating || 1500,
    };
    room.status = 'in_progress';

    const gameSessionData = {
      id: room.id,
      roomId: room.id,
      whitePlayer: { id: room.white.userId, username: room.white.username, rating: room.white.rating, connected: true },
      blackPlayer: { id: room.black.userId, username: room.black.username, rating: room.black.rating, connected: true },
      timeControl: room.timeControlKey,
      whiteTimeMs: room.whiteTimeMs,
      blackTimeMs: room.blackTimeMs,
      turn: 'w',
      fen: room.chess.fen(),
      status: 'in_progress',
      moves: [],
    };

    if (room.white.ws && room.white.ws.readyState === WebSocket.OPEN) {
      room.white.ws.send(JSON.stringify({ type: 'game_start', game: gameSessionData, yourColor: 'w' }));
    }

    startRoomClock(room);
    res.json({ type: 'game_start', game: gameSessionData, yourColor: 'b' });
  } catch (err) {
    console.error('Error joining room via HTTP:', err);
    res.status(500).json({ error: 'Lỗi khi tham gia phòng' });
  }
});

// Sync Room State
app.get('/api/rooms/:roomId/sync', (req, res) => {
  const code = req.params.roomId.trim().toUpperCase();
  const room = rooms.get(code);
  if (!room) {
    return res.status(404).json({ error: 'Phòng không tồn tại' });
  }

  res.json({
    id: room.id,
    roomId: room.id,
    status: room.status,
    timeControl: room.timeControlKey,
    fen: room.chess.fen(),
    turn: room.turn,
    whiteTimeMs: room.whiteTimeMs,
    blackTimeMs: room.blackTimeMs,
    whitePlayer: { id: room.white.userId, username: room.white.username, rating: room.white.rating, connected: true },
    blackPlayer: room.black ? { id: room.black.userId, username: room.black.username, rating: room.black.rating, connected: true } : null,
    moves: room.moves,
    lastMove: room.moves.length > 0 ? room.moves[room.moves.length - 1] : null,
    chatMessages: room.chatMessages,
    drawOfferedBy: room.drawOfferedBy,
    gameOverResult: room.gameOverResult,
  });
});

// Make Move via HTTP
app.post('/api/rooms/:roomId/move', (req, res) => {
  const code = req.params.roomId.trim().toUpperCase();
  const room = rooms.get(code);
  if (!room || room.status !== 'in_progress') {
    return res.status(400).json({ error: 'Ván đấu chưa diễn ra hoặc đã kết thúc.' });
  }

  const { from, to, promotion, userId } = req.body || {};
  const isWhite = room.white.userId === userId;
  const isBlack = room.black && room.black.userId === userId;

  if (!isWhite && !isBlack) {
    return res.status(403).json({ error: 'Bạn không phải kỳ thủ trong ván đấu này.' });
  }

  const expectedTurn = room.chess.turn();
  if ((isWhite && expectedTurn !== 'w') || (isBlack && expectedTurn !== 'b')) {
    return res.status(400).json({ error: 'Chưa tới lượt của bạn.' });
  }

  try {
    const move = room.chess.move({
      from,
      to,
      promotion: promotion || 'q',
    });

    if (!move) {
      return res.status(400).json({ error: 'Nước cờ không hợp lệ.' });
    }

    if (isWhite) {
      room.whiteTimeMs += room.incrementSeconds * 1000;
    } else {
      room.blackTimeMs += room.incrementSeconds * 1000;
    }

    room.turn = room.chess.turn();
    room.lastMoveTime = Date.now();
    room.moves.push({ from: move.from, to: move.to, san: move.san, fen: room.chess.fen() });

    const movePayload = JSON.stringify({
      type: 'move_made',
      move,
      fen: room.chess.fen(),
      whiteTimeMs: room.whiteTimeMs,
      blackTimeMs: room.blackTimeMs,
      turn: room.turn,
    });

    if (room.white.ws && room.white.ws.readyState === WebSocket.OPEN) room.white.ws.send(movePayload);
    if (room.black && room.black.ws && room.black.ws.readyState === WebSocket.OPEN) room.black.ws.send(movePayload);
    room.spectators.forEach((s) => {
      if (s.readyState === WebSocket.OPEN) s.send(movePayload);
    });

    if (room.chess.isCheckmate()) {
      const winner = isWhite ? 'w' : 'b';
      finishGame(room, winner, `Chiếu hết! Bên ${winner === 'w' ? 'Trắng' : 'Đen'} chiến thắng.`);
    } else if (room.chess.isDraw()) {
      const reason = room.chess.isStalemate()
        ? 'Hòa do Pat (Stalemate)'
        : room.chess.isThreefoldRepetition()
        ? 'Hòa do lặp thế cờ 3 lần'
        : 'Hòa do không đủ lực lượng chiếu hết';
      finishGame(room, 'draw', reason);
    }

    res.json({
      success: true,
      move,
      fen: room.chess.fen(),
      turn: room.turn,
      whiteTimeMs: room.whiteTimeMs,
      blackTimeMs: room.blackTimeMs,
      gameOverResult: room.gameOverResult,
    });
  } catch (err) {
    res.status(400).json({ error: 'Nước cờ không hợp lệ.' });
  }
});

// Resign via HTTP
app.post('/api/rooms/:roomId/resign', (req, res) => {
  const code = req.params.roomId.trim().toUpperCase();
  const room = rooms.get(code);
  if (!room || room.status !== 'in_progress') return res.status(400).json({ error: 'Phòng không hợp lệ' });
  const { userId } = req.body || {};
  const isWhite = room.white.userId === userId;
  const winner = isWhite ? 'b' : 'w';
  finishGame(room, winner, `Bên ${isWhite ? 'Trắng' : 'Đen'} đã đầu hàng.`);
  res.json({ success: true, gameOverResult: room.gameOverResult });
});

// Offer Draw via HTTP
app.post('/api/rooms/:roomId/offer-draw', (req, res) => {
  const code = req.params.roomId.trim().toUpperCase();
  const room = rooms.get(code);
  if (!room || room.status !== 'in_progress') return res.status(400).json({ error: 'Phòng không hợp lệ' });
  const { userId } = req.body || {};
  const isWhite = room.white.userId === userId;
  room.drawOfferedBy = isWhite ? 'w' : 'b';
  const opponentWs = isWhite ? room.black?.ws : room.white.ws;
  if (opponentWs && opponentWs.readyState === WebSocket.OPEN) {
    opponentWs.send(JSON.stringify({ type: 'draw_offered', byColor: room.drawOfferedBy }));
  }
  res.json({ success: true });
});

// Accept Draw via HTTP
app.post('/api/rooms/:roomId/accept-draw', (req, res) => {
  const code = req.params.roomId.trim().toUpperCase();
  const room = rooms.get(code);
  if (!room || room.status !== 'in_progress') return res.status(400).json({ error: 'Phòng không hợp lệ' });
  finishGame(room, 'draw', 'Hai bên đồng ý hòa cờ.');
  res.json({ success: true, gameOverResult: room.gameOverResult });
});

// Chat via HTTP
app.post('/api/rooms/:roomId/chat', (req, res) => {
  const code = req.params.roomId.trim().toUpperCase();
  const room = rooms.get(code);
  if (!room) return res.status(404).json({ error: 'Phòng không tồn tại' });
  const { sender, text } = req.body || {};
  const chatMsg: ChatEntry = {
    sender: sender || 'Kỳ thủ',
    text: text || '',
    timestamp: Date.now(),
  };
  room.chatMessages.push(chatMsg);
  const chatBroadcast = JSON.stringify({
    type: 'chat_broadcast',
    sender: chatMsg.sender,
    text: chatMsg.text,
    timestamp: chatMsg.timestamp,
  });
  if (room.white.ws && room.white.ws.readyState === WebSocket.OPEN) room.white.ws.send(chatBroadcast);
  if (room.black && room.black.ws && room.black.ws.readyState === WebSocket.OPEN) room.black.ws.send(chatBroadcast);
  res.json({ success: true, message: chatMsg });
});

// Matchmaking via HTTP
app.post('/api/matchmaking/join', (req, res) => {
  const { timeControl, user } = req.body || {};
  if (!user || !user.id) return res.status(400).json({ error: 'Thiếu thông tin người chơi' });
  const existingIdx = matchmakingQueue.findIndex((p) => p.userId === user.id);
  if (existingIdx !== -1) matchmakingQueue.splice(existingIdx, 1);

  matchmakingQueue.push({
    userId: user.id,
    username: user.username || 'Kỳ thủ',
    rating: user.rating || 1500,
    timeControl: timeControl || '3+0',
    enqueuedAt: Date.now(),
  });
  processMatchmaking();
  res.json({ success: true, queueCount: matchmakingQueue.length });
});

app.get('/api/matchmaking/poll', (req, res) => {
  const userId = req.query.userId as string;
  if (!userId) return res.status(400).json({ error: 'Thiếu userId' });

  for (const [rId, room] of rooms.entries()) {
    if (room.status === 'in_progress' && (room.white.userId === userId || (room.black && room.black.userId === userId))) {
      const isWhite = room.white.userId === userId;
      return res.json({
        matched: true,
        roomId: rId,
        yourColor: isWhite ? 'w' : 'b',
        game: {
          id: room.id,
          roomId: room.id,
          whitePlayer: { id: room.white.userId, username: room.white.username, rating: room.white.rating, connected: true },
          blackPlayer: { id: room.black!.userId, username: room.black!.username, rating: room.black!.rating, connected: true },
          timeControl: room.timeControlKey,
          whiteTimeMs: room.whiteTimeMs,
          blackTimeMs: room.blackTimeMs,
          turn: room.turn,
          fen: room.chess.fen(),
          status: room.status,
          moves: room.moves,
        },
      });
    }
  }

  res.json({ matched: false, queueCount: matchmakingQueue.length });
});

app.post('/api/matchmaking/leave', (req, res) => {
  const { userId } = req.body || {};
  if (userId) {
    const idx = matchmakingQueue.findIndex((p) => p.userId === userId);
    if (idx !== -1) matchmakingQueue.splice(idx, 1);
  }
  res.json({ success: true });
});

// Production and Vite setup
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Chess Server listening on http://0.0.0.0:${PORT} with WebSocket on /ws`);
  });
}

start();
