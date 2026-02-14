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
      // Use local date (not UTC) to avoid timezone issues
      const pad2 = (n: number) => n.toString().padStart(2, '0');
      const today = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
      const currentTime = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;

      // Normalize: handle Date objects or various string formats from backend
      const normalizeDate = (val: string): string => {
        if (!val) return '';
        if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
        const d = new Date(val);
        if (!isNaN(d.getTime())) {
          return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
        }
        return '';
      };

      const normalizeTime = (val: string): string => {
        if (!val) return '';
        if (/^\d{2}:\d{2}$/.test(val)) return val;
        const d = new Date(val);
        if (!isNaN(d.getTime())) {
          return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
        }
        return '';
      };

      const startDate = normalizeDate(eventSettings.startDate);
      const endDate = normalizeDate(eventSettings.endDate);
      const startTime = normalizeTime(eventSettings.startTime);
      const endTime = normalizeTime(eventSettings.endTime);

      if (startDate && today < startDate) {
        alert('กิจกรรมยังไม่เริ่ม');
        return;
      }
      if (endDate && today > endDate) {
        alert('กิจกรรมสิ้นสุดแล้ว');
        return;
      }
      // Only check time if today is within the date range (or dates aren't set)
      const withinDateRange = (!startDate || today >= startDate) && (!endDate || today <= endDate);
      if (withinDateRange && startTime && currentTime < startTime) {
        alert(`ยังไม่ถึงเวลากิจกรรม (เริ่ม ${startTime} น.)`);
        return;
      }
      if (withinDateRange && endTime && currentTime > endTime) {
        alert(`หมดเวลากิจกรรมแล้ว (สิ้นสุด ${endTime} น.)`);
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
        <div className="glass-card rounded-2xl px-12 py-10 flex flex-col items-center gap-5 border border-yellow-500/20">
          <div className="w-14 h-14 border-3 border-yellow-500/30 border-t-yellow-400 rounded-full animate-spin" style={{ borderWidth: '3px' }} />
          <p className="text-white font-medium tracking-wide">กำลังโหลด...</p>
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
          <p className="text-white/90 text-base font-medium">ลุ้นรับอั่งเปาและของรางวัลมากมาย</p>
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
                <p className="text-white/70 text-xs mb-1.5 font-medium">รหัสพนักงานที่มีสิทธิ์</p>
                <p className="text-white/70 text-sm font-mono tracking-wider">
                  {getAllowedEmployees().slice(0, 5).join(', ')}
                  {getAllowedEmployees().length > 5 && (
                    <span className="text-white/60"> (+{getAllowedEmployees().length - 5})</span>
                  )}
                </p>
              </div>
            )}
            <p className="text-white/50 text-xs tracking-wide">
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
        <div className="glass-card rounded-xl px-5 py-3 border border-yellow-500/25">
          <p className="text-yellow-400 text-xs font-medium mb-0.5">ผู้เข้าร่วม</p>
          <p className="text-white font-bold text-base">{user?.name}</p>
          <p className="text-yellow-400/80 text-xs font-mono">{user?.employee_id}</p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/history"
            className="glass-card px-4 py-2.5 text-white/90 rounded-xl hover:bg-white/10 transition-all text-sm font-medium flex items-center gap-2"
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
            className="glass-card px-4 py-2.5 text-white/90 rounded-xl hover:bg-white/10 transition-all text-sm font-medium flex items-center gap-2"
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
        <div className="glass-card rounded-2xl p-10 text-center border border-yellow-500/25">
          <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-red-500/20 flex items-center justify-center">
            <span className="text-2xl">🎁</span>
          </div>
          <p className="text-white font-bold text-lg">ยังไม่มีรางวัลในระบบ</p>
          <p className="text-white/80 text-sm mt-2">กรุณาติดต่อผู้ดูแลระบบ</p>
        </div>
      )}

      {wonPrize && (
        <PrizePopup prize={wonPrize} onClaim={handleClaimPrize} onDonate={handleDonatePrize} donating={donating} />
      )}

    </div>
  );
}
