import { useMutation } from '@tanstack/react-query';
import { merchantAuthApi } from '../services/merchant-auth-api';
import { LoginInput } from '../types';

export function useMerchantLogin() {
  return useMutation({
    mutationFn: (data: LoginInput) => merchantAuthApi.login(data),
    onSuccess: (data) => {
      localStorage.setItem('merchant_auth_token', data.token);
      localStorage.setItem('merchant_company_name', data.merchant.company_name);
      localStorage.setItem('merchant_name', data.merchant.name);
      window.location.href = '/portal/dashboard';
    },
  });
}
