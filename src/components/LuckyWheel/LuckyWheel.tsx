import { useState, useEffect, useRef, useCallback } from 'react';
import type { Prize } from '../../types';

interface LuckyWheelProps {
  prizes: Prize[];
  onSpinEnd: (prize: Prize) => void;
  disabled?: boolean;
  spinning?: boolean;
  targetPrizeId?: string;
}

export function LuckyWheel({ prizes, onSpinEnd, disabled, spinning, targetPrizeId }: LuckyWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'looping' | 'landing'>('idle');
  const animFrameRef = useRef<number>(0);
  const loopRotRef = useRef(0);
  const startTimeRef = useRef(0);
  const baseRotRef = useRef(0);

  const segmentAngle = 360 / prizes.length;

  // Phase 1: Start continuous fast spin (while waiting for API)
  useEffect(() => {
    if (spinning && phase === 'idle') {
      setPhase('looping');
      baseRotRef.current = rotation;
      startTimeRef.current = performance.now();
      loopRotRef.current = 0;
    }
  }, [spinning]);

  // Animate the looping phase
  useEffect(() => {
    if (phase !== 'looping') return;

    const speed = 720; // degrees per second

    const animate = (now: number) => {
      const elapsed = (now - startTimeRef.current) / 1000;
      loopRotRef.current = elapsed * speed;
      setRotation(baseRotRef.current + loopRotRef.current);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [phase]);

  // Phase 2: API responded - land on target
  const landOnTarget = useCallback((targetIndex: number) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const currentRot = baseRotRef.current + loopRotRef.current;
    // Normalize to find where we are
    const normalizedCurrent = ((currentRot % 360) + 360) % 360;

    const segmentCenter = targetIndex * segmentAngle + segmentAngle / 2;
    const targetAngle = (360 - segmentCenter + 360) % 360;

    // Calculate how much more to spin: at least 2 full rotations + land on target
    let delta = targetAngle - normalizedCurrent;
    if (delta < 0) delta += 360;
    const totalExtra = (360 * 3) + delta + (Math.random() * 10 - 5);
    const finalRotation = currentRot + totalExtra;

    setPhase('landing');
    setRotation(finalRotation);

    setTimeout(() => {
      setPhase('idle');
      onSpinEnd(prizes[targetIndex]);
    }, 3000);
  }, [prizes, segmentAngle, onSpinEnd]);

  useEffect(() => {
    if (targetPrizeId && phase === 'looping') {
      const targetIndex = prizes.findIndex(p => p.id === targetPrizeId);
      if (targetIndex !== -1) {
        landOnTarget(targetIndex);
      }
    }
  }, [targetPrizeId, phase, prizes, landOnTarget]);

  const isActive = phase !== 'idle';

  // White-gold-red color pairs: [bg, text]
  const colorPairs = [
    ['#ffffff', '#8b0000'],
    ['#c41e3a', '#ffffff'],
    ['#ffd700', '#5c0000'],
    ['#f5f0e8', '#8b0000'],
    ['#a01830', '#ffd700'],
    ['#fff5d4', '#a01830'],
    ['#8b0000', '#ffd700'],
    ['#fffaf0', '#c41e3a'],
  ];

  // Build transition style based on phase
  let transitionStyle = 'none';
  if (phase === 'landing') {
    transitionStyle = 'transform 3s cubic-bezier(0.12, 0.75, 0.22, 1)';
  }

  return (
    <div className="relative w-[320px] h-[320px] md:w-[400px] md:h-[400px]">
      {/* Dark backdrop circle for contrast */}
      <div
        className="absolute -inset-20 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 50%, transparent 75%)',
        }}
      />

      {/* Outer glow */}
      <div
        className="absolute -inset-16 rounded-full animate-glow-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(255,215,0,0.4) 0%, rgba(255,215,0,0.2) 30%, rgba(220,20,60,0.12) 50%, transparent 70%)',
        }}
      />

      {/* Outer ring - dark with lights */}
      <div className="absolute -inset-7 rounded-full" style={{
        background: 'linear-gradient(180deg, #3a0a0a 0%, #1a0505 100%)',
        boxShadow: 'inset 0 2px 10px rgba(255,215,0,0.2), 0 8px 50px rgba(0,0,0,0.6), 0 0 80px rgba(255,215,0,0.15)',
      }}>
        {/* Light dots */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i * 15 - 90) * (Math.PI / 180);
          const x = 50 + 46 * Math.cos(angle);
          const y = 50 + 46 * Math.sin(angle);
          const isAccent = i % 2 === 0;
          return (
            <div
              key={`light-${i}`}
              className="absolute rounded-full"
              style={{
                width: isAccent ? '8px' : '5px',
                height: isAccent ? '8px' : '5px',
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
                background: isActive
                  ? (isAccent ? '#ffd700' : '#ff4444')
                  : (isAccent ? 'rgba(255,215,0,0.4)' : 'rgba(255,68,68,0.3)'),
                boxShadow: isActive
                  ? `0 0 ${isAccent ? '12px' : '8px'} ${isAccent ? '#ffd700' : '#ff4444'}`
                  : `0 0 ${isAccent ? '6px' : '3px'} ${isAccent ? 'rgba(255,215,0,0.25)' : 'rgba(255,68,68,0.15)'}`,
                animation: isActive ? `glow-pulse 0.3s ease-in-out infinite ${i * 0.04}s` : 'none',
              }}
            />
          );
        })}
      </div>

      {/* Gold ring */}
      <div
        className="absolute -inset-3 rounded-full"
        style={{
          background: 'linear-gradient(180deg, #ffe44d 0%, #ffd700 25%, #d4a017 60%, #b8860b 100%)',
          boxShadow: '0 2px 40px rgba(255,215,0,0.6), 0 0 80px rgba(255,215,0,0.25)',
        }}
      />

      {/* Inner red ring */}
      <div
        className="absolute -inset-1 rounded-full"
        style={{
          background: 'linear-gradient(180deg, #8b0000 0%, #3a0a0a 100%)',
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)',
        }}
      />

      {/* Pointer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 z-20">
        <div style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))' }}>
          <div
            className="w-10 h-14"
            style={{
              background: 'linear-gradient(180deg, #ffd700 0%, #d4a017 50%, #b8860b 100%)',
              clipPath: 'polygon(50% 100%, 0% 20%, 20% 0%, 80% 0%, 100% 20%)',
            }}
          />
          <div
            className="absolute top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #ff6347 0%, #dc143c 50%, #8b0000 100%)',
              boxShadow: '0 0 10px rgba(220,20,60,0.5)',
            }}
          />
        </div>
      </div>

      {/* Main Wheel */}
      <div
        className="w-full h-full rounded-full overflow-hidden"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: transitionStyle,
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)',
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            {colorPairs.map((pair, i) => (
              <linearGradient key={`grad-${i}`} id={`seg-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={pair[0]} />
                <stop offset="100%" stopColor={pair[0]} stopOpacity="0.9" />
              </linearGradient>
            ))}
            <radialGradient id="center-grad" cx="50%" cy="30%">
              <stop offset="0%" stopColor="#ffd700" />
              <stop offset="40%" stopColor="#d4a017" />
              <stop offset="100%" stopColor="#b8860b" />
            </radialGradient>
            {/* Inner shadow for depth */}
            <radialGradient id="wheel-shadow" cx="50%" cy="50%">
              <stop offset="70%" stopColor="transparent" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.15)" />
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

            const colorIdx = index % colorPairs.length;
            const textColor = colorPairs[colorIdx][1];

            return (
              <g key={prize.id}>
                <path
                  d={pathD}
                  fill={`url(#seg-${colorIdx})`}
                  stroke="rgba(184,134,11,0.5)"
                  strokeWidth="0.4"
                />
                <text
                  x={textX}
                  y={textY}
                  fill={textColor}
                  fontSize="3.8"
                  fontWeight="800"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.15)' }}
                >
                  {truncateText(prize.name, 6)}
                </text>
              </g>
            );
          })}

          {/* Inner shadow overlay */}
          <circle cx="50" cy="50" r="48" fill="url(#wheel-shadow)" />

          {/* Center decoration */}
          <circle cx="50" cy="50" r="15" fill="#3a0a0a" stroke="rgba(255,215,0,0.5)" strokeWidth="0.8" />
          <circle cx="50" cy="50" r="12" fill="url(#center-grad)" stroke="rgba(255,215,0,0.3)" strokeWidth="0.3" />
          <text
            x="50"
            y="51"
            fill="#8b0000"
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
          <div className="glass-card px-6 py-3 rounded-xl border border-white/20">
            <span className="text-white/80 font-bold text-sm">หมดสิทธิ์หมุน</span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.5; }
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
