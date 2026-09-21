'use client';

import { useState } from 'react';
import { useApiKeys } from '../hooks/use-api-keys';
import { API_KEY_SCOPES, ApiKey } from '../types';

function scopeLabel(scope: string): string {
  return API_KEY_SCOPES.find((s) => s.value === scope)?.label ?? scope;
}

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
}

export function ApiKeyTable() {
  const { data: apiKeys, isLoading, error, revokeApiKey, isRevoking } = useApiKeys();
  const [pendingRevokeId, setPendingRevokeId] = useState<number | null>(null);

  if (isLoading) {
    return <div className="p-6 text-sm font-semibold text-slate-500 animate-pulse">Chargement de vos clés API...</div>;
  }

  if (error) {
    return <div className="p-6 text-sm font-bold text-red-600">Erreur : impossible de récupérer vos clés API.</div>;
  }

  const handleRevoke = (key: ApiKey) => {
    if (pendingRevokeId !== key.id) {
      setPendingRevokeId(key.id);
      return;
    }
    revokeApiKey(key.id);
    setPendingRevokeId(null);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              <th className="py-3 px-5">Nom / Préfixe</th>
              <th className="py-3 px-5">Environnement</th>
              <th className="py-3 px-5">Permissions</th>
              <th className="py-3 px-5">Dernière utilisation</th>
              <th className="py-3 px-5 text-center">Statut</th>
              <th className="py-3 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
            {apiKeys?.map((key) => {
              const isRevoked = !!key.revoked_at;
              return (
                <tr key={key.id} className="hover:bg-slate-50/50 transition-all">
                  <td className="py-4 px-5">
                    <div className="font-bold text-slate-900 text-sm">{key.name}</div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">{key.key_prefix}••••••••</div>
                  </td>

                  <td className="py-4 px-5">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono tracking-wider uppercase border ${
                        key.environment === 'production'
                          ? 'bg-blue-500/10 border-blue-500/20 text-blue-600'
                          : 'bg-slate-100 border-slate-200 text-slate-500'
                      }`}
                    >
                      {key.environment === 'production' ? '🚀 Production' : '🧪 Sandbox'}
                    </span>
                  </td>

                  <td className="py-4 px-5">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {key.scopes.map((scope) => (
                        <span
                          key={scope}
                          className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold"
                        >
                          {scopeLabel(scope)}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-4 px-5 text-slate-500">{formatDate(key.last_used_at)}</td>

                  <td className="py-4 px-5 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isRevoked ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      <span className={`w-1 h-1 rounded-full ${isRevoked ? 'bg-red-500' : 'bg-emerald-500'}`} />
                      {isRevoked ? 'Révoquée' : 'Active'}
                    </span>
                  </td>

                  <td className="py-4 px-5 text-right">
                    {!isRevoked && (
                      <button
                        onClick={() => handleRevoke(key)}
                        disabled={isRevoking}
                        className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl transition-all ${
                          pendingRevokeId === key.id
                            ? 'bg-red-600 text-white'
                            : 'bg-red-50 text-red-600 hover:bg-red-500 hover:text-white'
                        }`}
                      >
                        {pendingRevokeId === key.id ? 'Confirmer ?' : '🗑️ Révoquer'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {apiKeys?.length === 0 && (
        <div className="p-8 text-center text-slate-400 font-medium">
          Aucune clé API pour le moment. Générez-en une pour commencer à intégrer la passerelle.
        </div>
      )}
    </div>
  );
}
