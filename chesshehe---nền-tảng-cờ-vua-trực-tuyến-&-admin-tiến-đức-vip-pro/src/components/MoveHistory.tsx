import React from 'react';
import { Chess } from 'chess.js';
import { PieceType, PieceColor } from '../types';
import { ChessPieceIcon } from './ChessPieces';

interface MoveHistoryProps {
  game: Chess;
  onUndo?: () => void;
  canUndo?: boolean;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({
  game,
  onUndo,
  canUndo = false,
}) => {
  const history = game.history({ verbose: true });

  // Calculate captured pieces
  const capturedPieces: { whiteCaptures: PieceType[]; blackCaptures: PieceType[] } = React.useMemo(() => {
    const whiteCaps: PieceType[] = [];
    const blackCaps: PieceType[] = [];

    history.forEach((m) => {
      if (m.captured) {
        if (m.color === 'w') {
          whiteCaps.push(m.captured as PieceType);
        } else {
          blackCaps.push(m.captured as PieceType);
        }
      }
    });

    return { whiteCaptures: whiteCaps, blackCaptures: blackCaps };
  }, [history]);

  // Compute piece values difference
  const pieceScores: Record<PieceType, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  const whiteScore = capturedPieces.whiteCaptures.reduce((acc, p) => acc + pieceScores[p], 0);
  const blackScore = capturedPieces.blackCaptures.reduce((acc, p) => acc + pieceScores[p], 0);
  const materialAdvantage = whiteScore - blackScore;

  // Group moves into pairs (White move, Black move)
  const movePairs: { num: number; white: string; black?: string }[] = [];
  for (let i = 0; i < history.length; i += 2) {
    movePairs.push({
      num: Math.floor(i / 2) + 1,
      white: history[i].san,
      black: history[i + 1]?.san,
    });
  }

  const handleCopyPgn = () => {
    navigator.clipboard.writeText(game.pgn());
    alert('Đã sao chép chuỗi PGN của ván đấu vào bộ nhớ tạm!');
  };

  const handleCopyFen = () => {
    navigator.clipboard.writeText(game.fen());
    alert('Đã sao chép chuỗi FEN của thế cờ vào bộ nhớ tạm!');
  };

  return (
    <div className="flex flex-col h-full bg-stone-900 border border-stone-800 rounded-lg overflow-hidden">
      {/* Captured Pieces Header */}
      <div className="px-3 py-2 border-b border-stone-800 bg-stone-950/70 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-stone-400 font-mono">Đen mất:</span>
            {capturedPieces.whiteCaptures.map((p, idx) => (
              <div key={idx} className="w-4 h-4 inline-block">
                <ChessPieceIcon type={p} color="b" />
              </div>
            ))}
            {materialAdvantage > 0 && (
              <span className="text-amber-400 font-bold ml-1 font-mono">+{materialAdvantage}</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-stone-400 font-mono">Trắng mất:</span>
            {capturedPieces.blackCaptures.map((p, idx) => (
              <div key={idx} className="w-4 h-4 inline-block">
                <ChessPieceIcon type={p} color="w" />
              </div>
            ))}
            {materialAdvantage < 0 && (
              <span className="text-amber-400 font-bold ml-1 font-mono">+{Math.abs(materialAdvantage)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Notation List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5 text-xs font-mono">
        {movePairs.length === 0 ? (
          <div className="text-stone-500 text-center py-6 italic">
            Chưa có nước đi nào. Hãy bắt đầu ván cờ!
          </div>
        ) : (
          movePairs.map((pair) => (
            <div
              key={pair.num}
              className="grid grid-cols-12 py-1 px-2 rounded hover:bg-stone-800/60 transition-colors"
            >
              <span className="col-span-2 text-stone-500 font-medium">
                {pair.num}.
              </span>
              <span className="col-span-5 font-semibold text-stone-200">
                {pair.white}
              </span>
              <span className="col-span-5 font-semibold text-stone-300">
                {pair.black || ''}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Move Actions & Export */}
      <div className="p-2 border-t border-stone-800 bg-stone-950/60 flex items-center justify-between gap-2">
        {canUndo && (
          <button
            onClick={onUndo}
            className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded text-xs font-medium transition cursor-pointer"
          >
            Đi lại (Undo)
          </button>
        )}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            onClick={handleCopyFen}
            className="px-2 py-1 bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-stone-200 rounded text-[11px] transition cursor-pointer"
            title="Copy FEN notation"
          >
            Copy FEN
          </button>
          <button
            onClick={handleCopyPgn}
            className="px-2 py-1 bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-stone-200 rounded text-[11px] transition cursor-pointer"
            title="Copy PGN notation"
          >
            Copy PGN
          </button>
        </div>
      </div>
    </div>
  );
};
