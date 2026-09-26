import React, { useState, useEffect } from 'react';
import { FriendItem, FriendRequest, TimeControlKey, PlayerProfile } from '../types';
import {
  loadFriends,
  saveFriends,
  loadFriendRequests,
  saveFriendRequests,
  ADMIN_FRIEND,
} from '../utils/friendsStorage';
import {
  Users,
  UserPlus,
  Crown,
  Swords,
  MessageCircle,
  Clock,
  Search,
  Check,
  X,
  Trash2,
  Sparkles,
  Send,
  Flame,
  Zap,
} from 'lucide-react';
import { AnimatedSendButton } from './AnimatedSendButton';

interface FriendsViewProps {
  onChallengeFriend: (friend: FriendItem, timeControl: TimeControlKey) => void;
  onOpenAdminProfile: () => void;
  currentUserProfile?: PlayerProfile;
}

export const FriendsView: React.FC<FriendsViewProps> = ({
  onChallengeFriend,
  onOpenAdminProfile,
  currentUserProfile,
}) => {
  const [friends, setFriends] = useState<FriendItem[]>(() => loadFriends());
  const [requests, setRequests] = useState<FriendRequest[]>(() => loadFriendRequests());
  const [activeTab, setActiveTab] = useState<'list' | 'requests' | 'add'>('list');

  const isUserAdmin = Boolean(
    currentUserProfile?.isAdmin ||
      currentUserProfile?.id === 'admin_tienduc' ||
      currentUserProfile?.username?.toLowerCase().includes('tiến đức')
  );


  // Search & Add state
  const [searchQuery, setSearchQuery] = useState('');
  const [addUsernameInput, setAddUsernameInput] = useState('');
  const [requestSentSuccess, setRequestSentSuccess] = useState<string | null>(null);

  // Challenge modal state
  const [challengingFriend, setChallengingFriend] = useState<FriendItem | null>(null);
  const [selectedTimeControl, setSelectedTimeControl] = useState<TimeControlKey>('3+2');

  // Quick Chat modal state
  const [chatFriend, setChatFriend] = useState<FriendItem | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ sender: string; text: string; time: string }[]>([
    { sender: 'them', text: 'Chào bạn! Hôm nay làm ván 3+2 Blitz giao lưu nhé?', time: '10:15' },
    { sender: 'me', text: 'Sẵn sàng luôn bạn ơi, thách đấu mình nhé!', time: '10:16' },
  ]);

  // Suggested players to add
  const SUGGESTIONS: FriendItem[] = [
    {
      id: 'sug_01',
      username: 'MagnusVN_99',
      elo: 1850,
      title: 'FM',
      status: 'online',
      statusText: 'Đang online • Thích chơi Sicilian',
    },
    {
      id: 'sug_02',
      username: 'ThienThanCoChop',
      elo: 1610,
      status: 'online',
      statusText: 'Chuyên đánh Bullet 1+0',
    },
    {
      id: 'sug_03',
      username: 'Master_Nguyen',
      elo: 1920,
      title: 'IM',
      status: 'offline',
      statusText: 'Ngoại tuyến 1 giờ trước',
    },
  ];

  // Sync with storage
  useEffect(() => {
    saveFriends(friends);
  }, [friends]);

  useEffect(() => {
    saveFriendRequests(requests);
  }, [requests]);

  const handleAcceptRequest = (req: FriendRequest) => {
    const newFriend: FriendItem = {
      id: req.fromUser.id,
      username: req.fromUser.username,
      elo: req.fromUser.elo,
      title: req.fromUser.title,
      status: 'online',
      statusText: 'Vừa trở thành bạn bè',
      lastActive: 'Vừa xong',
    };
    setFriends((prev) => [newFriend, ...prev]);
    setRequests((prev) => prev.filter((r) => r.id !== req.id));
  };

  const handleDeclineRequest = (reqId: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== reqId));
  };

  const handleRemoveFriend = (friendId: string) => {
    if (friendId === ADMIN_FRIEND.id) {
      alert('Không thể xóa Quản Trị Viên Tối Cao Tiến Đức VIP Pro khỏi danh bạ!');
      return;
    }
    if (confirm('Bạn có chắc chắn muốn hủy kết bạn với kỳ thủ này?')) {
      setFriends((prev) => prev.filter((f) => f.id !== friendId));
    }
  };

  const handleSendFriendRequest = (username: string) => {
    if (!username.trim()) return;
    setRequestSentSuccess(`Đã gửi lời mời kết bạn thành công đến "${username}"!`);
    setAddUsernameInput('');
    setTimeout(() => setRequestSentSuccess(null), 3500);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !chatFriend) return;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const userMsg = { sender: 'me', text: chatInput.trim(), time: timeStr };
    setChatHistory((prev) => [...prev, userMsg]);
    setChatInput('');

    // Simulate immediate friendly reply from opponent
    setTimeout(() => {
      const replies = [
        'Ván vừa rồi hay quá! Nước Mã của bạn rất hiểm.',
        'Ok bạn ơi! Bấm nút Thách đấu để vào phòng ngay nhé!',
        'Mình đang sẵn sàng đây, chọn thể thức 3+2 đi bạn!',
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      setChatHistory((prev) => [
        ...prev,
        { sender: 'them', text: randomReply, time: timeStr },
      ]);
    }, 1000);
  };

  const filteredFriends = friends
    .filter((f) => {
      // If current user is Admin Tiến Đức, do not show admin as friend of himself
      if (isUserAdmin && f.id === ADMIN_FRIEND.id) {
        return false;
      }
      return true;
    })
    .filter((f) => f.username.toLowerCase().includes(searchQuery.toLowerCase()));


  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-10">
      {/* Header & Tabs */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xs">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-stone-100 flex items-center gap-2">
                Bạn Bè & Thách Đấu Kỳ Thủ
              </h1>
              <p className="text-xs text-stone-400">
                Kết nối với bạn bè cờ vua, gửi lời thách đấu trực tiếp với bộ đếm đồng hồ chuẩn FIDE.
              </p>
            </div>
          </div>

          {/* Tab buttons */}
          <div className="flex items-center gap-1.5 bg-stone-950/70 p-1.5 rounded-xl border border-stone-800">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Bạn bè ({friends.length})
            </button>

            <button
              onClick={() => setActiveTab('requests')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer relative ${
                activeTab === 'requests'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Lời mời
              {requests.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {requests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('add')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'add'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              Thêm bạn
            </button>
          </div>
        </div>

        {/* Search bar inside friends tab */}
        {activeTab === 'list' && (
          <div className="relative">
            <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bạn bè theo tên..."
              className="w-full bg-stone-950 border border-stone-800 text-stone-200 text-xs rounded-xl pl-9 pr-4 py-2 focus:ring-1 focus:ring-amber-500 outline-hidden"
            />
          </div>
        )}
      </div>

      {/* TAB 1: FRIENDS LIST */}
      {activeTab === 'list' && (
        <div className="flex flex-col gap-3">
          {filteredFriends.map((friend) => {
            const isAdmin = friend.id === ADMIN_FRIEND.id;
            return (
              <div
                key={friend.id}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-200 shadow-md hover-cool-card ${
                  isAdmin
                    ? 'bg-gradient-to-r from-amber-500/15 via-stone-900 to-stone-900 border-amber-500/50 shadow-amber-500/5'
                    : 'bg-stone-900/90 border-stone-800 hover:border-amber-500/40'
                }`}
              >
                {/* Left: Friend Info */}
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold font-mono text-base shrink-0 border relative overflow-visible ${
                      isAdmin
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-lg shadow-amber-500/20'
                        : 'bg-stone-800 text-stone-200 border-stone-700'
                    }`}
                  >
                    {friend.avatar ? (
                      <img
                        src={friend.avatar}
                        alt={friend.username}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : isAdmin ? (
                      <Crown className="w-6 h-6 text-amber-400 animate-pulse" />
                    ) : (
                      friend.username.substring(0, 2).toUpperCase()
                    )}
                    {/* Online status indicator badge */}
                    <span
                      className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-stone-900 ${
                        friend.status === 'online'
                          ? 'bg-emerald-500'
                          : friend.status === 'in_game'
                          ? 'bg-amber-500 animate-pulse'
                          : 'bg-stone-600'
                      }`}
                    />
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-stone-100 text-sm">
                        {friend.username}
                      </span>
                      {friend.title && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                            isAdmin
                              ? 'bg-amber-500 text-stone-950'
                              : 'bg-stone-800 text-amber-400 border border-stone-700'
                          }`}
                        >
                          {friend.title}
                        </span>
                      )}
                      <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-stone-950 text-amber-400 border border-stone-800">
                        {friend.elo} Elo
                      </span>
                    </div>

                    <div className="text-xs text-stone-400 mt-1 flex items-center gap-2">
                      <span
                        className={
                          friend.status === 'online'
                            ? 'text-emerald-400 font-semibold'
                            : friend.status === 'in_game'
                            ? 'text-amber-400 font-semibold'
                            : 'text-stone-500'
                        }
                      >
                        {friend.statusText || (friend.status === 'online' ? 'Đang trực tuyến' : 'Ngoại tuyến')}
                      </span>
                      {friend.lastActive && (
                        <>
                          <span>•</span>
                          <span className="text-stone-500">{friend.lastActive}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Quick Action Buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-800">
                  {isAdmin ? (
                    <button
                      onClick={onOpenAdminProfile}
                      className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                      Xem Hồ Sơ GM
                    </button>
                  ) : null}

                  {/* Challenge Button */}
                  <button
                    onClick={() => setChallengingFriend(friend)}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <Swords className="w-3.5 h-3.5" />
                    Thách Đấu
                  </button>

                  {/* Chat Button */}
                  <button
                    onClick={() => setChatFriend(friend)}
                    className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs transition cursor-pointer border border-stone-700"
                    title="Nhắn tin giao lưu"
                  >
                    <MessageCircle className="w-4 h-4 text-stone-300" />
                  </button>

                  {/* Remove Button */}
                  {!isAdmin && (
                    <button
                      onClick={() => handleRemoveFriend(friend.id)}
                      className="p-2 bg-stone-800 hover:bg-red-950/50 hover:text-red-400 text-stone-500 rounded-lg text-xs transition cursor-pointer border border-stone-700"
                      title="Hủy kết bạn"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: FRIEND REQUESTS */}
      {activeTab === 'requests' && (
        <div className="flex flex-col gap-3">
          {requests.length === 0 ? (
            <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center text-stone-500">
                <UserPlus className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-300">
                Không có lời mời kết bạn nào đang chờ
              </h3>
              <p className="text-xs text-stone-500 max-w-sm">
                Khi có người chơi khác gửi lời mời kết bạn, thông báo sẽ hiển thị tại đây để bạn duyệt.
              </p>
            </div>
          ) : (
            requests.map((req) => (
              <div
                key={req.id}
                className="bg-stone-900/90 border border-stone-800 p-4 rounded-xl flex items-center justify-between gap-4 shadow-md"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-center font-bold text-stone-200">
                    {req.fromUser.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-100 text-sm">
                        {req.fromUser.username}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-950 text-amber-400 border border-stone-800">
                        {req.fromUser.elo} Elo
                      </span>
                    </div>
                    <div className="text-xs text-stone-400 mt-0.5">
                      Đã gửi cho bạn lời mời kết bạn thi đấu cờ vua
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAcceptRequest(req)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Chấp nhận
                  </button>
                  <button
                    onClick={() => handleDeclineRequest(req.id)}
                    className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-400 rounded-lg text-xs transition cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    Từ chối
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: ADD NEW FRIEND & SUGGESTIONS */}
      {activeTab === 'add' && (
        <div className="flex flex-col gap-6">
          {/* Add input form */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 shadow-lg flex flex-col gap-3">
            <h3 className="text-sm font-bold text-stone-200 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-amber-400" />
              Gửi lời mời kết bạn mới
            </h3>
            <p className="text-xs text-stone-400">
              Nhập tên người dùng (Username) hoặc ID kỳ thủ để gửi lời mời kết bạn:
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={addUsernameInput}
                onChange={(e) => setAddUsernameInput(e.target.value)}
                placeholder="Nhập tên kỳ thủ..."
                className="flex-1 bg-stone-950 border border-stone-700 text-stone-200 text-xs rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-amber-500 outline-hidden"
              />
              <button
                onClick={() => handleSendFriendRequest(addUsernameInput)}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Gửi lời mời
              </button>
            </div>

            {requestSentSuccess && (
              <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" />
                {requestSentSuccess}
              </div>
            )}
          </div>

          {/* Suggestions List */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 shadow-lg flex flex-col gap-3">
            <h3 className="text-sm font-bold text-stone-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Gợi ý kết bạn từ cộng đồng chesshehe
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {SUGGESTIONS.map((sug) => (
                <div
                  key={sug.id}
                  className="bg-stone-950/70 border border-stone-800 p-4 rounded-xl flex flex-col justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-center font-bold text-stone-200">
                      {sug.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-stone-200 text-xs flex items-center gap-1.5">
                        <span>{sug.username}</span>
                        {sug.title && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-stone-800 text-amber-400 font-mono font-bold">
                            {sug.title}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-amber-400 font-mono font-semibold">
                        {sug.elo} Elo
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-stone-400">
                    {sug.statusText}
                  </p>

                  <button
                    onClick={() => handleSendFriendRequest(sug.username)}
                    className="w-full py-1.5 bg-stone-800 hover:bg-stone-700 border border-stone-700 hover:border-amber-500/50 text-stone-300 hover:text-stone-100 font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                    Kết bạn
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CHALLENGE MODAL (Direct Challenge With Integrated Clock) */}
      {challengingFriend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl p-6 max-w-md w-full flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Swords className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-stone-100 text-base">
                  Thách Đấu: {challengingFriend.username}
                </h3>
              </div>
              <button
                onClick={() => setChallengingFriend(null)}
                className="text-stone-400 hover:text-stone-200 text-sm font-mono px-2 py-1 bg-stone-800 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-400">
              Chọn thể thức đồng hồ thi đấu FIDE để bước vào trận đấu trực tiếp với kỳ thủ này:
            </p>

            {/* Time Control Options */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: '1+0', label: '1 phút (Bullet)', desc: 'Chớp nhoáng' },
                { key: '3+0', label: '3 phút (Blitz)', desc: 'Tiêu chuẩn chớp' },
                { key: '3+2', label: '3+2s (Blitz FIDE)', desc: 'Bù giờ +2s mỗi nước' },
                { key: '5+0', label: '5 phút (Blitz)', desc: 'Cân bằng chiến thuật' },
                { key: '10+0', label: '10 phút (Rapid)', desc: 'Suy nghĩ sâu' },
                { key: '15+10', label: '15+10s (Classical)', desc: 'Chuẩn giải đấu' },
              ].map((tc) => (
                <button
                  key={tc.key}
                  onClick={() => setSelectedTimeControl(tc.key as TimeControlKey)}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition cursor-pointer ${
                    selectedTimeControl === tc.key
                      ? 'bg-amber-500/20 border-amber-500 text-stone-100 ring-1 ring-amber-500/30'
                      : 'bg-stone-950/70 border-stone-800 hover:border-stone-700 text-stone-400'
                  }`}
                >
                  <span className="text-xs font-bold text-stone-200 font-mono flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    {tc.label}
                  </span>
                  <span className="text-[10px] text-stone-500">{tc.desc}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  const friend = challengingFriend;
                  setChallengingFriend(null);
                  onChallengeFriend(friend, selectedTimeControl);
                }}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Swords className="w-4 h-4" />
                Vào Trận Đấu Ngay ({selectedTimeControl})
              </button>
              <button
                onClick={() => setChallengingFriend(null)}
                className="py-2.5 px-4 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs transition cursor-pointer"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK CHAT MODAL */}
      {chatFriend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl p-5 max-w-md w-full flex flex-col gap-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center font-bold text-xs text-amber-400">
                  {chatFriend.username.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-stone-100 text-sm">
                    {chatFriend.username}
                  </h3>
                  <span className="text-[10px] text-emerald-400">Đang trực tuyến</span>
                </div>
              </div>
              <button
                onClick={() => setChatFriend(null)}
                className="text-stone-400 hover:text-stone-200 text-xs font-mono px-2 py-1 bg-stone-800 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Message log */}
            <div className="h-64 overflow-y-auto bg-stone-950/70 p-3 rounded-xl border border-stone-800 flex flex-col gap-2.5 text-xs">
              {chatHistory.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col max-w-[80%] ${
                    m.sender === 'me' ? 'self-end items-end' : 'self-start items-start'
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-xl text-xs leading-relaxed ${
                      m.sender === 'me'
                        ? 'bg-amber-500 text-stone-950 font-medium rounded-br-none'
                        : 'bg-stone-800 text-stone-200 rounded-bl-none border border-stone-700'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[9px] text-stone-500 font-mono mt-0.5">{m.time}</span>
                </div>
              ))}
            </div>

            {/* Chat Input form */}
            <form onSubmit={handleSendChatMessage} className="flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Nhập tin nhắn giao lưu..."
                className="flex-1 bg-stone-950 border border-stone-700 text-stone-200 text-xs rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-amber-500 outline-hidden h-[42px]"
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
      )}
    </div>
  );
};
