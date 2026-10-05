'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { merchantApiClient } from '@/lib/merchant-api-client';
import { useMerchantProfile } from '@/features/merchant-auth/hooks/use-merchant-profile';
import { getErrorMessage } from '@/lib/utils';

interface Endpoint { id: number; url: string; environment: 'sandbox' | 'production'; active: boolean; secret?: string }
interface Delivery { id: number; event: string; status: string; attempts: number; response_code: number | null; last_error: string | null; created_at: string }

export default function WebhooksPage() {
  const { data: merchant } = useMerchantProfile();
  const queryClient = useQueryClient();
  const [url, setUrl] = useState('');
  const [environment, setEnvironment] = useState<'sandbox' | 'production'>('sandbox');
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);

  const endpoints = useQuery<Endpoint[]>({
    queryKey: ['merchant-webhooks'],
    queryFn: async () => (await merchantApiClient.get('/merchants/webhooks')).data.data,
  });
  const deliveries = useQuery<Delivery[]>({
    queryKey: ['merchant-webhook-deliveries', openId],
    enabled: openId !== null,
    queryFn: async () => (await merchantApiClient.get(`/merchants/webhooks/${openId}/deliveries`)).data.data,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['merchant-webhooks'] });
    queryClient.invalidateQueries({ queryKey: ['merchant-webhook-deliveries'] });
  };

  const create = useMutation({
    mutationFn: async () => (await merchantApiClient.post('/merchants/webhooks', { url, environment })).data.data,
    onSuccess: (d: Endpoint) => { setNewSecret(d.secret ?? null); setUrl(''); refresh(); },
  });
  const toggle = useMutation({
    mutationFn: async (e: Endpoint) => merchantApiClient.put(`/merchants/webhooks/${e.id}`, { active: !e.active }),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: async (id: number) => merchantApiClient.delete(`/merchants/webhooks/${id}`),
    onSuccess: refresh,
  });
  const test = useMutation({
    mutationFn: async (id: number) => merchantApiClient.post(`/merchants/webhooks/${id}/test`),
    onSuccess: () => setTimeout(refresh, 1500),
  });
  const redeliver = useMutation({
    mutationFn: async (id: number) => merchantApiClient.post(`/merchants/webhook-deliveries/${id}/redeliver`),
    onSuccess: () => setTimeout(refresh, 1500),
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="border-b border-slate-100 pb-5">
        <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">Webhooks</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Recevez un POST signé à chaque changement de statut de vos transactions (<code>transaction.success</code>, <code>transaction.failed</code>…).
          En-tête <code>X-Digit-Signature: t=&lt;ts&gt;,v1=&lt;hmac&gt;</code> avec <code>hmac = HMAC_SHA256(&quot;&lt;ts&gt;.&lt;corps&gt;&quot;, secret)</code>. Répondez 2xx ; sinon nouvelles tentatives (30 s, 2 min, 10 min, 1 h, 6 h).
        </p>
      </div>

      {newSecret && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs">
          Copiez votre secret de signature maintenant, il ne sera plus affiché :
          <code className="block mt-1 font-mono text-sm break-all">{newSecret}</code>
          <button className="mt-2 font-bold text-amber-700" onClick={() => setNewSecret(null)}>J&apos;ai copié le secret</button>
        </div>
      )}

      <form className="flex flex-col sm:flex-row gap-2" onSubmit={(e) => { e.preventDefault(); create.mutate(); }}>
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://votre-site.com/webhooks/digit" required
          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" />
        <select value={environment} onChange={(e) => setEnvironment(e.target.value as 'sandbox' | 'production')} className="px-3 py-2 border border-slate-200 rounded-lg text-sm">
          <option value="sandbox">Sandbox</option>
          <option value="production" disabled={merchant?.environment !== 'production'}>Production</option>
        </select>
        <button disabled={create.isPending} className="px-4 py-2 text-xs font-bold uppercase text-white bg-blue-600 hover:bg-blue-500 rounded-xl">Ajouter</button>
      </form>
      {create.isError && <p className="text-xs font-medium text-red-600">{getErrorMessage(create.error)}</p>}

      <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100">
        {endpoints.data?.length === 0 && <p className="p-4 text-sm text-slate-400">Aucun webhook configuré.</p>}
        {endpoints.data?.map((e) => (
          <div key={e.id} className="p-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2 justify-between">
              <div className="text-sm"><span className="font-mono break-all">{e.url}</span> <span className="ml-2 text-[10px] uppercase px-2 py-0.5 rounded bg-slate-100">{e.environment}</span>{!e.active && <span className="ml-2 text-[10px] uppercase text-red-600">désactivé</span>}</div>
              <div className="flex gap-3 text-xs font-semibold text-blue-600">
                <button onClick={() => test.mutate(e.id)}>Tester</button>
                <button onClick={() => setOpenId(openId === e.id ? null : e.id)}>Livraisons</button>
                <button onClick={() => toggle.mutate(e)}>{e.active ? 'Désactiver' : 'Activer'}</button>
                <button className="text-red-600" onClick={() => confirm('Supprimer ce webhook ?') && remove.mutate(e.id)}>Supprimer</button>
              </div>
            </div>
            {openId === e.id && (
              <table className="w-full text-xs">
                <thead className="text-slate-500 uppercase"><tr><th className="text-left py-1">Événement</th><th className="text-left">Statut</th><th className="text-left">Tentatives</th><th className="text-left">Réponse</th><th /></tr></thead>
                <tbody>
                  {deliveries.data?.map((d) => (
                    <tr key={d.id} className="border-t border-slate-50">
                      <td className="py-1.5 font-mono">{d.event}</td>
                      <td>{d.status}</td>
                      <td>{d.attempts}</td>
                      <td>{d.response_code ?? d.last_error ?? '—'}</td>
                      <td className="text-right">{d.status !== 'pending' && <button className="text-blue-600 font-semibold" onClick={() => redeliver.mutate(d.id)}>Rejouer</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
