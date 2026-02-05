import type { Prize } from '../types';

interface PrizePopupProps {
  prize: Prize;
  onClose: () => void;
}

export function PrizePopup({ prize, onClose }: PrizePopupProps) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center transform animate-bounce-in">
        {/* Confetti effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'][i % 6],
                animationDelay: `${Math.random() * 0.5}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>

        <div className="text-6xl mb-4">🎉</div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">ยินดีด้วย!</h2>

        <p className="text-gray-600 mb-4">คุณได้รับ</p>

        <div
          className="py-4 px-6 rounded-xl mb-4"
          style={{ backgroundColor: prize.color || '#f97316' }}
        >
          {prize.image_url && (
            <img
              src={prize.image_url}
              alt={prize.name}
              className="w-24 h-24 object-contain mx-auto mb-2"
            />
          )}
          <h3 className="text-2xl font-bold text-white">{prize.name}</h3>
          {prize.description && (
            <p className="text-white/80 text-sm mt-1">{prize.description}</p>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
        >
          รับทราบ
        </button>
      </div>

      <style>{`
        @keyframes bounce-in {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out forwards;
        }
        @keyframes confetti {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti 3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
