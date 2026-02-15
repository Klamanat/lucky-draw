import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LuckyWheel, SpinButton } from '../components/LuckyWheel';
import { PrizePopup } from '../components/PrizePopup';
import { InfoPopup } from '../components/InfoPopup';
import { EmployeeForm } from '../components/EmployeeForm';
import { useAuth } from '../hooks/useAuth';
import { useSpin } from '../hooks/useSpin';
import { isDemoMode, getAllowedEmployees, api, invalidateCache } from '../services/api';
import { SettingsIcon, LogOutIcon, ScrollIcon } from '../components/icons';
import type { Prize, EventSettings, PaymentInfo } from '../types';

export function Home() {
  const { user, isLoggedIn, loading: authLoading, enterAsEmployee, loginAdmin, logout, updateSpinsRemaining } = useAuth();
  const { prizes, loading: prizesLoading, spinning, spin, loadPrizes } = useSpin();

  const [targetPrizeId, setTargetPrizeId] = useState<string | undefined>();
  const [wonPrize, setWonPrize] = useState<Prize | null>(null);
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);
  const [donating, setDonating] = useState(false);
  const [showInfoPopup, setShowInfoPopup] = useState(true);
  const [eventSettings, setEventSettings] = useState<EventSettings | null>(null);

  useEffect(() => {
    loadPrizes();
  }, [loadPrizes]);

  useEffect(() => {
    api.getEventSettings().then(result => {
      if (result.success) {
        setEventSettings(result.settings);
      }
    }).catch(() => { /* ignore */ });
  }, []);

  const handleSpin = async () => {
    if (!user) return;

    // Validate event: วันตาม InfoPopup, เวลาตาม EventSettings (admin ข้ามได้)
    if (user.role !== 'admin') {
      const now = new Date();
      const pad2 = (n: number) => n.toString().padStart(2, '0');
      const today = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
      const eventDate = '2026-02-15'; // 17 กุมภาพันธ์ 2569

      if (today < eventDate) {
        alert('กิจกรรมยังไม่เริ่ม');
        return;
      }
      if (today > eventDate) {
        alert('กิจกรรมสิ้นสุดแล้ว');
        return;
      }

      // วันตรงกัน → เช็คเวลา
      if (eventSettings) {
        const currentTime = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;

        const normalizeTime = (val: string): string => {
          if (!val) return '';
          if (/^\d{2}:\d{2}$/.test(val)) return val;
          const d = new Date(val);
          if (!isNaN(d.getTime())) {
            return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
          }
          return '';
        };

        const startTime = normalizeTime(eventSettings.startTime);
        const endTime = normalizeTime(eventSettings.endTime);

        if (startTime && currentTime < startTime) {
          alert(`ยังไม่ถึงเวลากิจกรรม (เริ่ม ${startTime} น.)`);
          return;
        }
        if (endTime && currentTime > endTime) {
          alert(`หมดเวลากิจกรรมแล้ว (สิ้นสุด ${endTime} น.)`);
          return;
        }
      }
    }

    const result = await spin(user.id);

    if (result.success && result.prize) {
      setTargetPrizeId(result.prize.id);
      setCurrentHistoryId(result.historyId || null);
      if (result.spinsRemaining !== undefined) {
        updateSpinsRemaining(result.spinsRemaining);
      }
    } else if (result.error) {
      alert(result.error);
    }
  };

  const handleSpinEnd = (prize: Prize) => {
    setWonPrize(prize);
    setTargetPrizeId(undefined);
  };

  const handleClaimPrize = async (paymentInfo?: PaymentInfo) => {
    if (paymentInfo && currentHistoryId) {
      try {
        await api.claimPrize(currentHistoryId, paymentInfo);
      } catch {
        // ignore - still close popup
      }
    }
    setWonPrize(null);
    setCurrentHistoryId(null);
  };

  const handleDonatePrize = async (amount: number) => {
    if (!currentHistoryId) return;
    setDonating(true);
    try {
      const result = await api.donatePrize(currentHistoryId, amount);
      if (result.success) {
        invalidateCache('getHistory', 'getAllHistory', 'getStats');
        setWonPrize(null);
        setCurrentHistoryId(null);
      } else {
        alert(result.error || 'เกิดข้อผิดพลาด');
      }
    } catch {
      alert('เกิดข้อผิดพลาด');
    } finally {
      setDonating(false);
    }
  };

  // Loading state
  if (authLoading || prizesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-5 px-12 py-10 border glass-card rounded-2xl border-yellow-500/20">
          <div className="rounded-full w-14 h-14 border-3 border-yellow-500/30 border-t-yellow-400 animate-spin" style={{ borderWidth: '3px' }} />
          <p className="font-medium tracking-wide text-white">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!isLoggedIn) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen p-4 py-16">
        {isDemoMode && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 z-40">
            <span className="text-xs font-medium tracking-wide text-yellow-300">Demo Mode</span>
          </div>
        )}

        <div className="relative z-10 mb-10 text-center">
          <h1 className="mb-3 text-4xl font-bold tracking-tight md:text-5xl">
            <span className="gold-shimmer">Digital Angpao Hunt</span>
          </h1>
          <p className="text-base font-medium text-white/90">ดวงดีได้เงิน ดวงเฮงได้คำอวยพร จากพี่มะนาว และ พี่นิโคล</p>
        </div>

        <EmployeeForm
          onSubmit={enterAsEmployee}
          onAdminLogin={loginAdmin}
          loading={authLoading}
        />

        {isDemoMode && (
          <div className="relative z-10 mt-8 space-y-3 text-center">
            {getAllowedEmployees().length > 0 && (
              <div className="inline-block px-5 py-3 glass-card-dark rounded-xl">
                <p className="text-white/70 text-xs mb-1.5 font-medium">รหัสพนักงานที่มีสิทธิ์</p>
                <p className="font-mono text-sm tracking-wider text-white/70">
                  {getAllowedEmployees().slice(0, 5).join(', ')}
                  {getAllowedEmployees().length > 5 && (
                    <span className="text-white/60"> (+{getAllowedEmployees().length - 5})</span>
                  )}
                </p>
              </div>
            )}
            <p className="text-xs tracking-wide text-white/50">
              Admin: กรอกรหัส admin1234
            </p>
          </div>
        )}

        {showInfoPopup && (
          <InfoPopup onClose={() => setShowInfoPopup(false)} eventSettings={eventSettings} />
        )}
      </div>
    );
  }

  // Logged in
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-4 py-16">
      {isDemoMode && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 z-40">
          <span className="text-xs font-medium tracking-wide text-yellow-300">Demo Mode</span>
        </div>
      )}

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between w-full max-w-lg mb-6">
        <div className="relative px-5 py-3 overflow-hidden rounded-xl" style={{
          background: 'linear-gradient(135deg, rgba(139,26,43,0.6) 0%, rgba(92,10,21,0.5) 100%)',
          border: '1px solid rgba(255, 215, 0, 0.15)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}>
          <p className="text-yellow-400 text-xs font-extrabold mb-0.5">ผู้เข้าร่วม</p>
          <p className="text-lg font-extrabold text-white">{user?.name}</p>
          <p className="font-mono text-xs font-bold text-yellow-400/70">{user?.employee_id}</p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/history"
            className="px-4 py-2.5 text-white font-bold rounded-xl hover:bg-white/10 transition-all text-sm flex items-center gap-2"
            style={{
              background: 'rgba(139,26,43,0.4)',
              border: '1px solid rgba(255, 215, 0, 0.12)',
            }}
          >
            <ScrollIcon className="w-4 h-4" />
            ประวัติ
          </Link>
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="btn-gold px-4 py-2.5 rounded-xl text-sm font-extrabold flex items-center gap-2"
            >
              <SettingsIcon className="w-4 h-4" />
              จัดการ
            </Link>
          )}
          <button
            onClick={logout}
            className="px-4 py-2.5 text-white/80 rounded-xl hover:bg-white/10 transition-all text-sm font-bold flex items-center gap-2"
            style={{
              background: 'rgba(139,26,43,0.4)',
              border: '1px solid rgba(255, 215, 0, 0.12)',
            }}
          >
            <LogOutIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="relative z-10 mb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
          <span className="gold-shimmer">หมุนวงล้อรับโชค</span>
        </h1>
        <div className="mx-auto mt-3 w-28 divider-gold" />
      </div>

      {/* Wheel */}
      {prizes.length > 0 ? (
        <>
          <LuckyWheel
            prizes={prizes}
            onSpinEnd={handleSpinEnd}
            spinning={spinning || !!targetPrizeId}
            targetPrizeId={targetPrizeId}
            disabled={!user || user.spins_remaining <= 0}
          />

          <div className="relative z-10 mt-10">
            <SpinButton
              onClick={handleSpin}
              spinning={spinning || !!targetPrizeId}
              spinsRemaining={user?.spins_remaining}
              disabled={!user || user.spins_remaining <= 0}
            />
          </div>
        </>
      ) : (
        <div className="p-10 text-center border glass-card rounded-2xl border-yellow-500/25">
          <div className="flex items-center justify-center mx-auto mb-4 w-14 h-14 rounded-xl bg-red-500/20">
            <span className="text-2xl">🎁</span>
          </div>
          <p className="text-lg font-bold text-white">ยังไม่มีรางวัลในระบบ</p>
          <p className="mt-2 text-sm text-white/80">กรุณาติดต่อผู้ดูแลระบบ</p>
        </div>
      )}

      {wonPrize && (
        <PrizePopup prize={wonPrize} onClaim={handleClaimPrize} onDonate={handleDonatePrize} donating={donating} />
      )}

    </div>
  );
}
