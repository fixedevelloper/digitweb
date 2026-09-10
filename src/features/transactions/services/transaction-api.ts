import { apiClient } from '@/lib/api-client';
import { Transaction, CreateTransferInput, PaginatedResponse } from '../types';

export interface TransactionFilters {
  dateFrom?: string; // format YYYY-MM-DD
  dateTo?: string;   // format YYYY-MM-DD
}

export const transactionApi = {
  /**
   * Récupère l'historique des flux et transactions du réseau, page par page,
   * avec un filtre optionnel par plage de dates.
   */
  getTransactions: async (
      page: number = 1,
      perPage: number = 20,
      filters: TransactionFilters = {}
  ): Promise<PaginatedResponse<Transaction>> => {
    const response = await apiClient.get<PaginatedResponse<Transaction>>('/admin/transactions', {
      params: {
        page,
        per_page: perPage,
        date_from: filters.dateFrom || undefined,
        date_to: filters.dateTo || undefined,
      },
    });
    return response.data;
  },

  /**
   * Initie un flux de transfert vers un opérateur tiers (MTN, Orange, Airtel, etc.)
   */
  createTransfer: async (data: CreateTransferInput): Promise<Transaction> => {
    // Correspond à la structure validée par le formulaire :
    // { recipient_name, recipient_phone, recipient_operator, amount_sent, fees }
    const response = await apiClient.post<Transaction>('/admin/transactions/transfer', data);
    return response.data;
  },

  /**
   * Télécharge l'export (Excel ou PDF) du grand livre filtré. La requête passe
   * par apiClient (et non un simple lien) pour conserver le header Bearer requis
   * par Sanctum ; le fichier est ensuite déclenché en téléchargement côté navigateur.
   */
  exportTransactions: async (format: 'excel' | 'pdf', filters: TransactionFilters = {}): Promise<void> => {
    const response = await apiClient.get(`/admin/transactions/export/${format}`, {
      params: {
        date_from: filters.dateFrom || undefined,
        date_to: filters.dateTo || undefined,
      },
      responseType: 'blob',
    });

    const disposition = response.headers['content-disposition'] as string | undefined;
    const match = disposition?.match(/filename="?([^"]+)"?/);
    const filename = match?.[1] || `transactions.${format === 'excel' ? 'xlsx' : 'pdf'}`;

    const url = window.URL.createObjectURL(response.data as Blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
};