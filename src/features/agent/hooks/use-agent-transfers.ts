'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { agentApiClient } from '@/lib/agent-api-client';
import { ManualTransfer, ResourcePage } from '@/features/transfers/types';

export interface QueueFilter {
  status: string;
  mine?: boolean;
}

export function useAgentQueue(filter: QueueFilter, page: number) {
  return useQuery<ResourcePage<ManualTransfer>>({
    queryKey: ['agent-queue', filter, page],
    queryFn: async () =>
      (await agentApiClient.get('/agent/transfers', { params: { status: filter.status, mine: filter.mine ? 1 : undefined, page } })).data,
    refetchInterval: 15_000, // nouveaux transferts à prendre
  });
}

export function useAgentTransfer(id: number | null) {
  return useQuery<{ data: ManualTransfer }>({
    queryKey: ['agent-transfer', id],
    enabled: id !== null,
    queryFn: async () => (await agentApiClient.get(`/agent/transfers/${id}`)).data,
  });
}

export type AgentAction = 'claim' | 'start' | 'release' | 'complete' | 'reject' | 'fail';

/** Actions du workflow ; rafraîchit la file et le détail après chaque transition. */
export function useAgentActions(id: number) {
  const queryClient = useQueryClient();
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['agent-queue'] });
    queryClient.invalidateQueries({ queryKey: ['agent-transfer', id] });
  };

  const act = useMutation({
    mutationFn: async ({ action, body }: { action: AgentAction; body?: Record<string, unknown> }) =>
      (await agentApiClient.post(`/agent/transfers/${id}/${action}`, body ?? {})).data,
    onSuccess: refresh,
  });

  const uploadProof = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append('proof', file);
      return (await agentApiClient.post(`/agent/transfers/${id}/proof`, form, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
    },
    onSuccess: refresh,
  });

  return { act, uploadProof };
}
