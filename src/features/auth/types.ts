export interface LoginCredentials {
  phone: string; // Remplacement de email par phone
  password: string;
}

export interface AuthResponse {
  status?: 'success' | 'two_factor_required';
  /** Présent quand la 2FA est activée : à échanger contre un code (POST /admin/auth/2fa). */
  challenge?: string;
  user: {
    id: number;
    name: string;
    phone: string;
  };
}