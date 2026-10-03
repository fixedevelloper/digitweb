'use client';

import { useState } from 'react';
import { ManualTransfer } from '@/features/transfers/types';
import { useAgentActions } from '../hooks/use-agent-transfers';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/lib/utils';

const input = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500';

/** Actions disponibles selon le statut et l'assignation du transfert. */
export function AgentActions({ transfer, agentId }: { transfer: ManualTransfer; agentId: number | null }) {
  const { act, uploadProof } = useAgentActions(transfer.id);
  const [refs, setRefs] = useState({ provider_reference: '', transaction_reference: '', comment: '' });
  const [reason, setReason] = useState('');
  const mine = agentId !== null && transfer.assigned_agent_id === agentId;
  const error = act.isError ? getErrorMessage(act.error) : uploadProof.isError ? getErrorMessage(uploadProof.error) : null;
  const busy = act.isPending || uploadProof.isPending;
  const proofCount = transfer.proofs?.length ?? 0;

  const nonEmpty = (o: Record<string, string>) => Object.fromEntries(Object.entries(o).filter(([, v]) => v));

  return (
    <div className="space-y-4 border-t border-slate-100 pt-4">
      {error && <div className="p-3 rounded-xl bg-red-50 text-xs font-medium text-red-700">{error}</div>}

      {transfer.status === 'pending_manual_review' && (
        <Button className="w-full" disabled={busy} onClick={() => act.mutate({ action: 'claim' })}>Prendre en charge</Button>
      )}

      {transfer.status === 'assigned' && mine && (
        <div className="grid grid-cols-2 gap-2">
          <Button disabled={busy} onClick={() => act.mutate({ action: 'start' })}>Commencer</Button>
          <Button variant="outline" disabled={busy}
            onClick={() => confirm('Rendre ce transfert à la file ? Un autre agent pourra le prendre.') && act.mutate({ action: 'release' })}>
            Rendre à la file
          </Button>
        </div>
      )}

      {transfer.status === 'processing' && mine && (
        <>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Preuve du transfert ({proofCount})</label>
            <input
              type="file" accept=".pdf,.jpg,.jpeg,.png" disabled={busy}
              className="block w-full text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-xs file:font-semibold"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) { uploadProof.mutate(f); e.target.value = ''; } }}
            />
            <p className="text-[10px] text-slate-400">PDF, JPG ou PNG — 5 Mo max. Au moins une preuve est requise pour valider.</p>
          </div>

          <div className="space-y-2">
            <input className={input} placeholder="Référence provider / opérateur" value={refs.provider_reference} onChange={(e) => setRefs({ ...refs, provider_reference: e.target.value })} />
            <input className={input} placeholder="Référence de la transaction" value={refs.transaction_reference} onChange={(e) => setRefs({ ...refs, transaction_reference: e.target.value })} />
            <textarea className={input} placeholder="Commentaire (optionnel)" rows={2} value={refs.comment} onChange={(e) => setRefs({ ...refs, comment: e.target.value })} />
            <Button className="w-full" disabled={busy || proofCount === 0}
              onClick={() => confirm('Valider ce transfert comme exécuté ?') && act.mutate({ action: 'complete', body: nonEmpty(refs) })}>
              Valider le transfert
            </Button>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-4">
            <textarea className={input} placeholder="Motif (obligatoire pour rejeter ou déclarer un échec)" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" disabled={busy || reason.trim().length < 3}
                onClick={() => confirm('Rejeter ce transfert ? Le client sera remboursé.') && act.mutate({ action: 'reject', body: { reason } })}>
                Rejeter
              </Button>
              <Button variant="outline" disabled={busy || reason.trim().length < 3}
                onClick={() => confirm("Déclarer l'échec ? Le client sera remboursé.") && act.mutate({ action: 'fail', body: { reason } })}>
                Échec
              </Button>
            </div>
          </div>
        </>
      )}

      {['assigned', 'processing'].includes(transfer.status) && !mine && (
        <p className="text-xs text-slate-400">Ce transfert est pris en charge par {transfer.assigned_agent?.name ?? 'un autre agent'}.</p>
      )}
    </div>
  );
}
