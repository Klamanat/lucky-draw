import { useState, useCallback } from 'react';
import type { Prize, SpinResult } from '../types';
import { api, invalidateCache, getFromCache } from '../services/api';

export function useSpin() {
  const [prizes, setPrizes] = useState<Prize[]>(() => {
    const cached = getFromCache<{ success: boolean; prizes: Prize[] }>('getPrizes');
    return cached?.success ? cached.prizes : [];
  });
  const [loading, setLoading] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<SpinResult | null>(null);

  const loadPrizes = useCallback(async () => {
    // ถ้า cache มีข้อมูล ใช้เลยโดยไม่ต้องแสดง loading
    const cached = getFromCache<{ success: boolean; prizes: Prize[] }>('getPrizes');
    if (cached?.success) {
      setPrizes(cached.prizes);
      return;
    }

    setLoading(true);
    try {
      const response = await api.getPrizes();
      if (response.success) {
        setPrizes(response.prizes);
      }
    } catch (error) {
      console.error('Failed to load prizes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshPrizes = useCallback(async () => {
    invalidateCache('getPrizes');
    setLoading(true);
    try {
      const response = await api.getPrizes();
      if (response.success) {
        setPrizes(response.prizes);
      }
    } catch (error) {
      console.error('Failed to load prizes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const spin = useCallback(async (userId: string): Promise<SpinResult> => {
    setSpinning(true);
    setResult(null);
    try {
      const response = await api.spin(userId);
      setResult(response);
      return response;
    } catch {
      const errorResult: SpinResult = { success: false, error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' };
      setResult(errorResult);
      return errorResult;
    } finally {
      setSpinning(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
  }, []);

  return {
    prizes,
    loading,
    spinning,
    result,
    loadPrizes,
    refreshPrizes,
    spin,
    clearResult,
  };
}
