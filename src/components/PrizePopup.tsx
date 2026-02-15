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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-md">
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
              borderRadius: particle.shape === 'circle' ? '50%' : '2px',
              transform: `rotate(${Math.random() * 360}deg)`,
              clipPath: particle.shape === 'star' ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' : 'none',
            }}
          />
        ))}
      </div>

      {/* Pulsing glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,215,0,0.25) 0%, rgba(220,20,60,0.12) 40%, transparent 70%)',
            animation: 'pulse 2.5s ease-in-out infinite',
          }}
        />
      </div>

      {/* Popup */}
      <div className="relative transform animate-bounce-in w-[32vw] min-w-[340px] max-w-[420px]">
        <div
          className="relative overflow-hidden text-white rounded-2xl"
          style={{
            background: 'linear-gradient(160deg, #8b1a2b 0%, #5c0a15 40%, #1a0508 100%)',
            border: '1px solid rgba(255, 215, 0, 0.25)',
            boxShadow: '0 25px 80px rgba(0, 0, 0, 0.6), 0 0 60px rgba(200, 30, 50, 0.15), inset 0 1px 0 rgba(255, 215, 0, 0.15)',
          }}
        >
          {/* Effects BG */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="glitter-layer" />
            <span className="spark s1" />
            <span className="spark s2" />
            <span className="spark s3" />

            <div className="coins">
              <span>🪙</span>
              <span>🪙</span>
              <span>🪙</span>
              <span>🪙</span>
              <span>🪙</span>
            </div>

            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] rounded-full" style={{
              background: 'radial-gradient(ellipse, rgba(255, 180, 50, 0.15) 0%, transparent 70%)',
              filter: 'blur(30px)',
            }} />

            <div className="absolute border inset-3 rounded-xl border-yellow-400/20" />
          </div>

          {/* Content */}
          <div className="relative z-10 p-8 text-center">
            <div className="mb-5 mt-1">
              <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center shadow-lg border border-yellow-500/20" style={{
                background: 'linear-gradient(135deg, rgba(200, 30, 50, 0.4) 0%, rgba(140, 20, 40, 0.3) 100%)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 24px rgba(200, 30, 50, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              }}>
                <span className="text-4xl">🧧</span>
              </div>
            </div>

            <h2 className="text-3xl font-extrabold mb-1">
              <span className="gold-shimmer">恭喜發財</span>
            </h2>
            <p className="text-white font-extrabold text-xl">ยินดีด้วย!</p>
            <p className="text-white/70 text-sm font-bold mt-1">คุณได้รับรางวัล</p>

            <div className="divider-gold w-20 mx-auto my-5" />

            {/* Prize display */}
            <div className="py-5 px-5 rounded-xl mb-6" style={{
              background: 'rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(255, 215, 0, 0.1)',
            }}>
              {prize.image_url && (
                <img src={prize.image_url} alt={prize.name} className="w-20 h-20 object-contain mx-auto mb-3" />
              )}
              <h3 className="text-2xl font-extrabold">
                <span className="gold-shimmer">{prize.name}</span>
              </h3>
              {prize.description && (
                <p className="text-white/70 text-sm font-semibold mt-1.5">{prize.description}</p>
              )}
            </div>

            {showDonateForm ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-yellow-300/90 text-sm font-extrabold mb-2">จำนวนเงินบริจาค (บาท)</label>
                  <input
                    type="number"
                    min="1"
                    value={donateAmount}
                    onChange={(e) => setDonateAmount(e.target.value)}
                    placeholder="ระบุจำนวนเงิน"
                    className="w-full px-4 py-3 rounded-xl text-white font-bold text-lg text-center focus:outline-none transition-all"
                    style={{
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(255, 215, 0, 0.12)',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'rgba(255, 215, 0, 0.35)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(255, 215, 0, 0.08)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 215, 0, 0.12)';
                      e.target.style.boxShadow = 'none';
                    }}
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
                    className="flex-1 py-3.5 bg-gradient-to-r from-pink-600 to-pink-500 text-white rounded-xl font-extrabold shadow-lg shadow-pink-500/20 transition-all disabled:opacity-40 text-sm"
                  >
                    <span className="flex items-center justify-center gap-2">
                      {donating ? 'กำลังบริจาค...' : 'ยืนยันบริจาค'} <HeartIcon className="w-4 h-4" />
                    </span>
                  </button>
                  <button
                    onClick={() => { setShowDonateForm(false); setDonateAmount(''); }}
                    disabled={donating}
                    className="py-3.5 px-5 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors disabled:opacity-40"
                    style={{
                      background: 'rgba(0, 0, 0, 0.25)',
                      color: 'rgba(255, 255, 255, 0.8)',
                      border: '1px solid rgba(255, 215, 0, 0.1)',
                    }}
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
                  className={`${prize.is_donatable ? 'flex-1' : 'w-full'} py-3.5 font-extrabold text-base tracking-wide rounded-xl active:scale-[0.98] transition-all disabled:opacity-40`}
                  style={{
                    background: 'linear-gradient(135deg, #ffd700 0%, #d4a017 50%, #b8860b 100%)',
                    color: '#5c0000',
                    border: '1px solid rgba(255, 215, 0, 0.4)',
                    boxShadow: '0 4px 20px rgba(255, 215, 0, 0.2)',
                  }}
                >
                  <span className="flex items-center justify-center gap-2">
                    รับอั่งเปา <span className="text-lg">🧧</span>
                  </span>
                </button>
                {prize.is_donatable && (
                  <button
                    onClick={() => setShowDonateForm(true)}
                    className="flex-1 py-3.5 bg-gradient-to-r from-pink-600 to-pink-500 text-white rounded-xl font-extrabold shadow-lg shadow-pink-500/20 hover:shadow-pink-500/30 transition-all text-base"
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
