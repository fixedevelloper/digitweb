'use client';

import { useEffect, useState } from 'react';
import { QueueFilter, useAgentQueue, useAgentTransfer } from '@/features/agent/hooks/use-agent-transfers';
import { AgentActions } from '@/features/agent/components/agent-actions';
import { StatusBadge } from '@/features/transfers/components/status-badge';
import { TransferDetail } from '@/features/transfers/components/transfer-detail';
import { formatMoney } from '@/features/transfers/status';
import { SERVICE_LABELS } from '@/features/transfers/types';
import { Button } from '@/components/ui/button';

const TABS: { label: string; filter: QueueFilter }[] = [
  { label: 'À prendre', filter: { status: 'pending_manual_review' } },
  { label: 'Assignés', filter: { status: 'assigned', mine: true } },
  { label: 'En traitement', filter: { status: 'processing', mine: true } },
  { label: 'Terminés', filter: { status: 'success', mine: true } },
  { label: 'Rejetés / échoués', filter: { status: 'rejected', mine: true } },
];

export default function AgentDashboardPage() {
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number | null>(null);
  const [agentId, setAgentId] = useState<number | null>(null);
  const queue = useAgentQueue(TABS[tab].filter, page);
  const detail = useAgentTransfer(selected);

  useEffect(() => { setAgentId(Number(localStorage.getItem('agent_id')) || null); }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">File de traitement</h1>
        <p className="text-slate-500">Prenez un transfert, exécutez-le, joignez la preuve puis validez. Actualisation automatique.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t, i) => (
          <button key={t.label} onClick={() => { setTab(i); setPage(1); setSelected(null); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold ${tab === i ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr><th className="px-4 py-3 text-left">Référence</th><th className="px-4 py-3 text-left">Client</th><th className="px-4 py-3 text-left">Destination</th><th className="px-4 py-3 text-right">À payer</th><th className="px-4 py-3 text-left">Statut</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {queue.isLoading && <tr><td className="px-4 py-4 text-slate-400" colSpan={5}>Chargement…</td></tr>}
              {queue.data?.data.length === 0 && <tr><td className="px-4 py-6 text-center text-slate-400" colSpan={5}>Rien dans cette file.</td></tr>}
              {queue.data?.data.map((t) => (
                <tr key={t.id} onClick={() => setSelected(t.id)} className={`cursor-pointer hover:bg-slate-50 ${selected === t.id ? 'bg-blue-50/50' : ''}`}>
                  <td className="px-4 py-3 font-mono text-xs">{t.reference}{t.priority === 'high' && <span className="ml-1.5 text-[10px] font-bold text-red-600">URGENT</span>}</td>
                  <td className="px-4 py-3 text-xs">{t.customer.name ?? t.customer.phone}</td>
                  <td className="px-4 py-3 text-xs">{t.destination_country}<div className="text-slate-400">{SERVICE_LABELS[t.service]}</div></td>
                  <td className="px-4 py-3 text-right font-semibold">{formatMoney(t.amount_to_pay, t.currency_to_pay)}</td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {queue.data && queue.data.meta.last_page > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-xs">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Précédent</Button>
              <span>Page {queue.data.meta.current_page} / {queue.data.meta.last_page}</span>
              <Button variant="outline" disabled={page >= queue.data.meta.last_page} onClick={() => setPage(page + 1)}>Suivant</Button>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 h-fit space-y-4">
          {selected === null && <p className="text-sm text-slate-400">Sélectionnez un transfert.</p>}
          {selected !== null && detail.isLoading && <p className="text-sm text-slate-400">Chargement…</p>}
          {detail.data && (
            <>
              <TransferDetail transfer={detail.data.data} />
              <AgentActions transfer={detail.data.data} agentId={agentId} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
