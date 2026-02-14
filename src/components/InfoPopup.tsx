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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative transform animate-bounce-in">
        <div className="relative w-full max-w-md overflow-hidden shadow-2xl rounded-3xl shadow-black/20">
          {/* Top banner */}
          <div className="relative px-8 pt-8 pb-10 overflow-hidden text-center bg-gradient-to-br from-red-600 via-red-700 to-red-800">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-3 left-6 text-6xl rotate-[-15deg]">🧧</div>
              <div className="absolute bottom-2 right-4 text-5xl rotate-[20deg]">🎊</div>
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 border shadow-lg rounded-2xl bg-white/20 backdrop-blur-sm border-white/30">
                <span className="text-3xl">🎰</span>
              </div>
              <h2 className="text-2xl font-bold text-white drop-shadow-sm">วิธีเล่น</h2>
              <p className="mt-1 text-sm font-medium text-white/70">กิจกรรมหมุนวงล้อลุ้นโชค</p>
            </div>
          </div>

          {/* Content */}
          <div className="relative px-6 pt-0 pb-6 bg-white">
            {/* Steps card - pulled up */}
            <div className="p-4 mb-5 -mt-6 bg-white border border-gray-100 shadow-lg rounded-2xl shadow-black/5">
              <div className="space-y-1">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-center gap-3.5 rounded-xl px-3 py-2.5 hover:bg-red-50/50 transition-colors">
                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 border rounded-xl bg-gradient-to-br from-red-50 to-amber-50 border-red-100/50">
                      <span className="text-lg">{step.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold leading-tight text-gray-800">{step.title}</p>
                      <p className="text-gray-400 text-xs font-medium mt-0.5">{step.text}</p>
                    </div>
                    <span className="flex-shrink-0 text-xs font-bold text-red-300">{index + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Event time */}
            {hasEventTime && (
              <div className="p-4 mb-5 border bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border-amber-200/50">

                {/* Header */}
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="flex items-center justify-center rounded-lg w-7 h-7 bg-amber-100">
                    <ClockIcon className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <p className="text-sm font-bold text-amber-800">
                    ช่วงเวลากิจกรรม
                  </p>
                </div>

                {/* Date */}
                {eventSettings.startDate && eventSettings.endDate && (
                  <p className="text-sm font-bold text-amber-900 ml-9">
                    {formatDateTH(eventSettings.startDate)} —{' '}
                    {formatDateTH(eventSettings.endDate)}
                  </p>
                )}

                {/* Time */}
                {eventSettings.startTime && eventSettings.endTime && (
                  <p className="text-amber-600 text-xs font-medium ml-9 mt-0.5">
                    เวลา {formatExcelTimeTH(eventSettings.startTime)} — {formatExcelTimeTH(eventSettings.endTime)}
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
