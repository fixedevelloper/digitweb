'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/lib/utils';

interface Pricing {
  fixed_fee: number;
  percent_fee: number; // 0.01 = 1 %
  rate: number | null;
  active: boolean;
}

interface Row {
  operator_id: number;
  operator: string;
  code: string;
  currency: string;
  operator_status: boolean;
  country: string | null;
  iso: string | null;
  pricing: Pricing | null;
}

interface Response {
  wallet_currency: string | null;
  data: Row[];
}

const input = 'w-24 px-2 py-1 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-blue-500';

/** Frais, pourcentage et taux (saisis à la main) d'un marchand par pays et opérateur. Le taux global ne s'applique pas aux marchands. */
export function MerchantPricingPanel({ merchantId, companyName, onClose }: { merchantId: number; companyName: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const queryKey = ['admin-merchant-pricing', merchantId];
  const [edit, setEdit] = useState<{ operatorId: number; fixed: string; percent: string; rate: string; active: boolean } | null>(null);

  const { data, isLoading, isError } = useQuery<Response>({
    queryKey,
    queryFn: async () => (await apiClient.get(`/admin/merchants/${merchantId}/pricing`)).data,
  });

  const save = useMutation({
    mutationFn: async (e: NonNullable<typeof edit>) =>
      apiClient.put(`/admin/merchants/${merchantId}/pricing/${e.operatorId}`, {
        fixed_fee: Number(e.fixed || 0),
        percent_fee: Number(e.percent || 0) / 100,
        rate: e.rate.trim() === '' ? null : Number(e.rate),
        active: e.active,
      }),
    onSuccess: () => { setEdit(null); queryClient.invalidateQueries({ queryKey }); },
  });

  const remove = useMutation({
    mutationFn: async (operatorId: number) => apiClient.delete(`/admin/merchants/${merchantId}/pricing/${operatorId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const startEdit = (row: Row) => setEdit({
    operatorId: row.operator_id,
    fixed: String(row.pricing?.fixed_fee ?? ''),
    percent: row.pricing ? String(+(row.pricing.percent_fee * 100).toFixed(4)) : '',
    rate: row.pricing?.rate != null ? String(row.pricing.rate) : '',
    active: row.pricing?.active ?? true,
  });

  const walletCurrency = data?.wallet_currency;
  const error = save.error ?? remove.error;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end" onClick={onClose}>
      <div className="w-full max-w-5xl bg-white h-full overflow-y-auto p-6 space-y-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-900">Tarifs · {companyName}</h2>
            <p className="text-xs text-slate-500">
              Frais (devise de l&apos;opérateur) et taux propres à ce marchand, par pays et opérateur. Sans tarif actif, le marchand ne peut pas opérer sur l&apos;opérateur.
              Taux = unités de {walletCurrency ?? 'devise du wallet'} pour 1 unité de la devise de l&apos;opérateur (requis si les devises diffèrent).
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl leading-none" aria-label="Fermer">×</button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl px-4 py-3">{getErrorMessage(error)}</div>}
        {isLoading && <div className="text-sm text-slate-500 animate-pulse">Chargement…</div>}
        {isError && <div className="text-sm font-bold text-red-600">Impossible de charger les tarifs.</div>}

        {data && (
          <div className="border border-slate-200 rounded-2xl overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Pays</th>
                  <th className="py-2.5 px-4">Opérateur</th>
                  <th className="py-2.5 px-4">Frais fixe</th>
                  <th className="py-2.5 px-4">Frais %</th>
                  <th className="py-2.5 px-4">Taux</th>
                  <th className="py-2.5 px-4">Statut</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {data.data.map((row) => {
                  const editing = edit?.operatorId === row.operator_id;
                  const needsRate = !!walletCurrency && row.currency !== walletCurrency;
                  return (
                    <tr key={row.operator_id} className={row.operator_status ? '' : 'opacity-50'}>
                      <td className="py-2.5 px-4 font-semibold text-slate-800">{row.country ?? '—'} <span className="text-slate-400 font-mono">{row.iso}</span></td>
                      <td className="py-2.5 px-4">{row.operator} <span className="text-slate-400 font-mono">({row.currency})</span></td>
                      {editing && edit ? (
                        <>
                          <td className="py-2.5 px-4"><input className={input} type="number" min="0" step="any" value={edit.fixed} onChange={(e) => setEdit({ ...edit, fixed: e.target.value })} /></td>
                          <td className="py-2.5 px-4"><input className={input} type="number" min="0" max="100" step="any" value={edit.percent} onChange={(e) => setEdit({ ...edit, percent: e.target.value })} /></td>
                          <td className="py-2.5 px-4">
                            <input className={input} type="number" min="0" step="any" value={edit.rate} placeholder={needsRate ? 'requis' : '—'} onChange={(e) => setEdit({ ...edit, rate: e.target.value })} />
                          </td>
                          <td className="py-2.5 px-4">
                            <label className="flex items-center gap-1.5"><input type="checkbox" checked={edit.active} onChange={(e) => setEdit({ ...edit, active: e.target.checked })} /> Actif</label>
                          </td>
                          <td className="py-2.5 px-4 text-right whitespace-nowrap space-x-2">
                            <Button type="button" className="text-xs px-3 py-1" disabled={save.isPending} onClick={() => save.mutate(edit)}>Enregistrer</Button>
                            <Button type="button" variant="outline" className="text-xs px-3 py-1" onClick={() => { save.reset(); setEdit(null); }}>Annuler</Button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-2.5 px-4 font-mono">{row.pricing ? `${row.pricing.fixed_fee} ${row.currency}` : '—'}</td>
                          <td className="py-2.5 px-4 font-mono">{row.pricing ? `${+(row.pricing.percent_fee * 100).toFixed(4)} %` : '—'}</td>
                          <td className="py-2.5 px-4 font-mono">{row.pricing?.rate ?? (needsRate && row.pricing ? <span className="text-red-600 font-bold">manquant</span> : '—')}</td>
                          <td className="py-2.5 px-4">
                            {!row.pricing
                              ? <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700">Non configuré</span>
                              : row.pricing.active
                                ? <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">Actif</span>
                                : <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">Désactivé</span>}
                          </td>
                          <td className="py-2.5 px-4 text-right whitespace-nowrap space-x-3">
                            <button className="text-[11px] font-bold text-blue-600 hover:text-blue-500" onClick={() => { save.reset(); startEdit(row); }}>
                              {row.pricing ? 'Modifier' : 'Configurer'}
                            </button>
                            {row.pricing && (
                              <button
                                className="text-[11px] font-bold text-red-600 hover:text-red-500"
                                disabled={remove.isPending}
                                onClick={() => { if (confirm(`Supprimer le tarif de ${companyName} pour ${row.operator} ?`)) remove.mutate(row.operator_id); }}
                              >
                                Supprimer
                              </button>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
