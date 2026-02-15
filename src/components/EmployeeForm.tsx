import { useState } from 'react';
import { TagIcon, UserIcon, AlertIcon, ArrowRightIcon } from './icons';

interface EmployeeFormProps {
  onSubmit: (data: { employeeId: string; name: string }) => Promise<{ success: boolean; error?: string }>;
  onAdminLogin?: (password: string) => Promise<{ success: boolean; error?: string }>;
  loading?: boolean;
}

const ADMIN_PASSWORD = 'admin1234';

export function EmployeeForm({ onSubmit, onAdminLogin, loading }: EmployeeFormProps) {
  const [employeeId, setEmployeeId] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (employeeId.trim() === ADMIN_PASSWORD && onAdminLogin) {
      const result = await onAdminLogin(employeeId.trim());
      if (!result.success) {
        setError(result.error || 'เกิดข้อผิดพลาด');
      }
      return;
    }

    if (!employeeId.trim()) {
      setError('กรุณากรอกรหัสพนักงาน');
      return;
    }

    if (!name.trim()) {
      setError('กรุณากรอกชื่อ');
      return;
    }

    const result = await onSubmit({ employeeId: employeeId.trim(), name: name.trim() });
    if (!result.success) {
      setError(result.error || 'เกิดข้อผิดพลาด');
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <div
        className="relative overflow-hidden text-white rounded-2xl"
        style={{
          background: 'linear-gradient(160deg, #8b1a2b 0%, #5c0a15 40%, #1a0508 100%)',
          border: '1px solid rgba(255, 215, 0, 0.25)',
          boxShadow:
            '0 25px 80px rgba(0, 0, 0, 0.6), 0 0 60px rgba(200, 30, 50, 0.15), inset 0 1px 0 rgba(255, 215, 0, 0.15)',
        }}
      >

        {/* ================= Effects BG ================= */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="glitter-layer" />
          <span className="spark s1" />
          <span className="spark s2" />
          <span className="spark s3" />

          {/* Radial glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] rounded-full" style={{
            background: 'radial-gradient(ellipse, rgba(255, 180, 50, 0.12) 0%, transparent 70%)',
            filter: 'blur(30px)',
          }} />

          {/* Gold frame */}
          <div className="absolute border inset-3 rounded-xl border-yellow-400/20" />
        </div>

        {/* ================= Content ================= */}
        <div className="relative z-10 p-8">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center mx-auto mb-4 w-16 h-16 rounded-2xl shadow-lg border border-yellow-500/20" style={{
              background: 'linear-gradient(135deg, rgba(200, 30, 50, 0.4) 0%, rgba(140, 20, 40, 0.3) 100%)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 24px rgba(200, 30, 50, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}>
              <span className="text-3xl">🧧</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              <span className="gold-shimmer">ลงทะเบียนร่วมสนุก</span>
            </h2>
            <p className="mt-1.5 text-sm font-bold text-white/70">1 คนต่อ 1 สิทธิ์การหมุนเท่านั้น</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-2 text-sm font-extrabold text-yellow-300/90">รหัสพนักงาน</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <TagIcon className="w-4 h-4 text-yellow-500/50" />
                </div>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="กรอกรหัสพนักงาน"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-white placeholder-white/40 font-medium focus:outline-none transition-all"
                  style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 215, 0, 0.12)',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(255, 215, 0, 0.35)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(255, 215, 0, 0.08)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 215, 0, 0.12)';
                    e.target.style.boxShadow = 'none';
                  }}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-extrabold text-yellow-300/90">ชื่อ - นามสกุล</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <UserIcon className="w-4 h-4 text-yellow-500/50" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="กรอกชื่อและนามสกุล"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-white placeholder-white/40 font-medium focus:outline-none transition-all"
                  style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 215, 0, 0.12)',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(255, 215, 0, 0.35)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(255, 215, 0, 0.08)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 215, 0, 0.12)';
                    e.target.style.boxShadow = 'none';
                  }}
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl" style={{
                background: 'rgba(220, 38, 38, 0.15)',
                border: '1px solid rgba(220, 38, 38, 0.25)',
              }}>
                <div className="flex items-center gap-2.5">
                  <AlertIcon className="flex-shrink-0 w-4 h-4 text-red-400" />
                  <p className="text-sm font-bold text-red-300">{error}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 font-extrabold text-base tracking-wide rounded-xl active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed mt-2"
              style={{
                background: 'linear-gradient(135deg, #ffd700 0%, #d4a017 50%, #b8860b 100%)',
                color: '#5c0000',
                border: '1px solid rgba(255, 215, 0, 0.4)',
                boxShadow: '0 4px 20px rgba(255, 215, 0, 0.2)',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2.5">
                  <span className="w-4 h-4 border-2 rounded-full border-red-900/30 border-t-red-900 animate-spin" />
                  กำลังดำเนินการ...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  เข้าร่วมกิจกรรม
                  <ArrowRightIcon className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
