import { useEffect, useState } from 'react';
import type { SpinHistory as SpinHistoryType } from '../types';
import { api } from '../services/api';

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
        <div className="absolute inset-0 rounded-2xl bg-amber-500/10 blur-xl" />
        <div className="relative glass-card rounded-2xl p-12 text-center border border-amber-500/10">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            </div>
            <p className="text-gray-500 font-medium">กำลังโหลด...</p>
          </div>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl bg-amber-500/10 blur-xl" />
        <div className="relative glass-card rounded-2xl p-12 text-center border border-amber-500/10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">ยังไม่มีประวัติการหมุน</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute inset-0 rounded-2xl bg-amber-500/5 blur-xl" />
      <div className="relative glass-card rounded-2xl p-8 border border-amber-500/10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">รายการรางวัลที่ได้รับ</h3>
            <p className="text-gray-500 text-sm">{history.length} รายการ</p>
          </div>
        </div>

        {/* History List */}
        <div className="space-y-4">
          {history.map((item, index) => (
            <div
              key={item.id}
              className="relative group"
            >
              {/* Connection line */}
              {index < history.length - 1 && (
                <div className="absolute left-6 top-14 w-0.5 h-8 bg-gradient-to-b from-amber-300 to-amber-100" />
              )}

              <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 rounded-xl p-5 flex items-center gap-5 border border-amber-200 group-hover:border-amber-400 transition-colors shadow-sm">
                {/* Number badge */}
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <span className="text-white font-bold text-lg">{index + 1}</span>
                </div>

                {/* Prize info */}
                <div className="flex-grow">
                  <p className="text-gray-800 font-bold text-lg">{item.prize_name}</p>
                  <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatDate(item.spun_at)}
                  </p>
                </div>

                {/* Trophy icon */}
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
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
