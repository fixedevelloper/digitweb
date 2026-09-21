import axios from 'axios';
import { merchantApiClient } from '@/lib/merchant-api-client';
import { AuthResponse, LoginInput, ProfileResponse, RegisterInput } from '../types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const merchantAuthApi = {
  /**
   * Inscription et connexion : instance Axios isolée (sans intercepteur) pour
   * éviter d'envoyer un éventuel jeton périmé pendant l'authentification.
   */
  register: async (data: RegisterInput): Promise<AuthResponse> => {
    const response = await axios.post<AuthResponse>(`${BASE_URL}/merchants/register`, data, {
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    });
    return response.data;
  },

  login: async (data: LoginInput): Promise<AuthResponse> => {
    const response = await axios.post<AuthResponse>(`${BASE_URL}/merchants/login`, data, {
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await merchantApiClient.post('/merchants/logout');
  },

  getProfile: async (): Promise<ProfileResponse> => {
    const response = await merchantApiClient.get<ProfileResponse>('/merchants/profile');
    return response.data;
  },
};
