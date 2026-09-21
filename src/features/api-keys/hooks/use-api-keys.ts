'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiKeysApi } from '../services/api-keys-api';
import { CreateApiKeyInput } from '../types';

export function useApiKeys() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['merchant-api-keys'],
    queryFn: apiKeysApi.list,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateApiKeyInput) => apiKeysApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-api-keys'] });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (id: number) => apiKeysApi.revoke(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-api-keys'] });
    },
  });

  return {
    ...query,
    createApiKey: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error,
    revokeApiKey: revokeMutation.mutate,
    isRevoking: revokeMutation.isPending,
  };
}
