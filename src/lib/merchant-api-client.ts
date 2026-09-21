import axios from 'axios';

/**
 * Instance Axios dédiée à l'espace self-service marchand (/portal/*). Séparée
 * de `apiClient` (console admin) pour éviter tout conflit entre le token
 * Sanctum admin et celui du marchand si les deux sessions coexistent dans le
 * même navigateur — chacune a sa propre clé de stockage.
 */
export const merchantApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

merchantApiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('merchant_auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Un token expiré/révoqué renvoie 401 : on nettoie la session locale et on
// renvoie vers /portal/login plutôt que de laisser l'utilisateur face à des
// requêtes qui échouent silencieusement.
merchantApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error?.response?.status === 401) {
      localStorage.removeItem('merchant_auth_token');
      localStorage.removeItem('merchant_company_name');
      localStorage.removeItem('merchant_name');
      if (!window.location.pathname.startsWith('/portal/login')) {
        window.location.href = '/portal/login';
      }
    }
    return Promise.reject(error);
  }
);
