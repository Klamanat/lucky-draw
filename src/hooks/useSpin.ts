import { useState, useCallback } from 'react';
import type { Prize, SpinResult } from '../types';
import { api } from '../services/api';

export function useSpin() {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<SpinResult | null>(null);

  const loadPrizes = useCallback(async () => {
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
    spin,
    clearResult,
  };
}
