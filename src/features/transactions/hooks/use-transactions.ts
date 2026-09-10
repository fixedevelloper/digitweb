import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { transactionApi, TransactionFilters } from '../services/transaction-api';

export function useTransactions(page: number = 1, perPage: number = 20, filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: ['transactions', page, perPage, filters.dateFrom, filters.dateTo],
    queryFn: () => transactionApi.getTransactions(page, perPage, filters),
    placeholderData: keepPreviousData,
  });
}
