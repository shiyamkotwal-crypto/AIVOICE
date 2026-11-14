import React, { useEffect, useRef, useState } from 'react';
import { useAudio } from '../context/AudioContext';

/**
 * RainbowWaveBackground
 * High-performance HTML5 Canvas rendering multi-layered, vibrant spectrum waves
 * that continuously flow from left to right across the screen with an opening surge animation.
 */
export default function RainbowWaveBackground({
  className = '',
  height = '100%',
  opacity = 0.85,
  density = 5,
  speedMultiplier = 1.0,
  showControls = false,
}) {
  const canvasRef = useRef(null);
  const audioContext = useAudio();
  const isSpeaking = audioContext?.isSpeaking || false;
  const [waveMode, setWaveMode] = useState('vibrant'); // 'subtle' | 'vibrant' | 'cosmic'
  const [openingProgress, setOpeningProgress] = useState(0);

  useEffect(() => {
    // Opening sweep animation (0 to 1 over 2.5 seconds)
    const startTime = performance.now();
    const duration = 2500;
    let animId;

    const tickOpening = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      setOpeningProgress(progress);
      if (progress < 1) {
        animId = requestAnimationFrame(tickOpening);
      }
    };
    animId = requestAnimationFrame(tickOpening);
    return () => cancelAnimationFrame(animId);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let heightPx = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      const dpr = window.devicePixelRatio || 1;
      width = canvas.parentElement.clientWidth;
      heightPx = canvas.parentElement.clientHeight || 450;
      canvas.width = width * dpr;
      canvas.height = heightPx * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Multi-color spectrum palette (Vibrant neon & pastel waves)
    const wavePalettes = [
      {
        // 1. Cyan to Emerald (Aqua Wave)
        gradient: ['rgba(6, 182, 212, 0.75)', 'rgba(16, 185, 129, 0.55)', 'rgba(20, 184, 166, 0.0)'],
        baseFreq: 0.0028,
        speed: 0.035,
        amp: 45,
        yRatio: 0.48,
      },
      {
        // 2. Electric Violet to Purple (Cosmic Wave)
        gradient: ['rgba(139, 92, 246, 0.70)', 'rgba(168, 85, 247, 0.50)', 'rgba(99, 102, 241, 0.0)'],
        baseFreq: 0.0022,
        speed: 0.028,
        amp: 55,
        yRatio: 0.52,
      },
      {
        // 3. Neon Magenta to Rose Pink (Vibrant Wave)
        gradient: ['rgba(236, 72, 153, 0.65)', 'rgba(244, 63, 94, 0.45)', 'rgba(217, 70, 239, 0.0)'],
        baseFreq: 0.0035,
        speed: 0.042,
        amp: 40,
        yRatio: 0.56,
      },
      {
        // 4. Radiant Royal Blue to Sky Blue (Deep Wave)
        gradient: ['rgba(59, 130, 246, 0.70)', 'rgba(14, 165, 233, 0.50)', 'rgba(96, 165, 250, 0.0)'],
        baseFreq: 0.0019,
        speed: 0.024,
        amp: 65,
        yRatio: 0.44,
      },
      {
        // 5. Golden Amber to Coral Sun (Warm Radiant Wave)
        gradient: ['rgba(245, 158, 11, 0.65)', 'rgba(251, 146, 60, 0.45)', 'rgba(234, 179, 8, 0.0)'],
        baseFreq: 0.0031,
        speed: 0.038,
        amp: 48,
        yRatio: 0.50,
      },
      {
        // 6. Brilliant Mint to Turquoise (Crystalline Accent)
        gradient: ['rgba(52, 211, 153, 0.60)', 'rgba(45, 212, 191, 0.40)', 'rgba(16, 185, 129, 0.0)'],
        baseFreq: 0.0040,
        speed: 0.046,
        amp: 36,
        yRatio: 0.54,
      },
    ];

    let phase = 0;
    let sweepX = 0; // Opening wave sweep beam from left to right

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const actualW = canvas.width / dpr;
      const actualH = canvas.height / dpr;

      ctx.clearRect(0, 0, actualW, actualH);

      // Boost amplitude if audio is speaking or cosmic mode is active
      const ampMultiplier = isSpeaking ? 1.7 : waveMode === 'cosmic' ? 1.4 : waveMode === 'subtle' ? 0.7 : 1.0;
      const speedFactor = speedMultiplier * (waveMode === 'cosmic' ? 1.3 : 1.0);

      // Phase moves backward so the wave mathematical peak travels LEFT TO RIGHT:
      // y = sin(k*x - phase) => as phase increases, wave travels rightward!
      phase += 0.03 * speedFactor;

      // Draw each colorful wave ribbon
      wavePalettes.slice(0, density).forEach((wave, index) => {
        ctx.save();
        ctx.beginPath();

        const baseY = actualH * wave.yRatio;
        const currentAmp = wave.amp * ampMultiplier;
        const freq = wave.baseFreq;
        const wavePhase = phase * (wave.speed / 0.03) + index * 1.2;

        ctx.moveTo(0, actualH);
        ctx.lineTo(0, baseY);

        // Step by 8px for silky smooth 60fps rendering
        for (let x = 0; x <= actualW + 16; x += 8) {
          // Complex organic wave: fundamental frequency + second harmonic
          const y =
            baseY +
            Math.sin(x * freq - wavePhase) * currentAmp +
            Math.cos(x * freq * 0.65 - wavePhase * 0.6) * (currentAmp * 0.45) +
            Math.sin(x * 0.0008 + wavePhase * 0.3) * (currentAmp * 0.25);
          ctx.lineTo(x, y);
        }

        ctx.lineTo(actualW, actualH);
        ctx.closePath();

        // Multi-color flowing horizontal gradient from left to right
        const grad = ctx.createLinearGradient(0, 0, actualW, actualH);
        grad.addColorStop(0, wave.gradient[0]);
        grad.addColorStop(0.5, wave.gradient[1]);
        grad.addColorStop(1, wave.gradient[2]);

        ctx.fillStyle = grad;
        ctx.globalAlpha = opacity;
        ctx.fill();

        // Glowing crest stroke
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = wave.gradient[0];
        ctx.stroke();

        ctx.restore();
      });

      // Opening sweep wave effect running across from left to right
      if (sweepX < actualW * 1.5) {
        sweepX += actualW * 0.015;
        const sweepGrad = ctx.createLinearGradient(sweepX - 250, 0, sweepX + 250, 0);
        sweepGrad.addColorStop(0, 'rgba(6, 182, 212, 0)');
        sweepGrad.addColorStop(0.3, 'rgba(168, 85, 247, 0.25)');
        sweepGrad.addColorStop(0.5, 'rgba(236, 72, 153, 0.45)');
        sweepGrad.addColorStop(0.7, 'rgba(16, 185, 129, 0.25)');
        sweepGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');

        ctx.save();
        ctx.fillStyle = sweepGrad;
        ctx.fillRect(0, 0, actualW, actualH);
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [opacity, density, speedMultiplier, waveMode, isSpeaking]);

  return (
    <div
      className={`relative overflow-hidden pointer-events-none ${className}`}
      style={{ height }}
    >
      {/* HTML5 Canvas with hardware acceleration */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block transform-gpu"
        style={{ filter: waveMode === 'cosmic' ? 'blur(1px)' : 'none' }}
      />

      {/* Opening Shimmer Beam from Left to Right */}
      <div
        className="absolute inset-0 pointer-events-none mix-blend-screen opacity-70"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(6,182,212,0.15) 25%, rgba(168,85,247,0.25) 50%, rgba(236,72,153,0.2) 75%, transparent 100%)',
          animation: 'wave-sweep-right 3s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        }}
      />

      {/* Subtle Radial Glow Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none opacity-80" />

      {/* Interactive Controls (Optional) */}
      {showControls && (
        <div className="absolute bottom-3 right-4 pointer-events-auto z-20 flex items-center space-x-2 text-xs bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/60 shadow-lg">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-slate-300 font-medium">Spectrum Waves:</span>
          <div className="flex space-x-1">
            {['subtle', 'vibrant', 'cosmic'].map((mode) => (
              <button
                key={mode}
                onClick={() => setWaveMode(mode)}
                className={`px-2 py-0.5 rounded-full capitalize text-[11px] transition-all ${
                  waveMode === mode
                    ? 'bg-brand-500 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
