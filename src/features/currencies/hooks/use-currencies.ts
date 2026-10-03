'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { CURRENCIES } from '@/features/exchange-rates/currencies';

export interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
}

const KEY = ['admin-currencies'];

export function useCurrencies() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: KEY });

  const list = useQuery<Currency[]>({
    queryKey: KEY,
    queryFn: async () => (await apiClient.get<Currency[]>('/admin/currencies')).data,
  });
  const create = useMutation({
    mutationFn: async (data: Omit<Currency, 'id'>) => (await apiClient.post('/admin/currencies', data)).data,
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: async ({ id, ...data }: Pick<Currency, 'id' | 'name' | 'symbol'>) =>
      (await apiClient.put(`/admin/currencies/${id}`, data)).data,
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: async (id: number) => (await apiClient.delete(`/admin/currencies/${id}`)).data,
    onSuccess: invalidate,
  });

  return { ...list, create, update, remove };
}

/** Devises pour les listes déroulantes ; repli sur la liste statique le temps du chargement. */
export function useCurrencyOptions(): Currency[] {
  const { data } = useCurrencies();
  return data?.length ? data : CURRENCIES.map((code, i) => ({ id: -i - 1, code, name: code, symbol: code }));
}
