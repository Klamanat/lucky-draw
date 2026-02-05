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
    <div className="glass-card rounded-lg p-8 w-full max-w-md shadow-2xl border border-amber-600/20">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-800">ลงทะเบียนเข้าร่วมกิจกรรม</h2>
        <p className="text-gray-500 text-sm mt-2">กรุณากรอกข้อมูลเพื่อรับสิทธิ์หมุนวงล้อ</p>
        <div className="w-16 h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto mt-4" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-gray-700 text-sm mb-2 font-medium">รหัสพนักงาน</label>
          <input
            type="text"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            placeholder="กรอกรหัสพนักงาน"
            className="w-full px-4 py-3 rounded-lg bg-white text-gray-800 placeholder-gray-400 border border-gray-300 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/20 transition-all"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm mb-2 font-medium">ชื่อ - นามสกุล</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="กรอกชื่อและนามสกุล"
            className="w-full px-4 py-3 rounded-lg bg-white text-gray-800 placeholder-gray-400 border border-gray-300 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/20 transition-all"
            disabled={loading}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 btn-premium rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-base mt-2"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              กำลังดำเนินการ...
            </span>
          ) : (
            'เข้าร่วมกิจกรรม'
          )}
        </button>
      </form>
    </div>
  );
}
