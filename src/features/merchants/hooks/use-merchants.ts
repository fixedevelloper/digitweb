'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface Merchant {
    id: number;
    name: string;
    email: string;
    phone: string;
    company_name: string;
    environment: 'sandbox' | 'production';
    status: boolean | string | number;
    wallet?: {
        balance: number | string;
        currency: string;
    };
    created_at: string;
}

export function useMerchants() {
    const queryClient = useQueryClient();

    const query = useQuery<Merchant[]>({
        queryKey: ['admin-merchants'],
        queryFn: async () => {
            const response = await apiClient.get<Merchant[]>('/admin/merchants');
            return response.data;
        },
    });

    const mutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: Partial<Merchant> }) => {
            const response = await apiClient.put(`/admin/merchants/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-merchants'] });
        },
    });

    return {
        ...query,
        updateMerchant: mutation.mutate,
        isUpdating: mutation.isPending
    };
}