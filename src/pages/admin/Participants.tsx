import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { User } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { LockIcon, ClockIcon, InboxIcon } from '../../components/icons';

export function Participants() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const result = await api.getParticipants();
      if (result.success) {
        setUsers(result.users);
      }
    } catch (error) {
      console.error('Failed to load participants:', error);
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
              <span className="gold-shimmer">รายชื่อผู้เข้าร่วม</span>
            </h1>
            <div className="divider-gold w-16 mt-2" />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-yellow-400 text-xs font-medium bg-yellow-500/10 px-3 py-1.5 rounded-full border border-yellow-500/25">
              {users.length} คน
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
            {/* Table Header - desktop */}
            <div className="hidden md:block bg-black/30 px-5 py-3.5 border-b border-yellow-500/25">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-1 text-white/90 text-xs font-medium tracking-wide">#</div>
                <div className="col-span-2 text-white/90 text-xs font-medium tracking-wide">รหัสพนักงาน</div>
                <div className="col-span-3 text-white/90 text-xs font-medium tracking-wide">ชื่อ</div>
                <div className="col-span-3 text-white/90 text-xs font-medium tracking-wide">สิทธิ์คงเหลือ</div>
                <div className="col-span-3 text-white/90 text-xs font-medium tracking-wide">ลงทะเบียนเมื่อ</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-white/10">
              {users.map((user, index) => (
                <div
                  key={user.id}
                  className="px-4 py-3 md:px-5 md:py-3.5 hover:bg-black/15 transition-colors"
                >
                  {/* Mobile card */}
                  <div className="md:hidden space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-white/40 text-xs font-medium w-5">{index + 1}.</span>
                        <span className="font-mono text-xs font-medium text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/25">
                          {user.employee_id}
                        </span>
                        <span className="text-white/90 text-sm font-medium">{user.name}</span>
                      </div>
                      <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-lg border ${
                        user.spins_remaining > 0
                          ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/15'
                          : 'text-white/50 bg-black/20 border-white/10'
                      }`}>
                        {user.spins_remaining > 0 ? `${user.spins_remaining} ครั้ง` : 'หมุนแล้ว'}
                      </span>
                    </div>
                    <div className="text-white/50 text-xs flex items-center gap-1.5 ml-5">
                      <ClockIcon className="w-3 h-3" />
                      {user.created_at ? formatDate(user.created_at) : '-'}
                    </div>
                  </div>

                  {/* Desktop grid */}
                  <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-1 text-white/50 text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="col-span-2">
                      <span className="font-mono text-xs font-medium text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/25">
                        {user.employee_id}
                      </span>
                    </div>
                    <div className="col-span-3 text-white/90 text-sm font-medium">
                      {user.name}
                    </div>
                    <div className="col-span-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border ${
                        user.spins_remaining > 0
                          ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/15'
                          : 'text-white/50 bg-black/20 border-white/10'
                      }`}>
                        {user.spins_remaining > 0 ? `${user.spins_remaining} ครั้ง` : 'หมุนแล้ว'}
                      </span>
                    </div>
                    <div className="col-span-3 text-white/60 text-xs flex items-center gap-1.5">
                      <ClockIcon className="w-3 h-3" />
                      {user.created_at ? formatDate(user.created_at) : '-'}
                    </div>
                  </div>
                </div>
              ))}

              {users.length === 0 && (
                <div className="px-6 py-16 text-center">
                  <InboxIcon className="w-10 h-10 text-white/10 mb-3 mx-auto" />
                  <p className="text-white/90 font-medium text-sm">ยังไม่มีผู้เข้าร่วม</p>
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
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
