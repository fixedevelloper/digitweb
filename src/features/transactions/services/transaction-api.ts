import { apiClient } from '@/lib/api-client';
import { Transaction, CreateTransferInput } from '../types';

export const transactionApi = {
  /**
   * Récupère l'historique complet des flux et transactions du réseau
   */
  getTransactions: async (): Promise<Transaction[]> => {
    // Si ton backend Laravel utilise la ressource standard
    const response = await apiClient.get<Transaction[]>('/admin/transactions');
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
  }
};