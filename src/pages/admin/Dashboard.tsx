import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

interface Stats {
  totalSpins: number;
  totalUsers: number;
  prizeStats: Record<string, number>;
}

export function Dashboard() {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const result = await api.getStats();
      if (result.success) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-white mb-4">ไม่มีสิทธิ์เข้าถึง</p>
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
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <Link
            to="/"
            className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30"
          >
            กลับ
          </Link>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link
            to="/admin/prizes"
            className="bg-white/10 rounded-xl p-4 text-center hover:bg-white/20 transition-colors"
          >
            <div className="text-3xl mb-2">🎁</div>
            <p className="text-white font-medium">จัดการรางวัล</p>
          </Link>
          <Link
            to="/admin/logs"
            className="bg-white/10 rounded-xl p-4 text-center hover:bg-white/20 transition-colors"
          >
            <div className="text-3xl mb-2">📋</div>
            <p className="text-white font-medium">ประวัติทั้งหมด</p>
          </Link>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="text-white/60 text-center">กำลังโหลด...</div>
        ) : stats ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl p-6">
              <p className="text-white/60 text-sm">จำนวนหมุนทั้งหมด</p>
              <p className="text-4xl font-bold text-white">{stats.totalSpins}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-6">
              <p className="text-white/60 text-sm">ผู้ใช้ทั้งหมด</p>
              <p className="text-4xl font-bold text-white">{stats.totalUsers}</p>
            </div>

            {Object.keys(stats.prizeStats).length > 0 && (
              <div className="col-span-2 bg-white/10 rounded-xl p-6">
                <p className="text-white/60 text-sm mb-4">รางวัลที่ออก</p>
                <div className="space-y-2">
                  {Object.entries(stats.prizeStats).map(([name, count]) => (
                    <div key={name} className="flex justify-between text-white">
                      <span>{name}</span>
                      <span className="font-bold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-white/60 text-center">ไม่สามารถโหลดข้อมูลได้</div>
        )}
      </div>
    </div>
  );
}
