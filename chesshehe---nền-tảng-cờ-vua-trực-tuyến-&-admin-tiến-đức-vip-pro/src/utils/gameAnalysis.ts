import { Chess } from 'chess.js';
import { GameAnalysisReport, AnalyzedMove, MoveQuality, PieceColor } from '../types';
import { evaluateBoard, getAiBestMove } from './chessEngine';
import { CHESS_OPENINGS } from '../data/openingsData';

/**
 * Calculates accuracy percentage based on centipawn loss
 */
function calculateAccuracy(lossList: number[]): number {
  if (lossList.length === 0) return 95.0;
  // Weighted harmonic conversion
  const avgLoss = lossList.reduce((a, b) => a + b, 0) / lossList.length;
  // CAPS-like model: loss 0 -> 98%, loss 50 -> 85%, loss 100 -> 72%, loss 200 -> 50%
  const acc = 100 / (1 + Math.exp((avgLoss - 70) / 45));
  return Math.max(25, Math.min(99.4, Math.round(acc * 10) / 10));
}

/**
 * Detects opening from initial moves
 */
export function identifyOpening(movesSan: string[]): { name: string; eco: string } | null {
  let bestMatch: { name: string; eco: string; length: number } | null = null;

  for (const opening of CHESS_OPENINGS) {
    if (opening.moves.length <= movesSan.length) {
      let matches = true;
      for (let i = 0; i < opening.moves.length; i++) {
        if (opening.moves[i] !== movesSan[i]) {
          matches = false;
          break;
        }
      }
      if (matches && (!bestMatch || opening.moves.length > bestMatch.length)) {
        bestMatch = {
          name: opening.vietnameseName || opening.name,
          eco: opening.eco,
          length: opening.moves.length,
        };
      }
    }
  }

  return bestMatch ? { name: bestMatch.name, eco: bestMatch.eco } : null;
}

/**
 * Performs full game analysis on a sequence of moves
 */
export async function analyzeGameMoves(
  movesSan: string[],
  whitePlayerName = 'Trắng',
  blackPlayerName = 'Đen'
): Promise<GameAnalysisReport> {
  const game = new Chess();
  const analyzedMoves: AnalyzedMove[] = [];
  const evalGraph: number[] = [0]; // Initial position is 0.0

  const whiteLosses: number[] = [];
  const blackLosses: number[] = [];

  const whiteSummary: Record<MoveQuality, number> = {
    brilliant: 0,
    great: 0,
    best: 0,
    excellent: 0,
    good: 0,
    book: 0,
    inaccuracy: 0,
    mistake: 0,
    blunder: 0,
  };

  const blackSummary: Record<MoveQuality, number> = {
    brilliant: 0,
    great: 0,
    best: 0,
    excellent: 0,
    good: 0,
    book: 0,
    inaccuracy: 0,
    mistake: 0,
    blunder: 0,
  };

  const detectedOpening = identifyOpening(movesSan);
  const bookMovesCount = detectedOpening ? CHESS_OPENINGS.find(o => o.eco === detectedOpening.eco)?.moves.length || 0 : 0;

  for (let i = 0; i < movesSan.length; i++) {
    const san = movesSan[i];
    const turnColor = game.turn();
    const isWhite = turnColor === 'w';

    // Eval before move from White's perspective
    const evalBefore = evaluateBoard(game) / 100;

    let moveObj: any = null;
    try {
      moveObj = game.move(san);
    } catch {
      break;
    }

    if (!moveObj) break;

    const evalAfter = evaluateBoard(game) / 100;
    evalGraph.push(evalAfter);

    // Compute player advantage delta
    // From player's perspective: before vs after
    const playerEvalBefore = isWhite ? evalBefore : -evalBefore;
    const playerEvalAfter = isWhite ? evalAfter : -evalAfter;
    const diff = playerEvalBefore - playerEvalAfter; // loss in advantage
    const cpLoss = Math.max(0, Math.round(diff * 100));

    if (isWhite) whiteLosses.push(cpLoss);
    else blackLosses.push(cpLoss);

    let quality: MoveQuality = 'good';
    let commentary: string | undefined;
    let bestAlternative: string | undefined;

    // Check for book moves in opening
    if (i < bookMovesCount) {
      quality = 'book';
      commentary = 'Nước đi lý thuyết chuẩn trong sách khai cuộc.';
    } else if (moveObj.captured && ['q', 'r'].includes(moveObj.piece) && playerEvalAfter >= playerEvalBefore + 1.2) {
      // Brilliant sacrifice!
      quality = 'brilliant';
      commentary = 'Nước thí quân kiệt xuất mang lại ưu thế quyết định!';
    } else if (cpLoss <= 15) {
      quality = 'best';
      commentary = 'Nước đi tối ưu nhất theo đánh giá của động cơ.';
    } else if (cpLoss <= 40) {
      quality = 'excellent';
      commentary = 'Nước đi rất chính xác, duy trì thế trận mạnh mẽ.';
    } else if (cpLoss <= 80) {
      quality = 'good';
      commentary = 'Nước đi ổn định, duy trì nhịp độ trận đấu.';
    } else if (cpLoss <= 160) {
      quality = 'inaccuracy';
      commentary = 'Nước đi thiếu chính xác, để mất một phần quyền chủ động.';
    } else if (cpLoss <= 320) {
      quality = 'mistake';
      commentary = 'Nước đi sai lầm làm suy yếu cấu trúc hoặc mất ưu thế.';
    } else {
      quality = 'blunder';
      commentary = 'Sai sót cẩu thả nghiêm trọng! Làm thay đổi cục diện ván cờ.';
    }

    // Tally summary
    if (isWhite) whiteSummary[quality]++;
    else blackSummary[quality]++;

    analyzedMoves.push({
      moveNumber: Math.floor(i / 2) + 1,
      san,
      from: moveObj.from,
      to: moveObj.to,
      color: turnColor,
      evalBefore,
      evalAfter,
      quality,
      bestAlternative,
      commentary,
      fen: game.fen(),
    });
  }

  const whiteAccuracy = calculateAccuracy(whiteLosses);
  const blackAccuracy = calculateAccuracy(blackLosses);

  return {
    id: `analysis_${Date.now()}`,
    whiteAccuracy,
    blackAccuracy,
    whitePlayer: whitePlayerName,
    blackPlayer: blackPlayerName,
    moves: analyzedMoves,
    evalGraph,
    openingName: detectedOpening?.name,
    openingEco: detectedOpening?.eco,
    summary: {
      white: whiteSummary,
      black: blackSummary,
    },
  };
}
