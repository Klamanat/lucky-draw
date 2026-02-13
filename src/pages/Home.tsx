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
import type { Prize, EventSettings } from '../types';

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

    // Validate event time window (only if dates are configured)
    if (eventSettings && (eventSettings.startDate || eventSettings.endDate)) {
      const now = new Date();
      const today = now.toISOString().slice(0, 10);
      const currentTime = now.toTimeString().slice(0, 5);

      if (eventSettings.startDate && today < eventSettings.startDate) {
        alert('กิจกรรมยังไม่เริ่ม');
        return;
      }
      if (eventSettings.endDate && today > eventSettings.endDate) {
        alert('กิจกรรมสิ้นสุดแล้ว');
        return;
      }
      if (eventSettings.startTime && currentTime < eventSettings.startTime) {
        alert(`ยังไม่ถึงเวลากิจกรรม (เริ่ม ${eventSettings.startTime} น.)`);
        return;
      }
      if (eventSettings.endTime && currentTime > eventSettings.endTime) {
        alert(`หมดเวลากิจกรรมแล้ว (สิ้นสุด ${eventSettings.endTime} น.)`);
        return;
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

  const handleClaimPrize = () => {
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <div className="w-12 h-12 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
          <p className="text-white/60 text-sm font-medium tracking-wide">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 py-16 relative">
        {isDemoMode && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 z-40">
            <span className="text-yellow-300 text-xs font-medium tracking-wide">Demo Mode</span>
          </div>
        )}

        <div className="text-center mb-10 relative z-10">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-500/25 border border-yellow-500/30">
            <span className="text-3xl">🧧</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
            <span className="gold-shimmer">กิจกรรมหมุนวงล้อ</span>
          </h1>
          <p className="text-white/40 text-base font-medium">ลุ้นรับอั่งเปาและของรางวัลมากมาย</p>
        </div>

        <EmployeeForm
          onSubmit={enterAsEmployee}
          onAdminLogin={loginAdmin}
          loading={authLoading}
        />

        {isDemoMode && (
          <div className="mt-8 text-center space-y-3 relative z-10">
            {getAllowedEmployees().length > 0 && (
              <div className="glass-card-dark rounded-xl px-5 py-3 inline-block">
                <p className="text-white/40 text-xs mb-1.5 font-medium">รหัสพนักงานที่มีสิทธิ์</p>
                <p className="text-white/70 text-sm font-mono tracking-wider">
                  {getAllowedEmployees().slice(0, 5).join(', ')}
                  {getAllowedEmployees().length > 5 && (
                    <span className="text-white/30"> (+{getAllowedEmployees().length - 5})</span>
                  )}
                </p>
              </div>
            )}
            <p className="text-white/20 text-xs tracking-wide">
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 py-16 relative">
      {isDemoMode && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 z-40">
          <span className="text-yellow-300 text-xs font-medium tracking-wide">Demo Mode</span>
        </div>
      )}

      {/* Header */}
      <div className="w-full max-w-lg flex justify-between items-center mb-8 relative z-10">
        <div className="glass-card rounded-xl px-5 py-3 border border-yellow-500/10">
          <p className="text-yellow-500/50 text-xs font-medium mb-0.5">ผู้เข้าร่วม</p>
          <p className="text-white font-bold text-base">{user?.name}</p>
          <p className="text-yellow-500/40 text-xs font-mono">{user?.employee_id}</p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/history"
            className="glass-card px-4 py-2.5 text-white/70 rounded-xl hover:bg-white/10 transition-all text-sm font-medium flex items-center gap-2"
          >
            <ScrollIcon className="w-4 h-4" />
            ประวัติ
          </Link>
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="btn-gold px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2"
            >
              <SettingsIcon className="w-4 h-4" />
              จัดการ
            </Link>
          )}
          <button
            onClick={logout}
            className="glass-card px-4 py-2.5 text-white/40 rounded-xl hover:bg-white/10 hover:text-white/60 transition-all text-sm font-medium flex items-center gap-2"
          >
            <LogOutIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-10 relative z-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          <span className="gold-shimmer">หมุนวงล้อรับโชค</span>
        </h1>
        <div className="divider-gold w-24 mx-auto mt-3" />
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

          <div className="mt-10 relative z-10">
            <SpinButton
              onClick={handleSpin}
              spinning={spinning || !!targetPrizeId}
              spinsRemaining={user?.spins_remaining}
              disabled={!user || user.spins_remaining <= 0}
            />
          </div>
        </>
      ) : (
        <div className="glass-card rounded-2xl p-10 text-center border border-yellow-500/10">
          <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-red-500/10 flex items-center justify-center">
            <span className="text-2xl">🎁</span>
          </div>
          <p className="text-white font-bold text-lg">ยังไม่มีรางวัลในระบบ</p>
          <p className="text-white/40 text-sm mt-2">กรุณาติดต่อผู้ดูแลระบบ</p>
        </div>
      )}

      {wonPrize && (
        <PrizePopup prize={wonPrize} onClaim={handleClaimPrize} onDonate={handleDonatePrize} donating={donating} />
      )}

    </div>
  );
}
