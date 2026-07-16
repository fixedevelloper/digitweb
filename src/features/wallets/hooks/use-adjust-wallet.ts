'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

interface AdjustWalletPayload {
    walletId: number;
    type: 'credit' | 'debit';
    amount: number;
    reason: string;
}

const adjustWalletApi = async (payload: AdjustWalletPayload) => {
    const res = await fetch(`/api/admin/wallets/${payload.walletId}/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            type: payload.type,
            amount: payload.amount,
            reason: payload.reason,
        }),
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Échec de l'ajustement financier.");
    }
    return res.json();
};

export function useAdjustWallet() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: adjustWalletApi,
        onSuccess: () => {
            // Recharge automatique de la masse monétaire et des listes de portefeuilles
            queryClient.invalidateQueries({ queryKey: ['admin-wallets'] });
        },
    });
}