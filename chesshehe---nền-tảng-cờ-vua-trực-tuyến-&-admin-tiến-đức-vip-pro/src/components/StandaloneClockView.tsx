import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Clock,
  Zap,
  Settings,
  Flame,
} from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

interface ClockPreset {
  name: string;
  baseMinutes: number;
  incrementSeconds: number;
}

const PRESETS: ClockPreset[] = [
  { name: '1m Bullet', baseMinutes: 1, incrementSeconds: 0 },
  { name: '2+1 Bullet', baseMinutes: 2, incrementSeconds: 1 },
  { name: '3m Blitz', baseMinutes: 3, incrementSeconds: 0 },
  { name: '3+2 Blitz', baseMinutes: 3, incrementSeconds: 2 },
  { name: '5m Blitz', baseMinutes: 5, incrementSeconds: 0 },
  { name: '10m Rapid', baseMinutes: 10, incrementSeconds: 0 },
  { name: '15+10 Classical', baseMinutes: 15, incrementSeconds: 10 },
];

export const StandaloneClockView: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<ClockPreset>(PRESETS[3]); // 3+2 Blitz default
  const [whiteTimeMs, setWhiteTimeMs] = useState(PRESETS[3].baseMinutes * 60 * 1000);
  const [blackTimeMs, setBlackTimeMs] = useState(PRESETS[3].baseMinutes * 60 * 1000);
  const [activePlayer, setActivePlayer] = useState<'w' | 'b' | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [whiteMoves, setWhiteMoves] = useState(0);
  const [blackMoves, setBlackMoves] = useState(0);
  const [timeOutWinner, setTimeOutWinner] = useState<'w' | 'b' | null>(null);

  const lastTickRef = useRef<number>(Date.now());

  // Sound sync
  useEffect(() => {
    soundFx.enabled = soundEnabled;
  }, [soundEnabled]);

  // Handle Preset Change
  const applyPreset = (preset: ClockPreset) => {
    setSelectedPreset(preset);
    setIsRunning(false);
    setActivePlayer(null);
    setWhiteTimeMs(preset.baseMinutes * 60 * 1000);
    setBlackTimeMs(preset.baseMinutes * 60 * 1000);
    setWhiteMoves(0);
    setBlackMoves(0);
    setTimeOutWinner(null);
  };

  // Switch Turn Handlers
  const handleWhiteTap = useCallback(() => {
    if (timeOutWinner) return;
    if (activePlayer === 'w' || activePlayer === null) {
      soundFx.playClockPress();
      // Apply increment to white
      setWhiteTimeMs((prev) => prev + selectedPreset.incrementSeconds * 1000);
      setWhiteMoves((m) => m + 1);
      setActivePlayer('b');
      setIsRunning(true);
      lastTickRef.current = Date.now();
    }
  }, [activePlayer, selectedPreset.incrementSeconds, timeOutWinner]);

  const handleBlackTap = useCallback(() => {
    if (timeOutWinner) return;
    if (activePlayer === 'b' || activePlayer === null) {
      soundFx.playClockPress();
      // Apply increment to black
      setBlackTimeMs((prev) => prev + selectedPreset.incrementSeconds * 1000);
      setBlackMoves((m) => m + 1);
      setActivePlayer('w');
      setIsRunning(true);
      lastTickRef.current = Date.now();
    }
  }, [activePlayer, selectedPreset.incrementSeconds, timeOutWinner]);

  // Spacebar toggle to switch clock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (!isRunning && activePlayer === null) {
          handleWhiteTap();
        } else if (activePlayer === 'w') {
          handleWhiteTap();
        } else if (activePlayer === 'b') {
          handleBlackTap();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleWhiteTap, handleBlackTap, isRunning, activePlayer]);

  // Master Clock Interval
  useEffect(() => {
    if (!isRunning || !activePlayer || timeOutWinner) return;

    lastTickRef.current = Date.now();
    const timer = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;

      if (activePlayer === 'w') {
        setWhiteTimeMs((prev) => {
          const next = prev - delta;
          if (next <= 0) {
            setTimeOutWinner('b');
            setIsRunning(false);
            soundFx.playVictorySound();
            return 0;
          }
          if (next < 10000 && Math.floor(next / 1000) !== Math.floor(prev / 1000)) {
            soundFx.playLowTimeWarning();
          }
          return next;
        });
      } else {
        setBlackTimeMs((prev) => {
          const next = prev - delta;
          if (next <= 0) {
            setTimeOutWinner('w');
            setIsRunning(false);
            soundFx.playVictorySound();
            return 0;
          }
          if (next < 10000 && Math.floor(next / 1000) !== Math.floor(prev / 1000)) {
            soundFx.playLowTimeWarning();
          }
          return next;
        });
      }
    }, 50);

    return () => clearInterval(timer);
  }, [isRunning, activePlayer, timeOutWinner]);

  const togglePause = () => {
    if (timeOutWinner) return;
    setIsRunning((prev) => !prev);
    lastTickRef.current = Date.now();
  };

  const resetClocks = () => {
    applyPreset(selectedPreset);
  };

  const formatDisplayTime = (ms: number) => {
    const totalSecs = Math.max(0, Math.floor(ms / 1000));
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const tenths = Math.floor((ms % 1000) / 100);

    if (totalSecs < 10 && ms > 0) {
      return `${secs}.${tenths}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-5 max-w-4xl mx-auto w-full pb-8">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-900/90 border border-stone-800 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-stone-100 flex items-center gap-2">
              Đồng Hồ Bấm Giờ Thi Đấu FIDE (Chess Clock)
            </h2>
            <p className="text-xs text-stone-400">
              Sử dụng khi thi đấu cờ vua trực tiếp ngoài đời thực • Chạm vào màn hình hoặc bấm phím Space để bấm giờ
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled((v) => !v)}
            className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              soundEnabled
                ? 'bg-stone-800 border-stone-700 text-amber-400'
                : 'bg-stone-950 border-stone-800 text-stone-500'
            }`}
            title="Bật/Tắt âm thanh đồng hồ"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={togglePause}
            disabled={activePlayer === null || timeOutWinner !== null}
            className={`px-3 py-2 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              isRunning
                ? 'bg-amber-500 text-stone-950 border-amber-400'
                : 'bg-stone-800 text-stone-200 border-stone-700 hover:bg-stone-700'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isRunning ? 'Tạm dừng' : 'Tiếp tục'}
          </button>

          <button
            onClick={resetClocks}
            className="p-2 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 rounded-lg text-xs transition cursor-pointer"
            title="Đặt lại đồng hồ ban đầu"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preset Selector Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-stone-950/60 p-2.5 rounded-xl border border-stone-800">
        <span className="text-xs text-stone-400 font-semibold px-2 flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          Chọn thể thức:
        </span>
        {PRESETS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => applyPreset(preset)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition cursor-pointer ${
              selectedPreset.name === preset.name
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'bg-stone-900 text-stone-400 hover:text-stone-200 hover:bg-stone-800 border border-stone-800'
            }`}
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Dual Big Tactile Clock Paddles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[340px] sm:h-[400px]">
        {/* White Clock Paddle */}
        <div
          onClick={handleWhiteTap}
          className={`relative rounded-2xl p-6 flex flex-col justify-between select-none cursor-pointer transition-all duration-200 border-4 ${
            activePlayer === 'w' && isRunning
              ? 'bg-gradient-to-b from-stone-800 to-stone-900 border-amber-500 shadow-2xl shadow-amber-500/20 scale-[1.01]'
              : 'bg-stone-900/60 border-stone-800 hover:border-stone-700 opacity-90'
          }`}
        >
          {/* Top info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-white border border-stone-300 shadow-xs" />
              <span className="font-bold text-sm text-stone-100 uppercase tracking-wider">
                Bên Trắng
              </span>
            </div>
            <div className="text-xs font-mono text-stone-400 bg-stone-950/60 px-2.5 py-1 rounded-md border border-stone-800">
              Nước đi: <strong className="text-stone-200">{whiteMoves}</strong>
            </div>
          </div>

          {/* Time text */}
          <div className="flex flex-col items-center justify-center my-auto">
            <div
              className={`font-mono text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight ${
                whiteTimeMs < 15000 && activePlayer === 'w'
                  ? 'text-red-500 animate-pulse'
                  : activePlayer === 'w' && isRunning
                  ? 'text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.3)]'
                  : 'text-stone-300'
              }`}
            >
              {formatDisplayTime(whiteTimeMs)}
            </div>
            {selectedPreset.incrementSeconds > 0 && (
              <span className="text-xs font-mono text-stone-500 mt-2">
                +{selectedPreset.incrementSeconds}s mỗi nước
              </span>
            )}
          </div>

          {/* Bottom status badge */}
          <div className="text-center">
            {timeOutWinner === 'b' ? (
              <span className="px-4 py-1.5 rounded-full bg-red-950/80 border border-red-500 text-red-400 font-bold text-xs uppercase tracking-wider">
                Hết Giờ (Thua)
              </span>
            ) : timeOutWinner === 'w' ? (
              <span className="px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                Chiến Thắng!
              </span>
            ) : (
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  activePlayer === 'w' && isRunning ? 'text-amber-400 animate-pulse' : 'text-stone-500'
                }`}
              >
                {activePlayer === 'w' && isRunning
                  ? 'Đang đếm giờ • Chạm để bấm'
                  : activePlayer === null
                  ? 'Chạm vào đây để bắt đầu ván đấu'
                  : 'Chờ đối thủ đi'}
              </span>
            )}
          </div>
        </div>

        {/* Black Clock Paddle */}
        <div
          onClick={handleBlackTap}
          className={`relative rounded-2xl p-6 flex flex-col justify-between select-none cursor-pointer transition-all duration-200 border-4 ${
            activePlayer === 'b' && isRunning
              ? 'bg-gradient-to-b from-stone-800 to-stone-900 border-amber-500 shadow-2xl shadow-amber-500/20 scale-[1.01]'
              : 'bg-stone-900/60 border-stone-800 hover:border-stone-700 opacity-90'
          }`}
        >
          {/* Top info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-stone-950 border border-stone-600 shadow-xs" />
              <span className="font-bold text-sm text-stone-100 uppercase tracking-wider">
                Bên Đen
              </span>
            </div>
            <div className="text-xs font-mono text-stone-400 bg-stone-950/60 px-2.5 py-1 rounded-md border border-stone-800">
              Nước đi: <strong className="text-stone-200">{blackMoves}</strong>
            </div>
          </div>

          {/* Time text */}
          <div className="flex flex-col items-center justify-center my-auto">
            <div
              className={`font-mono text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight ${
                blackTimeMs < 15000 && activePlayer === 'b'
                  ? 'text-red-500 animate-pulse'
                  : activePlayer === 'b' && isRunning
                  ? 'text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.3)]'
                  : 'text-stone-300'
              }`}
            >
              {formatDisplayTime(blackTimeMs)}
            </div>
            {selectedPreset.incrementSeconds > 0 && (
              <span className="text-xs font-mono text-stone-500 mt-2">
                +{selectedPreset.incrementSeconds}s mỗi nước
              </span>
            )}
          </div>

          {/* Bottom status badge */}
          <div className="text-center">
            {timeOutWinner === 'w' ? (
              <span className="px-4 py-1.5 rounded-full bg-red-950/80 border border-red-500 text-red-400 font-bold text-xs uppercase tracking-wider">
                Hết Giờ (Thua)
              </span>
            ) : timeOutWinner === 'b' ? (
              <span className="px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                Chiến Thắng!
              </span>
            ) : (
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  activePlayer === 'b' && isRunning ? 'text-amber-400 animate-pulse' : 'text-stone-500'
                }`}
              >
                {activePlayer === 'b' && isRunning
                  ? 'Đang đếm giờ • Chạm để bấm'
                  : activePlayer === null
                  ? 'Chờ Trắng bấm trước'
                  : 'Chờ đối thủ đi'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
