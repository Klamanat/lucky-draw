import { useState } from 'react';
import { RedEnvelopeIcon, TagIcon, UserIcon, AlertIcon, ArrowRightIcon } from './icons';

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

    // ตรวจสอบว่าเป็น admin password หรือไม่
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
    <div className="relative">
      {/* Festive glow behind card */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-yellow-400/30 to-red-500/20 blur-2xl transform scale-110" />

      <div className="relative bg-gradient-to-b from-red-600 via-red-700 to-red-800 rounded-2xl p-10 w-full max-w-md border-4 border-yellow-400 shadow-2xl overflow-hidden">
        {/* Chinese pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(45deg, #FFD700 0, #FFD700 1px, transparent 0, transparent 50%)`,
            backgroundSize: '15px 15px',
          }} />
        </div>

        {/* Corner accents */}
        <div className="absolute top-3 left-3 w-10 h-10 border-t-3 border-l-3 border-yellow-400 rounded-tl-xl" />
        <div className="absolute top-3 right-3 w-10 h-10 border-t-3 border-r-3 border-yellow-400 rounded-tr-xl" />
        <div className="absolute bottom-3 left-3 w-10 h-10 border-b-3 border-l-3 border-yellow-400 rounded-bl-xl" />
        <div className="absolute bottom-3 right-3 w-10 h-10 border-b-3 border-r-3 border-yellow-400 rounded-br-xl" />

        {/* Top decoration */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-24 h-3 bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500 rounded-b-full" />

        {/* Header */}
        <div className="text-center mb-10 relative z-10">
          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 flex items-center justify-center shadow-xl ring-4 ring-yellow-300/40">
            <RedEnvelopeIcon className="w-10 h-10 text-red-600" />
          </div>

          <h2 className="text-2xl font-bold text-yellow-300 mb-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            ลงทะเบียนร่วมสนุก
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent mx-auto my-3" />
          <p className="text-red-200 text-sm">กรอกข้อมูลเพื่อรับสิทธิ์หมุนวงล้อ</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div>
            <label className="block text-yellow-300 text-sm mb-2 font-bold tracking-wide">
              รหัสพนักงาน
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <TagIcon className="w-5 h-5 text-red-400" />
              </div>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="กรอกรหัสพนักงาน"
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-gradient-to-b from-yellow-50 to-orange-50 text-red-800 placeholder-red-300 border-2 border-yellow-400 font-medium focus:border-yellow-300 focus:outline-none focus:ring-4 focus:ring-yellow-400/30 transition-all"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-yellow-300 text-sm mb-2 font-bold tracking-wide">
              ชื่อ - นามสกุล
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <UserIcon className="w-5 h-5 text-red-400" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="กรอกชื่อและนามสกุล"
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-gradient-to-b from-yellow-50 to-orange-50 text-red-800 placeholder-red-300 border-2 border-yellow-400 font-medium focus:border-yellow-300 focus:outline-none focus:ring-4 focus:ring-yellow-400/30 transition-all"
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl px-5 py-4 shadow-lg">
              <div className="flex items-center gap-3">
                <AlertIcon className="w-5 h-5 text-red-500" />
                <p className="text-red-600 font-bold">{error}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 text-red-700 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed text-lg tracking-wide mt-4 border-2 border-yellow-500 shadow-lg hover:shadow-xl transition-all hover:from-yellow-300 hover:to-yellow-300"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <span className="w-5 h-5 border-2 border-red-700/30 border-t-red-700 rounded-full animate-spin" />
                กำลังดำเนินการ...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                เข้าร่วมกิจกรรม
                <ArrowRightIcon className="w-5 h-5" />
              </span>
            )}
          </button>
        </form>

        {/* Bottom decoration */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-24 h-3 bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500 rounded-t-full" />
      </div>
    </div>
  );
}
