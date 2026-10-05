'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/lib/utils';

interface ReconciliationRow {
  id: number;
  reference: string;
  type: string;
  status: string;
  amount_sent: string;
  fees: string;
  currency_sent: string;
  recipient_phone: string | null;
  recipient_operator: string | null;
  submitted_at: string;
  gateway_reference: string | null;
  reconciliation_reason: 'unknown_outcome' | 'stale';
  user: { name: string | null; phone: string | null } | null;
}

const REASONS = {
  unknown_outcome: 'Issue inconnue (aucune référence Digitwave)',
  stale: 'Bloquée en cours depuis plus d\'1 h',
};

export default function ReconciliationPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ReconciliationRow | null>(null);
  const [note, setNote] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reconciliation', page],
    queryFn: async () => (await apiClient.get('/admin/reconciliation', { params: { page } })).data,
    refetchInterval: 30_000,
  });

  const resolve = useMutation({
    mutationFn: async ({ id, outcome }: { id: number; outcome: 'success' | 'failed' }) =>
      (await apiClient.post(`/admin/reconciliation/${id}/resolve`, { outcome, note })).data,
    onSuccess: () => {
      setSelected(null);
      setNote('');
      queryClient.invalidateQueries({ queryKey: ['admin-reconciliation'] });
    },
  });

  const rows: ReconciliationRow[] = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Rapprochement</h1>
        <p className="text-slate-500">
          Transactions dont l&apos;issue chez Digitwave est inconnue. Vérifiez d&apos;abord chez Digitwave, puis tranchez (superadmin).
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr><th className="px-4 py-3 text-left">Référence</th><th className="px-4 py-3 text-left">Type</th><th className="px-4 py-3 text-left">Bénéficiaire</th><th className="px-4 py-3 text-right">Montant</th><th className="px-4 py-3 text-left">Raison</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && <tr><td className="px-4 py-4 text-slate-400" colSpan={5}>Chargement…</td></tr>}
              {!isLoading && rows.length === 0 && <tr><td className="px-4 py-4 text-slate-400" colSpan={5}>✅ Rien à rapprocher.</td></tr>}
              {rows.map((t) => (
                <tr key={t.id} onClick={() => setSelected(t)} className={`cursor-pointer hover:bg-slate-50 ${selected?.id === t.id ? 'bg-blue-50/50' : ''}`}>
                  <td className="px-4 py-3 font-mono text-xs">{t.reference}</td>
                  <td className="px-4 py-3 text-xs">{t.type}</td>
                  <td className="px-4 py-3 text-xs">{t.recipient_phone}<div className="text-slate-400">{t.recipient_operator}</div></td>
                  <td className="px-4 py-3 text-right font-semibold">{Number(t.amount_sent).toLocaleString()} {t.currency_sent}</td>
                  <td className="px-4 py-3 text-xs">{REASONS[t.reconciliation_reason]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data && data.last_page > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-xs">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Précédent</Button>
              <span>Page {data.current_page} / {data.last_page} · {data.total} transactions</span>
              <Button variant="outline" disabled={page >= data.last_page} onClick={() => setPage(page + 1)}>Suivant</Button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 h-fit space-y-3">
          {!selected && <p className="text-sm text-slate-400">Sélectionnez une transaction pour la trancher.</p>}
          {selected && (
            <>
              <div className="text-sm">
                <div className="font-mono text-xs">{selected.reference}</div>
                <div className="text-slate-500 text-xs">Soumise le {new Date(selected.submitted_at).toLocaleString()}</div>
                <div className="text-slate-500 text-xs">Client : {selected.user?.name ?? selected.user?.phone ?? '—'}</div>
                <div className="text-slate-500 text-xs">Réf. Digitwave : {selected.gateway_reference ?? '—'}</div>
              </div>
              <textarea className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" rows={3}
                placeholder="Note obligatoire (preuve de la vérification chez Digitwave)" value={note} onChange={(e) => setNote(e.target.value)} />
              {resolve.isError && <p className="text-xs font-medium text-red-600">{getErrorMessage(resolve.error)}</p>}
              <Button className="w-full" disabled={resolve.isPending || note.trim().length < 5}
                onClick={() => confirm('Digitwave a bien PAYÉ ce bénéficiaire ? Aucun remboursement ne sera fait.') && resolve.mutate({ id: selected.id, outcome: 'success' })}>
                Payé chez Digitwave (pas de remboursement)
              </Button>
              <Button variant="outline" className="w-full" disabled={resolve.isPending || note.trim().length < 5}
                onClick={() => confirm('Rien n\'est parti chez Digitwave ? Le wallet du client sera remboursé.') && resolve.mutate({ id: selected.id, outcome: 'failed' })}>
                Non payé (rembourser le client)
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
