import { merchantApiClient } from '@/lib/merchant-api-client';
import { ApiKey, CreateApiKeyInput, CreateApiKeyResult } from '../types';

export const apiKeysApi = {
  list: async (): Promise<ApiKey[]> => {
    const response = await merchantApiClient.get<{ status: string; data: ApiKey[] }>('/merchants/api-keys');
    return response.data.data;
  },

  create: async (data: CreateApiKeyInput): Promise<CreateApiKeyResult> => {
    const response = await merchantApiClient.post<{ status: string; message: string; data: CreateApiKeyResult }>(
      '/merchants/api-keys',
      data
    );
    return response.data.data;
  },

  revoke: async (id: number): Promise<void> => {
    await merchantApiClient.delete(`/merchants/api-keys/${id}`);
  },
};
