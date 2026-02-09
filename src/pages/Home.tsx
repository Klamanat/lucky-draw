import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LuckyWheel, SpinButton } from '../components/LuckyWheel';
import { PrizePopup } from '../components/PrizePopup';
import { EmployeeForm } from '../components/EmployeeForm';
import { useAuth } from '../hooks/useAuth';
import { useSpin } from '../hooks/useSpin';
import { isDemoMode, getAllowedEmployees } from '../services/api';
import type { Prize } from '../types';

export function Home() {
  const { user, isLoggedIn, loading: authLoading, enterAsEmployee, loginAdmin, logout, updateSpinsRemaining } = useAuth();
  const { prizes, loading: prizesLoading, spinning, spin, loadPrizes } = useSpin();

  const [targetPrizeId, setTargetPrizeId] = useState<string | undefined>();
  const [wonPrize, setWonPrize] = useState<Prize | null>(null);

  useEffect(() => {
    loadPrizes();
  }, [loadPrizes]);

  const handleSpin = async () => {
    if (!user) return;

    const result = await spin(user.id);

    if (result.success && result.prize) {
      setTargetPrizeId(result.prize.id);
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

  const handleClosePrize = () => {
    setWonPrize(null);
  };

  // Loading state
  if (authLoading || prizesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-amber-300 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
          <p className="text-amber-100 text-lg font-medium tracking-wide">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  // Not logged in - show employee form
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 py-16">
        {isDemoMode && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 z-40">
            <span className="text-amber-300 text-xs font-medium tracking-wide">Demo Mode</span>
          </div>
        )}

        {/* Logo/Title */}
        <div className="text-center mb-10">
          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold tracking-wide mb-4">
            <span className="gold-shimmer">กิจกรรมหมุนวงล้อชิงโชค</span>
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-6 mb-4" />
          <p className="text-amber-200/80 text-lg font-medium">ลุ้นรับของรางวัลมากมาย</p>
        </div>

        <EmployeeForm
          onSubmit={enterAsEmployee}
          onAdminLogin={loginAdmin}
          loading={authLoading}
        />

        {isDemoMode && (
          <div className="mt-8 text-center space-y-3">
            {getAllowedEmployees().length > 0 && (
              <div className="glass-card-dark rounded-xl px-6 py-4 inline-block">
                <p className="text-amber-300/70 text-xs mb-2 font-medium">รหัสพนักงานที่มีสิทธิ์</p>
                <p className="text-amber-100 text-sm font-mono tracking-wider">
                  {getAllowedEmployees().slice(0, 5).join(', ')}
                  {getAllowedEmployees().length > 5 && (
                    <span className="text-amber-400/60"> (+{getAllowedEmployees().length - 5})</span>
                  )}
                </p>
              </div>
            )}
            <p className="text-amber-300/40 text-xs tracking-wide">
              Admin: กรอกรหัส admin1234
            </p>
          </div>
        )}
      </div>
    );
  }

  // Logged in - show wheel
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 py-16">
      {isDemoMode && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 z-40">
          <span className="text-amber-300 text-xs font-medium tracking-wide">Demo Mode</span>
        </div>
      )}

      {/* Header */}
      <div className="w-full max-w-lg flex justify-between items-center mb-8">
        {/* User info card */}
        <div className="relative">
          <div className="absolute inset-0 rounded-xl bg-amber-500/10 blur-lg" />
          <div className="relative glass-card rounded-xl px-6 py-4 border border-amber-500/20">
            <p className="text-gray-500 text-xs font-medium mb-1">ผู้เข้าร่วม</p>
            <p className="text-gray-800 font-bold text-lg">{user?.name}</p>
            <p className="text-amber-700 text-sm font-mono tracking-wider">{user?.employee_id}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Link
            to="/history"
            className="glass-card px-5 py-3 text-gray-600 rounded-xl hover:bg-white/80 transition-all text-sm font-semibold border border-gray-200 hover:border-amber-500/30"
          >
            ประวัติ
          </Link>
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="btn-gold px-5 py-3 rounded-xl text-sm font-semibold"
            >
              จัดการระบบ
            </Link>
          )}
          <button
            onClick={logout}
            className="glass-card px-5 py-3 text-gray-500 rounded-xl hover:bg-white/80 transition-all text-sm font-semibold border border-gray-200 hover:border-red-300"
          >
            ออก
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-wide">
          <span className="gold-shimmer">หมุนวงล้อชิงโชค</span>
        </h1>
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-4" />
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

          <div className="mt-10">
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
          <div className="absolute inset-0 rounded-2xl bg-amber-500/10 blur-xl" />
          <div className="relative glass-card rounded-2xl p-10 text-center border border-amber-500/20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <p className="text-gray-700 font-semibold text-lg">ยังไม่มีรางวัลในระบบ</p>
            <p className="text-gray-500 text-sm mt-2">กรุณาติดต่อผู้ดูแลระบบ</p>
          </div>
        </div>
      )}

      {/* Prize Popup */}
      {wonPrize && (
        <PrizePopup prize={wonPrize} onClose={handleClosePrize} />
      )}
    </div>
  );
}
