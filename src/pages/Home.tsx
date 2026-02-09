import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LuckyWheel, SpinButton } from '../components/LuckyWheel';
import { PrizePopup } from '../components/PrizePopup';
import { EmployeeForm } from '../components/EmployeeForm';
import { useAuth } from '../hooks/useAuth';
import { useSpin } from '../hooks/useSpin';
import { isDemoMode, getAllowedEmployees, api } from '../services/api';
import { LanternIcon, RedEnvelopeIcon, SettingsIcon, LogOutIcon, ScrollIcon } from '../components/icons';
import type { Prize } from '../types';

// Lantern Component
function Lantern({ className = '', delay = 0 }: { className?: string; delay?: number }) {
  return (
    <div className={`${className}`} style={{ animationDelay: `${delay}s` }}>
      <LanternIcon className="w-12 h-16 text-red-500 drop-shadow-lg" />
    </div>
  );
}

export function Home() {
  const { user, isLoggedIn, loading: authLoading, enterAsEmployee, loginAdmin, logout, updateSpinsRemaining } = useAuth();
  const { prizes, loading: prizesLoading, spinning, spin, loadPrizes } = useSpin();

  const [targetPrizeId, setTargetPrizeId] = useState<string | undefined>();
  const [wonPrize, setWonPrize] = useState<Prize | null>(null);
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);
  const [donating, setDonating] = useState(false);

  useEffect(() => {
    loadPrizes();
  }, [loadPrizes]);

  const handleSpin = async () => {
    if (!user) return;

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
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-red-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
          <p className="text-yellow-100 text-lg font-bold tracking-wide">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  // Not logged in - show employee form
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 py-16 relative">
        {/* Decorative lanterns */}
        <div className="fixed top-4 left-8 animate-swing">
          <Lantern delay={0} />
        </div>
        <div className="fixed top-4 right-8 animate-swing">
          <Lantern delay={0.5} />
        </div>
        <div className="fixed top-4 left-1/4 animate-swing hidden md:block">
          <Lantern delay={0.3} />
        </div>
        <div className="fixed top-4 right-1/4 animate-swing hidden md:block">
          <Lantern delay={0.8} />
        </div>

        {isDemoMode && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30 z-40">
            <span className="text-yellow-300 text-xs font-medium tracking-wide">Demo Mode</span>
          </div>
        )}

        {/* Logo/Title */}
        <div className="text-center mb-10 relative z-10">
          <div className="flex justify-center gap-4 mb-4">
            <RedEnvelopeIcon className="w-10 h-10 text-red-500" />
            <LanternIcon className="w-10 h-10 text-red-500" />
            <RedEnvelopeIcon className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-wide mb-4">
            <span className="gold-shimmer">กิจกรรมหมุนวงล้อ</span>
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-2">
            ฉลองตรุษจีน
          </h2>
          <div className="divider-gold w-40 mx-auto my-4" />
          <p className="text-yellow-200/80 text-lg font-medium">ลุ้นรับอั่งเปาและของรางวัลมากมาย</p>
        </div>

        <EmployeeForm
          onSubmit={enterAsEmployee}
          onAdminLogin={loginAdmin}
          loading={authLoading}
        />

        {isDemoMode && (
          <div className="mt-8 text-center space-y-3 relative z-10">
            {getAllowedEmployees().length > 0 && (
              <div className="glass-card-dark rounded-xl px-6 py-4 inline-block">
                <p className="text-yellow-300/70 text-xs mb-2 font-medium">รหัสพนักงานที่มีสิทธิ์</p>
                <p className="text-yellow-100 text-sm font-mono tracking-wider">
                  {getAllowedEmployees().slice(0, 5).join(', ')}
                  {getAllowedEmployees().length > 5 && (
                    <span className="text-yellow-400/60"> (+{getAllowedEmployees().length - 5})</span>
                  )}
                </p>
              </div>
            )}
            <p className="text-yellow-300/40 text-xs tracking-wide">
              Admin: กรอกรหัส admin1234
            </p>
          </div>
        )}
      </div>
    );
  }

  // Logged in - show wheel
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 py-16 relative">
      {/* Decorative lanterns */}
      <div className="fixed top-4 left-8 animate-swing">
        <Lantern delay={0} />
      </div>
      <div className="fixed top-4 right-8 animate-swing">
        <Lantern delay={0.5} />
      </div>

      {isDemoMode && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30 z-40">
          <span className="text-yellow-300 text-xs font-medium tracking-wide">Demo Mode</span>
        </div>
      )}

      {/* Header */}
      <div className="w-full max-w-lg flex justify-between items-center mb-8 relative z-10">
        {/* User info card */}
        <div className="relative">
          <div className="absolute inset-0 rounded-xl bg-yellow-500/20 blur-lg" />
          <div className="relative glass-card rounded-xl px-6 py-4 border-2 border-yellow-500/30">
            <p className="text-red-700 text-xs font-medium mb-1">ผู้เข้าร่วม</p>
            <p className="text-red-900 font-bold text-lg">{user?.name}</p>
            <p className="text-yellow-700 text-sm font-mono tracking-wider">{user?.employee_id}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Link
            to="/history"
            className="glass-card px-4 py-3 text-red-700 rounded-xl hover:bg-white/80 transition-all text-sm font-bold border-2 border-yellow-500/30 flex items-center gap-2"
          >
            <ScrollIcon className="w-4 h-4" />
            ประวัติ
          </Link>
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="btn-gold px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2"
            >
              <SettingsIcon className="w-4 h-4" />
              จัดการ
            </Link>
          )}
          <button
            onClick={logout}
            className="glass-card px-4 py-3 text-gray-600 rounded-xl hover:bg-white/80 transition-all text-sm font-bold border-2 border-gray-200 flex items-center gap-2"
          >
            <LogOutIcon className="w-4 h-4" />
            ออก
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-10 relative z-10">
        <div className="flex justify-center gap-2 mb-2">
          <RedEnvelopeIcon className="w-8 h-8 text-red-500" />
          <LanternIcon className="w-8 h-8 text-red-500" />
          <RedEnvelopeIcon className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-wide">
          <span className="gold-shimmer">หมุนวงล้อรับโชค</span>
        </h1>
        <div className="divider-gold w-32 mx-auto mt-4" />
      </div>

      {/* Wheel */}
      {prizes.length > 0 ? (
        <>
          <LuckyWheel
            prizes={prizes}
            onSpinEnd={handleSpinEnd}
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
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-yellow-500/20 blur-xl" />
          <div className="relative glass-card rounded-2xl p-10 text-center border-2 border-yellow-500/30">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <p className="text-red-700 font-bold text-lg">ยังไม่มีรางวัลในระบบ</p>
            <p className="text-gray-500 text-sm mt-2">กรุณาติดต่อผู้ดูแลระบบ</p>
          </div>
        </div>
      )}

      {/* Prize Popup */}
      {wonPrize && (
        <PrizePopup prize={wonPrize} onClaim={handleClaimPrize} onDonate={handleDonatePrize} donating={donating} />
      )}
    </div>
  );
}
