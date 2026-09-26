import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chess, Square } from 'chess.js';
import { PieceColor, PieceType } from '../types';
import { ChessBoard } from './ChessBoard';
import { MoveHistory } from './MoveHistory';
import { ChessClock } from './ChessClock';
import { getAiBestMove, AiLevel } from '../utils/chessEngine';
import { soundFx } from '../utils/soundEffects';
import { recordMatch } from '../utils/historyStorage';
import {
  Bot,
  RotateCcw,
  Play,
  Trophy,
  Zap,
  Shield,
  Clock,
  Crown,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface AiGameViewProps {
  userElo: number;
  initialOpponentIsAdmin?: boolean;
}

export type AiTimeControl = 'infinite' | '1+0' | '3+0' | '3+2' | '5+0' | '10+0' | '15+10';

export const AiGameView: React.FC<AiGameViewProps> = ({
  userElo,
  initialOpponentIsAdmin = false,
}) => {
  const [game, setGame] = useState(() => new Chess());
  const [playerColor, setPlayerColor] = useState<PieceColor>('w');
  const [aiLevel, setAiLevel] = useState<AiLevel>(3);
  const [isBossMode, setIsBossMode] = useState<boolean>(initialOpponentIsAdmin);
  const [timeControl, setTimeControl] = useState<AiTimeControl>('3+2');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [evalScore, setEvalScore] = useState<number | null>(0);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [gameOverInfo, setGameOverInfo] = useState<{ title: string; subtitle: string; isWin: boolean } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Time Clocks State (milliseconds)
  const [whiteTimeMs, setWhiteTimeMs] = useState<number>(3 * 60 * 1000);
  const [blackTimeMs, setBlackTimeMs] = useState<number>(3 * 60 * 1000);
  const [gameStarted, setGameStarted] = useState(false);

  const lastTickRef = useRef<number>(Date.now());

  // Time control details
  const getTimeControlConfig = useCallback((tc: AiTimeControl) => {
    switch (tc) {
      case '1+0': return { baseMinutes: 1, incrementSeconds: 0 };
      case '3+0': return { baseMinutes: 3, incrementSeconds: 0 };
      case '3+2': return { baseMinutes: 3, incrementSeconds: 2 };
      case '5+0': return { baseMinutes: 5, incrementSeconds: 0 };
      case '10+0': return { baseMinutes: 10, incrementSeconds: 0 };
      case '15+10': return { baseMinutes: 15, incrementSeconds: 10 };
      case 'infinite':
      default:
        return { baseMinutes: 0, incrementSeconds: 0 };
    }
  }, []);

  // Sync sound setting
  useEffect(() => {
    soundFx.enabled = soundEnabled;
  }, [soundEnabled]);

  const checkGameOver = useCallback((g: Chess) => {
    if (g.isCheckmate()) {
      const winner = g.turn() === 'w' ? 'b' : 'w';
      const isWin = winner === playerColor;
      soundFx.playVictorySound();
      const reason = isWin
        ? `Chiếu hết thắng lợi tại nước ${Math.ceil(g.history().length / 2)}`
        : `Bị đối thủ chiếu hết tại nước ${Math.ceil(g.history().length / 2)}`;

      recordMatch({
        gameMode: 'ai',
        timeControl: timeControl === 'infinite' ? 'Không giới hạn' : `${timeControl} Blitz`,
        opponentName: isBossMode ? 'Tiến Đức VIP Pro (GM)' : `Stockfish Cấp ${aiLevel}`,
        opponentElo: isBossMode ? 2950 : [800, 1200, 1600, 1900, 2300][aiLevel - 1],
        myColor: playerColor,
        result: isWin ? 'win' : 'loss',
        reason,
        eloChange: isWin ? +12 : -8,
        movesCount: Math.ceil(g.history().length / 2),
        finalFen: g.fen(),
      });

      setGameOverInfo({
        title: isWin ? 'Chiến thắng vang dội!' : 'Chiếu hết! Bạn đã thua.',
        subtitle: isWin
          ? isBossMode
            ? 'Bạn đã xuất sắc đánh bại Siêu Đại Kiện Tướng Tiến Đức VIP Pro (2950 Elo)!'
            : `Bạn đã đánh bại Stockfish AI Cấp độ ${aiLevel}!`
          : isBossMode
          ? 'Tiến Đức VIP Pro đã tung đòn chiếu hết tuyệt đỉnh!'
          : 'Máy tính đã chiếu hết thành công.',
        isWin,
      });
    } else if (g.isDraw()) {
      const reason = g.isStalemate()
        ? 'Hòa do hết nước đi hợp lệ (Stalemate)'
        : g.isThreefoldRepetition()
        ? 'Hòa do lặp lại thế cờ 3 lần'
        : 'Hòa do thiếu lực lượng chiếu hết';

      recordMatch({
        gameMode: 'ai',
        timeControl: timeControl === 'infinite' ? 'Không giới hạn' : `${timeControl} Blitz`,
        opponentName: isBossMode ? 'Tiến Đức VIP Pro (GM)' : `Stockfish Cấp ${aiLevel}`,
        opponentElo: isBossMode ? 2950 : [800, 1200, 1600, 1900, 2300][aiLevel - 1],
        myColor: playerColor,
        result: 'draw',
        reason,
        eloChange: 0,
        movesCount: Math.ceil(g.history().length / 2),
        finalFen: g.fen(),
      });

      setGameOverInfo({
        title: 'Ván cờ hòa (Draw)',
        subtitle: reason,
        isWin: false,
      });
    }
  }, [aiLevel, isBossMode, playerColor, timeControl]);

  // AI Turn Trigger
  const triggerAiTurn = useCallback(async (currentGame: Chess) => {
    if (currentGame.isGameOver()) return;
    if (currentGame.turn() !== playerColor) {
      setIsAiThinking(true);
      // Boss level plays at level 5 with deeper evaluation
      const effectiveLevel = isBossMode ? 5 : aiLevel;
      const aiResult = await getAiBestMove(currentGame.fen(), effectiveLevel);
      setIsAiThinking(false);

      if (aiResult) {
        try {
          const move = currentGame.move({
            from: aiResult.from,
            to: aiResult.to,
            promotion: (aiResult.promotion as PieceType) || 'q',
          });
          if (move) {
            soundFx.playMoveSound();
            setLastMove({ from: move.from, to: move.to });
            setEvalScore(aiResult.evalScore);

            // Add increment to AI
            const { incrementSeconds } = getTimeControlConfig(timeControl);
            if (timeControl !== 'infinite' && incrementSeconds > 0) {
              if (playerColor === 'w') {
                setBlackTimeMs((t) => t + incrementSeconds * 1000);
              } else {
                setWhiteTimeMs((t) => t + incrementSeconds * 1000);
              }
            }

            const updated = new Chess(currentGame.fen());
            setGame(updated);
            checkGameOver(updated);
            lastTickRef.current = Date.now();
          }
        } catch (e) {
          console.error('AI Move error:', e);
        }
      }
    }
  }, [playerColor, aiLevel, isBossMode, timeControl, getTimeControlConfig, checkGameOver]);

  // Handle Player Move
  const handlePlayerMove = (from: Square, to: Square, promotion?: PieceType): boolean => {
    if (game.turn() !== playerColor || isAiThinking || game.isGameOver() || Boolean(gameOverInfo)) {
      return false;
    }

    try {
      const move = game.move({
        from,
        to,
        promotion: promotion || 'q',
      });

      if (move) {
        soundFx.playMoveSound();
        setGameStarted(true);
        setLastMove({ from: move.from, to: move.to });

        // Add increment to player
        const { incrementSeconds } = getTimeControlConfig(timeControl);
        if (timeControl !== 'infinite' && incrementSeconds > 0) {
          if (playerColor === 'w') {
            setWhiteTimeMs((t) => t + incrementSeconds * 1000);
          } else {
            setBlackTimeMs((t) => t + incrementSeconds * 1000);
          }
        }

        const updatedGame = new Chess(game.fen());
        setGame(updatedGame);
        checkGameOver(updatedGame);
        lastTickRef.current = Date.now();

        // Schedule AI move
        if (!updatedGame.isGameOver()) {
          setTimeout(() => triggerAiTurn(updatedGame), 150);
        }
        return true;
      }
    } catch {
      return false;
    }
    return false;
  };

  // Clock Countdown Interval
  useEffect(() => {
    if (timeControl === 'infinite' || !gameStarted || game.isGameOver() || Boolean(gameOverInfo)) {
      return;
    }

    lastTickRef.current = Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;

      const currentTurn = game.turn();
      if (currentTurn === 'w') {
        setWhiteTimeMs((prev) => {
          const next = prev - delta;
          if (next <= 0) {
            clearInterval(interval);
            const isWin = playerColor === 'b';
            soundFx.playVictorySound();
            recordMatch({
              gameMode: 'ai',
              timeControl: `${timeControl} Blitz`,
              opponentName: isBossMode ? 'Tiến Đức VIP Pro (GM)' : `Stockfish Cấp ${aiLevel}`,
              opponentElo: isBossMode ? 2950 : [800, 1200, 1600, 1900, 2300][aiLevel - 1],
              myColor: playerColor,
              result: isWin ? 'win' : 'loss',
              reason: isWin ? 'Đối thủ đã hết thời gian trước (Timeout)' : 'Bạn đã để hết thời gian (Timeout)',
              eloChange: isWin ? +12 : -8,
              movesCount: Math.ceil(game.history().length / 2),
              finalFen: game.fen(),
            });
            setGameOverInfo({
              title: isWin ? 'Chiến Thắng!' : 'Hết Giờ! Bạn đã thua.',
              subtitle: isWin
                ? 'Đối thủ đã hết thời gian trước!'
                : 'Bạn đã để hết thời gian (Timeout).',
              isWin,
            });
            return 0;
          }
          if (next < 10000 && Math.floor(next / 1000) !== Math.floor(prev / 1000) && playerColor === 'w') {
            soundFx.playLowTimeWarning();
          }
          return next;
        });
      } else {
        setBlackTimeMs((prev) => {
          const next = prev - delta;
          if (next <= 0) {
            clearInterval(interval);
            const isWin = playerColor === 'w';
            soundFx.playVictorySound();
            recordMatch({
              gameMode: 'ai',
              timeControl: `${timeControl} Blitz`,
              opponentName: isBossMode ? 'Tiến Đức VIP Pro (GM)' : `Stockfish Cấp ${aiLevel}`,
              opponentElo: isBossMode ? 2950 : [800, 1200, 1600, 1900, 2300][aiLevel - 1],
              myColor: playerColor,
              result: isWin ? 'win' : 'loss',
              reason: isWin ? 'Đối thủ đã hết thời gian trước (Timeout)' : 'Bạn đã để hết thời gian (Timeout)',
              eloChange: isWin ? +12 : -8,
              movesCount: Math.ceil(game.history().length / 2),
              finalFen: game.fen(),
            });
            setGameOverInfo({
              title: isWin ? 'Chiến Thắng!' : 'Hết Giờ! Bạn đã thua.',
              subtitle: isWin
                ? 'Đối thủ đã hết thời gian trước!'
                : 'Bạn đã để hết thời gian (Timeout).',
              isWin,
            });
            return 0;
          }
          if (next < 10000 && Math.floor(next / 1000) !== Math.floor(prev / 1000) && playerColor === 'b') {
            soundFx.playLowTimeWarning();
          }
          return next;
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [gameStarted, game, timeControl, gameOverInfo, playerColor]);

  // Start new game
  const handleStartNewGame = (color: PieceColor = playerColor, tc: AiTimeControl = timeControl) => {
    const newG = new Chess();
    setGame(newG);
    setPlayerColor(color);
    setLastMove(null);
    setEvalScore(0);
    setGameOverInfo(null);
    setGameStarted(false);

    const { baseMinutes } = getTimeControlConfig(tc);
    const initialMs = baseMinutes * 60 * 1000;
    setWhiteTimeMs(initialMs);
    setBlackTimeMs(initialMs);

    if (color === 'b') {
      setGameStarted(true);
      lastTickRef.current = Date.now();
      setTimeout(() => triggerAiTurn(newG), 250);
    }
  };

  const handleUndo = () => {
    if (isAiThinking || game.history().length < 2) return;
    game.undo(); // Undo AI
    game.undo(); // Undo Player
    const updated = new Chess(game.fen());
    setGame(updated);
    const history = updated.history({ verbose: true });
    setLastMove(history.length > 0 ? { from: history[history.length - 1].from, to: history[history.length - 1].to } : null);
    setGameOverInfo(null);
  };

  const levelConfigs = [
    { level: 1 as AiLevel, name: 'Cấp 1 - Người mới', elo: 800, desc: 'Nước đi cơ bản, hay sơ hở' },
    { level: 2 as AiLevel, name: 'Cấp 2 - Tập sự', elo: 1200, desc: 'Bảo vệ quân, biết ăn quân lợi thế' },
    { level: 3 as AiLevel, name: 'Cấp 3 - Trung cấp', elo: 1600, desc: 'Tính toán 2 nước, kiểm soát trung tâm' },
    { level: 4 as AiLevel, name: 'Cấp 4 - Nâng cao', elo: 1900, desc: 'Minimax 3 lớp, đánh chắc chắn' },
    { level: 5 as AiLevel, name: 'Cấp 5 - Kiện tướng', elo: 2300, desc: 'Trừng phạt sai lầm tối đa' },
  ];

  const opponentName = isBossMode ? 'Tiến Đức VIP Pro (GM)' : `Stockfish Cấp ${aiLevel}`;
  const opponentElo = isBossMode ? 2950 : levelConfigs[aiLevel - 1].elo;
  const opponentColor: PieceColor = playerColor === 'w' ? 'b' : 'w';

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto w-full items-start justify-center">
      {/* Board & Clocks Column */}
      <div className="flex flex-col items-center gap-3 w-full lg:w-auto">
        {/* Opponent Clock & Header */}
        <div className="w-[min(90vw,560px)] flex flex-col gap-1.5">
          {timeControl !== 'infinite' ? (
            <ChessClock
              timeMs={opponentColor === 'w' ? whiteTimeMs : blackTimeMs}
              isActive={game.turn() === opponentColor && !game.isGameOver()}
              color={opponentColor}
              playerName={opponentName}
              rating={opponentElo}
            />
          ) : (
            <div className="flex items-center justify-between px-3 py-2 bg-stone-900/90 border border-stone-800 rounded-lg text-xs">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                  isBossMode ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' : 'bg-stone-800 text-stone-300 border-stone-700'
                }`}>
                  {isBossMode ? <Crown className="w-4 h-4 text-amber-400" /> : <Bot className="w-4 h-4 text-amber-400" />}
                </div>
                <div>
                  <div className="font-semibold text-stone-200 flex items-center gap-1.5">
                    <span>{opponentName}</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-stone-800 text-amber-400 rounded font-mono font-bold">
                      {opponentElo} Elo
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-400">
                    {isAiThinking ? (
                      <span className="text-amber-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                        Đang tính toán nước đi...
                      </span>
                    ) : isBossMode ? (
                      <span className="text-amber-300">Siêu Đại Kiện Tướng • Tấn công bão táp</span>
                    ) : (
                      <span>{levelConfigs[aiLevel - 1].desc}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-mono tracking-wider text-stone-500 block">
                  Lượt đi
                </span>
                <span className="font-bold text-stone-300">
                  {game.turn() === playerColor ? 'Lượt của bạn' : 'Máy đang đi'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* The ChessBoard */}
        <ChessBoard
          game={game}
          orientation={playerColor}
          onMove={handlePlayerMove}
          disabled={isAiThinking || Boolean(gameOverInfo)}
          lastMove={lastMove}
          evalScore={evalScore}
        />

        {/* Player Clock & Footer */}
        <div className="w-[min(90vw,560px)] flex flex-col gap-1.5">
          {timeControl !== 'infinite' ? (
            <ChessClock
              timeMs={playerColor === 'w' ? whiteTimeMs : blackTimeMs}
              isActive={game.turn() === playerColor && !game.isGameOver()}
              color={playerColor}
              playerName="Bạn (Kỳ thủ)"
              rating={userElo}
            />
          ) : (
            <div className="flex items-center justify-between px-3 py-2 bg-stone-900/90 border border-stone-800 rounded-lg text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-600/20 flex items-center justify-center border border-amber-600/40">
                  <Shield className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <div className="font-semibold text-stone-200">
                    Bạn ({playerColor === 'w' ? 'Quân Trắng' : 'Quân Đen'})
                  </div>
                  <div className="text-[11px] text-stone-400 font-mono">
                    Elo của bạn: {userElo}
                  </div>
                </div>
              </div>

              {evalScore !== null && (
                <div className="text-right font-mono text-xs">
                  <span className="text-stone-400">Đánh giá thế cờ: </span>
                  <span className={`font-bold ${evalScore > 0 ? 'text-green-400' : evalScore < 0 ? 'text-red-400' : 'text-stone-300'}`}>
                    {evalScore > 0 ? `+${evalScore.toFixed(1)}` : evalScore.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Control Panel & Move History */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        {/* Game Settings Card */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex flex-col gap-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <h2 className="text-xs uppercase tracking-wider font-bold text-amber-400 flex items-center gap-1.5">
              <Bot className="w-4 h-4" />
              Cài đặt ván cờ & Thời gian
            </h2>
            <button
              onClick={() => setSoundEnabled((v) => !v)}
              className="text-stone-400 hover:text-stone-200 p-1 rounded"
              title="Bật/Tắt âm thanh"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5 text-stone-500" />}
            </button>
          </div>

          {/* Time Control Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-stone-300 font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Thời gian thi đấu (Chess Clock):
            </label>
            <select
              value={timeControl}
              onChange={(e) => {
                const tc = e.target.value as AiTimeControl;
                setTimeControl(tc);
                handleStartNewGame(playerColor, tc);
              }}
              className="w-full bg-stone-950 border border-stone-700 text-stone-200 text-xs rounded-md p-2 focus:ring-1 focus:ring-amber-500 outline-hidden font-mono"
            >
              <option value="infinite">Không giới hạn (Thư giãn)</option>
              <option value="1+0">1 phút (Bullet chớp nhoáng)</option>
              <option value="3+0">3 phút (Blitz tiêu chuẩn)</option>
              <option value="3+2">3+2s (Blitz FIDE bù giờ)</option>
              <option value="5+0">5 phút (Blitz trung bình)</option>
              <option value="10+0">10 phút (Rapid tiêu chuẩn)</option>
              <option value="15+10">15+10s (Classical phân tích)</option>
            </select>
          </div>

          {/* Opponent Selection (Boss Mode or AI Levels) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-stone-300 font-semibold flex items-center justify-between">
              <span>Đối thủ:</span>
              <button
                type="button"
                onClick={() => {
                  setIsBossMode((b) => !b);
                  handleStartNewGame(playerColor, timeControl);
                }}
                className={`text-[10px] px-2 py-0.5 rounded font-bold transition flex items-center gap-1 cursor-pointer ${
                  isBossMode
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'bg-stone-800 text-stone-400 hover:text-amber-300'
                }`}
              >
                <Crown className="w-3 h-3" />
                {isBossMode ? 'Đang đấu Tiến Đức VIP Pro' : 'Thách đấu Admin'}
              </button>
            </label>

            {isBossMode ? (
              <div className="p-2.5 rounded-lg bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-transparent border border-amber-500/40 text-xs flex items-center gap-2.5">
                <Crown className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <div className="font-bold text-amber-300">Tiến Đức VIP Pro (2950 Elo)</div>
                  <div className="text-[10px] text-stone-400">Siêu Đại Kiện Tướng • Tấn công tàn khốc</div>
                </div>
              </div>
            ) : (
              <select
                value={aiLevel}
                onChange={(e) => setAiLevel(Number(e.target.value) as AiLevel)}
                className="w-full bg-stone-950 border border-stone-700 text-stone-200 text-xs rounded-md p-2 focus:ring-1 focus:ring-amber-500 outline-hidden"
              >
                {levelConfigs.map((cfg) => (
                  <option key={cfg.level} value={cfg.level}>
                    {cfg.name} ({cfg.elo} Elo)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Color Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-stone-300 font-semibold">Chọn màu quân:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleStartNewGame('w', timeControl)}
                className={`py-1.5 px-3 rounded text-xs font-semibold border transition cursor-pointer ${
                  playerColor === 'w'
                    ? 'bg-stone-100 text-stone-900 border-stone-100 font-bold'
                    : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
                }`}
              >
                Cầm Trắng (Đi trước)
              </button>
              <button
                onClick={() => handleStartNewGame('b', timeControl)}
                className={`py-1.5 px-3 rounded text-xs font-semibold border transition cursor-pointer ${
                  playerColor === 'b'
                    ? 'bg-stone-950 text-stone-100 border-stone-500 font-bold'
                    : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
                }`}
              >
                Cầm Đen (Đi sau)
              </button>
            </div>
          </div>

          {/* Actions: New Game & Undo */}
          <div className="flex gap-2 pt-2 border-t border-stone-800">
            <button
              onClick={() => handleStartNewGame(playerColor, timeControl)}
              className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              Ván Mới
            </button>
            <button
              onClick={handleUndo}
              disabled={isAiThinking || game.history().length < 2}
              className="py-2 px-3 bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-300 rounded text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              title="Đi lại 1 nước"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Đi lại
            </button>
          </div>
        </div>

        {/* Move History Component */}
        <div className="h-72">
          <MoveHistory game={game} onUndo={handleUndo} canUndo={game.history().length >= 2 && !isAiThinking} />
        </div>
      </div>

      {/* Game Over Modal */}
      {gameOverInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
            <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-4 ${
              gameOverInfo.isWin ? 'bg-amber-500/20 text-amber-400' : 'bg-stone-800 text-stone-400'
            }`}>
              <Trophy className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-stone-100 mb-1">
              {gameOverInfo.title}
            </h3>
            <p className="text-xs text-stone-400 mb-6 leading-relaxed">
              {gameOverInfo.subtitle}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => handleStartNewGame(playerColor, timeControl)}
                className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-lg text-xs transition cursor-pointer"
              >
                Chơi ván mới
              </button>
              <button
                onClick={() => setGameOverInfo(null)}
                className="py-2.5 px-4 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs transition cursor-pointer"
              >
                Xem bàn cờ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
