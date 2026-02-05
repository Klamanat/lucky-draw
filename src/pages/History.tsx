import { useAuth } from '../hooks/useAuth';
import { SpinHistory } from '../components/SpinHistory';
import { Link } from 'react-router-dom';

export function History() {
  const { user, isLoggedIn } = useAuth();

  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-white mb-4">กรุณาเข้าสู่ระบบก่อน</p>
        <Link
          to="/"
          className="px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30"
        >
          กลับหน้าหลัก
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">ประวัติการหมุน</h1>
          <Link
            to="/"
            className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30"
          >
            กลับ
          </Link>
        </div>

        <SpinHistory userId={user.id} />
      </div>
    </div>
  );
}
