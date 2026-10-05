'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface Check { name: string; label: string; status: 'ok' | 'warning' | 'critical'; message: string; value: number | null }
interface Monitoring {
  overall: 'ok' | 'warning' | 'critical';
  checks: Check[];
  checked_at: string;
  scheduler_last_run: string | null;
  scheduler_stale: boolean;
}

const STYLE = {
  ok: { dot: 'bg-green-500', badge: 'bg-green-100 text-green-700', label: 'OK' },
  warning: { dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700', label: 'Attention' },
  critical: { dot: 'bg-red-500', badge: 'bg-red-100 text-red-700', label: 'Critique' },
} as const;

const BANNER = {
  ok: 'Tous les contrôles sont au vert.',
  warning: 'Des points demandent votre attention.',
  critical: 'Un problème critique nécessite une action immédiate.',
} as const;

export default function MonitoringPage() {
  const { data, isLoading, isError } = useQuery<Monitoring>({
    queryKey: ['admin-monitoring'],
    queryFn: async () => (await apiClient.get('/admin/monitoring')).data.data,
    refetchInterval: 30_000,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Supervision</h1>
        <p className="text-slate-500">Santé de la plateforme, actualisée toutes les 30 s. Les alertes sont envoyées par webhook / e-mail à chaque changement d&apos;état.</p>
      </div>

      {isError && <p className="text-sm font-medium text-red-600">Impossible de charger l&apos;état de santé.</p>}

      {data && (
        <>
          <div className={`rounded-2xl border p-4 flex items-center gap-3 ${data.overall === 'ok' ? 'bg-green-50 border-green-200' : data.overall === 'warning' ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
            <span className={`h-3 w-3 rounded-full ${STYLE[data.overall].dot}`} />
            <span className="font-semibold text-slate-900">{BANNER[data.overall]}</span>
          </div>

          {data.scheduler_stale && (
            <p className="text-sm bg-red-50 border border-red-200 text-red-800 rounded-xl p-3">
              ⚠️ Le planificateur n&apos;a pas tourné depuis plus de 5 minutes
              {data.scheduler_last_run ? ` (dernier passage : ${new Date(data.scheduler_last_run).toLocaleString()})` : ''} :
              le service <code>scheduler</code> est peut-être arrêté, ce qui suspend aussi les contrôles de statut Digitwave et les alertes.
            </p>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            {data.checks.map((c) => (
              <div key={c.name} className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 text-sm">{c.label}</span>
                  <span className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full ${STYLE[c.status].badge}`}>{STYLE[c.status].label}</span>
                </div>
                <p className="text-xs text-slate-600">{c.message}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-400">Mesuré le {new Date(data.checked_at).toLocaleString()}</p>
        </>
      )}
      {isLoading && <p className="text-sm text-slate-400">Chargement…</p>}
    </div>
  );
}
