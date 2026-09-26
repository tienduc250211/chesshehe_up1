import React, { useState } from 'react';
import { BoardThemeKey } from '../types';
import { BOARD_THEMES, getSavedBoardTheme, saveBoardTheme } from '../utils/boardThemes';
import { Palette, Check, X, Sparkles, Monitor } from 'lucide-react';

interface ThemesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onThemeChanged?: (themeKey: BoardThemeKey) => void;
}

export const ThemesModal: React.FC<ThemesModalProps> = ({
  isOpen,
  onClose,
  onThemeChanged,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<BoardThemeKey>(getSavedBoardTheme());

  if (!isOpen) return null;

  const handleSelectTheme = (key: BoardThemeKey) => {
    setSelectedTheme(key);
    saveBoardTheme(key);
    window.dispatchEvent(new Event('storage'));
    if (onThemeChanged) {
      onThemeChanged(key);
    }
  };

  const themeList = Object.values(BOARD_THEMES);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-100 flex items-center gap-2">
                Tùy Biến Giao Diện Bàn Cờ
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                  5 Chủ Đề Chuẩn FIDE
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                Lựa chọn phong cách thị giác phù hợp nhất với phong cách thi đấu của bạn
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: Theme Selection Grid */}
        <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
          {themeList.map((theme) => {
            const isSelected = selectedTheme === theme.id;
            return (
              <div
                key={theme.id}
                onClick={() => handleSelectTheme(theme.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-4 ${
                  isSelected
                    ? 'bg-stone-800/90 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                    : 'bg-stone-950/50 border-stone-800 hover:border-stone-700 hover:bg-stone-800/40'
                }`}
              >
                {/* Mini Preview Board (4x4 squares) */}
                <div className="w-16 h-16 rounded-lg overflow-hidden border border-stone-700 shadow-inner flex-shrink-0 grid grid-cols-4 grid-rows-4">
                  {[0, 1, 2, 3].map((r) =>
                    [0, 1, 2, 3].map((c) => {
                      const isLight = (r + c) % 2 === 0;
                      return (
                        <div
                          key={`${r}-${c}`}
                          style={{
                            backgroundColor: isLight ? theme.lightSquare : theme.darkSquare,
                          }}
                        />
                      );
                    })
                  )}
                </div>

                {/* Theme Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-stone-100">{theme.name}</h3>
                    {theme.id === 'amber' && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500 text-stone-950 font-bold uppercase">
                        Admin VIP
                      </span>
                    )}
                    {theme.id === 'green' && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-600/30 text-emerald-400 font-medium">
                        Phổ biến nhất
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-400 mt-0.5 line-clamp-2">
                    {theme.description}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-stone-500 font-mono">
                    <span className="flex items-center gap-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-stone-600 inline-block"
                        style={{ backgroundColor: theme.lightSquare }}
                      />
                      Ô sáng
                    </span>
                    <span className="flex items-center gap-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-stone-600 inline-block"
                        style={{ backgroundColor: theme.darkSquare }}
                      />
                      Ô tối
                    </span>
                  </div>
                </div>

                {/* Selection indicator */}
                <div className="flex-shrink-0">
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-stone-700 hover:border-stone-500" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-950 flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Áp dụng đồng bộ tức thì trên mọi ván đấu của bạn</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
