import { useEffect, useState } from 'react';
import type { Prize, PaymentInfo } from '../types';
import { HeartIcon } from './icons';

interface PrizePopupProps {
  prize: Prize;
  onClaim: (paymentInfo?: PaymentInfo) => void;
  onDonate: (amount: number, paymentInfo?: PaymentInfo) => void;
  donating?: boolean;
}

interface Confetti {
  id: number;
  x: number;
  delay: number;
  color: string;
  size: number;
  shape: 'circle' | 'square' | 'star';
}

export function PrizePopup({ prize, onClaim, onDonate, donating }: PrizePopupProps) {
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const [showDonateForm, setShowDonateForm] = useState(false);
  const [donateAmount, setDonateAmount] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'claim' | 'donate'>('claim');
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'promptpay'>('promptpay');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [promptpayNumber, setPromptpayNumber] = useState('');
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    const colors = ['#ffd700', '#dc143c', '#ff6347', '#ffa500', '#ff4444', '#fff8dc'];
    const shapes: Array<'circle' | 'square' | 'star'> = ['circle', 'square', 'star'];
    const particles: Confetti[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    }));
    setConfetti(particles);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confetti.map((particle) => (
          <div
            key={particle.id}
            className="absolute animate-confetti"
            style={{
              left: `${particle.x}%`,
              top: '-20px',
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              animationDelay: `${particle.delay}s`,
              borderRadius: particle.shape === 'circle' ? '50%' : '2px',
              transform: `rotate(${Math.random() * 360}deg)`,
              clipPath: particle.shape === 'star' ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' : 'none',
            }}
          />
        ))}
      </div>

      {/* Pulsing glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,215,0,0.25) 0%, rgba(220,20,60,0.12) 40%, transparent 70%)',
            animation: 'pulse 2.5s ease-in-out infinite',
          }}
        />
      </div>

      {/* Popup */}
      <div className="relative transform animate-bounce-in w-[32vw] min-w-[340px] max-w-[420px]">
        <div
          className="relative overflow-hidden text-white rounded-2xl"
          style={{
            background: 'linear-gradient(160deg, #8b1a2b 0%, #5c0a15 40%, #1a0508 100%)',
            border: '1px solid rgba(255, 215, 0, 0.25)',
            boxShadow: '0 25px 80px rgba(0, 0, 0, 0.6), 0 0 60px rgba(200, 30, 50, 0.15), inset 0 1px 0 rgba(255, 215, 0, 0.15)',
          }}
        >
          {/* Effects BG */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="glitter-layer" />
            <span className="spark s1" />
            <span className="spark s2" />
            <span className="spark s3" />

            <div className="coins">
              <span>🪙</span>
              <span>🪙</span>
              <span>🪙</span>
              <span>🪙</span>
              <span>🪙</span>
            </div>

            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] rounded-full" style={{
              background: 'radial-gradient(ellipse, rgba(255, 180, 50, 0.15) 0%, transparent 70%)',
              filter: 'blur(30px)',
            }} />

            <div className="absolute border inset-3 rounded-xl border-yellow-400/20" />
          </div>

          {/* Content */}
          <div className="relative z-10 p-8 text-center">
            <div className="mt-1 mb-5">
              <div className="flex items-center justify-center w-20 h-20 mx-auto border shadow-lg rounded-2xl border-yellow-500/20" style={{
                background: 'linear-gradient(135deg, rgba(200, 30, 50, 0.4) 0%, rgba(140, 20, 40, 0.3) 100%)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 24px rgba(200, 30, 50, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              }}>
                <span className="text-4xl">🧧</span>
              </div>
            </div>

            <h2 className="mb-1 text-3xl font-extrabold">
              <span className="gold-shimmer">恭喜發財</span>
            </h2>
            <p className="text-xl font-extrabold text-white">ยินดีด้วย!</p>
            <p className="mt-1 text-sm font-bold text-white/70">คุณได้รับรางวัล</p>

            <div className="w-20 mx-auto my-5 divider-gold" />

            {/* Prize display */}
            <div className="px-5 py-5 mb-6 rounded-xl" style={{
              background: 'rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(255, 215, 0, 0.1)',
            }}>
              {prize.image_url && (
                <img src={prize.image_url} alt={prize.name} className="object-contain w-20 h-20 mx-auto mb-3" />
              )}
              <h3 className="text-2xl font-extrabold">
                <span className="gold-shimmer">{prize.name}</span>
              </h3>
              {prize.description && (
                <p className="text-white/70 text-sm font-semibold mt-1.5">{prize.description}</p>
              )}
            </div>

            {showPaymentForm ? (
              <div className="space-y-4 text-left">
                <p className="mb-3 text-sm font-extrabold text-center text-yellow-300/90">
                  {paymentMode === 'donate'
                    ? 'กรอกข้อมูลรับเงินส่วนที่เหลือ'
                    : 'เลือกช่องทางรับเงิน'}
                </p>

                {/* สรุปยอดคงเหลือ (เฉพาะ donate mode) */}
                {paymentMode === 'donate' && donateAmount && (() => {
                  const prizeValue = extractPrizeValue(prize.name);
                  const amount = parseFloat(donateAmount);
                  const remaining = prizeValue ? prizeValue - amount : null;
                  return remaining !== null && remaining > 0 ? (
                    <div className="p-3 rounded-xl space-y-1.5" style={{
                      background: 'rgba(0, 0, 0, 0.2)',
                      border: '1px solid rgba(255, 215, 0, 0.08)',
                    }}>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/50">มูลค่ารางวัล</span>
                        <span className="font-bold text-white">{prizeValue!.toLocaleString()} บาท</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/50">บริจาค</span>
                        <span className="font-bold text-pink-300">-{amount.toLocaleString()} บาท</span>
                      </div>
                      <div className="flex justify-between pt-1.5 border-t border-white/10 text-sm">
                        <span className="font-bold text-white/70">ยอดรับโอน</span>
                        <span className="font-extrabold text-yellow-300">{remaining.toLocaleString()} บาท</span>
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Payment method tabs */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setPaymentMethod('promptpay')}
                    className={`flex-1 py-2.5 rounded-xl font-extrabold text-sm transition-all ${paymentMethod === 'promptpay' ? '' : 'hover:bg-white/10'
                      }`}
                    style={paymentMethod === 'promptpay' ? {
                      background: 'linear-gradient(135deg, #ffd700 0%, #d4a017 50%, #b8860b 100%)',
                      color: '#5c0000',
                      border: '1px solid rgba(255, 215, 0, 0.4)',
                    } : {
                      background: 'rgba(0, 0, 0, 0.25)',
                      color: 'rgba(255, 255, 255, 0.7)',
                      border: '1px solid rgba(255, 215, 0, 0.1)',
                    }}
                  >
                    PromptPay
                  </button>
                  <button
                    onClick={() => setPaymentMethod('bank')}
                    className={`flex-1 py-2.5 rounded-xl font-extrabold text-sm transition-all ${paymentMethod === 'bank' ? '' : 'hover:bg-white/10'
                      }`}
                    style={paymentMethod === 'bank' ? {
                      background: 'linear-gradient(135deg, #ffd700 0%, #d4a017 50%, #b8860b 100%)',
                      color: '#5c0000',
                      border: '1px solid rgba(255, 215, 0, 0.4)',
                    } : {
                      background: 'rgba(0, 0, 0, 0.25)',
                      color: 'rgba(255, 255, 255, 0.7)',
                      border: '1px solid rgba(255, 215, 0, 0.1)',
                    }}
                  >
                    บัญชีธนาคาร
                  </button>
                </div>

                {paymentMethod === 'promptpay' ? (
                  <div>
                    <label className="block text-yellow-300/90 text-xs font-extrabold mb-1.5">เบอร์ PromptPay</label>
                    <input
                      type="tel"
                      value={promptpayNumber}
                      onChange={(e) => setPromptpayNumber(e.target.value)}
                      placeholder="เบอร์โทรหรือเลขบัตรประชาชน"
                      required
                      className="w-full px-4 py-3 text-base font-bold text-center text-white transition-all rounded-xl focus:outline-none"
                      style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255, 215, 0, 0.12)',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'rgba(255, 215, 0, 0.35)';
                        e.target.style.boxShadow = '0 0 0 3px rgba(255, 215, 0, 0.08)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255, 215, 0, 0.12)';
                        e.target.style.boxShadow = 'none';
                      }}
                      autoFocus
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-yellow-300/90 text-xs font-extrabold mb-1.5">ธนาคาร</label>
                      <select
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full px-4 py-3 text-base font-bold text-white transition-all rounded-xl focus:outline-none"
                        style={{
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: '1px solid rgba(255, 215, 0, 0.12)',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = 'rgba(255, 215, 0, 0.35)';
                          e.target.style.boxShadow = '0 0 0 3px rgba(255, 215, 0, 0.08)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(255, 215, 0, 0.12)';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        <option value="" disabled>เลือกธนาคาร</option>
                        <option value="กสิกรไทย">กสิกรไทย (KBANK)</option>
                        <option value="ไทยพาณิชย์">ไทยพาณิชย์ (SCB)</option>
                        <option value="กรุงเทพ">กรุงเทพ (BBL)</option>
                        <option value="กรุงไทย">กรุงไทย (KTB)</option>
                        <option value="กรุงศรี">กรุงศรี (BAY)</option>
                        <option value="ทหารไทยธนชาต">ทหารไทยธนชาต (TTB)</option>
                        <option value="ออมสิน">ออมสิน (GSB)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-yellow-300/90 text-xs font-extrabold mb-1.5">เลขบัญชี</label>
                      <input
                        type="tel"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="เลขบัญชีธนาคาร"
                        required
                        className="w-full px-4 py-3 text-base font-bold text-center text-white transition-all rounded-xl focus:outline-none"
                        style={{
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: '1px solid rgba(255, 215, 0, 0.12)',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = 'rgba(255, 215, 0, 0.35)';
                          e.target.style.boxShadow = '0 0 0 3px rgba(255, 215, 0, 0.08)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(255, 215, 0, 0.12)';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setClaiming(true);
                      const info: PaymentInfo = paymentMethod === 'promptpay'
                        ? { method: 'promptpay', promptpayNumber }
                        : { method: 'bank', bankName, accountNumber };
                      if (paymentMode === 'donate') {
                        const amount = parseFloat(donateAmount);
                        onDonate(amount, info);
                      } else {
                        onClaim(info);
                      }
                    }}
                    disabled={claiming || (paymentMethod === 'promptpay' ? !promptpayNumber : (!bankName || !accountNumber))}
                    className="flex-1 py-3.5 font-extrabold text-base tracking-wide rounded-xl active:scale-[0.98] transition-all disabled:opacity-40"
                    style={{
                      background: 'linear-gradient(135deg, #ffd700 0%, #d4a017 50%, #b8860b 100%)',
                      color: '#5c0000',
                      border: '1px solid rgba(255, 215, 0, 0.4)',
                      boxShadow: '0 4px 20px rgba(255, 215, 0, 0.2)',
                    }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {claiming ? 'กำลังดำเนินการ...' : (paymentMode === 'donate' ? 'บริจาคและรับเงินที่เหลือ' : 'ยืนยันรับเงิน')} <span className="text-lg">💰</span>
                    </span>
                  </button>
                  <button
                    onClick={() => setShowPaymentForm(false)}
                    disabled={claiming}
                    className="py-3.5 px-5 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors disabled:opacity-40"
                    style={{
                      background: 'rgba(0, 0, 0, 0.25)',
                      color: 'rgba(255, 255, 255, 0.8)',
                      border: '1px solid rgba(255, 215, 0, 0.1)',
                    }}
                  >
                    กลับ
                  </button>
                </div>
              </div>
            ) : prize.is_donatable && !showDonateForm ? (
              /* Donate confirmation - ถามก่อนรับรางวัลเสมอ */
              <div className="space-y-3">
                <div className="p-4 text-left rounded-xl" style={{
                  background: 'rgba(236, 72, 153, 0.08)',
                  border: '1px solid rgba(236, 72, 153, 0.15)',
                }}>
                  <p className="flex items-center gap-2 mb-1 text-sm font-extrabold text-pink-300">
                    <HeartIcon className="w-4 h-4" /> ส่งต่อความเฮง แบ่งอั่งเปาเติมพลังให้น้องสี่ขา หมา แมว ที่มูลนิธิบ้านสงเคราะห์สัตว์พิการ เพื่อเป็นกิจกรรม CSR ร่วมกัน
                  </p>
                </div>
                <button
                  onClick={() => setShowDonateForm(true)}
                  className="w-full py-3.5 bg-gradient-to-r from-pink-600 to-pink-500 text-white rounded-xl font-extrabold shadow-lg shadow-pink-500/20 hover:shadow-pink-500/30 transition-all text-base"
                >
                  <span className="flex items-center justify-center gap-2">
                    กดแบ่งอั่งเปาเพื่อน้องหมา แมว กันเล๊ย <HeartIcon className="w-4 h-4" />
                  </span>
                </button>
                <button
                  onClick={() => {
                    if (prize.is_money) {
                      setPaymentMode('claim');
                      setShowPaymentForm(true);
                    } else {
                      onClaim();
                    }
                  }}
                  className="w-full py-3 text-sm font-bold transition-colors rounded-xl hover:bg-white/10"
                  style={{
                    background: 'rgba(0, 0, 0, 0.25)',
                    color: 'rgba(255, 255, 255, 0.8)',
                    border: '1px solid rgba(255, 215, 0, 0.1)',
                  }}
                >
                  ไม่บริจาค — รับรางวัล
                </button>
              </div>
            ) : showDonateForm ? (
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-extrabold text-yellow-300/90">จำนวนเงินบริจาค (บาท)</label>
                  <input
                    type="number"
                    min="1"
                    value={donateAmount}
                    onChange={(e) => setDonateAmount(e.target.value)}
                    placeholder="ระบุจำนวนเงิน"
                    className="w-full px-4 py-3 text-lg font-bold text-center text-white transition-all rounded-xl focus:outline-none"
                    style={{
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(255, 215, 0, 0.12)',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'rgba(255, 215, 0, 0.35)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(255, 215, 0, 0.08)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 215, 0, 0.12)';
                      e.target.style.boxShadow = 'none';
                    }}
                    autoFocus
                  />
                </div>

                {/* สรุปยอด */}
                {donateAmount && parseFloat(donateAmount) > 0 && (() => {
                  const prizeValue = extractPrizeValue(prize.name);
                  const amount = parseFloat(donateAmount);
                  const remaining = prizeValue ? prizeValue - amount : null;
                  return (
                    <div className="p-3 rounded-xl space-y-1.5" style={{
                      background: 'rgba(0, 0, 0, 0.2)',
                      border: '1px solid rgba(255, 215, 0, 0.08)',
                    }}>
                      {prizeValue && (
                        <div className="flex justify-between text-xs">
                          <span className="text-white/50">มูลค่ารางวัล</span>
                          <span className="font-bold text-white">{prizeValue.toLocaleString()} บาท</span>
                        </div>
                      )}
                      <div className="flex justify-between text-xs">
                        <span className="text-white/50">บริจาค</span>
                        <span className="font-bold text-pink-300">-{amount.toLocaleString()} บาท</span>
                      </div>
                      {remaining !== null && (
                        <div className="flex justify-between pt-1.5 border-t border-white/10 text-sm">
                          <span className="font-bold text-white/70">ยอดคงเหลือ</span>
                          <span className={`font-extrabold ${remaining > 0 ? 'text-yellow-300' : remaining === 0 ? 'text-white/50' : 'text-red-400'}`}>
                            {remaining > 0 ? `${remaining.toLocaleString()} บาท` : remaining === 0 ? 'บริจาคทั้งหมด' : 'เกินมูลค่ารางวัล'}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })()}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const amount = parseFloat(donateAmount);
                      if (amount > 0) {
                        const prizeValue = extractPrizeValue(prize.name);
                        if (prizeValue && amount > prizeValue) {
                          alert(`จำนวนบริจาคต้องไม่เกินมูลค่ารางวัล (${prizeValue.toLocaleString()} บาท)`);
                          return;
                        }
                        if (prize.is_money) {
                          const isFullDonation = prizeValue && amount >= prizeValue;
                          if (isFullDonation) {
                            // บริจาคทั้งหมด ไม่ต้องกรอก payment
                            onDonate(amount);
                          } else {
                            // บริจาคบางส่วน → กรอก payment info เพื่อรับส่วนที่เหลือ
                            setPaymentMode('donate');
                            setShowDonateForm(false);
                            setShowPaymentForm(true);
                          }
                        } else {
                          onDonate(amount);
                        }
                      }
                    }}
                    disabled={donating || !donateAmount || parseFloat(donateAmount) <= 0}
                    className="flex-1 py-3.5 bg-gradient-to-r from-pink-600 to-pink-500 text-white rounded-xl font-extrabold shadow-lg shadow-pink-500/20 transition-all disabled:opacity-40 text-sm"
                  >
                    <span className="flex items-center justify-center gap-2">
                      {donating ? 'กำลังบริจาค...' : (prize.is_money && (() => { const pv = extractPrizeValue(prize.name); return !(pv && parseFloat(donateAmount) >= pv); })() ? 'ถัดไป' : 'ยืนยันบริจาค')} <HeartIcon className="w-4 h-4" />
                    </span>
                  </button>
                  <button
                    onClick={() => { setShowDonateForm(false); setDonateAmount(''); }}
                    disabled={donating}
                    className="py-3.5 px-5 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors disabled:opacity-40"
                    style={{
                      background: 'rgba(0, 0, 0, 0.25)',
                      color: 'rgba(255, 255, 255, 0.8)',
                      border: '1px solid rgba(255, 215, 0, 0.1)',
                    }}
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (prize.is_money) {
                    setPaymentMode('claim');
                    setShowPaymentForm(true);
                  } else {
                    onClaim();
                  }
                }}
                disabled={donating}
                className="w-full py-3.5 font-extrabold text-base tracking-wide rounded-xl active:scale-[0.98] transition-all disabled:opacity-40"
                style={{
                  background: 'linear-gradient(135deg, #ffd700 0%, #d4a017 50%, #b8860b 100%)',
                  color: '#5c0000',
                  border: '1px solid rgba(255, 215, 0, 0.4)',
                  boxShadow: '0 4px 20px rgba(255, 215, 0, 0.2)',
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  รับอั่งเปา <span className="text-lg">🧧</span>
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

function extractPrizeValue(prizeName: string): number | null {
  const match = prizeName.match(/(\d[\d,]*)/);
  if (match) {
    return parseInt(match[1].replace(/,/g, ''), 10) || null;
  }
  return null;
}
