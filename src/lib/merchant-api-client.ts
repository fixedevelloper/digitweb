import axios from 'axios';

/**
 * Espace self-service marchand (/portal/*). Séparé de `apiClient` (console admin) : chaque
 * espace a son propre cookie de session HttpOnly (voir /bff/merchant/*), donc un admin et un
 * marchand peuvent coexister dans le même navigateur sans conflit.
 */
export const merchantApiClient = axios.create({
  baseURL: '/bff/merchant',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Session expirée/révoquée : le relais a effacé le cookie, on renvoie vers /portal/login
// plutôt que de laisser l'utilisateur face à des requêtes qui échouent silencieusement.
merchantApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error?.response?.status === 401) {
      localStorage.removeItem('merchant_company_name');
      localStorage.removeItem('merchant_name');
      if (!window.location.pathname.startsWith('/portal/login')) {
        window.location.href = '/portal/login';
      }
    }
    return Promise.reject(error);
  }
);
