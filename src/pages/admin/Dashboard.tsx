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
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-red-500/20 blur-xl" />
          <div className="relative glass-card rounded-2xl p-10 text-center border border-red-500/20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m5-6a3 3 0 11-6 0 3 3 0 016 0zm-9 8c0-3.314 2.686-6 6-6s6 2.686 6 6H6z" />
              </svg>
            </div>
            <p className="text-gray-700 font-semibold text-lg mb-6">ไม่มีสิทธิ์เข้าถึง</p>
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
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold">
              <span className="gold-shimmer">ระบบจัดการ</span>
            </h1>
            <div className="w-16 h-1 bg-gradient-to-r from-amber-500 to-transparent mt-3" />
          </div>
          <Link
            to="/"
            className="glass-card px-6 py-3 text-gray-600 rounded-xl hover:bg-white/80 transition-all font-semibold border border-gray-200 hover:border-amber-500/30"
          >
            กลับหน้าหลัก
          </Link>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Prize Manager */}
          <Link
            to="/admin/prizes"
            className="group relative"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative glass-card rounded-2xl p-8 text-center border border-amber-500/10 group-hover:border-amber-500/30 transition-all group-hover:shadow-xl">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <p className="text-gray-800 font-bold text-lg mb-1">จัดการรางวัล</p>
              <p className="text-gray-500 text-sm">เพิ่ม แก้ไข ลบรางวัล</p>
            </div>
          </Link>

          {/* Employee Manager */}
          <Link
            to="/admin/employees"
            className="group relative"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative glass-card rounded-2xl p-8 text-center border border-amber-500/10 group-hover:border-amber-500/30 transition-all group-hover:shadow-xl">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-gray-800 font-bold text-lg mb-1">จัดการพนักงาน</p>
              <p className="text-gray-500 text-sm">กำหนดสิทธิ์เข้าร่วม</p>
            </div>
          </Link>

          {/* Spin Logs */}
          <Link
            to="/admin/logs"
            className="group relative"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative glass-card rounded-2xl p-8 text-center border border-amber-500/10 group-hover:border-amber-500/30 transition-all group-hover:shadow-xl">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-gray-800 font-bold text-lg mb-1">ประวัติทั้งหมด</p>
              <p className="text-gray-500 text-sm">ดูรายการหมุนทั้งหมด</p>
            </div>
          </Link>
        </div>

        {/* Stats Section */}
        {loading ? (
          <div className="glass-card rounded-2xl p-12 text-center border border-amber-500/10">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
              </div>
              <p className="text-gray-500 font-medium">กำลังโหลดข้อมูล...</p>
            </div>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Total Spins */}
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400/10 to-transparent blur-xl" />
              <div className="relative glass-card rounded-2xl p-8 border border-amber-500/10">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">จำนวนหมุนทั้งหมด</p>
                    <p className="text-4xl font-bold text-amber-700">{stats.totalSpins.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Users */}
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400/10 to-transparent blur-xl" />
              <div className="relative glass-card rounded-2xl p-8 border border-amber-500/10">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">ผู้เข้าร่วมทั้งหมด</p>
                    <p className="text-4xl font-bold text-amber-700">{stats.totalUsers.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Prize Stats */}
            {Object.keys(stats.prizeStats).length > 0 && (
              <div className="md:col-span-2 relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400/10 to-transparent blur-xl" />
                <div className="relative glass-card rounded-2xl p-8 border border-amber-500/10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-gray-800 font-bold text-lg">รางวัลที่ออก</h3>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(stats.prizeStats).map(([name, count]) => (
                      <div key={name} className="flex justify-between items-center py-3 px-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100">
                        <span className="text-gray-700 font-medium">{name}</span>
                        <span className="font-bold text-amber-800 bg-white px-4 py-1.5 rounded-full text-sm shadow-sm border border-amber-200">
                          {count.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-12 text-center border border-amber-500/10">
            <p className="text-gray-500 font-medium">ไม่สามารถโหลดข้อมูลได้</p>
          </div>
        )}
      </div>
    </div>
  );
}
