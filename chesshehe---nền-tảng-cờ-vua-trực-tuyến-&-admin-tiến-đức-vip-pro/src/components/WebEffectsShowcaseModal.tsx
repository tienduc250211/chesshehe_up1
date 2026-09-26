import React, { useState } from 'react';
import { AnimatedSendButton } from './AnimatedSendButton';
import { soundFx } from '../utils/soundEffects';
import {
  Sparkles,
  X,
  Volume2,
  VolumeX,
  Layers,
  Send,
  Check,
  Copy,
  Zap,
  Flame,
  Crown,
} from 'lucide-react';

interface WebEffectsShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WebEffectsShowcaseModal: React.FC<WebEffectsShowcaseModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'demo' | 'code' | 'vip'>('demo');
  const [customText, setCustomText] = useState('SendMessage');
  const [customSent, setCustomSent] = useState('Sent');
  const [soundEnabled, setSoundEnabled] = useState(soundFx.enabled);
  const [copiedCode, setCopiedCode] = useState(false);
  const [burstCount, setBurstCount] = useState(0);

  if (!isOpen) return null;

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundFx.enabled = next;
    if (next) soundFx.playSendChime();
  };

  const triggerSparkles = () => {
    soundFx.playSparkle();
    setBurstCount((prev) => prev + 1);
  };

  const HTML_CODE_SNIPPET = `<button class="button">
  <div class="outline"></div>
  <div class="state state--default">
    <div class="icon">
      <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g style="filter: url(#shadow)">
          <path d="M14.2199 21.63C13.0399 21.63 11.3699 20.8 10.0499 16.83L9.32988 14.67L7.16988 13.95C3.20988 12.63 2.37988 10.96 2.37988 9.78001C2.37988 8.61001 3.20988 6.93001 7.16988 5.60001L15.6599 2.77001C17.7799 2.06001 19.5499 2.27001 20.6399 3.35001C21.7299 4.43001 21.9399 6.21001 21.2299 8.33001L18.3999 16.82C17.0699 20.8 15.3999 21.63 14.2199 21.63ZM7.63988 7.03001C4.85988 7.96001 3.86988 9.06001 3.86988 9.78001C3.86988 10.5 4.85988 11.6 7.63988 12.52L10.1599 13.36C10.3799 13.43 10.5599 13.61 10.6299 13.83L11.4699 16.35C12.3899 19.13 13.4999 20.12 14.2199 20.12C14.9399 20.12 16.0399 19.13 16.9699 16.35L19.7999 7.86001C20.3099 6.32001 20.2199 5.06001 19.5699 4.41001C18.9199 3.76001 17.6599 3.68001 16.1299 4.19001L7.63988 7.03001Z" fill="currentColor"></path>
          <path d="M10.11 14.4C9.92005 14.4 9.73005 14.33 9.58005 14.18C9.29005 13.89 9.29005 13.41 9.58005 13.12L13.16 9.53C13.45 9.24 13.93 9.24 14.22 9.53C14.51 9.82 14.51 10.3 14.22 10.59L10.64 14.18C10.5 14.33 10.3 14.4 10.11 14.4Z" fill="currentColor"></path>
        </g>
        <defs>
          <filter id="shadow">
            <fedropshadow dx="0" dy="1" stdDeviation="0.6" flood-opacity="0.5"></fedropshadow>
          </filter>
        </defs>
      </svg>
    </div>
    <p>
      <span style="--i:0">S</span>
      <span style="--i:1">e</span>
      <span style="--i:2">n</span>
      <span style="--i:3">d</span>
      <span style="--i:4">M</span>
      <span style="--i:5">e</span>
      <span style="--i:6">s</span>
      <span style="--i:7">s</span>
      <span style="--i:8">a</span>
      <span style="--i:9">g</span>
      <span style="--i:10">e</span>
    </p>
  </div>
  <div class="state state--sent">
    <div class="icon">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" height="1em" width="1em" stroke-width="0.5px" stroke="black">
        <g style="filter: url(#shadow)">
          <path fill="currentColor" d="M12 22.75C6.07 22.75 1.25 17.93 1.25 12C1.25 6.07 6.07 1.25 12 1.25C17.93 1.25 22.75 6.07 22.75 12C22.75 17.93 17.93 22.75 12 22.75ZM12 2.75C6.9 2.75 2.75 6.9 2.75 12C2.75 17.1 6.9 21.25 12 21.25C17.1 21.25 21.25 17.1 21.25 12C21.25 6.9 17.1 2.75 12 2.75Z"></path>
          <path fill="currentColor" d="M10.5795 15.5801C10.3795 15.5801 10.1895 15.5001 10.0495 15.3601L7.21945 12.5301C6.92945 12.2401 6.92945 11.7601 7.21945 11.4701C7.50945 11.1801 7.98945 11.1801 8.27945 11.4701L10.5795 13.7701L15.7195 8.6301C16.0095 8.3401 16.4895 8.3401 16.7795 8.6301C17.0695 8.9201 17.0695 9.4001 16.7795 9.6901L11.1095 15.3601C10.9695 15.5001 10.7795 15.5801 10.5795 15.5801Z"></path>
        </g>
      </svg>
    </div>
    <p>
      <span style="--i:5">S</span>
      <span style="--i:6">e</span>
      <span style="--i:7">n</span>
      <span style="--i:8">t</span>
    </p>
  </div>
</button>`;

  const copySnippet = () => {
    navigator.clipboard.writeText(HTML_CODE_SNIPPET);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-amber-500/40 rounded-2xl shadow-2xl shadow-amber-500/10 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-100 flex items-center gap-2">
                <span>Kho Hiệu Ứng Website VIP</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
                  wiweb.vn & Uiverse
                </span>
              </h2>
              <p className="text-[11px] text-stone-400">
                Hiệu ứng nút bấm động, viền neon xoay tròn, gợn sóng chữ và hào quang VIP
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSound}
              className={`p-2 rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer border ${
                soundEnabled
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-stone-800 text-stone-400 border-stone-700'
              }`}
              title="Bật/Tắt âm thanh hiệu ứng"
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5" />
              ) : (
                <VolumeX className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-stone-800 bg-stone-950/40 px-5 pt-2 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('demo')}
            className={`pb-2.5 px-3 font-semibold transition border-b-2 cursor-pointer ${
              activeTab === 'demo'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Trải Nghiệm Nút SendMessage
          </button>
          <button
            onClick={() => setActiveTab('vip')}
            className={`pb-2.5 px-3 font-semibold transition border-b-2 cursor-pointer ${
              activeTab === 'vip'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Hiệu Ứng VIP Nổi Bật
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`pb-2.5 px-3 font-semibold transition border-b-2 cursor-pointer ${
              activeTab === 'code'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Mã HTML & CSS Mẫu
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-5">
          {activeTab === 'demo' && (
            <div className="flex flex-col gap-5">
              {/* Interactive Showcase Sandbox */}
              <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-6 flex flex-col items-center justify-center gap-6 relative overflow-hidden">
                <div className="text-center">
                  <span className="text-[11px] font-mono text-amber-400/80 uppercase tracking-widest block mb-1">
                    Thử nghiệm trực tiếp
                  </span>
                  <p className="text-xs text-stone-300">
                    Rê chuột để thấy chữ gợn sóng & viền ánh sáng xoay tròn. Nhấn để máy bay phóng đi và chuyển thành tickmark "Sent"!
                  </p>
                </div>

                {/* The Requested Button Showcase */}
                <div className="py-4">
                  <AnimatedSendButton
                    text={customText}
                    sentText={customSent}
                    size="lg"
                    title="Nhấn để gửi"
                  />
                </div>

                <div className="text-[11px] text-stone-500 italic">
                  💡 Nút tự động chuyển trạng thái mượt mà và phục hồi sau 2.2 giây
                </div>
              </div>

              {/* Customizer controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-stone-950/40 p-3.5 rounded-xl border border-stone-800/80 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-stone-400 block mb-1">
                    Nội dung chữ mặc định:
                  </label>
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-stone-200 focus:border-amber-400 outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-stone-400 block mb-1">
                    Nội dung chữ sau khi gửi:
                  </label>
                  <input
                    type="text"
                    value={customSent}
                    onChange={(e) => setCustomSent(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-stone-200 focus:border-amber-400 outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Sizes comparison */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-stone-300">Các kích thước sẵn sàng:</span>
                <div className="flex flex-wrap items-center gap-4 p-4 bg-stone-950/40 rounded-xl border border-stone-800">
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] text-stone-500 font-mono">Nhỏ (Cho chat)</span>
                    <AnimatedSendButton text="Gửi" sentText="Đã gửi" size="sm" />
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] text-stone-500 font-mono">Chuẩn</span>
                    <AnimatedSendButton text="SendMessage" sentText="Sent" size="md" />
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] text-stone-500 font-mono">Lớn (VIP)</span>
                    <AnimatedSendButton text="Thách Đấu" sentText="Đã Gửi" size="lg" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vip' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Effect 1: Conic Border Beam Card */}
              <div className="vip-border-beam-box">
                <div className="vip-inner-content p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <h3 className="font-bold text-sm text-stone-200">
                      Border Beam (Neon Conic)
                    </h3>
                  </div>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Tia laser viền chuyển động xoay quanh thẻ 360 độ vô tận, tạo phong cách công nghệ hoàng gia.
                  </p>
                  <span className="text-[10px] text-amber-400/90 font-mono">
                    Class: .vip-border-beam-box
                  </span>
                </div>
              </div>

              {/* Effect 2: VIP Shimmer Gold Text */}
              <div className="bg-stone-950/70 border border-stone-800 p-4 rounded-xl flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <h3 className="font-bold text-sm text-stone-200">Gold Shimmer Text</h3>
                </div>
                <div className="py-2">
                  <span className="vip-text-shimmer text-xl font-black">
                    CHESSHEHE ROYAL VIP PRO
                  </span>
                </div>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Hiệu ứng ánh kim vàng quét qua mặt chữ lấp lánh như vương miện hoàng gia.
                </p>
                <span className="text-[10px] text-amber-400/90 font-mono">
                  Class: .vip-text-shimmer
                </span>
              </div>

              {/* Effect 3: VIP Glassmorphism */}
              <div className="vip-glass-card p-4 rounded-xl flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-sm text-stone-200">
                    VIP Glassmorphism Thủy Tinh
                  </h3>
                </div>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Lớp gương kính mờ đa tầng phản chiếu ánh đèn vàng, đổ bóng khối sâu với viền phản quang khi rê chuột.
                </p>
                <span className="text-[10px] text-amber-400/90 font-mono">
                  Class: .vip-glass-card
                </span>
              </div>

              {/* Effect 4: Sparkle Generator */}
              <div className="bg-stone-950/70 border border-stone-800 p-4 rounded-xl flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h3 className="font-bold text-sm text-stone-200">
                      Bắn Hào Quang & Hạt Sparkle
                    </h3>
                  </div>
                  <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                    Kích hoạt chuông âm thanh Web Audio và hạt lấp lánh tức thì.
                  </p>
                </div>
                <button
                  onClick={triggerSparkles}
                  className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-amber-500/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Bắn Tia Sáng Hoàng Gia ({burstCount})
                </button>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-300">
                  Mã HTML nút bấm SendMessage mà bạn cung cấp:
                </span>
                <button
                  onClick={copySnippet}
                  className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer border border-stone-700"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Đã sao chép!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép mã</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 font-mono text-[11px] text-amber-200/90 overflow-x-auto max-h-72">
                <pre>{HTML_CODE_SNIPPET}</pre>
              </div>

              <div className="text-[11px] text-stone-400">
                Toàn bộ CSS đã được tích hợp trực tiếp vào hệ thống của dự án và sẵn sàng hoạt động ở mọi giao diện có class <code className="text-amber-400 font-mono">.button</code> hoặc component <code className="text-amber-400 font-mono">&lt;AnimatedSendButton /&gt;</code>!
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-stone-800 bg-stone-950/80 flex items-center justify-between text-xs">
          <span className="text-stone-400 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            Đã tích hợp vào Khung Chat Bạn Bè, Chat Phòng & Sổ Lưu Bút Admin
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-lg transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
