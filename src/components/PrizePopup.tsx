import { useEffect, useState } from 'react';
import type { Prize } from '../types';

interface PrizePopupProps {
  prize: Prize;
  onClose: () => void;
}

interface Confetti {
  id: number;
  x: number;
  delay: number;
  color: string;
  size: number;
}

export function PrizePopup({ prize, onClose }: PrizePopupProps) {
  const [confetti, setConfetti] = useState<Confetti[]>([]);

  useEffect(() => {
    // Generate confetti
    const colors = ['#FFD700', '#FF6B6B', '#D4AF37', '#C41E3A', '#FFF8DC', '#B8860B'];
    const particles: Confetti[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
    }));
    setConfetti(particles);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confetti.map((particle) => (
          <div
            key={particle.id}
            className="absolute animate-confetti"
            style={{
              left: `${particle.x}%`,
              top: '-20px',
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              animationDelay: `${particle.delay}s`,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        ))}
      </div>

      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[500px] h-[500px] rounded-full animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(212,175,55,0.3) 0%, rgba(212,175,55,0.1) 40%, transparent 70%)',
          }}
        />
      </div>

      {/* Main card */}
      <div className="relative transform animate-bounce-in">
        {/* Outer glow */}
        <div className="absolute -inset-4 rounded-3xl bg-gradient-to-b from-amber-400/30 to-amber-600/20 blur-2xl" />

        <div className="relative glass-card rounded-2xl p-10 max-w-sm w-full text-center border border-amber-500/30 overflow-hidden">
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-amber-500/40 rounded-tl-2xl" />
          <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-amber-500/40 rounded-tr-2xl" />
          <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-amber-500/40 rounded-bl-2xl" />
          <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-amber-500/40 rounded-br-2xl" />

          {/* Top accent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-1.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent rounded-full" />

          {/* Sparkle effects */}
          <div className="absolute top-6 left-6 w-3 h-3">
            <div className="absolute inset-0 bg-amber-400 rounded-full animate-ping opacity-75" />
            <div className="absolute inset-0 bg-amber-300 rounded-full" />
          </div>
          <div className="absolute top-10 right-10 w-2 h-2">
            <div className="absolute inset-0 bg-amber-400 rounded-full animate-ping opacity-75" style={{ animationDelay: '0.5s' }} />
            <div className="absolute inset-0 bg-amber-300 rounded-full" />
          </div>
          <div className="absolute bottom-16 left-10 w-2 h-2">
            <div className="absolute inset-0 bg-amber-400 rounded-full animate-ping opacity-75" style={{ animationDelay: '1s' }} />
            <div className="absolute inset-0 bg-amber-300 rounded-full" />
          </div>

          {/* Content */}
          <div className="relative z-10">
            {/* Trophy icon */}
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-xl shadow-amber-500/30 ring-4 ring-amber-300/30">
                <svg className="w-10 h-10 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold mb-2">
              <span className="gold-shimmer">ยินดีด้วย!</span>
            </h2>
            <p className="text-gray-500 font-medium">คุณได้รับรางวัล</p>

            {/* Divider */}
            <div className="divider-gold w-24 mx-auto my-6" />

            {/* Prize display */}
            <div className="relative bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 py-8 px-6 rounded-xl border border-amber-200 shadow-inner mb-8">
              {/* Inner glow */}
              <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/50 rounded-xl pointer-events-none" />

              {prize.image_url && (
                <img
                  src={prize.image_url}
                  alt={prize.name}
                  className="w-24 h-24 object-contain mx-auto mb-4 drop-shadow-lg"
                />
              )}
              <h3 className="relative text-2xl font-bold text-amber-800">{prize.name}</h3>
              {prize.description && (
                <p className="relative text-gray-600 text-sm mt-2 font-medium">{prize.description}</p>
              )}
            </div>

            {/* Button */}
            <button
              onClick={onClose}
              className="w-full py-4 btn-premium rounded-xl text-lg font-bold tracking-wide"
            >
              <span className="flex items-center justify-center gap-2">
                รับรางวัล
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
            </button>
          </div>

          {/* Bottom accent */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-1.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent rounded-full" />
        </div>
      </div>
    </div>
  );
}
