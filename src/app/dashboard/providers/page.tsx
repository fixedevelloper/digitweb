'use client';

import { useState } from 'react';
import { useProviders } from '@/features/transfers/hooks/use-transfer-config';
import { SERVICE_LABELS, TransferService } from '@/features/transfers/types';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/lib/utils';

const input = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500';

export default function ProvidersPage() {
  const { data: providers, isLoading, create, update } = useProviders();
  const [form, setForm] = useState<{ code: string; name: string; services: TransferService[] }>({ code: '', name: '', services: ['MOBILE_MONEY'] });

  const toggleService = (s: TransferService) =>
    setForm((f) => ({ ...f, services: f.services.includes(s) ? f.services.filter((x) => x !== s) : [...f.services, s] }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate({ ...form }, { onSuccess: () => setForm({ code: '', name: '', services: ['MOBILE_MONEY'] }) });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Providers</h1>
        <p className="text-slate-500">
          Désactiver un provider envoie immédiatement ses corridors en traitement manuel. Un provider « non implémenté »
          n&apos;est jamais appelé : ses transferts passent par les agents.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr><th className="px-5 py-3 text-left">Provider</th><th className="px-5 py-3 text-left">Services</th><th className="px-5 py-3 text-left">Exécution</th><th className="px-5 py-3 text-right">Actif</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && <tr><td className="px-5 py-4 text-slate-400" colSpan={4}>Chargement…</td></tr>}
            {providers?.map((p) => (
              <tr key={p.id}>
                <td className="px-5 py-3"><div className="font-semibold">{p.name}</div><div className="font-mono text-xs text-slate-400">{p.code}</div></td>
                <td className="px-5 py-3 text-xs">{(p.services ?? Object.keys(SERVICE_LABELS) as TransferService[]).map((s) => SERVICE_LABELS[s]).join(', ')}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-semibold ${p.implemented ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {p.implemented ? 'Implémenté' : 'Non implémenté → manuel'}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <Button
                    variant={p.active ? 'primary' : 'outline'}
                    className="text-xs px-3 py-1"
                    disabled={update.isPending}
                    onClick={() => {
                      if (p.active && !confirm(`Désactiver ${p.name} ? Ses transferts passeront en traitement manuel.`)) return;
                      update.mutate({ id: p.id, data: { active: !p.active } });
                    }}
                  >
                    {p.active ? 'Actif' : 'Inactif'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={submit} className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 max-w-xl">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">Nouveau provider</h2>
        <div className="grid grid-cols-2 gap-3">
          <input className={input} placeholder="code (ex: digitwave)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
          <input className={input} placeholder="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="flex gap-4 text-sm">
          {(Object.keys(SERVICE_LABELS) as TransferService[]).map((s) => (
            <label key={s} className="flex items-center gap-2">
              <input type="checkbox" checked={form.services.includes(s)} onChange={() => toggleService(s)} /> {SERVICE_LABELS[s]}
            </label>
          ))}
        </div>
        {create.isError && <p className="text-xs font-medium text-red-600">{getErrorMessage(create.error)}</p>}
        <Button type="submit" disabled={create.isPending}>Ajouter</Button>
      </form>
    </div>
  );
}
