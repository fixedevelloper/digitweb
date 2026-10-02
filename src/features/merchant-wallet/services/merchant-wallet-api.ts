import { merchantApiClient } from '@/lib/merchant-api-client';
import { MerchantTransactionFilters, MerchantWallet, PaginatedMerchantTransactions } from '../types';

export const merchantWalletApi = {
  getWallet: async (): Promise<MerchantWallet> => {
    const response = await merchantApiClient.get<{ status: string; data: MerchantWallet }>('/merchants/wallet');
    return response.data.data;
  },

  getTransactions: async (filters: MerchantTransactionFilters): Promise<PaginatedMerchantTransactions> => {
    const response = await merchantApiClient.get<PaginatedMerchantTransactions>('/merchants/transactions', {
      params: {
        environment: filters.environment,
        type: filters.type || undefined,
        status: filters.status || undefined,
        search: filters.search || undefined,
        page: filters.page,
      },
    });
    return response.data;
  },

  topUpSandbox: async (amount: number): Promise<number> => {
    const response = await merchantApiClient.post<{ status: string; data: { sandbox_balance: number } }>(
      '/merchants/sandbox/top-up',
      { amount }
    );
    return response.data.data.sandbox_balance;
  },
};
