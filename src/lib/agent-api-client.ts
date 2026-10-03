import axios from 'axios';

/**
 * Instance Axios dédiée à la console agent (/agent/*). Séparée de `apiClient` (admin) et
 * de `merchantApiClient` : chaque session a sa propre clé de stockage, pour qu'un agent et
 * un admin puissent coexister dans le même navigateur sans écraser leurs jetons.
 */
export const agentApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

agentApiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('agent_auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const clearAgentSession = () => {
  ['agent_auth_token', 'agent_id', 'agent_name'].forEach((k) => localStorage.removeItem(k));
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
