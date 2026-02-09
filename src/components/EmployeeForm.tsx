import { useState } from 'react';

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
      {/* Glow effect behind card */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-amber-500/20 to-amber-600/10 blur-xl transform scale-105" />

      <div className="relative glass-card rounded-2xl p-10 w-full max-w-md border border-amber-500/20">
        {/* Top decorative element */}
        <div className="absolute -top-px left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent rounded-full" />

        {/* Corner accents */}
        <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-500/30 rounded-tl-lg" />
        <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-500/30 rounded-tr-lg" />
        <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-500/30 rounded-bl-lg" />
        <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-500/30 rounded-br-lg" />

        {/* Header */}
        <div className="text-center mb-10">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">ลงทะเบียนเข้าร่วมกิจกรรม</h2>
          <div className="divider-gold w-20 mx-auto my-3" />
          <p className="text-gray-500 text-sm">กรุณากรอกข้อมูลเพื่อรับสิทธิ์หมุนวงล้อ</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm mb-2 font-semibold tracking-wide">
              รหัสพนักงาน
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-amber-600/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
              </div>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="กรอกรหัสพนักงาน"
                className="w-full pl-12 pr-4 py-4 rounded-xl input-premium text-gray-800 placeholder-gray-400 font-medium"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm mb-2 font-semibold tracking-wide">
              ชื่อ - นามสกุล
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-amber-600/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="กรอกชื่อและนามสกุล"
                className="w-full pl-12 pr-4 py-4 rounded-xl input-premium text-gray-800 placeholder-gray-400 font-medium"
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 btn-premium rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed text-base tracking-wide mt-4"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                กำลังดำเนินการ...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                เข้าร่วมกิจกรรม
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            )}
          </button>
        </form>

        {/* Bottom decorative element */}
        <div className="absolute -bottom-px left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent rounded-full" />
      </div>
    </div>
  );
}
