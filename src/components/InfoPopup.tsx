import type { EventSettings } from '../types';
import { ClockIcon } from './icons';

interface InfoPopupProps {
  onClose: () => void;
  eventSettings: EventSettings | null;
}

export function formatDateTH(dateStr: string | Date) {
  const date = new Date(dateStr);

  return date.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatExcelTimeTH(dateInput: string | Date) {
  const date = new Date(dateInput);

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${hours}:${minutes} น.`;
}


const steps = [
  { icon: '📝', title: 'ลงทะเบียน', text: 'กรอกรหัสพนักงานและชื่อเพื่อเข้าร่วม' },
  { icon: '🎡', title: 'หมุนวงล้อ', text: 'กดปุ่มหมุนเพื่อลุ้นรางวัล' },
  { icon: '🎯', title: 'สิทธิ์หมุน', text: 'ได้สิทธิ์หมุน 1 ครั้งต่อคน' },
  { icon: '💝', title: 'บริจาค', text: 'สามารถบริจาครางวัลเป็นเงินได้' },
];

export function InfoPopup({ onClose, eventSettings }: InfoPopupProps) {
  const hasEventTime = eventSettings && (eventSettings.startDate || eventSettings.endDate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="relative transform animate-bounce-in">
        <div className="relative w-full max-w-md overflow-hidden rounded-2xl" style={{
          background: 'rgba(15, 5, 8, 0.85)',
          backdropFilter: 'blur(28px) saturate(1.3)',
          WebkitBackdropFilter: 'blur(28px) saturate(1.3)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), 0 0 80px rgba(200, 30, 50, 0.08)',
        }}>

          {/* Top banner */}
          <div className="relative px-8 pt-8 pb-10 text-center overflow-hidden">
            {/* Gradient glow behind banner */}
            <div className="absolute inset-0" style={{
              background: 'radial-gradient(ellipse 80% 100% at 50% 0%, rgba(180, 30, 50, 0.25) 0%, transparent 70%)',
            }} />
            <div className="absolute inset-0 opacity-[0.06]">
              <div className="absolute top-3 left-6 text-6xl rotate-[-15deg]">🧧</div>
              <div className="absolute bottom-2 right-4 text-5xl rotate-[20deg]">🎊</div>
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg border border-yellow-500/20" style={{
                background: 'linear-gradient(135deg, rgba(200, 30, 50, 0.4) 0%, rgba(140, 20, 40, 0.3) 100%)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 24px rgba(200, 30, 50, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              }}>
                <span className="text-3xl">🎰</span>
              </div>
              <h2 className="text-2xl font-bold">
                <span className="gold-shimmer">วิธีเล่น</span>
              </h2>
              <p className="mt-1.5 text-sm font-medium text-white/60">กิจกรรมหมุนวงล้อลุ้นโชค</p>
            </div>
            {/* Divider */}
            <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative px-6 pb-6">
            {/* Steps */}
            <div className="p-3 mb-5 -mt-3 rounded-xl" style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}>
              <div className="space-y-1">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-center gap-3.5 rounded-xl px-3 py-2.5 hover:bg-white/[0.04] transition-colors">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border border-white/[0.06]" style={{
                      background: 'linear-gradient(135deg, rgba(200, 30, 50, 0.15) 0%, rgba(180, 130, 20, 0.1) 100%)',
                    }}>
                      <span className="text-lg">{step.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold leading-tight text-white/90">{step.title}</p>
                      <p className="text-white/50 text-xs font-medium mt-0.5">{step.text}</p>
                    </div>
                    <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{
                      background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(200, 150, 20, 0.1) 100%)',
                      color: 'rgba(255, 215, 0, 0.6)',
                      border: '1px solid rgba(255, 215, 0, 0.1)',
                    }}>{index + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Event time */}
            {hasEventTime && (
              <div className="p-4 mb-5 rounded-xl" style={{
                background: 'linear-gradient(135deg, rgba(255, 180, 50, 0.08) 0%, rgba(200, 130, 20, 0.05) 100%)',
                border: '1px solid rgba(255, 215, 0, 0.1)',
              }}>
                {/* Header */}
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{
                    background: 'rgba(255, 215, 0, 0.12)',
                    border: '1px solid rgba(255, 215, 0, 0.1)',
                  }}>
                    <ClockIcon className="w-3.5 h-3.5 text-yellow-500" />
                  </div>
                  <p className="text-sm font-bold text-yellow-400/90">ช่วงเวลากิจกรรม</p>
                </div>

                {/* Date */}
                {eventSettings.startDate && eventSettings.endDate && (
                  <p className="text-sm font-bold text-white/80 ml-9">
                    {formatDateTH(eventSettings.startDate)} —{' '}
                    {formatDateTH(eventSettings.endDate)}
                  </p>
                )}

                {/* Time */}
                {eventSettings.startTime && eventSettings.endTime && (
                  <p className="text-yellow-500/60 text-xs font-medium ml-9 mt-1">
                    เวลา {formatExcelTimeTH(eventSettings.startTime)} — {formatExcelTimeTH(eventSettings.endTime)}
                  </p>
                )}
              </div>
            )}

            {/* Button */}
            <button
              onClick={onClose}
              className="w-full py-3.5 btn-premium rounded-xl font-bold text-sm tracking-wide active:scale-[0.98] transition-transform"
            >
              เข้าใจแล้ว เริ่มเลย!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
