import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LuckyWheel, SpinButton } from '../components/LuckyWheel';
import { PrizePopup } from '../components/PrizePopup';
import { LoginForm } from '../components/LoginForm';
import { RegisterForm } from '../components/RegisterForm';
import { useAuth } from '../hooks/useAuth';
import { useSpin } from '../hooks/useSpin';
import { isDemoMode } from '../services/api';
import type { Prize } from '../types';

export function Home() {
  const { user, isLoggedIn, loading: authLoading, login, register, logout, updateSpinsRemaining } = useAuth();
  const { prizes, loading: prizesLoading, spinning, spin, loadPrizes } = useSpin();

  const [showLogin, setShowLogin] = useState(true);
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
        <div className="text-white text-xl">กำลังโหลด...</div>
      </div>
    );
  }

  // Not logged in - show auth forms
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        {isDemoMode && (
          <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-black text-center py-2 text-sm font-medium">
            Demo Mode - ยังไม่ได้เชื่อมต่อ Google Sheet
          </div>
        )}

        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          🎡 วงล้อโชคลาภ
        </h1>

        {showLogin ? (
          <LoginForm
            onLogin={login}
            onSwitchToRegister={() => setShowLogin(false)}
            loading={authLoading}
          />
        ) : (
          <RegisterForm
            onRegister={register}
            onSwitchToLogin={() => setShowLogin(true)}
            loading={authLoading}
          />
        )}

        {isDemoMode && (
          <div className="mt-6 bg-white/10 rounded-xl p-4 max-w-md text-center">
            <p className="text-white/80 text-sm mb-2">บัญชีทดสอบ:</p>
            <p className="text-yellow-300 font-mono text-sm">demo@example.com</p>
            <p className="text-yellow-300 font-mono text-sm">admin@example.com (Admin)</p>
          </div>
        )}
      </div>
    );
  }

  // Logged in - show wheel
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {isDemoMode && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-black text-center py-2 text-sm font-medium">
          Demo Mode - ยังไม่ได้เชื่อมต่อ Google Sheet
        </div>
      )}

      {/* Header */}
      <div className="w-full max-w-lg flex justify-between items-center mb-6">
        <div className="text-white">
          <p className="text-sm opacity-80">สวัสดี</p>
          <p className="font-bold">{user?.name}</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/history"
            className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
          >
            ประวัติ
          </Link>
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Admin
            </Link>
          )}
          <button
            onClick={logout}
            className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
          >
            ออก
          </button>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-white mb-8 text-center">
        🎡 วงล้อโชคลาภ
      </h1>

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
        <div className="text-white/60 text-center">
          <p>ยังไม่มีรางวัลในระบบ</p>
          <p className="text-sm">กรุณาติดต่อผู้ดูแลระบบ</p>
        </div>
      )}

      {/* Prize Popup */}
      {wonPrize && (
        <PrizePopup prize={wonPrize} onClose={handleClosePrize} />
      )}
    </div>
  );
}
