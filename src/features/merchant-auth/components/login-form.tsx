'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMerchantLogin } from '../hooks/use-merchant-login';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/lib/utils';

export function MerchantLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const loginMutation = useMerchantLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-100/50">
      <div className="flex flex-col items-center mb-8">
        <div className="h-11 w-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 mb-3">
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Espace marchand</h2>
        <p className="text-sm text-slate-500 mt-1">Connectez-vous pour gérer vos clés API</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="contact@entreprise.com"
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm transition-all placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm transition-all placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          />
        </div>

        {loginMutation.isError && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5">
            <svg className="h-5 w-5 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="text-xs font-medium text-red-800">
              {getErrorMessage(loginMutation.error)}
            </div>
          </div>
        )}

        <Button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-500 transition-all flex items-center justify-center gap-2"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? 'Vérification...' : 'Se connecter'}
        </Button>

        <p className="text-center text-xs text-slate-500">
          Pas encore de compte ?{' '}
          <Link href="/portal/register" className="font-semibold text-blue-600 hover:text-blue-500">
            Créez votre compte marchand
          </Link>
        </p>
      </form>
    </div>
  );
}
