import { useState, useEffect } from 'react';
import type { Prize } from '../../types';

interface LuckyWheelProps {
  prizes: Prize[];
  onSpinEnd: (prize: Prize) => void;
  disabled?: boolean;
  targetPrizeId?: string;
}

export function LuckyWheel({ prizes, onSpinEnd, disabled, targetPrizeId }: LuckyWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  const segmentAngle = 360 / prizes.length;

  useEffect(() => {
    if (targetPrizeId && !isSpinning) {
      const targetIndex = prizes.findIndex(p => p.id === targetPrizeId);
      if (targetIndex !== -1) {
        spinToTarget(targetIndex);
      }
    }
  }, [targetPrizeId]);

  const spinToTarget = (targetIndex: number) => {
    setIsSpinning(true);

    const segmentCenter = targetIndex * segmentAngle + segmentAngle / 2;
    const targetAngle = 360 - segmentCenter;
    const totalRotation = rotation + (360 * 10) + targetAngle + (Math.random() * 10 - 5);

    setRotation(totalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      onSpinEnd(prizes[targetIndex]);
    }, 6000);
  };

  return (
    <div className="relative w-[320px] h-[320px] md:w-[400px] md:h-[400px]">
      {/* Outer festive glow */}
      <div
        className="absolute -inset-20 rounded-full animate-glow-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(255,215,0,0.4) 0%, rgba(255,0,0,0.2) 40%, transparent 70%)',
        }}
      />

      {/* Decorative outer ring with Chinese pattern */}
      <div className="absolute -inset-8 rounded-full" style={{
        background: 'linear-gradient(180deg, #8B0000 0%, #5C0000 50%, #3D0000 100%)',
        boxShadow: 'inset 0 4px 20px rgba(255,215,0,0.3), 0 10px 50px rgba(0,0,0,0.5)',
      }}>
        {/* Decorative gold dots and lights */}
        {Array.from({ length: 32 }).map((_, i) => {
          const angle = (i * 11.25 - 90) * (Math.PI / 180);
          const x = 50 + 46 * Math.cos(angle);
          const y = 50 + 46 * Math.sin(angle);
          const isGold = i % 2 === 0;
          return (
            <div
              key={`light-${i}`}
              className="absolute rounded-full"
              style={{
                width: isGold ? '10px' : '6px',
                height: isGold ? '10px' : '6px',
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
                background: isSpinning
                  ? (isGold ? 'linear-gradient(180deg, #FFD700 0%, #FFA500 100%)' : '#FF4444')
                  : (isGold ? 'linear-gradient(180deg, #D4AF37 0%, #B8860B 100%)' : '#CC3333'),
                boxShadow: isSpinning
                  ? `0 0 ${isGold ? '15px' : '10px'} ${isGold ? '#FFD700' : '#FF4444'}`
                  : `0 0 ${isGold ? '8px' : '5px'} ${isGold ? '#D4AF37' : '#CC3333'}`,
                animation: isSpinning ? `glow-pulse 0.2s ease-in-out infinite ${i * 0.03}s` : 'none',
              }}
            />
          );
        })}
      </div>

      {/* Gold ring */}
      <div
        className="absolute -inset-4 rounded-full"
        style={{
          background: 'linear-gradient(180deg, #FFD700 0%, #FFC107 20%, #D4AF37 50%, #B8860B 80%, #8B6914 100%)',
          boxShadow: '0 4px 30px rgba(255,215,0,0.5), inset 0 2px 4px rgba(255,255,255,0.4)',
        }}
      />

      {/* Inner red ring */}
      <div
        className="absolute -inset-1 rounded-full"
        style={{
          background: 'linear-gradient(180deg, #DC143C 0%, #B22222 50%, #8B0000 100%)',
          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.4)',
        }}
      />

      {/* Pointer - Chinese style */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-10 z-20">
        <div
          className="relative"
          style={{
            filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))',
          }}
        >
          {/* Main pointer body */}
          <div
            className="w-12 h-16"
            style={{
              background: 'linear-gradient(180deg, #FFD700 0%, #D4AF37 50%, #B8860B 100%)',
              clipPath: 'polygon(50% 100%, 0% 20%, 20% 0%, 80% 0%, 100% 20%)',
            }}
          />
          {/* Red gem in center */}
          <div
            className="absolute top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #FF6347 0%, #DC143C 50%, #8B0000 100%)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.3)',
            }}
          />
        </div>
      </div>

      {/* Main Wheel */}
      <div
        className="w-full h-full rounded-full overflow-hidden"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning ? 'transform 6s cubic-bezier(0.15, 0.85, 0.15, 1)' : 'none',
          boxShadow: 'inset 0 0 30px rgba(0,0,0,0.3)',
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            {/* CNY Red gradient */}
            <linearGradient id="cny-red" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#DC143C" />
              <stop offset="50%" stopColor="#C41E3A" />
              <stop offset="100%" stopColor="#8B0000" />
            </linearGradient>
            {/* CNY Gold gradient */}
            <linearGradient id="cny-gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFD700" />
              <stop offset="50%" stopColor="#FFC107" />
              <stop offset="100%" stopColor="#D4AF37" />
            </linearGradient>
            {/* Center gradient */}
            <radialGradient id="center-gold" cx="50%" cy="30%">
              <stop offset="0%" stopColor="#FFD700" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#B8860B" />
            </radialGradient>
            {/* Center red */}
            <radialGradient id="center-red" cx="50%" cy="30%">
              <stop offset="0%" stopColor="#FF4444" />
              <stop offset="50%" stopColor="#DC143C" />
              <stop offset="100%" stopColor="#8B0000" />
            </radialGradient>
          </defs>

          {prizes.map((prize, index) => {
            const startAngle = index * segmentAngle;
            const endAngle = startAngle + segmentAngle;

            const startRad = (startAngle - 90) * (Math.PI / 180);
            const endRad = (endAngle - 90) * (Math.PI / 180);

            const x1 = 50 + 48 * Math.cos(startRad);
            const y1 = 50 + 48 * Math.sin(startRad);
            const x2 = 50 + 48 * Math.cos(endRad);
            const y2 = 50 + 48 * Math.sin(endRad);

            const largeArc = segmentAngle > 180 ? 1 : 0;
            const pathD = `M 50 50 L ${x1} ${y1} A 48 48 0 ${largeArc} 1 ${x2} ${y2} Z`;

            const midAngle = (startAngle + endAngle) / 2 - 90;
            const midRad = midAngle * (Math.PI / 180);
            const textX = 50 + 32 * Math.cos(midRad);
            const textY = 50 + 32 * Math.sin(midRad);

            const isRed = index % 2 === 0;

            return (
              <g key={prize.id}>
                <path
                  d={pathD}
                  fill={isRed ? 'url(#cny-red)' : 'url(#cny-gold)'}
                  stroke="#FFD700"
                  strokeWidth="0.5"
                />
                <text
                  x={textX}
                  y={textY}
                  fill={isRed ? '#FFD700' : '#8B0000'}
                  fontSize="3.5"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                  style={{
                    textShadow: isRed ? '0 1px 2px rgba(0,0,0,0.5)' : 'none',
                  }}
                >
                  {truncateText(prize.name, 6)}
                </text>
              </g>
            );
          })}

          {/* Decorative dots around edge */}
          {Array.from({ length: prizes.length * 3 }).map((_, i) => {
            const angle = (i * (360 / (prizes.length * 3)) - 90) * (Math.PI / 180);
            const x = 50 + 44 * Math.cos(angle);
            const y = 50 + 44 * Math.sin(angle);
            return (
              <circle
                key={`dot-${i}`}
                cx={x}
                cy={y}
                r="0.8"
                fill="#FFD700"
              />
            );
          })}

          {/* Center decoration - multi-layer */}
          <circle cx="50" cy="50" r="16" fill="url(#center-gold)" />
          <circle cx="50" cy="50" r="13" fill="#8B0000" />
          <circle cx="50" cy="50" r="11" fill="url(#center-gold)" />
          <circle cx="50" cy="50" r="9" fill="url(#center-red)" />

          {/* Chinese character 福 (Fu - Fortune) */}
          <text
            x="50"
            y="51"
            fill="#FFD700"
            fontSize="8"
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ fontFamily: 'serif' }}
          >
            福
          </text>
        </svg>
      </div>

      {/* Disabled overlay */}
      {disabled && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center">
          <div className="glass-card px-8 py-4 rounded-xl shadow-2xl border-2 border-amber-500/30">
            <span className="text-gray-700 font-bold">หมดสิทธิ์หมุน</span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + '…';
}
