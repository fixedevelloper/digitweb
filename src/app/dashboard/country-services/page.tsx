'use client';

import { useEffect, useState } from 'react';
import { useBankFields, useCountryServices, useProviders } from '@/features/transfers/hooks/use-transfer-config';
import { useCountries } from '@/features/countries/hooks/use-countries';
import {
  BANK_FIELDS, CountryService, CountryServiceStatus, Provider, SERVICE_LABELS, TransferService,
} from '@/features/transfers/types';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/lib/utils';

const input = 'w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500';
const STATUS_LABELS: Record<CountryServiceStatus, string> = { ACTIVE: 'Actif', MANUAL: 'Manuel (agents)', INACTIVE: 'Désactivé' };

const toNum = (v: string) => (v === '' ? null : Number(v));

function ServiceRow({ row, providers, onSave, saving }: {
  row: CountryService;
  providers: Provider[];
  onSave: (id: number, data: Record<string, unknown>) => void;
  saving: boolean;
}) {
  const [f, setF] = useState({
    status: row.status,
    provider_id: row.provider_id ? String(row.provider_id) : '',
    min_amount: row.min_amount ?? '', max_amount: row.max_amount ?? '',
    daily_limit: row.daily_limit ?? '', monthly_limit: row.monthly_limit ?? '',
  });
  const eligible = providers.filter((p) => p.services === null || p.services.includes(row.service));
  const noProvider = f.status === 'ACTIVE' && !f.provider_id;

  return (
    <tr className="align-top">
      <td className="px-4 py-3"><div className="font-semibold">{row.country?.name}</div><div className="text-xs text-slate-400">{SERVICE_LABELS[row.service]}</div></td>
      <td className="px-4 py-3 space-y-1.5">
        <select className={input} value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as CountryServiceStatus })}>
          {(Object.keys(STATUS_LABELS) as CountryServiceStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <select className={input} value={f.provider_id} onChange={(e) => setF({ ...f, provider_id: e.target.value })} disabled={f.status !== 'ACTIVE'}>
          <option value="">Aucun provider</option>
          {eligible.map((p) => <option key={p.id} value={p.id}>{p.name}{p.active ? '' : ' (inactif)'}</option>)}
        </select>
        <div className={`text-[10px] font-semibold ${f.status === 'ACTIVE' && !noProvider ? 'text-emerald-600' : f.status === 'INACTIVE' ? 'text-slate-400' : 'text-orange-600'}`}>
          {f.status === 'INACTIVE' ? 'Service refusé' : f.status === 'ACTIVE' && !noProvider ? 'Automatique (si provider actif)' : 'Traitement manuel'}
        </div>
      </td>
      <td className="px-4 py-3 grid grid-cols-2 gap-1.5 min-w-[260px]">
        <input className={input} type="number" min="0" placeholder="Min" value={f.min_amount} onChange={(e) => setF({ ...f, min_amount: e.target.value })} />
        <input className={input} type="number" min="0" placeholder="Max" value={f.max_amount} onChange={(e) => setF({ ...f, max_amount: e.target.value })} />
        <input className={input} type="number" min="0" placeholder="Plafond / jour" value={f.daily_limit} onChange={(e) => setF({ ...f, daily_limit: e.target.value })} />
        <input className={input} type="number" min="0" placeholder="Plafond / mois" value={f.monthly_limit} onChange={(e) => setF({ ...f, monthly_limit: e.target.value })} />
      </td>
      <td className="px-4 py-3 text-right">
        <Button className="text-xs px-3 py-1.5" disabled={saving} onClick={() => onSave(row.id, {
          status: f.status,
          provider_id: f.status === 'ACTIVE' && f.provider_id ? Number(f.provider_id) : null,
          min_amount: toNum(String(f.min_amount)), max_amount: toNum(String(f.max_amount)),
          daily_limit: toNum(String(f.daily_limit)), monthly_limit: toNum(String(f.monthly_limit)),
        })}>Enregistrer</Button>
      </td>
    </tr>
  );
}

function BankFieldsEditor() {
  const { data: countries } = useCountries();
  const [countryId, setCountryId] = useState<number | null>(null);
  const { data, save, isLoading } = useBankFields(countryId);
  const [required, setRequired] = useState<string[]>([]);

  useEffect(() => { if (data) setRequired(data.required_fields); }, [data]);

  const toggle = (field: string) => setRequired((r) => (r.includes(field) ? r.filter((x) => x !== field) : [...r, field]));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">Champs bancaires obligatoires</h2>
        <p className="text-xs text-slate-500">Ex : IBAN + BIC pour l&apos;Europe, N° de compte + code banque pour le Cameroun. Le nom du bénéficiaire est toujours requis.</p>
      </div>
      <select className={`${input} max-w-xs`} value={countryId ?? ''} onChange={(e) => setCountryId(e.target.value ? Number(e.target.value) : null)}>
        <option value="">Choisir un pays…</option>
        {countries?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      {countryId !== null && (
        <>
          {isLoading ? <p className="text-xs text-slate-400">Chargement…</p> : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              {BANK_FIELDS.map((field) => (
                <label key={field} className="flex items-center gap-2">
                  <input type="checkbox" disabled={field === 'full_name'} checked={field === 'full_name' || required.includes(field)} onChange={() => toggle(field)} />
                  <span className="font-mono">{field}</span>
                </label>
              ))}
            </div>
          )}
          {save.isError && <p className="text-xs font-medium text-red-600">{getErrorMessage(save.error)}</p>}
          {save.isSuccess && <p className="text-xs font-medium text-emerald-600">Enregistré.</p>}
          <Button disabled={save.isPending || isLoading} onClick={() =>
            save.mutate(Object.fromEntries(BANK_FIELDS.map((f) => [f, f === 'full_name' || required.includes(f)])))}>
            Enregistrer les champs
          </Button>
        </>
      )}
    </div>
  );
}

export default function CountryServicesPage() {
  const { data: rows, isLoading, create, update } = useCountryServices();
  const { data: providers = [] } = useProviders();
  const { data: countries } = useCountries();
  const [form, setForm] = useState({ country_id: '', service: 'BANK_TRANSFER', status: 'MANUAL' });
  const [flash, setFlash] = useState<string | null>(null);

  const save = (id: number, data: Record<string, unknown>) =>
    update.mutate({ id, data }, { onSuccess: () => setFlash('Configuration enregistrée.') });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Services par pays</h1>
        <p className="text-slate-500">
          Active Mobile Money et virement bancaire par pays. <b>Actif + provider actif</b> = automatique ; <b>Manuel</b> ou provider absent = agents ;
          <b> Désactivé</b> = refusé. Un pays sans configuration Mobile Money reste sur Digitwave ; sans configuration bancaire, le virement est refusé.
        </p>
      </div>

      {flash && <div className="p-3 rounded-xl bg-emerald-50 text-xs font-medium text-emerald-800">{flash}</div>}
      {update.isError && <div className="p-3 rounded-xl bg-red-50 text-xs font-medium text-red-700">{getErrorMessage(update.error)}</div>}

      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr><th className="px-4 py-3 text-left">Pays / service</th><th className="px-4 py-3 text-left">Statut & provider</th><th className="px-4 py-3 text-left">Bornes et plafonds (devise du wallet)</th><th /></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && <tr><td className="px-4 py-4 text-slate-400" colSpan={4}>Chargement…</td></tr>}
            {rows?.length === 0 && <tr><td className="px-4 py-4 text-slate-400" colSpan={4}>Aucun service configuré.</td></tr>}
            {rows?.map((r) => (
              <ServiceRow key={`${r.id}-${r.status}-${r.provider_id}`} row={r} providers={providers} onSave={save} saving={update.isPending} />
            ))}
          </tbody>
        </table>
      </div>

      <form
        className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3 max-w-2xl"
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate({ country_id: Number(form.country_id), service: form.service, status: form.status },
            { onSuccess: () => setFlash('Service ajouté.') });
        }}
      >
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">Activer un service pour un pays</h2>
        <div className="grid grid-cols-3 gap-3">
          <select className={input} value={form.country_id} onChange={(e) => setForm({ ...form, country_id: e.target.value })} required>
            <option value="">Pays…</option>
            {countries?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className={input} value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}>
            {(Object.keys(SERVICE_LABELS) as TransferService[]).map((s) => <option key={s} value={s}>{SERVICE_LABELS[s]}</option>)}
          </select>
          <select className={input} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {(Object.keys(STATUS_LABELS) as CountryServiceStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
        </div>
        {create.isError && <p className="text-xs font-medium text-red-600">{getErrorMessage(create.error)}</p>}
        <Button type="submit" disabled={create.isPending}>Ajouter</Button>
      </form>

      <BankFieldsEditor />
    </div>
  );
}
