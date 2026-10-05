import axios from 'axios';

/**
 * Console agent (/agent/*). Séparée de `apiClient` (admin) et de `merchantApiClient` : chaque
 * session a son propre cookie HttpOnly (voir /bff/agent/*), pour qu'un agent et un admin
 * puissent coexister dans le même navigateur.
 */
export const agentApiClient = axios.create({
  baseURL: '/bff/agent',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/** Efface les informations d'affichage (le jeton, lui, est dans un cookie HttpOnly). */
export const clearAgentSession = () => {
  ['agent_id', 'agent_name'].forEach((k) => localStorage.removeItem(k));
};

agentApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error?.response?.status === 401) {
      clearAgentSession();
      if (!window.location.pathname.startsWith('/agent/login')) {
        window.location.href = '/agent/login';
      }
    }
    return Promise.reject(error);
  }
);
