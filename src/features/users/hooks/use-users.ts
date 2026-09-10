'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface AppUser {
    id: number;
    name: string | null;
    phone: string;
    email: string | null;
    status: boolean | string | number;
    wallet?: {
        balance: number | string;
        currency: string;
    };
    created_at: string;
}

export function useUsers() {
    const queryClient = useQueryClient();

    const query = useQuery<AppUser[]>({
        queryKey: ['admin-users'],
        queryFn: async () => {
            const response = await apiClient.get<AppUser[]>('/admin/users');
            return response.data;
        },
    });

    const mutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: Partial<AppUser> }) => {
            const response = await apiClient.put(`/admin/users/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        },
    });

    const generatePasswordMutation = useMutation({
        mutationFn: async (id: number) => {
            const response = await apiClient.post<{ status: string; password: string; phone: string }>(
                `/admin/users/${id}/generate-password`
            );
            return response.data;
        },
    });

    return {
        ...query,
        updateUser: mutation.mutate,
        isUpdating: mutation.isPending,
        generatePassword: generatePasswordMutation.mutateAsync,
        isGeneratingPassword: generatePasswordMutation.isPending,
    };
}
