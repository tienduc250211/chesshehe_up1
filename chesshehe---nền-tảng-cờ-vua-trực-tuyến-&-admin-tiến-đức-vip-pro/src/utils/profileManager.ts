import { PlayerProfile } from '../types';
import { getAvatarUrlById } from './avatarPresets';

export const ADMIN_BASE_PROFILE: PlayerProfile = {
  id: 'admin_tienduc',
  username: 'Tiến Đức VIP Pro',
  isAdmin: true,
  title: 'GM 2950 • Quản Trị Viên Tối Cao',
  avatarUrl: getAvatarUrlById('admin_tienduc'),
  bio: 'Kỳ thủ số 1 Việt Nam • Sáng lập & Quản trị viên Tối cao OpenChess • Elo GM 2950',
  country: 'Việt Nam',
  flag: '🇻🇳',
  playStyle: 'Tấn công bão táp & Bẫy chiến thuật',
  ratings: {
    bullet: 2980,
    blitz: 2950,
    rapid: 2920,
    puzzle: 3120,
  },
  stats: {
    wins: 1842,
    losses: 48,
    draws: 12,
    totalGames: 1902,
  },
};

export const DEFAULT_GUEST_PROFILE: PlayerProfile = {
  id: 'usr_guest',
  username: 'Kỳ thủ Việt',
  isAdmin: false,
  title: 'Tân Thủ (Elo 700)',
  avatarUrl: getAvatarUrlById('cyber_knight'),
  bio: 'Tân thủ bước vào thế giới cờ vua đỉnh cao OpenChess. Mục tiêu: Chinh phục Đại Kiện Tướng!',
  country: 'Việt Nam',
  flag: '🇻🇳',
  playStyle: 'Cân bằng & Linh hoạt',
  ratings: {
    bullet: 700,
    blitz: 700,
    rapid: 700,
    puzzle: 700,
  },
  stats: {
    wins: 0,
    losses: 0,
    draws: 0,
    totalGames: 0,
  },
};

/**
 * Ensures that any profile loaded from storage or created dynamically
 * has non-null, valid numeric properties and cannot crash the UI.
 * Standardizes default initial Elo to 700 for non-admin players.
 */
export function sanitizeProfile(raw: any): PlayerProfile {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_GUEST_PROFILE, id: `usr_${Math.random().toString(36).substring(2, 7)}` };
  }

  const isAdmin =
    Boolean(raw.isAdmin) ||
    raw.id === 'admin_tienduc' ||
    (typeof raw.username === 'string' &&
      (raw.username.toLowerCase().includes('tiến đức') ||
        raw.username.toLowerCase().includes('tien duc')));

  if (isAdmin) {
    return {
      id: 'admin_tienduc',
      username: typeof raw.username === 'string' && raw.username.trim() !== '' ? raw.username : ADMIN_BASE_PROFILE.username,
      isAdmin: true,
      isLoggedIn: raw.isLoggedIn !== undefined ? Boolean(raw.isLoggedIn) : true,
      title: raw.title || ADMIN_BASE_PROFILE.title,
      avatarUrl: raw.avatarUrl || ADMIN_BASE_PROFILE.avatarUrl,
      bio: raw.bio || ADMIN_BASE_PROFILE.bio,
      country: raw.country || ADMIN_BASE_PROFILE.country,
      flag: raw.flag || ADMIN_BASE_PROFILE.flag,
      playStyle: raw.playStyle || ADMIN_BASE_PROFILE.playStyle,
      ratings: {
        bullet: Number(raw.ratings?.bullet) || ADMIN_BASE_PROFILE.ratings.bullet,
        blitz: Number(raw.ratings?.blitz) || ADMIN_BASE_PROFILE.ratings.blitz,
        rapid: Number(raw.ratings?.rapid) || ADMIN_BASE_PROFILE.ratings.rapid,
        puzzle: Number(raw.ratings?.puzzle) || ADMIN_BASE_PROFILE.ratings.puzzle,
      },
      stats: {
        wins: Number(raw.stats?.wins) || ADMIN_BASE_PROFILE.stats.wins,
        losses: Number(raw.stats?.losses) || ADMIN_BASE_PROFILE.stats.losses,
        draws: Number(raw.stats?.draws) || ADMIN_BASE_PROFILE.stats.draws,
        totalGames: Number(raw.stats?.totalGames) || ADMIN_BASE_PROFILE.stats.totalGames,
      },
    };
  }

  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : `usr_${Math.random().toString(36).substring(2, 7)}`,
    username: typeof raw.username === 'string' && raw.username.trim() !== '' ? raw.username : 'Kỳ thủ Việt',
    isAdmin: false,
    isLoggedIn: raw.isLoggedIn !== undefined ? Boolean(raw.isLoggedIn) : false,
    title: raw.title || DEFAULT_GUEST_PROFILE.title,
    avatarUrl: raw.avatarUrl || DEFAULT_GUEST_PROFILE.avatarUrl,
    bio: raw.bio || DEFAULT_GUEST_PROFILE.bio,
    country: raw.country || DEFAULT_GUEST_PROFILE.country,
    flag: raw.flag || DEFAULT_GUEST_PROFILE.flag,
    playStyle: raw.playStyle || DEFAULT_GUEST_PROFILE.playStyle,
    ratings: {
      bullet: Number(raw.ratings?.bullet) || 700,
      blitz: Number(raw.ratings?.blitz) || 700,
      rapid: Number(raw.ratings?.rapid) || 700,
      puzzle: Number(raw.ratings?.puzzle) || 700,
    },
    stats: {
      wins: Number(raw.stats?.wins) ?? 0,
      losses: Number(raw.stats?.losses) ?? 0,
      draws: Number(raw.stats?.draws) ?? 0,
      totalGames: Number(raw.stats?.totalGames) ?? 0,
    },
  };
}
