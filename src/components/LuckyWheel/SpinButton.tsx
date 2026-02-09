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
        {/* Outer glow when enabled */}
        {!isDisabled && (
          <div className="absolute -inset-3 rounded-2xl bg-gradient-to-b from-amber-400/40 to-amber-600/30 blur-xl animate-pulse" />
        )}

        <button
          onClick={onClick}
          disabled={isDisabled}
          className={`
            relative px-16 py-5 rounded-xl text-xl font-bold tracking-wide
            transition-all duration-300
            ${isDisabled
              ? 'bg-gradient-to-b from-gray-400 to-gray-500 text-gray-300 cursor-not-allowed shadow-lg'
              : 'btn-premium hover:scale-105 active:scale-100'
            }
          `}
        >
          {/* Shine effect */}
          {!isDisabled && (
            <div className="absolute inset-0 overflow-hidden rounded-xl">
              <div
                className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                style={{
                  animation: 'shine 3s ease-in-out infinite',
                }}
              />
            </div>
          )}

          {spinning ? (
            <span className="flex items-center gap-4">
              <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              กำลังหมุน...
            </span>
          ) : (
            <span className="flex items-center gap-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              หมุนวงล้อ
            </span>
          )}
        </button>
      </div>

      {/* Spins remaining display */}
      {spinsRemaining !== undefined && (
        <div className="relative">
          {/* Subtle glow */}
          <div className="absolute inset-0 rounded-2xl bg-amber-500/10 blur-lg" />

          <div className="relative glass-card px-8 py-4 rounded-2xl border border-amber-500/20">
            <div className="flex items-center gap-4">
              <span className="text-gray-600 font-medium">สิทธิ์คงเหลือ</span>
              <div className="relative">
                {/* Number glow */}
                <div className="absolute inset-0 rounded-full bg-amber-400/30 blur-md" />
                <span
                  className="relative inline-flex items-center justify-center w-12 h-12 rounded-full font-bold text-2xl shadow-lg"
                  style={{
                    background: 'linear-gradient(180deg, #F5E6A3 0%, #D4AF37 50%, #B8860B 100%)',
                    color: '#2d1810',
                    boxShadow: '0 4px 15px rgba(212,175,55,0.4), inset 0 2px 0 rgba(255,255,255,0.3)',
                  }}
                >
                  {spinsRemaining}
                </span>
              </div>
              <span className="text-gray-600 font-medium">ครั้ง</span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shine {
          0% { left: -100%; }
          20% { left: 100%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
}
