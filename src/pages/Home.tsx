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
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-amber-600/30 border-t-amber-600 rounded-full animate-spin" />
          <p className="text-amber-100 text-base font-medium">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  // Not logged in - show employee form
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 pt-12">
        {isDemoMode && (
          <div className="fixed top-1 left-0 right-0 text-amber-200/60 text-center py-1 text-xs z-40">
            Demo Mode
          </div>
        )}

        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-amber-100 tracking-wide">
            กิจกรรมหมุนวงล้อชิงโชค
          </h1>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto mt-4" />
          <p className="text-amber-200/70 text-base mt-4">ลุ้นรับของรางวัลมากมาย</p>
        </div>

        <EmployeeForm
          onSubmit={enterAsEmployee}
          onAdminLogin={loginAdmin}
          loading={authLoading}
        />

        {isDemoMode && (
          <div className="mt-6 text-center space-y-2">
            {getAllowedEmployees().length > 0 && (
              <div className="glass-card rounded-lg p-3 inline-block">
                <p className="text-gray-500 text-xs mb-1">รหัสพนักงานที่มีสิทธิ์:</p>
                <p className="text-amber-700 text-xs font-mono">
                  {getAllowedEmployees().slice(0, 5).join(', ')}
                  {getAllowedEmployees().length > 5 && ` (+${getAllowedEmployees().length - 5})`}
                </p>
              </div>
            )}
            <p className="text-amber-200/40 text-xs">
              Admin: กรอกรหัส admin1234
            </p>
          </div>
        )}
      </div>
    );
  }

  // Logged in - show wheel
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 pt-12">
      {isDemoMode && (
        <div className="fixed top-1 left-0 right-0 text-amber-200/60 text-center py-1 text-xs z-40">
          Demo Mode
        </div>
      )}

      {/* Header */}
      <div className="w-full max-w-md flex justify-between items-center mb-6">
        <div className="glass-card rounded-lg px-4 py-3 shadow-lg border border-amber-600/10">
          <p className="text-gray-500 text-xs">ผู้เข้าร่วม</p>
          <p className="text-gray-800 font-semibold">{user?.name}</p>
          <p className="text-amber-700 text-xs font-mono">{user?.employee_id}</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/history"
            className="glass-card px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium shadow-md border border-gray-200"
          >
            ประวัติ
          </Link>
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="btn-gold px-4 py-2 rounded-lg text-sm"
            >
              จัดการระบบ
            </Link>
          )}
          <button
            onClick={logout}
            className="glass-card px-4 py-2 text-gray-500 rounded-lg hover:bg-gray-50 transition-all text-sm shadow-md border border-gray-200"
          >
            ออก
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-amber-100 tracking-wide">
          หมุนวงล้อชิงโชค
        </h1>
        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto mt-2" />
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

          <div className="mt-8">
            <SpinButton
              onClick={handleSpin}
              spinning={spinning || !!targetPrizeId}
              spinsRemaining={user?.spins_remaining}
              disabled={!user || user.spins_remaining <= 0}
            />
          </div>
        </>
      ) : (
        <div className="glass-card rounded-lg p-8 text-center shadow-lg border border-amber-600/10">
          <p className="text-gray-700 font-medium">ยังไม่มีรางวัลในระบบ</p>
          <p className="text-gray-500 text-sm mt-1">กรุณาติดต่อผู้ดูแลระบบ</p>
        </div>
      )}

      {/* Prize Popup */}
      {wonPrize && (
        <PrizePopup prize={wonPrize} onClose={handleClosePrize} />
      )}
    </div>
  );
}
