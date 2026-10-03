'use client';

import { useState } from 'react';
import { useFeeRules } from '@/features/transfers/hooks/use-transfer-config';
import { useCountries } from '@/features/countries/hooks/use-countries';
import { useProviders } from '@/features/transfers/hooks/use-transfer-config';
import { SERVICE_LABELS, TransferService } from '@/features/transfers/types';
import { formatMoney } from '@/features/transfers/status';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/lib/utils';

const input = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500';
const empty = { country_id: '', service: 'BANK_TRANSFER', provider_id: '', currency: 'XAF', min_amount: '0', max_amount: '', fixed_fee: '0', percent: '0' };

export default function FeeRulesPage() {
  const { data: rules, isLoading, create, update } = useFeeRules();
  const { data: countries } = useCountries();
  const { data: providers } = useProviders();
  const [form, setForm] = useState(empty);

  const countryName = (id: number | null) => (id ? countries?.find((c) => c.id === id)?.name ?? `#${id}` : 'Tous les pays');
  const providerName = (id: number | null) => (id ? providers?.find((p) => p.id === id)?.name ?? `#${id}` : 'Tous');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate({
      country_id: form.country_id ? Number(form.country_id) : null,
      service: form.service,
      provider_id: form.provider_id ? Number(form.provider_id) : null,
      currency: form.currency,
      min_amount: Number(form.min_amount),
      max_amount: form.max_amount ? Number(form.max_amount) : null,
      fixed_fee: Number(form.fixed_fee),
      percent_fee: Number(form.percent) / 100,
    }, { onSuccess: () => setForm(empty) });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Frais de transfert</h1>
        <p className="text-slate-500">
          Frais par pays, service, provider et tranche de montant (devise du wallet client). La règle la plus spécifique gagne ;
          sans règle, un virement bancaire est refusé.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left">Pays</th><th className="px-4 py-3 text-left">Service</th><th className="px-4 py-3 text-left">Provider</th>
              <th className="px-4 py-3 text-left">Tranche</th><th className="px-4 py-3 text-left">Frais</th><th className="px-4 py-3 text-right">Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && <tr><td className="px-4 py-4 text-slate-400" colSpan={6}>Chargement…</td></tr>}
            {rules?.map((r) => (
              <tr key={r.id} className={r.active ? '' : 'opacity-50'}>
                <td className="px-4 py-3">{countryName(r.country_id)}</td>
                <td className="px-4 py-3">{SERVICE_LABELS[r.service]}</td>
                <td className="px-4 py-3">{providerName(r.provider_id)}</td>
                <td className="px-4 py-3 text-xs">{formatMoney(r.min_amount)} → {r.max_amount ? formatMoney(r.max_amount) : '∞'} {r.currency}</td>
                <td className="px-4 py-3 text-xs">{formatMoney(r.fixed_fee, r.currency)} + {(Number(r.percent_fee) * 100).toFixed(2)} %</td>
                <td className="px-4 py-3 text-right">
                  <Button variant={r.active ? 'primary' : 'outline'} className="text-xs px-3 py-1" disabled={update.isPending}
                    onClick={() => update.mutate({ id: r.id, data: { active: !r.active } })}>
                    {r.active ? 'Active' : 'Inactive'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={submit} className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3 max-w-3xl">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">Nouvelle règle</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <select className={input} value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}>
            {(Object.keys(SERVICE_LABELS) as TransferService[]).map((s) => <option key={s} value={s}>{SERVICE_LABELS[s]}</option>)}
          </select>
          <select className={input} value={form.country_id} onChange={(e) => setForm({ ...form, country_id: e.target.value })}>
            <option value="">Tous les pays</option>
            {countries?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className={input} value={form.provider_id} onChange={(e) => setForm({ ...form, provider_id: e.target.value })}>
            <option value="">Tous les providers</option>
            {providers?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input className={input} maxLength={3} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} placeholder="Devise" required />
          <input className={input} type="number" min="0" step="any" value={form.min_amount} onChange={(e) => setForm({ ...form, min_amount: e.target.value })} placeholder="Montant min" />
          <input className={input} type="number" min="0" step="any" value={form.max_amount} onChange={(e) => setForm({ ...form, max_amount: e.target.value })} placeholder="Montant max (vide = ∞)" />
          <input className={input} type="number" min="0" step="any" value={form.fixed_fee} onChange={(e) => setForm({ ...form, fixed_fee: e.target.value })} placeholder="Frais fixe" />
          <input className={input} type="number" min="0" max="100" step="any" value={form.percent} onChange={(e) => setForm({ ...form, percent: e.target.value })} placeholder="% du montant" />
        </div>
        {create.isError && <p className="text-xs font-medium text-red-600">{getErrorMessage(create.error)}</p>}
        <Button type="submit" disabled={create.isPending}>Ajouter la règle</Button>
      </form>
    </div>
  );
}
