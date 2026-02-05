import { useState } from 'react';

interface RegisterFormProps {
  onRegister: (data: { name: string; email: string; phone: string }) => Promise<{ success: boolean; error?: string }>;
  onSwitchToLogin: () => void;
  loading?: boolean;
}

export function RegisterForm({ onRegister, onSwitchToLogin, loading }: RegisterFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError('กรุณากรอกข้อมูลให้ครบ');
      return;
    }

    const result = await onRegister({ name, email, phone });
    if (!result.success) {
      setError(result.error || 'เกิดข้อผิดพลาด');
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 w-full max-w-sm shadow-xl">
      {/* Header */}
      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-2 mb-2">
          <span className="w-8 h-px bg-gradient-to-r from-transparent to-red-400" />
          <span className="text-2xl">🧧</span>
          <span className="w-8 h-px bg-gradient-to-l from-transparent to-red-400" />
        </div>
        <h2 className="text-xl font-bold text-red-600">ลงทะเบียน</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-gray-600 text-sm mb-1.5 ml-1 font-medium">ชื่อ-นามสกุล</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ชื่อ นามสกุล"
            className="w-full px-4 py-3 rounded-xl bg-gray-50 text-gray-800 placeholder-gray-400 border-2 border-gray-200 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 transition-all"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-gray-600 text-sm mb-1.5 ml-1 font-medium">อีเมล</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-4 py-3 rounded-xl bg-gray-50 text-gray-800 placeholder-gray-400 border-2 border-gray-200 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 transition-all"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-gray-600 text-sm mb-1.5 ml-1 font-medium">เบอร์โทรศัพท์</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="08x-xxx-xxxx"
            className="w-full px-4 py-3 rounded-xl bg-gray-50 text-gray-800 placeholder-gray-400 border-2 border-gray-200 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 transition-all"
            disabled={loading}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 btn-premium rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              กำลังลงทะเบียน...
            </span>
          ) : (
            'ลงทะเบียนรับโชค'
          )}
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-gray-500 text-sm">
          มีบัญชีแล้ว?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-red-600 hover:text-red-700 font-medium underline underline-offset-2"
          >
            เข้าสู่ระบบ
          </button>
        </p>
      </div>
    </div>
  );
}
