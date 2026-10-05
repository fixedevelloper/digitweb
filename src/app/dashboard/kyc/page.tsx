'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/lib/utils';

interface Submission {
  id: number;
  target_level: number;
  document_type: string;
  document_number: string | null;
  full_name: string;
  birth_date: string | null;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  created_at: string;
  user: { name: string | null; phone: string | null; kyc_level: number } | null;
  files?: { index: number; role: string; mime: string }[];
}
interface Limit { level: number; per_transaction: string | null; daily_limit: string | null; monthly_limit: string | null }

const FIELDS: { key: keyof Limit; label: string }[] = [
  { key: 'per_transaction', label: 'Par transaction' },
  { key: 'daily_limit', label: 'Par jour' },
  { key: 'monthly_limit', label: 'Par mois' },
];

/** Charge une pièce (route protégée) et l'affiche via une URL objet locale. */
function KycFile({ id, index, role, mime }: { id: number; index: number; role: string; mime: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let objectUrl: string | null = null;
    apiClient.get(`/admin/kyc/submissions/${id}/files/${index}`, { responseType: 'blob' })
      .then((r) => { objectUrl = URL.createObjectURL(r.data); setUrl(objectUrl); })
      .catch(() => setUrl(null));
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [id, index]);

  return (
    <div className="text-xs">
      <div className="font-semibold uppercase text-slate-500 mb-1">{role}</div>
      {!url && <span className="text-slate-400">Chargement…</span>}
      {url && mime.startsWith('image/') && (
        // eslint-disable-next-line @next/next/no-img-element
        <a href={url} target="_blank" rel="noreferrer"><img src={url} alt={role} className="max-h-48 rounded-lg border border-slate-200" /></a>
      )}
      {/* PDF : téléchargé plutôt qu'affiché (le lecteur PDF du navigateur est bloqué par `object-src 'none'` de la CSP). */}
      {url && !mime.startsWith('image/') && <a href={url} download={`kyc-${id}-${role}.pdf`} className="text-blue-600 font-semibold">Télécharger le document</a>}
    </div>
  );
}

export default function KycPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('pending');
  const [selected, setSelected] = useState<number | null>(null);
  const [reason, setReason] = useState('');

  const list = useQuery({
    queryKey: ['admin-kyc', status],
    queryFn: async () => (await apiClient.get('/admin/kyc/submissions', { params: { status: status || undefined } })).data,
    refetchInterval: 30_000,
  });
  const detail = useQuery<Submission>({
    queryKey: ['admin-kyc-detail', selected],
    enabled: selected !== null,
    queryFn: async () => (await apiClient.get(`/admin/kyc/submissions/${selected}`)).data.data,
  });
  const limits = useQuery<Limit[]>({
    queryKey: ['admin-kyc-limits'],
    queryFn: async () => (await apiClient.get('/admin/kyc/limits')).data.data,
  });

  // Modifications locales ; tant qu'il n'y en a pas, on affiche les valeurs du serveur.
  const [edits, setDraft] = useState<Limit[] | null>(null);
  const draft = edits ?? limits.data ?? null;

  const done = () => {
    setSelected(null);
    setReason('');
    queryClient.invalidateQueries({ queryKey: ['admin-kyc'] });
  };
  const approve = useMutation({ mutationFn: async (id: number) => apiClient.post(`/admin/kyc/submissions/${id}/approve`), onSuccess: done });
  const reject = useMutation({ mutationFn: async (id: number) => apiClient.post(`/admin/kyc/submissions/${id}/reject`, { reason }), onSuccess: done });
  const saveLimits = useMutation({
    mutationFn: async () => (await apiClient.put('/admin/kyc/limits', { limits: draft })).data,
    onSuccess: () => { setDraft(null); queryClient.invalidateQueries({ queryKey: ['admin-kyc-limits'] }); },
  });

  const rows: Submission[] = list.data?.data ?? [];
  const sub = detail.data;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Vérification KYC</h1>
          <p className="text-slate-500">Niveau 2 = pièce d&apos;identité, niveau 3 = justificatif de domicile. Chaque niveau relève les plafonds du client.</p>
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setSelected(null); }} className="px-3 py-2 border border-slate-200 rounded-lg text-sm">
          <option value="pending">En attente</option>
          <option value="approved">Approuvées</option>
          <option value="rejected">Refusées</option>
          <option value="">Toutes</option>
        </select>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 h-fit">
          {list.isLoading && <p className="p-4 text-sm text-slate-400">Chargement…</p>}
          {!list.isLoading && rows.length === 0 && <p className="p-4 text-sm text-slate-400">Aucune demande.</p>}
          {rows.map((s) => (
            <button key={s.id} onClick={() => setSelected(s.id)} className={`w-full text-left p-4 hover:bg-slate-50 ${selected === s.id ? 'bg-blue-50/50' : ''}`}>
              <div className="text-sm font-semibold">{s.full_name}</div>
              <div className="text-xs text-slate-500">{s.user?.phone} · niveau {s.user?.kyc_level} → {s.target_level}</div>
              <div className="text-[11px] text-slate-400">{new Date(s.created_at).toLocaleString()} · {s.status}</div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4">
          {!sub && <p className="text-sm text-slate-400">Sélectionnez une demande pour examiner les pièces.</p>}
          {sub && (
            <>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <dt className="text-slate-500">Nom déclaré</dt><dd>{sub.full_name}</dd>
                <dt className="text-slate-500">Compte</dt><dd>{sub.user?.name ?? '—'} · {sub.user?.phone}</dd>
                <dt className="text-slate-500">Document</dt><dd>{sub.document_type} {sub.document_number}</dd>
                <dt className="text-slate-500">Naissance</dt><dd>{sub.birth_date ?? '—'}</dd>
                <dt className="text-slate-500">Niveau demandé</dt><dd>{sub.target_level}</dd>
              </dl>
              <div className="flex flex-wrap gap-4">
                {sub.files?.map((f) => <KycFile key={`${sub.id}-${f.index}`} id={sub.id} index={f.index} role={f.role} mime={f.mime} />)}
              </div>
              {sub.status === 'pending' ? (
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  {(approve.isError || reject.isError) && <p className="text-xs font-medium text-red-600">{getErrorMessage(approve.error ?? reject.error)}</p>}
                  <Button disabled={approve.isPending} onClick={() => confirm('Vérifier que le nom, la photo et la pièce correspondent. Approuver ?') && approve.mutate(sub.id)}>
                    Approuver (niveau {sub.target_level})
                  </Button>
                  <textarea className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" rows={2} placeholder="Motif du refus (visible par le client)" value={reason} onChange={(e) => setReason(e.target.value)} />
                  <Button variant="outline" disabled={reject.isPending || reason.trim().length < 3} onClick={() => reject.mutate(sub.id)}>Refuser</Button>
                </div>
              ) : (
                <p className="text-xs text-slate-500">Demande {sub.status === 'approved' ? 'approuvée' : `refusée : ${sub.rejection_reason}`}.</p>
              )}
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3">
        <h2 className="text-lg font-bold text-slate-900">Plafonds par niveau (XAF)</h2>
        <p className="text-xs text-slate-500">Laisser vide = illimité. Ne s&apos;applique qu&apos;aux clients (transferts, virements, retraits en production). Modification réservée au superadmin.</p>
        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-slate-500"><tr><th className="text-left py-2">Niveau</th>{FIELDS.map((f) => <th key={f.key} className="text-left">{f.label}</th>)}</tr></thead>
          <tbody>
            {draft?.map((l, i) => (
              <tr key={l.level} className="border-t border-slate-100">
                <td className="py-2 font-semibold">{l.level}</td>
                {FIELDS.map((f) => (
                  <td key={f.key} className="pr-2">
                    <input type="number" min={0} value={(l[f.key] as string | null) ?? ''} placeholder="illimité"
                      onChange={(e) => setDraft(draft.map((d, j) => (j === i ? { ...d, [f.key]: e.target.value === '' ? null : e.target.value } : d)))}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {saveLimits.isError && <p className="text-xs font-medium text-red-600">{getErrorMessage(saveLimits.error)}</p>}
        {saveLimits.isSuccess && <p className="text-xs font-medium text-green-600">Plafonds enregistrés.</p>}
        <Button disabled={saveLimits.isPending} onClick={() => saveLimits.mutate()}>Enregistrer les plafonds</Button>
      </div>
    </div>
  );
}
