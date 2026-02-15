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
  { icon: '📝', title: 'ลงทะเบียน', text: 'กรอกรหัสพนักงานและชื่อเพื่อเข้าร่วม <br> <strong>* (1 คน หมุนวงล้อได้ 1 ครั้งเท่านั้น)</strong>' },
  { icon: '🎡', title: 'หมุนวงล้อ', text: 'กดปุ่มหมุนเพื่อลุ้นรางวัล' },
  { icon: '💝', title: 'บริจาค', text: 'สามารถแบ่งบริจาคเงินรางวัลให้<br>มูลนิธิบ้านสงเคราะห์สัตว์พิการได้' },
];

export function InfoPopup({ onClose, eventSettings }: InfoPopupProps) {
  const hasStartDate = eventSettings?.startDate;
  const hasEndDate = eventSettings?.endDate;
  const hasEventDate = hasStartDate || hasEndDate;
  const hasEventTime = eventSettings && (eventSettings.startTime || eventSettings.endTime);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">

      {/* ===== Popup ===== */}
      <div className="relative w-full max-w-[460px] sm:w-[32vw] sm:min-w-[360px] mx-4 sm:mx-0 animate-bounce-in">

        {/* ===== Container ===== */}
        <div
          className="relative overflow-hidden text-white rounded-2xl"
          style={{
            background: 'linear-gradient(160deg, #8b1a2b 0%, #5c0a15 40%, #1a0508 100%)',
            border: '1px solid rgba(255, 215, 0, 0.25)',
            boxShadow:
              '0 25px 80px rgba(0, 0, 0, 0.6), 0 0 60px rgba(200, 30, 50, 0.15), inset 0 1px 0 rgba(255, 215, 0, 0.15)',
          }}
        >

          {/* ================= Effects BG ================= */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Glitter */}
            <div className="glitter-layer" />

            {/* Firework sparks */}
            <span className="spark s1" />
            <span className="spark s2" />
            <span className="spark s3" />

            {/* Gold Coins */}
            <div className="coins">
              <span>🪙</span>
              <span>🪙</span>
              <span>🪙</span>
              <span>🪙</span>
              <span>🪙</span>
            </div>

            {/* Radial glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] rounded-full" style={{
              background: 'radial-gradient(ellipse, rgba(255, 180, 50, 0.12) 0%, transparent 70%)',
              filter: 'blur(30px)',
            }} />

            {/* Gold frame border */}
            <div className="absolute border inset-3 rounded-xl border-yellow-400/20" />
          </div>

          {/* ================= Content ================= */}
          <div className="relative z-10 px-6 text-center pt-7">

            <h1 className="text-3xl font-extrabold tracking-tight">
              <span className="gold-shimmer">Digital Angpao Hunt</span>
            </h1>

            <p className="mt-2 text-base font-bold text-white/80">
              หมุนปั๊บ รับทรัพย์ อั่งเปารวมกว่า 8,000 บาท
            </p>

            {/* Divider */}
            <div className="w-20 mx-auto my-5 divider-gold" />

            {/* Steps */}
            <div className="p-3 mb-4 rounded-xl" style={{
              background: 'rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(255, 215, 0, 0.08)',
            }}>
              <div className="space-y-1.5">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-center justify-center flex-shrink-0 rounded-xl w-11 h-11" style={{
                      background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.12) 0%, rgba(200, 30, 50, 0.1) 100%)',
                      border: '1px solid rgba(255, 215, 0, 0.1)',
                    }}>
                      <span className="text-xl">{step.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-extrabold leading-tight text-yellow-300/90">{step.title}</p>
                      <p className="text-white/70 text-sm font-semibold mt-0.5 leading-snug" dangerouslySetInnerHTML={{ __html: step.text }} />
                    </div>
                    <span className="flex items-center justify-center flex-shrink-0 text-xs font-extrabold border rounded-full w-7 h-7 bg-yellow-500/10 text-yellow-500/60 border-yellow-500/10">
                      {index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Event time */}
            {(hasEventDate || hasEventTime) && (
              <div className="p-3.5 mb-4 rounded-xl text-left" style={{
                background: 'rgba(255, 180, 50, 0.06)',
                border: '1px solid rgba(255, 215, 0, 0.1)',
              }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center justify-center w-6 h-6 border rounded-md bg-yellow-500/10 border-yellow-500/10">
                    <ClockIcon className="w-3 h-3 text-yellow-500/80" />
                  </div>
                  <p className="text-sm font-extrabold text-yellow-400/90">ช่วงเวลากิจกรรม</p>
                </div>
                {hasEventDate && (
                  <p className="ml-8 text-sm font-extrabold text-white/90">
                    {hasStartDate && hasEndDate && eventSettings!.startDate === eventSettings!.endDate
                      ? `${formatDateTH(eventSettings!.startDate)} วันเดียวเท่านั้น`
                      : hasStartDate && hasEndDate
                        ? `${formatDateTH(eventSettings!.startDate)} — ${formatDateTH(eventSettings!.endDate)}`
                        : hasStartDate
                          ? `เริ่ม ${formatDateTH(eventSettings!.startDate)}`
                          : `ถึง ${formatDateTH(eventSettings!.endDate!)}`
                    }
                  </p>
                )}
                {hasEventTime && eventSettings!.startTime && eventSettings!.endTime && (
                  <p className="text-yellow-500/60 text-xs font-bold ml-8 mt-0.5">
                    เวลา {eventSettings!.startTime} — {eventSettings!.endTime} น.
                  </p>
                )}
              </div>
            )}

            {/* Button */}
            <button
              onClick={onClose}
              className="w-full py-3.5 mb-6 font-extrabold text-base tracking-wide rounded-xl active:scale-[0.98] transition-all"
              style={{
                background: 'linear-gradient(135deg, #ffd700 0%, #d4a017 50%, #b8860b 100%)',
                color: '#5c0000',
                border: '1px solid rgba(255, 215, 0, 0.4)',
                boxShadow: '0 4px 20px rgba(255, 215, 0, 0.2)',
              }}
            >
              เข้าใจแล้ว เริ่มเล๊ย! 🎰
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
