'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import {
  Agent, CountryService, FeeRule, ManualTransfer, Provider, ResourcePage,
} from '../types';

/** Lecture + création + mise à jour d'une ressource admin, avec rafraîchissement du cache. */
function useAdminResource<T extends { id: number }>(key: string, path: string) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: [key] });

  const list = useQuery<T[]>({
    queryKey: [key],
    queryFn: async () => (await apiClient.get<T[]>(path)).data,
  });
  const create = useMutation({
    mutationFn: async (data: Record<string, unknown>) => (await apiClient.post(path, data)).data,
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      (await apiClient.put(`${path}/${id}`, data)).data,
    onSuccess: invalidate,
  });

  return { ...list, create, update };
}

export const useProviders = () => useAdminResource<Provider>('admin-providers', '/admin/providers');
export const useCountryServices = () => useAdminResource<CountryService>('admin-country-services', '/admin/country-services');
export const useFeeRules = () => useAdminResource<FeeRule>('admin-fee-rules', '/admin/fee-rules');
export const useAgents = () => useAdminResource<Agent>('admin-agents', '/admin/agents');

export function useBankFields(countryId: number | null) {
  const queryClient = useQueryClient();
  const query = useQuery<{ required_fields: string[] }>({
    queryKey: ['admin-bank-fields', countryId],
    enabled: countryId !== null,
    queryFn: async () => (await apiClient.get(`/admin/countries/${countryId}/bank-fields`)).data,
  });
  const save = useMutation({
    mutationFn: async (fields: Record<string, boolean>) =>
      (await apiClient.put(`/admin/countries/${countryId}/bank-fields`, { fields })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-bank-fields', countryId] }),
  });
  return { ...query, save };
}

export function useAdminManualTransfers(params: { status?: string; page: number }) {
  return useQuery<ResourcePage<ManualTransfer>>({
    queryKey: ['admin-manual-transfers', params],
    queryFn: async () => (await apiClient.get('/admin/manual-transfers', { params })).data,
    refetchInterval: 30_000,
  });
}

export function useAdminTransfer(id: number | null) {
  return useQuery<{ data: ManualTransfer }>({
    queryKey: ['admin-transfer', id],
    enabled: id !== null,
    queryFn: async () => (await apiClient.get(`/admin/transfers/${id}`)).data,
  });
}

/** Remet dans la file un transfert manuel bloqué (agent absent) ; le motif est tracé dans l'audit. */
export function useAdminReleaseTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) =>
      (await apiClient.post(`/admin/transfers/${id}/release`, { reason })).data,
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-manual-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-transfer', id] });
    },
  });
}
