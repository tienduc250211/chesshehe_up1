import React, { useState } from 'react';
import { ChessArticle } from '../types';
import { CHESS_NEWS } from '../data/chessData';
import { BookOpen, Calendar, Clock, Tag, ArrowRight, X } from 'lucide-react';

export const NewsView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [readingArticle, setReadingArticle] = useState<ChessArticle | null>(null);

  const categories = ['Tất cả', 'Chiến thuật', 'Khai cuộc', 'Phân tích ván đấu'];

  const filteredArticles = selectedCategory === 'Tất cả'
    ? CHESS_NEWS
    : CHESS_NEWS.filter((a) => a.category === selectedCategory);

  return (
    <div className="max-w-6xl mx-auto w-full p-4 flex flex-col gap-6">
      {/* Header & Categories */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-stone-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            Tin Tức & Phân Tích Cờ Vua
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Cập nhật kiến thức khai cuộc, chiến thuật đại kiện tướng và công nghệ engine hiện đại.
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article) => (
          <div
            key={article.id}
            className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden flex flex-col hover:border-amber-500/40 transition-all duration-200 group shadow-md"
          >
            <div className="h-44 overflow-hidden relative bg-stone-800">
              {article.coverImage && article.coverImage.trim() !== '' ? (
                <img
                  src={article.coverImage}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-stone-800 text-stone-600">
                  <BookOpen className="w-10 h-10 text-stone-600" />
                </div>
              )}
              <span className="absolute top-3 left-3 bg-stone-950/80 backdrop-blur-xs text-amber-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border border-amber-500/30">
                {article.category}
              </span>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 text-[11px] text-stone-400 mb-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {article.publishDate}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {article.readTime}
                  </span>
                </div>

                <h3 className="text-base font-bold text-stone-100 group-hover:text-amber-400 transition-colors line-clamp-2">
                  {article.title}
                </h3>

                <p className="text-xs text-stone-400 mt-2 line-clamp-3 leading-relaxed">
                  {article.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] bg-stone-950 text-stone-400 px-2 py-0.5 rounded font-mono"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => setReadingArticle(article)}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  Đọc tiếp
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reading Article Modal */}
      {readingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-stone-800 flex items-center justify-between bg-stone-950">
              <span className="text-xs text-amber-400 font-mono font-bold uppercase tracking-wider">
                {readingArticle.category}
              </span>
              <button
                onClick={() => setReadingArticle(null)}
                className="text-stone-400 hover:text-stone-100 p-1 rounded hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <h2 className="text-xl font-bold text-stone-100 leading-snug">
                {readingArticle.title}
              </h2>

              <div className="flex items-center gap-3 text-xs text-stone-400 font-mono border-b border-stone-800 pb-3">
                <span>Tác giả: {readingArticle.author}</span>
                <span>•</span>
                <span>Ngày đăng: {readingArticle.publishDate}</span>
                <span>•</span>
                <span>Thời gian đọc: {readingArticle.readTime}</span>
              </div>

              <div className="text-sm text-stone-300 leading-relaxed whitespace-pre-line space-y-3 font-sans">
                {readingArticle.content}
              </div>
            </div>

            <div className="p-4 border-t border-stone-800 bg-stone-950 flex justify-end">
              <button
                onClick={() => setReadingArticle(null)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Đóng bài viết
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
