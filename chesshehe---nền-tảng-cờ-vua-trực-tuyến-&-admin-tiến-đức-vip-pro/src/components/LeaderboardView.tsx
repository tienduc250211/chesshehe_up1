import React, { useState, useMemo } from 'react';
import { PlayerProfile } from '../types';
import {
  LEADERBOARD_CATEGORIES,
  LeaderboardCategoryKey,
  getLeaderboardByCategory,
} from '../utils/leaderboardData';
import {
  Trophy,
  Crown,
  Medal,
  Flame,
  Swords,
  Search,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  User,
  Zap,
} from 'lucide-react';

interface LeaderboardViewProps {
  currentUserProfile: PlayerProfile;
  onChallengePlayer: (playerName: string, playerElo: number, isAdmin?: boolean) => void;
  onOpenAdminProfile?: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  currentUserProfile,
  onChallengePlayer,
  onOpenAdminProfile,
}) => {
  const [activeCategory, setActiveCategory] = useState<LeaderboardCategoryKey>('blitz');
  const [searchQuery, setSearchQuery] = useState('');

  // Get current user rating according to category safely
  const currentUserRating = useMemo(() => {
    const ratings = currentUserProfile.ratings || {
      bullet: 1500,
      blitz: 1520,
      rapid: 1550,
      puzzle: 1480,
    };
    switch (activeCategory) {
      case 'bullet':
        return ratings.bullet ?? 1500;
      case 'rapid':
        return ratings.rapid ?? 1550;
      case 'puzzles':
        return ratings.puzzle ?? 1480;
      default:
        return ratings.blitz ?? 1520;
    }
  }, [currentUserProfile, activeCategory]);

  const isUserAdmin = Boolean(
    currentUserProfile.isAdmin ||
      currentUserProfile.id === 'admin_tienduc' ||
      currentUserProfile.username?.toLowerCase().includes('tiến đức')
  );

  const rawList = useMemo(() => {
    return getLeaderboardByCategory(
      activeCategory,
      currentUserRating,
      currentUserProfile.username || 'Kỳ thủ',
      isUserAdmin
    );
  }, [activeCategory, currentUserRating, currentUserProfile.username, isUserAdmin]);


  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return rawList;
    const q = searchQuery.toLowerCase();
    return rawList.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.username.toLowerCase().includes(q) ||
        p.country.toLowerCase().includes(q) ||
        p.title?.toLowerCase().includes(q)
    );
  }, [rawList, searchQuery]);

  const topThree = rawList.slice(0, 3);
  const currentUserEntry = rawList.find((p) => p.isCurrentUser);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-stone-800 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-100 flex items-center gap-2">
              Bảng Xếp Hạng Cao Thủ Toàn Cầu
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold">
                Xếp Hạng FIDE & chesshehe
              </span>
            </h1>
            <p className="text-xs text-stone-400 mt-0.5">
              Vinh danh các Kiện tướng, Đại kiện tướng và kỳ thủ xuất sắc nhất hệ thống
            </p>
          </div>
        </div>

        {/* Category switcher */}
        <div className="flex items-center gap-1.5 bg-stone-900 p-1 rounded-xl border border-stone-800 text-xs">
          {LEADERBOARD_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-amber-500 text-stone-950 font-bold shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Rank 2 (Left) */}
        {topThree[1] && (
          <div className="order-2 md:order-1 p-5 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col items-center text-center relative overflow-hidden shadow-lg hover-cool-card hover-sheen transition-all duration-300">
            <div className="absolute top-3 left-3 text-xs font-bold text-stone-400 flex items-center gap-1">
              <Medal className="w-4 h-4 text-stone-300" /> #2
            </div>
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-stone-400 mb-3 shadow flex items-center justify-center bg-stone-800 ring-2 ring-stone-400/20">
              {topThree[1].avatar && topThree[1].avatar.trim() !== '' ? (
                <img
                  src={topThree[1].avatar}
                  alt={topThree[1].name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="w-8 h-8 text-stone-400" />
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.2 rounded bg-stone-800 text-stone-300 text-[10px] font-bold">
                {topThree[1].title}
              </span>
              <h3 className="text-sm font-bold text-stone-100">{topThree[1].name}</h3>
              <span>{topThree[1].flag}</span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">@{topThree[1].username}</p>
            <div className="mt-3 flex items-center gap-3 text-xs font-mono">
              <span className="text-amber-400 font-bold text-base">{topThree[1].rating}</span>
              <span className="text-stone-500">|</span>
              <span className="text-stone-300">{topThree[1].winRate}% Thắng</span>
            </div>
            <button
              onClick={() => onChallengePlayer(topThree[1].name, topThree[1].rating)}
              className="mt-3 w-full py-1.5 bg-stone-800 hover:bg-stone-700 hover:scale-[1.02] text-stone-200 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center justify-center gap-1 border border-stone-700 shadow-sm"
            >
              <Swords className="w-3 h-3 text-amber-400" /> Thách Đấu
            </button>
          </div>
        )}

        {/* Rank 1: Admin Tiến Đức VIP Pro (Center - Highlighted) */}
        {topThree[0] && (
          <div className="order-1 md:order-2 p-6 rounded-2xl bg-gradient-to-b from-amber-500/20 via-stone-900 to-stone-950 border-2 border-amber-500/60 flex flex-col items-center text-center relative overflow-hidden shadow-2xl ring-2 ring-amber-500/20 hover-cool-card hover-sheen transition-all duration-300">
            {/* Crown */}
            <div className="absolute top-2 right-2 text-amber-400 animate-bounce">
              <Crown className="w-6 h-6 fill-amber-400 drop-shadow" />
            </div>
            <div className="absolute top-3 left-3 text-xs font-bold text-amber-400 flex items-center gap-1">
              <Trophy className="w-4 h-4 fill-amber-400" /> #1 VÔ ĐỊCH
            </div>

            <div className="relative mb-3 mt-1">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-amber-400 shadow-xl ring-4 ring-amber-500/30 flex items-center justify-center bg-stone-800">
                {topThree[0].avatar && topThree[0].avatar.trim() !== '' ? (
                  <img
                    src={topThree[0].avatar}
                    alt={topThree[0].name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User className="w-10 h-10 text-amber-400" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 p-1 bg-amber-500 text-stone-950 rounded-full shadow font-bold">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-500 to-yellow-600 text-stone-950 text-[10px] font-extrabold uppercase shadow">
                {topThree[0].title} VIP
              </span>
              <h3 className="text-base font-extrabold text-stone-100">{topThree[0].name}</h3>
              <span>{topThree[0].flag}</span>
            </div>

            <p className="text-xs text-amber-400/90 font-medium mt-0.5">
              {topThree[0].badge}
            </p>

            <div className="mt-3 flex items-center gap-3 text-xs font-mono bg-stone-950/80 px-3 py-1.5 rounded-xl border border-amber-500/30">
              <span className="text-amber-400 font-extrabold text-lg">{topThree[0].rating}</span>
              <span className="text-stone-500">|</span>
              <span className="text-emerald-400 font-bold">{topThree[0].winRate}% Thắng</span>
              <span className="text-stone-500">|</span>
              <span className="text-red-400 font-bold flex items-center gap-0.5">
                <Flame className="w-3 h-3 fill-red-500" /> {topThree[0].streak}W
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full mt-4">
              {isUserAdmin ? (
                <div className="py-2 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 shadow-sm col-span-1">
                  <Crown className="w-3.5 h-3.5 text-amber-400" /> Vị trí của bạn
                </div>
              ) : (
                <button
                  onClick={() => onChallengePlayer(topThree[0].name, topThree[0].rating, true)}
                  className="py-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 hover:scale-[1.02] text-stone-950 text-xs font-extrabold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Swords className="w-3.5 h-3.5" /> Thách Đấu
                </button>
              )}
              {onOpenAdminProfile && (
                <button
                  onClick={onOpenAdminProfile}
                  className="py-2 bg-stone-800 hover:bg-stone-700 hover:scale-[1.02] text-stone-200 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-1 border border-stone-700"
                >
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  {isUserAdmin ? 'Hồ Sơ Của Bạn' : 'Xem Profile'}
                </button>
              )}
            </div>

          </div>
        )}

        {/* Rank 3 (Right) */}
        {topThree[2] && (
          <div className="order-3 p-5 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col items-center text-center relative overflow-hidden shadow-lg hover-cool-card hover-sheen transition-all duration-300">
            <div className="absolute top-3 left-3 text-xs font-bold text-amber-700 flex items-center gap-1">
              <Medal className="w-4 h-4 text-amber-600" /> #3
            </div>
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-700 mb-3 shadow flex items-center justify-center bg-stone-800">
              {topThree[2].avatar && topThree[2].avatar.trim() !== '' ? (
                <img
                  src={topThree[2].avatar}
                  alt={topThree[2].name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="w-8 h-8 text-stone-400" />
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.2 rounded bg-stone-800 text-stone-300 text-[10px] font-bold">
                {topThree[2].title}
              </span>
              <h3 className="text-sm font-bold text-stone-100">{topThree[2].name}</h3>
              <span>{topThree[2].flag}</span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">@{topThree[2].username}</p>
            <div className="mt-3 flex items-center gap-3 text-xs font-mono">
              <span className="text-amber-400 font-bold text-base">{topThree[2].rating}</span>
              <span className="text-stone-500">|</span>
              <span className="text-stone-300">{topThree[2].winRate}% Thắng</span>
            </div>
            <button
              onClick={() => onChallengePlayer(topThree[2].name, topThree[2].rating)}
              className="mt-3 w-full py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center justify-center gap-1 border border-stone-700"
            >
              <Swords className="w-3 h-3 text-amber-400" /> Thách Đấu
            </button>
          </div>
        )}
      </div>

      {/* Current User Standing Card */}
      {currentUserEntry && (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-stone-900 to-stone-950 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold font-mono">
              #{currentUserEntry.rank}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-100">
                  Thứ hạng của bạn: {currentUserProfile.username}
                </span>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {activeCategory.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Điểm Elo hiện tại: <strong className="text-amber-400 font-mono">{currentUserRating}</strong> •
                Cần thêm{' '}
                <strong className="text-stone-200 font-mono">
                  {Math.max(10, 2400 - currentUserRating)}
                </strong>{' '}
                điểm để vào nhóm Kiện Tướng Quốc Gia
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 font-semibold">+24 tuần này</span>
          </div>
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-stone-200">Bảng Xếp Hạng Đầy Đủ</h2>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên, quốc gia, danh hiệu..."
              className="w-full pl-9 pr-3 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-xs text-stone-200 placeholder:text-stone-500 focus:outline-hidden focus:border-amber-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-950 text-stone-400 border-b border-stone-800 font-mono">
              <tr>
                <th className="py-3 px-4 w-16 text-center">Hạng</th>
                <th className="py-3 px-4">Kỳ Thủ</th>
                <th className="py-3 px-4 text-center">Điểm Elo</th>
                <th className="py-3 px-4 text-center">Tỉ Lệ Thắng</th>
                <th className="py-3 px-4 text-center">Số Ván Đã Đấu</th>
                <th className="py-3 px-4 text-right">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {filteredList.map((player) => (
                <tr
                  key={player.id}
                  className={`hover:bg-stone-800/80 hover:shadow-[0_0_15px_rgba(245,158,11,0.08)] transition-all duration-200 group cursor-pointer ${
                    player.isCurrentUser ? 'bg-amber-500/10' : ''
                  }`}
                >
                  <td className="py-3 px-4 text-center font-mono font-bold">
                    {player.rank === 1 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-extrabold shadow">
                        1
                      </span>
                    ) : player.rank === 2 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-stone-300 text-stone-950 font-bold">
                        2
                      </span>
                    ) : player.rank === 3 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700 text-stone-100 font-bold">
                        3
                      </span>
                    ) : (
                      <span className="text-stone-400">#{player.rank}</span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {player.avatar && player.avatar.trim() !== '' ? (
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-stone-700 flex-shrink-0">
                          <img
                            src={player.avatar}
                            alt={player.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-400 flex-shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          {player.title && (
                            <span
                              className={`px-1 py-0.2 rounded text-[10px] font-bold ${
                                player.isAdmin
                                  ? 'bg-amber-500 text-stone-950'
                                  : 'bg-stone-800 text-stone-300'
                              }`}
                            >
                              {player.title}
                            </span>
                          )}
                          <span className="font-bold text-stone-100">{player.name}</span>
                          <span className="text-xs">{player.flag}</span>
                          {player.isCurrentUser && (
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded font-black ${
                                player.isAdmin
                                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 shadow-xs'
                                  : 'bg-amber-500/20 text-amber-400 font-semibold'
                              }`}
                            >
                              {player.isAdmin ? 'BẠN (ADMIN VIP PRO)' : 'Bạn'}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-400 font-mono">@{player.username}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-center font-mono font-bold text-amber-400 text-sm">
                    {player.rating}
                  </td>

                  <td className="py-3 px-4 text-center font-mono text-stone-300">
                    <span className="text-emerald-400 font-semibold">{player.winRate}%</span>
                  </td>

                  <td className="py-3 px-4 text-center font-mono text-stone-400">
                    {player.totalGames.toLocaleString()} ván
                  </td>

                  <td className="py-3 px-4 text-right">
                    {!player.isCurrentUser ? (
                      <button
                        onClick={() => onChallengePlayer(player.name, player.rating, player.isAdmin)}
                        className={`px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer inline-flex items-center gap-1 ${
                          player.isAdmin
                            ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold'
                            : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700'
                        }`}
                      >
                        <Swords className="w-3 h-3 text-amber-400" /> Thách Đấu
                      </button>
                    ) : (
                      <span className="text-[11px] text-amber-400 font-bold italic">
                        {player.isAdmin ? '👑 Vị trí của bạn (Top 1)' : 'Vị trí của bạn'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* User Rank Summary Card */}
        {currentUserEntry && (
          <div className="mt-4 p-3 bg-stone-900/90 border border-amber-500/40 rounded-xl flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-sm">
                #{currentUserEntry.rank}
              </div>
              <div>
                <p className="font-bold text-stone-100 flex items-center gap-1.5">
                  <span>Thứ hạng của bạn:</span>
                  <span className="text-amber-400">{currentUserEntry.name}</span>
                  {currentUserEntry.isAdmin && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500 text-stone-950 font-black">
                      ADMIN TỐI CAO
                    </span>
                  )}
                </p>
                <p className="text-stone-400 text-[11px]">
                  {currentUserEntry.rank === 1
                    ? 'Bạn đang giữ vị trí Vô Địch số 1 toàn cầu!'
                    : `Hệ số Elo hiện tại: ${currentUserEntry.rating} • Tỷ lệ thắng: ${currentUserEntry.winRate}%`}
                </p>
              </div>
            </div>
            <div className="font-mono text-amber-400 font-extrabold text-sm">
              {currentUserEntry.rating} Elo
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

