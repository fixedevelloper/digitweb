'use client';

import { useState } from 'react';
import { useAgentLogin } from '@/features/agent/hooks/use-agent-auth';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/lib/utils';

const input = 'w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10';

export default function AgentLoginPage() {
  const [form, setForm] = useState({ phone: '', password: '' });
  const login = useAgentLogin();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form
        onSubmit={(e) => { e.preventDefault(); login.mutate(form); }}
        className="w-full max-w-md p-8 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-100/50 space-y-5"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Console agent</h2>
          <p className="text-sm text-slate-500 mt-1">Traitement des transferts manuels</p>
        </div>
        <input className={input} placeholder="Téléphone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        <input className={input} type="password" placeholder="Mot de passe" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        {login.isError && <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-medium text-red-800">{getErrorMessage(login.error)}</div>}
        <Button type="submit" className="w-full py-2.5 rounded-xl" disabled={login.isPending}>{login.isPending ? 'Vérification...' : 'Se connecter'}</Button>
      </form>
    </div>
  );
}
