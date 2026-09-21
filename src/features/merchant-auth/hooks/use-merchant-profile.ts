import { useQuery } from '@tanstack/react-query';
import { merchantAuthApi } from '../services/merchant-auth-api';

export function useMerchantProfile() {
  return useQuery({
    queryKey: ['merchant-profile'],
    queryFn: async () => {
      const response = await merchantAuthApi.getProfile();
      return response.merchant;
    },
  });
}
