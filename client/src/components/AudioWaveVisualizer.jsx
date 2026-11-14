import React from 'react';

export default function AudioWaveVisualizer({
  isPlaying = false,
  count = 7,
  color = 'bg-brand-500',
  className = 'h-5',
  showGlow = false,
}) {
  const bars = Array.from({ length: count });

  return (
    <div
      className={`relative inline-flex items-center space-x-1 ${className} ${
        showGlow && isPlaying ? 'filter drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]' : ''
      }`}
    >
      {bars.map((_, i) => {
        // Fluid wave height pattern
        const heights = [35, 75, 100, 60, 90, 45, 80, 100, 50, 70];
        const targetHeight = heights[i % heights.length];
        const delay = (i * 0.12) % 0.7;
        const duration = 0.5 + ((i * 0.14) % 0.4);

        return (
          <span
            key={i}
            className={`w-1 rounded-full transition-all duration-150 ${color} ${
              isPlaying ? 'opacity-100' : 'h-1 opacity-30'
            }`}
            style={
              isPlaying
                ? {
                    height: `${targetHeight}%`,
                    animation: `sound-bounce ${duration}s ease-in-out infinite alternate`,
                    animationDelay: `${delay}s`,
                  }
                : { height: '15%' }
            }
          />
        );
      })}
    </div>
  );
}
