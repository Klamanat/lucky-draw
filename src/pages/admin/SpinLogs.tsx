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
        <p className="text-white mb-4">ไม่มีสิทธิ์เข้าถึง</p>
        <Link
          to="/"
          className="px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30"
        >
          กลับหน้าหลัก
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">ประวัติการหมุนทั้งหมด</h1>
          <Link
            to="/admin"
            className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30"
          >
            กลับ
          </Link>
        </div>

        {loading ? (
          <div className="text-white/60 text-center">กำลังโหลด...</div>
        ) : (
          <div className="bg-white/10 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-white/10">
                <tr>
                  <th className="px-4 py-3 text-left text-white/80 text-sm">ผู้ใช้</th>
                  <th className="px-4 py-3 text-left text-white/80 text-sm">รางวัล</th>
                  <th className="px-4 py-3 text-left text-white/80 text-sm">เวลา</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id} className="border-t border-white/10">
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">{item.user_name}</p>
                      <p className="text-white/60 text-sm">{item.user_email}</p>
                    </td>
                    <td className="px-4 py-3 text-white">{item.prize_name}</td>
                    <td className="px-4 py-3 text-white/80 text-sm">
                      {formatDate(item.spun_at)}
                    </td>
                  </tr>
                ))}

                {history.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-white/60">
                      ยังไม่มีประวัติการหมุน
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
