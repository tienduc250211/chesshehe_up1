import React, { useState, useEffect } from 'react';
import { Chess, Square } from 'chess.js';
import { PieceColor, PieceType, BoardThemeKey } from '../types';
import { ChessPieceIcon } from './ChessPieces';
import { BOARD_THEMES, getSavedBoardTheme } from '../utils/boardThemes';

interface ChessBoardProps {
  game: Chess;
  orientation?: PieceColor; // 'w' or 'b'
  onMove?: (from: Square, to: Square, promotion?: PieceType) => boolean;
  disabled?: boolean;
  lastMove?: { from: string; to: string } | null;
  evalScore?: number | null; // e.g. +1.5 or -2.0
  themeKey?: BoardThemeKey;
  highlightSquares?: { [square: string]: string }; // e.g. { 'e4': 'border-2 border-emerald-400' }
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  game,
  orientation = 'w',
  onMove,
  disabled = false,
  lastMove = null,
  evalScore = null,
  themeKey,
  highlightSquares,
}) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);
  const [currentThemeKey, setCurrentThemeKey] = useState<BoardThemeKey>(themeKey || getSavedBoardTheme());

  useEffect(() => {
    if (themeKey) {
      setCurrentThemeKey(themeKey);
    } else {
      const handleStorage = () => {
        setCurrentThemeKey(getSavedBoardTheme());
      };
      window.addEventListener('storage', handleStorage);
      return () => window.removeEventListener('storage', handleStorage);
    }
  }, [themeKey]);

  const activeTheme = BOARD_THEMES[currentThemeKey] || BOARD_THEMES.green;

  const isFlipped = orientation === 'b';
  const ranks = isFlipped ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];
  const files = isFlipped ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  // Compute legal destination squares for the currently selected square
  const legalMovesForSelected = React.useMemo(() => {
    if (!selectedSquare || disabled) return [];
    try {
      const moves = game.moves({ square: selectedSquare, verbose: true });
      return moves.map((m) => m.to as Square);
    } catch {
      return [];
    }
  }, [selectedSquare, game, disabled]);

  // Check if king is in check
  const kingInCheckSquare = React.useMemo(() => {
    if (!game.inCheck()) return null;
    const currentTurn = game.turn();
    const board = game.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.type === 'k' && p.color === currentTurn) {
          const file = String.fromCharCode(97 + c);
          const rank = String(8 - r);
          return `${file}${rank}` as Square;
        }
      }
    }
    return null;
  }, [game]);

  const handleSquareClick = (square: Square) => {
    if (disabled || pendingPromotion) return;

    // If no square is selected yet
    if (!selectedSquare) {
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
      }
      return;
    }

    // If clicking the same square, deselect
    if (selectedSquare === square) {
      setSelectedSquare(null);
      return;
    }

    // If clicking another piece of the same color, switch selection
    const targetPiece = game.get(square);
    if (targetPiece && targetPiece.color === game.turn()) {
      setSelectedSquare(square);
      return;
    }

    // Check if the move is legal
    if (legalMovesForSelected.includes(square)) {
      const sourcePiece = game.get(selectedSquare);
      const isPawn = sourcePiece && sourcePiece.type === 'p';
      const isPromotionRank = (sourcePiece?.color === 'w' && square.endsWith('8')) ||
                              (sourcePiece?.color === 'b' && square.endsWith('1'));

      if (isPawn && isPromotionRank) {
        setPendingPromotion({ from: selectedSquare, to: square });
        return;
      }

      if (onMove) {
        onMove(selectedSquare, square);
      }
      setSelectedSquare(null);
    } else {
      setSelectedSquare(null);
    }
  };

  const handlePromotionSelect = (pieceType: PieceType) => {
    if (!pendingPromotion) return;
    if (onMove) {
      onMove(pendingPromotion.from, pendingPromotion.to, pieceType);
    }
    setPendingPromotion(null);
    setSelectedSquare(null);
  };

  // Evaluation bar height clamp (-10 to +10)
  const evalPercentage = React.useMemo(() => {
    if (evalScore === null || evalScore === undefined) return 50;
    const clamped = Math.max(-10, Math.min(10, evalScore));
    return 50 + (clamped / 20) * 100 * 0.45;
  }, [evalScore]);

  return (
    <div className="relative flex items-center justify-center select-none">
      {/* Evaluation bar on left if provided */}
      {evalScore !== null && (
        <div className="hidden sm:flex flex-col items-center mr-3 h-[min(80vw,560px)] w-4 rounded overflow-hidden bg-zinc-800 border border-zinc-700/80 shadow-inner">
          <div
            className="w-full bg-zinc-100 transition-all duration-300 ease-out"
            style={{ height: `${evalPercentage}%` }}
          />
          <div className="w-full bg-zinc-900 flex-1" />
        </div>
      )}

      {/* Main Board Container */}
      <div className="relative w-[min(90vw,560px)] h-[min(90vw,560px)] rounded-lg shadow-xl border-4 border-stone-800/80 bg-stone-800 overflow-hidden">
        <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
          {ranks.map((rank, rankIdx) =>
            files.map((file, fileIdx) => {
              const square = `${file}${rank}` as Square;
              const isLightSquare = (rank + file.charCodeAt(0)) % 2 !== 0;
              const piece = game.get(square);

              const isSelected = selectedSquare === square;
              const isLegalTarget = legalMovesForSelected.includes(square);
              const isLastMoveSquare = lastMove && (lastMove.from === square || lastMove.to === square);
              const isKingInCheck = kingInCheckSquare === square;

              // Color configuration from activeTheme
              let squareColor = isLightSquare ? activeTheme.lightSquare : activeTheme.darkSquare;
              if (isLastMoveSquare) {
                squareColor = isLightSquare ? activeTheme.lastMoveLight : activeTheme.lastMoveDark;
              }
              if (isSelected) {
                squareColor = activeTheme.selectedColor;
              }

              const customHighlightClass = highlightSquares?.[square] || '';

              return (
                <div
                  key={square}
                  id={`square-${square}`}
                  onClick={() => handleSquareClick(square)}
                  style={{ backgroundColor: squareColor }}
                  className={`relative flex items-center justify-center cursor-pointer transition-colors duration-100 ${customHighlightClass}`}
                >
                  {/* King Check Glow */}
                  {isKingInCheck && (
                    <div className="absolute inset-0 bg-red-500/60 rounded-full animate-pulse blur-xs" />
                  )}

                  {/* Chess Piece Vector */}
                  {piece && (
                    <div className="relative z-10 w-[86%] h-[86%] flex items-center justify-center drop-shadow transition-transform active:scale-95">
                      <ChessPieceIcon type={piece.type} color={piece.color} />
                    </div>
                  )}

                  {/* Legal Move Indicators */}
                  {isLegalTarget && !piece && (
                    <div className="absolute z-20 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-stone-900/30 hover:bg-stone-900/50 transition-all pointer-events-none" />
                  )}

                  {isLegalTarget && piece && (
                    <div className="absolute z-20 inset-0 border-4 border-red-500/50 rounded-sm pointer-events-none" />
                  )}

                  {/* Rank Coordinates on first column */}
                  {fileIdx === 0 && (
                    <span
                      style={{ color: isLightSquare ? activeTheme.darkSquare : activeTheme.lightSquare }}
                      className="absolute top-0.5 left-1 text-[10px] font-bold select-none opacity-80"
                    >
                      {rank}
                    </span>
                  )}

                  {/* File Coordinates on bottom row */}
                  {rankIdx === 7 && (
                    <span
                      style={{ color: isLightSquare ? activeTheme.darkSquare : activeTheme.lightSquare }}
                      className="absolute bottom-0.5 right-1 text-[10px] font-bold select-none opacity-80"
                    >
                      {file}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Promotion Dialog Modal */}
        {pendingPromotion && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-stone-900 text-white rounded-xl p-5 shadow-2xl border border-stone-700 max-w-xs w-full text-center">
              <h3 className="text-sm font-medium tracking-wide uppercase text-stone-300 mb-3">
                Phong cấp tốt (Pawn Promotion)
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {(['q', 'r', 'b', 'n'] as PieceType[]).map((pType) => (
                  <button
                    key={pType}
                    onClick={() => handlePromotionSelect(pType)}
                    className="p-3 bg-stone-800 hover:bg-stone-700 active:bg-amber-600 rounded-lg flex items-center justify-center transition-all border border-stone-600/50 hover:border-amber-400"
                  >
                    <div className="w-10 h-10">
                      <ChessPieceIcon type={pType} color={game.turn()} />
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPendingPromotion(null)}
                className="mt-4 text-xs text-stone-400 hover:text-white underline cursor-pointer"
              >
                Hủy nước đi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
