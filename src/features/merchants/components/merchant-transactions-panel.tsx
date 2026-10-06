'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { STATUS_META, formatMoney } from '@/features/transfers/status';
import { TransferStatus } from '@/features/transfers/types';
import { saveBlob } from '@/features/kyb/types';
import { getErrorMessage } from '@/lib/utils';

type Environment = 'sandbox' | 'production';

interface Row {
  id: number;
  reference: string;
  type: 'transfer' | 'withdrawal' | 'deposit';
  status: TransferStatus;
  channel: string | null;
  amount: number;
  fee: number;
  currency: string;
  amount_received: number;
  currency_received: string;
  failure_reason: string | null;
  gateway_reference: string | null;
  created_at: string;
  recipient: { phone?: string; operator?: string; name?: string; bank_name?: string; country?: string };
}

interface Response {
  merchant: { id: number; company_name: string; name: string };
  summary: { total: number; success_count: number; failed_count: number; success_volume: number; success_fees: number };
  data: Row[];
  meta: { current_page: number; last_page: number; total: number };
}

const TYPE_LABELS = { transfer: 'Transfert', withdrawal: 'Retrait', deposit: 'Dépôt' } as const;
const input = 'px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500';

/** Transactions d'un marchand, par environnement (la liste générale de la console exclut la sandbox). */
export function MerchantTransactionsPanel({ merchantId, companyName, onClose }: { merchantId: number; companyName: string; onClose: () => void }) {
  const [environment, setEnvironment] = useState<Environment>('production');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const params = { environment, type: type || undefined, status: status || undefined, search: search.trim() || undefined, page };
  const { data, isLoading, isError, isFetching } = useQuery<Response>({
    queryKey: ['admin-merchant-transactions', merchantId, params],
    queryFn: async () => (await apiClient.get(`/admin/merchants/${merchantId}/transactions`, { params })).data,
    placeholderData: (previous) => previous,
  });

  // Tout changement de filtre ramène à la première page.
  const change = <T,>(setter: (v: T) => void) => (value: T) => { setter(value); setPage(1); };
  const s = data?.summary;

  // Même filtres que la liste (sans la pagination). Le fichier est téléchargé via la session de l'admin.
  const exportExcel = async () => {
    setExporting(true);
    setExportError(null);
    try {
      const { page: _page, ...filters } = params;
      void _page;
      const res = await apiClient.get(`/admin/merchants/${merchantId}/transactions/export`, { params: filters, responseType: 'blob' });
      const disposition = res.headers['content-disposition'] as string | undefined;
      const filename = disposition?.match(/filename="?([^";]+)"?/)?.[1] ?? `transactions_${environment}.xlsx`;
      saveBlob(res.data as Blob, filename);
    } catch (err) {
      // En cas d'erreur, la réponse (blob) contient le JSON d'erreur de l'API.
      const blob = (err as { response?: { data?: Blob } })?.response?.data;
      let message = getErrorMessage(err);
      if (blob instanceof Blob) {
        try { message = JSON.parse(await blob.text()).message ?? message; } catch { /* message générique */ }
      }
      setExportError(message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end" onClick={onClose}>
      <div className="w-full max-w-4xl bg-white h-full overflow-y-auto p-6 space-y-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-900">Transactions · {companyName}</h2>
            <p className="text-xs text-slate-500">Toutes les opérations du marchand, par environnement.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl leading-none" aria-label="Fermer">×</button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-slate-200 p-0.5 bg-slate-50">
          {(['production', 'sandbox'] as const).map((env) => (
            <button
              key={env}
              onClick={() => change(setEnvironment)(env)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${environment === env ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {env === 'production' ? '🚀 Production' : '🧪 Sandbox'}
            </button>
          ))}
        </div>
          <Button type="button" variant="outline" className="text-xs px-3 py-1.5" disabled={exporting || !data || data.summary.total === 0} onClick={exportExcel}>
            {exporting ? 'Export en cours…' : '⬇ Exporter en Excel'}
          </Button>
        </div>
        {exportError && <p className="text-xs font-medium text-red-600">{exportError}</p>}

        {environment === 'sandbox' && <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">Opérations simulées : aucun mouvement d&apos;argent réel.</p>}

        {s && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 rounded-xl p-3"><div className="text-slate-400 font-semibold">Transactions</div><div className="text-lg font-black text-slate-900">{s.total.toLocaleString('fr-FR')}</div></div>
            <div className="bg-emerald-50 rounded-xl p-3"><div className="text-emerald-700 font-semibold">Réussies</div><div className="text-lg font-black text-emerald-800">{s.success_count.toLocaleString('fr-FR')}</div></div>
            <div className="bg-red-50 rounded-xl p-3"><div className="text-red-700 font-semibold">Échecs / remboursées</div><div className="text-lg font-black text-red-800">{s.failed_count.toLocaleString('fr-FR')}</div></div>
            <div className="bg-blue-50 rounded-xl p-3"><div className="text-blue-700 font-semibold">Volume réussi</div><div className="text-lg font-black text-blue-800">{formatMoney(s.success_volume)}</div><div className="text-[10px] text-blue-600">dont frais {formatMoney(s.success_fees)}</div></div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <input className={`${input} flex-1 min-w-40`} placeholder="Référence ou téléphone…" value={search} onChange={(e) => change(setSearch)(e.target.value)} />
          <select className={input} value={type} onChange={(e) => change(setType)(e.target.value)}>
            <option value="">Tous les types</option>
            {Object.entries(TYPE_LABELS).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
          </select>
          <select className={input} value={status} onChange={(e) => change(setStatus)(e.target.value)}>
            <option value="">Tous les statuts</option>
            {(Object.keys(STATUS_META) as TransferStatus[]).map((k) => <option key={k} value={k}>{STATUS_META[k].label}</option>)}
          </select>
        </div>

        {isError && <p className="text-xs font-medium text-red-600">Impossible de charger les transactions.</p>}

        <div className={`border border-slate-200 rounded-xl overflow-x-auto transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase text-slate-500">
              <tr><th className="px-3 py-2 text-left">Référence</th><th className="px-3 py-2 text-left">Type</th><th className="px-3 py-2 text-left">Bénéficiaire</th><th className="px-3 py-2 text-right">Montant</th><th className="px-3 py-2 text-right">Frais</th><th className="px-3 py-2 text-left">Statut</th><th className="px-3 py-2 text-left">Date</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && <tr><td className="px-3 py-4 text-slate-400" colSpan={7}>Chargement…</td></tr>}
              {data?.data.length === 0 && <tr><td className="px-3 py-4 text-slate-400" colSpan={7}>Aucune transaction {environment === 'sandbox' ? 'sandbox' : 'en production'} pour ces critères.</td></tr>}
              {data?.data.map((t) => (
                <tr key={t.id} className="align-top">
                  <td className="px-3 py-2.5 font-mono">{t.reference}{t.gateway_reference && <div className="text-[10px] text-slate-400">{t.gateway_reference}</div>}</td>
                  <td className="px-3 py-2.5">{TYPE_LABELS[t.type]}</td>
                  <td className="px-3 py-2.5">{t.recipient.phone ?? t.recipient.name}<div className="text-[10px] text-slate-400">{t.recipient.operator ?? t.recipient.bank_name} · {t.recipient.country}</div></td>
                  <td className="px-3 py-2.5 text-right font-semibold whitespace-nowrap">{formatMoney(t.amount, t.currency)}{t.currency_received !== t.currency && <div className="text-[10px] font-normal text-slate-400">→ {formatMoney(t.amount_received, t.currency_received)}</div>}</td>
                  <td className="px-3 py-2.5 text-right text-slate-500">{formatMoney(t.fee)}</td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_META[t.status]?.className ?? ''}`}>{STATUS_META[t.status]?.label ?? t.status}</span>
                    {t.failure_reason && <div className="text-[10px] text-red-600 mt-0.5 max-w-40">{t.failure_reason}</div>}
                  </td>
                  <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{new Date(t.created_at).toLocaleString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data && data.meta.last_page > 1 && (
          <div className="flex items-center justify-between text-xs">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Précédent</Button>
            <span>Page {data.meta.current_page} / {data.meta.last_page} · {data.meta.total} transactions</span>
            <Button variant="outline" disabled={page >= data.meta.last_page} onClick={() => setPage(page + 1)}>Suivant</Button>
          </div>
        )}
      </div>
    </div>
  );
}
