import { useAuth } from '../hooks/useAuth';
import { SpinHistory } from '../components/SpinHistory';
import { Link } from 'react-router-dom';

export function History() {
  const { user, isLoggedIn } = useAuth();

  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-amber-500/20 blur-xl" />
          <div className="relative glass-card rounded-2xl p-10 text-center border border-amber-500/20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m5-6a3 3 0 11-6 0 3 3 0 016 0zm-9 8c0-3.314 2.686-6 6-6s6 2.686 6 6H6z" />
              </svg>
            </div>
            <p className="text-gray-700 font-semibold text-lg mb-6">กรุณาลงทะเบียนก่อน</p>
            <Link
              to="/"
              className="px-8 py-3 btn-premium rounded-xl inline-block font-semibold"
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
            <h1 className="text-3xl font-bold">
              <span className="gold-shimmer">ประวัติการหมุน</span>
            </h1>
            <div className="w-16 h-1 bg-gradient-to-r from-amber-500 to-transparent mt-3" />
          </div>
          <Link
            to="/"
            className="glass-card px-6 py-3 text-gray-600 rounded-xl hover:bg-white/80 transition-all font-semibold border border-gray-200 hover:border-amber-500/30"
          >
            กลับ
          </Link>
        </div>

        <SpinHistory userId={user.id} />
      </div>
    </div>
  );
}
