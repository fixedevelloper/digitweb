'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// `rate` = unités de `quote_currency` pour 1 `base_currency` (ex: 1 USD = 605 XAF).
export interface ExchangeRate {
    id: number;
    base_currency: string;
    quote_currency: string;
    rate: number;
    created_at: string;
    author?: { id: number; name: string | null } | null;
}

interface ExchangeRatesResponse {
    current: ExchangeRate[];
    history: ExchangeRate[];
}

export interface SaveExchangeRateInput {
    base_currency: string;
    quote_currency: string;
    rate: number;
}

export function useExchangeRates() {
    return useQuery<ExchangeRatesResponse>({
        queryKey: ['admin-exchange-rates'],
        queryFn: async () => {
            const response = await apiClient.get<ExchangeRatesResponse>('/admin/exchange-rates');
            return response.data;
        },
    });
}

export function useSaveExchangeRate() {
    const queryClient = useQueryClient();

    return useMutation({
        // Ajout seul côté API : chaque enregistrement crée une nouvelle ligne d'historique
        mutationFn: async (data: SaveExchangeRateInput) => {
            const response = await apiClient.post('/admin/exchange-rates', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-exchange-rates'] });
        },
    });
}
