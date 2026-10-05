import { useMutation } from '@tanstack/react-query';
import { merchantAuthApi } from '../services/merchant-auth-api';
import { AuthResponse, LoginInput } from '../types';

/** Enregistre la session marchand et ouvre le portail. */
export function startMerchantSession(data: AuthResponse) {
  localStorage.setItem('merchant_company_name', data.merchant.company_name);
  localStorage.setItem('merchant_name', data.merchant.name);
  window.location.href = '/portal/dashboard';
}

export function useMerchantLogin() {
  return useMutation({
    mutationFn: (data: LoginInput) => merchantAuthApi.login(data),
    onSuccess: (data) => {
      // 2FA activée : pas de token, le formulaire affiche l'étape de vérification.
      if (data.status === 'two_factor_required') return;
      startMerchantSession(data);
    },
  });
}
