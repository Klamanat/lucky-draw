import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { LockIcon, GiftIcon, UsersIcon, ClipboardIcon, ClockIcon, TargetIcon, TrophyIcon, HeartIcon } from '../../components/icons';

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
        <div className="glass-card rounded-2xl p-10 text-center border border-yellow-500/25">
          <LockIcon className="w-8 h-8 text-red-400 mb-4 mx-auto" />
          <p className="text-white font-bold text-lg mb-6">ไม่มีสิทธิ์เข้าถึง</p>
          <Link to="/" className="px-8 py-3 btn-premium rounded-xl inline-block font-bold">กลับหน้าหลัก</Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { to: '/admin/prizes', icon: GiftIcon, title: 'จัดการรางวัล', desc: 'เพิ่ม แก้ไข ลบรางวัล', color: 'from-red-600 to-red-800' },
    { to: '/admin/employees', icon: UsersIcon, title: 'จัดการพนักงาน', desc: 'กำหนดสิทธิ์เข้าร่วม', color: 'from-amber-600 to-amber-800' },
    { to: '/admin/participants', icon: UsersIcon, title: 'ผู้เข้าร่วม', desc: 'ดูรายชื่อผู้ลงทะเบียน', color: 'from-emerald-600 to-emerald-800' },
    { to: '/admin/logs', icon: ClipboardIcon, title: 'ประวัติทั้งหมด', desc: 'ดูรายการหมุนทั้งหมด', color: 'from-yellow-600 to-yellow-800' },
    { to: '/admin/settings', icon: ClockIcon, title: 'ตั้งค่ากิจกรรม', desc: 'ช่วงเวลาและวันที่', color: 'from-orange-600 to-orange-800' },
  ];

  return (
    <div className="min-h-screen p-4 py-16">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8 sm:mb-10">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold"><span className="gold-shimmer">ระบบจัดการ</span></h1>
            <div className="divider-gold w-16 mt-2" />
          </div>
          <Link to="/" className="glass-card px-4 py-2 sm:px-5 sm:py-2.5 text-white/90 rounded-xl hover:bg-white/10 transition-all text-xs sm:text-sm font-medium border border-yellow-500/25">กลับหน้าหลัก</Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-10">
          {navItems.map(({ to, icon: Icon, title, desc, color }) => (
            <Link key={to} to={to} className="group">
              <div className="glass-card rounded-2xl p-4 sm:p-6 text-center border border-yellow-500/25 group-hover:border-yellow-500/25 transition-all group-hover:bg-white/10">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform border border-yellow-500/25`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <p className="text-white font-bold text-xs sm:text-sm mb-0.5">{title}</p>
                <p className="text-white/90 text-xs hidden sm:block">{desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {loading ? (
          <div className="glass-card rounded-2xl p-12 text-center border border-yellow-500/25">
            <div className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 border-yellow-500/25 border-t-yellow-500 rounded-full animate-spin" style={{ borderWidth: '3px' }} />
              <p className="text-white text-sm font-medium">กำลังโหลดข้อมูล...</p>
            </div>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="glass-card rounded-2xl p-4 sm:p-6 border border-yellow-500/25">
              <div className="flex items-center gap-3 sm:gap-5">
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg border border-yellow-500/25">
                  <TargetIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-white/90 text-xs font-medium mb-0.5">หมุนทั้งหมด</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">{stats.totalSpins.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-4 sm:p-6 border border-yellow-500/25">
              <div className="flex items-center gap-3 sm:gap-5">
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow-lg border border-yellow-500/25">
                  <UsersIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-white/90 text-xs font-medium mb-0.5">ผู้เข้าร่วม</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">{stats.totalUsers.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-4 sm:p-6 border border-yellow-500/25 col-span-2">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-600 to-pink-800 flex items-center justify-center shadow-lg">
                  <HeartIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white/90 text-xs font-medium mb-0.5">จำนวนบริจาค</p>
                  <p className="text-3xl font-bold text-white">{stats.totalDonations.toLocaleString()} <span className="text-base text-white/90">ครั้ง</span></p>
                  {stats.totalDonationAmount > 0 && (
                    <p className="text-pink-400 font-bold text-sm mt-0.5">รวม {stats.totalDonationAmount.toLocaleString()} บาท</p>
                  )}
                </div>
              </div>
            </div>

            {Object.keys(stats.prizeStats).length > 0 && (
              <div className="md:col-span-2 glass-card rounded-2xl p-6 border border-yellow-500/25">
                <div className="flex items-center gap-3 mb-5">
                  <TrophyIcon className="w-5 h-5 text-yellow-500" />
                  <h3 className="text-white font-bold text-sm">รางวัลที่ออก</h3>
                </div>
                <div className="space-y-2">
                  {Object.entries(stats.prizeStats).map(([name, count]) => (
                    <div key={name} className="flex justify-between items-center py-2.5 px-4 rounded-xl bg-black/30 border border-yellow-500/25">
                      <span className="text-white/90 text-sm font-medium">{name}</span>
                      <span className="font-bold text-yellow-400 text-sm bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/25">
                        {count.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-12 text-center border border-yellow-500/25">
            <p className="text-white/90 text-sm font-medium">ไม่สามารถโหลดข้อมูลได้</p>
          </div>
        )}
      </div>
    </div>
  );
}
