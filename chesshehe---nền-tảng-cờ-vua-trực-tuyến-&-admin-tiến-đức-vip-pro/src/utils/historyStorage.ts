import { MatchHistoryItem } from '../types';

const STORAGE_KEY = 'chesshehe_match_history';
const LEGACY_STORAGE_KEY = 'openchess_match_history';

// Default initial match history so the user sees a rich, realistic log immediately
const INITIAL_HISTORY: MatchHistoryItem[] = [
  {
    id: 'match-01',
    gameMode: 'ai',
    timestamp: Date.now() - 1000 * 60 * 35, // 35 minutes ago
    timeControl: '3+2 Blitz',
    opponentName: 'Tiến Đức VIP Pro (GM)',
    opponentElo: 2950,
    myColor: 'w',
    result: 'loss',
    reason: 'Chiếu hết (Checkmate) tại nước 34',
    eloChange: -8,
    movesCount: 34,
    finalFen: 'r1b2rk1/pp3ppp/8/3p4/8/2N2Q2/PPP2PPP/R3R1K1 b - - 0 18',
  },
  {
    id: 'match-02',
    gameMode: 'online',
    timestamp: Date.now() - 1000 * 60 * 120, // 2 hours ago
    timeControl: '3+0 Blitz',
    opponentName: 'Grandmaster_Le',
    opponentElo: 1620,
    myColor: 'b',
    result: 'win',
    reason: 'Đối thủ hết thời gian (Timeout)',
    eloChange: +14,
    movesCount: 42,
    finalFen: '4k3/8/4K3/8/8/8/8/8 w - - 0 42',
  },
  {
    id: 'match-03',
    gameMode: 'otb',
    timestamp: Date.now() - 1000 * 60 * 360, // 6 hours ago
    timeControl: '5+0 Blitz',
    opponentName: 'Bạn cùng bàn (Bên Đen)',
    opponentElo: 1500,
    myColor: 'w',
    result: 'win',
    reason: 'Chiếu hết bằng Hậu & Xe',
    eloChange: 0,
    movesCount: 28,
  },
  {
    id: 'match-04',
    gameMode: 'ai',
    timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    timeControl: '10+0 Rapid',
    opponentName: 'Stockfish Cấp 3',
    opponentElo: 1600,
    myColor: 'w',
    result: 'draw',
    reason: 'Hòa do lặp lại thế cờ 3 lần',
    eloChange: +2,
    movesCount: 51,
  },
];

export const loadMatchHistory = (): MatchHistoryItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load match history:', err);
  }
  return INITIAL_HISTORY;
};

export const saveMatchHistory = (history: MatchHistoryItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (err) {
    console.error('Failed to save match history:', err);
  }
};

export const recordMatch = (item: Omit<MatchHistoryItem, 'id' | 'timestamp'>): MatchHistoryItem => {
  const current = loadMatchHistory();
  const newItem: MatchHistoryItem = {
    ...item,
    id: `match_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now(),
  };
  const updated = [newItem, ...current];
  saveMatchHistory(updated);
  return newItem;
};
