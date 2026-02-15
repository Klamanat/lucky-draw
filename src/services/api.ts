import type { Prize, User, SpinHistory, SpinResult, EventSettings, PaymentInfo } from '../types';

// Google Apps Script Web App URL
const SCRIPT_URL = import.meta.env.VITE_SCRIPT_URL || '';

// Demo Mode - ใช้เมื่อยังไม่ได้ตั้งค่า Google Sheet
const DEMO_MODE = !SCRIPT_URL;

// Admin password for demo mode
const ADMIN_PASSWORD = 'admin1234';

// ===== CONFIG: รายชื่อรหัสพนักงานที่สามารถร่วมกิจกรรม =====
// ถ้า array ว่าง = ทุกคนสามารถร่วมได้
// ถ้ามีรายชื่อ = เฉพาะรหัสที่อยู่ในลิสต์เท่านั้น
const STORAGE_KEY_EMPLOYEES = 'lucky_wheel_allowed_employees';
const STORAGE_KEY_EVENT_SETTINGS = 'lucky_wheel_event_settings';

// โหลดจาก localStorage หรือใช้ค่าเริ่มต้น
function loadAllowedEmployees(): string[] {
  const stored = localStorage.getItem(STORAGE_KEY_EMPLOYEES);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  // ค่าเริ่มต้น (ตัวอย่าง)
  return ['EMP001', 'EMP002', 'EMP003', 'EMP004', 'EMP005'];
}

let allowedEmployeeIds: string[] = loadAllowedEmployees();

// Export สำหรับใช้ใน UI
export const ALLOWED_EMPLOYEE_IDS = allowedEmployeeIds;

// ดึงรายชื่อทั้งหมด
export function getAllowedEmployees(): string[] {
  return [...allowedEmployeeIds];
}

// อัพเดทรายชื่อ
export function setAllowedEmployees(ids: string[]): void {
  allowedEmployeeIds = [...ids];
  localStorage.setItem(STORAGE_KEY_EMPLOYEES, JSON.stringify(ids));
}

// ตรวจสอบว่ารหัสพนักงานมีสิทธิ์ร่วมกิจกรรมหรือไม่
function isEmployeeAllowed(employeeId: string): boolean {
  // ถ้าไม่มี config = ทุกคนเข้าร่วมได้
  if (allowedEmployeeIds.length === 0) {
    return true;
  }
  // ตรวจสอบว่าอยู่ในลิสต์หรือไม่ (case-insensitive)
  return allowedEmployeeIds.some(
    id => id.toLowerCase() === employeeId.toLowerCase()
  );
}

// ===== CACHE LAYER =====
const cache = new Map<string, { data: unknown; timestamp: number }>();
const pending = new Map<string, Promise<unknown>>();
const CACHE_TTL: Record<string, number> = {
  getPrizes: 300_000,       // 5 นาที (ตรงกับ GAS cache)
  getHistory: 120_000,      // 2 นาที
  getAllHistory: 120_000,
  getStats: 120_000,
  getAllowedEmployees: 300_000,
  getEventSettings: 300_000,
};
const DEMO_CACHE_TTL: Record<string, number> = {
  getPrizes: 5_000,
  getHistory: 5_000,
  getAllHistory: 5_000,
  getStats: 5_000,
  getEventSettings: 5_000,
};

function getCacheTTL(action: string): number {
  const ttlMap = DEMO_MODE ? DEMO_CACHE_TTL : CACHE_TTL;
  return ttlMap[action] ?? 0;
}

// Stale threshold: ถ้า cache เก่ากว่านี้ จะ revalidate เบื้องหลัง แต่ยัง return stale data ทันที
const STALE_TTL: Record<string, number> = {
  getPrizes: 30_000,        // 30 วินาที — stale หลัง 30s, revalidate background
  getHistory: 15_000,
  getAllHistory: 15_000,
  getStats: 15_000,
  getAllowedEmployees: 30_000,
  getEventSettings: 30_000,
};

function getStaleThreshold(action: string): number {
  return STALE_TTL[action] ?? 0;
}

function revalidateInBackground<T>(cacheKey: string, action: string, fetcher: () => Promise<T>): void {
  if (pending.has(cacheKey)) return; // already revalidating
  const ttl = getCacheTTL(action);
  const promise = fetcher()
    .then((data) => {
      if (ttl > 0) {
        cache.set(cacheKey, { data, timestamp: Date.now() });
      }
    })
    .finally(() => {
      pending.delete(cacheKey);
    });
  pending.set(cacheKey, promise);
}

function fetchWithCache<T>(cacheKey: string, action: string, fetcher: () => Promise<T>): Promise<T> {
  const ttl = getCacheTTL(action);
  const staleThreshold = getStaleThreshold(action);

  // Check cache
  if (ttl > 0) {
    const cached = cache.get(cacheKey);
    if (cached) {
      const age = Date.now() - cached.timestamp;
      if (age < ttl) {
        // Stale-while-revalidate: ถ้า cache เก่ากว่า stale threshold แต่ยังไม่หมดอายุ
        // return data ทันที + fetch ใหม่เบื้องหลัง
        if (staleThreshold > 0 && age > staleThreshold) {
          revalidateInBackground(cacheKey, action, fetcher);
        }
        return Promise.resolve(cached.data as T);
      }
    }
  }

  // Dedup: if same request is in-flight, return the same promise
  const inflight = pending.get(cacheKey);
  if (inflight) {
    return inflight as Promise<T>;
  }

  const promise = fetcher()
    .then((data) => {
      if (ttl > 0) {
        cache.set(cacheKey, { data, timestamp: Date.now() });
      }
      return data;
    })
    .finally(() => {
      pending.delete(cacheKey);
    });

  pending.set(cacheKey, promise);
  return promise;
}

export function getFromCache<T>(cacheKey: string): T | undefined {
  const cached = cache.get(cacheKey);
  const action = cacheKey.split(':')[0];
  const ttl = getCacheTTL(action);
  if (cached && ttl > 0 && Date.now() - cached.timestamp < ttl) {
    return cached.data as T;
  }
  return undefined;
}

export function invalidateCache(...actions: string[]): void {
  if (actions.length === 0) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (actions.some(action => key === action || key.startsWith(action + ':'))) {
      cache.delete(key);
    }
  }
}

// ===== DEMO DATA =====
const demoPrizes: Prize[] = [
  { id: '1', name: 'อั่งเปา 888', description: 'อั่งเปามงคล', image_url: '', probability: 5, quantity: 1, color: '#c41e3a', is_active: true, is_donatable: true, is_money: true },
  { id: '2', name: 'ทองคำ 1 สลึง', description: 'ทองคำแท้', image_url: '', probability: 5, quantity: 2, color: '#ffd700', is_active: true, is_donatable: true },
  { id: '3', name: 'อั่งเปา 168', description: 'เลขมงคล', image_url: '', probability: 15, quantity: 10, color: '#8b0000', is_active: true, is_donatable: true, is_money: true },
  { id: '4', name: 'ส่วนลด 20%', description: 'คูปองส่วนลด', image_url: '', probability: 25, quantity: -1, color: '#daa520', is_active: true, is_donatable: false },
  { id: '5', name: 'ส้มมงคล', description: 'ส้มโชคดี', image_url: '', probability: 25, quantity: -1, color: '#b22222', is_active: true, is_donatable: false },
  { id: '6', name: 'ลองใหม่นะ', description: 'โชคดีครั้งหน้า', image_url: '', probability: 25, quantity: -1, color: '#cd853f', is_active: true, is_donatable: false },
];

let demoUsers: User[] = [
  { id: 'admin', employee_id: 'ADMIN', name: 'ผู้ดูแลระบบ', spins_remaining: 999, role: 'admin', created_at: new Date().toISOString() },
];

let demoHistory: SpinHistory[] = [];
let demoNextUserId = 1;

// Weighted random selection
function selectPrize(prizes: Prize[]): Prize {
  const available = prizes.filter(p => p.quantity !== 0);
  const totalWeight = available.reduce((sum, p) => sum + p.probability, 0);
  let random = Math.random() * totalWeight;

  for (const prize of available) {
    random -= prize.probability;
    if (random <= 0) {
      return prize;
    }
  }
  return available[available.length - 1];
}

// ===== DEMO API =====
const demoApi = {
  async getPrizes(): Promise<{ success: boolean; prizes: Prize[] }> {
    return fetchWithCache('getPrizes', 'getPrizes', async () => {
      await delay(300);
      return { success: true, prizes: demoPrizes.filter(p => p.is_active) };
    });
  },

  async spin(userId: string): Promise<SpinResult> {
    await delay(300);
    const user = demoUsers.find(u => u.id === userId);
    if (!user) return { success: false, error: 'ไม่พบผู้ใช้งาน' };
    if (user.spins_remaining <= 0) return { success: false, error: 'ไม่มีสิทธิ์หมุนแล้ว' };

    const prize = selectPrize(demoPrizes);
    user.spins_remaining--;

    const historyId = String(demoHistory.length + 1);
    demoHistory.unshift({
      id: historyId,
      user_id: userId,
      user_name: user.name,
      employee_id: user.employee_id,
      prize_id: prize.id,
      prize_name: prize.name,
      spun_at: new Date().toISOString(),
      status: 'claimed',
    });

    invalidateCache('getPrizes', 'getHistory', 'getAllHistory', 'getStats');
    return { success: true, prize, spinsRemaining: user.spins_remaining, historyId };
  },

  // ผู้ใช้ทั่วไป - กรอกรหัสพนักงานและชื่อ
  async enterEmployee(data: { employeeId: string; name: string }): Promise<{ success: boolean; user?: User; error?: string }> {
    await delay(300);

    // ตรวจสอบว่ารหัสพนักงานมีสิทธิ์ร่วมกิจกรรมหรือไม่
    if (!isEmployeeAllowed(data.employeeId)) {
      return { success: false, error: 'รหัสพนักงานนี้ไม่มีสิทธิ์ร่วมกิจกรรม' };
    }

    // ตรวจสอบว่าเคยหมุนไปแล้วหรือยัง
    const existingUser = demoUsers.find(u => u.employee_id.toLowerCase() === data.employeeId.toLowerCase() && u.role === 'user');

    if (existingUser) {
      // ถ้าเคยลงทะเบียนแล้ว ส่งข้อมูลเดิมกลับไป
      return { success: true, user: { ...existingUser } };
    }

    // สร้างผู้ใช้ใหม่
    const newUser: User = {
      id: `emp_${demoNextUserId++}`,
      employee_id: data.employeeId.toUpperCase(),
      name: data.name,
      spins_remaining: 1, // ให้หมุนได้ 1 ครั้ง
      role: 'user',
      created_at: new Date().toISOString(),
    };
    demoUsers.push(newUser);
    return { success: true, user: newUser };
  },

  // Admin login
  async loginAdmin(password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    await delay(300);
    if (password === ADMIN_PASSWORD) {
      const admin = demoUsers.find(u => u.role === 'admin');
      if (admin) {
        return { success: true, user: { ...admin } };
      }
    }
    return { success: false, error: 'รหัสผ่านไม่ถูกต้อง' };
  },

  async getHistory(userId: string): Promise<{ success: boolean; history: SpinHistory[] }> {
    return fetchWithCache(`getHistory:${userId}`, 'getHistory', async () => {
      await delay(300);
      return { success: true, history: demoHistory.filter(h => h.user_id === userId) };
    });
  },

  async getAllHistory(): Promise<{ success: boolean; history: SpinHistory[] }> {
    return fetchWithCache('getAllHistory', 'getAllHistory', async () => {
      await delay(300);
      return { success: true, history: demoHistory };
    });
  },

  async claimPrize(historyId: string, paymentInfo: PaymentInfo): Promise<{ success: boolean; error?: string }> {
    await delay(300);
    const entry = demoHistory.find(h => h.id === historyId);
    if (!entry) {
      return { success: false, error: 'ไม่พบรายการ' };
    }
    entry.payment_info = paymentInfo;
    invalidateCache('getHistory', 'getAllHistory');
    return { success: true };
  },

  async markTransferred(historyId: string): Promise<{ success: boolean; error?: string }> {
    await delay(300);
    const entry = demoHistory.find(h => h.id === historyId);
    if (!entry) {
      return { success: false, error: 'ไม่พบรายการ' };
    }
    entry.status = entry.status === 'donated' ? 'donated_transferred' : 'transferred';
    invalidateCache('getHistory', 'getAllHistory', 'getStats');
    return { success: true };
  },

  async donatePrize(historyId: string, amount: number): Promise<{ success: boolean; error?: string }> {
    await delay(300);
    const entry = demoHistory.find(h => h.id === historyId);
    if (!entry) {
      return { success: false, error: 'ไม่พบรายการ' };
    }
    entry.status = 'donated';
    entry.donation_amount = amount;
    invalidateCache('getHistory', 'getAllHistory', 'getStats');
    return { success: true };
  },

  async getParticipants(): Promise<{ success: boolean; users: User[] }> {
    return fetchWithCache('getParticipants', 'getParticipants', async () => {
      await delay(300);
      const users = demoUsers.filter(u => u.role === 'user');
      return { success: true, users };
    });
  },

  async getStats(): Promise<{ success: boolean; stats: { totalSpins: number; totalUsers: number; totalDonations: number; totalDonationAmount: number; prizeStats: Record<string, number> } }> {
    return fetchWithCache('getStats', 'getStats', async () => {
      await delay(300);
      const prizeStats: Record<string, number> = {};
      let totalDonations = 0;
      let totalDonationAmount = 0;
      demoHistory.forEach(h => {
        prizeStats[h.prize_name] = (prizeStats[h.prize_name] || 0) + 1;
        if (h.status === 'donated') {
          totalDonations++;
          totalDonationAmount += h.donation_amount || 0;
        }
      });
      return {
        success: true,
        stats: {
          totalSpins: demoHistory.length,
          totalUsers: demoUsers.filter(u => u.role === 'user').length,
          totalDonations,
          totalDonationAmount,
          prizeStats,
        },
      };
    });
  },

  async addPrize(prize: Omit<Prize, 'id'>): Promise<{ success: boolean; prize?: Prize }> {
    await delay(300);
    const newPrize: Prize = { ...prize, id: String(demoPrizes.length + 1), is_active: true };
    demoPrizes.push(newPrize);
    invalidateCache('getPrizes');
    return { success: true, prize: newPrize };
  },

  async updatePrize(prize: Prize): Promise<{ success: boolean }> {
    await delay(300);
    const index = demoPrizes.findIndex(p => p.id === prize.id);
    if (index !== -1) {
      demoPrizes[index] = prize;
      invalidateCache('getPrizes');
      return { success: true };
    }
    return { success: false };
  },

  async deletePrize(id: string): Promise<{ success: boolean }> {
    await delay(300);
    const index = demoPrizes.findIndex(p => p.id === id);
    if (index !== -1) {
      demoPrizes.splice(index, 1);
      invalidateCache('getPrizes');
      return { success: true };
    }
    return { success: false };
  },

  async getEventSettings(): Promise<{ success: boolean; settings: EventSettings }> {
    return fetchWithCache('getEventSettings', 'getEventSettings', async () => {
      await delay(100);
      const stored = localStorage.getItem(STORAGE_KEY_EVENT_SETTINGS);
      if (stored) {
        try {
          return { success: true, settings: JSON.parse(stored) as EventSettings };
        } catch { /* ignore */ }
      }
      return { success: true, settings: { startDate: '', endDate: '', startTime: '08:00', endTime: '20:00' } };
    });
  },

  async saveEventSettings(settings: EventSettings): Promise<{ success: boolean }> {
    await delay(300);
    localStorage.setItem(STORAGE_KEY_EVENT_SETTINGS, JSON.stringify(settings));
    invalidateCache('getEventSettings');
    return { success: true };
  },
};

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ===== REAL API =====
const FETCH_TIMEOUT = 15_000;

async function fetchApi<T>(action: string, params: Record<string, string> = {}, method: 'GET' | 'POST' = 'GET', body?: unknown): Promise<T> {
  const url = new URL(SCRIPT_URL);
  url.searchParams.set('action', action);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  const options: RequestInit = {
    method,
    redirect: 'follow',
    signal: controller.signal,
  };

  if (method === 'POST' && body) {
    // ใช้ text/plain เพื่อหลีกเลี่ยง CORS preflight
    options.headers = { 'Content-Type': 'text/plain;charset=utf-8' };
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url.toString(), options);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

const realApi = {
  async getPrizes(): Promise<{ success: boolean; prizes: Prize[] }> {
    return fetchWithCache('getPrizes', 'getPrizes', () => fetchApi('getPrizes'));
  },

  async spin(userId: string): Promise<SpinResult> {
    const result = await fetchApi<SpinResult>('spin', { userId });
    invalidateCache('getPrizes', 'getHistory', 'getAllHistory', 'getStats');
    return result;
  },

  async enterEmployee(data: { employeeId: string; name: string }): Promise<{ success: boolean; user?: User; error?: string }> {
    return fetchApi('enterEmployee', {}, 'POST', data);
  },

  async loginAdmin(password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    return fetchApi('loginAdmin', { password });
  },

  async getHistory(userId: string): Promise<{ success: boolean; history: SpinHistory[] }> {
    return fetchWithCache(`getHistory:${userId}`, 'getHistory', () => fetchApi('getHistory', { userId }));
  },

  async getAllHistory(): Promise<{ success: boolean; history: SpinHistory[] }> {
    return fetchWithCache('getAllHistory', 'getAllHistory', () => fetchApi('getAllHistory'));
  },

  async getParticipants(): Promise<{ success: boolean; users: User[] }> {
    return fetchWithCache('getParticipants', 'getParticipants', () => fetchApi('getParticipants'));
  },

  async claimPrize(historyId: string, paymentInfo: PaymentInfo): Promise<{ success: boolean; error?: string }> {
    const result = await fetchApi<{ success: boolean; error?: string }>('claimPrize', {}, 'POST', { historyId, paymentInfo });
    if (result.success) {
      invalidateCache('getHistory', 'getAllHistory');
    }
    return result;
  },

  async markTransferred(historyId: string): Promise<{ success: boolean; error?: string }> {
    const result = await fetchApi<{ success: boolean; error?: string }>('markTransferred', { historyId });
    if (result.success) {
      invalidateCache('getHistory', 'getAllHistory', 'getStats');
    }
    return result;
  },

  async donatePrize(historyId: string, amount: number): Promise<{ success: boolean; error?: string }> {
    const result = await fetchApi<{ success: boolean; error?: string }>('donatePrize', { historyId, amount: String(amount) });
    if (result.success) {
      invalidateCache('getHistory', 'getAllHistory', 'getStats');
    }
    return result;
  },

  async getStats(): Promise<{ success: boolean; stats: { totalSpins: number; totalUsers: number; totalDonations: number; totalDonationAmount: number; prizeStats: Record<string, number> } }> {
    return fetchWithCache('getStats', 'getStats', () => fetchApi('getStats'));
  },

  async addPrize(prize: Omit<Prize, 'id'>): Promise<{ success: boolean; prize?: Prize }> {
    const result = await fetchApi<{ success: boolean; prize?: Prize }>('addPrize', {}, 'POST', prize);
    if (result.success) {
      invalidateCache('getPrizes');
    }
    return result;
  },

  async updatePrize(prize: Prize): Promise<{ success: boolean }> {
    const result = await fetchApi<{ success: boolean }>('updatePrize', {}, 'POST', prize);
    if (result.success) {
      invalidateCache('getPrizes');
    }
    return result;
  },

  async deletePrize(id: string): Promise<{ success: boolean }> {
    const result = await fetchApi<{ success: boolean }>('deletePrize', { id });
    if (result.success) {
      invalidateCache('getPrizes');
    }
    return result;
  },

  async getEventSettings(): Promise<{ success: boolean; settings: EventSettings }> {
    return fetchWithCache('getEventSettings', 'getEventSettings', () =>
      fetchApi('getEventSettings')
    );
  },

  async saveEventSettings(settings: EventSettings): Promise<{ success: boolean }> {
    const result = await fetchApi<{ success: boolean }>('saveEventSettings', {}, 'POST', settings);
    if (result.success) {
      invalidateCache('getEventSettings');
    }
    return result;
  },
};

// Export API based on mode
export const api = DEMO_MODE ? demoApi : realApi;
export const isDemoMode = DEMO_MODE;

// ===== PRELOAD =====
// เริ่มโหลด prizes ทันทีตอน module load (ไม่รอ component mount)
export const preloadPrizes = api.getPrizes();

// ===== EMPLOYEE WHITELIST API =====

// สำหรับ Demo Mode - ใช้ localStorage
// สำหรับ Real Mode - ใช้ Google Sheet

export async function fetchAllowedEmployees(): Promise<string[]> {
  if (DEMO_MODE) {
    return getAllowedEmployees();
  }

  return fetchWithCache('getAllowedEmployees', 'getAllowedEmployees', async () => {
    try {
      const result = await fetchApi<{ success: boolean; employees: string[] }>('getAllowedEmployees');
      if (result.success) {
        // Sync to localStorage
        localStorage.setItem(STORAGE_KEY_EMPLOYEES, JSON.stringify(result.employees));
        allowedEmployeeIds = result.employees;
        return result.employees;
      }
    } catch (error) {
      console.error('Failed to fetch allowed employees:', error);
    }
    return getAllowedEmployees();
  });
}

export async function saveAllowedEmployees(ids: string[]): Promise<boolean> {
  // Update local state
  setAllowedEmployees(ids);

  if (DEMO_MODE) {
    return true;
  }

  try {
    const result = await fetchApi<{ success: boolean }>('setAllowedEmployees', {}, 'POST', { employees: ids });
    if (result.success) {
      invalidateCache('getAllowedEmployees');
    }
    return result.success;
  } catch (error) {
    console.error('Failed to save allowed employees:', error);
    return false;
  }
}
