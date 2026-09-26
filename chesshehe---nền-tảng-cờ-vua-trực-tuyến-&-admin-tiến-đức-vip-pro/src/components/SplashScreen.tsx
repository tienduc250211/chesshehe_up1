import React, { useState, useEffect, useRef } from 'react';
import {
  Crown,
  LogIn,
  User,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { PlayerProfile } from '../types';
import { ADMIN_BASE_PROFILE, sanitizeProfile } from '../utils/profileManager';
import { RoyalKnightLogo } from './RoyalKnightLogo';

interface SplashScreenProps {
  currentProfile: PlayerProfile;
  onLogin: (profile: PlayerProfile) => void;
  onEnterAsGuest: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  currentProfile,
  onLogin,
  onEnterAsGuest,
}) => {
  const safeProfile = currentProfile ? sanitizeProfile(currentProfile) : sanitizeProfile(null);

  const isCurrentlyAdmin = Boolean(
    safeProfile.isAdmin ||
      safeProfile.id === 'admin_tienduc' ||
      safeProfile.username?.toLowerCase().includes('tiến đức')
  );

  const [username, setUsername] = useState(
    safeProfile.username || 'Tiến Đức VIP Pro'
  );

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Canvas ref for animated subtle particle stars/sparks
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle nodes for fluid background motion
    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      speedX: number;
      speedY: number;
      alpha: number;
      char?: string;
    }> = [];

    const chessChars = ['♔', '♕', '♖', '♗', '♘', '♙'];
    const particleCount = 28;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: -Math.random() * 0.5 - 0.15,
        alpha: Math.random() * 0.4 + 0.1,
        char: Math.random() > 0.4 ? chessChars[Math.floor(Math.random() * chessChars.length)] : undefined,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.y < -20) p.y = height + 20;
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;

        if (p.char) {
          ctx.font = '20px serif';
          ctx.fillStyle = `rgba(245, 158, 11, ${p.alpha * 0.7})`;
          ctx.fillText(p.char, p.x, p.y);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(217, 119, 6, ${p.alpha * 0.8})`;
          ctx.shadowBlur = 8;
          ctx.shadowColor = 'rgba(245, 158, 11, 0.4)';
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const normalizeStr = (str: string) =>
    str
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const normUser = normalizeStr(username);
    const trimmedUser = username.trim();
    const isAdminAttempt =
      normUser === 'tien duc' ||
      normUser.includes('tien duc') ||
      trimmedUser.toLowerCase().includes('tiến đức');

    setTimeout(() => {
      if (isAdminAttempt) {
        if (!password.trim() || (password.trim() !== 'duc0342461813' && password.trim() !== 'tienduc2026' && password.trim() !== 'admin')) {
          setErrorMessage(
            'Mật khẩu quản trị viên không chính xác! Vui lòng nhập đúng mật khẩu tài khoản Tiến Đức.'
          );
          setIsLoading(false);
          return;
        }

        // Successfully authenticated as supreme Admin Tiến Đức (synchronized with base admin)
        const synchronizedAdminProfile = sanitizeProfile({
          ...ADMIN_BASE_PROFILE,
          username: 'Tiến Đức VIP Pro',
          id: 'admin_tienduc',
          isAdmin: true,
        });

        onLogin(synchronizedAdminProfile);
      } else {
        // Normal chess player login - starts with 700 Elo
        const chosenUsername = trimmedUser || 'Kỳ thủ Việt';
        onLogin(
          sanitizeProfile({
            ...currentProfile,
            id: currentProfile.id === 'admin_tienduc' ? `player_${Date.now()}` : currentProfile.id,
            username: chosenUsername,
            isAdmin: false,
            title: 'Tân Thủ (Elo 700)',
            ratings: {
              bullet: 700,
              blitz: 700,
              rapid: 700,
              puzzle: 700,
            },
          })
        );
      }
      setIsLoading(false);
    }, 300);
  };

  const isCurrentAdminTyped =
    normalizeStr(username).includes('tien duc') ||
    username.trim().toLowerCase().includes('tiến đức');


  return (
    <div className="fixed inset-0 z-50 bg-stone-950 flex flex-col items-center justify-center p-4 overflow-hidden select-none">
      {/* Canvas Background with Floating Motion Chess Dust */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* Moving Ambient Glowing Waves */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none animate-aurora-1" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none animate-aurora-2" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(245,158,11,0.08)_0%,transparent_70%)] pointer-events-none" />

      {/* Floating Chess Piece Silhouettes in Background */}
      <div className="absolute top-12 left-16 text-6xl text-amber-500/10 animate-chess-float-1 pointer-events-none">
        ♔
      </div>
      <div className="absolute bottom-20 left-24 text-7xl text-amber-400/10 animate-chess-float-2 pointer-events-none">
        ♘
      </div>
      <div className="absolute top-24 right-20 text-6xl text-amber-500/10 animate-chess-float-3 pointer-events-none">
        ♕
      </div>
      <div className="absolute bottom-16 right-24 text-7xl text-amber-400/10 animate-chess-float-4 pointer-events-none">
        ♖
      </div>

      {/* Subtle Animated Perspective Grid */}
      <div className="absolute inset-0 opacity-[0.03] animate-grid-glow pointer-events-none bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Focused, Elegant VIP Login Card */}
      <div className="relative z-10 w-full max-w-md vip-glass-card rounded-2xl p-6 sm:p-8 flex flex-col">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-3 group">
            {/* Vòng hào quang hoàng gia nhịp thở */}
            <div className="absolute inset-0 rounded-2xl bg-amber-500/20 blur-xl animate-pulse pointer-events-none" />
            <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 border border-amber-500/50 flex items-center justify-center p-2 shadow-2xl shadow-amber-500/30 ring-2 ring-amber-400/30 group-hover:scale-105 transition-transform duration-300">
              <RoyalKnightLogo className="w-14 h-14" showGlow={false} />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-stone-950 border border-amber-400 text-amber-300 text-[10px] font-black px-1.5 py-0.5 rounded-md font-mono flex items-center gap-0.5 shadow-md shadow-amber-500/20">
              <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
              ROYAL
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-stone-100 tracking-tight flex items-center gap-2">
            <span className="vip-text-shimmer">chesshehe</span>
            <span className="text-amber-300 text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 font-bold font-mono shadow-xs">
              VIP Online
            </span>
          </h1>
          <p className="text-xs text-stone-300 mt-1.5 font-medium">
            Nền tảng cờ vua trực tuyến • Đăng nhập để bắt đầu ván đấu
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-start gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form for Chess Players */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Username Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-stone-300 flex items-center justify-between">
              <span>Tên kỳ thủ (Kỳ danh)</span>
              {isCurrentAdminTyped && (
                <span className="text-[10px] text-amber-400 font-bold font-mono flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400" />
                  Tài khoản Admin
                </span>
              )}
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3 text-stone-500 pointer-events-none">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                required
                placeholder="Nhập tên kỳ thủ của bạn..."
                className={`w-full bg-stone-950 border rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-600 focus:outline-none transition ${
                  isCurrentAdminTyped
                    ? 'border-amber-500/80 focus:border-amber-400 ring-1 ring-amber-500/30'
                    : 'border-stone-800 focus:border-amber-500/80'
                }`}
              />
            </div>
          </div>

          {/* Password / Access Code Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-stone-300 flex items-center justify-between">
              <span>Mã bảo mật / Mật khẩu</span>
              <span className="text-[10px] text-stone-500">
                {isCurrentAdminTyped ? (
                  <span className="text-amber-400 font-medium">Bảo mật tài khoản Admin</span>
                ) : (
                  'Tùy chọn cho kỳ thủ tự do'
                )}
              </span>
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3 text-stone-500 pointer-events-none">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="applet_security_token"
                autoComplete="new-password"
                data-lpignore="true"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder={
                  isCurrentAdminTyped
                    ? 'Nhập mã bảo mật Admin Tiến Đức...'
                    : 'Nhập mật khẩu tài khoản (tùy chọn)...'
                }
                className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-10 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500/80 transition font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-stone-500 hover:text-stone-300 cursor-pointer p-1"
                title={showPassword ? 'Ẩn mã' : 'Hiện mã'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button with VIP Sheen Effect */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-extrabold rounded-xl text-xs sm:text-sm transition-all transform hover:-translate-y-0.5 active:scale-98 shadow-lg hover:shadow-[0_0_25px_rgba(245,158,11,0.45)] flex items-center justify-center gap-2 cursor-pointer vip-sheen-btn"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4 stroke-[2.5]" />
                <span>Đăng Nhập Vào OpenChess</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Guest Entrance */}
        <div className="mt-3 pt-3 border-t border-stone-800/80 flex flex-col gap-2">
          <button
            type="button"
            onClick={onEnterAsGuest}
            className="w-full py-2.5 bg-stone-950 hover:bg-stone-850 border border-stone-800 hover:border-amber-500/40 text-stone-300 hover:text-amber-200 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2 shadow-sm vip-sheen-btn"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Vào Nhanh Với Tư Cách Kỳ Thủ Tân Thủ (Elo 700)</span>
          </button>
        </div>

        {/* Admin attribution footer */}
        <p className="text-[10px] text-stone-500 text-center mt-5 leading-relaxed font-mono">
          Quản trị viên tối cao:{' '}
          <span className="text-amber-400 font-semibold">Tiến Đức VIP Pro (GM 2950)</span>
        </p>
      </div>
    </div>
  );
};
