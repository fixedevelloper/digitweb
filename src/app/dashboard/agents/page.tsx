'use client';

import { useState } from 'react';
import { useAgents } from '@/features/transfers/hooks/use-transfer-config';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/lib/utils';

const input = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500';
const empty = { name: '', phone: '', email: '', password: '' };

export default function AgentsPage() {
  const { data: agents, isLoading, create, update } = useAgents();
  const [form, setForm] = useState(empty);
  const [notice, setNotice] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate({ ...form, email: form.email || null }, { onSuccess: () => setForm(empty) });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Agents</h1>
        <p className="text-slate-500">Comptes qui traitent les transferts manuels (console /agent). Suspendre un agent coupe ses sessions.</p>
      </div>

      {notice && <div className="p-3 rounded-xl bg-amber-50 text-xs font-medium text-amber-800">{notice}</div>}

      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr><th className="px-5 py-3 text-left">Agent</th><th className="px-5 py-3 text-left">Téléphone</th><th className="px-5 py-3 text-right">Statut</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && <tr><td className="px-5 py-4 text-slate-400" colSpan={3}>Chargement…</td></tr>}
            {agents?.length === 0 && <tr><td className="px-5 py-4 text-slate-400" colSpan={3}>Aucun agent.</td></tr>}
            {agents?.map((a) => (
              <tr key={a.id}>
                <td className="px-5 py-3 font-semibold">{a.name}</td>
                <td className="px-5 py-3 font-mono text-xs">{a.phone}</td>
                <td className="px-5 py-3 text-right">
                  <Button variant={a.status ? 'primary' : 'outline'} className="text-xs px-3 py-1" disabled={update.isPending}
                    onClick={() => update.mutate({ id: a.id, data: { status: !a.status } }, {
                      onSuccess: (res: { released_transfers?: number; processing_transfers?: number }) => {
                        if (a.status) {
                          setNotice(`Agent suspendu : ${res.released_transfers ?? 0} transfert(s) remis dans la file` +
                            (res.processing_transfers ? `, ${res.processing_transfers} en traitement à reprendre depuis « Transferts manuels ».` : '.'));
                        }
                      },
                    })}>
                    {a.status ? 'Actif' : 'Suspendu'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={submit} className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3 max-w-xl">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">Nouvel agent</h2>
        <div className="grid grid-cols-2 gap-3">
          <input className={input} placeholder="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className={input} placeholder="Téléphone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          <input className={input} type="email" placeholder="Email (optionnel)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className={input} type="password" placeholder="Mot de passe (8+)" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </div>
        {create.isError && <p className="text-xs font-medium text-red-600">{getErrorMessage(create.error)}</p>}
        <Button type="submit" disabled={create.isPending}>Créer l&apos;agent</Button>
      </form>
    </div>
  );
}
