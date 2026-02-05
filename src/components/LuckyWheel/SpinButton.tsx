interface SpinButtonProps {
  onClick: () => void;
  disabled?: boolean;
  spinning?: boolean;
  spinsRemaining?: number;
}

export function SpinButton({ onClick, disabled, spinning, spinsRemaining }: SpinButtonProps) {
  const isDisabled = disabled || spinning || (spinsRemaining !== undefined && spinsRemaining <= 0);

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={onClick}
        disabled={isDisabled}
        className={`
          px-8 py-4 rounded-full text-xl font-bold
          transition-all duration-300 transform
          ${isDisabled
            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
            : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:scale-105 hover:shadow-lg active:scale-95'
          }
        `}
      >
        {spinning ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            กำลังหมุน...
          </span>
        ) : (
          '🎰 หมุนเลย!'
        )}
      </button>

      {spinsRemaining !== undefined && (
        <p className="text-white/80 text-sm">
          สิทธิ์คงเหลือ: <span className="font-bold text-yellow-300">{spinsRemaining}</span> ครั้ง
        </p>
      )}
    </div>
  );
}
