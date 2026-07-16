'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface Country {
    id: number;
    name: string;
    iso: string;
    iso3: string;
    currency: string;
    phonecode: number;
    status: boolean | string | number;
}

export function useCountries() {
    const queryClient = useQueryClient();

    // Récupération de la liste des corridors pays
    const query = useQuery<Country[]>({
        queryKey: ['admin-countries'],
        queryFn: async () => {
            const response = await apiClient.get<Country[]>('/admin/countries');
            return response.data;
        },
    });

    // Mutation pour sauvegarder les modifications (Création, activation/désactivation ou édition)
    const mutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: Partial<Country> | FormData }) => {

            // Si c'est un FormData (contenant potentiellement un fichier binaire)
            if (data instanceof FormData) {
                // Si l'id est fourni, on est en modification (Update).
                // Grâce à dataPayload.append('_method', 'PUT') ajouté côté formulaire, Laravel comprendra le PUT.
                const url = id > 0 ? `/admin/countries/${id}` : '/admin/countries';

                const response = await apiClient.post(url, data, {
                    headers: {
                        // On force le bon Content-Type pour le transport des fichiers
                        'Content-Type': 'multipart/form-data',
                    },
                });
                return response.data;
            }

            // Fallback classique en JSON si ce n'est pas un FormData (ex: clic rapide sur le bouton Actif/Suspendu)
            const response = await apiClient.put(`/admin/countries/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            // Force le rafraîchissement des pays ET des opérateurs
            queryClient.invalidateQueries({ queryKey: ['admin-countries'] });
            queryClient.invalidateQueries({ queryKey: ['admin-operators'] });
        },
    });

    return {
        ...query,
        updateCountry: mutation.mutate,
        isUpdating: mutation.isPending
    };
}