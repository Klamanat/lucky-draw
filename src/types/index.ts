export interface Prize {
  id: string;
  name: string;
  description: string;
  image_url: string;
  probability: number;
  quantity: number;
  color: string;
  is_active: boolean;
  is_donatable: boolean;
}

export interface User {
  id: string;
  employee_id: string;
  name: string;
  spins_remaining: number;
  role: 'user' | 'admin';
  created_at: string;
}

export interface SpinHistory {
  id: string;
  user_id: string;
  user_name: string;
  employee_id: string;
  prize_id: string;
  prize_name: string;
  spun_at: string;
  status: 'claimed' | 'donated';
  donation_amount?: number;
}

export interface SpinResult {
  success: boolean;
  prize?: Prize;
  spinsRemaining?: number;
  historyId?: string;
  error?: string;
}

export interface EventSettings {
  startDate: string;   // ISO date string เช่น "2025-01-29"
  endDate: string;     // ISO date string เช่น "2025-02-12"
  startTime: string;   // "08:00"
  endTime: string;     // "20:00"
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
