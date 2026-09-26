import { LeaderboardPlayer } from '../types';
import { getAvatarUrlById } from './avatarPresets';

export const LEADERBOARD_CATEGORIES = [
  { id: 'blitz', label: 'Cờ Chớp (Blitz)', desc: 'Thể thức 3+0, 3+2 và 5+0' },
  { id: 'rapid', label: 'Cờ Nhanh (Rapid)', desc: 'Thể thức 10+0 và 15+10' },
  { id: 'bullet', label: 'Siêu Chớp (Bullet)', desc: 'Thể thức tốc độ cao 1+0 và 2+1' },
  { id: 'puzzles', label: 'Thế Cờ (Puzzles)', desc: 'Điểm giải bài tập chiến thuật' },
] as const;

export type LeaderboardCategoryKey = typeof LEADERBOARD_CATEGORIES[number]['id'];

export const BLITZ_LEADERBOARD: LeaderboardPlayer[] = [
  {
    rank: 1,
    id: 'admin_tienduc',
    username: 'tienduc_vippro',
    name: 'Tiến Đức VIP Pro',
    title: 'GM',
    rating: 2950,
    country: 'Việt Nam',
    flag: '🇻🇳',
    avatar: getAvatarUrlById('admin_tienduc'),
    winRate: 96.8,
    totalGames: 1842,
    streak: 28,
    isAdmin: true,
    badge: '👑 Quản Trị Viên Tối Cao & Nhà Vô Địch',
  },
  {
    rank: 2,
    id: 'magnus_c',
    username: 'MagnusC',
    name: 'Magnus Carlsen',
    title: 'GM',
    rating: 2888,
    country: 'Na Uy',
    flag: '🇳🇴',
    avatar: getAvatarUrlById('magnus_carlsen'),
    winRate: 84.5,
    totalGames: 4210,
    streak: 12,
    badge: '♔ Vua Cờ Thế Giới',
  },
  {
    rank: 3,
    id: 'hikaru_n',
    username: 'Hikaru',
    name: 'Hikaru Nakamura',
    title: 'GM',
    rating: 2875,
    country: 'Hoa Kỳ',
    flag: '🇺🇸',
    avatar: getAvatarUrlById('hikaru_nakamura'),
    winRate: 83.2,
    totalGames: 8900,
    streak: 9,
    badge: '⚡ Vua Cờ Chớp Blitz',
  },
  {
    rank: 4,
    id: 'le_quang_liem',
    username: 'LeQuangLiem_GM',
    name: 'Lê Quang Liêm',
    title: 'GM',
    rating: 2780,
    country: 'Việt Nam',
    flag: '🇻🇳',
    avatar: getAvatarUrlById('le_quang_liem'),
    winRate: 79.4,
    totalGames: 3120,
    streak: 7,
    badge: '⭐ Kỳ Thủ Số 1 Việt Nam',
  },
  {
    rank: 5,
    id: 'truong_son',
    username: 'TruongSon_GM',
    name: 'Nguyễn Ngọc Trường Sơn',
    title: 'GM',
    rating: 2690,
    country: 'Việt Nam',
    flag: '🇻🇳',
    avatar: getAvatarUrlById('truong_son'),
    winRate: 74.0,
    totalGames: 1980,
    streak: 5,
    badge: '♞ Đại Kiện Tướng Trầm Tĩnh',
  },
  {
    rank: 6,
    id: 'alireza_f',
    username: 'Firouzja2003',
    name: 'Alireza Firouzja',
    title: 'GM',
    rating: 2805,
    country: 'Pháp',
    flag: '🇫🇷',
    avatar: getAvatarUrlById('flame_master'),
    winRate: 78.1,
    totalGames: 2940,
    streak: 4,
  },
  {
    rank: 7,
    id: 'kim_phung',
    username: 'VoThiKimPhung_WGM',
    name: 'Võ Thị Kim Phụng',
    title: 'WGM',
    rating: 2420,
    country: 'Việt Nam',
    flag: '🇻🇳',
    avatar: getAvatarUrlById('kim_phung'),
    winRate: 69.2,
    totalGames: 1210,
    streak: 3,
    badge: '♕ Nữ Đại Kiện Tướng VN',
  },
  {
    rank: 8,
    id: 'anh_khoi',
    username: 'NguyenAnhKhoi_IM',
    name: 'Nguyễn Anh Khôi',
    title: 'IM',
    rating: 2580,
    country: 'Việt Nam',
    flag: '🇻🇳',
    avatar: getAvatarUrlById('cyber_knight'),
    winRate: 71.8,
    totalGames: 1450,
    streak: 6,
    badge: '🎯 Thần Đồng Cờ Vua',
  },
  {
    rank: 9,
    id: 'ding_l',
    username: 'DingLiren',
    name: 'Ding Liren',
    title: 'GM',
    rating: 2795,
    country: 'Trung Quốc',
    flag: '🇨🇳',
    avatar: getAvatarUrlById('cyber_queen'),
    winRate: 76.5,
    totalGames: 2150,
    streak: 2,
  },
  {
    rank: 10,
    id: 'user_player',
    username: 'Player_6812',
    name: 'Bạn (Người Chơi)',
    rating: 700,
    country: 'Việt Nam',
    flag: '🇻🇳',
    avatar: getAvatarUrlById('cyber_knight'),
    winRate: 0,
    totalGames: 0,
    streak: 0,
    isCurrentUser: true,
  },
];

export const getLeaderboardByCategory = (
  category: LeaderboardCategoryKey,
  userRating: number,
  userUsername: string,
  isCurrentUserAdmin: boolean = false
): LeaderboardPlayer[] => {
  // If the current user is Admin, remove the dummy user_player and make admin_tienduc the current user
  let base = [...BLITZ_LEADERBOARD];
  if (isCurrentUserAdmin) {
    base = base.filter((p) => p.id !== 'user_player');
  }

  // Adjust ratings based on category
  return base
    .map((player) => {
      if (player.id === 'admin_tienduc') {
        const defaultAdminRating =
          category === 'bullet' ? 2980 : category === 'rapid' ? 2920 : category === 'puzzles' ? 3100 : 2950;
        const finalRating = isCurrentUserAdmin && userRating ? userRating : defaultAdminRating;

        return {
          ...player,
          name: 'Tiến Đức VIP Pro',
          username: isCurrentUserAdmin && userUsername ? userUsername : player.username,
          rating: finalRating,
          isCurrentUser: isCurrentUserAdmin,
        };
      }

      if (player.isCurrentUser && !isCurrentUserAdmin) {
        return {
          ...player,
          username: userUsername || player.username,
          rating: userRating,
          avatar:
            player.avatar ||
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        };
      }

      // Slight variation for other categories
      const offset = category === 'bullet' ? 25 : category === 'rapid' ? -15 : category === 'puzzles' ? 180 : 0;
      return {
        ...player,
        rating: player.rating + offset,
      };
    })
    .sort((a, b) => b.rating - a.rating)
    .map((p, idx) => ({ ...p, rank: idx + 1 }));
};

