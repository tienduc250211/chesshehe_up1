import React, { useState, useMemo } from 'react';
import { Chess, Square } from 'chess.js';
import { ChessBoard } from './ChessBoard';
import { ChessOpening } from '../types';
import { CHESS_OPENINGS } from '../data/openingsData';
import {
  BookOpen,
  Search,
  Filter,
  Flame,
  Swords,
  Users,
  Trophy,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface OpeningExplorerViewProps {
  onPracticeWithAi?: (opening: ChessOpening) => void;
}

export const OpeningExplorerView: React.FC<OpeningExplorerViewProps> = ({
  onPracticeWithAi,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEco, setSelectedEco] = useState<string>('B90');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'e4' | 'd4' | 'flank'>('all');

  // Currently selected opening
  const activeOpening = useMemo(() => {
    return CHESS_OPENINGS.find((o) => o.eco === selectedEco) || CHESS_OPENINGS[0];
  }, [selectedEco]);

  // Chess game instance initialized to the active opening's FEN
  const [game, setGame] = useState<Chess>(() => {
    const g = new Chess();
    for (const m of activeOpening.moves) {
      try {
        g.move(m);
      } catch {
        break;
      }
    }
    return g;
  });

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(activeOpening.moves.length);

  // When selected opening changes, reset game to that opening
  const handleSelectOpening = (opening: ChessOpening) => {
    setSelectedEco(opening.eco);
    const newGame = new Chess();
    for (const m of opening.moves) {
      try {
        newGame.move(m);
      } catch {
        break;
      }
    }
    setGame(newGame);
    setCurrentStepIndex(opening.moves.length);
  };

  const handleResetToStart = () => {
    setGame(new Chess());
    setCurrentStepIndex(0);
  };

  const handleJumpToOpeningEnd = () => {
    const newGame = new Chess();
    for (const m of activeOpening.moves) {
      try {
        newGame.move(m);
      } catch {
        break;
      }
    }
    setGame(newGame);
    setCurrentStepIndex(activeOpening.moves.length);
  };

  // Filtered opening list
  const filteredOpenings = useMemo(() => {
    return CHESS_OPENINGS.filter((op) => {
      const matchesSearch =
        op.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        op.vietnameseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        op.eco.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (categoryFilter === 'e4') return op.moves[0] === 'e4';
      if (categoryFilter === 'd4') return op.moves[0] === 'd4';
      if (categoryFilter === 'flank') return ['c4', 'Nf3'].includes(op.moves[0]);
      return true;
    });
  }, [searchQuery, categoryFilter]);

  // Allow playing moves on the explorer board
  const handleMove = (from: Square, to: Square) => {
    const nextGame = new Chess(game.fen());
    try {
      const result = nextGame.move({ from, to, promotion: 'q' });
      if (result) {
        setGame(nextGame);
        setCurrentStepIndex((prev) => prev + 1);
        return true;
      }
    } catch {
      return false;
    }
    return false;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-stone-800 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-100 flex items-center gap-2">
              Sách Khai Cuộc & Tra Cứu Thế Cờ (ECO Explorer)
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold">
                Chuẩn Bách Khoa Toàn Thư FIDE
              </span>
            </h1>
            <p className="text-xs text-stone-400 mt-0.5">
              Khám phá các thế khai cuộc kinh điển, tỷ lệ thắng GM và ý tưởng chiến lược then chốt
            </p>
          </div>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 bg-stone-900 p-1 rounded-xl border border-stone-800 text-xs">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              categoryFilter === 'all'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Tất cả (25+)
          </button>
          <button
            onClick={() => setCategoryFilter('e4')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              categoryFilter === 'e4'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Vua Mở (1. e4)
          </button>
          <button
            onClick={() => setCategoryFilter('d4')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              categoryFilter === 'd4'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Hậu Mở (1. d4)
          </button>
          <button
            onClick={() => setCategoryFilter('flank')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              categoryFilter === 'flank'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Cánh (1. c4 / Nf3)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Board & Controls */}
        <div className="lg:col-span-6 flex flex-col items-center">
          {/* Active Opening Banner above board */}
          <div className="w-full max-w-[560px] mb-3 p-3 bg-stone-900/90 rounded-xl border border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-500 text-stone-950 font-mono font-bold text-xs">
                {activeOpening.eco}
              </span>
              <div>
                <h3 className="text-xs font-bold text-stone-100">{activeOpening.vietnameseName}</h3>
                <p className="text-[11px] text-stone-400">{activeOpening.name}</p>
              </div>
            </div>
            <button
              onClick={handleJumpToOpeningEnd}
              className="px-2.5 py-1 text-xs bg-stone-800 hover:bg-stone-700 text-amber-400 rounded-lg font-semibold border border-stone-700 transition cursor-pointer"
            >
              Thế Cờ Khai Cuộc
            </button>
          </div>

          {/* Board */}
          <div className="w-full flex justify-center">
            <ChessBoard game={game} onMove={handleMove} />
          </div>

          {/* Move Sequence Display */}
          <div className="w-full max-w-[560px] mt-3 p-3 bg-stone-900 rounded-xl border border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5 flex-wrap text-xs font-mono">
              <span className="text-stone-500 font-sans font-semibold mr-1">Các nước:</span>
              {activeOpening.moves.map((m, idx) => (
                <span
                  key={idx}
                  className={`px-1.5 py-0.5 rounded ${
                    idx < currentStepIndex
                      ? 'bg-amber-500/20 text-amber-300 font-bold'
                      : 'text-stone-400'
                  }`}
                >
                  {idx % 2 === 0 ? `${idx / 2 + 1}.` : ''} {m}
                </span>
              ))}
            </div>
            <button
              onClick={handleResetToStart}
              className="p-1.5 bg-stone-800 hover:bg-stone-700 rounded-lg text-stone-300 transition cursor-pointer ml-2 flex-shrink-0"
              title="Đặt lại bàn cờ"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* GM Winning Statistics Bar */}
          <div className="w-full max-w-[560px] mt-3 p-4 bg-stone-900 rounded-xl border border-stone-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-300">
              <span className="font-semibold flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                Tỉ Lệ Thắng Trong {activeOpening.stats.totalMasterGames.toLocaleString()} Ván GM
              </span>
            </div>

            {/* Split Bar */}
            <div className="h-5 w-full rounded-lg overflow-hidden flex font-mono text-[11px] font-bold shadow-inner">
              <div
                style={{ width: `${activeOpening.stats.whiteWinRate}%` }}
                className="bg-stone-100 text-stone-900 flex items-center justify-center"
                title={`Trắng thắng: ${activeOpening.stats.whiteWinRate}%`}
              >
                Trắng {activeOpening.stats.whiteWinRate}%
              </div>
              <div
                style={{ width: `${activeOpening.stats.drawRate}%` }}
                className="bg-stone-600 text-stone-200 flex items-center justify-center"
                title={`Hòa: ${activeOpening.stats.drawRate}%`}
              >
                Hòa {activeOpening.stats.drawRate}%
              </div>
              <div
                style={{ width: `${activeOpening.stats.blackWinRate}%` }}
                className="bg-stone-950 text-stone-300 flex items-center justify-center border-l border-stone-700"
                title={`Đen thắng: ${activeOpening.stats.blackWinRate}%`}
              >
                Đen {activeOpening.stats.blackWinRate}%
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Opening Details & Catalog List */}
        <div className="lg:col-span-6 flex flex-col space-y-4">
          {/* Active Opening Deep Dive Card */}
          <div className="p-5 bg-gradient-to-br from-stone-900 to-stone-950 border border-stone-800 rounded-2xl space-y-3.5 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-amber-500 text-stone-950 font-mono font-bold text-xs">
                  {activeOpening.eco}
                </span>
                <h2 className="text-base font-bold text-stone-100">
                  {activeOpening.vietnameseName}
                </h2>
              </div>
              {onPracticeWithAi && (
                <button
                  onClick={() => onPracticeWithAi(activeOpening)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs transition cursor-pointer flex items-center gap-1.5 shadow"
                >
                  <Swords className="w-3.5 h-3.5" />
                  Tập Luyện Với AI
                </button>
              )}
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              {activeOpening.description}
            </p>

            {/* Strategic Themes Tags */}
            <div>
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1.5">
                Ý Tưởng Chiến Lược Then Chốt:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {activeOpening.strategicThemes.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-full text-[11px] bg-stone-800 border border-stone-700 text-amber-300 font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Famous Masters */}
            {activeOpening.famousPlayers && (
              <div className="pt-2 border-t border-stone-800/80 flex items-center gap-2 text-xs text-stone-400">
                <Users className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>
                  Đại kiện tướng ưa chuộng:{' '}
                  <strong className="text-stone-200">
                    {activeOpening.famousPlayers.join(', ')}
                  </strong>
                </span>
              </div>
            )}
          </div>

          {/* Search & Opening List Directory */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex-1 flex flex-col">
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm khai cuộc theo tên, biến thể hoặc mã ECO (vd: B90, Sicilian, Tây Ban Nha)..."
                className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 placeholder:text-stone-500 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            {/* Scrollable list */}
            <div className="space-y-2 overflow-y-auto max-h-[380px] pr-1">
              {filteredOpenings.map((op) => {
                const isSelected = op.eco === activeOpening.eco;
                return (
                  <div
                    key={op.eco}
                    onClick={() => handleSelectOpening(op)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-stone-800 border-amber-500 ring-1 ring-amber-500/50 shadow-md'
                        : 'bg-stone-950/60 border-stone-800/80 hover:bg-stone-800/50 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-10 text-center py-1 rounded bg-stone-800 font-mono text-xs font-bold text-amber-400 border border-stone-700">
                        {op.eco}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-stone-100">{op.vietnameseName}</h4>
                        <p className="text-[11px] text-stone-400 font-mono">
                          {op.moves.slice(0, 5).join(' ')} {op.moves.length > 5 ? '...' : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-right">
                      <div className="text-[11px] font-mono text-stone-400 hidden sm:block">
                        <span className="text-stone-200 font-bold">{op.stats.whiteWinRate}%</span> W /{' '}
                        <span className="text-stone-200 font-bold">{op.stats.blackWinRate}%</span> B
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-500" />
                    </div>
                  </div>
                );
              })}

              {filteredOpenings.length === 0 && (
                <div className="py-12 text-center text-stone-500 text-xs">
                  Không tìm thấy khai cuộc phù hợp với từ khóa "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
