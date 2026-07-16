'use client';

import { useState } from 'react';
import { useLogin } from '../hooks/use-login';
import { Button } from '@/components/ui/button';

export function AuthForm() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ phone, password });
  };

  return (
      <div className="w-full max-w-md p-8 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-100/50">
        {/* Logo & En-tête */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-11 w-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 mb-3">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Bienvenue sur DigitGateway</h2>
          <p className="text-sm text-slate-500 mt-1">Connectez-vous avec votre numéro de téléphone</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Champ Téléphone */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Numéro de téléphone
            </label>
            <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium select-none">
              📱
            </span>
              <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                  placeholder="Ex: 677000000"
                  className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-sm transition-all placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              />
            </div>
          </div>

          {/* Champ Mot de passe */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Mot de passe
              </label>
              <a href="#" className="text-xs font-medium text-blue-600 hover:text-blue-500 transition-colors">
                Oublié ?
              </a>
            </div>
            <div className="relative">
              <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm transition-all placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 pr-10"
              />
              {/* Toggle Visibilité */}
              <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                )}
              </button>
            </div>
          </div>

          {/* Alerte Erreur */}
          {loginMutation.isError && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5">
                <svg className="h-5 w-5 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="text-xs font-medium text-red-800">
                  Téléphone ou mot de passe incorrect. Impossible de synchroniser la clé d'accès.
                </div>
              </div>
          )}

          {/* Bouton de Soumission */}
          <Button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-500 transition-all flex items-center justify-center gap-2"
              disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? 'Vérification...' : 'Ouvrir ma session'}
          </Button>
        </form>
      </div>
  );
}