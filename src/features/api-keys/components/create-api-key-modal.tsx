'use client';

import { useState } from 'react';
import { useApiKeys } from '../hooks/use-api-keys';
import { API_KEY_SCOPES, ApiKeyScope, CreateApiKeyResult } from '../types';
import { getErrorMessage } from '@/lib/utils';

interface CreateApiKeyModalProps {
  merchantEnvironment: 'sandbox' | 'production';
  onClose: () => void;
}

export function CreateApiKeyModal({ merchantEnvironment, onClose }: CreateApiKeyModalProps) {
  const { createApiKey, isCreating } = useApiKeys();
  const [name, setName] = useState('');
  const [environment, setEnvironment] = useState<'sandbox' | 'production'>('sandbox');
  const [scopes, setScopes] = useState<ApiKeyScope[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdKey, setCreatedKey] = useState<CreateApiKeyResult | null>(null);
  const [copied, setCopied] = useState(false);

  const canUseProduction = merchantEnvironment === 'production';

  const toggleScope = (scope: ApiKeyScope) => {
    setScopes((prev) => (prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (scopes.length === 0) {
      setErrorMessage('Sélectionnez au moins une permission.');
      return;
    }

    try {
      const result = await createApiKey({ name: name.trim(), environment, scopes });
      setCreatedKey(result);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  const handleCopy = async () => {
    if (!createdKey) return;
    await navigator.clipboard.writeText(createdKey.key);
    setCopied(true);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-100">
      <div className="bg-white rounded-2xl border border-slate-100 p-6 max-w-lg w-full shadow-2xl space-y-4">
        {createdKey ? (
          <>
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                Clé API générée
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Copiez-la maintenant : pour des raisons de sécurité, elle ne sera plus jamais affichée en clair.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs break-all text-slate-800">
              {createdKey.key}
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className={`w-full py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                copied
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  : 'bg-blue-600 text-white hover:bg-blue-500'
              }`}
            >
              {copied ? '✅ Copiée dans le presse-papier' : '📋 Copier la clé'}
            </button>

            <div className="p-3 bg-amber-50 border border-amber-100 text-amber-800 rounded-xl text-xs font-medium">
              ⚠️ Conservez cette clé dans un endroit sûr (gestionnaire de secrets). En cas de perte, révoquez-la et générez-en une nouvelle.
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all"
              >
                J&apos;ai copié ma clé
              </button>
            </div>
          </>
        ) : (
          <>
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                Nouvelle clé API
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Utilisée pour authentifier vos appels serveur-à-serveur sur /v1/gateway/*.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Nom de la clé
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Serveur de production principal"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Environnement
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setEnvironment('sandbox')}
                    className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                      environment === 'sandbox' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🧪 Sandbox
                  </button>
                  <button
                    type="button"
                    disabled={!canUseProduction}
                    onClick={() => setEnvironment('production')}
                    title={!canUseProduction ? "Compte pas encore activé en production" : undefined}
                    className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                      environment === 'production' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🚀 Production
                  </button>
                </div>
                {!canUseProduction && (
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    La production s&apos;active après validation de votre dossier par notre équipe. Contactez le support.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Permissions (scopes)
                </label>
                <div className="space-y-1.5">
                  {API_KEY_SCOPES.map((scope) => (
                    <label
                      key={scope.value}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        scopes.includes(scope.value)
                          ? 'bg-blue-50/60 border-blue-200'
                          : 'bg-slate-50 border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={scopes.includes(scope.value)}
                        onChange={() => toggleScope(scope.value)}
                        className="mt-0.5 h-3.5 w-3.5 rounded accent-blue-600"
                      />
                      <span>
                        <span className="block text-xs font-bold text-slate-800">{scope.label}</span>
                        <span className="block text-[11px] text-slate-500">{scope.description}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-medium">
                  ⚠️ {errorMessage}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={isCreating}
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 rounded-xl transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white rounded-xl shadow-sm transition-all ${
                    isCreating ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'
                  }`}
                >
                  {isCreating ? 'Génération...' : 'Générer la clé'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
