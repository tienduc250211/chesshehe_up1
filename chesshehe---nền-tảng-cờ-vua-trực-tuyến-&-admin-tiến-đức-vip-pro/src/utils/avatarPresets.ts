/**
 * Cartoonized & Stylized Grandmaster & AI Character Chess Avatars
 * Avatars are rendered using high-detail custom SVG data URIs so they are always accessible,
 * copyright-safe, crisp, and high-performance.
 */

export interface AvatarPreset {
  id: string;
  name: string;
  role: string;
  category: 'admin' | 'grandmaster' | 'ai_bots';
  url: string;
  badge?: string;
  flag?: string;
  adminOnly?: boolean;
}

// Helper to create an ultra-clean, stylized anime/cartoon SVG avatar with glowing gradients and chess motifs
const createSvgAvatar = (bgGrad: string, innerSvg: string, borderGrad: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        ${bgGrad}
      </linearGradient>
      <linearGradient id="border" x1="0%" y1="0%" x2="100%" y2="100%">
        ${borderGrad}
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
    </defs>
    <circle cx="60" cy="60" r="58" fill="url(#bg)"/>
    <circle cx="60" cy="60" r="57" fill="none" stroke="url(#border)" stroke-width="3"/>
    ${innerSvg}
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
};

// 1. Admin Tiến Đức VIP Pro - Royal Golden Crown & Chess Master Anime
const ADMIN_TIEN_DUC_AVATAR = createSvgAvatar(
  `<stop offset="0%" stop-color="#2a1600"/><stop offset="100%" stop-color="#0a0600"/>`,
  `
  <circle cx="60" cy="60" r="52" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.6"/>
  <circle cx="60" cy="36" r="18" fill="#f59e0b" opacity="0.25" filter="url(#glow)"/>
  <path d="M40 70 Q36 44 60 42 Q84 44 80 70 Z" fill="#f3f4f6"/>
  <path d="M38 52 Q34 38 48 34 Q60 30 72 34 Q86 38 82 52 Q76 44 60 45 Q44 44 38 52 Z" fill="#18181b"/>
  <polygon points="46,36 50,25 56,33 60,22 66,33 72,25 76,36" fill="#18181b"/>
  <ellipse cx="60" cy="54" rx="15" ry="17" fill="#fde047" opacity="0.85"/>
  <ellipse cx="54" cy="53" rx="3.5" ry="2" fill="#0f172a"/>
  <circle cx="55" cy="52.5" r="1" fill="#f59e0b"/>
  <ellipse cx="66" cy="53" rx="3.5" ry="2" fill="#0f172a"/>
  <circle cx="67" cy="52.5" r="1" fill="#f59e0b"/>
  <path d="M56 61 Q60 64 64 61" stroke="#78350f" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <path d="M38 104 C38 82 48 76 60 76 C72 76 82 82 82 104 Z" fill="#b45309"/>
  <polygon points="56,76 60,84 64,76" fill="#fef08a"/>
  <polygon points="44,28 47,15 54,23 60,11 66,23 73,15 76,28" fill="#fbbf24" stroke="#78350f" stroke-width="1.2"/>
  <circle cx="60" cy="11" r="2.5" fill="#ef4444"/>
  <circle cx="47" cy="15" r="2" fill="#3b82f6"/>
  <circle cx="73" cy="15" r="2" fill="#3b82f6"/>
  `,
  `<stop offset="0%" stop-color="#fbbf24"/><stop offset="100%" stop-color="#d97706"/>`
);

// 2. Magnus Carlsen - Norwegian Chess King
const MAGNUS_CARLSEN_AVATAR = createSvgAvatar(
  `<stop offset="0%" stop-color="#0f172a"/><stop offset="100%" stop-color="#020617"/>`,
  `
  <circle cx="60" cy="60" r="52" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.5"/>
  <path d="M38 46 Q36 28 60 26 Q84 28 82 46 Q74 36 60 37 Q46 36 38 46 Z" fill="#92400e"/>
  <ellipse cx="60" cy="53" rx="16" ry="17" fill="#fed7aa"/>
  <ellipse cx="53" cy="51" rx="3.5" ry="2" fill="#0284c7"/>
  <ellipse cx="67" cy="51" rx="3.5" ry="2" fill="#0284c7"/>
  <circle cx="54" cy="50.5" r="1" fill="#ffffff"/>
  <circle cx="68" cy="50.5" r="1" fill="#ffffff"/>
  <path d="M56 59 Q60 62 64 59" stroke="#9a3412" stroke-width="1.5" fill="none"/>
  <path d="M36 104 C36 80 48 74 60 74 C72 74 84 80 84 104 Z" fill="#0369a1"/>
  <polygon points="56,74 60,82 64,74" fill="#ffffff"/>
  <polygon points="58,82 62,82 60,94" fill="#dc2626"/>
  <text x="60" y="24" font-size="12" fill="#38bdf8" text-anchor="middle">♔</text>
  `,
  `<stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#0284c7"/>`
);

// 3. Hikaru Nakamura - Blitz King & Speed Chess Anime
const HIKARU_NAKAMURA_AVATAR = createSvgAvatar(
  `<stop offset="0%" stop-color="#18181b"/><stop offset="100%" stop-color="#09090b"/>`,
  `
  <circle cx="60" cy="60" r="52" fill="none" stroke="#f59e0b" stroke-width="1.5" opacity="0.4"/>
  <path d="M38 48 Q35 28 60 26 Q85 28 82 48 Q76 34 60 35 Q44 34 38 48 Z" fill="#18181b"/>
  <ellipse cx="60" cy="54" rx="16" ry="17" fill="#fed7aa"/>
  <ellipse cx="53" cy="53" rx="3" ry="1.8" fill="#18181b"/>
  <ellipse cx="67" cy="53" rx="3" ry="1.8" fill="#18181b"/>
  <path d="M55 61 Q60 65 65 61" stroke="#9a3412" stroke-width="1.6" fill="none"/>
  <path d="M36 104 C36 82 48 76 60 76 C72 76 84 82 84 104 Z" fill="#dc2626"/>
  <polygon points="57,76 60,82 63,76" fill="#ffffff"/>
  <polygon points="68,14 62,26 66,26 60,38 72,24 66,24" fill="#fbbf24" filter="url(#glow)"/>
  <text x="50" y="26" font-size="11" fill="#f59e0b">⚡</text>
  `,
  `<stop offset="0%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#b45309"/>`
);

// 4. Lê Quang Liêm - Grandmaster #1 Vietnam
const LE_QUANG_LIEM_AVATAR = createSvgAvatar(
  `<stop offset="0%" stop-color="#2d0607"/><stop offset="100%" stop-color="#120202"/>`,
  `
  <circle cx="60" cy="60" r="52" fill="none" stroke="#ef4444" stroke-width="1.5" opacity="0.5"/>
  <path d="M40 46 Q38 30 60 28 Q82 30 80 46 Q74 36 60 36 Q46 36 40 46 Z" fill="#1c1917"/>
  <ellipse cx="60" cy="53" rx="15" ry="17" fill="#ffedd5"/>
  <rect x="47" y="47" width="11" height="8" rx="2" fill="none" stroke="#475569" stroke-width="1.5"/>
  <rect x="62" y="47" width="11" height="8" rx="2" fill="none" stroke="#475569" stroke-width="1.5"/>
  <line x1="58" y1="51" x2="62" y2="51" stroke="#475569" stroke-width="1.5"/>
  <circle cx="52.5" cy="51" r="1.5" fill="#0f172a"/>
  <circle cx="67.5" cy="51" r="1.5" fill="#0f172a"/>
  <path d="M56 60 Q60 63 64 60" stroke="#9a3412" stroke-width="1.5" fill="none"/>
  <path d="M36 104 C36 82 48 76 60 76 C72 76 84 82 84 104 Z" fill="#b91c1c"/>
  <polygon points="56,76 60,83 64,76" fill="#fef08a"/>
  <polygon points="60,16 62,21 68,21 63,24 65,29 60,26 55,29 57,24 52,21 58,21" fill="#facc15" filter="url(#glow)"/>
  `,
  `<stop offset="0%" stop-color="#ef4444"/><stop offset="100%" stop-color="#b91c1c"/>`
);

// 5. Nguyễn Ngọc Trường Sơn - GM Vietnam
const TRUONG_SON_AVATAR = createSvgAvatar(
  `<stop offset="0%" stop-color="#06251b"/><stop offset="100%" stop-color="#02120d"/>`,
  `
  <circle cx="60" cy="60" r="52" fill="none" stroke="#10b981" stroke-width="1.5" opacity="0.5"/>
  <path d="M40 48 Q38 32 60 30 Q82 32 80 48 Q72 38 60 38 Q48 38 40 48 Z" fill="#18181b"/>
  <ellipse cx="60" cy="54" rx="15" ry="17" fill="#fed7aa"/>
  <ellipse cx="53" cy="52" rx="3" ry="2" fill="#047857"/>
  <ellipse cx="67" cy="52" rx="3" ry="2" fill="#047857"/>
  <circle cx="54" cy="51.5" r="1" fill="#ffffff"/>
  <circle cx="68" cy="51.5" r="1" fill="#ffffff"/>
  <path d="M57 61 Q60 63 63 61" stroke="#9a3412" stroke-width="1.5" fill="none"/>
  <path d="M36 104 C36 82 48 76 60 76 C72 76 84 82 84 104 Z" fill="#065f46"/>
  <polygon points="57,76 60,82 63,76" fill="#ecfdf5"/>
  <text x="60" y="26" font-size="12" fill="#34d399" text-anchor="middle">♞</text>
  `,
  `<stop offset="0%" stop-color="#10b981"/><stop offset="100%" stop-color="#059669"/>`
);

// 6. Võ Thị Kim Phụng - WGM Vietnam
const KIM_PHUNG_AVATAR = createSvgAvatar(
  `<stop offset="0%" stop-color="#3b0720"/><stop offset="100%" stop-color="#19020d"/>`,
  `
  <circle cx="60" cy="60" r="52" fill="none" stroke="#f472b6" stroke-width="1.5" opacity="0.5"/>
  <path d="M36 56 Q34 32 60 28 Q86 32 84 56 Q88 78 84 94 Q76 96 74 76 Q60 76 60 76 Q60 76 46 76 Q44 96 36 94 Q32 78 36 56 Z" fill="#27272a"/>
  <ellipse cx="60" cy="54" rx="14" ry="16" fill="#fdf2f8"/>
  <ellipse cx="54" cy="52" rx="3" ry="2" fill="#db2777"/>
  <ellipse cx="66" cy="52" rx="3" ry="2" fill="#db2777"/>
  <circle cx="55" cy="51.5" r="1" fill="#ffffff"/>
  <circle cx="67" cy="51.5" r="1" fill="#ffffff"/>
  <path d="M57 60 Q60 62 63 60" stroke="#be185d" stroke-width="1.5" fill="none"/>
  <path d="M34 104 Q38 78 60 76 Q82 78 86 104 Z" fill="#ec4899"/>
  <polygon points="57,76 60,82 63,76" fill="#fdf2f8"/>
  <text x="60" y="26" font-size="11" fill="#fbcfe8" text-anchor="middle">♕</text>
  `,
  `<stop offset="0%" stop-color="#f472b6"/><stop offset="100%" stop-color="#db2777"/>`
);

// ==========================================
// AI CHARACTER AVATARS (DÀNH CHO TẤT CẢ KỲ THỦ)
// ==========================================

// 7. Stockfish AI Master - Siêu Máy Tính Tính Toán
const STOCKFISH_AI_AVATAR = createSvgAvatar(
  `<stop offset="0%" stop-color="#092f38"/><stop offset="100%" stop-color="#02151a"/>`,
  `
  <circle cx="60" cy="60" r="52" fill="none" stroke="#06b6d4" stroke-width="1.5" stroke-dasharray="2 4" opacity="0.7"/>
  <!-- Futuristic Robot Head -->
  <rect x="42" y="36" width="36" height="34" rx="10" fill="#1e293b" stroke="#06b6d4" stroke-width="2"/>
  <rect x="47" y="44" width="26" height="12" rx="4" fill="#083344"/>
  <!-- Glowing Cyan Visor Eyes -->
  <circle cx="53" cy="50" r="3" fill="#22d3ee" filter="url(#glow)"/>
  <circle cx="67" cy="50" r="3" fill="#22d3ee" filter="url(#glow)"/>
  <!-- Antennas & Circuit -->
  <line x1="60" y1="36" x2="60" y2="24" stroke="#06b6d4" stroke-width="2"/>
  <circle cx="60" cy="22" r="3.5" fill="#38bdf8" filter="url(#glow)"/>
  <line x1="42" y1="52" x2="36" y2="52" stroke="#06b6d4" stroke-width="2"/>
  <line x1="78" y1="52" x2="84" y2="52" stroke="#06b6d4" stroke-width="2"/>
  <!-- Robot Body & Core -->
  <path d="M38 104 C38 78 48 74 60 74 C72 74 82 78 82 104 Z" fill="#0f172a" stroke="#0284c7" stroke-width="1.5"/>
  <circle cx="60" cy="88" r="6" fill="#06b6d4" filter="url(#glow)"/>
  <text x="60" y="66" font-size="8" fill="#22d3ee" text-anchor="middle" font-family="monospace">SF-16</text>
  `,
  `<stop offset="0%" stop-color="#22d3ee"/><stop offset="100%" stop-color="#0891b2"/>`
);

// 8. AlphaChess Neural Bot - Mạng Nơ-ron AI Đa Chiều
const ALPHACHESS_BOT_AVATAR = createSvgAvatar(
  `<stop offset="0%" stop-color="#250e3d"/><stop offset="100%" stop-color="#0f051a"/>`,
  `
  <circle cx="60" cy="60" r="50" fill="none" stroke="#a855f7" stroke-width="1.5" stroke-dasharray="4 2" opacity="0.6"/>
  <!-- Neural Network Lattice -->
  <line x1="45" y1="40" x2="60" y2="25" stroke="#a855f7" stroke-width="1.2" opacity="0.6"/>
  <line x1="75" y1="40" x2="60" y2="25" stroke="#a855f7" stroke-width="1.2" opacity="0.6"/>
  <line x1="45" y1="40" x2="60" y2="55" stroke="#a855f7" stroke-width="1.2" opacity="0.6"/>
  <line x1="75" y1="40" x2="60" y2="55" stroke="#a855f7" stroke-width="1.2" opacity="0.6"/>
  <!-- Neural Nodes -->
  <circle cx="60" cy="25" r="4" fill="#c084fc" filter="url(#glow)"/>
  <circle cx="45" cy="40" r="3.5" fill="#e879f9"/>
  <circle cx="75" cy="40" r="3.5" fill="#e879f9"/>
  <circle cx="60" cy="55" r="5" fill="#d8b4fe" filter="url(#glow)"/>
  <!-- Geometric King Sigil -->
  <path d="M40 104 C40 82 48 76 60 76 C72 76 80 82 80 104 Z" fill="#1e1b4b" stroke="#9333ea" stroke-width="1.5"/>
  <polygon points="56,76 60,84 64,76" fill="#f0abfc"/>
  <text x="60" y="70" font-size="9" fill="#e9d5ff" text-anchor="middle" font-weight="bold">AI</text>
  `,
  `<stop offset="0%" stop-color="#c084fc"/><stop offset="100%" stop-color="#7e22ce"/>`
);

// 9. Cyber Knight - Hiệp Sĩ Hắc Mã AI
const CYBER_KNIGHT_AVATAR = createSvgAvatar(
  `<stop offset="0%" stop-color="#0f172a"/><stop offset="100%" stop-color="#020617"/>`,
  `
  <circle cx="60" cy="60" r="48" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.6"/>
  <!-- Cyber Knight Piece -->
  <path d="M42 96 L42 82 C42 64 52 50 64 40 C64 34 60 30 54 30 C50 30 46 32 44 36 C42 32 40 28 42 24 C44 20 52 16 64 18 C76 20 84 30 84 44 C84 60 76 70 76 82 L76 96 Z" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5"/>
  <polygon points="58,36 64,30 68,36" fill="#bae6fd"/>
  <circle cx="60" cy="38" r="3.5" fill="#ffffff" filter="url(#glow)"/>
  <path d="M40 96 L80 96 L76 104 L44 104 Z" fill="#0369a1"/>
  <line x1="50" y1="62" x2="68" y2="62" stroke="#7dd3fc" stroke-width="1.5"/>
  <line x1="53" y1="70" x2="66" y2="70" stroke="#7dd3fc" stroke-width="1.5"/>
  `,
  `<stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#0284c7"/>`
);

// 10. Cyber Rook Sentinel - Pháo Đài Bê Tông AI
const CYBER_ROOK_AVATAR = createSvgAvatar(
  `<stop offset="0%" stop-color="#1f2937"/><stop offset="100%" stop-color="#111827"/>`,
  `
  <circle cx="60" cy="60" r="50" fill="none" stroke="#10b981" stroke-width="1.5" opacity="0.5"/>
  <!-- Castle Fortress Rook Body -->
  <path d="M44 98 L48 50 L44 50 L44 36 L52 36 L52 42 L58 42 L58 36 L62 36 L62 42 L68 42 L68 36 L76 36 L76 50 L72 50 L76 98 Z" fill="#065f46" stroke="#34d399" stroke-width="1.5"/>
  <!-- Glowing Eye Core -->
  <circle cx="60" cy="62" r="5" fill="#34d399" filter="url(#glow)"/>
  <circle cx="60" cy="62" r="2" fill="#ffffff"/>
  <!-- Fortress Gate -->
  <path d="M54 98 L54 82 C54 78 66 78 66 82 L66 98 Z" fill="#022c22"/>
  <path d="M38 98 L82 98 L80 104 L40 104 Z" fill="#047857"/>
  `,
  `<stop offset="0%" stop-color="#34d399"/><stop offset="100%" stop-color="#059669"/>`
);

// 11. Mystic Bishop - Pháp Sư Tượng Trí Tuệ
const MYSTIC_BISHOP_AVATAR = createSvgAvatar(
  `<stop offset="0%" stop-color="#311347"/><stop offset="100%" stop-color="#150524"/>`,
  `
  <circle cx="60" cy="60" r="50" fill="none" stroke="#d946ef" stroke-width="1.5" opacity="0.5"/>
  <!-- Bishop Hat / Mitre -->
  <path d="M46 96 C46 68 48 48 60 28 C72 48 74 68 74 96 Z" fill="#701a75" stroke="#e879f9" stroke-width="1.5"/>
  <circle cx="60" cy="24" r="4" fill="#f472b6" filter="url(#glow)"/>
  <path d="M58 38 L68 48" stroke="#fdf4ff" stroke-width="2" stroke-linecap="round"/>
  <circle cx="60" cy="64" r="4" fill="#fae8ff"/>
  <path d="M40 96 L80 96 L76 104 L44 104 Z" fill="#4a044e"/>
  <text x="60" y="84" font-size="10" fill="#f5d0fe" text-anchor="middle">♗</text>
  `,
  `<stop offset="0%" stop-color="#f472b6"/><stop offset="100%" stop-color="#a21caf"/>`
);

// 12. Hỏa Long AI - Flame Dragon Bot
const FLAME_DRAGON_AVATAR = createSvgAvatar(
  `<stop offset="0%" stop-color="#450a0a"/><stop offset="100%" stop-color="#1c0404"/>`,
  `
  <circle cx="60" cy="60" r="50" fill="none" stroke="#f97316" stroke-width="2" opacity="0.6"/>
  <!-- Blazing Crest -->
  <polygon points="46,92 74,92 72,50 68,50 68,40 64,40 64,46 60,40 56,46 56,40 52,40 52,50 48,50" fill="#ea580c"/>
  <polygon points="52,90 68,90 66,54 54,54" fill="#fb923c"/>
  <!-- Dragon Horns & Flames -->
  <path d="M44 42 Q36 28 42 18 Q50 26 50 36 Z" fill="#facc15"/>
  <path d="M76 42 Q84 28 78 18 Q70 26 70 36 Z" fill="#facc15"/>
  <path d="M60 18 Q68 30 60 40 Q52 30 60 18 Z" fill="#facc15" filter="url(#glow)"/>
  <circle cx="54" cy="60" r="2.5" fill="#fef08a"/>
  <circle cx="66" cy="60" r="2.5" fill="#fef08a"/>
  `,
  `<stop offset="0%" stop-color="#fb923c"/><stop offset="100%" stop-color="#c2410c"/>`
);

// 13. MeowChess Bot - Mèo Kỳ Thủ Anime AI
const MEOW_CHESS_AVATAR = createSvgAvatar(
  `<stop offset="0%" stop-color="#3b1525"/><stop offset="100%" stop-color="#1a070f"/>`,
  `
  <circle cx="60" cy="60" r="50" fill="none" stroke="#f43f5e" stroke-width="1.5" opacity="0.5"/>
  <!-- Cat Ears -->
  <polygon points="36,44 44,20 54,36" fill="#fb7185"/>
  <polygon points="40,40 44,26 50,36" fill="#ffe4e6"/>
  <polygon points="84,44 76,20 66,36" fill="#fb7185"/>
  <polygon points="80,40 76,26 70,36" fill="#ffe4e6"/>
  <!-- Cat Face -->
  <circle cx="60" cy="56" r="22" fill="#fff1f2"/>
  <!-- Cute Eyes -->
  <ellipse cx="51" cy="54" rx="3.5" ry="4.5" fill="#0f172a"/>
  <circle cx="52" cy="52" r="1.5" fill="#ffffff"/>
  <ellipse cx="69" cy="54" rx="3.5" ry="4.5" fill="#0f172a"/>
  <circle cx="70" cy="52" r="1.5" fill="#ffffff"/>
  <!-- Cat Nose & Mouth -->
  <polygon points="58,62 62,62 60,64" fill="#f43f5e"/>
  <path d="M56 65 Q60 68 64 65" stroke="#f43f5e" stroke-width="1.2" fill="none"/>
  <!-- Whiskers -->
  <line x1="38" y1="58" x2="48" y2="60" stroke="#fca5a5" stroke-width="1.2"/>
  <line x1="38" y1="64" x2="48" y2="63" stroke="#fca5a5" stroke-width="1.2"/>
  <line x1="82" y1="58" x2="72" y2="60" stroke="#fca5a5" stroke-width="1.2"/>
  <line x1="82" y1="64" x2="72" y2="63" stroke="#fca5a5" stroke-width="1.2"/>
  <!-- Pawn Crown on Cat Head -->
  <circle cx="60" cy="34" r="3" fill="#f59e0b" filter="url(#glow)"/>
  <!-- Cat Body -->
  <path d="M40 104 C40 84 50 78 60 78 C70 78 80 84 80 104 Z" fill="#f43f5e"/>
  <polygon points="57,78 60,84 63,78" fill="#ffffff"/>
  `,
  `<stop offset="0%" stop-color="#fb7185"/><stop offset="100%" stop-color="#e11d48"/>`
);

// 14. Ninja Pawn AI - Tốt Đột Kích Siêu Tốc
const NINJA_PAWN_AVATAR = createSvgAvatar(
  `<stop offset="0%" stop-color="#18181b"/><stop offset="100%" stop-color="#09090b"/>`,
  `
  <circle cx="60" cy="60" r="50" fill="none" stroke="#71717a" stroke-width="1.5" opacity="0.6"/>
  <!-- Ninja Hood -->
  <circle cx="60" cy="48" r="20" fill="#27272a"/>
  <!-- Ninja Mask Slit -->
  <path d="M46 46 Q60 48 74 46 L72 54 Q60 56 48 54 Z" fill="#09090b"/>
  <!-- Fierce Ninja Eyes -->
  <ellipse cx="53" cy="50" rx="3.5" ry="1.5" fill="#f59e0b" filter="url(#glow)"/>
  <ellipse cx="67" cy="50" rx="3.5" ry="1.5" fill="#f59e0b" filter="url(#glow)"/>
  <!-- Forehead Headband with Pawn Crest -->
  <path d="M42 40 L78 40 L76 34 L44 34 Z" fill="#dc2626"/>
  <circle cx="60" cy="37" r="2.5" fill="#fef08a"/>
  <!-- Ninja Robe -->
  <path d="M38 104 C38 78 48 72 60 72 C72 72 82 78 82 104 Z" fill="#18181b"/>
  <line x1="60" y1="72" x2="60" y2="104" stroke="#dc2626" stroke-width="2"/>
  <text x="60" y="24" font-size="10" fill="#ef4444" text-anchor="middle">♙</text>
  `,
  `<stop offset="0%" stop-color="#ef4444"/><stop offset="100%" stop-color="#71717a"/>`
);

// 15. Cyber Queen Matrix - Nữ Hoàng Không Gian Số
const CYBER_QUEEN_AVATAR = createSvgAvatar(
  `<stop offset="0%" stop-color="#1e1b4b"/><stop offset="100%" stop-color="#090521"/>`,
  `
  <circle cx="60" cy="60" r="52" fill="none" stroke="#818cf8" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.6"/>
  <!-- Queen Matrix Crown -->
  <polygon points="44,30 48,16 54,24 60,12 66,24 72,16 76,30" fill="#6366f1" filter="url(#glow)"/>
  <circle cx="60" cy="12" r="2.5" fill="#a5b4fc"/>
  <!-- Hologram Visage -->
  <path d="M42 66 C42 46 48 38 60 38 C72 38 78 46 78 66 Z" fill="#312e81"/>
  <ellipse cx="60" cy="54" rx="14" ry="16" fill="#c7d2fe" opacity="0.85"/>
  <circle cx="53" cy="52" r="2.5" fill="#4338ca"/>
  <circle cx="67" cy="52" r="2.5" fill="#4338ca"/>
  <line x1="53" y1="62" x2="67" y2="62" stroke="#4f46e5" stroke-width="1.5"/>
  <!-- Gown -->
  <path d="M36 104 C36 80 46 74 60 74 C74 74 84 80 84 104 Z" fill="#4338ca"/>
  <polygon points="56,74 60,82 64,74" fill="#e0e7ff"/>
  `,
  `<stop offset="0%" stop-color="#818cf8"/><stop offset="100%" stop-color="#4338ca"/>`
);

// List of all presets available
export const AVATAR_PRESETS: AvatarPreset[] = [
  // --- NHÓM 1: ADMIN TỐI CAO (CHỈ ADMIN MỚI ĐƯỢC DÙNG) ---
  {
    id: 'admin_tienduc',
    name: 'Admin Tiến Đức VIP Pro',
    role: 'Quản Trị Viên & GM 2950',
    category: 'admin',
    url: ADMIN_TIEN_DUC_AVATAR,
    badge: '👑 ADMIN TỐI CAO',
    flag: '🇻🇳',
    adminOnly: true,
  },

  // --- NHÓM 2: CÁC ĐẠI KIỆN TƯỚNG NỔI TIẾNG (CHỈ ADMIN MỚI CÓ QUYỀN SỬ DỤNG) ---
  {
    id: 'magnus_carlsen',
    name: 'Magnus Carlsen',
    role: 'Vua Cờ Thế Giới • GM 2888',
    category: 'grandmaster',
    url: MAGNUS_CARLSEN_AVATAR,
    badge: '♔ VUA CỜ THẾ GIỚI',
    flag: '🇳🇴',
    adminOnly: true,
  },
  {
    id: 'hikaru_nakamura',
    name: 'Hikaru Nakamura',
    role: 'Vua Cờ Chớp & Streamer • GM 2875',
    category: 'grandmaster',
    url: HIKARU_NAKAMURA_AVATAR,
    badge: '⚡ THÁNH BLITZ',
    flag: '🇺🇸',
    adminOnly: true,
  },
  {
    id: 'le_quang_liem',
    name: 'Lê Quang Liêm',
    role: 'Đại Kiện Tướng Số 1 VN • GM 2780',
    category: 'grandmaster',
    url: LE_QUANG_LIEM_AVATAR,
    badge: '⭐ GM VIỆT NAM #1',
    flag: '🇻🇳',
    adminOnly: true,
  },
  {
    id: 'truong_son',
    name: 'Nguyễn Ngọc Trường Sơn',
    role: 'Đại Kiện Tướng Trầm Tĩnh • GM 2690',
    category: 'grandmaster',
    url: TRUONG_SON_AVATAR,
    badge: '♞ GM VIỆT NAM',
    flag: '🇻🇳',
    adminOnly: true,
  },
  {
    id: 'kim_phung',
    name: 'Võ Thị Kim Phụng',
    role: 'Nữ Đại Kiện Tướng • WGM 2420',
    category: 'grandmaster',
    url: KIM_PHUNG_AVATAR,
    badge: '♕ WGM VIỆT NAM',
    flag: '🇻🇳',
    adminOnly: true,
  },

  // --- NHÓM 3: NHÂN VẬT AI (DÀNH CHO TẤT CẢ KỲ THỦ) ---
  {
    id: 'stockfish_ai',
    name: 'Stockfish AI',
    role: 'Đại Sư Tính Toán Máy Tính',
    category: 'ai_bots',
    url: STOCKFISH_AI_AVATAR,
    badge: '🤖 AI MASTER',
    adminOnly: false,
  },
  {
    id: 'alphachess_bot',
    name: 'AlphaChess Neural Bot',
    role: 'Mạng Nơ-ron AI Siêu Cấp',
    category: 'ai_bots',
    url: ALPHACHESS_BOT_AVATAR,
    badge: '⚡ NEURAL BOT',
    adminOnly: false,
  },
  {
    id: 'cyber_knight',
    name: 'Hiệp Sĩ Hắc Mã AI',
    role: 'Chiến Binh Đột Kích Tốc Độ',
    category: 'ai_bots',
    url: CYBER_KNIGHT_AVATAR,
    badge: '⚔️ CYBER KNIGHT',
    adminOnly: false,
  },
  {
    id: 'cyber_rook',
    name: 'Cyber Rook Sentinel',
    role: 'Pháo Đài Bê Tông Kiên Cố',
    category: 'ai_bots',
    url: CYBER_ROOK_AVATAR,
    badge: '🛡️ TƯỜNG THÀNH AI',
    adminOnly: false,
  },
  {
    id: 'mystic_bishop',
    name: 'Mystic Bishop',
    role: 'Pháp Sư Tượng Trí Tuệ',
    category: 'ai_bots',
    url: MYSTIC_BISHOP_AVATAR,
    badge: '🔮 PHÁP SƯ TƯỢNG',
    adminOnly: false,
  },
  {
    id: 'flame_dragon',
    name: 'Hỏa Long Flame Dragon',
    role: 'Bậc Thầy Tấn Công Hỏa Lực',
    category: 'ai_bots',
    url: FLAME_DRAGON_AVATAR,
    badge: '🔥 FLAME DRAGON',
    adminOnly: false,
  },
  {
    id: 'meow_chess',
    name: 'MeowChess Bot',
    role: 'Mèo Kỳ Thủ Đáng Yêu AI',
    category: 'ai_bots',
    url: MEOW_CHESS_AVATAR,
    badge: '🐱 MEOW MASTER',
    adminOnly: false,
  },
  {
    id: 'ninja_pawn',
    name: 'Ninja Pawn AI',
    role: 'Tốt Đột Kích Bóng Đêm',
    category: 'ai_bots',
    url: NINJA_PAWN_AVATAR,
    badge: '🥷 NINJA PAWN',
    adminOnly: false,
  },
  {
    id: 'cyber_queen',
    name: 'Cyber Queen Matrix',
    role: 'Nữ Hoàng Không Gian Số',
    category: 'ai_bots',
    url: CYBER_QUEEN_AVATAR,
    badge: '👑 QUEEN MATRIX',
    adminOnly: false,
  },
];

export const getAvatarUrlById = (id: string, fallback?: string): string => {
  const found = AVATAR_PRESETS.find((p) => p.id === id);
  if (found) return found.url;
  // Fallback to Cyber Knight for general players
  const defaultPlayer = AVATAR_PRESETS.find((p) => p.id === 'cyber_knight');
  return fallback || (defaultPlayer ? defaultPlayer.url : AVATAR_PRESETS[0].url);
};
