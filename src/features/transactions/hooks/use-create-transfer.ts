import { useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionApi } from '../services/transaction-api';
import { CreateTransferInput } from '../types';

export function useCreateTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTransferInput) => transactionApi.createTransfer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    }
  });
}
