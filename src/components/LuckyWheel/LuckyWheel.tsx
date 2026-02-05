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
    const totalRotation = rotation + (360 * 8) + targetAngle + (Math.random() * 10 - 5);

    setRotation(totalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      onSpinEnd(prizes[targetIndex]);
    }, 5000);
  };

  return (
    <div className="relative w-[300px] h-[300px] md:w-[360px] md:h-[360px]">
      {/* Outer glow */}
      <div
        className="absolute -inset-8 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%)',
        }}
      />

      {/* Gold outer ring */}
      <div
        className="absolute -inset-4 rounded-full"
        style={{
          background: 'linear-gradient(180deg, #FFD700 0%, #FFC107 30%, #FF9800 70%, #F57C00 100%)',
          boxShadow: '0 4px 20px rgba(255,152,0,0.5)',
        }}
      />

      {/* White inner ring */}
      <div
        className="absolute -inset-2 rounded-full bg-white"
        style={{
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.1)',
        }}
      />

      {/* Pointer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-5 z-20">
        <div
          className="w-8 h-10 relative"
          style={{
            filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.3))',
          }}
        >
          <div
            className="w-full h-full"
            style={{
              background: 'linear-gradient(180deg, #FF5252 0%, #D32F2F 100%)',
              clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)',
            }}
          />
          {/* Gold circle on pointer */}
          <div
            className="absolute top-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full"
            style={{
              background: 'linear-gradient(180deg, #FFD700 0%, #FFC107 100%)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }}
          />
        </div>
      </div>

      {/* Main Wheel */}
      <div
        className="w-full h-full rounded-full overflow-hidden bg-white"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning ? 'transform 5s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)',
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            {/* Bright red gradient */}
            <linearGradient id="red-segment" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF6B6B" />
              <stop offset="50%" stopColor="#EE5A5A" />
              <stop offset="100%" stopColor="#E53935" />
            </linearGradient>
            {/* Cream/off-white gradient */}
            <linearGradient id="cream-segment" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFAF0" />
              <stop offset="50%" stopColor="#FFF8E7" />
              <stop offset="100%" stopColor="#FFECB3" />
            </linearGradient>
            {/* Center gradient */}
            <radialGradient id="center-bg" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#F5F5F5" />
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
                  fill={isRed ? 'url(#red-segment)' : 'url(#cream-segment)'}
                  stroke="#FFD700"
                  strokeWidth="0.5"
                />
                <text
                  x={textX}
                  y={textY}
                  fill={isRed ? '#FFFFFF' : '#C62828'}
                  fontSize="3.2"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                  style={{
                    textShadow: isRed ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
                  }}
                >
                  {truncateText(prize.name, 6)}
                </text>
              </g>
            );
          })}

          {/* Gold dots around edge */}
          {Array.from({ length: prizes.length * 2 }).map((_, i) => {
            const angle = (i * (360 / (prizes.length * 2)) - 90) * (Math.PI / 180);
            const x = 50 + 45 * Math.cos(angle);
            const y = 50 + 45 * Math.sin(angle);
            return (
              <circle
                key={`dot-${i}`}
                cx={x}
                cy={y}
                r="1"
                fill="#FFD700"
              />
            );
          })}

          {/* Center circle - white with gold border */}
          <circle cx="50" cy="50" r="14" fill="url(#center-bg)" stroke="#FFD700" strokeWidth="2" />
          <circle cx="50" cy="50" r="10" fill="#E53935" />
          <text
            x="50"
            y="50.5"
            fill="#FFD700"
            fontSize="6"
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            SPIN
          </text>
        </svg>
      </div>

      {/* Disabled overlay */}
      {disabled && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center">
          <div className="glass-card px-6 py-3 rounded-lg shadow-lg">
            <span className="text-gray-700 font-medium text-sm">หมดสิทธิ์หมุน</span>
          </div>
        </div>
      )}
    </div>
  );
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + '…';
}
