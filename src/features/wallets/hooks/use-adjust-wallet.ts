'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {apiClient} from "../../../lib/api-client";

interface AdjustWalletPayload {
    walletId: number;
    type: 'credit' | 'debit';
    amount: number;
    reason: string;
}

const adjustWalletApi = async (payload: AdjustWalletPayload) => {
    // Utilisation de l'apiClient pour centraliser la gestion des tokens, des headers et des timeouts
    const response = await apiClient.post(`/admin/wallets/${payload.walletId}/adjust`, {
        type: payload.type,
        amount: payload.amount,
        reason: payload.reason,
    });

    // Si ton apiClient ne rejette pas automatiquement les erreurs HTTP (comme Axios ou un wrapper custom le font en général) :
    if (response.status && response.status >= 400) {
        throw new Error(response.data?.message || "Échec de l'ajustement financier.");
    }

    return response.data;
};

export function useAdjustWallet() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: adjustWalletApi,
        onSuccess: () => {
            // Invalidation et rechargement de la clé de cache
            queryClient.invalidateQueries({ queryKey: ['admin-wallets'] });
        },
    });
}