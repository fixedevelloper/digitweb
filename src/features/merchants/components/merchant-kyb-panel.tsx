'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { getErrorMessage } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DOC_STATUS_LABELS, KYB_STATUS_LABELS, KybChecklistItem, KybOverview, KybProfile, saveBlob } from '@/features/kyb/types';

interface AdminKyb extends KybOverview {
  merchant: { id: number; name: string; company_name: string; email: string; phone: string; environment: string };
  events: { id: number; action: string; document_type: string | null; comment: string | null; created_at: string; actor: { name: string | null; role: string } | null }[];
}

const ACTION_LABELS: Record<string, string> = {
  profile_updated: 'Informations mises à jour', document_uploaded: 'Pièce déposée', document_replaced: 'Pièce remplacée', submitted: 'Dossier soumis',
  document_viewed: 'Pièce consultée', document_uploaded_by_team: 'Pièce déposée par l\'équipe', document_replaced_by_team: 'Pièce remplacée par l\'équipe', profile_updated_by_team: 'Informations saisies par l\'équipe', document_approved: 'Pièce validée', document_rejected: 'Pièce refusée', dossier_approved: 'Dossier approuvé', dossier_rejected: 'Dossier refusé',
};

const fieldClass = 'w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500';

/** Dépôt d'une pièce par l'équipe pour le compte du marchand : l'origine est obligatoire (journal d'audit). */
function TeamUpload({ merchantId, item, onDone }: { merchantId: number; item: KybChecklistItem; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [expiresAt, setExpiresAt] = useState('');
  const [comment, setComment] = useState('');

  const upload = useMutation({
    mutationFn: async () => {
      const form = new FormData();
      form.append('type', item.type);
      form.append('file', file as File);
      form.append('comment', comment.trim());
      if (expiresAt) form.append('expires_at', expiresAt);
      return (await apiClient.post(`/admin/merchants/${merchantId}/kyb/documents`, form, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
    },
    onSuccess: () => { setOpen(false); setFile(null); setExpiresAt(''); setComment(''); onDone(); },
  });

  if (!open) {
    return <button type="button" onClick={() => setOpen(true)} className="text-[11px] font-bold text-blue-600 hover:text-blue-500">{item.document ? '⇪ Remplacer pour le marchand' : '⇪ Déposer pour le marchand'}</button>;
  }

  return (
    <div className="space-y-2 bg-blue-50/60 border border-blue-100 rounded-lg p-3">
      <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-xs" />
      {item.expires && <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className={fieldClass} title="Date de fin de validité de la pièce" />}
      <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Origine de la pièce (ex : reçue par e-mail le 03/10) — obligatoire" className={fieldClass} />
      {upload.isError && <p className="text-xs font-medium text-red-600">{getErrorMessage(upload.error)}</p>}
      <div className="flex gap-2">
        <Button className="text-xs px-3 py-1" disabled={!file || comment.trim().length < 3 || upload.isPending} onClick={() => upload.mutate()}>Déposer</Button>
        <button type="button" className="text-xs text-slate-500" onClick={() => setOpen(false)}>Annuler</button>
      </div>
      <p className="text-[10px] text-slate-500">La pièce reste « en attente » : elle doit ensuite être validée. Le marchand en est informé.</p>
    </div>
  );
}

/** Saisie des informations d'entreprise par l'équipe pour le compte du marchand. */
function TeamProfileForm({ merchantId, profile, onDone }: { merchantId: number; profile: KybProfile | null; onDone: () => void }) {
  const initial = (k: keyof KybProfile) => profile?.[k] ?? '';
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<keyof KybProfile, string>>({
    registration_number: initial('registration_number'), tax_id: initial('tax_id'), country: initial('country'),
    address: initial('address'), business_description: initial('business_description'), expected_monthly_volume: initial('expected_monthly_volume'),
  });
  const [comment, setComment] = useState('');
  const set = (k: keyof KybProfile) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  const save = useMutation({
    mutationFn: async () => (await apiClient.put(`/admin/merchants/${merchantId}/kyb/profile`, { ...form, comment: comment.trim() })).data,
    onSuccess: () => { setOpen(false); setComment(''); onDone(); },
  });

  if (!open) {
    return <button type="button" onClick={() => setOpen(true)} className="text-[11px] font-bold text-blue-600 hover:text-blue-500">✎ {profile ? 'Modifier' : 'Renseigner'} pour le marchand</button>;
  }

  return (
    <form className="space-y-2 mt-2" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
      <div className="grid grid-cols-2 gap-2">
        <input className={fieldClass} placeholder="N° de registre" value={form.registration_number} onChange={set('registration_number')} required />
        <input className={fieldClass} placeholder="Identifiant fiscal" value={form.tax_id} onChange={set('tax_id')} required />
        <input className={fieldClass} placeholder="Pays d'immatriculation" value={form.country} onChange={set('country')} required />
        <input className={fieldClass} type="number" min="0" placeholder="Volume mensuel attendu" value={form.expected_monthly_volume} onChange={set('expected_monthly_volume')} required />
      </div>
      <input className={fieldClass} placeholder="Adresse du siège" value={form.address} onChange={set('address')} required />
      <textarea className={fieldClass} rows={2} placeholder="Activité" value={form.business_description} onChange={set('business_description')} required />
      <input className={fieldClass} placeholder="Origine des informations (ex : dossier papier reçu le 03/10) — obligatoire" value={comment} onChange={(e) => setComment(e.target.value)} required minLength={3} />
      {save.isError && <p className="text-xs font-medium text-red-600">{getErrorMessage(save.error)}</p>}
      <div className="flex gap-2">
        <Button type="submit" className="text-xs px-3 py-1" disabled={save.isPending}>Enregistrer</Button>
        <button type="button" className="text-xs text-slate-500" onClick={() => setOpen(false)}>Annuler</button>
      </div>
    </form>
  );
}

/** Examen du dossier de vérification d'un marchand : pièces, décisions, historique. */
export function MerchantKybPanel({ merchantId, onClose }: { merchantId: number; onClose: () => void }) {
  const queryClient = useQueryClient();
  const key = ['admin-merchant-kyb', merchantId];
  const [rejecting, setRejecting] = useState<number | 'dossier' | null>(null);
  const [reason, setReason] = useState('');

  const { data, isLoading } = useQuery<AdminKyb>({
    queryKey: key,
    queryFn: async () => (await apiClient.get(`/admin/merchants/${merchantId}/kyb`)).data.data,
  });

  const done = () => {
    setRejecting(null);
    setReason('');
    queryClient.invalidateQueries({ queryKey: key });
    queryClient.invalidateQueries({ queryKey: ['admin-merchants'] });
  };
  const refresh = () => { queryClient.invalidateQueries({ queryKey: key }); queryClient.invalidateQueries({ queryKey: ['admin-merchants'] }); };
  const base = `/admin/merchants/${merchantId}/kyb`;
  const approveDoc = useMutation({ mutationFn: async (id: number) => apiClient.post(`${base}/documents/${id}/approve`), onSuccess: done });
  const rejectDoc = useMutation({ mutationFn: async (id: number) => apiClient.post(`${base}/documents/${id}/reject`, { reason }), onSuccess: done });
  const approveDossier = useMutation({ mutationFn: async () => apiClient.post(`${base}/approve`), onSuccess: done });
  const rejectDossier = useMutation({ mutationFn: async () => apiClient.post(`${base}/reject`, { reason }), onSuccess: done });

  const error = approveDoc.error ?? rejectDoc.error ?? approveDossier.error ?? rejectDossier.error;
  const busy = approveDoc.isPending || rejectDoc.isPending || approveDossier.isPending || rejectDossier.isPending;

  const download = async (id: number, name: string) => {
    const res = await apiClient.get(`${base}/documents/${id}/file`, { responseType: 'blob' });
    saveBlob(res.data as Blob, name);
    queryClient.invalidateQueries({ queryKey: key }); // la consultation est journalisée
  };

  // L'équipe peut examiner les pièces et décider tant que le dossier n'est pas approuvé (sans attendre la soumission).
  const reviewable = !!data && data.kyb_status !== 'approved';
  const status = data ? KYB_STATUS_LABELS[data.kyb_status] : null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end" onClick={onClose}>
      <div className="w-full max-w-2xl bg-white h-full overflow-y-auto p-6 space-y-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-900">{data?.merchant.company_name ?? 'Dossier marchand'}</h2>
            {data && <p className="text-xs text-slate-500">{data.merchant.name} · {data.merchant.email} · +{data.merchant.phone}</p>}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl leading-none" aria-label="Fermer">×</button>
        </div>

        {isLoading && <p className="text-sm text-slate-400">Chargement…</p>}

        {data && status && (
          <>
            <div className="flex items-center gap-3">
              <span className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-full ${status.className}`}>{status.label}</span>
              {data.grace_until && data.kyb_status !== 'approved' && <span className="text-xs text-amber-700">Délai de régularisation : {new Date(data.grace_until).toLocaleDateString()}</span>}
            </div>

            {reviewable && !data.submitted && (
              <p className="text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-xl p-3">
                Le marchand n&apos;a pas encore soumis son dossier. Vous pouvez néanmoins valider ou refuser les pièces déjà déposées, puis approuver le dossier une fois tout validé.
              </p>
            )}

            <section className="bg-slate-50 rounded-xl p-4 text-xs space-y-1">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Entreprise</h3>
              {data.profile ? (
                <>
                  <div><b>Registre :</b> {data.profile.registration_number} · <b>Fiscal :</b> {data.profile.tax_id} · <b>Pays :</b> {data.profile.country}</div>
                  <div><b>Adresse :</b> {data.profile.address}</div>
                  <div><b>Volume mensuel attendu :</b> {Number(data.profile.expected_monthly_volume).toLocaleString()} XAF</div>
                  <div><b>Activité :</b> {data.profile.business_description}</div>
                </>
              ) : <p className="text-slate-400">Informations non renseignées.</p>}
              {reviewable && <TeamProfileForm key={JSON.stringify(data.profile)} merchantId={merchantId} profile={data.profile} onDone={refresh} />}
            </section>

            <section className="border border-slate-200 rounded-xl divide-y divide-slate-100">
              {data.documents.map((item) => {
                const doc = item.document;
                return (
                  <div key={item.type} className="p-3 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">{item.label} <span className={`text-[10px] font-bold uppercase ${item.required ? 'text-red-500' : 'text-slate-400'}`}>{item.required ? 'obligatoire' : 'facultatif'}</span></span>
                      {doc ? <span className={`text-xs font-bold ${item.expired ? 'text-red-600' : DOC_STATUS_LABELS[doc.status].className}`}>{item.expired ? 'Expirée' : DOC_STATUS_LABELS[doc.status].label}</span> : <span className="text-xs text-slate-400">Non fournie</span>}
                    </div>
                    {doc && (
                      <>
                        <div className="text-xs text-slate-500">
                          <button type="button" className="font-semibold text-blue-600 hover:text-blue-500" onClick={() => download(doc.id, doc.original_name)}>{doc.original_name}</button>
                          {' '}({Math.round(doc.size / 1024)} Ko){doc.expires_at && <> · expire le {doc.expires_at}</>}
                        </div>
                        {doc.status === 'rejected' && <div className="text-xs text-red-600">Refusée : {doc.rejection_reason}</div>}
                        {reviewable && doc.status === 'pending' && (
                          rejecting === doc.id ? (
                            <div className="flex gap-2">
                              <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Motif du refus" className="flex-1 px-2 py-1.5 border border-slate-200 rounded-lg text-xs" />
                              <Button variant="outline" className="text-xs px-3 py-1" disabled={busy || reason.trim().length < 3} onClick={() => rejectDoc.mutate(doc.id)}>Refuser</Button>
                              <button type="button" className="text-xs text-slate-500" onClick={() => setRejecting(null)}>Annuler</button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <Button className="text-xs px-3 py-1" disabled={busy} onClick={() => approveDoc.mutate(doc.id)}>Valider</Button>
                              <Button variant="outline" className="text-xs px-3 py-1" disabled={busy} onClick={() => { setRejecting(doc.id); setReason(''); }}>Refuser</Button>
                            </div>
                          )
                        )}
                      </>
                    )}
                    {reviewable && <TeamUpload merchantId={merchantId} item={item} onDone={refresh} />}
                  </div>
                );
              })}
            </section>

            {error && <p className="text-xs font-medium text-red-600">{getErrorMessage(error)}</p>}

            {reviewable && (
              <section className="border border-slate-200 rounded-xl p-4 space-y-2">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Décision finale (superadmin, 2FA)</h3>
                {data.blockers.length > 0 ? (
                  <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-1">
                    <div className="font-semibold">Avant de pouvoir approuver :</div>
                    <ul className="list-disc pl-4">{data.blockers.map((b) => <li key={b}>{b}</li>)}</ul>
                  </div>
                ) : (
                  <p className="text-xs text-emerald-700">Tout est en règle : le dossier peut être approuvé. Cela autorise ensuite le passage en production.</p>
                )}
                {rejecting === 'dossier' ? (
                  <div className="flex gap-2">
                    <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Motif du refus (visible par le marchand)" className="flex-1 px-2 py-1.5 border border-slate-200 rounded-lg text-xs" />
                    <Button variant="outline" className="text-xs px-3 py-1" disabled={busy || reason.trim().length < 3} onClick={() => rejectDossier.mutate()}>Refuser le dossier</Button>
                    <button type="button" className="text-xs text-slate-500" onClick={() => setRejecting(null)}>Annuler</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button disabled={busy || data.blockers.length > 0} onClick={() => window.confirm('Approuver ce dossier ? Le marchand pourra être activé en production.') && approveDossier.mutate()}>Approuver le dossier</Button>
                    <Button variant="outline" disabled={busy} onClick={() => { setRejecting('dossier'); setReason(''); }}>Refuser le dossier</Button>
                  </div>
                )}
              </section>
            )}

            <section>
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Historique</h3>
              <ul className="space-y-1 text-xs text-slate-600">
                {data.events.map((e) => (
                  <li key={e.id}>
                    <span className="text-slate-400">{new Date(e.created_at).toLocaleString()}</span> — {ACTION_LABELS[e.action] ?? e.action}
                    {e.document_type && <> ({data.documents.find((d) => d.type === e.document_type)?.label ?? e.document_type})</>}
                    {e.actor && <span className="text-slate-400"> · {e.actor.name ?? e.actor.role}</span>}
                    {e.comment && <span className="text-slate-500"> : {e.comment}</span>}
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
