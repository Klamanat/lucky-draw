import { TargetIcon } from '../icons';

interface SpinButtonProps {
  onClick: () => void;
  disabled?: boolean;
  spinning?: boolean;
  spinsRemaining?: number;
}

export function SpinButton({ onClick, disabled, spinning, spinsRemaining }: SpinButtonProps) {
  const isDisabled = disabled || spinning || (spinsRemaining !== undefined && spinsRemaining <= 0);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Main spin button */}
      <div className="relative">
        {/* Outer festive glow when enabled */}
        {!isDisabled && (
          <div className="absolute -inset-4 rounded-2xl bg-gradient-to-b from-yellow-400/50 to-red-500/40 blur-xl animate-pulse" />
        )}

        <button
          onClick={onClick}
          disabled={isDisabled}
          className={`
            relative px-16 py-5 rounded-xl text-xl font-bold tracking-wide
            transition-all duration-300
            ${isDisabled
              ? 'bg-gradient-to-b from-gray-400 to-gray-500 text-gray-300 cursor-not-allowed shadow-lg border-2 border-gray-300'
              : 'btn-premium hover:scale-105 active:scale-100'
            }
          `}
        >
          {/* Shine effect */}
          {!isDisabled && (
            <div className="absolute inset-0 overflow-hidden rounded-xl">
              <div
                className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-yellow-300/30 to-transparent skew-x-12"
                style={{
                  animation: 'shine 2s ease-in-out infinite',
                }}
              />
            </div>
          )}

          {spinning ? (
            <span className="flex items-center gap-4">
              <div className="relative">
                <div className="w-6 h-6 border-3 border-yellow-300/30 border-t-yellow-300 rounded-full animate-spin" />
              </div>
              กำลังหมุน...
            </span>
          ) : (
            <span className="flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              หมุนเลย!
            </span>
          )}
        </button>
      </div>

      {/* Spins remaining display */}
      {spinsRemaining !== undefined && (
        <div className="relative">
          {/* Glow */}
          <div className="absolute inset-0 rounded-2xl bg-red-500/20 blur-lg" />

          <div className="relative glass-card px-8 py-4 rounded-2xl border-2 border-yellow-500/40">
            <div className="flex items-center gap-4">
              <span className="text-red-700 font-bold">สิทธิ์คงเหลือ</span>
              <div className="relative">
                {/* Number glow */}
                <div className="absolute inset-0 rounded-full bg-yellow-400/40 blur-md" />
                <span
                  className="relative inline-flex items-center justify-center w-14 h-14 rounded-full font-bold text-2xl shadow-xl border-2 border-red-600"
                  style={{
                    background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 50%, #D4AF37 100%)',
                    color: '#8B0000',
                    boxShadow: '0 4px 20px rgba(255,215,0,0.5), inset 0 2px 0 rgba(255,255,255,0.4)',
                  }}
                >
                  {spinsRemaining}
                </span>
              </div>
              <span className="text-red-700 font-bold">ครั้ง</span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shine {
          0% { left: -100%; }
          50% { left: 100%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
}
