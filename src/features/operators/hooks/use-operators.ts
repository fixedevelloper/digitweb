'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Operator } from '../../transactions/types'; // Assure-toi que ce type contient bien 'status', 'fixed_fee', etc.

export function useOperators() {
    const queryClient = useQueryClient();

    // 1. Récupération des opérateurs via apiClient
    const query = useQuery<Operator[]>({
        queryKey: ['admin-operators'],
        queryFn: async () => {
            const response = await apiClient.get<Operator[]>('/admin/operators');
            return response.data;
        },
    });

    // 2. Mutation unifiée pour la mise à jour (Statut, Frais, Regex)
    const mutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: Partial<Operator> }) => {
            const response = await apiClient.put<Operator>(`/admin/operators/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            // Invalidation du cache pour rafraîchir instantanément la vue et la page
            queryClient.invalidateQueries({ queryKey: ['admin-operators'] });
        },
    });

    return {
        ...query,
        updateOperator: mutation.mutate,
        isUpdating: mutation.isPending
    };
}