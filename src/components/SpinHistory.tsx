import { useEffect, useState } from 'react';
import type { SpinHistory as SpinHistoryType } from '../types';
import { api } from '../services/api';
import { RedEnvelopeIcon, SpinIcon, ClockIcon, SparklesIcon, HeartIcon } from './icons';

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
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl bg-yellow-500/20 blur-xl" />
        <div className="relative glass-card rounded-2xl p-12 text-center border-2 border-yellow-500/30">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
            <p className="text-red-700 font-medium">กำลังโหลด...</p>
          </div>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl bg-yellow-500/20 blur-xl" />
        <div className="relative glass-card rounded-2xl p-12 text-center border-2 border-yellow-500/30">
          <SpinIcon className="w-12 h-12 text-red-500 mb-4 mx-auto" />
          <p className="text-red-700 font-bold text-lg">ยังไม่มีประวัติการหมุน</p>
          <p className="text-gray-500 text-sm mt-2">ลองหมุนวงล้อดูสิ!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute inset-0 rounded-2xl bg-yellow-500/10 blur-xl" />
      <div className="relative glass-card rounded-2xl p-8 border-2 border-yellow-500/30">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg border-2 border-yellow-400">
            <RedEnvelopeIcon className="w-8 h-8 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-800">รายการรางวัลที่ได้รับ</h3>
            <p className="text-gray-500 text-sm">{history.length} รายการ</p>
          </div>
        </div>

        {/* History List */}
        <div className="space-y-4">
          {history.map((item, index) => (
            <div key={item.id} className="relative group">
              {/* Connection line */}
              {index < history.length - 1 && (
                <div className="absolute left-7 top-16 w-0.5 h-8 bg-gradient-to-b from-yellow-400 to-yellow-200" />
              )}

              <div className="bg-gradient-to-r from-red-50 via-yellow-50 to-red-50 rounded-xl p-5 flex items-center gap-5 border-2 border-yellow-300 group-hover:border-yellow-500 transition-colors shadow-sm">
                {/* Number badge */}
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg border-2 border-red-500">
                  <span className="text-red-800 font-bold text-xl">{index + 1}</span>
                </div>

                {/* Prize info */}
                <div className="flex-grow">
                  <div className="flex items-center gap-2">
                    <p className="text-red-800 font-bold text-lg">{item.prize_name}</p>
                    {item.status === 'donated' && (
                      <span className="text-xs font-bold text-pink-600 bg-pink-100 px-2 py-0.5 rounded-full border border-pink-300">
                        บริจาค {item.donation_amount ? `${item.donation_amount.toLocaleString()} บาท` : ''}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-gray-400" />
                    {formatDate(item.spun_at)}
                  </p>
                </div>

                {/* Lucky icon */}
                <div className="flex-shrink-0">
                  {item.status === 'donated' ? (
                    <HeartIcon className="w-8 h-8 text-pink-500" />
                  ) : (
                    <SparklesIcon className="w-8 h-8 text-yellow-500" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
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
