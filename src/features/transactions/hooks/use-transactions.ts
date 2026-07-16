import { useQuery } from '@tanstack/react-query';
import { transactionApi } from '../services/transaction-api';

export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: transactionApi.getTransactions,
  });
}
