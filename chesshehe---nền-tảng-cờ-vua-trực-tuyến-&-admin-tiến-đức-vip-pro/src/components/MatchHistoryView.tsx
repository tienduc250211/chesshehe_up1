import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { MatchHistoryItem, PieceColor } from '../types';
import { loadMatchHistory, saveMatchHistory } from '../utils/historyStorage';
import { ChessBoard } from './ChessBoard';
import {
  History,
  Trophy,
  Bot,
  Users,
  Clock,
  Trash2,
  Share2,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Eye,
  Filter,
  Flame,
  Zap,
  RotateCcw,
  BrainCircuit,
} from 'lucide-react';

interface MatchHistoryViewProps {
  onChallengeOpponent?: (name: string) => void;
  onAnalyzeMatch?: (match: MatchHistoryItem) => void;
}

export const MatchHistoryView: React.FC<MatchHistoryViewProps> = ({
  onChallengeOpponent,
  onAnalyzeMatch,
}) => {
  const [history, setHistory] = useState<MatchHistoryItem[]>(() => loadMatchHistory());
  const [filterMode, setFilterMode] = useState<'all' | 'win' | 'loss' | 'draw' | 'online' | 'ai' | 'otb'>('all');
  const [inspectMatch, setInspectMatch] = useState<MatchHistoryItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sync state
  useEffect(() => {
    setHistory(loadMatchHistory());
  }, []);

  const handleDeleteItem = (id: string) => {
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    saveMatchHistory(updated);
    if (inspectMatch?.id === id) setInspectMatch(null);
  };

  const handleClearAll = () => {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử các ván đấu đã lưu?')) {
      setHistory([]);
      saveMatchHistory([]);
      setInspectMatch(null);
    }
  };

  const handleCopyFen = (match: MatchHistoryItem) => {
    const textToCopy = match.finalFen || `Match vs ${match.opponentName} (${match.timeControl}) - Result: ${match.result.toUpperCase()}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(match.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredHistory = history.filter((m) => {
    if (filterMode === 'all') return true;
    if (filterMode === 'win') return m.result === 'win';
    if (filterMode === 'loss') return m.result === 'loss';
    if (filterMode === 'draw') return m.result === 'draw';
    if (filterMode === 'online') return m.gameMode === 'online';
    if (filterMode === 'ai') return m.gameMode === 'ai';
    if (filterMode === 'otb') return m.gameMode === 'otb';
    return true;
  });

  const totalMatches = history.length;
  const totalWins = history.filter((m) => m.result === 'win').length;
  const totalLosses = history.filter((m) => m.result === 'loss').length;
  const totalDraws = history.filter((m) => m.result === 'draw').length;
  const winRate = totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0;

  const formatRelativeTime = (timestamp: number) => {
    const diffSecs = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSecs < 60) return 'Vừa xong';
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins} phút trước`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ngày trước`;
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-10">
      {/* Header & Overview Stats */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xs">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-stone-100 flex items-center gap-2">
                Lịch Sử Thi Đấu & Nhật Ký Ván Cờ
              </h1>
              <p className="text-xs text-stone-400">
                Lưu trữ toàn bộ các trận đấu Online, đấu Máy AI và đấu Trực tiếp kèm theo đồng hồ FIDE.
              </p>
            </div>
          </div>

          {history.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 bg-stone-800/80 hover:bg-red-950/60 hover:text-red-400 border border-stone-700 hover:border-red-800 text-stone-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Xóa tất cả
            </button>
          )}
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-stone-950/60 border border-stone-800 p-3 rounded-xl flex flex-col">
            <span className="text-[11px] text-stone-400 uppercase tracking-wider font-semibold">
              Tổng số ván
            </span>
            <span className="text-2xl font-mono font-bold text-stone-100 mt-0.5">
              {totalMatches}
            </span>
          </div>

          <div className="bg-stone-950/60 border border-stone-800 p-3 rounded-xl flex flex-col">
            <span className="text-[11px] text-stone-400 uppercase tracking-wider font-semibold">
              Tỷ lệ thắng
            </span>
            <span className="text-2xl font-mono font-bold text-emerald-400 mt-0.5">
              {winRate}%
            </span>
          </div>

          <div className="bg-stone-950/60 border border-stone-800 p-3 rounded-xl flex flex-col">
            <span className="text-[11px] text-stone-400 uppercase tracking-wider font-semibold">
              Thắng / Thua / Hòa
            </span>
            <div className="flex items-center gap-2 mt-0.5 font-mono text-base font-bold">
              <span className="text-emerald-400">{totalWins}W</span>
              <span className="text-stone-600">•</span>
              <span className="text-red-400">{totalLosses}L</span>
              <span className="text-stone-600">•</span>
              <span className="text-amber-400">{totalDraws}D</span>
            </div>
          </div>

          <div className="bg-stone-950/60 border border-stone-800 p-3 rounded-xl flex flex-col">
            <span className="text-[11px] text-stone-400 uppercase tracking-wider font-semibold">
              Đấu gần nhất
            </span>
            <span className="text-sm font-semibold text-stone-200 mt-1 truncate">
              {history.length > 0 ? formatRelativeTime(history[0].timestamp) : 'Chưa có'}
            </span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-xs text-stone-400 font-semibold flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            Lọc theo:
          </span>
          {[
            { key: 'all', label: 'Tất cả ván' },
            { key: 'win', label: 'Thắng lợi' },
            { key: 'loss', label: 'Thất bại' },
            { key: 'draw', label: 'Hòa cờ' },
            { key: 'online', label: 'Đấu Online' },
            { key: 'ai', label: 'Đấu Máy AI' },
            { key: 'otb', label: 'Tại bàn (OTB)' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterMode(tab.key as any)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filterMode === tab.key
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                  : 'bg-stone-800/80 text-stone-400 hover:text-stone-200 hover:bg-stone-800 border border-stone-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Match List */}
      {filteredHistory.length === 0 ? (
        <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center text-stone-500">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-stone-300">
            Chưa có ván đấu nào trong mục này
          </h3>
          <p className="text-xs text-stone-500 max-w-sm">
            Sau khi hoàn thành bất kỳ trận đấu nào (Online, Máy AI hoặc Tại bàn có đồng hồ), kết quả sẽ tự động lưu lại tại đây.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className="bg-stone-900/90 border border-stone-800 hover:border-stone-700 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-150 shadow-md"
            >
              {/* Left Details */}
              <div className="flex items-center gap-3.5">
                {/* Mode Icon */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    item.gameMode === 'online'
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                      : item.gameMode === 'ai'
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {item.gameMode === 'online' ? (
                    <Users className="w-5 h-5" />
                  ) : item.gameMode === 'ai' ? (
                    <Bot className="w-5 h-5" />
                  ) : (
                    <Clock className="w-5 h-5" />
                  )}
                </div>

                {/* Match Summary */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-stone-100 text-sm">
                      {item.opponentName}
                    </span>
                    {item.opponentElo && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-800 text-amber-400 border border-stone-700">
                        {item.opponentElo} Elo
                      </span>
                    )}
                    <span className="text-[10px] px-2 py-0.5 rounded bg-stone-800/80 text-stone-400 font-mono">
                      {item.timeControl}
                    </span>
                  </div>

                  <div className="text-xs text-stone-400 mt-1 flex items-center gap-2 flex-wrap">
                    <span>
                      Cầm quân: <strong className="text-stone-300">{item.myColor === 'w' ? 'Trắng' : 'Đen'}</strong>
                    </span>
                    <span>•</span>
                    <span>{item.reason}</span>
                    <span>•</span>
                    <span className="font-mono">{item.movesCount} nước</span>
                  </div>
                </div>
              </div>

              {/* Right: Outcome badge & Actions */}
              <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-stone-800">
                {/* Result Pill */}
                <div className="flex items-center gap-2">
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
                      item.result === 'win'
                        ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                        : item.result === 'loss'
                        ? 'bg-red-950/80 text-red-400 border-red-500/40'
                        : 'bg-amber-950/80 text-amber-400 border-amber-500/40'
                    }`}
                  >
                    {item.result === 'win' ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : item.result === 'loss' ? (
                      <XCircle className="w-3.5 h-3.5" />
                    ) : (
                      <MinusCircle className="w-3.5 h-3.5" />
                    )}
                    {item.result === 'win' ? 'Thắng' : item.result === 'loss' ? 'Thua' : 'Hòa'}
                  </div>

                  {item.eloChange !== undefined && item.eloChange !== 0 && (
                    <span
                      className={`text-xs font-mono font-bold ${
                        item.eloChange > 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {item.eloChange > 0 ? `+${item.eloChange}` : item.eloChange}
                    </span>
                  )}
                </div>

                <div className="text-right hidden sm:block">
                  <span className="text-[11px] text-stone-500 font-mono block">
                    {formatRelativeTime(item.timestamp)}
                  </span>
                </div>

                {/* Inspect & Copy Buttons */}
                <div className="flex items-center gap-1.5">
                  {onAnalyzeMatch && (
                    <button
                      onClick={() => onAnalyzeMatch(item)}
                      className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs transition cursor-pointer flex items-center gap-1"
                      title="Phân tích ván cờ này"
                    >
                      <BrainCircuit className="w-4 h-4" />
                      <span className="hidden sm:inline text-[11px] font-semibold">Phân Tích</span>
                    </button>
                  )}

                  {item.finalFen && (
                    <button
                      onClick={() => setInspectMatch(item)}
                      className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs transition cursor-pointer"
                      title="Xem lại thế cờ"
                    >
                      <Eye className="w-4 h-4 text-amber-400" />
                    </button>
                  )}

                  <button
                    onClick={() => handleCopyFen(item)}
                    className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs transition cursor-pointer"
                    title="Sao chép FEN thế cờ hoặc thông tin ván"
                  >
                    <Share2 className="w-4 h-4 text-stone-400" />
                  </button>

                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1.5 bg-stone-800 hover:bg-red-950/50 hover:text-red-400 text-stone-500 rounded-lg text-xs transition cursor-pointer"
                    title="Xóa ván cờ này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inspect Match Modal (Board Viewer) */}
      {inspectMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl p-6 max-w-lg w-full flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-stone-100 text-sm sm:text-base">
                  Xem lại ván cờ: vs {inspectMatch.opponentName}
                </h3>
              </div>
              <button
                onClick={() => setInspectMatch(null)}
                className="text-stone-400 hover:text-stone-200 text-sm font-mono px-2 py-1 bg-stone-800 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Chessboard Preview */}
            <div className="flex justify-center">
              <div className="w-[320px] sm:w-[380px]">
                {inspectMatch.finalFen ? (
                  <ChessBoard
                    game={new Chess(inspectMatch.finalFen)}
                    orientation={inspectMatch.myColor}
                    disabled={true}
                  />
                ) : (
                  <div className="p-12 text-center text-xs text-stone-400">
                    Không có bản ghi FEN cho ván đấu này.
                  </div>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="bg-stone-950/70 p-3 rounded-xl border border-stone-800 text-xs flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Kết quả:</span>
                <span className="font-bold text-amber-400">{inspectMatch.reason}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Thể thức & Nước đi:</span>
                <span className="font-mono text-stone-200">
                  {inspectMatch.timeControl} • {inspectMatch.movesCount} nước
                </span>
              </div>
              {inspectMatch.finalFen && (
                <div className="mt-1 pt-1 border-t border-stone-800 text-[11px] font-mono text-stone-500 truncate">
                  FEN: {inspectMatch.finalFen}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleCopyFen(inspectMatch)}
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-lg text-xs transition cursor-pointer"
              >
                {copiedId === inspectMatch.id ? '✓ Đã sao chép FEN' : 'Sao chép FEN thế cờ'}
              </button>
              <button
                onClick={() => setInspectMatch(null)}
                className="py-2 px-4 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
