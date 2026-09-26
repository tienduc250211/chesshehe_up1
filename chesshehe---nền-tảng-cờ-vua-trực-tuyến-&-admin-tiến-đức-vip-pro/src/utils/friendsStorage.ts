import { FriendItem, FriendRequest } from '../types';
import { getAvatarUrlById } from './avatarPresets';

const FRIENDS_KEY = 'chesshehe_friends';
const LEGACY_FRIENDS_KEY = 'openchess_friends';
const REQUESTS_KEY = 'chesshehe_friend_requests';
const LEGACY_REQUESTS_KEY = 'openchess_friend_requests';

export const ADMIN_FRIEND: FriendItem = {
  id: 'admin_tienduc',
  username: 'Tiến Đức VIP Pro (GM)',
  elo: 2950,
  title: 'GM',
  avatar: getAvatarUrlById('admin_tienduc'),
  status: 'online',
  statusText: 'Đang trực tuyến • Quản trị viên Tối Cao',
  lastActive: 'Vừa xong',
  isFavorite: true,
};

const INITIAL_FRIENDS: FriendItem[] = [
  ADMIN_FRIEND,
  {
    id: 'friend_01',
    username: 'Grandmaster_Le',
    elo: 2780,
    title: 'GM',
    avatar: getAvatarUrlById('le_quang_liem'),
    status: 'online',
    statusText: 'Sẵn sàng thi đấu Blitz 3+2',
    lastActive: '5 phút trước',
    isFavorite: true,
  },
  {
    id: 'friend_02',
    username: 'ChessWizard_VN',
    elo: 2690,
    title: 'GM',
    avatar: getAvatarUrlById('truong_son'),
    status: 'in_game',
    statusText: 'Đang thi đấu phòng #ROOM-928',
    lastActive: 'Đang chơi',
  },
  {
    id: 'friend_03',
    username: 'Magnus_Online',
    elo: 2888,
    title: 'GM',
    avatar: getAvatarUrlById('magnus_carlsen'),
    status: 'offline',
    statusText: 'Ngoại tuyến',
    lastActive: '2 giờ trước',
  },
];

const INITIAL_REQUESTS: FriendRequest[] = [
  {
    id: 'req_01',
    fromUser: {
      id: 'usr_vnking',
      username: 'Hikaru_Stream',
      elo: 2875,
      title: 'GM',
      avatar: getAvatarUrlById('hikaru_nakamura'),
    },
    timestamp: Date.now() - 1000 * 60 * 45,
    status: 'pending',
  },
  {
    id: 'req_02',
    fromUser: {
      id: 'usr_blitzq1',
      username: 'KimPhung_WGM',
      elo: 2420,
      title: 'WGM',
      avatar: getAvatarUrlById('kim_phung'),
    },
    timestamp: Date.now() - 1000 * 60 * 180,
    status: 'pending',
  },
];

export const loadFriends = (): FriendItem[] => {
  try {
    const raw = localStorage.getItem(FRIENDS_KEY) || localStorage.getItem(LEGACY_FRIENDS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load friends:', err);
  }
  return INITIAL_FRIENDS;
};

export const saveFriends = (friends: FriendItem[]): void => {
  try {
    localStorage.setItem(FRIENDS_KEY, JSON.stringify(friends));
  } catch (err) {
    console.error('Failed to save friends:', err);
  }
};

export const loadFriendRequests = (): FriendRequest[] => {
  try {
    const raw = localStorage.getItem(REQUESTS_KEY) || localStorage.getItem(LEGACY_REQUESTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load friend requests:', err);
  }
  return INITIAL_REQUESTS;
};

export const saveFriendRequests = (requests: FriendRequest[]): void => {
  try {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  } catch (err) {
    console.error('Failed to save friend requests:', err);
  }
};
