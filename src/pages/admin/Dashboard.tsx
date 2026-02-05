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
        <div className="glass-card rounded-lg p-6 text-center shadow-xl border border-amber-600/10">
          <p className="text-gray-600 mb-4">ไม่มีสิทธิ์เข้าถึง</p>
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
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-amber-100">ระบบจัดการ</h1>
            <div className="w-12 h-0.5 bg-gradient-to-r from-amber-600 to-transparent mt-2" />
          </div>
          <Link
            to="/"
            className="glass-card px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-50 transition-all font-medium shadow-md border border-gray-200"
          >
            กลับ
          </Link>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link
            to="/admin/prizes"
            className="glass-card rounded-lg p-6 text-center hover:shadow-lg transition-all shadow-md border border-amber-600/10"
          >
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <p className="text-gray-800 font-semibold">จัดการรางวัล</p>
            <p className="text-gray-500 text-sm mt-1">เพิ่ม แก้ไข ลบรางวัล</p>
          </Link>
          <Link
            to="/admin/logs"
            className="glass-card rounded-lg p-6 text-center hover:shadow-lg transition-all shadow-md border border-amber-600/10"
          >
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-800 font-semibold">ประวัติทั้งหมด</p>
            <p className="text-gray-500 text-sm mt-1">ดูรายการหมุนทั้งหมด</p>
          </Link>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="glass-card rounded-lg p-8 text-center shadow-lg border border-amber-600/10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-3 border-gray-200 border-t-amber-600 rounded-full animate-spin" />
              <p className="text-gray-500">กำลังโหลด...</p>
            </div>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card rounded-lg p-6 shadow-md border border-amber-600/10">
              <p className="text-gray-500 text-sm">จำนวนหมุนทั้งหมด</p>
              <p className="text-4xl font-bold text-amber-700 mt-1">{stats.totalSpins}</p>
            </div>
            <div className="glass-card rounded-lg p-6 shadow-md border border-amber-600/10">
              <p className="text-gray-500 text-sm">ผู้เข้าร่วมทั้งหมด</p>
              <p className="text-4xl font-bold text-amber-700 mt-1">{stats.totalUsers}</p>
            </div>

            {Object.keys(stats.prizeStats).length > 0 && (
              <div className="col-span-2 glass-card rounded-lg p-6 shadow-md border border-amber-600/10">
                <p className="text-gray-500 text-sm mb-4">รางวัลที่ออก</p>
                <div className="space-y-2">
                  {Object.entries(stats.prizeStats).map(([name, count]) => (
                    <div key={name} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                      <span className="text-gray-700">{name}</span>
                      <span className="font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full text-sm">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="glass-card rounded-lg p-8 text-center shadow-lg border border-amber-600/10">
            <p className="text-gray-500">ไม่สามารถโหลดข้อมูลได้</p>
          </div>
        )}
      </div>
    </div>
  );
}
