import { BoardThemeConfig, BoardThemeKey } from '../types';

export const BOARD_THEMES: Record<BoardThemeKey, BoardThemeConfig> = {
  green: {
    id: 'green',
    name: 'Tournament Green',
    description: 'Xanh lá đấu giải FIDE quốc tế tiêu chuẩn Lichess & Chess.com',
    lightSquare: '#eeeed2',
    darkSquare: '#769656',
    lastMoveLight: '#f5f682',
    lastMoveDark: '#b9ca43',
    selectedColor: '#f7eb75',
    borderColor: '#465a34',
  },
  walnut: {
    id: 'walnut',
    name: 'Classic Walnut Wood',
    description: 'Gỗ Óc Chó cổ điển quý tộc, đường vân gỗ ấm cúng tự nhiên',
    lightSquare: '#f0d9b5',
    darkSquare: '#b58863',
    lastMoveLight: '#cddc81',
    lastMoveDark: '#abbf56',
    selectedColor: '#fae372',
    borderColor: '#734e30',
  },
  slate: {
    id: 'slate',
    name: 'Slate Marble',
    description: 'Đá Cẩm Thạch xám hiện đại, dịu mắt và tập trung cao độ',
    lightSquare: '#dee3e6',
    darkSquare: '#8ca2ad',
    lastMoveLight: '#c6def1',
    lastMoveDark: '#6f92a9',
    selectedColor: '#f7eb75',
    borderColor: '#4d5d67',
  },
  amber: {
    id: 'amber',
    name: 'Royal Amber Gold',
    description: 'Hoàng Gia Tiến Đức VIP Pro - Tông vàng hổ phách quý phái',
    lightSquare: '#fef3c7',
    darkSquare: '#d97706',
    lastMoveLight: '#fde68a',
    lastMoveDark: '#b45309',
    selectedColor: '#f59e0b',
    borderColor: '#92400e',
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Cyberpunk',
    description: 'Bóng đêm công nghệ huyền ảo với tương phản cao và viền sắc nét',
    lightSquare: '#334155',
    darkSquare: '#0f172a',
    lastMoveLight: '#475569',
    lastMoveDark: '#1e293b',
    selectedColor: '#38bdf8',
    borderColor: '#020617',
  },
};

const THEME_STORAGE_KEY = 'chesshehe_active_board_theme';
const LEGACY_THEME_STORAGE_KEY = 'openchess_active_board_theme';

export const getSavedBoardTheme = (): BoardThemeKey => {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) || localStorage.getItem(LEGACY_THEME_STORAGE_KEY);
    if (saved && saved in BOARD_THEMES) {
      return saved as BoardThemeKey;
    }
  } catch {
    // fallback
  }
  return 'green';
};

export const saveBoardTheme = (key: BoardThemeKey): void => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, key);
  } catch (err) {
    console.error('Failed to save theme:', err);
  }
};
