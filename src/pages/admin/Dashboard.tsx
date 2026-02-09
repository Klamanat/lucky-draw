import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { LanternIcon, LockIcon, GiftIcon, UsersIcon, ClipboardIcon, TargetIcon, TrophyIcon, HeartIcon } from '../../components/icons';

interface Stats {
  totalSpins: number;
  totalUsers: number;
  totalDonations: number;
  totalDonationAmount: number;
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
          <div className="absolute inset-0 rounded-2xl bg-red-500/30 blur-xl" />
          <div className="relative glass-card rounded-2xl p-10 text-center border-2 border-yellow-500/30">
            <LockIcon className="w-10 h-10 text-red-500 mb-4 mx-auto" />
            <p className="text-red-700 font-bold text-lg mb-6">ไม่มีสิทธิ์เข้าถึง</p>
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
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <LanternIcon className="w-8 h-8 text-red-500" />
              <h1 className="text-3xl font-bold">
                <span className="gold-shimmer">ระบบจัดการ</span>
              </h1>
            </div>
            <div className="w-20 h-1 bg-gradient-to-r from-yellow-400 to-transparent mt-2 ml-12" />
          </div>
          <Link
            to="/"
            className="glass-card px-6 py-3 text-red-700 rounded-xl hover:bg-white/80 transition-all font-bold border-2 border-yellow-500/30"
          >
            กลับหน้าหลัก
          </Link>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Prize Manager */}
          <Link to="/admin/prizes" className="group relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-yellow-400/30 to-red-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative glass-card rounded-2xl p-8 text-center border-2 border-yellow-500/20 group-hover:border-yellow-500/50 transition-all group-hover:shadow-xl">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform border-2 border-yellow-400">
                <GiftIcon className="w-8 h-8 text-white" />
              </div>
              <p className="text-red-800 font-bold text-lg mb-1">จัดการรางวัล</p>
              <p className="text-gray-500 text-sm">เพิ่ม แก้ไข ลบรางวัล</p>
            </div>
          </Link>

          {/* Employee Manager */}
          <Link to="/admin/employees" className="group relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-yellow-400/30 to-red-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative glass-card rounded-2xl p-8 text-center border-2 border-yellow-500/20 group-hover:border-yellow-500/50 transition-all group-hover:shadow-xl">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform border-2 border-yellow-400">
                <UsersIcon className="w-8 h-8 text-white" />
              </div>
              <p className="text-red-800 font-bold text-lg mb-1">จัดการพนักงาน</p>
              <p className="text-gray-500 text-sm">กำหนดสิทธิ์เข้าร่วม</p>
            </div>
          </Link>

          {/* Spin Logs */}
          <Link to="/admin/logs" className="group relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-yellow-400/30 to-red-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative glass-card rounded-2xl p-8 text-center border-2 border-yellow-500/20 group-hover:border-yellow-500/50 transition-all group-hover:shadow-xl">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform border-2 border-yellow-400">
                <ClipboardIcon className="w-8 h-8 text-white" />
              </div>
              <p className="text-red-800 font-bold text-lg mb-1">ประวัติทั้งหมด</p>
              <p className="text-gray-500 text-sm">ดูรายการหมุนทั้งหมด</p>
            </div>
          </Link>
        </div>

        {/* Stats Section */}
        {loading ? (
          <div className="glass-card rounded-2xl p-12 text-center border-2 border-yellow-500/20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
              <p className="text-red-700 font-medium">กำลังโหลดข้อมูล...</p>
            </div>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Total Spins */}
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-yellow-400/20 blur-xl" />
              <div className="relative glass-card rounded-2xl p-8 border-2 border-yellow-500/30">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg border-2 border-yellow-400">
                    <TargetIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">จำนวนหมุนทั้งหมด</p>
                    <p className="text-4xl font-bold text-red-700">{stats.totalSpins.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Users */}
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-yellow-400/20 blur-xl" />
              <div className="relative glass-card rounded-2xl p-8 border-2 border-yellow-500/30">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg border-2 border-yellow-400">
                    <UsersIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">ผู้เข้าร่วมทั้งหมด</p>
                    <p className="text-4xl font-bold text-red-700">{stats.totalUsers.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Donations */}
            <div className="relative md:col-span-2">
              <div className="absolute inset-0 rounded-2xl bg-pink-400/20 blur-xl" />
              <div className="relative glass-card rounded-2xl p-8 border-2 border-pink-500/30">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-500 to-pink-700 flex items-center justify-center shadow-lg border-2 border-pink-300">
                    <HeartIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">จำนวนบริจาค</p>
                    <p className="text-4xl font-bold text-pink-700">{stats.totalDonations.toLocaleString()} <span className="text-lg">ครั้ง</span></p>
                    {stats.totalDonationAmount > 0 && (
                      <p className="text-pink-500 font-bold mt-1">รวม {stats.totalDonationAmount.toLocaleString()} บาท</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Prize Stats */}
            {Object.keys(stats.prizeStats).length > 0 && (
              <div className="md:col-span-2 relative">
                <div className="absolute inset-0 rounded-2xl bg-yellow-400/10 blur-xl" />
                <div className="relative glass-card rounded-2xl p-8 border-2 border-yellow-500/30">
                  <div className="flex items-center gap-4 mb-6">
                    <TrophyIcon className="w-7 h-7 text-yellow-500" />
                    <h3 className="text-red-800 font-bold text-lg">รางวัลที่ออก</h3>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(stats.prizeStats).map(([name, count]) => (
                      <div key={name} className="flex justify-between items-center py-3 px-4 rounded-xl bg-gradient-to-r from-red-50 to-yellow-50 border border-yellow-200">
                        <span className="text-red-700 font-medium">{name}</span>
                        <span className="font-bold text-red-800 bg-yellow-200 px-4 py-1.5 rounded-full text-sm border border-yellow-400">
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
          <div className="glass-card rounded-2xl p-12 text-center border-2 border-yellow-500/20">
            <p className="text-red-700 font-medium">ไม่สามารถโหลดข้อมูลได้</p>
          </div>
        )}
      </div>
    </div>
  );
}
