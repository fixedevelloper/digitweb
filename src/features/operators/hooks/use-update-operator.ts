// features/operators/hooks/use-update-operator.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client'; // Ton instance Axios / Fetch

export function useUpdateOperator() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id?: number; data: FormData | Record<string, unknown> }) => {
            // Changement simple (ex: bouton « En ligne / Coupé ») : PUT JSON. Un POST sans `_method=PUT`
            // n'est pas une route de mise à jour et renvoyait 405 (le kill-switch ne fonctionnait pas).
            if (id && !(data instanceof FormData)) {
                return (await apiClient.put(`/admin/operators/${id}`, data)).data;
            }

            // Content-Type multipart obligatoire, en création comme en mise à jour : apiClient
            // est en 'application/json' par défaut, et axios convertit alors le FormData en
            // JSON — le fichier logo y devient {} et Laravel le rejette (règle 'mimes').
            const config = { headers: { 'Content-Type': 'multipart/form-data' } };

            // Si l'ID est absent, égal à 0 ou non défini -> C'est une création (POST)
            if (!id || id === 0) {
                const response = await apiClient.post('/admin/operators', data, config);
                return response.data;
            }

            // Sinon -> C'est une mise à jour (POST avec spoofing _method=PUT déjà présent dans ton FormData)
            const response = await apiClient.post(`/admin/operators/${id}`, data, config);
            return response.data;
        },
        onSuccess: () => {
            // Invalider le cache pour forcer le hook 'useOperators' à recharger la liste
            queryClient.invalidateQueries({ queryKey: ['admin-operators'] });

        },
    });
}