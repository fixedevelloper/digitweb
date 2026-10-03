'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Currency, useCurrencies } from '@/features/currencies/hooks/use-currencies';
import { getErrorMessage } from '@/lib/utils';

const input = 'w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500';

function CurrencyRow({ row, onSave, onDelete, busy }: {
  row: Currency;
  onSave: (c: Pick<Currency, 'id' | 'name' | 'symbol'>) => void;
  onDelete: (c: Currency) => void;
  busy: boolean;
}) {
  const [f, setF] = useState({ name: row.name, symbol: row.symbol });
  const dirty = f.name !== row.name || f.symbol !== row.symbol;

  return (
    <tr>
      <td className="px-4 py-3 font-mono font-bold text-slate-700">{row.code}</td>
      <td className="px-4 py-3"><input className={input} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></td>
      <td className="px-4 py-3 w-32"><input className={input} value={f.symbol} maxLength={10} onChange={(e) => setF({ ...f, symbol: e.target.value })} /></td>
      <td className="px-4 py-3 text-right whitespace-nowrap">
        <Button className="text-xs px-3 py-1.5" disabled={busy || !dirty || !f.name || !f.symbol} onClick={() => onSave({ id: row.id, ...f })}>Enregistrer</Button>
        <button type="button" disabled={busy} onClick={() => onDelete(row)}
          className="ml-2 text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 font-semibold hover:bg-red-50 disabled:opacity-50">
          Supprimer
        </button>
      </td>
    </tr>
  );
}

export default function CurrenciesPage() {
  const { data: rows, isLoading, create, update, remove } = useCurrencies();
  const [form, setForm] = useState({ code: '', name: '', symbol: '' });
  const [flash, setFlash] = useState<string | null>(null);
  const busy = update.isPending || remove.isPending;
  const error = update.error ?? remove.error;

  const del = (c: Currency) => {
    if (!window.confirm(`Supprimer la devise ${c.code} (${c.name}) ?`)) return;
    remove.mutate(c.id, { onSuccess: () => setFlash('Devise supprimée.') });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Devises</h1>
        <p className="text-slate-500">Devises proposées pour les opérateurs et les taux de change. Le code ne peut pas être modifié ; une devise utilisée ne peut pas être supprimée.</p>
      </div>

      {flash && <div className="p-3 rounded-xl bg-emerald-50 text-xs font-medium text-emerald-800">{flash}</div>}
      {error && <div className="p-3 rounded-xl bg-red-50 text-xs font-medium text-red-700">{getErrorMessage(error)}</div>}

      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr><th className="px-4 py-3 text-left">Code</th><th className="px-4 py-3 text-left">Nom</th><th className="px-4 py-3 text-left">Symbole</th><th /></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && <tr><td className="px-4 py-4 text-slate-400" colSpan={4}>Chargement…</td></tr>}
            {rows?.length === 0 && <tr><td className="px-4 py-4 text-slate-400" colSpan={4}>Aucune devise.</td></tr>}
            {rows?.map((r) => (
              <CurrencyRow key={`${r.id}-${r.name}-${r.symbol}`} row={r} busy={busy} onDelete={del}
                onSave={(c) => update.mutate(c, { onSuccess: () => setFlash('Devise enregistrée.') })} />
            ))}
          </tbody>
        </table>
      </div>

      <form
        className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3 max-w-2xl"
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate(form, { onSuccess: () => { setFlash('Devise ajoutée.'); setForm({ code: '', name: '', symbol: '' }); } });
        }}
      >
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">Ajouter une devise</h2>
        <div className="grid grid-cols-3 gap-3">
          <input className={input} placeholder="Code (ex: GHS)" maxLength={3} required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
          <input className={input} placeholder="Nom" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className={input} placeholder="Symbole" maxLength={10} required value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })} />
        </div>
        {create.isError && <p className="text-xs font-medium text-red-600">{getErrorMessage(create.error)}</p>}
        <Button type="submit" disabled={create.isPending}>Ajouter</Button>
      </form>
    </div>
  );
}
