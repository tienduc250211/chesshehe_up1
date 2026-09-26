import React, { useEffect, useRef } from 'react';

export type BackgroundTheme = 'royal-amber' | 'cosmic-slate' | 'subtle-grid';

interface AmbientBackgroundProps {
  theme?: BackgroundTheme;
}

/**
 * Hiệu ứng nền VIP Hoàng Gia (Ambient Luxury Visuals)
 * - Lưới không gian 3D viền vàng hoàng kim (3D Perspective Chess Stage Grid)
 * - Bầu trời hạt tinh tú & chòm sao lấp lánh (Golden Constellation & Star Dust)
 * - Đèn rọi sân khấu VIP (Top-down Royal Spotlights)
 * - Các đại quân cờ hoàng gia phát sáng lơ lửng (Floating Glowing Chess Holograms)
 */
export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({
  theme = 'royal-amber',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // HTML5 Canvas animation loop for VIP particles & constellation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Track mouse coordinates for smooth interactive parallax & light aura
    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Interactive floating particles: Gold dust, starbursts, and chess glyphs
    const chessChars = ['♔', '♕', '♖', '♗', '♘', '♙'];
    const particleCount = 55;
    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      alpha: number;
      pulseSpeed: number;
      pulseVal: number;
      char?: string;
      charSize?: number;
      isSpark?: boolean;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      const isGlyph = i < 18;
      const isSpark = !isGlyph && i % 3 === 0;
      const x = Math.random() * width;
      const y = Math.random() * height;
      particles.push({
        x,
        y,
        radius: isGlyph ? 0 : isSpark ? Math.random() * 2.8 + 1.2 : Math.random() * 1.8 + 0.8,
        vx: (Math.random() - 0.5) * 0.55,
        vy: -Math.random() * 0.45 - 0.2,
        alpha: Math.random() * 0.45 + 0.2,
        pulseSpeed: Math.random() * 0.03 + 0.015,
        pulseVal: Math.random() * Math.PI * 2,
        char: isGlyph ? chessChars[Math.floor(Math.random() * chessChars.length)] : undefined,
        charSize: isGlyph ? Math.floor(Math.random() * 18 + 16) : undefined,
        isSpark,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Interpolate mouse with smoothing
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;
      const offsetX = (mouseX - width / 2) * 0.025;
      const offsetY = (mouseY - height / 2) * 0.025;

      // Color scheme based on theme
      const isSlate = theme === 'cosmic-slate';
      const primaryR = isSlate ? 99 : 245;
      const primaryG = isSlate ? 102 : 166;
      const primaryB = isSlate ? 241 : 35;

      // Interactive mouse subtle golden spotlight aura on canvas
      const mouseGrad = ctx.createRadialGradient(
        targetMouseX,
        targetMouseY,
        0,
        targetMouseX,
        targetMouseY,
        280
      );
      mouseGrad.addColorStop(0, `rgba(${primaryR}, ${primaryG}, ${primaryB}, 0.08)`);
      mouseGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = mouseGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw VIP connection lines between close particles (Golden Constellation Effect)
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 125) {
            const lineAlpha = (1 - dist / 125) * 0.16; // rõ nét hơn
            ctx.strokeStyle = `rgba(${primaryR}, ${primaryG}, ${primaryB}, ${lineAlpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x + offsetX, particles[i].y + offsetY);
            ctx.lineTo(particles[j].x + offsetX, particles[j].y + offsetY);
            ctx.stroke();
          }
        }
      }

      // Update & render particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulseVal += p.pulseSpeed;
        const dynamicAlpha = Math.max(0.12, p.alpha + Math.sin(p.pulseVal) * 0.18);

        // Screen wrap
        if (p.y < -40) {
          p.y = height + 40;
          p.x = Math.random() * width;
        }
        if (p.x < -40) p.x = width + 40;
        if (p.x > width + 40) p.x = -40;

        const drawX = p.x + offsetX;
        const drawY = p.y + offsetY;

        if (p.char) {
          ctx.font = `600 ${p.charSize}px serif`;
          ctx.fillStyle = `rgba(${primaryR}, ${primaryG}, ${primaryB}, ${dynamicAlpha * 0.75})`;
          ctx.shadowBlur = 8;
          ctx.shadowColor = `rgba(${primaryR}, ${primaryG}, ${primaryB}, 0.6)`;
          ctx.fillText(p.char, drawX, drawY);
          ctx.shadowBlur = 0;
        } else if (p.isSpark) {
          // 4-point golden star sparkle
          const s = p.radius * 2.2;
          ctx.fillStyle = `rgba(255, 245, 200, ${dynamicAlpha * 0.9})`;
          ctx.shadowBlur = 10;
          ctx.shadowColor = `rgba(${primaryR}, ${primaryG}, ${primaryB}, 0.85)`;
          ctx.beginPath();
          ctx.moveTo(drawX, drawY - s);
          ctx.lineTo(drawX + s * 0.3, drawY);
          ctx.lineTo(drawX + s, drawY);
          ctx.lineTo(drawX + s * 0.3, drawY + s * 0.3);
          ctx.lineTo(drawX, drawY + s);
          ctx.lineTo(drawX - s * 0.3, drawY + s * 0.3);
          ctx.lineTo(drawX - s, drawY);
          ctx.lineTo(drawX - s * 0.3, drawY);
          ctx.closePath();
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          ctx.beginPath();
          ctx.arc(drawX, drawY, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${primaryR}, ${primaryG}, ${primaryB}, ${dynamicAlpha * 0.85})`;
          ctx.shadowBlur = 7;
          ctx.shadowColor = `rgba(${primaryR}, ${primaryG}, ${primaryB}, 0.65)`;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  // Floating larger decorative chess pieces drifting with Tailwind animations & VIP glow
  const floatingPieces = [
    { symbol: '♔', top: '8%', left: '5%', size: 'text-8xl', anim: 'animate-chess-float-1', crown: true },
    { symbol: '♕', top: '65%', left: '88%', size: 'text-9xl', anim: 'animate-chess-float-2' },
    { symbol: '♘', top: '15%', left: '84%', size: 'text-7xl', anim: 'animate-chess-float-3', crown: true },
    { symbol: '♗', top: '56%', left: '8%', size: 'text-7xl', anim: 'animate-chess-float-4' },
    { symbol: '♖', top: '78%', left: '32%', size: 'text-8xl', anim: 'animate-chess-float-1' },
    { symbol: '♙', top: '28%', left: '46%', size: 'text-6xl', anim: 'animate-chess-float-3' },
    { symbol: '♘', top: '5%', left: '60%', size: 'text-7xl', anim: 'animate-chess-float-2', crown: true },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* HTML5 Particle Motion Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* VIP Sân Khấu Hoàng Gia: Ánh Đèn Rọi Chiếu Tâm Điểm (Top Overhead Royal Spotlight) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.18)_0%,rgba(217,119,6,0.06)_45%,transparent_75%)] pointer-events-none blur-2xl" />

      {/* Dynamic Animated Glowing Aurora Waves - Tăng độ rõ & độ sang trọng */}
      {theme === 'royal-amber' && (
        <>
          <div className="absolute top-[-10%] left-[12%] w-[600px] h-[600px] rounded-full bg-amber-500/18 blur-[120px] pointer-events-none animate-aurora-1" />
          <div className="absolute bottom-[-10%] right-[8%] w-[700px] h-[700px] rounded-full bg-yellow-500/14 blur-[140px] pointer-events-none animate-aurora-2" />
          <div className="absolute top-[32%] right-[4%] w-[450px] h-[450px] rounded-full bg-amber-600/12 blur-[100px] pointer-events-none animate-aurora-1" />
          <div className="absolute bottom-[20%] left-[6%] w-[500px] h-[500px] rounded-full bg-orange-600/10 blur-[130px] pointer-events-none animate-aurora-2" />
        </>
      )}

      {theme === 'cosmic-slate' && (
        <>
          <div className="absolute top-[-15%] right-[15%] w-[650px] h-[650px] rounded-full bg-indigo-500/16 blur-[130px] pointer-events-none animate-aurora-1" />
          <div className="absolute bottom-[-10%] left-[10%] w-[600px] h-[600px] rounded-full bg-cyan-600/14 blur-[120px] pointer-events-none animate-aurora-2" />
          <div className="absolute top-[40%] left-[25%] w-[500px] h-[500px] rounded-full bg-purple-600/12 blur-[110px] pointer-events-none animate-aurora-1" />
        </>
      )}

      {/* 3D Perspective Chess Arena Grid (Lưới sàn đấu trường cờ 3D phát sáng rõ nét) */}
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none animate-grid-glow"
        style={{
          backgroundImage: `
            linear-gradient(to right, #f59e0b 1.2px, transparent 1.2px),
            linear-gradient(to bottom, #f59e0b 1.2px, transparent 1.2px)
          `,
          backgroundSize: '54px 54px',
          maskImage: 'radial-gradient(circle at 50% 50%, black 30%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 30%, transparent 85%)',
        }}
      />

      {/* Sàn cờ 3D có chiều sâu ở phía dưới (3D Horizon Perspective Grid) */}
      <div
        className="absolute -bottom-24 left-0 right-0 h-[380px] opacity-[0.14] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #fbbf24 1.5px, transparent 1.5px),
            linear-gradient(to bottom, #fbbf24 1.5px, transparent 1.5px)
          `,
          backgroundSize: '40px 40px',
          transform: 'perspective(500px) rotateX(60deg)',
          transformOrigin: 'bottom center',
          maskImage: 'linear-gradient(to top, black 30%, transparent 95%)',
          WebkitMaskImage: 'linear-gradient(to top, black 30%, transparent 95%)',
        }}
      />

      {/* Floating Animated Chess Silhouettes with VIP Golden Glow */}
      <div className="absolute inset-0 pointer-events-none">
        {floatingPieces.map((p, idx) => (
          <div
            key={idx}
            className={`absolute ${p.size} text-amber-400/18 font-serif ${p.anim} pointer-events-none drop-shadow-[0_0_15px_rgba(245,158,11,0.25)]`}
            style={{
              top: p.top,
              left: p.left,
              filter: 'blur(0.5px)',
            }}
          >
            {p.symbol}
          </div>
        ))}
      </div>

      {/* Subtle Vignette Overlay to maintain pristine board contrast */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(22,21,18,0.68)_85%)] pointer-events-none" />
    </div>
  );
};
