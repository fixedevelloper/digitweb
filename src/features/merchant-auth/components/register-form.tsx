'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMerchantRegister } from '../hooks/use-merchant-register';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/lib/utils';

export function MerchantRegisterForm() {
  const [companyName, setCompanyName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const registerMutation = useMerchantRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate({
      company_name: companyName,
      name,
      email,
      phone,
      password,
      password_confirmation: passwordConfirmation,
    });
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-100/50">
      <div className="flex flex-col items-center mb-8">
        <div className="h-11 w-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 mb-3">
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Créer un compte marchand</h2>
        <p className="text-sm text-slate-500 mt-1 text-center">
          Intégrez la passerelle DigitaGateway à vos systèmes. Vous démarrez en environnement sandbox.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">Entreprise</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            placeholder="Ex: Digitwave SARL"
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm transition-all placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">Nom du contact</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Ex: Jean Mballa"
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm transition-all placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
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
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">Téléphone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="677000000"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm transition-all placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="8 caractères min."
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm transition-all placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">Confirmation</label>
            <input
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm transition-all placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            />
          </div>
        </div>

        {registerMutation.isError && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5">
            <svg className="h-5 w-5 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="text-xs font-medium text-red-800">
              {getErrorMessage(registerMutation.error)}
            </div>
          </div>
        )}

        <Button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-500 transition-all flex items-center justify-center gap-2"
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? 'Création du compte...' : 'Créer mon compte marchand'}
        </Button>

        <p className="text-center text-xs text-slate-500">
          Déjà un compte ?{' '}
          <Link href="/portal/login" className="font-semibold text-blue-600 hover:text-blue-500">
            Connectez-vous
          </Link>
        </p>
      </form>
    </div>
  );
}
