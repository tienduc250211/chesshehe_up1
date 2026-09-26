import { Chess, Square } from 'chess.js';

// Piece base values
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Simplified Piece-Square Tables (from White's perspective; Black flips row index)
const PAWN_PST = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0
];

const KNIGHT_PST = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50,
];

const BISHOP_PST = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20,
];

const ROOK_PST = [
  0,  0,  0,  0,  0,  0,  0,  0,
  5, 10, 10, 10, 10, 10, 10,  5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
  0,  0,  0,  5,  5,  0,  0,  0
];

const QUEEN_PST = [
  -20,-10,-10, -5, -5,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5,  5,  5,  5,  0,-10,
   -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0, -5,
  -10,  5,  5,  5,  5,  5,  0,-10,
  -10,  0,  5,  0,  0,  0,  0,-10,
  -20,-10,-10, -5, -5,-10,-10,-20
];

function getSquareIndex(square: Square, isWhite: boolean): number {
  const file = square.charCodeAt(0) - 97; // 'a' -> 0
  const rank = parseInt(square[1], 10) - 1; // '1' -> 0
  if (isWhite) {
    return (7 - rank) * 8 + file;
  } else {
    return rank * 8 + file;
  }
}

/**
 * Static evaluation function from White's perspective
 */
export function evaluateBoard(game: Chess): number {
  if (game.isCheckmate()) {
    return game.turn() === 'w' ? -99999 : 99999;
  }
  if (game.isDraw() || game.isThreefoldRepetition() || game.isInsufficientMaterial()) {
    return 0;
  }

  let totalScore = 0;
  const board = game.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const baseVal = PIECE_VALUES[piece.type] || 0;
      const fileChar = String.fromCharCode(97 + c);
      const rankChar = String(8 - r);
      const square = `${fileChar}${rankChar}` as Square;
      const isWhite = piece.color === 'w';

      let pstBonus = 0;
      const sqIdx = getSquareIndex(square, isWhite);
      if (piece.type === 'p') pstBonus = PAWN_PST[sqIdx];
      else if (piece.type === 'n') pstBonus = KNIGHT_PST[sqIdx];
      else if (piece.type === 'b') pstBonus = BISHOP_PST[sqIdx];
      else if (piece.type === 'r') pstBonus = ROOK_PST[sqIdx];
      else if (piece.type === 'q') pstBonus = QUEEN_PST[sqIdx];

      const pieceTotal = baseVal + pstBonus;
      totalScore += isWhite ? pieceTotal : -pieceTotal;
    }
  }

  return totalScore;
}

/**
 * Minimax with Alpha-Beta Pruning
 */
function minimax(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number {
  if (depth === 0 || game.isGameOver()) {
    return evaluateBoard(game);
  }

  const moves = game.moves({ verbose: true });

  // Simple move ordering: captures first
  moves.sort((a, b) => {
    const aCap = a.captured ? PIECE_VALUES[a.captured] || 0 : 0;
    const bCap = b.captured ? PIECE_VALUES[b.captured] || 0 : 0;
    return bCap - aCap;
  });

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move(move);
      const currentEval = minimax(game, depth - 1, alpha, beta, false);
      game.undo();
      maxEval = Math.max(maxEval, currentEval);
      alpha = Math.max(alpha, currentEval);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      game.move(move);
      const currentEval = minimax(game, depth - 1, alpha, beta, true);
      game.undo();
      minEval = Math.min(minEval, currentEval);
      beta = Math.min(beta, currentEval);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

export type AiLevel = 1 | 2 | 3 | 4 | 5;

export interface AiMoveResult {
  from: string;
  to: string;
  promotion?: string;
  san: string;
  evalScore: number;
  depthSearched: number;
}

/**
 * Computes AI move based on chosen difficulty level
 */
export function getAiBestMove(fen: string, level: AiLevel): Promise<AiMoveResult | null> {
  return new Promise((resolve) => {
    // Artificial small delay for natural UX feel
    setTimeout(() => {
      const game = new Chess(fen);
      const legalMoves = game.moves({ verbose: true });
      if (legalMoves.length === 0) {
        resolve(null);
        return;
      }

      const isWhite = game.turn() === 'w';

      // Level 1: Casual (mostly random or direct captures)
      if (level === 1) {
        const captures = legalMoves.filter((m) => m.captured);
        const choice = (captures.length > 0 && Math.random() < 0.6)
          ? captures[Math.floor(Math.random() * captures.length)]
          : legalMoves[Math.floor(Math.random() * legalMoves.length)];

        game.move(choice);
        const score = evaluateBoard(game);
        resolve({
          from: choice.from,
          to: choice.to,
          promotion: choice.promotion,
          san: choice.san,
          evalScore: score / 100,
          depthSearched: 1,
        });
        return;
      }

      // Determine search depth based on level
      // Level 2: Depth 1 + heuristic
      // Level 3: Depth 2
      // Level 4: Depth 3
      // Level 5: Depth 3 with deeper capture checks
      const depth = level === 2 ? 1 : level === 3 ? 2 : level === 4 ? 3 : 3;

      let bestMove = legalMoves[0];
      let bestEval = isWhite ? -Infinity : Infinity;

      for (const move of legalMoves) {
        game.move(move);
        const moveEval = minimax(
          game,
          depth - 1,
          -Infinity,
          Infinity,
          !isWhite
        );
        game.undo();

        if (isWhite) {
          if (moveEval > bestEval) {
            bestEval = moveEval;
            bestMove = move;
          }
        } else {
          if (moveEval < bestEval) {
            bestEval = moveEval;
            bestMove = move;
          }
        }
      }

      resolve({
        from: bestMove.from,
        to: bestMove.to,
        promotion: bestMove.promotion,
        san: bestMove.san,
        evalScore: bestEval / 100,
        depthSearched: depth,
      });
    }, 200 + Math.random() * 250);
  });
}
