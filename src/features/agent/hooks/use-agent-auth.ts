import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { agentApiClient, clearAgentSession } from '@/lib/agent-api-client';

interface AgentLoginResponse {
  token: string;
  user: { id: number; name: string; phone: string; role: string };
}

export function useAgentLogin() {
  return useMutation({
    mutationFn: async (credentials: { phone: string; password: string }) =>
      (await axios.post<AgentLoginResponse>(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/agent/auth/login`,
        credentials,
        { headers: { 'Content-Type': 'application/json', Accept: 'application/json' } },
      )).data,
    onSuccess: (data) => {
      localStorage.setItem('agent_auth_token', data.token);
      localStorage.setItem('agent_id', String(data.user.id));
      localStorage.setItem('agent_name', data.user.name);
      window.location.href = '/agent/dashboard';
    },
  });
}

export async function agentLogout() {
  try {
    await agentApiClient.post('/agent/auth/logout');
  } finally {
    clearAgentSession();
    window.location.href = '/agent/login';
  }
}
