'use client';

import { useWallets } from '../hooks/use-wallets';

// Déclaration de l'interface pour recevoir le callback de la page parente
interface WalletMonitorProps {
    onAdjustWallet?: (id: number, phone: string) => void;
}

export function WalletMonitor({ onAdjustWallet }: WalletMonitorProps) {
    const { data: wallets, totalSystemLiquidity, isLoading, isError } = useWallets();

    if (isLoading) return <div className="text-center py-12 text-sm text-slate-500 animate-pulse">Calcul de la masse monétaire globale...</div>;
    if (isError) return <div className="text-center py-12 text-sm text-red-500 font-medium">⚠️ Erreur lors de l'audit des portefeuilles.</div>;

    return (
        <div className="space-y-6">
            {/* Carte Métrique : Liquidité Totale Plateforme */}
            <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Masse Monétaire en Circulation (Détenue)</p>
                        <p className="text-3xl font-black text-white mt-2">
                            {totalSystemLiquidity.toLocaleString()} <span className="text-blue-400 text-xl font-bold">XAF</span>
                        </p>
                    </div>
                    <div className="h-12 w-12 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-center text-xl">
                        🏦
                    </div>
                </div>
                <div className="text-[11px] text-slate-400 mt-4 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Garantie de couverture sur {wallets?.length || 0} comptes actifs
                </div>
            </div>

            {/* Tableau d'Audit des Portefeuilles individuels */}
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <div>
                        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Répartition des Soldes</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Surveillance des comptes utilisateurs, marchands et administrateurs.</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            <th className="px-6 py-3.5">ID Portefeuille</th>
                            <th className="px-6 py-3.5">Détenteur & Mobile</th>
                            <th className="px-6 py-3.5">Type de Compte</th>
                            <th className="px-6 py-3.5 text-right">Solde Disponible</th>
                            {onAdjustWallet && <th className="px-6 py-3.5 text-right">Actions</th>}
                        </tr>
                        </thead>
                        <tbody className="text-xs divide-y divide-slate-100 text-slate-700 font-medium">
                        {wallets?.map((wallet) => (
                            <tr
                                key={wallet.id}
                                className={`transition-colors ${onAdjustWallet ? 'hover:bg-slate-50/80 cursor-pointer' : 'hover:bg-slate-50/40'}`}
                                // Clic sur la ligne entière pour ouvrir l'ajustement
                                onClick={() => {
                                    if (onAdjustWallet) {
                                        onAdjustWallet(wallet.id, wallet.user?.phone || 'Compte sans numéro');
                                    }
                                }}
                            >
                                {/* ID Wallet */}
                                <td className="px-6 py-4 font-mono font-bold text-slate-400">
                                    #W-{wallet.id.toString().padStart(5, '0')}
                                </td>

                                {/* Utilisateur / Téléphone */}
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-900">{wallet.user?.name || 'Compte Incomplet'}</div>
                                    <div className="text-[10px] text-slate-400 font-mono font-bold mt-0.5">{wallet.user?.phone}</div>
                                </td>

                                {/* Rôle Système */}
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                        wallet.user?.role === 'superadmin' || wallet.user?.role === 'admin'
                                            ? 'bg-blue-50 text-blue-700 border border-blue-200/50'
                                            : wallet.user?.role === 'merchant'
                                            ? 'bg-purple-50 text-purple-700 border border-purple-200/50'
                                            : 'bg-slate-50 text-slate-600 border border-slate-200/50'
                                    }`}>
                                        {wallet.user?.role || 'customer'}
                                    </span>
                                </td>

                                {/* Solde Financier */}
                                <td className="px-6 py-4 text-right">
                                    <span className="font-mono font-black text-slate-900 text-sm">
                                      {Number(wallet.balance).toLocaleString()}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 ml-1.5 font-mono">{wallet.currency}</span>
                                </td>

                                {/* Bouton Ajuster de manière explicite */}
                                {onAdjustWallet && (
                                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={() => onAdjustWallet(wallet.id, wallet.user?.phone || 'Compte sans numéro')}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                                        >
                                            🔧 Ajuster
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}

                        {wallets?.length === 0 && (
                            <tr>
                                <td colSpan={onAdjustWallet ? 5 : 4} className="px-6 py-12 text-center text-sm text-slate-400">
                                    Aucun portefeuille n'est provisionné dans le système.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}