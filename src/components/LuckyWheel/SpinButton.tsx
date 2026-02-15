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
          <div className="absolute -inset-4 rounded-2xl bg-gradient-to-b from-yellow-500/40 to-red-500/40 blur-xl animate-pulse" />
        )}

        <button
          onClick={onClick}
          disabled={isDisabled}
          className={`
            relative px-16 py-5 rounded-xl text-xl font-extrabold tracking-wide
            transition-all duration-300
            ${isDisabled
              ? 'cursor-not-allowed'
              : 'hover:scale-105 active:scale-100'
            }
          `}
          style={isDisabled ? {
            background: 'rgba(0,0,0,0.4)',
            color: 'rgba(255,255,255,0.5)',
            border: '1px solid rgba(255,255,255,0.15)',
          } : {
            background: 'linear-gradient(135deg, #ffd700 0%, #d4a017 50%, #b8860b 100%)',
            color: '#5c0000',
            border: '1px solid rgba(255, 215, 0, 0.5)',
            boxShadow: '0 6px 30px rgba(255, 215, 0, 0.35), 0 0 60px rgba(255, 215, 0, 0.1)',
          }}
        >
          {!isDisabled && (
            <div className="absolute inset-0 overflow-hidden rounded-xl">
              <div
                className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12"
                style={{ animation: 'shine 2.5s ease-in-out infinite' }}
              />
            </div>
          )}

          {spinning ? (
            <span className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-red-900/30 border-t-red-900 rounded-full animate-spin" />
              กำลังหมุน...
            </span>
          ) : (
            <span className="flex items-center gap-2.5">
              <span className="text-2xl">🎯</span>
              หมุนเลย!
            </span>
          )}
        </button>
      </div>

      {spinsRemaining !== undefined && (
        <div className="px-6 py-3 rounded-xl" style={{
          background: 'linear-gradient(135deg, rgba(139,26,43,0.5) 0%, rgba(92,10,21,0.4) 100%)',
          border: '1px solid rgba(255, 215, 0, 0.15)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
        }}>
          <div className="flex items-center gap-3">
            <span className="text-white font-bold text-sm">สิทธิ์คงเหลือ</span>
            <span
              className="inline-flex items-center justify-center w-11 h-11 rounded-full font-extrabold text-xl"
              style={{
                background: 'linear-gradient(135deg, #ffd700 0%, #b8860b 100%)',
                color: '#5c0000',
                boxShadow: '0 4px 20px rgba(255,215,0,0.3)',
              }}
            >
              {spinsRemaining}
            </span>
            <span className="text-white font-bold text-sm">ครั้ง</span>
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
