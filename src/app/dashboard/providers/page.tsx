'use client';

import { useRef, useState } from 'react';
import { useProviders } from '@/features/transfers/hooks/use-transfer-config';
import { Provider, SERVICE_LABELS, TransferService } from '@/features/transfers/types';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/lib/utils';

const EMPTY_FORM = { code: '', name: '', services: ['MOBILE_MONEY'] as TransferService[] };

const input = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500';

export default function ProvidersPage() {
  const { data: providers, isLoading, create, update, remove } = useProviders();
  const [form, setForm] = useState<{ code: string; name: string; services: TransferService[] }>(EMPTY_FORM);
  const [editing, setEditing] = useState<Provider | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const toggleService = (s: TransferService) =>
    setForm((f) => ({ ...f, services: f.services.includes(s) ? f.services.filter((x) => x !== s) : [...f.services, s] }));

  const reset = () => { setForm(EMPTY_FORM); setEditing(null); };

  const startEdit = (p: Provider) => {
    setEditing(p);
    // `services` null = tous les services ; on les coche tous pour l'édition.
    setForm({ code: p.code, name: p.name, services: p.services ?? (Object.keys(SERVICE_LABELS) as TransferService[]) });
    create.reset();
    update.reset();
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const confirmDelete = (p: Provider) => {
    if (!window.confirm(`Supprimer définitivement « ${p.name} » (${p.code}) ?\n\nLa suppression est refusée si le provider sert encore (corridors, règles de frais, transactions) : dans ce cas, désactivez-le.`)) return;
    remove.mutate(p.id, { onSuccess: () => { if (editing?.id === p.id) reset(); } });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editing) {
      const removed = (editing.services ?? (Object.keys(SERVICE_LABELS) as TransferService[])).filter((s) => !form.services.includes(s));
      if (removed.length && !window.confirm(`Retirer ${removed.map((s) => SERVICE_LABELS[s]).join(', ')} de ${editing.name} ? Les corridors concernés passeront en traitement manuel.`)) return;

      // Le code est immuable (référencé par la configuration et l'historique) : jamais envoyé.
      update.mutate({ id: editing.id, data: { name: form.name, services: form.services } }, { onSuccess: reset });
    } else {
      create.mutate({ ...form }, { onSuccess: reset });
    }
  };

  const saving = create.isPending || update.isPending;
  const formError = create.error ?? update.error;

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
            <tr><th className="px-5 py-3 text-left">Provider</th><th className="px-5 py-3 text-left">Services</th><th className="px-5 py-3 text-left">Exécution</th><th className="px-5 py-3 text-right">Actif</th><th className="px-5 py-3 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && <tr><td className="px-5 py-4 text-slate-400" colSpan={5}>Chargement…</td></tr>}
            {!isLoading && providers?.length === 0 && <tr><td className="px-5 py-4 text-slate-400" colSpan={5}>Aucun provider.</td></tr>}
            {providers?.map((p) => (
              <tr key={p.id} className={editing?.id === p.id ? 'bg-blue-50/60' : ''}>
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
                <td className="px-5 py-3 text-right whitespace-nowrap">
                  <button type="button" onClick={() => startEdit(p)} className="text-xs font-semibold text-blue-600 hover:text-blue-500 mr-3">Modifier</button>
                  <button type="button" onClick={() => confirmDelete(p)} disabled={remove.isPending} className="text-xs font-semibold text-red-600 hover:text-red-500 disabled:opacity-50">Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {remove.isError && <p className="px-5 py-3 text-xs font-medium text-red-600 border-t border-slate-100">{getErrorMessage(remove.error)}</p>}
      </div>

      <form ref={formRef} onSubmit={submit} className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 max-w-xl">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">{editing ? `Modifier « ${editing.name} »` : 'Nouveau provider'}</h2>
        <div className="grid grid-cols-2 gap-3">
          <input className={`${input} ${editing ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`} placeholder="code (ex: digitwave)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} readOnly={!!editing} title={editing ? 'Le code ne peut pas être modifié' : undefined} required />
          <input className={input} placeholder="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="flex gap-4 text-sm">
          {(Object.keys(SERVICE_LABELS) as TransferService[]).map((s) => (
            <label key={s} className="flex items-center gap-2">
              <input type="checkbox" checked={form.services.includes(s)} onChange={() => toggleService(s)} /> {SERVICE_LABELS[s]}
            </label>
          ))}
        </div>
        {editing && <p className="text-xs text-slate-500">Le code est figé : il relie ce provider à sa configuration et à l&apos;historique des transactions.</p>}
        {formError && <p className="text-xs font-medium text-red-600">{getErrorMessage(formError)}</p>}
        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>{editing ? 'Enregistrer' : 'Ajouter'}</Button>
          {editing && <Button type="button" variant="outline" onClick={reset}>Annuler</Button>}
        </div>
      </form>
    </div>
  );
}
