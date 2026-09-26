import React from 'react';
import { PieceColor } from '../types';

interface ChessClockProps {
  timeMs: number;
  isActive: boolean;
  color: PieceColor;
  playerName: string;
  rating?: number;
}

export const ChessClock: React.FC<ChessClockProps> = ({
  timeMs,
  isActive,
  color,
  playerName,
  rating,
}) => {
  const totalSeconds = Math.max(0, Math.floor(timeMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((timeMs % 1000) / 100);

  const isLowTime = totalSeconds < 20;

  // Format: "MM:SS" or "SS.d" when under 20 seconds
  const formattedTime =
    totalSeconds < 10 && timeMs > 0
      ? `${seconds}.${tenths}`
      : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div
      className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-stone-800 text-stone-100 border-2 border-amber-500/80 shadow-md ring-1 ring-amber-500/20'
          : 'bg-stone-900/80 text-stone-400 border border-stone-800'
      }`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-full border ${
            color === 'w'
              ? 'bg-white border-stone-300'
              : 'bg-stone-950 border-stone-600'
          }`}
        />
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-stone-200 tracking-tight leading-none">
            {playerName}
          </span>
          {rating !== undefined && (
            <span className="text-[10px] text-stone-400 font-mono mt-0.5">
              Elo: {rating}
            </span>
          )}
        </div>
      </div>

      <div
        className={`font-mono text-lg sm:text-xl font-bold tracking-wider px-2 py-0.5 rounded transition-colors ${
          isActive
            ? isLowTime
              ? 'bg-red-950 text-red-400 animate-pulse'
              : 'bg-stone-950 text-amber-400'
            : 'bg-stone-950/60 text-stone-400'
        }`}
      >
        {formattedTime}
      </div>
    </div>
  );
};
