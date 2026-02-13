import { useEffect, useState } from 'react';
import type { Prize } from '../types';
import { HeartIcon } from './icons';

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
    const colors = ['#ffd700', '#dc143c', '#ff6347', '#ffa500', '#ff4444', '#fff8dc'];
    const shapes: Array<'circle' | 'square' | 'star'> = ['circle', 'square', 'star'];
    const particles: Confetti[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    }));
    setConfetti(particles);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-md">
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
              borderRadius: particle.shape === 'circle' ? '50%' : '2px',
              transform: `rotate(${Math.random() * 360}deg)`,
              clipPath: particle.shape === 'star' ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' : 'none',
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,215,0,0.2) 0%, rgba(220,20,60,0.1) 40%, transparent 70%)',
            animation: 'pulse 2.5s ease-in-out infinite',
          }}
        />
      </div>

      <div className="relative transform animate-bounce-in">
        <div className="relative glass-card rounded-2xl p-8 max-w-sm w-full text-center border border-yellow-500/15 overflow-hidden">
          <div className="relative z-10">
            <div className="mb-6 mt-2">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-xl shadow-red-500/30 border border-yellow-500/30">
                <span className="text-4xl">🧧</span>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-1 text-yellow-400">恭喜發財</h2>
            <p className="text-white font-bold text-lg">ยินดีด้วย!</p>
            <p className="text-white/50 text-sm">คุณได้รับรางวัล</p>

            <div className="divider-gold w-20 mx-auto my-5" />

            <div className="bg-white/5 py-6 px-5 rounded-xl border border-yellow-500/10 mb-6">
              {prize.image_url && (
                <img src={prize.image_url} alt={prize.name} className="w-20 h-20 object-contain mx-auto mb-3" />
              )}
              <h3 className="text-xl font-bold text-yellow-400">{prize.name}</h3>
              {prize.description && (
                <p className="text-white/50 text-sm mt-1.5">{prize.description}</p>
              )}
            </div>

            {showDonateForm ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-white/50 text-sm font-medium mb-2">จำนวนเงินบริจาค (บาท)</label>
                  <input
                    type="number"
                    min="1"
                    value={donateAmount}
                    onChange={(e) => setDonateAmount(e.target.value)}
                    placeholder="ระบุจำนวนเงิน"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-yellow-500/10 text-white font-bold text-lg text-center focus:border-yellow-500/40 focus:outline-none focus:ring-2 focus:ring-yellow-500/15"
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
                    className="flex-1 py-3.5 bg-gradient-to-r from-pink-600 to-pink-500 text-white rounded-xl font-bold shadow-lg shadow-pink-500/20 transition-all disabled:opacity-40"
                  >
                    <span className="flex items-center justify-center gap-2">
                      {donating ? 'กำลังบริจาค...' : 'ยืนยันบริจาค'} <HeartIcon className="w-4 h-4" />
                    </span>
                  </button>
                  <button
                    onClick={() => { setShowDonateForm(false); setDonateAmount(''); }}
                    disabled={donating}
                    className="py-3.5 px-5 bg-white/5 text-white/60 rounded-xl font-medium hover:bg-white/10 transition-colors border border-white/10 disabled:opacity-40"
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
                  className={`${prize.is_donatable ? 'flex-1' : 'w-full'} py-3.5 bg-gradient-to-r from-red-700 to-red-600 text-yellow-400 rounded-xl font-bold shadow-lg shadow-red-900/30 hover:shadow-red-800/40 transition-all border border-yellow-500/20 disabled:opacity-40`}
                >
                  <span className="flex items-center justify-center gap-2">
                    รับอั่งเปา <span className="text-lg">🧧</span>
                  </span>
                </button>
                {prize.is_donatable && (
                  <button
                    onClick={() => setShowDonateForm(true)}
                    className="flex-1 py-3.5 bg-gradient-to-r from-pink-600 to-pink-500 text-white rounded-xl font-bold shadow-lg shadow-pink-500/20 hover:shadow-pink-500/30 transition-all"
                  >
                    <span className="flex items-center justify-center gap-2">
                      บริจาค <HeartIcon className="w-4 h-4" />
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>
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
