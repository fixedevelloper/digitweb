export interface LoginCredentials {
  phone: string; // Remplacement de email par phone
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    phone: string;
  };
}