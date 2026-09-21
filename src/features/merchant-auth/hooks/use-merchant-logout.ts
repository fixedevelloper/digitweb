import { useRouter } from 'next/navigation';
import { merchantAuthApi } from '../services/merchant-auth-api';

export function useMerchantLogout() {
  const router = useRouter();

  return async () => {
    try {
      await merchantAuthApi.logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion marchand :', error);
    } finally {
      localStorage.removeItem('merchant_auth_token');
      localStorage.removeItem('merchant_company_name');
      localStorage.removeItem('merchant_name');
      router.push('/portal/login');
    }
  };
}
