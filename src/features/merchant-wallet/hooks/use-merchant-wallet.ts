'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { merchantWalletApi } from '../services/merchant-wallet-api';
import { MerchantTransactionFilters } from '../types';

export function useMerchantWallet() {
  return useQuery({
    queryKey: ['merchant-wallet'],
    queryFn: merchantWalletApi.getWallet,
    // Les transactions évoluent en arrière-plan (traitement asynchrone) : solde rafraîchi régulièrement.
    refetchInterval: 15_000,
  });
}

export function useMerchantTransactions(filters: MerchantTransactionFilters) {
  return useQuery({
    queryKey: ['merchant-transactions', filters],
    queryFn: () => merchantWalletApi.getTransactions(filters),
    placeholderData: keepPreviousData,
    refetchInterval: 15_000,
  });
}

export function useSandboxTopUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (amount: number) => merchantWalletApi.topUpSandbox(amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-wallet'] });
    },
  });
}
