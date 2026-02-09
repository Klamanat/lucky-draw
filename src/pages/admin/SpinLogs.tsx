import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { SpinHistory } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
// import { LockIcon, ClipboardIcon, GiftIcon, ClockIcon, InboxIcon } from '../../components/icons';

export function SpinLogs() {
  const { isAdmin } = useAuth();
  const [history, setHistory] = useState<SpinHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const result = await api.getAllHistory();
      if (result.success) {
        setHistory(result.history);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
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
            <span className="text-4xl mb-4 block">🔒</span>
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
              <span className="text-3xl">📋</span>
              <h1 className="text-3xl font-bold">
                <span className="gold-shimmer">ประวัติการหมุนทั้งหมด</span>
              </h1>
            </div>
            <div className="w-20 h-1 bg-gradient-to-r from-yellow-400 to-transparent mt-2 ml-12" />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-yellow-300 text-sm font-bold bg-red-700/50 px-4 py-2 rounded-full border border-yellow-400">
              {history.length} รายการ
            </span>
            <Link
              to="/admin"
              className="glass-card px-6 py-3 text-red-700 rounded-xl hover:bg-white/80 font-bold border-2 border-yellow-500/30 transition-all"
            >
              กลับ
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-yellow-500/20 blur-xl" />
            <div className="relative glass-card rounded-2xl p-12 text-center border-2 border-yellow-500/30">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
                <p className="text-red-700 font-medium">กำลังโหลดข้อมูล...</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-yellow-500/10 blur-xl" />
            <div className="relative glass-card rounded-2xl overflow-hidden border-2 border-yellow-500/30">
              {/* Table Header */}
              <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 px-6 py-4 border-b-2 border-yellow-400">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-2 text-yellow-300 text-sm font-bold tracking-wide">รหัสพนักงาน</div>
                  <div className="col-span-3 text-yellow-300 text-sm font-bold tracking-wide">ชื่อ</div>
                  <div className="col-span-4 text-yellow-300 text-sm font-bold tracking-wide">รางวัล</div>
                  <div className="col-span-3 text-yellow-300 text-sm font-bold tracking-wide">เวลา</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-yellow-200">
                {history.map((item, index) => (
                  <div
                    key={item.id}
                    className={`px-6 py-4 grid grid-cols-12 gap-4 items-center transition-colors hover:bg-yellow-50/50 ${index % 2 === 0 ? 'bg-white' : 'bg-red-50/30'
                      }`}
                  >
                    <div className="col-span-2">
                      <span className="font-mono text-sm font-bold text-red-700 bg-yellow-100 px-2 py-1 rounded border border-yellow-300">
                        {item.employee_id}
                      </span>
                    </div>
                    <div className="col-span-3 text-red-700 font-medium">{item.user_name}</div>
                    <div className="col-span-4">
                      <span className="inline-flex items-center gap-2 text-red-800 font-bold bg-gradient-to-r from-yellow-100 to-orange-100 px-3 py-1 rounded-lg border-2 border-yellow-300">
                        <span>🎁</span>
                        {item.prize_name}
                      </span>
                    </div>
                    <div className="col-span-3 text-gray-500 text-sm flex items-center gap-2">
                      <span>🕐</span>
                      {formatDate(item.spun_at)}
                    </div>
                  </div>
                ))}

                {history.length === 0 && (
                  <div className="px-6 py-16 text-center">
                    <span className="text-5xl mb-4 block">📭</span>
                    <p className="text-red-700 font-bold">ยังไม่มีประวัติการหมุน</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
