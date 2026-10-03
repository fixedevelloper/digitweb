'use client';

import { useState } from 'react';
import { useAdminManualTransfers, useAdminReleaseTransfer, useAdminTransfer } from '@/features/transfers/hooks/use-transfer-config';
import { MANUAL_STATUSES, STATUS_META, formatMoney } from '@/features/transfers/status';
import { SERVICE_LABELS } from '@/features/transfers/types';
import { StatusBadge } from '@/features/transfers/components/status-badge';
import { TransferDetail } from '@/features/transfers/components/transfer-detail';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/lib/utils';

export default function ManualTransfersPage() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number | null>(null);
  const { data, isLoading } = useAdminManualTransfers({ status: status || undefined, page });
  const detail = useAdminTransfer(selected);
  const release = useAdminReleaseTransfer();
  const [reason, setReason] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Transferts manuels</h1>
          <p className="text-slate-500">Supervision de la file des agents (lecture seule). Actualisation automatique toutes les 30 s.</p>
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="px-3 py-2 border border-slate-200 rounded-lg text-sm">
          <option value="">Tous les statuts</option>
          {MANUAL_STATUSES.map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
        </select>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr><th className="px-4 py-3 text-left">Référence</th><th className="px-4 py-3 text-left">Client</th><th className="px-4 py-3 text-left">Destination</th><th className="px-4 py-3 text-right">Montant</th><th className="px-4 py-3 text-left">Agent</th><th className="px-4 py-3 text-left">Statut</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && <tr><td className="px-4 py-4 text-slate-400" colSpan={6}>Chargement…</td></tr>}
              {data?.data.length === 0 && <tr><td className="px-4 py-4 text-slate-400" colSpan={6}>Aucun transfert.</td></tr>}
              {data?.data.map((t) => (
                <tr key={t.id} onClick={() => setSelected(t.id)} className={`cursor-pointer hover:bg-slate-50 ${selected === t.id ? 'bg-blue-50/50' : ''}`}>
                  <td className="px-4 py-3 font-mono text-xs">{t.reference}</td>
                  <td className="px-4 py-3 text-xs">{t.customer.name ?? t.customer.phone}</td>
                  <td className="px-4 py-3 text-xs">{t.destination_country}<div className="text-slate-400">{SERVICE_LABELS[t.service]}</div></td>
                  <td className="px-4 py-3 text-right font-semibold">{formatMoney(t.amount, t.currency)}</td>
                  <td className="px-4 py-3 text-xs">{t.assigned_agent?.name ?? '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {data && data.meta.last_page > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-xs">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Précédent</Button>
              <span>Page {data.meta.current_page} / {data.meta.last_page} · {data.meta.total} transferts</span>
              <Button variant="outline" disabled={page >= data.meta.last_page} onClick={() => setPage(page + 1)}>Suivant</Button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 h-fit">
          {selected === null && <p className="text-sm text-slate-400">Sélectionnez un transfert pour voir son détail et son historique.</p>}
          {selected !== null && detail.isLoading && <p className="text-sm text-slate-400">Chargement…</p>}
          {detail.data && <TransferDetail transfer={detail.data.data} />}
          {detail.data && ['assigned', 'processing'].includes(detail.data.data.status) && (
            <div className="mt-5 border-t border-slate-100 pt-4 space-y-2">
              <p className="text-xs text-slate-500">
                Agent injoignable ou suspendu ? Remettre le transfert dans la file. Les fonds restent réservés.
                {detail.data.data.status === 'processing' && ' Attention : l\'agent a peut-être déjà commencé l\'exécution.'}
              </p>
              <textarea className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" rows={2} placeholder="Motif (obligatoire)" value={reason} onChange={(e) => setReason(e.target.value)} />
              {release.isError && <p className="text-xs font-medium text-red-600">{getErrorMessage(release.error)}</p>}
              <Button variant="outline" className="w-full" disabled={release.isPending || reason.trim().length < 3}
                onClick={() => confirm('Remettre ce transfert dans la file ?') && release.mutate({ id: detail.data!.data.id, reason }, { onSuccess: () => setReason('') })}>
                Remettre dans la file
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
