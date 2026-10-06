'use client';

import { useRef, useState } from 'react';
import { useFeeRules } from '@/features/transfers/hooks/use-transfer-config';
import { useCountries } from '@/features/countries/hooks/use-countries';
import { useProviders } from '@/features/transfers/hooks/use-transfer-config';
import { FeeRule, SERVICE_LABELS, TransferService } from '@/features/transfers/types';
import { formatMoney } from '@/features/transfers/status';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/lib/utils';

const input = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500';
const empty = { country_id: '', service: 'BANK_TRANSFER', provider_id: '', currency: 'XAF', min_amount: '0', max_amount: '', fixed_fee: '0', percent: '0' };

export default function FeeRulesPage() {
  const { data: rules, isLoading, create, update, remove } = useFeeRules();
  const { data: countries } = useCountries();
  const { data: providers } = useProviders();
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<number | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const countryName = (id: number | null) => (id ? countries?.find((c) => c.id === id)?.name ?? `#${id}` : 'Tous les pays');
  const providerName = (id: number | null) => (id ? providers?.find((p) => p.id === id)?.name ?? `#${id}` : 'Tous');

  const reset = () => { setForm(empty); setEditingId(null); };

  const startEdit = (r: FeeRule) => {
    setEditingId(r.id);
    setForm({
      country_id: r.country_id ? String(r.country_id) : '',
      service: r.service,
      provider_id: r.provider_id ? String(r.provider_id) : '',
      currency: r.currency,
      min_amount: String(Number(r.min_amount)),
      max_amount: r.max_amount ? String(Number(r.max_amount)) : '',
      fixed_fee: String(Number(r.fixed_fee)),
      // 0.0100 → 1 (arrondi pour éviter 0.30000000000000004)
      percent: String(Number((Number(r.percent_fee) * 100).toFixed(4))),
    });
    create.reset();
    update.reset();
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const confirmDelete = (r: FeeRule) => {
    const label = `${SERVICE_LABELS[r.service]} · ${countryName(r.country_id)} · ${formatMoney(r.min_amount)} → ${r.max_amount ? formatMoney(r.max_amount) : '∞'} ${r.currency}`;
    if (!window.confirm(`Supprimer définitivement cette règle ?\n\n${label}\n\nLes transactions existantes gardent leurs frais. Pour la mettre de côté sans la perdre, désactivez-la plutôt.`)) return;
    remove.mutate(r.id, { onSuccess: () => { if (editingId === r.id) reset(); } });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      country_id: form.country_id ? Number(form.country_id) : null,
      service: form.service,
      provider_id: form.provider_id ? Number(form.provider_id) : null,
      currency: form.currency,
      min_amount: Number(form.min_amount),
      max_amount: form.max_amount ? Number(form.max_amount) : null,
      fixed_fee: Number(form.fixed_fee),
      percent_fee: Number(form.percent) / 100,
    };

    if (editingId !== null) {
      update.mutate({ id: editingId, data: payload }, { onSuccess: reset });
    } else {
      create.mutate(payload, { onSuccess: reset });
    }
  };

  const saving = create.isPending || update.isPending;
  const formError = create.error ?? update.error;

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
              <th className="px-4 py-3 text-left">Tranche</th><th className="px-4 py-3 text-left">Frais</th><th className="px-4 py-3 text-right">Active</th><th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && <tr><td className="px-4 py-4 text-slate-400" colSpan={7}>Chargement…</td></tr>}
            {!isLoading && rules?.length === 0 && <tr><td className="px-4 py-4 text-slate-400" colSpan={7}>Aucune règle de frais.</td></tr>}
            {rules?.map((r) => (
              <tr key={r.id} className={`${r.active ? '' : 'opacity-50'} ${editingId === r.id ? 'bg-blue-50/60' : ''}`}>
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
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button type="button" onClick={() => startEdit(r)} className="text-xs font-semibold text-blue-600 hover:text-blue-500 mr-3">Modifier</button>
                  <button type="button" onClick={() => confirmDelete(r)} disabled={remove.isPending} className="text-xs font-semibold text-red-600 hover:text-red-500 disabled:opacity-50">Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {remove.isError && <p className="px-4 py-3 text-xs font-medium text-red-600 border-t border-slate-100">{getErrorMessage(remove.error)}</p>}
      </div>

      <form ref={formRef} onSubmit={submit} className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3 max-w-3xl">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">{editingId !== null ? `Modifier la règle #${editingId}` : 'Nouvelle règle'}</h2>
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
        {formError && <p className="text-xs font-medium text-red-600">{getErrorMessage(formError)}</p>}
        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>{editingId !== null ? 'Enregistrer les modifications' : 'Ajouter la règle'}</Button>
          {editingId !== null && <Button type="button" variant="outline" onClick={reset}>Annuler</Button>}
        </div>
      </form>
    </div>
  );
}
