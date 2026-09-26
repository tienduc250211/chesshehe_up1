import React, { useState, useEffect } from 'react';
import { PlayerProfile, FriendItem, TimeControlKey, ChessOpening, MatchHistoryItem } from './types';
import { OnlineGameView } from './components/OnlineGameView';
import { AiGameView } from './components/AiGameView';
import { PuzzlesView } from './components/PuzzlesView';
import { NewsView } from './components/NewsView';
import { ArchitectureView } from './components/ArchitectureView';
import { ProfileModal } from './components/ProfileModal';
import { AdminProfileView } from './components/AdminProfileView';
import { MatchHistoryView } from './components/MatchHistoryView';
import { FriendsView } from './components/FriendsView';
import { GameAnalysisView } from './components/GameAnalysisView';
import { OpeningExplorerView } from './components/OpeningExplorerView';
import { LeaderboardView } from './components/LeaderboardView';
import { ThemesModal } from './components/ThemesModal';
import { SplashScreen } from './components/SplashScreen';
import { WebEffectsShowcaseModal } from './components/WebEffectsShowcaseModal';
import { AmbientBackground, BackgroundTheme } from './components/AmbientBackground';
import { sanitizeProfile } from './utils/profileManager';
import { soundFx } from './utils/soundEffects';
import {
  Users,
  Bot,
  Puzzle,
  BookOpen,
  Compass,
  User,
  Zap,
  Crown,
  Sparkles,
  History,
  UserCheck,
  Swords,
  BrainCircuit,
  Palette,
  Trophy,
  Maximize2,
  Tv,
  LogIn,
  LogOut,
} from 'lucide-react';
import { RoyalKnightLogo } from './components/RoyalKnightLogo';

export default function App() {
  const [showSplash, setShowSplash] = useState(false);
  const [currentTab, setCurrentTab] = useState<
    'online' | 'ai' | 'analysis' | 'openings' | 'leaderboard' | 'history' | 'friends' | 'puzzles' | 'admin' | 'news' | 'architecture'
  >('online');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isThemesModalOpen, setIsThemesModalOpen] = useState(false);
  const [isWebEffectsModalOpen, setIsWebEffectsModalOpen] = useState(false);
  const [bgTheme, setBgTheme] = useState<BackgroundTheme>('royal-amber');
  const [challengeAdminTrigger, setChallengeAdminTrigger] = useState(false);

  // Moves to analyze when navigating from match history or opening
  const [analysisMoves, setAnalysisMoves] = useState<string[] | undefined>(undefined);
  const [analysisWhite, setAnalysisWhite] = useState<string>('Trắng');
  const [analysisBlack, setAnalysisBlack] = useState<string>('Đen');

  // User profile state stored with localStorage persistence
  const [profile, setProfile] = useState<PlayerProfile>(() => {
    try {
      const saved = localStorage.getItem('chesshehe_profile') || localStorage.getItem('openchess_profile');
      if (saved) {
        return sanitizeProfile(JSON.parse(saved));
      }
    } catch {
      // fallback
    }
    return sanitizeProfile(null);
  });

  // Determines if player is logged in: admin or has logged in profile
  const isLoggedIn = Boolean(
    profile.isLoggedIn !== false && (profile.isAdmin || profile.isLoggedIn || (profile.username && profile.username !== 'Kỳ thủ Khách' && profile.username !== 'Khách'))
  );

  const handleLogout = () => {
    const guest = sanitizeProfile({
      id: `usr_${Math.random().toString(36).substring(2, 7)}`,
      username: 'Kỳ thủ Khách',
      isAdmin: false,
      isLoggedIn: false,
      title: 'Tân Thủ (Elo 700)',
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
    });
    setProfile(guest);
    try {
      localStorage.setItem('chesshehe_profile', JSON.stringify(guest));
    } catch {
      // ignore
    }
  };

  const handleLoginSuccess = (newProfile: PlayerProfile) => {
    const authenticated = sanitizeProfile({
      ...newProfile,
      isLoggedIn: true,
    });
    setProfile(authenticated);
    try {
      localStorage.setItem('chesshehe_profile', JSON.stringify(authenticated));
    } catch {
      // ignore
    }
    setShowSplash(false);
  };

  useEffect(() => {
    try {
      localStorage.setItem('chesshehe_profile', JSON.stringify(profile));
    } catch {
      // ignore
    }
  }, [profile]);

  // Lồng ghép hiệu ứng VIP cho TẤT CẢ các nút bấm trên toàn bộ website:
  // - Âm thanh xúc giác tactile clock click
  // - Hiệu ứng gợn sóng hào quang hoàng gia (VIP Click Ripple)
  useEffect(() => {
    const handleGlobalButtonClick = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement)?.closest('button');
      if (btn && !btn.disabled) {
        soundFx.playClockPress();

        try {
          const rect = btn.getBoundingClientRect();
          const ripple = document.createElement('span');
          ripple.className = 'vip-click-ripple';
          ripple.style.left = `${e.clientX - rect.left}px`;
          ripple.style.top = `${e.clientY - rect.top}px`;
          btn.appendChild(ripple);
          setTimeout(() => {
            ripple.remove();
          }, 600);
        } catch {
          // ignore DOM failsafe
        }
      }
    };

    document.addEventListener('click', handleGlobalButtonClick);
    return () => document.removeEventListener('click', handleGlobalButtonClick);
  }, []);

  const handleUpdateProfile = (updated: Partial<PlayerProfile>) => {
    setProfile((prev) => sanitizeProfile({ ...prev, ...updated }));
  };

  const handleEloUpdate = (category: string, newRating: number) => {
    setProfile((prev) => {
      const currentRatings = prev.ratings || { bullet: 1500, blitz: 1520, rapid: 1550, puzzle: 1480 };
      const currentStats = prev.stats || { wins: 0, losses: 0, draws: 0, totalGames: 0 };
      return sanitizeProfile({
        ...prev,
        ratings: {
          ...currentRatings,
          [category]: newRating,
        },
        stats: {
          ...currentStats,
          totalGames: (currentStats.totalGames || 0) + 1,
        },
      });
    });
  };

  const handlePuzzleSolved = (delta: number) => {
    setProfile((prev) => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        puzzle: prev.ratings.puzzle + delta,
      },
    }));
  };

  const handleChallengeAdmin = () => {
    setChallengeAdminTrigger(true);
    setCurrentTab('ai');
  };

  const handleChallengeFriend = (friend: FriendItem, timeControl: TimeControlKey) => {
    if (friend.id === 'admin_tienduc') {
      setChallengeAdminTrigger(true);
      setCurrentTab('ai');
    } else {
      setCurrentTab('online');
    }
  };

  const handleChallengeFromLeaderboard = (playerName: string, playerElo: number, isAdmin?: boolean) => {
    if (isAdmin || playerName.includes('Tiến Đức')) {
      handleChallengeAdmin();
    } else {
      setCurrentTab('ai');
    }
  };

  const handleAnalyzeFromHistory = (match: MatchHistoryItem) => {
    // Generate sample or extracted moves
    const sample = [
      'e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'd3', 'Be7',
      'O-O', 'O-O', 'Re1', 'd6', 'c3', 'Na5', 'Bb5', 'a6', 'Ba4',
    ];
    setAnalysisMoves(sample);
    setAnalysisWhite(match.myColor === 'w' ? profile.username : match.opponentName);
    setAnalysisBlack(match.myColor === 'b' ? profile.username : match.opponentName);
    setCurrentTab('analysis');
  };

  const handlePracticeOpeningWithAi = (opening: ChessOpening) => {
    setChallengeAdminTrigger(false);
    setCurrentTab('ai');
  };

  return (
    <div className="min-h-screen bg-[#161512] text-stone-100 flex flex-col font-sans relative selection:bg-amber-500/30 selection:text-amber-200">
      {/* Ambient Animated Visual Background */}
      <AmbientBackground theme={bgTheme} />

      {/* Màn hình chờ & Đăng nhập (Splash Login Screen with Motion Background) */}
      {showSplash && (
        <SplashScreen
          currentProfile={profile}
          onLogin={handleLoginSuccess}
          onEnterAsGuest={() => {
            setShowSplash(false);
          }}
        />
      )}

      {/* Top Header */}
      <header className="h-14 border-b border-stone-800/80 bg-[#161512]/90 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-4 flex items-center justify-between">
        <div className="flex items-center gap-3 lg:gap-5">
          {/* Logo & Brand: Con Mã Đội Vương Miện Hoàng Gia VIP */}
          <div
            onClick={() => setShowSplash(true)}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
            title="Nhấn để xem thông tin tài khoản / mở màn hình đăng nhập"
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 border border-amber-500/40 group-hover:border-amber-400 p-1 flex items-center justify-center transition-all duration-300 shadow-md shadow-amber-500/15 group-hover:shadow-amber-500/35 group-hover:scale-105">
                <RoyalKnightLogo className="w-7 h-7" showGlow={false} />
              </div>
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400/80 animate-ping pointer-events-none" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-sm tracking-tight leading-none flex items-center gap-1.5">
                <span className="vip-text-shimmer font-black">chesshehe</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 font-extrabold border border-amber-400/40 font-mono tracking-wider shadow-xs">
                  ROYAL VIP
                </span>
              </span>
              <span className="text-[10px] text-amber-400/80 font-mono mt-0.5 flex items-center gap-1">
                <Crown className="w-2.5 h-2.5 text-amber-400" />
                Tiến Đức Edition
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-1">
            <button
              onClick={() => setCurrentTab('online')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                currentTab === 'online'
                  ? 'bg-stone-800 text-amber-400 border border-stone-700'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Đấu Online
            </button>

            <button
              onClick={() => {
                setChallengeAdminTrigger(false);
                setCurrentTab('ai');
              }}
              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                currentTab === 'ai'
                  ? 'bg-stone-800 text-amber-400 border border-stone-700'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              Đấu Máy AI
            </button>

            {/* Feature 1: Analysis */}
            <button
              onClick={() => setCurrentTab('analysis')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                currentTab === 'analysis'
                  ? 'bg-stone-800 text-amber-400 border border-stone-700'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5 text-cyan-400" />
              Phân Tích
            </button>

            {/* Feature 2: Openings */}
            <button
              onClick={() => setCurrentTab('openings')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                currentTab === 'openings'
                  ? 'bg-stone-800 text-amber-400 border border-stone-700'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              Khai Cuộc ECO
            </button>

            {/* Feature 4: Leaderboard */}
            <button
              onClick={() => setCurrentTab('leaderboard')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                currentTab === 'leaderboard'
                  ? 'bg-stone-800 text-amber-400 border border-stone-700'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              Bảng Xếp Hạng
            </button>

            <button
              onClick={() => setCurrentTab('history')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                currentTab === 'history'
                  ? 'bg-stone-800 text-amber-400 border border-stone-700'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
              }`}
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              Lịch Sử
            </button>

            <button
              onClick={() => setCurrentTab('friends')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                currentTab === 'friends'
                  ? 'bg-stone-800 text-amber-400 border border-stone-700'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-amber-400" />
              Bạn Bè
            </button>

            <button
              onClick={() => setCurrentTab('puzzles')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                currentTab === 'puzzles'
                  ? 'bg-stone-800 text-amber-400 border border-stone-700'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
              }`}
            >
              <Puzzle className="w-3.5 h-3.5" />
              Bài Tập
            </button>

            <button
              onClick={() => setCurrentTab('admin')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                currentTab === 'admin'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-stone-950 shadow-md'
                  : 'text-amber-400 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-yellow-300" />
              Admin VIP Pro
            </button>
          </nav>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* VIP Website Effects Showcase Button */}
          <button
            onClick={() => setIsWebEffectsModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 hover:from-amber-500/25 hover:to-yellow-500/20 border border-amber-500/40 hover:border-amber-400 text-xs text-amber-300 transition cursor-pointer shadow-xs group vip-sheen-btn"
            title="Khám phá các hiệu ứng website VIP (Nút SendMessage động, viền xoay, gợn sóng chữ, thủy tinh...)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform animate-pulse" />
            <span className="hidden sm:inline font-bold">Hiệu Ứng VIP</span>
            <span className="sm:hidden font-bold">VIP</span>
          </button>

          {/* Feature 3: Board Theme Customizer Button */}
          <button
            onClick={() => setIsThemesModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/50 text-xs text-stone-300 transition cursor-pointer"
            title="Đổi giao diện bàn cờ (5 chủ đề FIDE)"
          >
            <Palette className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline font-semibold">Giao Diện Cờ</span>
          </button>

          {/* Màn hình đăng nhập / Đăng xuất (Tự động đổi chữ khi đã đăng nhập) */}
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 hover:border-rose-400 text-xs text-rose-300 hover:text-rose-100 transition cursor-pointer shadow-xs group vip-sheen-btn"
              title="Đăng xuất khỏi tài khoản hiện tại"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
              <span className="font-bold">Đăng Xuất</span>
            </button>
          ) : (
            <button
              onClick={() => setShowSplash(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/60 text-xs text-stone-300 hover:text-amber-300 transition cursor-pointer shadow-xs group vip-sheen-btn"
              title="Mở màn hình đăng nhập chesshehe"
            >
              <LogIn className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="font-semibold">Đăng Nhập</span>
            </button>
          )}

          {/* Admin VIP Pro Quick Badge */}
          <button
            onClick={() => setCurrentTab('admin')}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/40 text-xs text-amber-300 hover:border-amber-400 transition cursor-pointer"
            title="Xem hồ sơ & thông tin Tiến Đức VIP Pro"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            <span className="font-bold font-mono">Tiến Đức VIP Pro</span>
            <span className="text-[10px] px-1 rounded bg-amber-500 text-stone-950 font-bold">
              2950 GM
            </span>
          </button>

          {/* User Profile Trigger */}
          <button
            onClick={() => setIsProfileOpen(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-200 cursor-pointer hover:scale-[1.03] ${
              profile.isAdmin
                ? 'bg-amber-500/15 border border-amber-500/60 hover:border-amber-400 text-amber-200 hover:shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/60 hover:shadow-[0_0_15px_rgba(245,158,11,0.15)]'
            }`}
            title="Cài đặt tài khoản & đổi avatar"
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono overflow-hidden border ${
                profile.isAdmin
                  ? 'border-amber-400 ring-2 ring-amber-500/30'
                  : 'border-stone-700'
              }`}
            >
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.username}
                  className="w-full h-full object-cover"
                />
              ) : profile.isAdmin ? (
                <Crown className="w-4 h-4 text-amber-400" />
              ) : (
                <User className="w-4 h-4 text-amber-400" />
              )}
            </div>
            <div className="text-left leading-tight hidden sm:block">
              <div className="text-xs font-bold text-stone-200 truncate max-w-[130px] flex items-center gap-1">
                <span>{profile.flag || '🇻🇳'}</span>
                <span className="truncate">{profile.username}</span>
                {profile.isAdmin && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500 text-stone-950 font-black">
                    ADMIN
                  </span>
                )}
              </div>
              <div className="text-[10px] text-amber-400 font-mono">
                {profile.ratings?.blitz ?? 700} Elo {profile.isAdmin ? '• GM 2950' : ''}
              </div>
            </div>
          </button>
        </div>
      </header>

      {/* Mobile / Compact Sub-Navigation Tabs */}
      <div className="flex xl:hidden border-b border-stone-800 bg-[#161512] px-2 py-1.5 overflow-x-auto gap-1 z-20 scrollbar-none">
        <button
          onClick={() => setCurrentTab('online')}
          className={`px-3 py-1 rounded text-xs whitespace-nowrap font-medium ${
            currentTab === 'online' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400'
          }`}
        >
          Online
        </button>
        <button
          onClick={() => {
            setChallengeAdminTrigger(false);
            setCurrentTab('ai');
          }}
          className={`px-3 py-1 rounded text-xs whitespace-nowrap font-medium ${
            currentTab === 'ai' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400'
          }`}
        >
          Đấu AI
        </button>
        <button
          onClick={() => setCurrentTab('analysis')}
          className={`px-3 py-1 rounded text-xs whitespace-nowrap font-medium flex items-center gap-1 ${
            currentTab === 'analysis' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400'
          }`}
        >
          <BrainCircuit className="w-3 h-3 text-cyan-400" />
          Phân Tích
        </button>
        <button
          onClick={() => setCurrentTab('openings')}
          className={`px-3 py-1 rounded text-xs whitespace-nowrap font-medium flex items-center gap-1 ${
            currentTab === 'openings' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400'
          }`}
        >
          <BookOpen className="w-3 h-3 text-amber-400" />
          Khai Cuộc
        </button>
        <button
          onClick={() => setCurrentTab('leaderboard')}
          className={`px-3 py-1 rounded text-xs whitespace-nowrap font-medium flex items-center gap-1 ${
            currentTab === 'leaderboard' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400'
          }`}
        >
          <Trophy className="w-3 h-3 text-yellow-400" />
          Xếp Hạng
        </button>
        <button
          onClick={() => setCurrentTab('history')}
          className={`px-3 py-1 rounded text-xs whitespace-nowrap font-medium ${
            currentTab === 'history' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400'
          }`}
        >
          Lịch Sử
        </button>
        <button
          onClick={() => setCurrentTab('friends')}
          className={`px-3 py-1 rounded text-xs whitespace-nowrap font-medium ${
            currentTab === 'friends' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400'
          }`}
        >
          Bạn Bè
        </button>
        <button
          onClick={() => setCurrentTab('admin')}
          className={`px-3 py-1 rounded text-xs whitespace-nowrap font-bold flex items-center gap-1 ${
            currentTab === 'admin' ? 'bg-amber-500 text-stone-950 font-black' : 'text-amber-400 bg-amber-500/10'
          }`}
        >
          <Crown className="w-3 h-3" />
          Tiến Đức VIP Pro
        </button>
        <button
          onClick={() => setCurrentTab('puzzles')}
          className={`px-3 py-1 rounded text-xs whitespace-nowrap font-medium ${
            currentTab === 'puzzles' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400'
          }`}
        >
          Bài Tập
        </button>
        <button
          onClick={() => setCurrentTab('news')}
          className={`px-3 py-1 rounded text-xs whitespace-nowrap font-medium ${
            currentTab === 'news' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400'
          }`}
        >
          Tin tức
        </button>
        <button
          onClick={() => setCurrentTab('architecture')}
          className={`px-3 py-1 rounded text-xs whitespace-nowrap font-medium ${
            currentTab === 'architecture' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400'
          }`}
        >
          Kiến trúc
        </button>
      </div>

      {/* Main View Area */}
      <main className="flex-1 p-3 sm:p-6 flex flex-col items-center justify-center relative z-10">
        {currentTab === 'online' && (
          <OnlineGameView
            userId={profile.id}
            username={profile.username}
            userElo={profile.ratings?.blitz ?? 1520}
            onEloUpdate={handleEloUpdate}
          />
        )}

        {currentTab === 'ai' && (
          <AiGameView
            userElo={profile.ratings?.blitz ?? 1520}
            initialOpponentIsAdmin={challengeAdminTrigger}
          />
        )}

        {/* Feature 1: Game Analysis View */}
        {currentTab === 'analysis' && (
          <GameAnalysisView
            initialMoves={analysisMoves}
            initialWhite={analysisWhite}
            initialBlack={analysisBlack}
            onNavigateToAi={() => setCurrentTab('ai')}
          />
        )}

        {/* Feature 2: Opening Explorer View */}
        {currentTab === 'openings' && (
          <OpeningExplorerView
            onPracticeWithAi={handlePracticeOpeningWithAi}
          />
        )}

        {/* Feature 4: Leaderboard View */}
        {currentTab === 'leaderboard' && (
          <LeaderboardView
            currentUserProfile={profile}
            onChallengePlayer={handleChallengeFromLeaderboard}
            onOpenAdminProfile={() => setCurrentTab('admin')}
          />
        )}

        {currentTab === 'history' && (
          <MatchHistoryView
            onChallengeOpponent={(name) => {
              if (name.includes('Tiến Đức')) {
                handleChallengeAdmin();
              } else {
                setCurrentTab('online');
              }
            }}
            onAnalyzeMatch={handleAnalyzeFromHistory}
          />
        )}

        {currentTab === 'friends' && (
          <FriendsView
            onChallengeFriend={handleChallengeFriend}
            onOpenAdminProfile={() => setCurrentTab('admin')}
            currentUserProfile={profile}
          />
        )}

        {currentTab === 'admin' && (
          <AdminProfileView
            onChallengeAdmin={handleChallengeAdmin}
            currentUserProfile={profile}
            onOpenEditProfile={() => setIsProfileOpen(true)}
          />
        )}



        {currentTab === 'puzzles' && (
          <PuzzlesView
            userPuzzleElo={profile.ratings?.puzzle ?? 1480}
            onPuzzleSolved={handlePuzzleSolved}
          />
        )}

        {currentTab === 'news' && (
          <NewsView />
        )}

        {currentTab === 'architecture' && (
          <ArchitectureView />
        )}
      </main>

      {/* Footer with Theme Selector & Credits */}
      <footer className="py-3 px-4 border-t border-stone-800/80 bg-[#161512]/90 backdrop-blur-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-stone-500 font-mono relative z-10">
        <div className="flex items-center gap-2">
          <span>chesshehe VIP Pro • Sáng lập & Quản trị bởi <strong className="text-amber-400 font-bold">Tiến Đức VIP Pro (GM 2950)</strong></span>
        </div>

        {/* Ambient Theme Selector & Quick Theme Modal Trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsThemesModalOpen(true)}
            className="flex items-center gap-1 text-amber-400 hover:text-amber-300 transition cursor-pointer"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>5 Theme Bàn Cờ FIDE</span>
          </button>

          <span className="text-stone-700">|</span>

          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1 text-stone-400">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Nền:
            </span>
            <button
              onClick={() => setBgTheme('royal-amber')}
              className={`px-1.5 py-0.5 rounded cursor-pointer transition ${
                bgTheme === 'royal-amber' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-stone-500 hover:text-stone-300'
              }`}
            >
              Hoàng Gia
            </button>
            <button
              onClick={() => setBgTheme('cosmic-slate')}
              className={`px-1.5 py-0.5 rounded cursor-pointer transition ${
                bgTheme === 'cosmic-slate' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'text-stone-500 hover:text-stone-300'
              }`}
            >
              Vũ Trụ
            </button>
            <button
              onClick={() => setBgTheme('subtle-grid')}
              className={`px-1.5 py-0.5 rounded cursor-pointer transition ${
                bgTheme === 'subtle-grid' ? 'bg-stone-800 text-stone-300 border border-stone-700' : 'text-stone-500 hover:text-stone-300'
              }`}
            >
              Lưới Cờ
            </button>
          </div>
        </div>
      </footer>

      {/* Feature 3: Board Theme Customization Modal */}
      <ThemesModal
        isOpen={isThemesModalOpen}
        onClose={() => setIsThemesModalOpen(false)}
      />

      {/* VIP Website Effects Showcase Modal */}
      <WebEffectsShowcaseModal
        isOpen={isWebEffectsModalOpen}
        onClose={() => setIsWebEffectsModalOpen(false)}
      />

      {/* Profile Modal */}
      {isProfileOpen && (
        <ProfileModal
          profile={profile}
          onUpdateProfile={handleUpdateProfile}
          onClose={() => setIsProfileOpen(false)}
          onNavigate={(tab) => setCurrentTab(tab as any)}
          onOpenLogin={() => setShowSplash(true)}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
