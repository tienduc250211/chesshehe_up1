import React from 'react';

interface RoyalKnightLogoProps {
  className?: string;
  size?: number | string;
  showGlow?: boolean;
}

/**
 * Logo Con Mã Đội Vương Miện (Royal Crowned Chess Knight)
 * Biểu tượng đặc trưng VIP: Quân Mã dũng mãnh đội Vương Miện Hoàng Gia dát vàng
 */
export const RoyalKnightLogo: React.FC<RoyalKnightLogoProps> = ({
  className = 'w-8 h-8',
  size,
  showGlow = true,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={size ? { width: size, height: size } : undefined}
    >
      {showGlow && (
        <div className="absolute inset-0 rounded-xl bg-amber-500/25 blur-md pointer-events-none -z-10 group-hover:bg-amber-400/40 transition-all duration-300" />
      )}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_2px_8px_rgba(245,158,11,0.5)]"
      >
        <defs>
          {/* Hoàng kim gradient cho vương miện */}
          <linearGradient id="crownGold" x1="20" y1="5" x2="80" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFE066" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          {/* Ánh kim cho ngực và bờm ngựa */}
          <linearGradient id="knightBody" x1="25" y1="20" x2="85" y2="95" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFBEB" />
            <stop offset="35%" stopColor="#FDE68A" />
            <stop offset="70%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>

          {/* Gradient bóng viền sắc sảo */}
          <linearGradient id="innerGlow" x1="30" y1="30" x2="70" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#78350F" stopOpacity="0.4" />
          </linearGradient>

          {/* Viên ngọc đỏ hồng ngọc trên vương miện */}
          <radialGradient id="rubyGem" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FDA4AF" />
            <stop offset="40%" stopColor="#E11D48" />
            <stop offset="100%" stopColor="#881337" />
          </radialGradient>
        </defs>

        {/* --- PHẦN 1: THÂN QUÂN MÃ (CHESS KNIGHT) --- */}
        {/* Khối thân & bờm dũng mãnh */}
        <path
          d="M 52,26 
             C 45,28 39,32 35,38 
             C 32,43 30,47 24,49 
             C 21,50 19,53 20,56 
             C 21,59 25,60 29,58 
             C 33,56 36,54 39,52 
             C 36,58 35,66 38,73 
             C 41,80 47,85 54,88 
             L 24,88 
             C 23,88 22,89 22,90 
             L 22,93 
             C 22,94 23,95 24,95 
             L 78,95 
             C 79,95 80,94 80,93 
             L 80,90 
             C 80,89 79,88 78,88 
             L 74,88 
             C 74,76 77,58 75,44 
             C 74,37 70,30 65,26 
             Z"
          fill="url(#knightBody)"
        />

        {/* Khắc nét bờm ngựa phong cách VIP geometric */}
        <path
          d="M 64,28 C 69,35 73,45 72,55 L 67,48 C 69,40 66,33 64,28 Z"
          fill="#FFFBEB"
          opacity="0.8"
        />
        <path
          d="M 68,52 C 72,62 71,72 69,82 L 64,74 C 66,66 67,58 68,52 Z"
          fill="#B45309"
          opacity="0.6"
        />

        {/* Mắt quân mã hình thoi phát sáng chiến thuật */}
        <polygon points="38,40 43,43 39,46 34,43" fill="#1C1917" />
        <polygon points="39,41 42,43 39,45 36,43" fill="#FBBF24" />
        <circle cx="39" cy="43" r="1.2" fill="#FFFFFF" />

        {/* Khe hàm / miệng ngựa kiêu hãnh */}
        <path
          d="M 23,54 Q 30,53 35,49"
          stroke="#78350F"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Đường viền đế cờ sang trọng */}
        <rect x="22" y="88" width="56" height="3" rx="1.5" fill="#FDE68A" />
        <rect x="20" y="92" width="60" height="3.5" rx="1.7" fill="#D97706" />

        {/* --- PHẦN 2: VƯƠNG MIỆN HOÀNG GIA ĐỘI TRÊN ĐẦU MÃ --- */}
        {/* Vương miện vàng 5 chóp lộng lẫy nghiêng theo hướng đầu ngựa */}
        <g transform="translate(1, -2)">
          {/* Thân vương miện */}
          <path
            d="M 40,24 
               L 43,12 
               L 48,18 
               L 55,9 
               L 62,18 
               L 67,12 
               L 70,24 
               Z"
            fill="url(#crownGold)"
            stroke="#FEF3C7"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />

          {/* Vành đai vương miện đính ngọc */}
          <path
            d="M 39,23 Q 55,27 71,23 L 71,26 Q 55,30 39,26 Z"
            fill="#B45309"
          />
          <path
            d="M 40,23.5 Q 55,27.5 70,23.5"
            stroke="#FDE68A"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Các viên ngọc châu trên các đỉnh chóp vương miện */}
          <circle cx="43" cy="11.5" r="2.2" fill="#FEF3C7" />
          <circle cx="43" cy="11.5" r="1.5" fill="#F59E0B" />

          <circle cx="67" cy="11.5" r="2.2" fill="#FEF3C7" />
          <circle cx="67" cy="11.5" r="1.5" fill="#F59E0B" />

          {/* Viên hồng ngọc ruby ở đỉnh chóp trung tâm tối cao */}
          <circle cx="55" cy="8.5" r="3.2" fill="#FFF1F2" />
          <circle cx="55" cy="8.5" r="2.4" fill="url(#rubyGem)" />
          <circle cx="54.2" cy="7.8" r="0.8" fill="#FFFFFF" />

          {/* 3 viên ngọc đính trên vành vương miện */}
          <circle cx="46" cy="24.8" r="1.4" fill="#38BDF8" />
          <circle cx="55" cy="26" r="1.8" fill="#F43F5E" />
          <circle cx="64" cy="24.8" r="1.4" fill="#10B981" />

          {/* Ánh sao lấp lánh trên vương miện */}
          <path
            d="M 55,2 L 56,6 L 60,7 L 56,8 L 55,12 L 54,8 L 50,7 L 54,6 Z"
            fill="#FFFFFF"
            opacity="0.9"
          />
        </g>
      </svg>
    </div>
  );
};
