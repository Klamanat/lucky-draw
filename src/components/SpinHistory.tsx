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
      <div className="glass-card rounded-lg p-8 text-center shadow-lg border border-amber-600/10">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-gray-200 border-t-amber-600 rounded-full animate-spin" />
          <p className="text-gray-500">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="glass-card rounded-lg p-8 text-center shadow-lg border border-amber-600/10">
        <p className="text-gray-500">ยังไม่มีประวัติการหมุน</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-lg p-6 shadow-lg border border-amber-600/10">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">รายการรางวัลที่ได้รับ</h3>

      <div className="space-y-3">
        {history.map((item) => (
          <div
            key={item.id}
            className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 flex justify-between items-center border border-amber-200/50"
          >
            <div>
              <p className="text-gray-800 font-medium">{item.prize_name}</p>
              <p className="text-gray-500 text-sm">
                {formatDate(item.spun_at)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
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
