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
        <div className="glass-card rounded-lg p-6 text-center shadow-xl border border-amber-600/10">
          <p className="text-gray-600 mb-4">ไม่มีสิทธิ์เข้าถึง</p>
          <Link
            to="/"
            className="px-6 py-3 btn-premium rounded-lg inline-block"
          >
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pt-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-amber-100">ประวัติการหมุนทั้งหมด</h1>
            <div className="w-12 h-0.5 bg-gradient-to-r from-amber-600 to-transparent mt-2" />
          </div>
          <Link
            to="/admin"
            className="glass-card px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-50 font-medium shadow-md border border-gray-200"
          >
            กลับ
          </Link>
        </div>

        {loading ? (
          <div className="glass-card rounded-lg p-8 text-center shadow-lg border border-amber-600/10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-3 border-gray-200 border-t-amber-600 rounded-full animate-spin" />
              <p className="text-gray-500">กำลังโหลด...</p>
            </div>
          </div>
        ) : (
          <div className="glass-card rounded-lg overflow-hidden shadow-lg border border-amber-600/10">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-amber-600 to-amber-700">
                <tr>
                  <th className="px-4 py-3 text-left text-white text-sm font-semibold">รหัสพนักงาน</th>
                  <th className="px-4 py-3 text-left text-white text-sm font-semibold">ชื่อ</th>
                  <th className="px-4 py-3 text-left text-white text-sm font-semibold">รางวัล</th>
                  <th className="px-4 py-3 text-left text-white text-sm font-semibold">เวลา</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-amber-50/50'}>
                    <td className="px-4 py-3 text-gray-800 font-mono text-sm">{item.employee_id}</td>
                    <td className="px-4 py-3 text-gray-700">{item.user_name}</td>
                    <td className="px-4 py-3 text-amber-700 font-medium">{item.prize_name}</td>
                    <td className="px-4 py-3 text-gray-500 text-sm">
                      {formatDate(item.spun_at)}
                    </td>
                  </tr>
                ))}

                {history.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
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
