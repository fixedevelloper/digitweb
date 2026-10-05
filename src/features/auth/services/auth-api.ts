import axios from 'axios';
import { LoginCredentials, AuthResponse } from '../types';

// Les identifiants vont au relais Next.js, qui appelle l'API et pose le cookie de session HttpOnly :
// la réponse ne contient jamais le jeton.
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axios.post<AuthResponse>('/bff/auth/admin/login', credentials, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    return response.data;
  },

  /** Révoque le jeton côté API et efface le cookie. */
  logout: async (): Promise<void> => {
    await axios.post('/bff/auth/admin/logout', {}, { headers: { Accept: 'application/json' } });
  },
};
