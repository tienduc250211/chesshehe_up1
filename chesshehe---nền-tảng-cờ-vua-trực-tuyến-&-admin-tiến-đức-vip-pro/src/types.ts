/**
 * Core Type Definitions for Chess Platform
 */

export type PieceColor = 'w' | 'b';
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
}

export type TimeControlKey = '1+0' | '3+0' | '3+2' | '5+0' | '10+0' | '15+10';

export interface TimeControlConfig {
  key: TimeControlKey;
  label: string;
  category: 'Bullet' | 'Blitz' | 'Rapid';
  baseMinutes: number;
  incrementSeconds: number;
  iconName: string;
}

export interface PlayerProfile {
  id: string;
  username: string;
  avatarUrl?: string;
  isAdmin?: boolean;
  isLoggedIn?: boolean;
  title?: string;
  bio?: string;
  country?: string;
  flag?: string;
  playStyle?: string;
  ratings: {
    bullet: number;
    blitz: number;
    rapid: number;
    puzzle: number;
  };
  stats: {
    wins: number;
    losses: number;
    draws: number;
    totalGames: number;
  };
}

export interface MoveRecord {
  from: string;
  to: string;
  san: string;
  piece: PieceType;
  color: PieceColor;
  captured?: PieceType;
  promotion?: PieceType;
  fenBefore: string;
  fenAfter: string;
  timeSpentMs?: number;
}

export interface OnlineGameSession {
  id: string;
  roomId: string;
  whitePlayer: {
    id: string;
    username: string;
    rating: number;
    connected: boolean;
  };
  blackPlayer?: {
    id: string;
    username: string;
    rating: number;
    connected: boolean;
  };
  timeControl: TimeControlKey;
  whiteTimeMs: number;
  blackTimeMs: number;
  turn: PieceColor;
  fen: string;
  moves: MoveRecord[];
  status: 'waiting' | 'in_progress' | 'checkmate' | 'stalemate' | 'draw' | 'resigned' | 'timeout';
  winner?: PieceColor | 'draw';
  endReason?: string;
  drawOfferedBy?: PieceColor;
  spectatorCount: number;
  createdAt: number;
}

export interface TacticalPuzzle {
  id: string;
  title: string;
  rating: number;
  theme: string[];
  fen: string;
  turnToMove: PieceColor;
  opponentInitialMove: { from: string; to: string; san: string };
  solutionMoves: { from: string; to: string; san: string }[];
  hint: string;
  explanation: string;
}

export interface ChessArticle {
  id: string;
  title: string;
  category: 'Chiến thuật' | 'Khai cuộc' | 'Giải đấu' | 'Phân tích ván đấu';
  author: string;
  publishDate: string;
  readTime: string;
  summary: string;
  content: string;
  coverImage: string;
  tags: string[];
}

export interface MatchHistoryItem {
  id: string;
  gameMode: 'online' | 'ai' | 'otb'; // online, ai, or over-the-board (2 players with clock)
  timestamp: number;
  timeControl: string;
  opponentName: string;
  opponentElo?: number;
  myColor: PieceColor;
  result: 'win' | 'loss' | 'draw';
  reason: string;
  eloChange?: number;
  movesCount: number;
  pgn?: string;
  finalFen?: string;
}

export type BoardThemeKey = 'green' | 'walnut' | 'slate' | 'amber' | 'midnight';

export interface BoardThemeConfig {
  id: BoardThemeKey;
  name: string;
  description: string;
  lightSquare: string; // CSS hex or tailwind class
  darkSquare: string;
  lastMoveLight: string;
  lastMoveDark: string;
  selectedColor: string;
  borderColor: string;
}

export type MoveQuality =
  | 'brilliant'
  | 'great'
  | 'best'
  | 'excellent'
  | 'good'
  | 'book'
  | 'inaccuracy'
  | 'mistake'
  | 'blunder';

export interface AnalyzedMove {
  moveNumber: number;
  san: string;
  from: string;
  to: string;
  color: PieceColor;
  evalBefore: number;
  evalAfter: number;
  quality: MoveQuality;
  bestAlternative?: string;
  commentary?: string;
  fen: string;
}

export interface GameAnalysisReport {
  id: string;
  whiteAccuracy: number; // e.g. 88.5%
  blackAccuracy: number; // e.g. 74.2%
  whitePlayer: string;
  blackPlayer: string;
  moves: AnalyzedMove[];
  evalGraph: number[];
  openingName?: string;
  openingEco?: string;
  summary: {
    white: Record<MoveQuality, number>;
    black: Record<MoveQuality, number>;
  };
}

export interface ChessOpening {
  eco: string;
  name: string;
  vietnameseName: string;
  moves: string[]; // e.g. ['e4', 'c5']
  fen: string;
  description: string;
  strategicThemes: string[];
  stats: {
    whiteWinRate: number; // %
    drawRate: number;     // %
    blackWinRate: number; // %
    totalMasterGames: number;
  };
  famousPlayers?: string[];
}

export interface LeaderboardPlayer {
  rank: number;
  id: string;
  username: string;
  name: string;
  title?: string;
  rating: number;
  country: string;
  flag: string;
  avatar: string;
  winRate: number;
  totalGames: number;
  streak: number;
  isCurrentUser?: boolean;
  isAdmin?: boolean;
  badge?: string;
}

export interface FriendItem {
  id: string;
  username: string;
  elo: number;
  title?: string;
  avatar?: string;
  status: 'online' | 'in_game' | 'offline';
  statusText?: string;
  lastActive?: string;
  isFavorite?: boolean;
}

export interface FriendRequest {
  id: string;
  fromUser: {
    id: string;
    username: string;
    elo: number;
    title?: string;
    avatar?: string;
  };
  timestamp: number;
  status: 'pending' | 'accepted' | 'declined';
}

// WebSocket Message Signatures
export type ClientWsMessage =
  | { type: 'join_pool'; timeControl: TimeControlKey; user: { id: string; username: string; rating: number } }
  | { type: 'leave_pool' }
  | { type: 'create_room'; timeControl: TimeControlKey; user: { id: string; username: string; rating: number }; preferredColor?: 'w' | 'b' | 'random' }
  | { type: 'join_room'; roomId: string; user: { id: string; username: string; rating: number } }
  | { type: 'make_move'; roomId: string; from: string; to: string; promotion?: string }
  | { type: 'resign'; roomId: string }
  | { type: 'offer_draw'; roomId: string }
  | { type: 'accept_draw'; roomId: string }
  | { type: 'chat_message'; roomId: string; text: string }
  | { type: 'rematch_request'; roomId: string };

export type ServerWsMessage =
  | { type: 'pool_waiting'; queueCount: number }
  | { type: 'room_created'; roomId: string; shareUrl: string; timeControl: TimeControlKey }
  | { type: 'game_start'; game: OnlineGameSession; yourColor: PieceColor }
  | { type: 'move_made'; move: MoveRecord; fen: string; whiteTimeMs: number; blackTimeMs: number; turn: PieceColor }
  | { type: 'clock_tick'; whiteTimeMs: number; blackTimeMs: number }
  | { type: 'draw_offered'; byColor: PieceColor }
  | { type: 'game_over'; winner?: PieceColor | 'draw'; reason: string; status: OnlineGameSession['status']; eloChanges?: { white: number; black: number } }
  | { type: 'chat_broadcast'; sender: string; text: string; timestamp: number }
  | { type: 'player_status'; color: PieceColor; connected: boolean }
  | { type: 'error'; message: string };
