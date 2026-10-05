import { useMutation } from '@tanstack/react-query';
import { merchantAuthApi } from '../services/merchant-auth-api';
import { RegisterInput } from '../types';

export function useMerchantRegister() {
  return useMutation({
    mutationFn: (data: RegisterInput) => merchantAuthApi.register(data),
    onSuccess: (data) => {
          localStorage.setItem('merchant_company_name', data.merchant.company_name);
      localStorage.setItem('merchant_name', data.merchant.name);
      window.location.href = '/portal/dashboard';
    },
  });
}
