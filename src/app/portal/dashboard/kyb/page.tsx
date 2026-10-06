'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { merchantApiClient } from '@/lib/merchant-api-client';
import { getErrorMessage } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DOC_STATUS_LABELS, KYB_STATUS_LABELS, KybChecklistItem, KybOverview, KybProfile, saveBlob } from '@/features/kyb/types';

const input = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500';
const EMPTY: Record<keyof KybProfile, string> = { registration_number: '', tax_id: '', country: '', address: '', business_description: '', expected_monthly_volume: '' };

function DocumentRow({ item, locked }: { item: KybChecklistItem; locked: boolean }) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [expiresAt, setExpiresAt] = useState('');
  const doc = item.document;

  const upload = useMutation({
    mutationFn: async () => {
      const form = new FormData();
      form.append('type', item.type);
      form.append('file', file as File);
      if (expiresAt) form.append('expires_at', expiresAt);
      return (await merchantApiClient.post('/merchants/kyb/documents', form, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
    },
    onSuccess: () => { setFile(null); setExpiresAt(''); queryClient.invalidateQueries({ queryKey: ['merchant-kyb'] }); },
  });

  const download = async () => {
    const res = await merchantApiClient.get(`/merchants/kyb/documents/${doc!.id}/file`, { responseType: 'blob' });
    saveBlob(res.data as Blob, doc!.original_name);
  };

  return (
    <div className="p-4 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="text-sm font-semibold text-slate-900">{item.label}</span>
          <span className={`ml-2 text-[10px] font-bold uppercase ${item.required ? 'text-red-500' : 'text-slate-400'}`}>{item.required ? 'Obligatoire' : 'Facultatif'}</span>
        </div>
        {doc && (
          <span className={`text-xs font-bold ${item.expired ? 'text-red-600' : DOC_STATUS_LABELS[doc.status].className}`}>
            {item.expired ? 'Expirée' : DOC_STATUS_LABELS[doc.status].label}
          </span>
        )}
      </div>

      {doc && (
        <p className="text-xs text-slate-500">
          <button type="button" onClick={download} className="font-semibold text-blue-600 hover:text-blue-500">{doc.original_name}</button>
          {doc.expires_at && <> · valable jusqu&apos;au {doc.expires_at}</>}
        </p>
      )}
      {doc?.status === 'rejected' && <p className="text-xs font-medium text-red-600">Refusée : {doc.rejection_reason}</p>}

      {!locked && (
        <div className="flex flex-wrap items-center gap-2">
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-xs" />
          {item.expires && <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="px-2 py-1 border border-slate-200 rounded-lg text-xs" title="Date de fin de validité" />}
          <Button type="button" variant="outline" className="text-xs px-3 py-1" disabled={!file || upload.isPending} onClick={() => upload.mutate()}>
            {doc ? 'Remplacer' : 'Déposer'}
          </Button>
        </div>
      )}
      {upload.isError && <p className="text-xs font-medium text-red-600">{getErrorMessage(upload.error)}</p>}
    </div>
  );
}

export default function KybPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<KybOverview>({
    queryKey: ['merchant-kyb'],
    queryFn: async () => (await merchantApiClient.get('/merchants/kyb')).data.data,
  });

  // Saisie locale ; tant qu'elle n'a pas été modifiée, on affiche le profil enregistré.
  const [edits, setEdits] = useState<Record<keyof KybProfile, string> | null>(null);
  const saved = data?.profile;
  const form = edits ?? (saved ? ({ ...EMPTY, ...Object.fromEntries(Object.entries(saved).filter(([k]) => k in EMPTY).map(([k, v]) => [k, v ?? ''])) } as Record<keyof KybProfile, string>) : EMPTY);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['merchant-kyb'] });
  const saveProfile = useMutation({
    mutationFn: async () => (await merchantApiClient.put('/merchants/kyb/profile', form)).data,
    onSuccess: () => { setEdits(null); refresh(); },
  });
  const submit = useMutation({
    mutationFn: async () => (await merchantApiClient.post('/merchants/kyb/submit')).data,
    onSuccess: refresh,
  });

  if (isLoading || !data) return <p className="text-sm text-slate-400">Chargement…</p>;

  const status = KYB_STATUS_LABELS[data.kyb_status];
  const locked = data.kyb_status === 'in_review';
  const required = data.documents.filter((d) => d.required);
  const done = required.filter((d) => d.document && d.document.status !== 'rejected' && !d.expired).length;
  const set = (k: keyof KybProfile) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setEdits({ ...form, [k]: e.target.value });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">Dossier de vérification</h1>
          <span className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-full ${status.className}`}>{status.label}</span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Pour activer votre compte en production, nous devons vérifier votre entreprise. Renseignez vos informations, déposez les pièces demandées
          (PDF, JPG ou PNG, 5 Mo maximum), puis soumettez votre dossier. Tant qu&apos;il n&apos;est pas approuvé, vous restez en sandbox.
        </p>
      </div>

      {data.kyb_status === 'approved' && <p className="text-sm bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3">Votre dossier est approuvé. Notre équipe peut maintenant activer votre compte en production.</p>}
      {data.kyb_status === 'rejected' && <p className="text-sm bg-red-50 border border-red-200 text-red-800 rounded-xl p-3">Dossier refusé : {data.rejection_reason}. Corrigez-le puis soumettez-le à nouveau.</p>}
      {locked && <p className="text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3">Votre dossier est en cours d&apos;examen : il ne peut pas être modifié pour l&apos;instant.</p>}
      {data.grace_until && data.kyb_status !== 'approved' && data.kyb_status !== 'in_review' && (
        new Date(data.grace_until) < new Date() ? (
          <p className="text-sm bg-red-50 border border-red-200 text-red-800 rounded-xl p-3">
            Le délai pour compléter ce dossier est dépassé ({new Date(data.grace_until).toLocaleDateString()}). Complétez-le dès maintenant : l&apos;accès de votre compte à la production va être réexaminé.
          </p>
        ) : (
          <p className="text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3">
            Votre compte est déjà en production : merci de compléter ce dossier avant le {new Date(data.grace_until).toLocaleDateString()}. Nous vous enverrons des rappels par e-mail.
          </p>
        )
      )}

      <form className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3" onSubmit={(e) => { e.preventDefault(); saveProfile.mutate(); }}>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">Informations de l&apos;entreprise</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <input className={input} placeholder="N° de registre de commerce" value={form.registration_number} onChange={set('registration_number')} disabled={locked} required />
          <input className={input} placeholder="Identifiant fiscal (NIF / NIU)" value={form.tax_id} onChange={set('tax_id')} disabled={locked} required />
          <input className={input} placeholder="Pays d'immatriculation" value={form.country} onChange={set('country')} disabled={locked} required />
          <input className={input} type="number" min="0" placeholder="Volume mensuel attendu (XAF)" value={form.expected_monthly_volume} onChange={set('expected_monthly_volume')} disabled={locked} required />
        </div>
        <input className={input} placeholder="Adresse du siège" value={form.address} onChange={set('address')} disabled={locked} required />
        <textarea className={input} rows={3} placeholder="Votre activité et l'usage prévu de la passerelle" value={form.business_description} onChange={set('business_description')} disabled={locked} required />
        {saveProfile.isError && <p className="text-xs font-medium text-red-600">{getErrorMessage(saveProfile.error)}</p>}
        {!locked && <Button type="submit" disabled={saveProfile.isPending}>Enregistrer les informations</Button>}
      </form>

      <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100">
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">Pièces justificatives</h2>
          <span className="text-xs font-semibold text-slate-500">{done} / {required.length} obligatoires déposées</span>
        </div>
        {data.documents.map((item) => <DocumentRow key={item.type} item={item} locked={locked} />)}
      </div>

      {submit.isError && <p className="text-xs font-medium text-red-600">{getErrorMessage(submit.error)}</p>}
      {(data.kyb_status === 'incomplete' || data.kyb_status === 'rejected') && (
        <div className="flex items-center gap-3">
          <Button disabled={!data.can_submit || submit.isPending} onClick={() => submit.mutate()}>Soumettre mon dossier</Button>
          {!data.can_submit && <span className="text-xs text-slate-500">Complétez les informations et toutes les pièces obligatoires pour pouvoir soumettre.</span>}
        </div>
      )}
    </div>
  );
}
