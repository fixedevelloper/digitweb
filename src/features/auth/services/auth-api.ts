import axios from 'axios';
import { LoginCredentials, AuthResponse } from '../types';

// On utilise la variable d'environnement ou l'URL de base directe de ton API Laravel
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const authApi = {
  /**
   * Login : Utilise une instance Axios isolée (sans intercepteurs)
   * pour éviter les conflits de jetons au moment de l'authentification.
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axios.post<AuthResponse>(
        `${BASE_URL}/admin/auth/login`,
        credentials,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        }
    );
    return response.data;
  },

  /**
   * Logout : Doit généralement conserver l'instance apiClient globale
   * ou recevoir le token manuellement car la route Laravel '/admin/auth/logout'
   * nécessite d'être authentifié pour révoquer le token de session.
   */
  logout: async (token?: string): Promise<void> => {
    await axios.post(
        `${BASE_URL}/admin/auth/logout`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        }
    );
  }
};