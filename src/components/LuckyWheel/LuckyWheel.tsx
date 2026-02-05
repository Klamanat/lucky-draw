import { useState, useRef, useEffect } from 'react';
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
  const wheelRef = useRef<HTMLDivElement>(null);

  const segmentAngle = 360 / prizes.length;

  useEffect(() => {
    if (targetPrizeId && !isSpinning) {
      // หา index ของรางวัลที่ถูกเลือก
      const targetIndex = prizes.findIndex(p => p.id === targetPrizeId);
      if (targetIndex !== -1) {
        spinToTarget(targetIndex);
      }
    }
  }, [targetPrizeId]);

  const spinToTarget = (targetIndex: number) => {
    setIsSpinning(true);

    // คำนวณมุมที่ต้องหมุนไป
    // เข็มชี้อยู่ด้านบน (0 องศา) ดังนั้นต้องหมุนให้ช่องอยู่ตรงเข็ม
    const segmentCenter = targetIndex * segmentAngle + segmentAngle / 2;
    const targetAngle = 360 - segmentCenter;

    // หมุน 5 รอบ + ไปหยุดที่ตำแหน่งรางวัล
    const totalRotation = rotation + (360 * 5) + targetAngle + (Math.random() * 10 - 5);

    setRotation(totalRotation);

    // รอ animation จบแล้ว callback
    setTimeout(() => {
      setIsSpinning(false);
      onSpinEnd(prizes[targetIndex]);
    }, 5000);
  };

  return (
    <div className="relative w-80 h-80 md:w-96 md:h-96">
      {/* Pointer/Arrow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
        <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-yellow-400 drop-shadow-lg" />
      </div>

      {/* Wheel */}
      <div
        ref={wheelRef}
        className="w-full h-full rounded-full shadow-2xl overflow-hidden"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning ? 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {prizes.map((prize, index) => {
            const startAngle = index * segmentAngle;
            const endAngle = startAngle + segmentAngle;

            // คำนวณ path สำหรับ pie segment
            const startRad = (startAngle - 90) * (Math.PI / 180);
            const endRad = (endAngle - 90) * (Math.PI / 180);

            const x1 = 50 + 50 * Math.cos(startRad);
            const y1 = 50 + 50 * Math.sin(startRad);
            const x2 = 50 + 50 * Math.cos(endRad);
            const y2 = 50 + 50 * Math.sin(endRad);

            const largeArc = segmentAngle > 180 ? 1 : 0;

            const pathD = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`;

            // คำนวณตำแหน่ง text
            const midAngle = (startAngle + endAngle) / 2 - 90;
            const midRad = midAngle * (Math.PI / 180);
            const textX = 50 + 32 * Math.cos(midRad);
            const textY = 50 + 32 * Math.sin(midRad);

            return (
              <g key={prize.id}>
                <path
                  d={pathD}
                  fill={prize.color || getDefaultColor(index)}
                  stroke="#fff"
                  strokeWidth="0.5"
                />
                <text
                  x={textX}
                  y={textY}
                  fill="#fff"
                  fontSize="4"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                  style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                >
                  {truncateText(prize.name, 10)}
                </text>
              </g>
            );
          })}

          {/* Center circle */}
          <circle cx="50" cy="50" r="8" fill="#fff" stroke="#ddd" strokeWidth="1" />
          <circle cx="50" cy="50" r="5" fill="#fbbf24" />
        </svg>
      </div>

      {/* Disabled overlay */}
      {disabled && (
        <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-lg">ไม่มีสิทธิ์หมุน</span>
        </div>
      )}
    </div>
  );
}

function getDefaultColor(index: number): string {
  const colors = [
    '#ef4444', // red
    '#f97316', // orange
    '#eab308', // yellow
    '#22c55e', // green
    '#06b6d4', // cyan
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#ec4899', // pink
  ];
  return colors[index % colors.length];
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + '…';
}
