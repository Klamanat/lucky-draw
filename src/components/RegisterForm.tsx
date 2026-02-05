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
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 w-full max-w-md">
      <h2 className="text-2xl font-bold text-white text-center mb-6">ลงทะเบียน</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-white/80 text-sm mb-1">ชื่อ-นามสกุล</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ชื่อ นามสกุล"
            className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/50 border border-white/30 focus:border-white focus:outline-none"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-white/80 text-sm mb-1">อีเมล</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/50 border border-white/30 focus:border-white focus:outline-none"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-white/80 text-sm mb-1">เบอร์โทรศัพท์</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="08x-xxx-xxxx"
            className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/50 border border-white/30 focus:border-white focus:outline-none"
            disabled={loading}
          />
        </div>

        {error && (
          <p className="text-red-300 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน'}
        </button>
      </form>

      <p className="text-white/60 text-center mt-4">
        มีบัญชีแล้ว?{' '}
        <button
          onClick={onSwitchToLogin}
          className="text-yellow-300 hover:underline"
        >
          เข้าสู่ระบบ
        </button>
      </p>
    </div>
  );
}
