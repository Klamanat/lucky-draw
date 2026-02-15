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
      <div className="p-8 border glass-card rounded-2xl border-yellow-500/25">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mx-auto mb-4 border shadow-lg w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 shadow-red-500/20 border-yellow-500/20">
            <span className="text-2xl">🧧</span>
          </div>
          <h2 className="mb-1 text-xl font-bold text-white">ลงทะเบียนร่วมสนุก</h2>
          <p className="text-sm text-white/80">1 คนต่อ 1 สิทธิ์การหมุนเท่านั้น</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 text-sm font-medium text-yellow-400">รหัสพนักงาน</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <TagIcon className="w-4 h-4 text-yellow-500/60" />
              </div>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="กรอกรหัสพนักงาน"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-black/40 text-white placeholder-white/50 border border-yellow-500/25 font-medium focus:border-yellow-500/50 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 transition-all"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-yellow-400">ชื่อ - นามสกุล</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <UserIcon className="w-4 h-4 text-yellow-500/60" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="กรอกชื่อและนามสกุล"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-black/40 text-white placeholder-white/50 border border-yellow-500/25 font-medium focus:border-yellow-500/50 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 transition-all"
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 border bg-red-500/10 border-red-500/20 rounded-xl">
              <div className="flex items-center gap-2.5">
                <AlertIcon className="flex-shrink-0 w-4 h-4 text-red-400" />
                <p className="text-sm font-medium text-red-300">{error}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-yellow-400 rounded-xl font-bold disabled:opacity-40 disabled:cursor-not-allowed text-base tracking-wide transition-all shadow-lg shadow-red-900/30 hover:shadow-red-800/40 border border-yellow-500/20 mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2.5">
                <span className="w-4 h-4 border-2 rounded-full border-yellow-400/20 border-t-yellow-400 animate-spin" />
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
  );
}
