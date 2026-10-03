'use client';

import Link from 'next/link';
import { useMerchantProfile } from '@/features/merchant-auth/hooks/use-merchant-profile';
import { useApiKeys } from '@/features/api-keys/hooks/use-api-keys';
import { useMerchantWallet } from '@/features/merchant-wallet/hooks/use-merchant-wallet';
import { getApiDocsUrl } from '@/lib/utils';

export default function PortalOverviewPage() {
  const { data: merchant, isLoading: isMerchantLoading } = useMerchantProfile();
  const { data: apiKeys, isLoading: isKeysLoading } = useApiKeys();
  const { data: wallet } = useMerchantWallet();

  if (isMerchantLoading) {
    return <div className="text-sm font-semibold text-slate-500 animate-pulse">Chargement de votre profil...</div>;
  }

  const activeKeysCount = apiKeys?.filter((k) => !k.revoked_at).length ?? 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-150 max-w-5xl">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Vue d&apos;ensemble</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Bienvenue{merchant ? `, ${merchant.name}` : ''}. Gérez votre intégration à la passerelle DigitaGateway.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-lg text-white">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Compte</p>
          <p className="text-lg font-black text-white mt-2">{merchant?.company_name}</p>
          <p className="text-[11px] text-slate-400 mt-1">{merchant?.email}</p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Environnement</p>
          <p className={`text-lg font-black mt-2 ${merchant?.environment === 'production' ? 'text-blue-600' : 'text-slate-900'}`}>
            {merchant?.environment === 'production' ? '🚀 Production' : '🧪 Sandbox'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {merchant?.environment === 'production'
              ? 'Vos clés production peuvent traiter de vrais fonds.'
              : "Passage en production après validation par notre équipe."}
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Clés API actives</p>
          <p className="text-lg font-black text-slate-900 mt-2">
            {isKeysLoading ? '—' : activeKeysCount}
          </p>
          <Link href="/portal/dashboard/api-keys" className="text-[11px] font-semibold text-blue-600 hover:text-blue-500 mt-1 inline-block">
            Gérer mes clés →
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Solde live</p>
          <p className="text-lg font-black text-slate-900 mt-2">
            {wallet ? `${wallet.balance.toLocaleString('fr-FR')} ${wallet.currency}` : '—'}
          </p>
          <Link href="/portal/dashboard/transactions" className="text-[11px] font-semibold text-blue-600 hover:text-blue-500 mt-1 inline-block">
            Voir les transactions →
          </Link>
        </div>
        <div className="p-6 bg-amber-50/60 rounded-2xl border border-amber-200 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Solde sandbox (fictif)</p>
          <p className="text-lg font-black text-slate-900 mt-2">
            {wallet ? `${wallet.sandbox_balance.toLocaleString('fr-FR')} ${wallet.currency}` : '—'}
          </p>
          <Link href="/portal/dashboard/transactions" className="text-[11px] font-semibold text-amber-700 hover:text-amber-600 mt-1 inline-block">
            Transactions de test →
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Démarrer l&apos;intégration</h2>
          <p className="text-xs text-slate-500 mt-0.5">Trois étapes pour appeler la passerelle depuis vos serveurs.</p>
        </div>

        <ol className="space-y-3 text-xs text-slate-600">
          <li className="flex gap-3">
            <span className="shrink-0 h-6 w-6 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center">1</span>
            <span>
              Générez une clé API sandbox depuis{' '}
              <Link href="/portal/dashboard/api-keys" className="font-semibold text-blue-600 hover:text-blue-500">
                Clés API
              </Link>{' '}
              en sélectionnant les permissions dont vous avez besoin.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="shrink-0 h-6 w-6 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center">2</span>
            <span>
              Appelez <code className="px-1.5 py-0.5 bg-slate-100 rounded font-mono">/api/v1/gateway/*</code> avec l&apos;en-tête{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 rounded font-mono">Authorization: Bearer sk_test_...</code>
            </span>
          </li>
          <li className="flex gap-3">
            <span className="shrink-0 h-6 w-6 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center">3</span>
            <span>
              Consultez la{' '}
              <a href={getApiDocsUrl()} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:text-blue-500">
                documentation complète des endpoints
              </a>{' '}
              pour les schémas de requête/réponse. En sandbox, les opérations sont simulées sur votre solde de test
              (voir les numéros de test dans{' '}
              <Link href="/portal/dashboard/transactions" className="font-semibold text-blue-600 hover:text-blue-500">
                Wallet &amp; transactions
              </Link>
              ).
            </span>
          </li>
        </ol>
      </div>
    </div>
  );
}
