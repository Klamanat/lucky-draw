import { useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import { api } from '../services/api';

const STORAGE_KEY = 'lucky_wheel_user';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // โหลด user จาก localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string) => {
    setLoading(true);
    try {
      const result = await api.login(email);
      if (result.success && result.user) {
        setUser(result.user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(result.user));
        return { success: true };
      }
      return { success: false, error: result.error || 'ไม่พบผู้ใช้งาน' };
    } catch {
      return { success: false, error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data: { name: string; email: string; phone: string }) => {
    setLoading(true);
    try {
      const result = await api.register(data);
      if (result.success && result.user) {
        setUser(result.user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(result.user));
        return { success: true };
      }
      return { success: false, error: result.error || 'ลงทะเบียนไม่สำเร็จ' };
    } catch {
      return { success: false, error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const updateSpinsRemaining = useCallback((spins: number) => {
    if (user) {
      const updated = { ...user, spins_remaining: spins };
      setUser(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  }, [user]);

  return {
    user,
    loading,
    isLoggedIn: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateSpinsRemaining,
  };
}
