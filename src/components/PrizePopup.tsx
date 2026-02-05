import type { Prize } from '../types';

interface PrizePopupProps {
  prize: Prize;
  onClose: () => void;
}

export function PrizePopup({ prize, onClose }: PrizePopupProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[400px] h-[400px] bg-gradient-radial from-amber-500/20 via-amber-600/10 to-transparent rounded-full" />
      </div>

      <div className="relative bg-white rounded-xl p-8 max-w-sm w-full text-center transform animate-bounce-in shadow-2xl">
        {/* Gold border accent */}
        <div className="absolute inset-0 rounded-xl border border-amber-500/30 pointer-events-none" />

        {/* Top accent line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent" />

        {/* Content */}
        <div className="mb-6 mt-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            ยินดีด้วย
          </h2>
          <p className="text-gray-500">คุณได้รับรางวัล</p>
        </div>

        {/* Prize display */}
        <div className="bg-gradient-to-b from-amber-50 to-orange-50 py-6 px-6 rounded-lg mb-6 border border-amber-200">
          {prize.image_url && (
            <img
              src={prize.image_url}
              alt={prize.name}
              className="w-20 h-20 object-contain mx-auto mb-4"
            />
          )}
          <h3 className="text-xl font-bold text-amber-800">{prize.name}</h3>
          {prize.description && (
            <p className="text-gray-600 text-sm mt-1">{prize.description}</p>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 btn-premium rounded-lg text-base font-semibold"
        >
          รับรางวัล
        </button>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent" />
      </div>

      <style>{`
        @keyframes bounce-in {
          0% { transform: scale(0.9); opacity: 0; }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
