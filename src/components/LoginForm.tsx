import { useState } from 'react';

interface LoginFormProps {
  onLogin: (email: string) => Promise<{ success: boolean; error?: string }>;
  onSwitchToRegister: () => void;
  loading?: boolean;
}

export function LoginForm({ onLogin, onSwitchToRegister, loading }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('กรุณากรอกอีเมล');
      return;
    }

    const result = await onLogin(email);
    if (!result.success) {
      setError(result.error || 'เกิดข้อผิดพลาด');
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 w-full max-w-md">
      <h2 className="text-2xl font-bold text-white text-center mb-6">เข้าสู่ระบบ</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
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

        {error && (
          <p className="text-red-300 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>
      </form>

      <p className="text-white/60 text-center mt-4">
        ยังไม่มีบัญชี?{' '}
        <button
          onClick={onSwitchToRegister}
          className="text-yellow-300 hover:underline"
        >
          ลงทะเบียน
        </button>
      </p>
    </div>
  );
}
