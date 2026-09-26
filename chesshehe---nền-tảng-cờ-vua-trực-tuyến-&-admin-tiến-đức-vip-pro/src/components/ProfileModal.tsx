import React, { useState, useRef } from 'react';
import { PlayerProfile } from '../types';
import { AVATAR_PRESETS, AvatarPreset } from '../utils/avatarPresets';
import {
  User,
  Zap,
  Flame,
  Clock,
  Puzzle,
  X,
  History,
  Users,
  Crown,
  LogOut,
  Camera,
  Check,
  Sparkles,
  RotateCcw,
  Globe,
  Swords,
  BookOpen,
  Upload,
  Link as LinkIcon,
  ShieldAlert,
  Lock,
  Award,
  AlertCircle,
} from 'lucide-react';

interface ProfileModalProps {
  profile: PlayerProfile;
  onUpdateProfile: (updated: Partial<PlayerProfile>) => void;
  onClose: () => void;
  onNavigate?: (tab: 'online' | 'ai' | 'otb' | 'history' | 'friends' | 'admin' | 'puzzles') => void;
  onOpenLogin?: () => void;
  onLogout?: () => void;
}

type SettingsTab = 'info' | 'avatar' | 'ratings';

const AVAILABLE_COUNTRIES = [
  { name: 'Việt Nam', flag: '🇻🇳' },
  { name: 'Na Uy', flag: '🇳🇴' },
  { name: 'Hoa Kỳ', flag: '🇺🇸' },
  { name: 'Pháp', flag: '🇫🇷' },
  { name: 'Nhật Bản', flag: '🇯🇵' },
  { name: 'Hàn Quốc', flag: '🇰🇷' },
  { name: 'Trung Quốc', flag: '🇨🇳' },
  { name: 'Đức', flag: '🇩🇪' },
  { name: 'Anh Quốc', flag: '🇬🇧' },
  { name: 'Toàn Cầu', flag: '🌐' },
];

const AVAILABLE_PLAYSTYLES = [
  'Tấn công bão táp & Bẫy chiến thuật',
  'Phòng thủ bê tông & Phản công sắc bén',
  'Cờ tàn điêu luyện & Tính toán chuẩn xác',
  'Lối đánh linh hoạt & Sáng tạo thế trận',
  'Thần tốc cờ chớp (Blitz Specialist)',
  'Cân bằng toàn diện (Positional Mastery)',
];

export interface AchievementTitleConfig {
  id: string;
  title: string;
  badge: string;
  description: string;
  requirementText: string;
  adminOnly?: boolean;
  checkUnlocked: (p: PlayerProfile) => boolean;
  getProgress: (p: PlayerProfile) => { current: number; target: number; percent: number };
}

export const ACHIEVEMENT_TITLES: AchievementTitleConfig[] = [
  // Đặc quyền Quản Trị Viên Tối Cao
  {
    id: 'admin_supreme',
    title: 'GM 2950 • Quản Trị Viên Tối Cao',
    badge: '👑 ADMIN SUPREME',
    description: 'Danh hiệu cao quý nhất vũ trụ cờ vua OpenChess',
    requirementText: 'Dành riêng cho Quản Trị Viên Tiến Đức VIP Pro',
    adminOnly: true,
    checkUnlocked: (p) => !!p.isAdmin,
    getProgress: (p) => ({
      current: p.isAdmin ? 1 : 0,
      target: 1,
      percent: p.isAdmin ? 100 : 0,
    }),
  },
  // Thành tựu 1: Tân thủ xuất phát
  {
    id: 'title_beginner',
    title: 'Tân Thủ (Elo 700)',
    badge: '🎖️ TÂN THỦ',
    description: 'Bước đầu gia nhập sàn đấu trí tuệ đỉnh cao OpenChess',
    requirementText: 'Mở khóa mặc định cho toàn bộ kỳ thủ',
    checkUnlocked: () => true,
    getProgress: () => ({ current: 1, target: 1, percent: 100 }),
  },
  // Thành tựu 2: Chơi ván đầu tiên
  {
    id: 'title_first_game',
    title: 'Tân Binh Khởi Động',
    badge: '⚔️ TÂN BINH',
    description: 'Hoàn thành ván cờ đầu tiên trên đấu trường',
    requirementText: 'Đã thi đấu ít nhất 1 ván cờ',
    checkUnlocked: (p) => (p.stats?.totalGames || 0) >= 1,
    getProgress: (p) => {
      const cur = Math.min(1, p.stats?.totalGames || 0);
      return { current: cur, target: 1, percent: Math.round((cur / 1) * 100) };
    },
  },
  // Thành tựu 3: Thắng 1 ván
  {
    id: 'title_first_win',
    title: 'Chiến Binh Thắng Trận',
    badge: '🏆 THẮNG LỢI',
    description: 'Giành chiến thắng ván cờ vẻ vang đầu tiên',
    requirementText: 'Đạt ít nhất 1 ván thắng',
    checkUnlocked: (p) => (p.stats?.wins || 0) >= 1,
    getProgress: (p) => {
      const cur = Math.min(1, p.stats?.wins || 0);
      return { current: cur, target: 1, percent: Math.round((cur / 1) * 100) };
    },
  },
  // Thành tựu 4: Thắng 3 ván
  {
    id: 'title_speed_tactics',
    title: 'Chiến Thuật Gia Tốc Độ',
    badge: '⚡ CHIẾN THUẬT',
    description: 'Lối đánh sắc bén và hạ gục đối thủ chớp nhoáng',
    requirementText: 'Đạt 3 ván thắng',
    checkUnlocked: (p) => (p.stats?.wins || 0) >= 3,
    getProgress: (p) => {
      const cur = Math.min(3, p.stats?.wins || 0);
      return { current: cur, target: 3, percent: Math.round((cur / 3) * 100) };
    },
  },
  // Thành tựu 5: Phòng thủ bê tông
  {
    id: 'title_solid_defense',
    title: 'Bậc Thầy Bê Tông',
    badge: '🛡️ PHÒNG THỦ',
    description: 'Thế trận kiên cố, bất khả xâm phạm',
    requirementText: 'Có 1 ván hòa hoặc thi đấu từ 5 ván cờ trở lên',
    checkUnlocked: (p) => (p.stats?.draws || 0) >= 1 || (p.stats?.totalGames || 0) >= 5,
    getProgress: (p) => {
      const cur = Math.min(5, (p.stats?.totalGames || 0) + ((p.stats?.draws || 0) > 0 ? 5 : 0));
      return { current: cur, target: 5, percent: Math.min(100, Math.round((cur / 5) * 100)) };
    },
  },
  // Thành tựu 6: Giải đố cờ thế
  {
    id: 'title_puzzle_master',
    title: 'Bậc Thầy Giải Đố',
    badge: '🧩 TRÍ TUỆ',
    description: 'Tư duy chiến thuật và tính toán nước cờ sâu sắc',
    requirementText: 'Đạt Elo Giải Đố ≥ 720 hoặc Thắng 2 ván cờ',
    checkUnlocked: (p) => (p.ratings?.puzzle || 700) >= 720 || (p.stats?.wins || 0) >= 2,
    getProgress: (p) => {
      const puz = p.ratings?.puzzle || 700;
      const cur = Math.max(0, Math.min(20, puz - 700));
      return { current: cur, target: 20, percent: Math.min(100, Math.round((cur / 20) * 100)) };
    },
  },
  // Thành tựu 7: Đột phá Elo 750
  {
    id: 'title_breakthrough',
    title: 'Kỳ Thủ Đột Phá (Elo 750+)',
    badge: '🚀 ĐỘT PHÁ',
    description: 'Vượt qua ngưỡng 750 Elo trong sự nghiệp thi đấu',
    requirementText: 'Đạt Elo Blitz ≥ 750',
    checkUnlocked: (p) => (p.ratings?.blitz || 700) >= 750,
    getProgress: (p) => {
      const elo = p.ratings?.blitz || 700;
      const cur = Math.max(0, Math.min(50, elo - 700));
      return { current: cur, target: 50, percent: Math.min(100, Math.round((cur / 50) * 100)) };
    },
  },
  // Thành tựu 8: 5 ván thắng
  {
    id: 'title_flame_warrior',
    title: 'Ngọn Lửa Bất Bại',
    badge: '🔥 CHIẾN THẦN',
    description: 'Phong độ hủy diệt với chuỗi chiến thắng liên tiếp',
    requirementText: 'Đạt 5 ván thắng',
    checkUnlocked: (p) => (p.stats?.wins || 0) >= 5,
    getProgress: (p) => {
      const cur = Math.min(5, p.stats?.wins || 0);
      return { current: cur, target: 5, percent: Math.round((cur / 5) * 100) };
    },
  },
  // Thành tựu 9: Cao thủ cờ chớp 800+
  {
    id: 'title_blitz_master',
    title: 'Cao Thủ Cờ Chớp OpenChess',
    badge: '💎 CAO THỦ',
    description: 'Làm chủ tốc độ và sức ép thời gian nghẹt thở',
    requirementText: 'Đạt Elo Blitz ≥ 800',
    checkUnlocked: (p) => (p.ratings?.blitz || 700) >= 800,
    getProgress: (p) => {
      const elo = p.ratings?.blitz || 700;
      const cur = Math.max(0, Math.min(100, elo - 700));
      return { current: cur, target: 100, percent: Math.min(100, Math.round((cur / 100) * 100)) };
    },
  },
  // Thành tựu 10: 10 ván thắng / Elo 900
  {
    id: 'title_potential_gm',
    title: 'Đại Kiện Tướng Tiềm Năng',
    badge: '⭐ GM TƯƠNG LAI',
    description: 'Đẳng cấp vượt trội, hướng đến vương miện Grandmaster',
    requirementText: 'Đạt 10 ván thắng hoặc Elo ≥ 900',
    checkUnlocked: (p) => (p.stats?.wins || 0) >= 10 || (p.ratings?.blitz || 700) >= 900,
    getProgress: (p) => {
      const cur = Math.min(10, p.stats?.wins || 0);
      return { current: cur, target: 10, percent: Math.round((cur / 10) * 100) };
    },
  },
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  profile,
  onUpdateProfile,
  onClose,
  onNavigate,
  onOpenLogin,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('info');

  // Form State
  const [usernameInput, setUsernameInput] = useState(profile.username || 'Kỳ thủ Việt');
  const [titleInput, setTitleInput] = useState(profile.title || 'Tân Thủ (Elo 700)');
  const [bioInput, setBioInput] = useState(profile.bio || 'Kỳ thủ đam mê cờ vua trên OpenChess!');
  const [countryInput, setCountryInput] = useState(profile.country || 'Việt Nam');
  const [flagInput, setFlagInput] = useState(profile.flag || '🇻🇳');
  const [playStyleInput, setPlayStyleInput] = useState(profile.playStyle || AVAILABLE_PLAYSTYLES[0]);

  // Avatar Selection State
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(
    profile.avatarUrl || AVATAR_PRESETS[0].url
  );
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [avatarCategoryFilter, setAvatarCategoryFilter] = useState<'all' | 'ai_bots' | 'grandmaster'>('all');

  // Warnings / Notifications
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetEloConfirm, setResetEloConfirm] = useState(false);
  const [actionAlert, setActionAlert] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const stats = profile.stats || { wins: 0, losses: 0, draws: 0, totalGames: 0 };
  const ratings = profile.ratings || { bullet: 700, blitz: 700, rapid: 700, puzzle: 700 };

  const triggerAlert = (msg: string) => {
    setActionAlert(msg);
    setTimeout(() => {
      setActionAlert(null);
    }, 3500);
  };

  const handleSaveAll = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!usernameInput.trim()) return;

    onUpdateProfile({
      username: usernameInput.trim(),
      title: titleInput.trim(),
      bio: bioInput.trim(),
      country: countryInput,
      flag: flagInput,
      playStyle: playStyleInput,
      avatarUrl: selectedAvatarUrl,
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2200);
  };

  // Avatar selection handler enforcing Admin exclusive access on Famous Grandmasters
  const handleSelectAvatar = (preset: AvatarPreset) => {
    if (preset.adminOnly && !profile.isAdmin) {
      triggerAlert(
        `🔒 Avatar danh nhân "${preset.name}" chỉ dành riêng cho Admin Tiến Đức VIP Pro! Kỳ thủ vui lòng chọn các nhân vật AI bên dưới.`
      );
      return;
    }
    setSelectedAvatarUrl(preset.url);
  };

  // Title selection handler enforcing Achievement requirement (except Admin)
  const handleSelectTitle = (ach: AchievementTitleConfig) => {
    if (profile.isAdmin) {
      setTitleInput(ach.title);
      return;
    }

    const isUnlocked = ach.checkUnlocked(profile);
    if (!isUnlocked) {
      triggerAlert(
        `🔒 Danh hiệu "${ach.title}" chưa được mở khóa! Yêu cầu: ${ach.requirementText}`
      );
      return;
    }

    setTitleInput(ach.title);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        triggerAlert('Vui lòng chọn ảnh nhỏ hơn 2MB để đảm bảo hiệu năng!');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setSelectedAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetEloTo700 = () => {
    onUpdateProfile({
      ratings: {
        bullet: 700,
        blitz: 700,
        rapid: 700,
        puzzle: 700,
      },
      title: 'Tân Thủ (Elo 700)',
    });
    setTitleInput('Tân Thủ (Elo 700)');
    setResetEloConfirm(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2200);
  };

  const filteredPresets = AVATAR_PRESETS.filter((p) => {
    if (avatarCategoryFilter === 'all') return true;
    if (avatarCategoryFilter === 'ai_bots') return p.category === 'ai_bots';
    if (avatarCategoryFilter === 'grandmaster') return p.category === 'grandmaster' || p.category === 'admin';
    return true;
  });

  const winRate = stats.totalGames > 0
    ? Math.round((stats.wins / stats.totalGames) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-700/80 rounded-2xl max-w-xl w-full max-h-[92vh] shadow-2xl flex flex-col overflow-hidden text-stone-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <img
                src={selectedAvatarUrl}
                alt="Avatar"
                className="w-10 h-10 rounded-full border-2 border-amber-500/80 object-cover shadow-md shadow-amber-500/20"
              />
              {profile.isAdmin && (
                <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5 text-stone-950">
                  <Crown className="w-3 h-3 fill-stone-950" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm sm:text-base font-bold text-stone-100">{usernameInput}</h3>
                {profile.isAdmin ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500 text-stone-950 font-black tracking-wide">
                    ADMIN VIP PRO
                  </span>
                ) : (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-800 text-stone-300 font-semibold">
                    KỲ THỦ
                  </span>
                )}
              </div>
              <p className="text-[11px] text-amber-400 font-mono flex items-center gap-1">
                <span>{flagInput}</span>
                <span className="truncate max-w-[200px]">{titleInput}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-100 p-1.5 rounded-lg hover:bg-stone-800 transition cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Toast Alert */}
        {actionAlert && (
          <div className="px-5 py-2.5 bg-amber-950/80 border-b border-amber-500/50 flex items-center gap-2 text-xs text-amber-200 animate-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="flex-1 font-medium">{actionAlert}</span>
            <button
              type="button"
              onClick={() => setActionAlert(null)}
              className="text-amber-400 hover:text-amber-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center px-5 border-b border-stone-800 bg-stone-950/30 gap-2 overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`py-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'info'
                ? 'border-amber-400 text-amber-300 font-bold bg-amber-500/5'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Hồ Sơ & Danh Hiệu</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('avatar')}
            className={`py-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'avatar'
                ? 'border-amber-400 text-amber-300 font-bold bg-amber-500/5'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Thay Đổi Avatar ({AVATAR_PRESETS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ratings')}
            className={`py-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'ratings'
                ? 'border-amber-400 text-amber-300 font-bold bg-amber-500/5'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Chỉ Số Elo (700 Gốc)</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 max-h-[60vh]">
          {/* TAB 1: THÔNG TIN TÀI KHOẢN & HỆ THỐNG DANH HIỆU THEO THÀNH TỰU */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Username */}
                <div>
                  <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5 mb-1">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span>Kỳ Danh / Tên người dùng</span>
                  </label>
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Nhập tên người dùng..."
                    className="w-full bg-stone-950 border border-stone-700/80 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-600 focus:outline-hidden focus:border-amber-500 transition font-medium"
                  />
                </div>

                {/* Current Equipped Title Display */}
                <div>
                  <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5 mb-1">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>Danh hiệu hiện tại</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={titleInput}
                      disabled={!profile.isAdmin}
                      onChange={(e) => setTitleInput(e.target.value)}
                      placeholder="Chọn danh hiệu thành tựu bên dưới..."
                      className={`w-full border rounded-xl px-3 py-2 text-xs font-medium transition ${
                        profile.isAdmin
                          ? 'bg-stone-950 border-amber-500/70 text-amber-300 focus:outline-hidden focus:border-amber-400'
                          : 'bg-stone-950/80 border-stone-800 text-amber-400/90 cursor-not-allowed opacity-90'
                      }`}
                    />
                    {!profile.isAdmin && (
                      <div className="absolute right-2.5 top-2.5 text-stone-500" title="Mở khóa bằng thành tựu">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Achievement Titles Section */}
              <div className="space-y-2 pt-2 border-t border-stone-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-stone-200">
                      Hệ Thống Danh Hiệu Thành Tựu
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-400">
                    {profile.isAdmin ? '👑 Toàn quyền Admin mở khóa tất cả' : 'Đạt thành tựu để mở khóa'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ACHIEVEMENT_TITLES.map((ach) => {
                    const isUnlocked = profile.isAdmin || ach.checkUnlocked(profile);
                    const progress = ach.getProgress(profile);
                    const isEquipped = titleInput === ach.title;

                    return (
                      <button
                        key={ach.id}
                        type="button"
                        onClick={() => handleSelectTitle(ach)}
                        className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between gap-1.5 cursor-pointer hover:scale-[1.01] ${
                          isEquipped
                            ? 'bg-amber-500/15 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                            : isUnlocked
                            ? 'bg-stone-950 border-stone-800 hover:border-amber-500/50 hover:bg-stone-900'
                            : 'bg-stone-950/50 border-stone-900 opacity-60 hover:opacity-80'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] px-1.5 py-0.2 rounded font-black tracking-wider bg-stone-800 text-stone-300 inline-block mb-1">
                              {ach.badge}
                            </span>
                            <div className="text-xs font-bold text-stone-100 flex items-center gap-1">
                              <span>{ach.title}</span>
                              {isEquipped && <Check className="w-3.5 h-3.5 text-amber-400 stroke-[3]" />}
                            </div>
                          </div>

                          <div className="shrink-0 mt-0.5">
                            {isUnlocked ? (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                                {isEquipped ? 'Đang dùng' : 'Đã đạt'}
                              </span>
                            ) : (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-800 text-stone-400 font-semibold flex items-center gap-1 border border-stone-700/50">
                                <Lock className="w-2.5 h-2.5" /> Khóa
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-[10px] text-stone-400 leading-relaxed line-clamp-1">
                          {ach.requirementText}
                        </p>

                        {/* Progress Bar (for non-admin) */}
                        {!profile.isAdmin && !isUnlocked && (
                          <div className="w-full bg-stone-800 rounded-full h-1.5 overflow-hidden mt-0.5">
                            <div
                              className="bg-amber-500 h-full rounded-full transition-all duration-300"
                              style={{ width: `${Math.max(5, progress.percent)}%` }}
                            />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Country & Flag Selection */}
              <div className="pt-2 border-t border-stone-800">
                <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5 mb-1.5">
                  <Globe className="w-3.5 h-3.5 text-amber-400" />
                  <span>Quốc gia đại diện</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {AVAILABLE_COUNTRIES.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => {
                        setCountryInput(c.name);
                        setFlagInput(c.flag);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 justify-center transition cursor-pointer ${
                        countryInput === c.name
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-xs'
                          : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700'
                      }`}
                    >
                      <span>{c.flag}</span>
                      <span className="truncate">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Playstyle */}
              <div>
                <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5 mb-1.5">
                  <Swords className="w-3.5 h-3.5 text-amber-400" />
                  <span>Phong cách thi đấu ưa thích</span>
                </label>
                <select
                  value={playStyleInput}
                  onChange={(e) => setPlayStyleInput(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700/80 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-hidden focus:border-amber-500 transition cursor-pointer"
                >
                  {AVAILABLE_PLAYSTYLES.map((style) => (
                    <option key={style} value={style} className="bg-stone-900 text-stone-100">
                      {style}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bio / Motto */}
              <div>
                <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5 mb-1">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tiểu sử & Châm ngôn cờ vua</span>
                </label>
                <textarea
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  rows={2}
                  placeholder="Chia sẻ châm ngôn thi đấu của bạn..."
                  className="w-full bg-stone-950 border border-stone-700/80 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-600 focus:outline-hidden focus:border-amber-500 transition resize-none font-medium"
                />
              </div>
            </div>
          )}

          {/* TAB 2: THAY ĐỔI AVATAR (CÁC ĐẠI KIỆN TƯỚNG NỔI TIẾNG CHỈ DÀNH CHO ADMIN) */}
          {activeTab === 'avatar' && (
            <div className="space-y-4">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'all', label: 'Tất Cả' },
                  { id: 'ai_bots', label: '🤖 Nhân Vật AI (Khuyên dùng)' },
                  { id: 'grandmaster', label: '👑 Đại Kiện Tướng (🔒 Chỉ Admin)' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setAvatarCategoryFilter(cat.id as any)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border transition cursor-pointer ${
                      avatarCategoryFilter === cat.id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Rule Note for Users */}
              <div className="p-2.5 bg-stone-950 border border-stone-800 rounded-xl flex items-center justify-between text-xs">
                <span className="text-stone-400">
                  {profile.isAdmin ? (
                    <strong className="text-amber-300 flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                      Quyền Admin: Bạn có thể chọn bất kỳ Avatar Đại Kiện Tướng nào!
                    </strong>
                  ) : (
                    <span className="flex items-center gap-1 text-stone-300">
                      <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      Các Avatar Đại Kiện Tướng nổi tiếng chỉ dành riêng cho <strong>Admin Tiến Đức VIP Pro</strong>. Kỳ thủ được chọn toàn bộ nhân vật AI phong cách dưới đây!
                    </span>
                  )}
                </span>
              </div>

              {/* Presets Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {filteredPresets.map((preset: AvatarPreset) => {
                  const isSelected = selectedAvatarUrl === preset.url;
                  const isLockedForUser = preset.adminOnly && !profile.isAdmin;

                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectAvatar(preset)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-2 text-center transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)] scale-[1.02]'
                          : isLockedForUser
                          ? 'bg-stone-950/60 border-stone-900 opacity-60 hover:opacity-85 hover:border-stone-700'
                          : 'bg-stone-950 border-stone-800/90 hover:border-amber-500/60 hover:bg-stone-900/90 hover:-translate-y-0.5'
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className={`w-14 h-14 rounded-full object-cover border-2 shadow-md ${
                            isLockedForUser
                              ? 'border-stone-800 grayscale-[40%]'
                              : 'border-stone-700/60'
                          }`}
                        />
                        {isSelected && (
                          <div className="absolute -bottom-1 -right-1 bg-amber-400 rounded-full p-0.5 text-stone-950 shadow-md">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                        {isLockedForUser && (
                          <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-amber-400">
                            <Lock className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      <div className="w-full">
                        <span className="text-xs font-bold text-stone-100 block truncate">
                          {preset.flag ? `${preset.flag} ` : ''}
                          {preset.name}
                        </span>
                        <span className="text-[10px] text-amber-400/90 block truncate mt-0.5 font-medium">
                          {isLockedForUser ? '🔒 Dành riêng Admin' : preset.badge || preset.role}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Avatar Options (Upload or URL) */}
              <div className="pt-3 border-t border-stone-800 space-y-2.5">
                <span className="text-xs font-semibold text-stone-300 block">Hoặc tải ảnh đại diện cá nhân:</span>

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 flex gap-1.5">
                    <input
                      type="text"
                      value={customAvatarUrl}
                      onChange={(e) => setCustomAvatarUrl(e.target.value)}
                      placeholder="Dán link ảnh online (https://...)..."
                      className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-3 py-1.5 text-xs text-stone-100 placeholder-stone-600 focus:outline-hidden focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customAvatarUrl.trim()) {
                          setSelectedAvatarUrl(customAvatarUrl.trim());
                        }
                      }}
                      className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs rounded-xl font-semibold transition cursor-pointer flex items-center gap-1"
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>Áp dụng</span>
                    </button>
                  </div>

                  {/* File Upload Button */}
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full sm:w-auto px-3 py-1.5 bg-stone-950 hover:bg-stone-800 border border-stone-800 text-amber-400 text-xs rounded-xl font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Tải ảnh từ máy</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HỆ SỐ ELO & KỶ LỤC */}
          {activeTab === 'ratings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Hệ Số Elo Hiện Tại (Theo Tiêu Chuẩn OpenChess)
                </span>
                <span className="text-[11px] text-amber-400 font-mono">Mốc khởi điểm chuẩn: 700 Elo</span>
              </div>

              {/* Elo Ratings Grid with Cool Hover Cards */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-stone-950 border border-stone-800/90 hover:border-amber-500/50 p-3 rounded-xl flex items-center gap-3 transition hover:-translate-y-0.5 shadow-sm">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shadow-inner">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-stone-400 block font-medium">Bullet (1m)</span>
                    <span className="text-lg font-extrabold font-mono text-stone-100">
                      {ratings.bullet}
                    </span>
                  </div>
                </div>

                <div className="bg-stone-950 border border-stone-800/90 hover:border-amber-500/50 p-3 rounded-xl flex items-center gap-3 transition hover:-translate-y-0.5 shadow-sm">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shadow-inner">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-stone-400 block font-medium">Blitz (3-5m)</span>
                    <span className="text-lg font-extrabold font-mono text-stone-100">
                      {ratings.blitz}
                    </span>
                  </div>
                </div>

                <div className="bg-stone-950 border border-stone-800/90 hover:border-amber-500/50 p-3 rounded-xl flex items-center gap-3 transition hover:-translate-y-0.5 shadow-sm">
                  <div className="w-9 h-9 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center shadow-inner">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-stone-400 block font-medium">Rapid (10-15m)</span>
                    <span className="text-lg font-extrabold font-mono text-stone-100">
                      {ratings.rapid}
                    </span>
                  </div>
                </div>

                <div className="bg-stone-950 border border-stone-800/90 hover:border-amber-500/50 p-3 rounded-xl flex items-center gap-3 transition hover:-translate-y-0.5 shadow-sm">
                  <div className="w-9 h-9 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center shadow-inner">
                    <Puzzle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-stone-400 block font-medium">Bài tập Puzzles</span>
                    <span className="text-lg font-extrabold font-mono text-stone-100">
                      {ratings.puzzle}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Breakdown */}
              <div className="bg-stone-950 border border-stone-800 p-3.5 rounded-xl flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-stone-400 block text-[10px]">Tổng số ván</span>
                  <strong className="text-stone-100 text-sm">{stats.totalGames}</strong>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Thắng</span>
                  <strong className="text-emerald-400 text-sm">{stats.wins}</strong>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Hòa</span>
                  <strong className="text-amber-400 text-sm">{stats.draws}</strong>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Thua</span>
                  <strong className="text-red-400 text-sm">{stats.losses}</strong>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Tỉ lệ thắng</span>
                  <strong className="text-amber-300 text-sm">{winRate}%</strong>
                </div>
              </div>

              {/* Reset Elo to 700 Feature */}
              <div className="pt-2">
                {!resetEloConfirm ? (
                  <button
                    type="button"
                    onClick={() => setResetEloConfirm(true)}
                    className="w-full py-2 bg-stone-950 hover:bg-red-950/40 border border-stone-800 hover:border-red-800 text-stone-400 hover:text-red-300 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Đặt Lại Mọi Hệ Số Elo Về Gốc (700)</span>
                  </button>
                ) : (
                  <div className="p-3 bg-red-950/40 border border-red-800/80 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-xs text-red-300 font-semibold">
                      <ShieldAlert className="w-4 h-4 text-red-400" />
                      <span>Bạn có chắc chắn muốn đặt lại Elo về 700 cho mọi thể thức?</span>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setResetEloConfirm(false)}
                        className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs font-medium cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={handleResetEloTo700}
                        className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Xác nhận đặt lại về 700
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions & Save */}
        <div className="px-5 py-3.5 border-t border-stone-800 bg-stone-950/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onNavigate && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigate('history');
                  }}
                  className="flex-1 sm:flex-none px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer border border-stone-700"
                >
                  <History className="w-3.5 h-3.5 text-amber-400" />
                  <span>Lịch Sử Đấu</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigate('friends');
                  }}
                  className="flex-1 sm:flex-none px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer border border-stone-700"
                >
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span>Bạn Bè</span>
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {saveSuccess && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 animate-pulse">
                <Check className="w-3.5 h-3.5" />
                Đã lưu hồ sơ thành công!
              </span>
            )}
            <button
              type="button"
              onClick={() => handleSaveAll()}
              className="w-full sm:w-auto px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Lưu Cài Đặt Hồ Sơ</span>
            </button>
          </div>
        </div>

        {/* Switch / Logout Account Quick Options */}
        <div className="px-5 py-2.5 border-t border-stone-900 bg-stone-950 flex items-center justify-between gap-3 text-center">
          {onLogout ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold transition cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất tài khoản</span>
            </button>
          ) : <div />}

          {onOpenLogin && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenLogin();
              }}
              className="text-[11px] text-stone-400 hover:text-amber-400 transition cursor-pointer flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Đổi tài khoản hoặc đăng nhập lại</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
