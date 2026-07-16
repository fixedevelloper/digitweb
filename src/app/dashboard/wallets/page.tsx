'use client';

import { useState } from 'react';
import { WalletMonitor } from '@/features/wallets/components/wallet-monitor';
import { AdjustWalletModal } from '@/features/wallets/components/adjust-wallet-modal';
import { useWallets } from '@/features/wallets/hooks/use-wallets';

export default function WalletsPage() {
    const { data: wallets } = useWallets();

    // États locaux pour piloter l'ouverture de la boîte de dialogue d'ajustement comptable
    const [selectedWallet, setSelectedWallet] = useState<{
        id: number;
        phone: string;
    } | null>(null);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">

            {/* En-tête de la page */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                        Masse Monétaire & Liquidités
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Audit en temps réel des portefeuilles marchands, clients et réserves globales de la passerelle.
                    </p>
                </div>

                {/* Bouton d'action rapide pour ouvrir un ajustement arbitraire */}
                {wallets && wallets.length > 0 && (
                    <button
                        onClick={() => setSelectedWallet({
                            id: wallets[0].id,
                            phone: wallets[0].user?.phone || 'Compte principal'
                        })}
                        className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition-all"
                    >
                        🔧 Ajustement Rapide
                    </button>
                )}
            </div>

            {/* Grille principale de monitoring & Tableau des soldes */}
            <main>
                {/* On passe une fonction de callback pour intercepter le clic sur une ligne du tableau */}
                <WalletMonitor />
            </main>

            {/* Injection conditionnelle de la modale de crédit/débit */}
            {selectedWallet && (
                <AdjustWalletModal
                    walletId={selectedWallet.id}
                    userPhone={selectedWallet.phone}
                    onClose={() => setSelectedWallet(null)}
                />
            )}
        </div>
    );
}