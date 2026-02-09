import { useAuth } from '../hooks/useAuth';
import { SpinHistory } from '../components/SpinHistory';
import { Link } from 'react-router-dom';
import { LockIcon, ScrollIcon } from '../components/icons';

export function History() {
  const { user, isLoggedIn } = useAuth();

  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-yellow-500/30 blur-xl" />
          <div className="relative glass-card rounded-2xl p-10 text-center border-2 border-yellow-500/30">
            <span className="text-4xl mb-4 block">🔐</span>
            <p className="text-red-700 font-bold text-lg mb-6">กรุณาลงทะเบียนก่อน</p>
            <Link
              to="/"
              className="px-8 py-3 btn-premium rounded-xl inline-block font-bold"
            >
              กลับหน้าหลัก
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 py-16">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">📜</span>
              <h1 className="text-3xl font-bold">
                <span className="gold-shimmer">ประวัติการหมุน</span>
              </h1>
            </div>
            <div className="w-20 h-1 bg-gradient-to-r from-yellow-400 to-transparent mt-2 ml-12" />
          </div>
          <Link
            to="/"
            className="glass-card px-6 py-3 text-red-700 rounded-xl hover:bg-white/80 transition-all font-bold border-2 border-yellow-500/30"
          >
            กลับ
          </Link>
        </div>

        <SpinHistory userId={user.id} />
      </div>
    </div>
  );
}
