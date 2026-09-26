import React, { useState, useEffect, useRef } from 'react';
import { Chess, Square } from 'chess.js';
import {
  PieceColor,
  PieceType,
  TimeControlKey,
  OnlineGameSession,
  ClientWsMessage,
  ServerWsMessage,
} from '../types';
import { TIME_CONTROLS } from '../data/chessData';
import { ChessBoard } from './ChessBoard';
import { ChessClock } from './ChessClock';
import { MoveHistory } from './MoveHistory';
import { recordMatch } from '../utils/historyStorage';
import { AnimatedSendButton } from './AnimatedSendButton';
import {
  Zap,
  Flame,
  Clock,
  Link,
  Users,
  Flag,
  Handshake,
  Send,
  MessageSquare,
  AlertTriangle,
  RotateCw,
  Trophy,
} from 'lucide-react';

interface OnlineGameViewProps {
  userId: string;
  username: string;
  userElo: number;
  onEloUpdate?: (category: string, newRating: number) => void;
}

export const OnlineGameView: React.FC<OnlineGameViewProps> = ({
  userId,
  username,
  userElo,
  onEloUpdate,
}) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionType, setConnectionType] = useState<'ws' | 'http' | 'checking'>('checking');
  const [pingMs, setPingMs] = useState<number>(0);
  const [isChecking, setIsChecking] = useState(false);

  const [activeSession, setActiveSession] = useState<OnlineGameSession | null>(null);
  const [myColor, setMyColor] = useState<PieceColor>('w');
  const [game, setGame] = useState(() => new Chess());
  const [whiteTimeMs, setWhiteTimeMs] = useState(180000);
  const [blackTimeMs, setBlackTimeMs] = useState(180000);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);

  // Matchmaking & Room Creation State
  const [isSearchingPool, setIsSearchingPool] = useState(false);
  const [selectedTimeControl, setSelectedTimeControl] = useState<TimeControlKey>('3+0');
  const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(null);
  const [inputRoomCode, setInputRoomCode] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; time: number }[]>([]);
  const [drawOfferedByOpponent, setDrawOfferedByOpponent] = useState(false);
  const [gameOverResult, setGameOverResult] = useState<{
    title: string;
    reason: string;
    eloChanges?: { white: number; black: number };
  } | null>(null);

  const gameRef = useRef(game);
  gameRef.current = game;
  const sessionRef = useRef(activeSession);
  sessionRef.current = activeSession;
  const myColorRef = useRef(myColor);
  myColorRef.current = myColor;

  // Unified Game Over Handler
  const handleGameOverResult = (result: {
    winner: 'w' | 'b' | 'draw';
    reason: string;
    eloChanges?: { white: number; black: number };
  }) => {
    if (gameOverResult) return;
    const currentSession = sessionRef.current;
    const currentColor = myColorRef.current;
    const isWin = result.winner === currentColor;
    const isDraw = result.winner === 'draw';
    const eloDiff = result.eloChanges
      ? currentColor === 'w'
        ? result.eloChanges.white
        : result.eloChanges.black
      : 0;
    const opponent = currentSession
      ? currentColor === 'w'
        ? currentSession.blackPlayer
        : currentSession.whitePlayer
      : null;

    recordMatch({
      gameMode: 'online',
      timeControl: currentSession ? `${currentSession.timeControl} Online` : '3+0 Blitz',
      opponentName: opponent ? opponent.username : 'Kỳ thủ đối phương',
      opponentElo: opponent ? opponent.rating : 1500,
      myColor: currentColor,
      result: isDraw ? 'draw' : isWin ? 'win' : 'loss',
      reason: result.reason,
      eloChange: eloDiff,
      movesCount: Math.ceil(gameRef.current.history().length / 2),
      finalFen: gameRef.current.fen(),
    });

    setGameOverResult({
      title:
        result.winner === 'draw'
          ? 'Trận đấu kết thúc Hòa'
          : `Bên ${result.winner === 'w' ? 'Trắng' : 'Đen'} thắng!`,
      reason: result.reason,
      eloChanges: result.eloChanges,
    });
    if (result.eloChanges && onEloUpdate) {
      const change = currentColor === 'w' ? result.eloChanges.white : result.eloChanges.black;
      onEloUpdate('blitz', userElo + change);
    }
  };

  // Connection check (both HTTP ping and WebSocket readiness)
  const checkConnection = async () => {
    setIsChecking(true);
    const start = performance.now();
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const latency = Math.round(performance.now() - start);
        setPingMs(latency);
        setIsConnected(true);
        if (!ws || ws.readyState !== WebSocket.OPEN) {
          setConnectionType('http');
        }
      } else {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
          setIsConnected(false);
        }
      }
    } catch {
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        setIsConnected(false);
      }
    } finally {
      setIsChecking(false);
    }
  };

  // Connect WebSocket with resilient fallback
  useEffect(() => {
    checkConnection();

    let socket: WebSocket | null = null;
    let isCleanedUp = false;

    const connectWs = () => {
      if (isCleanedUp) return;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      try {
        socket = new WebSocket(wsUrl);
        setWs(socket);

        socket.onopen = () => {
          if (isCleanedUp) return;
          setIsConnected(true);
          setConnectionType('ws');
        };

        socket.onclose = () => {
          if (isCleanedUp) return;
          // Fall back to HTTP
          setConnectionType('http');
          checkConnection();
        };

        socket.onerror = () => {
          if (isCleanedUp) return;
          setConnectionType('http');
          checkConnection();
        };

        socket.onmessage = (event) => {
          try {
            const msg: ServerWsMessage = JSON.parse(event.data);
            handleServerMessage(msg);
          } catch (e) {
            console.error('Failed to parse WS message:', e);
          }
        };
      } catch {
        setConnectionType('http');
        checkConnection();
      }
    };

    connectWs();

    // Auto-ping every 10s to keep connection status fresh
    const pingTimer = setInterval(checkConnection, 10000);

    return () => {
      isCleanedUp = true;
      clearInterval(pingTimer);
      if (socket) socket.close();
    };
  }, []);

  // Handle incoming server messages (via WebSocket)
  const handleServerMessage = (msg: ServerWsMessage) => {
    switch (msg.type) {
      case 'room_created':
        setCreatedRoomCode(msg.roomId);
        break;

      case 'game_start':
        setIsSearchingPool(false);
        setCreatedRoomCode(null);
        setActiveSession(msg.game);
        setMyColor(msg.yourColor);
        setWhiteTimeMs(msg.game.whiteTimeMs);
        setBlackTimeMs(msg.game.blackTimeMs);
        setGame(new Chess(msg.game.fen));
        setLastMove(null);
        setGameOverResult(null);
        setChatMessages([]);
        break;

      case 'move_made':
        setGame(new Chess(msg.fen));
        setWhiteTimeMs(msg.whiteTimeMs);
        setBlackTimeMs(msg.blackTimeMs);
        setLastMove({ from: msg.move.from, to: msg.move.to });
        break;

      case 'clock_tick':
        setWhiteTimeMs(msg.whiteTimeMs);
        setBlackTimeMs(msg.blackTimeMs);
        break;

      case 'draw_offered':
        setDrawOfferedByOpponent(true);
        break;

      case 'game_over':
        handleGameOverResult({
          winner: msg.winner,
          reason: msg.reason,
          eloChanges: msg.eloChanges,
        });
        break;

      case 'chat_broadcast':
        setChatMessages((prev) => [
          ...prev,
          { sender: msg.sender, text: msg.text, time: msg.timestamp },
        ]);
        break;

      case 'error':
        alert(`Thông báo: ${msg.message}`);
        setIsSearchingPool(false);
        break;

      default:
        break;
    }
  };

  // Fast Polling when waiting in a created room (detect opponent join)
  useEffect(() => {
    if (!createdRoomCode) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/rooms/${createdRoomCode}/sync`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'in_progress' && data.blackPlayer) {
            // Opponent joined!
            setCreatedRoomCode(null);
            setActiveSession({
              id: data.id,
              roomId: data.id,
              whitePlayer: data.whitePlayer,
              blackPlayer: data.blackPlayer,
              timeControl: data.timeControl,
              whiteTimeMs: data.whiteTimeMs,
              blackTimeMs: data.blackTimeMs,
              turn: data.turn,
              fen: data.fen,
              status: 'in_progress',
              moves: data.moves,
              spectatorCount: data.spectatorCount || 0,
              createdAt: data.createdAt || Date.now(),
            });
            setMyColor('w');

            setWhiteTimeMs(data.whiteTimeMs);
            setBlackTimeMs(data.blackTimeMs);
            setGame(new Chess(data.fen));
            setGameOverResult(null);
            setChatMessages([]);
          }
        }
      } catch (err) {
        console.error('Room sync check error:', err);
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [createdRoomCode]);

  // Fast Polling when searching pool in HTTP mode
  useEffect(() => {
    if (!isSearchingPool) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/matchmaking/poll?userId=${encodeURIComponent(userId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.matched && data.game) {
            setIsSearchingPool(false);
            setActiveSession(data.game);
            setMyColor(data.yourColor);
            setWhiteTimeMs(data.game.whiteTimeMs);
            setBlackTimeMs(data.game.blackTimeMs);
            setGame(new Chess(data.game.fen));
            setLastMove(null);
            setGameOverResult(null);
            setChatMessages([]);
          }
        }
      } catch (err) {
        console.error('Matchmaking poll error:', err);
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [isSearchingPool, userId]);

  // Fast Polling during active match for guaranteed state synchronization
  useEffect(() => {
    if (!activeSession || activeSession.status !== 'in_progress' || gameOverResult) return;


    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/rooms/${activeSession.roomId}/sync`);
        if (res.ok) {
          const data = await res.json();
          if (data.whiteTimeMs !== undefined) setWhiteTimeMs(data.whiteTimeMs);
          if (data.blackTimeMs !== undefined) setBlackTimeMs(data.blackTimeMs);

          // Update board if remote move was made
          if (data.fen && data.fen !== gameRef.current.fen()) {
            setGame(new Chess(data.fen));
            if (data.lastMove) {
              setLastMove({ from: data.lastMove.from, to: data.lastMove.to });
            }
          }

          // Check if draw was offered to me
          if (data.drawOfferedBy && data.drawOfferedBy !== myColorRef.current) {
            setDrawOfferedByOpponent(true);
          }

          // Check if game over occurred
          if (data.gameOverResult && !gameOverResult) {
            handleGameOverResult(data.gameOverResult);
          }

          // Sync chat messages
          if (data.chatMessages && Array.isArray(data.chatMessages)) {
            setChatMessages((prev) => {
              if (data.chatMessages.length > prev.length) {
                return data.chatMessages.map((m: { sender: string; text: string; timestamp: number }) => ({
                  sender: m.sender,
                  text: m.text,
                  time: m.timestamp,
                }));
              }
              return prev;
            });
          }
        }
      } catch (err) {
        console.error('Active match sync error:', err);
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [activeSession?.roomId, gameOverResult]);

  // Unified Action Handlers (WebSocket with HTTP fallback)
  const handleJoinPool = async (tc: TimeControlKey) => {
    setSelectedTimeControl(tc);
    setIsSearchingPool(true);

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'join_pool',
        timeControl: tc,
        user: { id: userId, username, rating: userElo },
      }));
    } else {
      try {
        await fetch('/api/matchmaking/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            timeControl: tc,
            user: { id: userId, username, rating: userElo },
          }),
        });
      } catch (err) {
        console.error('Error joining matchmaking via HTTP:', err);
      }
    }
  };

  const handleCancelPool = async () => {
    setIsSearchingPool(false);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'leave_pool' }));
    }
    try {
      await fetch('/api/matchmaking/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
    } catch (err) {
      console.error('Error leaving pool:', err);
    }
  };

  const handleCreateRoom = async (tc: TimeControlKey) => {
    setSelectedTimeControl(tc);

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'create_room',
        timeControl: tc,
        user: { id: userId, username, rating: userElo },
      }));
    } else {
      try {
        const res = await fetch('/api/rooms/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            timeControl: tc,
            user: { id: userId, username, rating: userElo },
          }),
        });
        const data = await res.json();
        if (data.roomId) {
          setCreatedRoomCode(data.roomId);
        } else {
          alert('Không thể tạo phòng lúc này. Vui lòng thử lại.');
        }
      } catch (err) {
        console.error('Error creating room via HTTP:', err);
        alert('Lỗi kết nối khi tạo phòng.');
      }
    }
  };

  const handleJoinByCode = async () => {
    const code = inputRoomCode.trim().toUpperCase();
    if (!code) return;

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'join_room',
        roomId: code,
        user: { id: userId, username, rating: userElo },
      }));
    } else {
      try {
        const res = await fetch('/api/rooms/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId: code,
            user: { id: userId, username, rating: userElo },
          }),
        });
        const data = await res.json();
        if (data.game) {
          handleServerMessage(data);
        } else if (data.error) {
          alert(data.error);
        }
      } catch (err) {
        console.error('Error joining room via HTTP:', err);
        alert('Lỗi kết nối khi vào phòng.');
      }
    }
  };

  const handlePlayerMove = (from: Square, to: Square, promotion?: PieceType): boolean => {
    if (!activeSession || game.turn() !== myColor) return false;

    try {
      const testGame = new Chess(game.fen());
      const move = testGame.move({ from, to, promotion: promotion || 'q' });
      if (!move) return false;

      // Optimistic update
      setGame(testGame);
      setLastMove({ from, to });

      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'make_move',
          roomId: activeSession.roomId,
          from,
          to,
          promotion: promotion || 'q',
        }));
      } else {
        fetch(`/api/rooms/${activeSession.roomId}/move`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from,
            to,
            promotion: promotion || 'q',
            userId,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data?.success) {
              if (data.whiteTimeMs !== undefined) setWhiteTimeMs(data.whiteTimeMs);
              if (data.blackTimeMs !== undefined) setBlackTimeMs(data.blackTimeMs);
              if (data.gameOverResult) {
                handleGameOverResult(data.gameOverResult);
              }
            }
          })
          .catch((err) => {
            console.error('Move error via HTTP fallback:', err);
          });
      }
      return true;
    } catch {
      return false;
    }
  };


  const handleResign = async () => {
    if (!activeSession || !confirm('Bạn có chắc chắn muốn đầu hàng (Resign) ván này?')) return;

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'resign', roomId: activeSession.roomId }));
    } else {
      try {
        const res = await fetch(`/api/rooms/${activeSession.roomId}/resign`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
        const data = await res.json();
        if (data.gameOverResult) {
          handleGameOverResult(data.gameOverResult);
        }
      } catch (err) {
        console.error('Error resigning via HTTP:', err);
      }
    }
  };

  const handleOfferDraw = async () => {
    if (!activeSession) return;

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'offer_draw', roomId: activeSession.roomId }));
    } else {
      try {
        await fetch(`/api/rooms/${activeSession.roomId}/offer-draw`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
      } catch (err) {
        console.error('Error offering draw:', err);
      }
    }
    alert('Đã gửi lời đề nghị hòa đến đối thủ.');
  };

  const handleAcceptDraw = async () => {
    if (!activeSession) return;

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'accept_draw', roomId: activeSession.roomId }));
    } else {
      try {
        const res = await fetch(`/api/rooms/${activeSession.roomId}/accept-draw`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
        const data = await res.json();
        if (data.gameOverResult) {
          handleGameOverResult(data.gameOverResult);
        }
      } catch (err) {
        console.error('Error accepting draw:', err);
      }
    }
    setDrawOfferedByOpponent(false);
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeSession) return;
    const text = chatInput.trim();
    setChatInput('');

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'chat_message',
        roomId: activeSession.roomId,
        text,
      }));
    } else {
      try {
        await fetch(`/api/rooms/${activeSession.roomId}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sender: username, text }),
        });
        setChatMessages((prev) => [
          ...prev,
          { sender: username, text, time: Date.now() },
        ]);
      } catch (err) {
        console.error('Error sending chat via HTTP:', err);
      }
    }
  };

  const handleCopyInviteLink = () => {
    if (!createdRoomCode) return;
    const url = `${window.location.origin}/?room=${createdRoomCode}`;
    navigator.clipboard.writeText(url);
    alert(`Đã sao chép link mời: ${url}\nMã phòng: ${createdRoomCode}`);
  };

  // If no active session, show the Lobby (Matchmaking + Room creation)
  if (!activeSession) {
    return (
      <div className="max-w-4xl mx-auto w-full p-4 flex flex-col gap-6">
        {/* Connection status banner */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-xs shadow-sm">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
              }`}
            />
            <div className="flex items-center gap-2">
              <span className="text-stone-300 font-mono">
                Máy chủ chesshehe:{' '}
                <strong className={isConnected ? 'text-emerald-400' : 'text-red-400'}>
                  {isConnected
                    ? connectionType === 'ws'
                      ? 'Trực tuyến (WebSocket Real-time)'
                      : 'Trực tuyến (HTTP Fast-Sync Engine)'
                    : 'Mất kết nối'}
                </strong>
              </span>
              {pingMs > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-800 text-stone-400 font-mono border border-stone-700">
                  {pingMs}ms
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={checkConnection}
              disabled={isChecking}
              title="Kiểm tra lại kết nối máy chủ"
              className="flex items-center gap-1.5 px-2.5 py-1 bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-stone-300 rounded-lg transition cursor-pointer text-[11px] font-mono"
            >
              <RotateCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Đang kiểm tra...' : 'Làm mới'}</span>
            </button>
            <span className="text-stone-400 font-mono hidden sm:inline">
              Kỳ thủ: <strong className="text-amber-400">{username}</strong> ({userElo} Elo)
            </span>
          </div>
        </div>

        {/* Searching Pool Overlay */}
        {isSearchingPool && (
          <div className="bg-stone-900 border border-amber-500/50 p-6 rounded-xl flex flex-col items-center text-center gap-3 shadow-xl animate-fade-in">
            <div className="w-12 h-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin flex items-center justify-center text-amber-500" />
            <h3 className="text-base font-bold text-stone-100">
              Đang tìm kiếm đối thủ xứng tầm...
            </h3>
            <p className="text-xs text-stone-400 max-w-sm">
              Hệ thống đang ghép cặp người chơi theo mức Elo chênh lệch &le; 100 điểm với thời gian {selectedTimeControl}.
            </p>
            <button
              onClick={handleCancelPool}
              className="mt-2 px-5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              Hủy tìm trận
            </button>
          </div>
        )}

        {/* Room Created Modal / Box */}
        {createdRoomCode && (
          <div className="bg-stone-900 border border-emerald-500/60 p-6 rounded-xl flex flex-col items-center text-center gap-3.5 shadow-xl animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-100">
                Phòng thi đấu riêng đã sẵn sàng!
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                Chia sẻ mã phòng hoặc link này cho đối thủ để họ tham gia bàn cờ:
              </p>
            </div>
            <div className="flex items-center gap-3 bg-stone-950 border border-emerald-500/40 px-5 py-2.5 rounded-xl font-mono text-2xl font-black text-amber-400 tracking-widest shadow-inner">
              {createdRoomCode}
            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-400/90 font-mono py-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Đang lắng nghe đối thủ tham gia vào phòng...</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5 mt-1">
              <button
                onClick={handleCopyInviteLink}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
              >
                <Link className="w-3.5 h-3.5" />
                Sao chép link mời
              </button>
              <button
                onClick={() => setCreatedRoomCode(null)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs transition cursor-pointer"
              >
                Hủy / Đóng
              </button>
            </div>
          </div>
        )}

        {/* Quick Matchmaking Grid */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Ghép trận ngẫu nhiên (Matchmaking theo Elo)
            </h2>
            <span className="text-xs text-stone-400">Chọn mốc thời gian để bắt đầu</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {TIME_CONTROLS.map((tc) => (
              <button
                key={tc.key}
                onClick={() => handleJoinPool(tc.key)}
                disabled={isSearchingPool}
                className="p-4 bg-stone-900 hover:bg-stone-800/80 active:bg-stone-800 border border-stone-800 hover:border-amber-500/50 rounded-xl flex flex-col items-center text-center gap-1.5 transition-all group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-stone-800 group-hover:bg-amber-500/20 text-stone-400 group-hover:text-amber-400 flex items-center justify-center transition">
                  {tc.category === 'Bullet' ? (
                    <Zap className="w-4 h-4" />
                  ) : tc.category === 'Blitz' ? (
                    <Flame className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                </div>
                <span className="text-sm font-bold text-stone-200 group-hover:text-amber-400">
                  {tc.key}
                </span>
                <span className="text-[11px] text-stone-400">{tc.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Private Room / Invite Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-stone-800">
          {/* Create Room */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 flex flex-col gap-3">
            <h3 className="text-sm font-bold text-stone-200 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              Tạo phòng riêng đấu bạn bè
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Tạo phòng tùy chỉnh thời gian và nhận liên kết trực tiếp để gửi cho bạn bè qua Zalo, Messenger hoặc Discord.
            </p>
            <div className="flex gap-2 mt-auto">
              <select
                value={selectedTimeControl}
                onChange={(e) => setSelectedTimeControl(e.target.value as TimeControlKey)}
                className="bg-stone-950 border border-stone-700 text-stone-200 text-xs rounded-lg px-3 py-2 outline-hidden"
              >
                {TIME_CONTROLS.map((tc) => (
                  <option key={tc.key} value={tc.key}>
                    {tc.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleCreateRoom(selectedTimeControl)}
                className="flex-1 py-2 px-4 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-lg text-xs transition cursor-pointer"
              >
                Tạo phòng ngay
              </button>
            </div>
          </div>

          {/* Join Room by Code */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 flex flex-col gap-3">
            <h3 className="text-sm font-bold text-stone-200 flex items-center gap-2">
              <Link className="w-4 h-4 text-amber-400" />
              Tham gia bằng mã phòng
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Bạn có mã phòng từ bạn bè? Nhập mã 6 ký tự vào đây để vào bàn thi đấu ngay lập tức.
            </p>
            <div className="flex gap-2 mt-auto">
              <input
                type="text"
                placeholder="Ví dụ: AB12CD"
                value={inputRoomCode}
                onChange={(e) => setInputRoomCode(e.target.value.toUpperCase())}
                maxLength={8}
                className="flex-1 bg-stone-950 border border-stone-700 text-stone-100 placeholder-stone-600 text-xs rounded-lg px-3 py-2 font-mono uppercase outline-hidden focus:border-amber-500"
              />
              <button
                onClick={handleJoinByCode}
                className="py-2 px-4 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-lg text-xs transition cursor-pointer"
              >
                Vào phòng
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active Online Game Interface
  const opponent = myColor === 'w' ? activeSession.blackPlayer : activeSession.whitePlayer;
  const me = myColor === 'w' ? activeSession.whitePlayer : activeSession.blackPlayer;

  return (
    <div className="flex flex-col max-w-7xl mx-auto w-full gap-4">
      {/* Active Game Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-xs">
        <div className="flex items-center gap-2.5">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
            }`}
          />
          <span className="text-stone-300 font-mono">
            Phòng đấu:{' '}
            <strong className="text-amber-400 font-bold tracking-wider">
              {activeSession.roomId}
            </strong>{' '}
            • Chế độ:{' '}
            <span className="text-stone-200">{activeSession.timeControl}</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-stone-400 font-mono text-[11px] hidden sm:inline">
            {connectionType === 'ws' ? '⚡ WebSocket Live' : '🔄 HTTP Sync'}
            {pingMs > 0 && ` (${pingMs}ms)`}
          </span>
          <button
            onClick={() => {
              if (confirm('Bạn có chắc muốn rời khỏi phòng thi đấu?')) {
                setActiveSession(null);
                setGameOverResult(null);
              }
            }}
            className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs transition cursor-pointer font-medium"
          >
            Rời phòng
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 w-full items-start justify-center">
        {/* Chessboard & Clocks Column */}
        <div className="flex flex-col items-center gap-3 w-full lg:w-auto">
        {/* Opponent Clock Bar */}
        <div className="w-[min(90vw,560px)]">
          <ChessClock
            timeMs={myColor === 'w' ? blackTimeMs : whiteTimeMs}
            isActive={game.turn() !== myColor && !activeSession.winner}
            color={myColor === 'w' ? 'b' : 'w'}
            playerName={opponent?.username || 'Đối thủ'}
            rating={opponent?.rating}
          />
        </div>

        {/* The Board */}
        <ChessBoard
          game={game}
          orientation={myColor}
          onMove={handlePlayerMove}
          disabled={game.turn() !== myColor || Boolean(gameOverResult)}
          lastMove={lastMove}
        />

        {/* Player Clock Bar */}
        <div className="w-[min(90vw,560px)]">
          <ChessClock
            timeMs={myColor === 'w' ? whiteTimeMs : blackTimeMs}
            isActive={game.turn() === myColor && !activeSession.winner}
            color={myColor}
            playerName={me?.username || username}
            rating={me?.rating || userElo}
          />
        </div>

        {/* Draw offer notification banner */}
        {drawOfferedByOpponent && (
          <div className="w-[min(90vw,560px)] p-3 bg-amber-950/80 border border-amber-500/80 rounded-lg flex items-center justify-between text-xs">
            <span className="text-amber-200 font-medium">
              Đối thủ vừa gửi đề nghị hòa ván cờ!
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleAcceptDraw}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded cursor-pointer"
              >
                Đồng ý hòa
              </button>
              <button
                onClick={() => setDrawOfferedByOpponent(false)}
                className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded cursor-pointer"
              >
                Từ chối
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Side Panel: Action Controls, Moves, Chat */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        {/* Match Action Buttons */}
        <div className="bg-stone-900 border border-stone-800 rounded-lg p-3 grid grid-cols-2 gap-2">
          <button
            onClick={handleOfferDraw}
            disabled={Boolean(gameOverResult)}
            className="py-2 px-3 bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-300 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Handshake className="w-3.5 h-3.5" />
            Xin hòa
          </button>
          <button
            onClick={handleResign}
            disabled={Boolean(gameOverResult)}
            className="py-2 px-3 bg-red-950 hover:bg-red-900 text-red-300 disabled:opacity-40 border border-red-800/60 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Flag className="w-3.5 h-3.5" />
            Đầu hàng
          </button>
        </div>

        {/* Move History */}
        <div className="h-56">
          <MoveHistory game={game} />
        </div>

        {/* Real-time In-game Chat */}
        <div className="bg-stone-900 border border-stone-800 rounded-lg flex flex-col h-56 overflow-hidden">
          <div className="px-3 py-2 bg-stone-950/80 border-b border-stone-800 flex items-center gap-1.5 text-xs text-stone-400 font-semibold">
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
            Trò chuyện trực tiếp (Chat phòng)
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 text-xs">
            {chatMessages.length === 0 ? (
              <div className="text-stone-500 text-center py-4 italic text-[11px]">
                Gửi lời chào hoặc tin nhắn văn minh đến đối thủ...
              </div>
            ) : (
              chatMessages.map((msg, i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-[10px] text-stone-500 font-mono">
                    {msg.sender}:
                  </span>
                  <span className="text-stone-200 bg-stone-800/60 px-2 py-1 rounded inline-block">
                    {msg.text}
                  </span>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSendChat} className="p-2 border-t border-stone-800 bg-stone-950/60 flex items-center gap-1.5">
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 bg-stone-900 border border-stone-700 text-stone-100 text-xs px-2.5 py-1.5 rounded-lg outline-hidden focus:border-amber-500 h-[36px]"
            />
            <AnimatedSendButton
              type="submit"
              text="Gửi"
              sentText="Đã gửi"
              size="sm"
              disabled={!chatInput.trim()}
            />
          </form>
        </div>
      </div>
    </div>

      {/* Game Over Modal */}
      {gameOverResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-xl p-6 max-w-sm w-full text-center shadow-2xl">
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
              <Trophy className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-stone-100 mb-1">
              {gameOverResult.title}
            </h3>
            <p className="text-xs text-stone-400 mb-4 leading-relaxed">
              {gameOverResult.reason}
            </p>

            {gameOverResult.eloChanges && (
              <div className="bg-stone-950 border border-stone-800 rounded-lg p-3 mb-6 text-xs flex items-center justify-around font-mono">
                <div>
                  <span className="text-stone-400 block">Trắng:</span>
                  <span className={`font-bold ${gameOverResult.eloChanges.white >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {gameOverResult.eloChanges.white >= 0 ? `+${gameOverResult.eloChanges.white}` : gameOverResult.eloChanges.white} Elo
                  </span>
                </div>
                <div className="w-px h-6 bg-stone-800" />
                <div>
                  <span className="text-stone-400 block">Đen:</span>
                  <span className={`font-bold ${gameOverResult.eloChanges.black >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {gameOverResult.eloChanges.black >= 0 ? `+${gameOverResult.eloChanges.black}` : gameOverResult.eloChanges.black} Elo
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setActiveSession(null);
                  setGameOverResult(null);
                }}
                className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-lg text-xs transition cursor-pointer"
              >
                Rời phòng / Tìm trận mới
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
