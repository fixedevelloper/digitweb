import { useMutation } from '@tanstack/react-query';
import { authApi } from '../services/auth-api';
import { LoginCredentials } from '../types';

export function useLogin() {
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data) => {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('admin_name', data.user.name);
      localStorage.setItem('admin_phone', data.user.phone);
      window.location.href = '/dashboard';
    }
  });
}
