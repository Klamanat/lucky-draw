import { useEffect, useState } from 'react';
import type { SpinHistory as SpinHistoryType } from '../types';
import { api } from '../services/api';
import { ClockIcon, SparklesIcon, HeartIcon } from './icons';

interface SpinHistoryProps {
  userId: string;
}

export function SpinHistory({ userId }: SpinHistoryProps) {
  const [history, setHistory] = useState<SpinHistoryType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [userId]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const result = await api.getHistory(userId);
      if (result.success) {
        setHistory(result.history);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center border border-yellow-500/10">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
          <p className="text-white/40 text-sm font-medium">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center border border-yellow-500/10">
        <span className="text-4xl block mb-4">🎡</span>
        <p className="text-white font-bold text-lg">ยังไม่มีประวัติการหมุน</p>
        <p className="text-white/40 text-sm mt-2">ลองหมุนวงล้อดูสิ!</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 border border-yellow-500/10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-500/20 border border-yellow-500/20">
          <span className="text-lg">🧧</span>
        </div>
        <div>
          <h3 className="text-base font-bold text-white">รายการรางวัลที่ได้รับ</h3>
          <p className="text-white/30 text-xs">{history.length} รายการ</p>
        </div>
      </div>

      <div className="space-y-3">
        {history.map((item, index) => (
          <div
            key={item.id}
            className="bg-white/[0.03] rounded-xl p-4 flex items-center gap-4 border border-yellow-500/5 hover:border-yellow-500/15 transition-colors"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-yellow-600 to-yellow-700 flex items-center justify-center">
              <span className="text-white font-bold text-sm">{index + 1}</span>
            </div>

            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-white font-bold text-sm truncate">{item.prize_name}</p>
                {item.status === 'donated' && (
                  <span className="text-xs font-medium text-pink-300 bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/20">
                    บริจาค {item.donation_amount ? `${item.donation_amount.toLocaleString()} บาท` : ''}
                  </span>
                )}
              </div>
              <p className="text-white/30 text-xs mt-1 flex items-center gap-1.5">
                <ClockIcon className="w-3 h-3" />
                {formatDate(item.spun_at)}
              </p>
            </div>

            <div className="flex-shrink-0">
              {item.status === 'donated' ? (
                <HeartIcon className="w-5 h-5 text-pink-400" />
              ) : (
                <SparklesIcon className="w-5 h-5 text-yellow-500" />
              )}
            </div>
          </div>
        ))}
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
