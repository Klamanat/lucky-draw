import { useEffect, useState } from 'react';
import type { Prize } from '../types';
import { RedEnvelopeIcon, HeartIcon } from './icons';

interface PrizePopupProps {
  prize: Prize;
  onClaim: () => void;
  onDonate: (amount: number) => void;
  donating?: boolean;
}

interface Confetti {
  id: number;
  x: number;
  delay: number;
  color: string;
  size: number;
  shape: 'circle' | 'square' | 'star';
}

export function PrizePopup({ prize, onClaim, onDonate, donating }: PrizePopupProps) {
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const [showDonateForm, setShowDonateForm] = useState(false);
  const [donateAmount, setDonateAmount] = useState('');

  useEffect(() => {
    // Generate CNY themed confetti
    const colors = ['#FFD700', '#FF4444', '#FFA500', '#DC143C', '#FFEC8B', '#FF6347'];
    const shapes: Array<'circle' | 'square' | 'star'> = ['circle', 'square', 'star'];
    const particles: Confetti[] = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 10 + 5,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
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
              borderRadius: particle.shape === 'circle' ? '50%' : particle.shape === 'star' ? '0' : '2px',
              transform: `rotate(${Math.random() * 360}deg)`,
              clipPath: particle.shape === 'star' ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' : 'none',
            }}
          />
        ))}
      </div>

      {/* Festive glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,215,0,0.4) 0%, rgba(255,0,0,0.2) 40%, transparent 70%)',
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />
      </div>

      {/* Main card - Red Envelope Style */}
      <div className="relative transform animate-bounce-in">
        {/* Outer glow */}
        <div className="absolute -inset-6 rounded-3xl bg-gradient-to-b from-yellow-400/40 to-red-600/30 blur-2xl" />

        <div className="relative bg-gradient-to-b from-red-500 via-red-600 to-red-700 rounded-2xl p-8 max-w-sm w-full text-center border-4 border-yellow-400 overflow-hidden shadow-2xl">
          {/* Chinese pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `repeating-linear-gradient(45deg, #FFD700 0, #FFD700 1px, transparent 0, transparent 50%)`,
              backgroundSize: '20px 20px',
            }} />
          </div>

          {/* Corner decorations */}
          <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-yellow-400 rounded-tl-xl" />
          <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-yellow-400 rounded-tr-xl" />
          <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-yellow-400 rounded-bl-xl" />
          <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-yellow-400 rounded-br-xl" />

          {/* Top decoration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 rounded-b-full" />

          {/* Content */}
          <div className="relative z-10">
            {/* Icon */}
            <div className="mb-6 mt-4">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 flex items-center justify-center shadow-xl ring-4 ring-yellow-300/50">
                <RedEnvelopeIcon className="w-12 h-12 text-red-600" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold mb-2 text-yellow-300" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              恭喜發財
            </h2>
            <p className="text-yellow-100 font-bold text-xl mb-2">ยินดีด้วย!</p>
            <p className="text-red-200">คุณได้รับรางวัล</p>

            {/* Divider */}
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent mx-auto my-6" />

            {/* Prize display */}
            <div className="relative bg-gradient-to-b from-yellow-50 to-orange-100 py-8 px-6 rounded-xl border-2 border-yellow-400 shadow-inner mb-8">
              {/* Inner pattern */}
              <div className="absolute inset-0 opacity-5 rounded-xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-red-500 text-9xl font-bold" style={{ fontFamily: 'serif' }}>
                  福
                </div>
              </div>

              {prize.image_url && (
                <img
                  src={prize.image_url}
                  alt={prize.name}
                  className="w-24 h-24 object-contain mx-auto mb-4 drop-shadow-lg"
                />
              )}
              <h3 className="relative text-2xl font-bold text-red-700">{prize.name}</h3>
              {prize.description && (
                <p className="relative text-red-600/80 text-sm mt-2 font-medium">{prize.description}</p>
              )}
            </div>

            {/* Buttons / Donate Form */}
            {showDonateForm ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-yellow-200 text-sm font-bold mb-2">จำนวนเงินบริจาค (บาท)</label>
                  <input
                    type="number"
                    min="1"
                    value={donateAmount}
                    onChange={(e) => setDonateAmount(e.target.value)}
                    placeholder="ระบุจำนวนเงิน"
                    className="w-full px-4 py-3 rounded-xl bg-gradient-to-b from-yellow-50 to-orange-50 border-2 border-yellow-400 text-red-800 font-bold text-lg text-center focus:border-yellow-300 focus:outline-none focus:ring-4 focus:ring-yellow-400/30"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const amount = parseFloat(donateAmount);
                      if (amount > 0) onDonate(amount);
                    }}
                    disabled={donating || !donateAmount || parseFloat(donateAmount) <= 0}
                    className="flex-1 py-4 bg-gradient-to-r from-pink-500 via-pink-400 to-pink-500 text-white rounded-xl text-lg font-bold shadow-lg hover:shadow-xl transition-all border-2 border-pink-600 disabled:opacity-50"
                  >
                    <span className="flex items-center justify-center gap-2">
                      {donating ? 'กำลังบริจาค...' : 'ยืนยันบริจาค'} <HeartIcon className="w-5 h-5" />
                    </span>
                  </button>
                  <button
                    onClick={() => { setShowDonateForm(false); setDonateAmount(''); }}
                    disabled={donating}
                    className="py-4 px-6 bg-white/20 text-yellow-300 rounded-xl font-bold hover:bg-white/30 transition-colors border-2 border-yellow-400/50 disabled:opacity-50"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={onClaim}
                  disabled={donating}
                  className={`${prize.is_donatable ? 'flex-1' : 'w-full'} py-4 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 text-red-700 rounded-xl text-lg font-bold shadow-lg hover:shadow-xl transition-all border-2 border-yellow-500 disabled:opacity-50`}
                >
                  <span className="flex items-center justify-center gap-2">
                    รับอั่งเปา <RedEnvelopeIcon className="w-5 h-5 text-red-600" />
                  </span>
                </button>
                {prize.is_donatable && (
                  <button
                    onClick={() => setShowDonateForm(true)}
                    className="flex-1 py-4 bg-gradient-to-r from-pink-500 via-pink-400 to-pink-500 text-white rounded-xl text-lg font-bold shadow-lg hover:shadow-xl transition-all border-2 border-pink-600"
                  >
                    <span className="flex items-center justify-center gap-2">
                      บริจาค <HeartIcon className="w-5 h-5" />
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Bottom decoration */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 rounded-t-full" />
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
