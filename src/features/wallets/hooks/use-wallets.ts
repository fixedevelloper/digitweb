'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface Wallet {
    id: number;
    user_id: number;
    balance: number | string; // Prise en compte du format chaîne renvoyé par le type decimal SQL
    currency: string;
    created_at: string;
    user?: {
        name: string | null;
        phone: string;
        role: string;
    };
}

const fetchWallets = async (): Promise<Wallet[]> => {
    // Utilisation d'apiClient avec le préfixe /admin comme défini dans Laravel routes/api.php
    const response = await apiClient.get<Wallet[]>('/admin/wallets');
    return response.data;
};

export function useWallets() {
    const query = useQuery<Wallet[]>({
        queryKey: ['admin-wallets'],
        queryFn: fetchWallets,
    });

    // Calcul automatique et sécurisé de la réserve globale du système (Masse monétaire)
    const totalSystemLiquidity = query.data?.reduce((acc, wallet) => {
        const balanceNum = typeof wallet.balance === 'string' ? parseFloat(wallet.balance) : wallet.balance;
        return acc + (isNaN(balanceNum) ? 0 : balanceNum);
    }, 0) || 0;

    return {
        ...query,
        totalSystemLiquidity
    };
}