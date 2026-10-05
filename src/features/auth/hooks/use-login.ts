import { useMutation } from '@tanstack/react-query';
import { authApi } from '../services/auth-api';
import { AuthResponse, LoginCredentials } from '../types';

/** Mémorise le nom affiché (le jeton est dans un cookie HttpOnly) et ouvre la console. */
export function startAdminSession(data: AuthResponse) {
  localStorage.setItem('admin_name', data.user.name);
  localStorage.setItem('admin_phone', data.user.phone);
  window.location.href = '/dashboard';
}

export function useLogin() {
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data) => {
      // 2FA activée : pas de token, le formulaire affiche l'étape de vérification.
      if (data.status === 'two_factor_required') return;
      startAdminSession(data);
    }
  });
}
