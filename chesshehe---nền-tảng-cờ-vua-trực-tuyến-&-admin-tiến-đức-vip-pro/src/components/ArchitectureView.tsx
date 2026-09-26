import React, { useState } from 'react';
import {
  Layers,
  Database,
  GitFork,
  Cpu,
  Code,
  Copy,
  Check,
  Server,
  Monitor,
  Zap,
  ShieldCheck,
  Compass,
} from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'stack' | 'schema' | 'roadmap' | 'stockfish' | 'boilerplate'>('stack');

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const sqlSchemaCode = `-- PostgreSQL Database Schema for Online Chess Platform
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(32) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(512),
    rating_bullet INT NOT NULL DEFAULT 1500,
    rating_blitz INT NOT NULL DEFAULT 1500,
    rating_rapid INT NOT NULL DEFAULT 1500,
    rating_puzzle INT NOT NULL DEFAULT 1500,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code VARCHAR(16) UNIQUE,
    white_player_id UUID REFERENCES users(id) ON DELETE SET NULL,
    black_player_id UUID REFERENCES users(id) ON DELETE SET NULL,
    time_control_key VARCHAR(16) NOT NULL, -- e.g. '3+0', '5+3', '10+0'
    base_minutes INT NOT NULL,
    increment_seconds INT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'checkmate', 'resigned', 'timeout', 'draw'
    winner_color CHAR(1), -- 'w', 'b', or NULL for draw
    end_reason VARCHAR(64), -- 'checkmate', 'white_flag', 'black_flag', 'agreement', 'stalemate'
    pgn TEXT,
    final_fen VARCHAR(128),
    white_rating_before INT,
    white_rating_after INT,
    black_rating_before INT,
    black_rating_after INT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE game_moves (
    id BIGSERIAL PRIMARY KEY,
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    move_number INT NOT NULL,
    ply INT NOT NULL,
    color CHAR(1) NOT NULL,
    from_square CHAR(2) NOT NULL,
    to_square CHAR(2) NOT NULL,
    san VARCHAR(16) NOT NULL,
    uci VARCHAR(8) NOT NULL,
    fen_after VARCHAR(128) NOT NULL,
    time_spent_ms INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_rating_history (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_id UUID REFERENCES games(id) ON DELETE SET NULL,
    category VARCHAR(16) NOT NULL, -- 'bullet', 'blitz', 'rapid', 'puzzle'
    old_rating INT NOT NULL,
    new_rating INT NOT NULL,
    rating_delta INT NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE puzzles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(128) NOT NULL,
    fen VARCHAR(128) NOT NULL,
    solution_moves JSONB NOT NULL, -- Array of [{ from, to, san }]
    rating INT NOT NULL DEFAULT 1500,
    rating_deviation INT NOT NULL DEFAULT 350,
    themes TEXT[] DEFAULT '{}',
    hint TEXT,
    explanation TEXT
);

CREATE INDEX idx_games_players ON games (white_player_id, black_player_id);
CREATE INDEX idx_moves_game ON game_moves (game_id, ply);
CREATE INDEX idx_ratings_history_user ON user_rating_history (user_id, category);`;

  const backendBoilerplate = `// server/chessServer.ts - WebSocket & Game Room Coordinator
import http from 'http';
import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { Chess } from 'chess.js';

interface PlayerSession {
  ws: WebSocket;
  userId: string;
  username: string;
  rating: number;
}

interface Room {
  id: string;
  chess: Chess;
  white: PlayerSession | null;
  black: PlayerSession | null;
  whiteTimeMs: number;
  blackTimeMs: number;
  lastMoveTimestamp: number;
  timerInterval?: NodeJS.Timeout;
}

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

const rooms = new Map<string, Room>();

wss.on('connection', (ws: WebSocket) => {
  let currentRoomId: string | null = null;
  let playerColor: 'w' | 'b' | null = null;

  ws.on('message', (raw: string) => {
    const data = JSON.parse(raw);

    // 1. Tạo phòng mới
    if (data.type === 'create_room') {
      const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
      const room: Room = {
        id: roomId,
        chess: new Chess(),
        white: { ws, userId: data.user.id, username: data.user.username, rating: data.user.rating },
        black: null,
        whiteTimeMs: 180000, // 3 phút
        blackTimeMs: 180000,
        lastMoveTimestamp: Date.now()
      };
      rooms.set(roomId, room);
      currentRoomId = roomId;
      playerColor = 'w';

      ws.send(JSON.stringify({ type: 'room_created', roomId }));
    }

    // 2. Tham gia phòng
    if (data.type === 'join_room') {
      const room = rooms.get(data.roomId);
      if (!room || room.black) {
        ws.send(JSON.stringify({ type: 'error', message: 'Phòng không tồn tại hoặc đã đầy' }));
        return;
      }
      room.black = { ws, userId: data.user.id, username: data.user.username, rating: data.user.rating };
      currentRoomId = room.id;
      playerColor = 'b';

      // Thông báo bắt đầu trận đấu cho cả 2 bên
      const startPayload = {
        type: 'game_start',
        game: {
          roomId: room.id,
          fen: room.chess.fen(),
          whitePlayer: room.white,
          blackPlayer: room.black,
          whiteTimeMs: room.whiteTimeMs,
          blackTimeMs: room.blackTimeMs
        }
      };

      room.white?.ws.send(JSON.stringify({ ...startPayload, yourColor: 'w' }));
      room.black.ws.send(JSON.stringify({ ...startPayload, yourColor: 'b' }));
    }

    // 3. Thực hiện nước đi (Server là chân lý tối thượng - Authoritative)
    if (data.type === 'make_move') {
      const room = rooms.get(data.roomId);
      if (!room) return;

      if (room.chess.turn() !== playerColor) return;

      try {
        const move = room.chess.move({ from: data.from, to: data.to, promotion: data.promotion || 'q' });
        if (move) {
          const moveBroadcast = JSON.stringify({
            type: 'move_made',
            move,
            fen: room.chess.fen(),
            whiteTimeMs: room.whiteTimeMs,
            blackTimeMs: room.blackTimeMs,
            turn: room.chess.turn()
          });

          room.white?.ws.send(moveBroadcast);
          room.black?.ws.send(moveBroadcast);
        }
      } catch (err) {
        ws.send(JSON.stringify({ type: 'error', message: 'Nước đi không hợp lệ' }));
      }
    }
  });
});

server.listen(3000, () => console.log('Chess Server running on port 3000'));`;

  const clientBoilerplate = `// src/hooks/useChessSocket.ts - Client React Hook
import { useEffect, useRef, useState } from 'react';
import { Chess } from 'chess.js';

export function useChessSocket(roomId?: string) {
  const [game, setGame] = useState(() => new Chess());
  const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w');
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(\`\${location.protocol === 'https:' ? 'wss:' : 'ws:'}//\${location.host}/ws\`);
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'game_start') {
        setPlayerColor(msg.yourColor);
        setGame(new Chess(msg.game.fen));
      }
      if (msg.type === 'move_made') {
        setGame(new Chess(msg.fen));
      }
    };

    return () => ws.close();
  }, []);

  const makeMove = (from: string, to: string, promotion = 'q') => {
    if (game.turn() !== playerColor) return false;
    wsRef.current?.send(JSON.stringify({
      type: 'make_move',
      roomId,
      from,
      to,
      promotion
    }));
    return true;
  };

  return { game, playerColor, isConnected, makeMove };
}`;

  return (
    <div className="max-w-6xl mx-auto w-full p-4 flex flex-col gap-6">
      {/* Top Banner */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" />
            Bản Thiết Kế Kiến Trúc Hệ Thống (Architecture Blueprint)
          </div>
          <h2 className="text-xl font-bold text-stone-100">
            Thiết Kế Nền Tảng Cờ Vua Trực Tuyến Toàn Diện
          </h2>
          <p className="text-xs text-stone-400 mt-1 max-w-2xl">
            Tài liệu chi tiết theo tiêu chuẩn FIDE & Lichess: Tech Stack, Database Schema, Roadmap từ số 0, tích hợp Stockfish Engine và Boilerplate code.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-xs font-mono font-semibold">
            V1.0 - Full Specification
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('stack')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'stack'
              ? 'bg-amber-500 text-stone-950 shadow-sm'
              : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          1. Đề xuất Tech Stack
        </button>

        <button
          onClick={() => setActiveTab('schema')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'schema'
              ? 'bg-amber-500 text-stone-950 shadow-sm'
              : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          2. Database Schema
        </button>

        <button
          onClick={() => setActiveTab('roadmap')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'roadmap'
              ? 'bg-amber-500 text-stone-950 shadow-sm'
              : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          <GitFork className="w-3.5 h-3.5" />
          3. Lộ trình phát triển (Roadmap)
        </button>

        <button
          onClick={() => setActiveTab('stockfish')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'stockfish'
              ? 'bg-amber-500 text-stone-950 shadow-sm'
              : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          4. Tích hợp Stockfish & Chess.js
        </button>

        <button
          onClick={() => setActiveTab('boilerplate')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'boilerplate'
              ? 'bg-amber-500 text-stone-950 shadow-sm'
              : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          5. Code mẫu Boilerplate
        </button>
      </div>

      {/* Tab 1: Tech Stack */}
      {activeTab === 'stack' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Frontend */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-stone-200 font-bold text-sm">
              <Monitor className="w-4 h-4 text-amber-400" />
              Frontend: React 19 + TypeScript + Tailwind CSS
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              <strong>Lý do lựa chọn:</strong> React 19 kết hợp TypeScript mang lại tính an toàn kiểu dữ liệu tuyệt đối cho các cấu trúc FEN, PGN, Square coordinates (a1-h8) và trạng thái đồng hồ. Tailwind CSS giúp xây dựng giao diện tối giản (minimalist) siêu nhẹ như Lichess mà không bị phình to bundle size.
            </p>
            <div className="mt-2 text-xs space-y-1.5 text-stone-300">
              <div>• <strong>Bàn cờ UI:</strong> Custom Vector SVG Board hoặc <code>react-chessboard</code> với độ nhạy kéo thả cao.</div>
              <div>• <strong>Chess Logic:</strong> <code>chess.js (v1.x)</code> kiểm tra tính hợp lệ của mọi nước đi, phát hiện chiếu/chiếu bí/hòa.</div>
              <div>• <strong>Hiệu ứng:</strong> <code>motion/react</code> tạo chuyển động mượt mà khi di chuyển quân cờ.</div>
            </div>
          </div>

          {/* Backend */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-stone-200 font-bold text-sm">
              <Server className="w-4 h-4 text-amber-400" />
              Backend: Node.js (Express / Fastify) + Native ws WebSockets
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              <strong>Lý do lựa chọn:</strong> Cờ vua đòi hỏi độ trễ cực thấp (Sub-millisecond latency), đặc biệt với thể thức Bullet (1 phút) và Blitz. Thư viện <code>ws</code> nhẹ hơn Socket.io nhiều lần, không có overhead polling dự phòng và tương thích hoàn hảo với chuẩn WebSocket gốc của trình duyệt.
            </p>
            <div className="mt-2 text-xs space-y-1.5 text-stone-300">
              <div>• <strong>Server Authoritative:</strong> Server duy trì instance <code>Chess()</code> độc lập, kiểm duyệt mọi nước cờ trước khi broadcast.</div>
              <div>• <strong>Clock Sync:</strong> Server đếm giờ độc lập theo mốc thời gian thực để chống gian lận chỉnh sửa giờ từ client.</div>
            </div>
          </div>

          {/* Database */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-stone-200 font-bold text-sm">
              <Database className="w-4 h-4 text-amber-400" />
              Database: PostgreSQL + Prisma ORM
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              <strong>Lý do lựa chọn:</strong> Dữ liệu cờ vua mang tính quan hệ cao (Users, Games, Moves, Elo History). PostgreSQL đảm bảo tính toàn vẹn dữ liệu (ACID) khi cập nhật Elo đồng thời của cả 2 kỳ thủ sau trận đấu.
            </p>
            <div className="mt-2 text-xs space-y-1.5 text-stone-300">
              <div>• <strong>JSONB Storage:</strong> Lưu trữ cây biến thể và nước đi linh hoạt trong JSONB nếu cần.</div>
              <div>• <strong>Indexing:</strong> Index hóa Player ID và Elo để truy vấn bảng xếp hạng Leaderboard tức thời.</div>
            </div>
          </div>

          {/* Real-time Cache & Engine */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-stone-200 font-bold text-sm">
              <Zap className="w-4 h-4 text-amber-400" />
              Cache & Scaling: Redis + Stockfish Wasm
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              <strong>Lý do lựa chọn:</strong>
            </p>
            <div className="mt-1 text-xs space-y-1.5 text-stone-300">
              <div>• <strong>Redis:</strong> Quản lý hàng đợi ghép trận (Matchmaking Queue) theo khoảng cách Elo và Redis Pub/Sub khi scale đa cụm server.</div>
              <div>• <strong>Stockfish WebAssembly (Wasm):</strong> Chạy trực tiếp engine Stockfish trong Web Worker của trình duyệt, giải phóng 100% chi phí CPU server cho các tính năng luyện tập AI và phân tích.</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Database Schema */}
      {activeTab === 'schema' && (
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-100">
                Cấu Trúc Bảng PostgreSQL Hoàn Chỉnh (Users, Games, Moves, Elo, Puzzles)
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Thiết kế chuẩn hóa 3NF, hỗ trợ lưu trữ PGN, chỉ số Elo 4 phân hệ và bảng lịch sử biến động rating.
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(sqlSchemaCode, 'schema')}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded text-xs font-mono flex items-center gap-1.5 transition cursor-pointer"
            >
              {copiedSection === 'schema' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedSection === 'schema' ? 'Đã sao chép' : 'Sao chép SQL'}
            </button>
          </div>

          <pre className="bg-stone-950 text-stone-300 text-xs font-mono p-4 rounded-lg overflow-x-auto border border-stone-800/80 leading-relaxed">
            {sqlSchemaCode}
          </pre>
        </div>
      )}

      {/* Tab 3: Roadmap */}
      {activeTab === 'roadmap' && (
        <div className="space-y-4">
          {[
            {
              phase: 'Giai đoạn 1: Core Engine & Bàn Cờ Cơ Bản (Tuần 1 - 2)',
              goals: 'Xây dựng bàn cờ tương tác và bộ luật cờ vua chuẩn FIDE.',
              tasks: [
                'Thiết lập bàn cờ 8x8 với tọa độ a-h, 1-8, hỗ trợ đảo góc nhìn Trắng/Đen.',
                'Tích hợp thư viện chess.js để sinh nước đi hợp lệ, kiểm tra chiếu, chiếu bí, hòa cờ.',
                'Hỗ trợ đầy đủ phong cấp tốt (Promotion Modal), bắt tốt qua đường (En Passant) và nhập thành.',
                'Hiển thị danh sách nước đi theo ký hiệu đại số chuẩn (SAN) và thống kê ăn quân.'
              ]
            },
            {
              phase: 'Giai đoạn 2: Real-time WebSockets & Hệ Thống Đồng Hồ (Tuần 3 - 4)',
              goals: 'Triển khai chơi đối kháng 2 người qua mạng thời gian thực.',
              tasks: [
                'Dựng WebSocket Server với Express + ws, hỗ trợ các sự kiện tạo phòng và kết nối phòng qua mã Code.',
                'Cơ chế Server-Authoritative: Mọi nước cờ được xác thực trên server trước khi gửi lại cho 2 bên.',
                'Hệ thống đồng hồ kép (Dual Chess Clock) với độ trễ & bù giờ Increment (vd: 3+2, 5+0).',
                'Xử lý tình huống ngắt kết nối (Reconnection), tự động xử thua khi hết giờ hoặc rời phòng quá lâu.'
              ]
            },
            {
              phase: 'Giai đoạn 3: AI Engine, Bài Tập Thế Cờ & Ghép Trận Ngẫu Nhiên (Tuần 5 - 6)',
              goals: 'Mở rộng tính năng luyện tập offline, giải bài tập và Matchmaking tự động.',
              tasks: [
                'Tích hợp thuật toán Minimax + Alpha-Beta Pruning hoặc Stockfish Wasm đa cấp độ.',
                'Hệ thống Tactical Puzzles với kiểm tra từng bước, gợi ý chiến thuật và chấm điểm rating puzzle.',
                'Xây dựng thuật toán Matchmaking ghép cặp tự động dựa trên khoảng cách Elo (Delta <= 100).',
                'Hệ thống phân hệ Tin tức / Blog cập nhật bài viết chuyên môn cờ vua.'
              ]
            },
            {
              phase: 'Giai đoạn 4: Database, Hệ Thống Elo & Production Scale (Tuần 7 - 8)',
              goals: 'Hoàn thiện xác thực người dùng, lưu trữ ván đấu lâu dài và tối ưu hạ tầng.',
              tasks: [
                'Triển khai cơ sở dữ liệu PostgreSQL + Prisma ORM, lưu toàn bộ lịch sử ván đấu (PGN/FEN).',
                'Áp dụng thuật toán tính Elo chuẩn FIDE / Glicko-2 sau mỗi trận đấu.',
                'Tích hợp Redis Pub/Sub để mở rộng cụm WebSocket server đa node.',
                'Triển khai Docker container và CI/CD tự động lên hạ tầng Cloud Run / Kubernetes.'
              ]
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-stone-900 border border-stone-800 rounded-xl p-5 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-mono text-xs font-bold flex items-center justify-center">
                  0{idx + 1}
                </span>
                <h4 className="text-sm font-bold text-stone-100">{item.phase}</h4>
              </div>
              <p className="text-xs text-stone-400 font-medium pl-8">{item.goals}</p>
              <ul className="list-disc list-inside text-xs text-stone-300 pl-8 space-y-1 mt-1">
                {item.tasks.map((task, tIdx) => (
                  <li key={tIdx}>{task}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Stockfish Integration Guide */}
      {activeTab === 'stockfish' && (
        <div className="space-y-6">
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 flex flex-col gap-3">
            <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-400" />
              Cách Tích Hợp Stockfish Engine Chuẩn Quốc Tế
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              Stockfish là engine mã nguồn mở mạnh nhất thế giới hiện nay. Trong ứng dụng web, có 2 phương pháp tích hợp chính:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="bg-stone-950 border border-stone-800 p-4 rounded-lg flex flex-col gap-2">
                <span className="text-xs font-bold text-amber-400 uppercase">
                  Phương Pháp 1: WebAssembly (Wasm) Web Worker (Được khuyên dùng nhất)
                </span>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Chạy Stockfish trực tiếp trong trình duyệt người dùng thông qua bản biên dịch <code>stockfish.js / stockfish.wasm</code>.
                </p>
                <div className="text-xs text-stone-300 space-y-1">
                  <div>• <strong>Không tốn chi phí Server:</strong> Tiết kiệm hàng ngàn USD tiền CPU máy chủ.</div>
                  <div>• <strong>Chạy trong Web Worker:</strong> Tuyệt đối không làm đơ giao diện (non-blocking main UI thread).</div>
                  <div>• <strong>Ứng dụng:</strong> Chơi offline với máy, thanh đánh giá thế cờ (Evaluation Bar).</div>
                </div>
              </div>

              <div className="bg-stone-950 border border-stone-800 p-4 rounded-lg flex flex-col gap-2">
                <span className="text-xs font-bold text-stone-300 uppercase">
                  Phương Pháp 2: Server-side UCI Worker Cluster
                </span>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Chạy binary Stockfish gốc trên máy chủ Linux và giao tiếp qua stdin/stdout.
                </p>
                <div className="text-xs text-stone-300 space-y-1">
                  <div>• <strong>Kiểm soát tài nguyên:</strong> Cố định RAM và số luồng CPU.</div>
                  <div>• <strong>Phát hiện gian lận (Anti-cheat):</strong> So sánh nước đi người chơi với nước đi máy tính với độ chính xác cao.</div>
                  <div>• <strong>Ứng dụng:</strong> Báo cáo phân tích ván đấu (Game Review) sau trận.</div>
                </div>
              </div>
            </div>

            <div className="mt-3">
              <h4 className="text-xs font-bold text-stone-200 uppercase mb-2">
                Quy Trình Giao Tiếp Qua Giao Thức UCI (Universal Chess Interface):
              </h4>
              <div className="bg-stone-950 p-3 rounded-lg border border-stone-800/80 font-mono text-xs text-stone-300 space-y-1.5">
                <div><span className="text-amber-400">Client -&gt; Engine:</span> <code>uci</code> (Khởi tạo động cơ)</div>
                <div><span className="text-emerald-400">Engine -&gt; Client:</span> <code>uciok</code></div>
                <div><span className="text-amber-400">Client -&gt; Engine:</span> <code>isready</code></div>
                <div><span className="text-emerald-400">Engine -&gt; Client:</span> <code>readyok</code></div>
                <div><span className="text-amber-400">Client -&gt; Engine:</span> <code>position fen r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3</code></div>
                <div><span className="text-amber-400">Client -&gt; Engine:</span> <code>go depth 15 movetime 1000</code></div>
                <div><span className="text-emerald-400">Engine -&gt; Client:</span> <code>info depth 15 score cp 45 pv d2d4 e5d4 f3d4</code></div>
                <div><span className="text-emerald-400">Engine -&gt; Client:</span> <code>bestmove d2d4</code></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Boilerplate Code */}
      {activeTab === 'boilerplate' && (
        <div className="space-y-6">
          {/* Backend Boilerplate */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                  <Server className="w-4 h-4 text-amber-400" />
                  Mã Nguồn Backend: Thiết Lập WebSocket Server & Điều Phối Phòng Đấu
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Xử lý kết nối WebSocket thời gian thực, quản lý phòng và xác thực nước đi bằng <code>chess.js</code>.
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(backendBoilerplate, 'backend')}
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded text-xs font-mono flex items-center gap-1.5 transition cursor-pointer"
              >
                {copiedSection === 'backend' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSection === 'backend' ? 'Đã sao chép' : 'Sao chép'}
              </button>
            </div>

            <pre className="bg-stone-950 text-stone-300 text-xs font-mono p-4 rounded-lg overflow-x-auto border border-stone-800/80 leading-relaxed">
              {backendBoilerplate}
            </pre>
          </div>

          {/* Frontend Hook Boilerplate */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-amber-400" />
                  Mã Nguồn Frontend: React Hook Kết Nối WebSocket & Đồng Bộ Nước Đi
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Custom hook <code>useChessSocket</code> xử lý kết nối 2 chiều và cập nhật bàn cờ tức thì.
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(clientBoilerplate, 'client')}
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded text-xs font-mono flex items-center gap-1.5 transition cursor-pointer"
              >
                {copiedSection === 'client' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSection === 'client' ? 'Đã sao chép' : 'Sao chép'}
              </button>
            </div>

            <pre className="bg-stone-950 text-stone-300 text-xs font-mono p-4 rounded-lg overflow-x-auto border border-stone-800/80 leading-relaxed">
              {clientBoilerplate}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
