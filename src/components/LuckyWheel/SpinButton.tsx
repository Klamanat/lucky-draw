interface SpinButtonProps {
  onClick: () => void;
  disabled?: boolean;
  spinning?: boolean;
  spinsRemaining?: number;
}

export function SpinButton({ onClick, disabled, spinning, spinsRemaining }: SpinButtonProps) {
  const isDisabled = disabled || spinning || (spinsRemaining !== undefined && spinsRemaining <= 0);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Main spin button */}
      <button
        onClick={onClick}
        disabled={isDisabled}
        className={`
          relative px-12 py-4 rounded-lg text-lg font-semibold
          transition-all duration-200
          ${isDisabled
            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
            : 'btn-premium hover:scale-[1.02] active:scale-[0.98]'
          }
        `}
      >
        {spinning ? (
          <span className="flex items-center gap-3">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            กำลังหมุน...
          </span>
        ) : (
          <span>หมุนวงล้อ</span>
        )}
      </button>

      {/* Spins remaining display */}
      {spinsRemaining !== undefined && (
        <div className="glass-card px-6 py-2 rounded-lg shadow-md border border-amber-600/10">
          <p className="text-gray-600 text-sm flex items-center gap-3">
            <span>สิทธิ์คงเหลือ</span>
            <span
              className="inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-lg"
              style={{
                background: 'linear-gradient(180deg, #D4AF37 0%, #B8860B 100%)',
                color: '#1a1a1a',
              }}
            >
              {spinsRemaining}
            </span>
            <span>ครั้ง</span>
          </p>
        </div>
      )}
    </div>
  );
}
