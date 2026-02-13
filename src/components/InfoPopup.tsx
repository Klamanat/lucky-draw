import type { EventSettings } from '../types';
import { ClockIcon } from './icons';

interface InfoPopupProps {
  onClose: () => void;
  eventSettings: EventSettings | null;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return dateStr;
  }
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="relative transform animate-bounce-in">
        <div className="relative rounded-3xl max-w-md w-full overflow-hidden shadow-2xl shadow-black/20">
          {/* Top banner */}
          <div className="bg-gradient-to-br from-red-600 via-red-700 to-red-800 px-8 pt-8 pb-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-3 left-6 text-6xl rotate-[-15deg]">🧧</div>
              <div className="absolute bottom-2 right-4 text-5xl rotate-[20deg]">🎊</div>
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-lg">
                <span className="text-3xl">🎰</span>
              </div>
              <h2 className="text-2xl font-bold text-white drop-shadow-sm">วิธีเล่น</h2>
              <p className="text-white/70 text-sm mt-1 font-medium">กิจกรรมหมุนวงล้อลุ้นโชค</p>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-6 pb-6 pt-0 relative">
            {/* Steps card - pulled up */}
            <div className="-mt-6 mb-5 bg-white rounded-2xl shadow-lg shadow-black/5 border border-gray-100 p-4">
              <div className="space-y-1">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-center gap-3.5 rounded-xl px-3 py-2.5 hover:bg-red-50/50 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-50 to-amber-50 flex items-center justify-center flex-shrink-0 border border-red-100/50">
                      <span className="text-lg">{step.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 text-sm font-bold leading-tight">{step.title}</p>
                      <p className="text-gray-400 text-xs font-medium mt-0.5">{step.text}</p>
                    </div>
                    <span className="text-red-300 text-xs font-bold flex-shrink-0">{index + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Event time */}
            {hasEventTime && (
              <div className="mb-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200/50">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                    <ClockIcon className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <p className="text-amber-800 font-bold text-sm">ช่วงเวลากิจกรรม</p>
                </div>
                {eventSettings.startDate && eventSettings.endDate && (
                  <p className="text-amber-900 font-bold text-sm ml-9">
                    {formatDate(eventSettings.startDate)} — {formatDate(eventSettings.endDate)}
                  </p>
                )}
                {eventSettings.startTime && eventSettings.endTime && (
                  <p className="text-amber-600 text-xs font-medium ml-9 mt-0.5">
                    เวลา {eventSettings.startTime} — {eventSettings.endTime} น.
                  </p>
                )}
              </div>
            )}

            {/* Button */}
            <button
              onClick={onClose}
              className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-2xl font-bold shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all active:scale-[0.98] text-sm tracking-wide"
            >
              เข้าใจแล้ว เริ่มเลย!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
