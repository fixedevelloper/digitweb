'use client';

import { FormEvent, useState } from 'react';
import { getErrorMessage } from '@/lib/utils';
import { useMerchantWallet, useSandboxTopUp } from '../hooks/use-merchant-wallet';
import { MerchantEnvironment } from '../types';

const TOP_UP_PRESETS = [100_000, 500_000, 1_000_000];

export function WalletBalanceCard({ environment }: { environment: MerchantEnvironment }) {
  const { data: wallet, isLoading } = useMerchantWallet();
  const topUp = useSandboxTopUp();
  const [amount, setAmount] = useState('');

  const isSandbox = environment === 'sandbox';
  const balance = isSandbox ? wallet?.sandbox_balance : wallet?.balance;

  const handleTopUp = async (event: FormEvent) => {
    event.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) return;

    try {
      await topUp.mutateAsync(value);
      setAmount('');
    } catch {
      // Message affiché via topUp.error
    }
  };

  return (
    <div
      className={`p-6 rounded-2xl border shadow-sm ${
        isSandbox ? 'bg-amber-50/60 border-amber-200' : 'bg-slate-900 border-slate-800 text-white'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <p className={`text-xs font-bold uppercase tracking-wider ${isSandbox ? 'text-amber-700' : 'text-slate-400'}`}>
            {isSandbox ? '🧪 Solde sandbox (fictif)' : '🚀 Solde live'}
          </p>
          <p className={`text-3xl font-black mt-2 ${isSandbox ? 'text-slate-900' : 'text-white'}`}>
            {isLoading || balance === undefined ? '—' : `${balance.toLocaleString('fr-FR')} ${wallet?.currency}`}
          </p>
          <p className={`text-[11px] mt-1 ${isSandbox ? 'text-amber-800/80' : 'text-slate-400'}`}>
            {isSandbox
              ? 'Utilisé par vos clés sk_test_ : aucun argent réel, aucun appel aux opérateurs.'
              : 'Utilisé par vos clés sk_live_ : fonds réels.'}
          </p>
        </div>

        {isSandbox && (
          <form onSubmit={handleTopUp} className="space-y-2 md:min-w-[320px]">
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Recharger le solde de test</p>
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Montant"
                className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-amber-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
              />
              <button
                type="submit"
                disabled={topUp.isPending || !amount}
                className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {topUp.isPending ? '...' : 'Recharger'}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {TOP_UP_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(String(preset))}
                  className="px-2 py-1 rounded-md text-[11px] font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 transition-colors"
                >
                  +{preset.toLocaleString('fr-FR')}
                </button>
              ))}
            </div>
            {topUp.isError && <p className="text-[11px] font-medium text-red-600">{getErrorMessage(topUp.error)}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
