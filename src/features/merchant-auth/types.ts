export interface Merchant {
  id: number;
  name: string;
  company_name: string;
  email: string;
  phone: string;
  environment: 'sandbox' | 'production';
  status: boolean;
  two_factor_enabled?: boolean;
  created_at: string;
}

export interface RegisterInput {
  company_name: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  status: string; // 'success' | 'two_factor_required'
  challenge?: string; // 2FA activée : à échanger via POST /merchants/2fa
  message: string;
  merchant: Merchant;
}

export interface ProfileResponse {
  status: string;
  merchant: Merchant;
}
