import React, { useState } from 'react';
import { Chess, Square } from 'chess.js';
import { TacticalPuzzle, PieceType } from '../types';
import { INITIAL_PUZZLES } from '../data/chessData';
import { ChessBoard } from './ChessBoard';
import {
  Lightbulb,
  CheckCircle2,
  XCircle,
  ArrowRight,
  HelpCircle,
  Sparkles,
  Trophy,
} from 'lucide-react';

interface PuzzlesViewProps {
  userPuzzleElo: number;
  onPuzzleSolved?: (ratingChange: number) => void;
}

export const PuzzlesView: React.FC<PuzzlesViewProps> = ({
  userPuzzleElo,
  onPuzzleSolved,
}) => {
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const puzzle = INITIAL_PUZZLES[currentPuzzleIndex];

  const [game, setGame] = useState(() => {
    const g = new Chess(puzzle.fen);
    return g;
  });

  const [solutionStep, setSolutionStep] = useState(0);
  const [status, setStatus] = useState<'playing' | 'correct' | 'wrong' | 'completed'>('playing');
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);

  const resetPuzzle = (index: number) => {
    const target = INITIAL_PUZZLES[index];
    const newG = new Chess(target.fen);
    setGame(newG);
    setSolutionStep(0);
    setStatus('playing');
    setShowHint(false);
    setShowExplanation(false);
    setLastMove(null);
  };

  const handlePlayerMove = (from: Square, to: Square, promotion?: PieceType): boolean => {
    if (status === 'completed' || status === 'wrong') return false;

    try {
      const expectedMove = puzzle.solutionMoves[solutionStep];
      if (!expectedMove) return false;

      // Try making the move on a temp board
      const testGame = new Chess(game.fen());
      const move = testGame.move({ from, to, promotion: promotion || 'q' });

      if (!move) return false;

      // Check if it matches expected move
      const isCorrectMove = move.from === expectedMove.from && move.to === expectedMove.to;

      if (isCorrectMove) {
        // Execute player move
        game.move({ from, to, promotion: promotion || 'q' });
        setLastMove({ from, to });
        const updatedGame = new Chess(game.fen());
        setGame(updatedGame);

        const nextStep = solutionStep + 1;
        setSolutionStep(nextStep);

        // If that was the final move in the puzzle
        if (nextStep >= puzzle.solutionMoves.length) {
          setStatus('completed');
          setShowExplanation(true);
          if (onPuzzleSolved) {
            onPuzzleSolved(15);
          }
        } else {
          // Play opponent's automatic response move if specified
          const opponentMove = puzzle.solutionMoves[nextStep];
          if (opponentMove) {
            setTimeout(() => {
              try {
                updatedGame.move({
                  from: opponentMove.from,
                  to: opponentMove.to,
                  promotion: 'q',
                });
                setLastMove({ from: opponentMove.from, to: opponentMove.to });
                setGame(new Chess(updatedGame.fen()));
                setSolutionStep(nextStep + 1);
              } catch (e) {
                console.error('Opponent move error:', e);
              }
            }, 300);
          }
        }
        return true;
      } else {
        // Incorrect move
        setStatus('wrong');
        return false;
      }
    } catch {
      return false;
    }
  };

  const handleNextPuzzle = () => {
    const nextIdx = (currentPuzzleIndex + 1) % INITIAL_PUZZLES.length;
    setCurrentPuzzleIndex(nextIdx);
    resetPuzzle(nextIdx);
  };

  const handleRetry = () => {
    resetPuzzle(currentPuzzleIndex);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto w-full items-start justify-center">
      {/* Board Column */}
      <div className="flex flex-col items-center gap-3 w-full lg:w-auto">
        {/* Status indicator bar */}
        <div className="w-[min(90vw,560px)] flex items-center justify-between px-4 py-2.5 bg-stone-900 border border-stone-800 rounded-lg text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-200">
              Bài tập #{currentPuzzleIndex + 1}: {puzzle.title}
            </span>
            <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded font-mono text-[11px]">
              {puzzle.rating} Elo
            </span>
          </div>

          <span className="text-stone-400">
            Lượt:{' '}
            <strong className="text-stone-200">
              {puzzle.turnToMove === 'w' ? 'Quân Trắng đi' : 'Quân Đen đi'}
            </strong>
          </span>
        </div>

        {/* The Board */}
        <ChessBoard
          game={game}
          orientation={puzzle.turnToMove}
          onMove={handlePlayerMove}
          disabled={status === 'completed'}
          lastMove={lastMove}
        />
      </div>

      {/* Side Panel: Puzzle Info & Feedback */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        {/* User Stats Card */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-stone-400">Điểm Puzzle Elo</div>
              <div className="text-lg font-bold font-mono text-stone-100">
                {userPuzzleElo}
              </div>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 bg-stone-800 text-stone-300 rounded font-medium">
            Bài {currentPuzzleIndex + 1}/{INITIAL_PUZZLES.length}
          </span>
        </div>

        {/* Puzzle Feedback Box */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex flex-wrap gap-1.5">
            {puzzle.theme.map((tag) => (
              <span
                key={tag}
                className="text-[10px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded font-mono"
              >
                #{tag}
              </span>
            ))}
          </div>

          {status === 'playing' && (
            <div className="p-3 bg-stone-950/70 border border-stone-800 rounded-lg text-xs text-stone-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Tìm nước đi tốt nhất cho bên {puzzle.turnToMove === 'w' ? 'Trắng' : 'Đen'}.</span>
            </div>
          )}

          {status === 'wrong' && (
            <div className="p-3 bg-red-950/60 border border-red-800/60 rounded-lg text-xs text-red-300 flex items-start gap-2">
              <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Chưa chính xác!</strong>
                Nước đi này chưa tối ưu hoặc để lộ sơ hở. Hãy thử lại phương án khác!
              </div>
            </div>
          )}

          {status === 'completed' && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-800/60 rounded-lg text-xs text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Xuất sắc! Đã giải thành công (+15 Elo)</strong>
                Bạn đã hoàn thành chính xác chuỗi nước đi chiến thuật.
              </div>
            </div>
          )}

          {/* Hint section */}
          {showHint && (
            <div className="p-3 bg-amber-950/40 border border-amber-800/40 rounded-lg text-xs text-amber-200 flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-amber-300">Gợi ý chiến thuật:</strong>
                {puzzle.hint}
              </div>
            </div>
          )}

          {/* Detailed explanation */}
          {showExplanation && (
            <div className="p-3 bg-stone-950 border border-stone-800 rounded-lg text-xs text-stone-300 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-stone-200">Phân tích chuyên sâu:</strong>
                {puzzle.explanation}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-2 border-t border-stone-800">
            {status === 'wrong' && (
              <button
                onClick={handleRetry}
                className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg transition cursor-pointer"
              >
                Thử lại nước cờ
              </button>
            )}

            {!showHint && status === 'playing' && (
              <button
                onClick={() => setShowHint(true)}
                className="w-full py-2 bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-stone-200 text-xs rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                Xem gợi ý
              </button>
            )}

            {status === 'completed' && (
              <button
                onClick={handleNextPuzzle}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                Bài tiếp theo
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
