import React, { useState } from 'react';
import { PlayerProfile } from '../types';
import {
  Crown,
  Trophy,
  Zap,
  Flame,
  Clock,
  Puzzle,
  Swords,
  ShieldCheck,
  Award,
  Sparkles,
  MessageSquare,
  Send,
  ExternalLink,
  CheckCircle2,
  TrendingUp,
  Settings,
  UserCheck,
} from 'lucide-react';
import { RoyalKnightLogo } from './RoyalKnightLogo';
import { AnimatedSendButton } from './AnimatedSendButton';

interface AdminProfileViewProps {
  onChallengeAdmin: () => void;
  currentUserProfile?: PlayerProfile;
  onOpenEditProfile?: () => void;
}

export const AdminProfileView: React.FC<AdminProfileViewProps> = ({
  onChallengeAdmin,
  currentUserProfile,
  onOpenEditProfile,
}) => {
  const isCurrentAdmin = Boolean(
    currentUserProfile?.isAdmin ||
      currentUserProfile?.id === 'admin_tienduc' ||
      currentUserProfile?.username?.toLowerCase().includes('tiến đức')
  );

  const bulletElo = isCurrentAdmin && currentUserProfile?.ratings?.bullet ? currentUserProfile.ratings.bullet : 2980;
  const blitzElo = isCurrentAdmin && currentUserProfile?.ratings?.blitz ? currentUserProfile.ratings.blitz : 2950;
  const rapidElo = isCurrentAdmin && currentUserProfile?.ratings?.rapid ? currentUserProfile.ratings.rapid : 2920;
  const puzzleElo = isCurrentAdmin && currentUserProfile?.ratings?.puzzle ? currentUserProfile.ratings.puzzle : 3120;

  const totalGames = isCurrentAdmin && currentUserProfile?.stats?.totalGames ? currentUserProfile.stats.totalGames : 1902;
  const wins = isCurrentAdmin && currentUserProfile?.stats?.wins ? currentUserProfile.stats.wins : 1842;
  const calculatedWinRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : '96.8';

  const [messages, setMessages] = useState([
    { id: 1, sender: 'Magnus C.', text: 'Tiến Đức đánh cờ chớp quá kinh khủng! Đẳng cấp VIP Pro!', time: '10 phút trước', badge: 'GM' },
    { id: 2, sender: 'Hikaru N.', text: 'Bullet 1 phút của Tiến Đức VIP Pro di chuyển chuột nhanh như chớp!', time: '1 giờ trước', badge: 'Super GM' },
    { id: 3, sender: 'Kỳ Thủ Hà Nội', text: 'Cảm ơn Admin Tiến Đức đã tạo ra nền tảng cờ vua siêu mượt mà cho anh em.', time: 'Hôm nay', badge: 'Pro Player' },
  ]);


  const [newMessage, setNewMessage] = useState('');
  const [senderName, setSenderName] = useState('');
  const [justSent, setJustSent] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const added = {
      id: Date.now(),
      sender: senderName.trim() || 'Kỳ Thủ Ẩn Danh',
      text: newMessage.trim(),
      time: 'Vừa xong',
      badge: 'Thách Đấu Viên',
    };

    setMessages([added, ...messages]);
    setNewMessage('');
    setJustSent(true);
    setTimeout(() => setJustSent(false), 3000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-12">
      {/* Hero Admin Profile Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/40 bg-gradient-to-b from-stone-900 via-stone-900/90 to-stone-950 p-6 sm:p-8 shadow-2xl shadow-amber-500/5">
        {/* Glow effect behind banner */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar with Royal Crown & Rings */}
          <div className="relative group">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-300 p-1 shadow-2xl shadow-amber-500/30 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full rounded-xl bg-stone-950 flex flex-col items-center justify-center relative overflow-hidden p-2">
                <RoyalKnightLogo className="w-16 h-16 sm:w-20 sm:h-20" showGlow={false} />
                <span className="text-[10px] uppercase font-mono font-black tracking-wider text-amber-300 mt-0.5">
                  VIP PRO GM
                </span>
              </div>
            </div>
            {/* Live Indicator */}
            <div className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-emerald-500 text-stone-950 text-[10px] font-bold rounded-full flex items-center gap-1 border-2 border-stone-900 shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-950 animate-ping" />
              ONLINE
            </div>
          </div>

          {/* Core Info */}
          <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-start gap-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
                <span className="vip-text-shimmer font-black">Tiến Đức VIP Pro</span>
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 text-stone-950 text-xs font-black tracking-wide shadow-sm flex items-center gap-1">
                <Crown className="w-3 h-3" />
                ADMIN TỐI CAO
              </span>
              <span className="px-2 py-0.5 rounded bg-stone-800 border border-stone-700 text-amber-300 text-[11px] font-mono font-bold">
                GM (Đại Kiện Tướng 2950)
              </span>
            </div>

            <p className="text-stone-300 text-sm max-w-2xl leading-relaxed">
              Nhà sáng lập, kiến trúc sư trưởng hệ thống và Quản trị viên tối cao của nền tảng <strong>chesshehe</strong>. 
              Kỳ thủ cờ chớp đẳng cấp VIP Pro với phong cách tấn công bão táp, chuyên gia bóp nghẹt mọi đối thủ trong tàn cuộc.
            </p>

            {/* Quick stats pills */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-950/80 border border-stone-800 text-xs text-stone-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  Tỷ lệ thắng: <strong className="text-emerald-400 font-mono">{calculatedWinRate}%</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-950/80 border border-stone-800 text-xs text-stone-300">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  Tổng thi đấu: <strong className="text-amber-400 font-mono">{totalGames.toLocaleString()} ván</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-950/80 border border-stone-800 text-xs text-stone-300">
                <Award className="w-3.5 h-3.5 text-yellow-400" />
                <span>Danh hiệu: <strong className="text-yellow-400">12 Cúp Vàng FIDE</strong></span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 flex flex-wrap items-center gap-3">
              {isCurrentAdmin ? (
                <>
                  <button
                    onClick={onChallengeAdmin}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-stone-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all transform hover:scale-[1.02] cursor-pointer vip-sheen-btn"
                  >
                    <Sparkles className="w-4 h-4" />
                    Thử Nghiệm AI Boss Tiến Đức (Cực Đại)
                  </button>
                  {onOpenEditProfile && (
                    <button
                      onClick={onOpenEditProfile}
                      className="px-4 py-2.5 bg-stone-850 hover:bg-stone-750 border border-stone-700 text-stone-200 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer vip-sheen-btn"
                    >
                      <Settings className="w-4 h-4 text-amber-400" />
                      Cập Nhật Hồ Sơ Admin
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={onChallengeAdmin}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-stone-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all transform hover:scale-[1.02] cursor-pointer vip-sheen-btn"
                  >
                    <Swords className="w-4 h-4" />
                    Thách Đấu Với Tiến Đức VIP Pro (AI Cực Đại)
                  </button>
                  <a
                    href="#leave-message"
                    className="px-4 py-2.5 bg-stone-850 hover:bg-stone-750 border border-stone-700 text-stone-200 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer vip-sheen-btn"
                  >
                    <MessageSquare className="w-4 h-4 text-amber-400" />
                    Gửi lời nhắn tới Admin
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Official Elo Ratings Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm uppercase font-bold tracking-wider text-amber-400 flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Hệ Số Elo Đỉnh Cao Của Tiến Đức VIP Pro
          </h2>
          <span className="text-[11px] text-stone-500 font-mono">
            {isCurrentAdmin ? 'Hệ thống đã đồng bộ theo dữ liệu tài khoản của bạn' : 'Hệ thống xếp hạng FIDE & Lichess Master'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Bullet */}
          <div className="bg-stone-900/90 border border-stone-800 hover:border-amber-500/40 p-4 rounded-xl flex flex-col justify-between transition group">
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-400 font-medium">Bullet (1 Phút)</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black font-mono text-stone-100 group-hover:text-amber-300 transition">
                {bulletElo}
              </div>
              <span className="text-[10px] text-amber-400 font-mono font-semibold">
                Top 0.01% Kỳ Thủ Nhanh Nhất
              </span>
            </div>
          </div>

          {/* Blitz */}
          <div className="bg-stone-900/90 border border-amber-500/30 p-4 rounded-xl flex flex-col justify-between transition group relative overflow-hidden">
            <div className="absolute top-0 right-0 px-2 py-0.5 bg-amber-500 text-stone-950 font-black text-[9px] rounded-bl">
              SỞ TRƯỜNG
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-400 font-medium">Blitz (3 - 5 Phút)</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition">
                <Flame className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black font-mono text-amber-400">
                {blitzElo}
              </div>
              <span className="text-[10px] text-stone-400 font-mono font-semibold">
                Siêu Đại Kiện Tướng (Super GM)
              </span>
            </div>
          </div>

          {/* Rapid */}
          <div className="bg-stone-900/90 border border-stone-800 hover:border-amber-500/40 p-4 rounded-xl flex flex-col justify-between transition group">
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-400 font-medium">Rapid (10 - 15 Phút)</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black font-mono text-stone-100 group-hover:text-amber-300 transition">
                {rapidElo}
              </div>
              <span className="text-[10px] text-stone-400 font-mono font-semibold">
                Chiến Thuật Bậc Thầy
              </span>
            </div>
          </div>

          {/* Puzzles */}
          <div className="bg-stone-900/90 border border-stone-800 hover:border-amber-500/40 p-4 rounded-xl flex flex-col justify-between transition group">
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-400 font-medium">Thế Cờ (Puzzles)</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition">
                <Puzzle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black font-mono text-stone-100 group-hover:text-amber-300 transition">
                {puzzleElo}
              </div>
              <span className="text-[10px] text-purple-400 font-mono font-semibold">
                Kỷ Lục Giải Thế Cờ Thần Tốc
              </span>
            </div>
          </div>
        </div>
      </div>


      {/* Two columns: Philosophy & Repertoire + Community Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Playstyle & Repertoire */}
        <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-5 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-stone-200 flex items-center gap-2 border-b border-stone-800 pb-2.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Phong Cách Thi Đấu & Khai Cuộc Sở Trường
          </h3>

          <div className="bg-stone-950 p-4 rounded-lg border border-stone-800/80 text-xs leading-relaxed text-stone-300 italic">
            "{`Cờ vua không đơn thuần là cuộc tính toán cơ học; đó là nghệ thuật áp đặt thế trận, nhìn thấu tâm lý đối thủ và tung ra đòn trừng phạt quyết định khi cơ hội xuất hiện.`}"
            <div className="mt-2 text-right not-italic font-bold font-mono text-amber-400">
              — Tiến Đức VIP Pro
            </div>
          </div>

          <div className="flex flex-col gap-2.5 text-xs">
            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-stone-950 border border-stone-800">
              <div className="w-6 h-6 rounded bg-stone-800 text-stone-100 flex items-center justify-center font-bold text-[10px] shrink-0">
                1.e4
              </div>
              <div>
                <strong className="text-stone-100 block">Khai Cuộc Sicilian (Biến Najdorf)</strong>
                <span className="text-stone-400 text-[11px]">
                  Vũ khí nguy hiểm bậc nhất khi cầm quân Đen, tạo ra những đợt phản công cánh Hậu nghẹt thở.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-stone-950 border border-stone-800">
              <div className="w-6 h-6 rounded bg-stone-800 text-stone-100 flex items-center justify-center font-bold text-[10px] shrink-0">
                1.d4
              </div>
              <div>
                <strong className="text-stone-100 block">Gambit Hậu (Queen's Gambit)</strong>
                <span className="text-stone-400 text-[11px]">
                  Chiếm lĩnh trung tâm tuyệt đối khi cầm quân Trắng, ép đối thủ co cụm phòng thủ.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-stone-950 border border-stone-800">
              <div className="w-6 h-6 rounded bg-stone-800 text-stone-100 flex items-center justify-center font-bold text-[10px] shrink-0">
                ♔-♗
              </div>
              <div>
                <strong className="text-stone-100 block">Kỹ Thuật Tàn Cuộc Vua Tốt & Xe Tốt</strong>
                <span className="text-stone-400 text-[11px]">
                  Tính toán chuẩn xác từng ô tam giác và đối vua (Opposition), biến ưu thế nhỏ thành bàn thắng quyết định.
                </span>
              </div>
            </div>
          </div>

          {/* Badges Collection */}
          <div className="pt-2 border-t border-stone-800">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block mb-2">
              Bộ Sưu Tập Huy Hiệu VIP PRO:
            </span>
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-md text-[11px] font-semibold flex items-center gap-1">
                👑 VIP Pro Founder
              </span>
              <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-300 rounded-md text-[11px] font-semibold flex items-center gap-1">
                ⚡ Thần Tốc Bullet
              </span>
              <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-md text-[11px] font-semibold flex items-center gap-1">
                🛡️ Bất Khả Chiến Bại
              </span>
              <span className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-300 rounded-md text-[11px] font-semibold flex items-center gap-1">
                🧠 Thần Đồng Puzzles
              </span>
            </div>
          </div>
        </div>

        {/* Community & Challenge Messages */}
        <div id="leave-message" className="bg-stone-900/80 border border-stone-800 rounded-xl p-5 flex flex-col justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-stone-200 flex items-center gap-2 border-b border-stone-800 pb-2.5">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              Sổ Lưu Bút & Lời Nhắn Gửi Tới Tiến Đức VIP Pro
            </h3>

            {/* Message input form */}
            <form onSubmit={handleSendMessage} className="mt-3 flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Tên của bạn (VD: Kỳ thủ ẩn danh)"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="flex-1 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 text-xs px-3 py-2 rounded-lg outline-hidden"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Gửi lời chào, lời chúc hoặc lời thách đấu tới Admin..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 text-xs px-3 py-2.5 rounded-lg outline-hidden h-[46px]"
                />
                <AnimatedSendButton
                  type="submit"
                  text="SendMessage"
                  sentText="Sent"
                  size="md"
                  disabled={!newMessage.trim()}
                />
              </div>
              {justSent && (
                <div className="text-[11px] text-emerald-400 font-semibold">
                  ✓ Lời nhắn của bạn đã được gửi tới Tiến Đức VIP Pro!
                </div>
              )}
            </form>
          </div>

          {/* Message stream */}
          <div className="flex flex-col gap-2.5 max-h-64 overflow-y-auto pr-1">
            {messages.map((m) => (
              <div key={m.id} className="bg-stone-950 border border-stone-800/80 p-3 rounded-lg text-xs flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <strong className="text-stone-200">{m.sender}</strong>
                    <span className="px-1.5 py-0.2 bg-stone-800 text-amber-400 text-[9px] font-mono rounded font-bold">
                      {m.badge}
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-500 font-mono">{m.time}</span>
                </div>
                <p className="text-stone-300 text-[11px] leading-relaxed">
                  {m.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
