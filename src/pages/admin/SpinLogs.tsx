import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { SpinHistory } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { LockIcon, GiftIcon, ClockIcon, InboxIcon, HeartIcon, CheckIcon } from '../../components/icons';

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
        <div className="glass-card rounded-2xl p-10 text-center border border-yellow-500/25">
          <LockIcon className="w-8 h-8 text-red-400 mb-4 mx-auto" />
          <p className="text-white font-bold text-lg mb-6">ไม่มีสิทธิ์เข้าถึง</p>
          <Link to="/" className="px-8 py-3 btn-premium rounded-xl inline-block font-bold">
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 py-16">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">
              <span className="gold-shimmer">ประวัติการหมุนทั้งหมด</span>
            </h1>
            <div className="divider-gold w-16 mt-2" />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-yellow-400 text-xs font-medium bg-yellow-500/10 px-3 py-1.5 rounded-full border border-yellow-500/25">
              {history.length} รายการ
            </span>
            <Link
              to="/admin"
              className="glass-card px-5 py-2.5 text-white/90 rounded-xl hover:bg-white/10 font-medium border border-yellow-500/25 transition-all text-sm"
            >
              กลับ
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="glass-card rounded-2xl p-12 text-center border border-yellow-500/25">
            <div className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 border-yellow-500/25 border-t-yellow-500 rounded-full animate-spin" style={{ borderWidth: '3px' }} />
              <p className="text-white text-sm font-medium">กำลังโหลดข้อมูล...</p>
            </div>
          </div>
        ) : (
          <div className="glass-card rounded-2xl overflow-hidden border border-yellow-500/25">
            {/* Table Header */}
            <div className="bg-black/30 px-5 py-3.5 border-b border-yellow-500/25">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-2 text-white/90 text-xs font-medium tracking-wide">รหัสพนักงาน</div>
                <div className="col-span-2 text-white/90 text-xs font-medium tracking-wide">ชื่อ</div>
                <div className="col-span-3 text-white/90 text-xs font-medium tracking-wide">รางวัล</div>
                <div className="col-span-2 text-white/90 text-xs font-medium tracking-wide">สถานะ</div>
                <div className="col-span-3 text-white/90 text-xs font-medium tracking-wide">เวลา</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-white/10">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="px-5 py-3.5 grid grid-cols-12 gap-4 items-center hover:bg-black/15 transition-colors"
                >
                  <div className="col-span-2">
                    <span className="font-mono text-xs font-medium text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/25">
                      {item.employee_id}
                    </span>
                  </div>
                  <div className="col-span-2 text-white/90 text-sm font-medium">{item.user_name}</div>
                  <div className="col-span-3">
                    <span className="inline-flex items-center gap-1.5 text-white text-sm font-medium bg-black/30 px-2.5 py-1 rounded-lg border border-yellow-500/25">
                      <GiftIcon className="w-3 h-3 text-yellow-500" />
                      {item.prize_name}
                    </span>
                  </div>
                  <div className="col-span-2">
                    {item.status === 'donated' ? (
                      <div>
                        <span className="inline-flex items-center gap-1 text-pink-300 text-xs font-medium bg-pink-500/10 px-2 py-1 rounded-lg border border-pink-500/10">
                          <HeartIcon className="w-3 h-3" /> บริจาค
                        </span>
                        {item.donation_amount ? (
                          <p className="text-pink-400/70 text-xs mt-0.5">{item.donation_amount.toLocaleString()} บาท</p>
                        ) : null}
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-300 text-xs font-medium bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/10">
                        <CheckIcon className="w-3 h-3" /> รับแล้ว
                      </span>
                    )}
                  </div>
                  <div className="col-span-3 text-white/90 text-xs flex items-center gap-1.5">
                    <ClockIcon className="w-3 h-3" />
                    {formatDate(item.spun_at)}
                  </div>
                </div>
              ))}

              {history.length === 0 && (
                <div className="px-6 py-16 text-center">
                  <InboxIcon className="w-10 h-10 text-white/10 mb-3 mx-auto" />
                  <p className="text-white/90 font-medium text-sm">ยังไม่มีประวัติการหมุน</p>
                </div>
              )}
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
