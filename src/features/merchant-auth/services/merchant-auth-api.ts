import axios from 'axios';
import { merchantApiClient } from '@/lib/merchant-api-client';
import { AuthResponse, LoginInput, ProfileResponse, RegisterInput } from '../types';

export const merchantAuthApi = {
  /**
   * Inscription et connexion : via le relais Next.js, qui pose le cookie de session HttpOnly
   * (le jeton n'est jamais renvoyé au navigateur).
   */
  register: async (data: RegisterInput): Promise<AuthResponse> => {
    const response = await axios.post<AuthResponse>('/bff/auth/merchant/register', data, {
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    });
    return response.data;
  },

  login: async (data: LoginInput): Promise<AuthResponse> => {
    const response = await axios.post<AuthResponse>('/bff/auth/merchant/login', data, {
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await axios.post('/bff/auth/merchant/logout', {}, { headers: { Accept: 'application/json' } });
  },

  getProfile: async (): Promise<ProfileResponse> => {
    const response = await merchantApiClient.get<ProfileResponse>('/merchants/profile');
    return response.data;
  },
};
