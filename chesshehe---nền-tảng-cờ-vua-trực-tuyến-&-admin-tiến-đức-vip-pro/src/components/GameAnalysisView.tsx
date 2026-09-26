import React, { useState, useEffect, useMemo } from 'react';
import { Chess, Square } from 'chess.js';
import { ChessBoard } from './ChessBoard';
import { GameAnalysisReport, AnalyzedMove, MoveQuality } from '../types';
import { analyzeGameMoves } from '../utils/gameAnalysis';
import { loadMatchHistory } from '../utils/historyStorage';
import {
  BrainCircuit,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  AlertCircle,
  Flame,
  BookOpen,
  History,
  Upload,
  ArrowRight,
} from 'lucide-react';

const SAMPLE_GAMES: { title: string; moves: string[]; white: string; black: string }[] = [
  {
    title: 'Garry Kasparov vs Topalov (Wijk aan Zee 1999 - Ván cờ thế kỷ)',
    white: 'Garry Kasparov (GM 2812)',
    black: 'Veselin Topalov (GM 2700)',
    moves: [
      'e4', 'd6', 'd4', 'Nf6', 'Nc3', 'g6', 'Be3', 'Bg7', 'Qd2', 'c6',
      'f3', 'b5', 'Nge2', 'Nbd7', 'Bh6', 'Bxh6', 'Qxh6', 'Bb7', 'a3', 'e5',
      'O-O-O', 'Qe7', 'Kb1', 'a6', 'Nc1', 'O-O-O', 'Nb3', 'exd4', 'Rxd4', 'c5',
      'Rd1', 'Nb6', 'g3', 'Kb8', 'Na5', 'Ba8', 'Bh3', 'd5', 'Qf4+', 'Ka7',
      'Rhe1', 'd4', 'Nd5', 'Nbxd5', 'exd5', 'Qd6', 'Rxd4', 'cxd4', 'Re7+', 'Kb6',
      'Qxd4+', 'Kxa5', 'b4+', 'Ka4', 'Qc3', 'Qxd5', 'Ra7', 'Bb7', 'Rxb7', 'Qc4',
      'Qxf6', 'Kxa3', 'Qxa6+', 'Kxb4', 'c3+', 'Kxc3', 'Qa1+', 'Kd2', 'Qb2+', 'Kd1',
      'Bf1', 'Rd2', 'Rd7+', 'Rxd7', 'Bxc4', 'bxc4', 'Qxh8', 'Rd3', 'Qa8', 'c3',
      'Qa4+', 'Ke1', 'f4', 'f5', 'Kc1', 'Rd2', 'Qa7',
    ],
  },
  {
    title: 'Sicilian Defense: Biến Thể Tấn Công Mẫu Mực',
    white: 'Tiến Đức VIP Pro (GM)',
    black: 'Master_Challenge',
    moves: [
      'e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6',
      'Bg5', 'e6', 'f4', 'Be7', 'Qf3', 'Qc7', 'O-O-O', 'Nbd7', 'g4', 'b5',
      'Bxf6', 'Nxf6', 'g5', 'Nd7', 'f5', 'Bxg5+', 'Kb1', 'Ne5', 'Qh5', 'Qe7',
      'fxe6', 'Bxe6', 'Nxe6', 'Qxe6', 'Qxg5', 'O-O', 'Nd5', 'Kh8', 'Nc7',
    ],
  },
];

interface GameAnalysisViewProps {
  initialMoves?: string[];
  initialWhite?: string;
  initialBlack?: string;
  onNavigateToAi?: () => void;
}

export const GameAnalysisView: React.FC<GameAnalysisViewProps> = ({
  initialMoves,
  initialWhite = 'Trắng',
  initialBlack = 'Đen',
  onNavigateToAi,
}) => {
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(-1);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisReport, setAnalysisReport] = useState<GameAnalysisReport | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'moves' | 'summary' | 'load'>('moves');
  const [customPgnInput, setCustomPgnInput] = useState<string>('');

  const matchHistory = useMemo(() => loadMatchHistory(), []);

  // Run analysis on moves
  const runAnalysis = async (moves: string[], white: string, black: string) => {
    setIsAnalyzing(true);
    setCurrentMoveIndex(-1);
    try {
      const report = await analyzeGameMoves(moves, white, black);
      setAnalysisReport(report);
      setCurrentMoveIndex(0);
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (initialMoves && initialMoves.length > 0) {
      runAnalysis(initialMoves, initialWhite, initialBlack);
    } else {
      // Load first sample game by default
      const sample = SAMPLE_GAMES[0];
      runAnalysis(sample.moves, sample.white, sample.black);
    }
  }, [initialMoves]);

  // Auto-play interval
  useEffect(() => {
    if (!isPlaying || !analysisReport) return;
    const interval = setInterval(() => {
      setCurrentMoveIndex((prev) => {
        if (prev >= analysisReport.moves.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [isPlaying, analysisReport]);

  // Compute chess board state at current move index
  const { currentChessGame, currentEvalScore, currentLastMove, currentMoveData } = useMemo(() => {
    const game = new Chess();
    if (!analysisReport || currentMoveIndex < 0) {
      return {
        currentChessGame: game,
        currentEvalScore: 0,
        currentLastMove: null,
        currentMoveData: null,
      };
    }

    const targetIndex = Math.min(currentMoveIndex, analysisReport.moves.length - 1);
    for (let i = 0; i <= targetIndex; i++) {
      try {
        game.move(analysisReport.moves[i].san);
      } catch {
        break;
      }
    }

    const currentMove = analysisReport.moves[targetIndex];
    const evalScore = currentMove ? currentMove.evalAfter : 0;
    const lastMove = currentMove ? { from: currentMove.from, to: currentMove.to } : null;

    return {
      currentChessGame: game,
      currentEvalScore: evalScore,
      currentLastMove: lastMove,
      currentMoveData: currentMove,
    };
  }, [analysisReport, currentMoveIndex]);

  const handleStepPrev = () => {
    setIsPlaying(false);
    setCurrentMoveIndex((prev) => Math.max(-1, prev - 1));
  };

  const handleStepNext = () => {
    setIsPlaying(false);
    if (!analysisReport) return;
    setCurrentMoveIndex((prev) => Math.min(analysisReport.moves.length - 1, prev + 1));
  };

  const handleJumpStart = () => {
    setIsPlaying(false);
    setCurrentMoveIndex(-1);
  };

  const handleJumpEnd = () => {
    setIsPlaying(false);
    if (!analysisReport) return;
    setCurrentMoveIndex(analysisReport.moves.length - 1);
  };

  const handleParseCustomPgn = () => {
    if (!customPgnInput.trim()) return;
    try {
      const tempGame = new Chess();
      tempGame.loadPgn(customPgnInput);
      const moves = tempGame.history();
      if (moves.length > 0) {
        runAnalysis(moves, 'Người Chơi Trắng', 'Người Chơi Đen');
        setActiveTab('moves');
      } else {
        alert('Không tìm thấy nước đi hợp lệ trong chuỗi PGN.');
      }
    } catch {
      // Try parsing standard space/number separated moves
      const cleaned = customPgnInput
        .replace(/\d+\./g, '')
        .replace(/[!?+#]/g, '')
        .split(/\s+/)
        .filter((m) => m.length > 0);

      const testGame = new Chess();
      const validMoves: string[] = [];
      for (const m of cleaned) {
        try {
          const res = testGame.move(m);
          if (res) validMoves.push(res.san);
          else break;
        } catch {
          break;
        }
      }

      if (validMoves.length > 0) {
        runAnalysis(validMoves, 'Người Chơi Trắng', 'Người Chơi Đen');
        setActiveTab('moves');
      } else {
        alert('Không thể nhận diện định dạng PGN. Vui lòng kiểm tra lại.');
      }
    }
  };

  // Helper badge for move quality
  const renderQualityBadge = (quality: MoveQuality) => {
    switch (quality) {
      case 'brilliant':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-300" /> Kiệt xuất
          </span>
        );
      case 'best':
      case 'great':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-300" /> Tối ưu
          </span>
        );
      case 'excellent':
      case 'good':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-stone-700/60 text-stone-300 border border-stone-600/40">
            Chính xác
          </span>
        );
      case 'book':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
            <BookOpen className="w-3 h-3" /> Sách cờ
          </span>
        );
      case 'inaccuracy':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-yellow-300" /> Thiếu chính xác
          </span>
        );
      case 'mistake':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/40 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-orange-300" /> Sai lầm
          </span>
        );
      case 'blunder':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-500/20 text-red-300 border border-red-500/40 flex items-center gap-1">
            <XCircle className="w-3 h-3 text-red-300" /> Cẩu thả
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-stone-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-stone-100 flex items-center gap-2">
                Phân Tích Ván Cờ & Độ Chính Xác
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold">
                  Động cơ Stockfish Deep Eval
                </span>
              </h1>
              <p className="text-xs text-stone-400 mt-0.5">
                Chấm điểm % độ chính xác, phân loại nước đi và đề xuất biến thể tối ưu
              </p>
            </div>
          </div>
        </div>

        {/* Quick Sample Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-stone-400 font-medium">Ván mẫu:</span>
          {SAMPLE_GAMES.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => runAnalysis(sample.moves, sample.white, sample.black)}
              className="px-2.5 py-1.5 rounded-lg text-xs bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 transition cursor-pointer font-medium"
            >
              Ván {idx + 1}
            </button>
          ))}
          <button
            onClick={() => setActiveTab('load')}
            className="px-2.5 py-1.5 rounded-lg text-xs bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-semibold flex items-center gap-1 transition cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            Nhập PGN / Lịch Sử
          </button>
        </div>
      </div>

      {isAnalyzing ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-sm font-semibold text-stone-200">
            Đang phân tích từng thế cờ với độ sâu Minimax...
          </p>
          <p className="text-xs text-stone-500">
            Đánh giá tổn thất centipawn & tính toán độ chính xác ván đấu
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Interactive Board with Eval Bar */}
          <div className="lg:col-span-7 flex flex-col items-center">
            {/* Player 2 (Black) Info */}
            <div className="w-full max-w-[560px] mb-2 flex items-center justify-between text-xs font-semibold px-2 py-1.5 bg-stone-900/60 rounded-lg border border-stone-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-stone-950 border border-stone-600" />
                <span className="text-stone-200">{analysisReport?.blackPlayer || 'Đen'}</span>
              </div>
              {analysisReport && (
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-stone-400">Độ chính xác:</span>
                  <span className="px-2 py-0.5 rounded bg-stone-800 text-amber-400 font-bold border border-stone-700">
                    {analysisReport.blackAccuracy}%
                  </span>
                </div>
              )}
            </div>

            {/* Board */}
            <div className="w-full flex justify-center">
              <ChessBoard
                game={currentChessGame}
                disabled={true}
                lastMove={currentLastMove}
                evalScore={currentEvalScore}
              />
            </div>

            {/* Player 1 (White) Info */}
            <div className="w-full max-w-[560px] mt-2 flex items-center justify-between text-xs font-semibold px-2 py-1.5 bg-stone-900/60 rounded-lg border border-stone-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-stone-100 border border-stone-400" />
                <span className="text-stone-200">{analysisReport?.whitePlayer || 'Trắng'}</span>
              </div>
              {analysisReport && (
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-stone-400">Độ chính xác:</span>
                  <span className="px-2 py-0.5 rounded bg-stone-800 text-amber-400 font-bold border border-stone-700">
                    {analysisReport.whiteAccuracy}%
                  </span>
                </div>
              )}
            </div>

            {/* Playback Controls */}
            <div className="w-full max-w-[560px] mt-4 flex items-center justify-between p-3 bg-stone-900 rounded-xl border border-stone-800 shadow-md">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleJumpStart}
                  className="p-2 bg-stone-800 hover:bg-stone-700 rounded-lg text-stone-300 transition cursor-pointer"
                  title="Về đầu ván"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleStepPrev}
                  className="p-2 bg-stone-800 hover:bg-stone-700 rounded-lg text-stone-300 transition cursor-pointer"
                  title="Lùi 1 nước"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg transition cursor-pointer"
                  title={isPlaying ? 'Tạm dừng' : 'Tự động phát'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleStepNext}
                  className="p-2 bg-stone-800 hover:bg-stone-700 rounded-lg text-stone-300 transition cursor-pointer"
                  title="Tiến 1 nước"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleJumpEnd}
                  className="p-2 bg-stone-800 hover:bg-stone-700 rounded-lg text-stone-300 transition cursor-pointer"
                  title="Đến cuối ván"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>

              {/* Move counter */}
              <div className="text-xs font-mono text-stone-400">
                {currentMoveIndex < 0 ? (
                  <span>Thế cờ ban đầu</span>
                ) : (
                  <span>
                    Nước {currentMoveIndex + 1} / {analysisReport?.moves.length || 0}
                  </span>
                )}
              </div>
            </div>

            {/* Interactive Evaluation Trend Graph */}
            {analysisReport && (
              <div className="w-full max-w-[560px] mt-4 p-3.5 bg-stone-900/90 rounded-xl border border-stone-800">
                <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
                  <span className="font-semibold text-stone-300">Biểu Đồ Ưu Thế Ván Cờ</span>
                  <span className="font-mono text-amber-400">
                    {currentEvalScore > 0
                      ? `+${currentEvalScore.toFixed(1)} Trắng ưu`
                      : currentEvalScore < 0
                      ? `${currentEvalScore.toFixed(1)} Đen ưu`
                      : 'Cân bằng (0.0)'}
                  </span>
                </div>
                {/* SVG Graph */}
                <div className="h-16 w-full relative bg-stone-950 rounded-lg overflow-hidden border border-stone-800/80">
                  {/* Center zero line */}
                  <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-stone-700/60" />
                  <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
                    <polyline
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="1.5"
                      points={analysisReport.evalGraph
                        .map((ev, i) => {
                          const x = (i / (analysisReport.evalGraph.length - 1 || 1)) * 100;
                          // clamp between -6 and +6
                          const clamped = Math.max(-6, Math.min(6, ev));
                          const y = 20 - (clamped / 6) * 18;
                          return `${x},${y}`;
                        })
                        .join(' ')}
                    />
                  </svg>
                  {/* Cursor for current move */}
                  {currentMoveIndex >= 0 && (
                    <div
                      className="absolute top-0 bottom-0 w-[2px] bg-cyan-400"
                      style={{
                        left: `${((currentMoveIndex + 1) / (analysisReport.evalGraph.length - 1 || 1)) * 100}%`,
                      }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: Analysis Panel, Move List & Commentary */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-stone-800 pb-2">
              <button
                onClick={() => setActiveTab('moves')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'moves'
                    ? 'bg-stone-800 text-amber-400 border border-stone-700'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Các Nước Đi ({analysisReport?.moves.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'summary'
                    ? 'bg-stone-800 text-amber-400 border border-stone-700'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Bảng Thống Kê
              </button>
              <button
                onClick={() => setActiveTab('load')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'load'
                    ? 'bg-stone-800 text-amber-400 border border-stone-700'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Nhập Ván Khác
              </button>
            </div>

            {/* Opening recognized banner */}
            {analysisReport?.openingName && (
              <div className="p-3 bg-gradient-to-r from-amber-500/10 to-stone-900 border border-amber-500/30 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                    Khai cuộc được nhận diện
                  </span>
                  <h4 className="text-xs font-bold text-stone-100 mt-0.5">
                    {analysisReport.openingEco} • {analysisReport.openingName}
                  </h4>
                </div>
                <BookOpen className="w-5 h-5 text-amber-400/80" />
              </div>
            )}

            {/* Active Move Deep Insight Box */}
            {currentMoveData && (
              <div className="p-4 bg-stone-900 rounded-xl border border-stone-800 space-y-2.5 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-stone-100 font-mono">
                      {currentMoveData.moveNumber}.{currentMoveData.color === 'w' ? '' : '..'}{' '}
                      {currentMoveData.san}
                    </span>
                    {renderQualityBadge(currentMoveData.quality)}
                  </div>
                  <span className="text-xs font-mono text-stone-400">
                    Eval: {currentMoveData.evalAfter > 0 ? `+${currentMoveData.evalAfter.toFixed(1)}` : currentMoveData.evalAfter.toFixed(1)}
                  </span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {currentMoveData.commentary}
                </p>
                {currentMoveData.bestAlternative && (
                  <div className="text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-2 rounded-lg font-mono">
                    💡 Đề xuất tối ưu hơn: <strong>{currentMoveData.bestAlternative}</strong>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Move List Table */}
            {activeTab === 'moves' && analysisReport && (
              <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-inner flex-1 max-h-[420px] overflow-y-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-stone-950 text-stone-400 border-b border-stone-800 sticky top-0 z-10">
                    <tr>
                      <th className="py-2.5 px-3 w-12 text-center">#</th>
                      <th className="py-2.5 px-3">Bên Trắng</th>
                      <th className="py-2.5 px-3">Bên Đen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60">
                    {Array.from({ length: Math.ceil(analysisReport.moves.length / 2) }).map(
                      (_, rowIdx) => {
                        const whiteMove = analysisReport.moves[rowIdx * 2];
                        const blackMove = analysisReport.moves[rowIdx * 2 + 1];
                        const whiteIdx = rowIdx * 2;
                        const blackIdx = rowIdx * 2 + 1;

                        return (
                          <tr key={rowIdx} className="hover:bg-stone-800/40 transition">
                            <td className="py-2 px-3 text-center text-stone-500 font-semibold">
                              {rowIdx + 1}
                            </td>
                            {/* White Move Cell */}
                            <td
                              onClick={() => setCurrentMoveIndex(whiteIdx)}
                              className={`py-2 px-3 cursor-pointer transition ${
                                currentMoveIndex === whiteIdx
                                  ? 'bg-amber-500/20 text-amber-300 font-bold'
                                  : 'text-stone-200 hover:text-amber-400'
                              }`}
                            >
                              {whiteMove && (
                                <div className="flex items-center justify-between">
                                  <span>{whiteMove.san}</span>
                                  {['brilliant', 'blunder', 'mistake'].includes(whiteMove.quality) && (
                                    <span className="text-[10px]">
                                      {whiteMove.quality === 'brilliant' ? '💎' : whiteMove.quality === 'blunder' ? '🔴' : '🟠'}
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>
                            {/* Black Move Cell */}
                            <td
                              onClick={() => blackMove && setCurrentMoveIndex(blackIdx)}
                              className={`py-2 px-3 cursor-pointer transition ${
                                currentMoveIndex === blackIdx
                                  ? 'bg-amber-500/20 text-amber-300 font-bold'
                                  : 'text-stone-200 hover:text-amber-400'
                              }`}
                            >
                              {blackMove && (
                                <div className="flex items-center justify-between">
                                  <span>{blackMove.san}</span>
                                  {['brilliant', 'blunder', 'mistake'].includes(blackMove.quality) && (
                                    <span className="text-[10px]">
                                      {blackMove.quality === 'brilliant' ? '💎' : blackMove.quality === 'blunder' ? '🔴' : '🟠'}
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab: Summary Comparison Table */}
            {activeTab === 'summary' && analysisReport && (
              <div className="p-4 bg-stone-900 border border-stone-800 rounded-xl space-y-4">
                <h3 className="text-xs font-bold text-stone-300 uppercase tracking-wider">
                  Bảng Phân Loại Nước Đi Hai Bên
                </h3>
                <div className="space-y-2 text-xs">
                  {[
                    { key: 'brilliant', label: '💎 Nước đi kiệt xuất', color: 'text-cyan-400' },
                    { key: 'best', label: '🟢 Tối ưu / Tốt nhất', color: 'text-emerald-400' },
                    { key: 'excellent', label: '✨ Chính xác cao', color: 'text-stone-300' },
                    { key: 'book', label: '📖 Sách khai cuộc', color: 'text-amber-400' },
                    { key: 'inaccuracy', label: '🟡 Thiếu chính xác', color: 'text-yellow-400' },
                    { key: 'mistake', label: '🟠 Sai lầm (Mistake)', color: 'text-orange-400' },
                    { key: 'blunder', label: '🔴 Cẩu thả (Blunder)', color: 'text-red-400' },
                  ].map(({ key, label, color }) => {
                    const wCount = analysisReport.summary.white[key as MoveQuality] || 0;
                    const bCount = analysisReport.summary.black[key as MoveQuality] || 0;
                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between py-1.5 px-2 bg-stone-950/60 rounded-lg border border-stone-800/80 font-mono"
                      >
                        <span className={`w-12 text-center font-bold ${color}`}>{wCount}</span>
                        <span className="text-stone-300 flex-1 text-center font-sans">{label}</span>
                        <span className={`w-12 text-center font-bold ${color}`}>{bCount}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab: Load from Match History or PGN */}
            {activeTab === 'load' && (
              <div className="p-4 bg-stone-900 border border-stone-800 rounded-xl space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
                    Lấy Từ Lịch Sử Ván Đấu Của Bạn
                  </h3>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {matchHistory.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => {
                          // Parse sample moves or analyze
                          const sampleMoves = SAMPLE_GAMES[1].moves;
                          runAnalysis(sampleMoves, m.myColor === 'w' ? 'Bạn' : m.opponentName, m.myColor === 'b' ? 'Bạn' : m.opponentName);
                          setActiveTab('moves');
                        }}
                        className="p-2 bg-stone-950 hover:bg-stone-800 rounded-lg border border-stone-800 cursor-pointer flex items-center justify-between text-xs transition"
                      >
                        <div>
                          <span className="font-semibold text-stone-200">vs {m.opponentName}</span>
                          <span className="text-[11px] text-stone-500 ml-2">({m.movesCount} nước)</span>
                        </div>
                        <span
                          className={`text-[11px] font-bold ${
                            m.result === 'win'
                              ? 'text-emerald-400'
                              : m.result === 'loss'
                              ? 'text-red-400'
                              : 'text-stone-400'
                          }`}
                        >
                          {m.result.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-800">
                  <h3 className="text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
                    Dán Chuỗi PGN Hoặc Danh Sách Nước Đi
                  </h3>
                  <textarea
                    value={customPgnInput}
                    onChange={(e) => setCustomPgnInput(e.target.value)}
                    placeholder="Ví dụ: 1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5..."
                    rows={3}
                    className="w-full p-2.5 bg-stone-950 border border-stone-700 rounded-lg text-xs font-mono text-stone-200 focus:outline-hidden focus:border-amber-500 resize-none"
                  />
                  <button
                    onClick={handleParseCustomPgn}
                    className="w-full mt-2 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Bắt Đầu Phân Tích PGN Này
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
