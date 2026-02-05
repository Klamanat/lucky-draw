import { useAuth } from '../hooks/useAuth';
import { SpinHistory } from '../components/SpinHistory';
import { Link } from 'react-router-dom';

export function History() {
  const { user, isLoggedIn } = useAuth();

  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="glass-card rounded-lg p-6 text-center shadow-xl border border-amber-600/10">
          <p className="text-gray-600 mb-4">กรุณาลงทะเบียนก่อน</p>
          <Link
            to="/"
            className="px-6 py-3 btn-premium rounded-lg inline-block"
          >
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pt-12">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-amber-100">ประวัติการหมุน</h1>
          <Link
            to="/"
            className="glass-card px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-50 transition-all font-medium shadow-md border border-gray-200"
          >
            กลับ
          </Link>
        </div>

        <SpinHistory userId={user.id} />
      </div>
    </div>
  );
}
