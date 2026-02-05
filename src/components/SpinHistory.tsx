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
      <div className="text-white/60 text-center py-8">
        กำลังโหลด...
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-white/60 text-center py-8">
        ยังไม่มีประวัติการหมุน
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">ประวัติการหมุน</h3>

      <div className="space-y-3">
        {history.map((item) => (
          <div
            key={item.id}
            className="bg-white/10 rounded-xl p-4 flex justify-between items-center"
          >
            <div>
              <p className="text-white font-medium">{item.prize_name}</p>
              <p className="text-white/60 text-sm">
                {formatDate(item.spun_at)}
              </p>
            </div>
            <div className="text-2xl">🎁</div>
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
