import axios from 'axios';

/**
 * Console admin. Les appels passent par le relais Next.js /bff/admin/* : le jeton de session
 * est dans un cookie HttpOnly que ce code ne peut pas lire, et le relais l'ajoute côté serveur.
 * Les chemins restent ceux de l'API (ex. `/admin/wallets` → /bff/admin/admin/wallets).
 */
export const apiClient = axios.create({
  baseURL: '/bff/admin',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Session expirée ou révoquée (le relais a déjà effacé le cookie) : retour à la connexion.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error?.response?.status === 401 && !window.location.pathname.startsWith('/login')) {
      ['admin_name', 'admin_phone'].forEach((k) => localStorage.removeItem(k));
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
