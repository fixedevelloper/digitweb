'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/lib/utils';

interface Adjustment {
  id: number;
  type: 'credit' | 'debit';
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  created_at: string;
  admin: { id: number; name: string | null; phone: string; role: string } | null;
  reviewer: { name: string | null } | null;
  wallet: { id: number; balance: string; user: { name: string | null; phone: string } | null } | null;
}

export default function AdjustmentsPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('pending');
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [reason, setReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-adjustments', status],
    queryFn: async () => (await apiClient.get('/admin/wallet-adjustments', { params: { status } })).data,
    refetchInterval: 30_000,
  });

  const done = () => { setRejectId(null); setReason(''); queryClient.invalidateQueries({ queryKey: ['admin-adjustments'] }); queryClient.invalidateQueries({ queryKey: ['admin-wallets'] }); };
  const approve = useMutation({ mutationFn: async (id: number) => apiClient.post(`/admin/wallet-adjustments/${id}/approve`), onSuccess: done });
  const reject = useMutation({ mutationFn: async (id: number) => apiClient.post(`/admin/wallet-adjustments/${id}/reject`, { reason }), onSuccess: done });

  const rows: Adjustment[] = data?.data ?? [];
  const error = approve.error ?? reject.error;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Validation des ajustements</h1>
          <p className="text-slate-500">Double validation : un ajustement n&apos;est appliqué qu&apos;après l&apos;approbation d&apos;un autre superadmin que le demandeur.</p>
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm">
          <option value="pending">En attente</option>
          <option value="approved">Appliqués</option>
          <option value="rejected">Refusés</option>
        </select>
      </div>

      {error && <p className="text-sm font-medium text-red-600">{getErrorMessage(error)}</p>}

      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr><th className="px-4 py-3 text-left">Compte</th><th className="px-4 py-3 text-left">Opération</th><th className="px-4 py-3 text-left">Motif</th><th className="px-4 py-3 text-left">Demandeur</th><th className="px-4 py-3" /></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && <tr><td className="px-4 py-4 text-slate-400" colSpan={5}>Chargement…</td></tr>}
            {!isLoading && rows.length === 0 && <tr><td className="px-4 py-4 text-slate-400" colSpan={5}>Aucune demande.</td></tr>}
            {rows.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-3 text-xs">{a.wallet?.user?.name ?? '—'}<div className="text-slate-400">{a.wallet?.user?.phone} · solde {Number(a.wallet?.balance ?? 0).toLocaleString()}</div></td>
                <td className={`px-4 py-3 font-semibold ${a.type === 'credit' ? 'text-green-700' : 'text-red-700'}`}>{a.type === 'credit' ? '+' : '−'}{Number(a.amount).toLocaleString()}</td>
                <td className="px-4 py-3 text-xs max-w-xs">{a.reason}{a.rejection_reason && <div className="text-red-600">Refusé : {a.rejection_reason}</div>}</td>
                <td className="px-4 py-3 text-xs">{a.admin?.name ?? a.admin?.phone}<div className="text-slate-400">{a.admin?.role} · {new Date(a.created_at).toLocaleString()}</div></td>
                <td className="px-4 py-3 text-right">
                  {a.status === 'pending' && (rejectId === a.id ? (
                    <div className="flex gap-2 items-center justify-end">
                      <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Motif du refus" className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs" />
                      <Button variant="outline" disabled={reject.isPending || reason.trim().length < 3} onClick={() => reject.mutate(a.id)}>Refuser</Button>
                    </div>
                  ) : (
                    <div className="flex gap-2 justify-end">
                      <Button disabled={approve.isPending} onClick={() => window.confirm(`Appliquer ce ${a.type === 'credit' ? 'crédit' : 'débit'} de ${Number(a.amount).toLocaleString()} ?`) && approve.mutate(a.id)}>Approuver</Button>
                      <Button variant="outline" onClick={() => setRejectId(a.id)}>Refuser</Button>
                    </div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
