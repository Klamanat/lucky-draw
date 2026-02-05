export interface Prize {
  id: string;
  name: string;
  description: string;
  image_url: string;
  probability: number;
  quantity: number;
  color: string;
  is_active: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  spins_remaining: number;
  role: 'user' | 'admin';
  created_at: string;
}

export interface SpinHistory {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  prize_id: string;
  prize_name: string;
  spun_at: string;
}

export interface SpinResult {
  success: boolean;
  prize?: Prize;
  spinsRemaining?: number;
  error?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
