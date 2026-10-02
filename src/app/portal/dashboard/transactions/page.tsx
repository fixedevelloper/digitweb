'use client';

import { useState } from 'react';
import { useMerchantProfile } from '@/features/merchant-auth/hooks/use-merchant-profile';
import { WalletBalanceCard } from '@/features/merchant-wallet/components/wallet-balance-card';
import { MerchantTransactionTable } from '@/features/merchant-wallet/components/merchant-transaction-table';
import { MerchantEnvironment } from '@/features/merchant-wallet/types';

const ENVIRONMENTS: { value: MerchantEnvironment; label: string }[] = [
  { value: 'production', label: '🚀 Live' },
  { value: 'sandbox', label: '🧪 Sandbox' },
];

export default function PortalTransactionsPage() {
  const { data: merchant } = useMerchantProfile();
  // Par défaut : l'environnement du compte (sandbox tant que la production n'est pas activée).
  const [selected, setSelected] = useState<MerchantEnvironment | null>(null);
  const environment = selected ?? (merchant?.environment === 'production' ? 'production' : 'sandbox');

  return (
    <div className="space-y-6 animate-in fade-in duration-150 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Wallet & transactions</h1>
          <p className="text-sm text-slate-500 mt-0.5">Votre solde et l&apos;historique des opérations faites avec vos clés API.</p>
        </div>

        <div className="inline-flex p-1 bg-slate-200/60 rounded-xl self-start" role="tablist" aria-label="Environnement">
          {ENVIRONMENTS.map((env) => (
            <button
              key={env.value}
              role="tab"
              aria-selected={environment === env.value}
              onClick={() => setSelected(env.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                environment === env.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {env.label}
            </button>
          ))}
        </div>
      </div>

      {environment === 'production' && merchant && merchant.environment !== 'production' && (
        <div className="px-4 py-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-800">
          Votre compte n&apos;est pas encore activé en production : les opérations live seront disponibles après
          validation par notre équipe.
        </div>
      )}

      <WalletBalanceCard environment={environment} />

      {environment === 'sandbox' && (
        <div className="px-5 py-4 rounded-2xl bg-white border border-slate-200/80 text-xs text-slate-600 space-y-1.5">
          <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Numéros de test</p>
          <p>Le résultat d&apos;une opération sandbox dépend de la fin du numéro du destinataire :</p>
          <ul className="list-disc pl-5 space-y-0.5">
            <li>
              se termine par <code className="px-1 bg-slate-100 rounded font-mono">0002</code> : échec (le montant est
              recrédité) ;
            </li>
            <li>
              se termine par <code className="px-1 bg-slate-100 rounded font-mono">0003</code> : reste en cours ;
            </li>
            <li>tout autre numéro : succès.</li>
          </ul>
        </div>
      )}

      <MerchantTransactionTable key={environment} environment={environment} />
    </div>
  );
}
