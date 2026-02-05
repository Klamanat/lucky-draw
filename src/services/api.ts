import type { Prize, User, SpinHistory, SpinResult } from '../types';

// Google Apps Script Web App URL
const SCRIPT_URL = import.meta.env.VITE_SCRIPT_URL || '';

// Demo Mode - ใช้เมื่อยังไม่ได้ตั้งค่า Google Sheet
const DEMO_MODE = !SCRIPT_URL;

// ===== DEMO DATA =====
const demoPrizes: Prize[] = [
  { id: '1', name: 'iPhone 15', description: 'สมาร์ทโฟนรุ่นใหม่', image_url: '', probability: 5, quantity: 1, color: '#ef4444', is_active: true },
  { id: '2', name: 'AirPods Pro', description: 'หูฟังไร้สาย', image_url: '', probability: 10, quantity: 3, color: '#3b82f6', is_active: true },
  { id: '3', name: 'Gift Voucher 500', description: 'บัตรกำนัล 500 บาท', image_url: '', probability: 20, quantity: 10, color: '#22c55e', is_active: true },
  { id: '4', name: 'ส่วนลด 10%', description: 'คูปองส่วนลด', image_url: '', probability: 30, quantity: -1, color: '#f97316', is_active: true },
  { id: '5', name: 'ลองใหม่นะ', description: 'เสียใจด้วย', image_url: '', probability: 35, quantity: -1, color: '#6b7280', is_active: true },
];

let demoUsers: User[] = [
  { id: '1', email: 'admin@example.com', name: 'Admin', phone: '', spins_remaining: 999, role: 'admin', created_at: new Date().toISOString() },
  { id: '2', email: 'demo@example.com', name: 'Demo User', phone: '0812345678', spins_remaining: 5, role: 'user', created_at: new Date().toISOString() },
];

let demoHistory: SpinHistory[] = [];
let demoNextUserId = 3;

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
    await delay(300);
    return { success: true, prizes: demoPrizes.filter(p => p.is_active) };
  },

  async spin(userId: string): Promise<SpinResult> {
    await delay(300);
    const user = demoUsers.find(u => u.id === userId);
    if (!user) return { success: false, error: 'ไม่พบผู้ใช้งาน' };
    if (user.spins_remaining <= 0) return { success: false, error: 'ไม่มีสิทธิ์หมุนแล้ว' };

    const prize = selectPrize(demoPrizes);
    user.spins_remaining--;

    demoHistory.unshift({
      id: String(demoHistory.length + 1),
      user_id: userId,
      user_name: user.name,
      user_email: user.email,
      prize_id: prize.id,
      prize_name: prize.name,
      spun_at: new Date().toISOString(),
    });

    return { success: true, prize, spinsRemaining: user.spins_remaining };
  },

  async login(email: string): Promise<{ success: boolean; user?: User; error?: string }> {
    await delay(300);
    const user = demoUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      return { success: true, user: { ...user } };
    }
    return { success: false, error: 'ไม่พบผู้ใช้งาน กรุณาลงทะเบียนก่อน' };
  },

  async register(data: { name: string; email: string; phone: string }): Promise<{ success: boolean; user?: User; error?: string }> {
    await delay(300);
    const exists = demoUsers.find(u => u.email.toLowerCase() === data.email.toLowerCase());
    if (exists) {
      return { success: false, error: 'อีเมลนี้ถูกใช้แล้ว' };
    }

    const newUser: User = {
      id: String(demoNextUserId++),
      email: data.email,
      name: data.name,
      phone: data.phone,
      spins_remaining: 3,
      role: 'user',
      created_at: new Date().toISOString(),
    };
    demoUsers.push(newUser);
    return { success: true, user: newUser };
  },

  async getHistory(userId: string): Promise<{ success: boolean; history: SpinHistory[] }> {
    await delay(300);
    return { success: true, history: demoHistory.filter(h => h.user_id === userId) };
  },

  async getAllHistory(): Promise<{ success: boolean; history: SpinHistory[] }> {
    await delay(300);
    return { success: true, history: demoHistory };
  },

  async getStats(): Promise<{ success: boolean; stats: { totalSpins: number; totalUsers: number; prizeStats: Record<string, number> } }> {
    await delay(300);
    const prizeStats: Record<string, number> = {};
    demoHistory.forEach(h => {
      prizeStats[h.prize_name] = (prizeStats[h.prize_name] || 0) + 1;
    });
    return {
      success: true,
      stats: {
        totalSpins: demoHistory.length,
        totalUsers: demoUsers.filter(u => u.role === 'user').length,
        prizeStats,
      },
    };
  },

  async addPrize(prize: Omit<Prize, 'id'>): Promise<{ success: boolean; prize?: Prize }> {
    await delay(300);
    const newPrize: Prize = { ...prize, id: String(demoPrizes.length + 1), is_active: true };
    demoPrizes.push(newPrize);
    return { success: true, prize: newPrize };
  },

  async updatePrize(prize: Prize): Promise<{ success: boolean }> {
    await delay(300);
    const index = demoPrizes.findIndex(p => p.id === prize.id);
    if (index !== -1) {
      demoPrizes[index] = prize;
      return { success: true };
    }
    return { success: false };
  },

  async deletePrize(id: string): Promise<{ success: boolean }> {
    await delay(300);
    const index = demoPrizes.findIndex(p => p.id === id);
    if (index !== -1) {
      demoPrizes.splice(index, 1);
      return { success: true };
    }
    return { success: false };
  },
};

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ===== REAL API =====
async function fetchApi<T>(action: string, params: Record<string, string> = {}, method: 'GET' | 'POST' = 'GET', body?: unknown): Promise<T> {
  const url = new URL(SCRIPT_URL);
  url.searchParams.set('action', action);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (method === 'POST' && body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url.toString(), options);
  return response.json();
}

const realApi = {
  async getPrizes(): Promise<{ success: boolean; prizes: Prize[] }> {
    return fetchApi('getPrizes');
  },

  async spin(userId: string): Promise<SpinResult> {
    return fetchApi('spin', { userId });
  },

  async login(email: string): Promise<{ success: boolean; user?: User; error?: string }> {
    return fetchApi('loginUser', { email });
  },

  async register(data: { name: string; email: string; phone: string }): Promise<{ success: boolean; user?: User; error?: string }> {
    return fetchApi('registerUser', {}, 'POST', data);
  },

  async getHistory(userId: string): Promise<{ success: boolean; history: SpinHistory[] }> {
    return fetchApi('getHistory', { userId });
  },

  async getAllHistory(): Promise<{ success: boolean; history: SpinHistory[] }> {
    return fetchApi('getAllHistory');
  },

  async getStats(): Promise<{ success: boolean; stats: { totalSpins: number; totalUsers: number; prizeStats: Record<string, number> } }> {
    return fetchApi('getStats');
  },

  async addPrize(prize: Omit<Prize, 'id'>): Promise<{ success: boolean; prize?: Prize }> {
    return fetchApi('addPrize', {}, 'POST', prize);
  },

  async updatePrize(prize: Prize): Promise<{ success: boolean }> {
    return fetchApi('updatePrize', {}, 'POST', prize);
  },

  async deletePrize(id: string): Promise<{ success: boolean }> {
    return fetchApi('deletePrize', { id });
  },
};

// Export API based on mode
export const api = DEMO_MODE ? demoApi : realApi;
export const isDemoMode = DEMO_MODE;
