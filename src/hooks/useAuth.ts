import { useState, useCallback } from 'react';
import type { User } from '../types';
import { api } from '../services/api';

const STORAGE_KEY = 'lucky_wheel_user';

function loadUserFromStorage(): User | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
  return null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(loadUserFromStorage);
  const [loading, setLoading] = useState(false);

  // สำหรับผู้ใช้ทั่วไป - กรอกรหัสพนักงานและชื่อ
  const enterAsEmployee = useCallback(async (data: { employeeId: string; name: string }) => {
    setLoading(true);
    try {
      const result = await api.enterEmployee(data);
      if (result.success && result.user) {
        setUser(result.user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(result.user));
        return { success: true };
      }
      return { success: false, error: result.error || 'เกิดข้อผิดพลาด' };
    } catch {
      return { success: false, error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' };
    } finally {
      setLoading(false);
    }
  }, []);

  // สำหรับ Admin - ยังคงใช้ระบบเดิม
  const loginAdmin = useCallback(async (password: string) => {
    setLoading(true);
    try {
      const result = await api.loginAdmin(password);
      if (result.success && result.user) {
        setUser(result.user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(result.user));
        return { success: true };
      }
      return { success: false, error: result.error || 'รหัสผ่านไม่ถูกต้อง' };
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
    enterAsEmployee,
    loginAdmin,
    logout,
    updateSpinsRemaining,
  };
}
