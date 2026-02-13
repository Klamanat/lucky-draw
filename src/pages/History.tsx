import { useAuth } from '../hooks/useAuth';
import { SpinHistory } from '../components/SpinHistory';
import { Link } from 'react-router-dom';

export function History() {
  const { user, isLoggedIn } = useAuth();

  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="glass-card rounded-2xl p-10 text-center border border-white/10">
          <span className="text-4xl mb-4 block">🔐</span>
          <p className="text-white font-bold text-lg mb-6">กรุณาลงทะเบียนก่อน</p>
          <Link
            to="/"
            className="px-8 py-3 btn-premium rounded-xl inline-block font-bold"
          >
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 py-16">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">
              <span className="gold-shimmer">ประวัติการหมุน</span>
            </h1>
            <div className="divider-gold w-16 mt-2" />
          </div>
          <Link
            to="/"
            className="glass-card px-5 py-2.5 text-white/60 rounded-xl hover:bg-white/10 transition-all text-sm font-medium border border-white/10"
          >
            กลับ
          </Link>
        </div>

        <SpinHistory userId={user.id} />
      </div>
    </div>
  );
}
