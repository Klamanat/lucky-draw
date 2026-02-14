interface SpinButtonProps {
  onClick: () => void;
  disabled?: boolean;
  spinning?: boolean;
  spinsRemaining?: number;
}

export function SpinButton({ onClick, disabled, spinning, spinsRemaining }: SpinButtonProps) {
  const isDisabled = disabled || spinning || (spinsRemaining !== undefined && spinsRemaining <= 0);

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative">
        {!isDisabled && (
          <div className="absolute -inset-3 rounded-2xl bg-gradient-to-b from-yellow-500/30 to-red-500/30 blur-xl animate-pulse" />
        )}

        <button
          onClick={onClick}
          disabled={isDisabled}
          className={`
            relative px-14 py-4 rounded-xl text-lg font-bold tracking-wide
            transition-all duration-300
            ${isDisabled
              ? 'bg-black/50 text-white/60 cursor-not-allowed border border-white/25'
              : 'btn-premium hover:scale-105 active:scale-100'
            }
          `}
        >
          {!isDisabled && (
            <div className="absolute inset-0 overflow-hidden rounded-xl">
              <div
                className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-yellow-300/15 to-transparent skew-x-12"
                style={{ animation: 'shine 2.5s ease-in-out infinite' }}
              />
            </div>
          )}

          {spinning ? (
            <span className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin" />
              กำลังหมุน...
            </span>
          ) : (
            <span className="flex items-center gap-2.5">
              <span className="text-xl">🎯</span>
              หมุนเลย!
            </span>
          )}
        </button>
      </div>

      {spinsRemaining !== undefined && (
        <div className="glass-card px-6 py-3 rounded-xl border border-yellow-500/25">
          <div className="flex items-center gap-3">
            <span className="text-white/90 text-sm font-medium">สิทธิ์คงเหลือ</span>
            <span
              className="inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg"
              style={{
                background: 'linear-gradient(135deg, #ffd700 0%, #b8860b 100%)',
                color: '#5c0000',
                boxShadow: '0 4px 16px rgba(255,215,0,0.25)',
              }}
            >
              {spinsRemaining}
            </span>
            <span className="text-white/90 text-sm font-medium">ครั้ง</span>
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
