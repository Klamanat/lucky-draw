import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { SpinHistory } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

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
          <div className="absolute inset-0 rounded-2xl bg-red-500/20 blur-xl" />
          <div className="relative glass-card rounded-2xl p-10 text-center border border-red-500/20">
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
              <span className="gold-shimmer">ประวัติการหมุนทั้งหมด</span>
            </h1>
            <div className="w-16 h-1 bg-gradient-to-r from-amber-500 to-transparent mt-3" />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-amber-300/70 text-sm font-medium">
              {history.length} รายการ
            </span>
            <Link
              to="/admin"
              className="glass-card px-6 py-3 text-gray-600 rounded-xl hover:bg-white/80 font-semibold border border-gray-200 hover:border-amber-500/30 transition-all"
            >
              กลับ
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-amber-500/10 blur-xl" />
            <div className="relative glass-card rounded-2xl p-12 text-center border border-amber-500/10">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                </div>
                <p className="text-gray-500 font-medium">กำลังโหลดข้อมูล...</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-amber-500/5 blur-xl" />
            <div className="relative glass-card rounded-2xl overflow-hidden border border-amber-500/10">
              {/* Table Header */}
              <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 px-6 py-4">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-2 text-white text-sm font-bold tracking-wide">รหัสพนักงาน</div>
                  <div className="col-span-3 text-white text-sm font-bold tracking-wide">ชื่อ</div>
                  <div className="col-span-4 text-white text-sm font-bold tracking-wide">รางวัล</div>
                  <div className="col-span-3 text-white text-sm font-bold tracking-wide">เวลา</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-amber-100">
                {history.map((item, index) => (
                  <div
                    key={item.id}
                    className={`px-6 py-4 grid grid-cols-12 gap-4 items-center transition-colors hover:bg-amber-50/50 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-amber-50/30'
                    }`}
                  >
                    <div className="col-span-2">
                      <span className="font-mono text-sm font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
                        {item.employee_id}
                      </span>
                    </div>
                    <div className="col-span-3 text-gray-700 font-medium">{item.user_name}</div>
                    <div className="col-span-4">
                      <span className="inline-flex items-center gap-2 text-amber-800 font-semibold bg-gradient-to-r from-amber-100 to-orange-100 px-3 py-1 rounded-lg border border-amber-200">
                        <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        {item.prize_name}
                      </span>
                    </div>
                    <div className="col-span-3 text-gray-500 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatDate(item.spun_at)}
                    </div>
                  </div>
                ))}

                {history.length === 0 && (
                  <div className="px-6 py-16 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="text-gray-500 font-medium">ยังไม่มีประวัติการหมุน</p>
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
