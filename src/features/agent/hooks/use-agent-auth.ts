import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { clearAgentSession } from '@/lib/agent-api-client';

interface AgentLoginResponse {
  user: { id: number; name: string; phone: string; role: string };
}

export function useAgentLogin() {
  return useMutation({
    // Via le relais Next.js : le jeton est posé dans un cookie HttpOnly, jamais renvoyé ici.
    mutationFn: async (credentials: { phone: string; password: string }) =>
      (await axios.post<AgentLoginResponse>('/bff/auth/agent/login', credentials, {
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      })).data,
    onSuccess: (data) => {
      localStorage.setItem('agent_id', String(data.user.id));
      localStorage.setItem('agent_name', data.user.name);
      window.location.href = '/agent/dashboard';
    },
  });
}

export async function agentLogout() {
  try {
    await axios.post('/bff/auth/agent/logout', {}, { headers: { Accept: 'application/json' } });
  } finally {
    clearAgentSession();
    window.location.href = '/agent/login';
  }
}
