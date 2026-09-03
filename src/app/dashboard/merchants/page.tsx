'use client';

import { useMerchants } from '@/features/merchants/hooks/use-merchants';

export default function MerchantsPage() {
    const { data: merchants, isLoading, error, updateMerchant, isUpdating } = useMerchants();

    if (isLoading) {
        return <div className="p-6 text-sm font-semibold text-slate-500 animate-pulse">Chargement du registre des marchands agrégés...</div>;
    }

    if (error) {
        return <div className="p-6 text-sm font-bold text-red-600">Erreur : Impossible de récupérer les comptes marchands.</div>;
    }

    const handleToggleStatus = (id: number, currentStatus: any) => {
        const isActive = typeof currentStatus === 'string' ? currentStatus === '1' : !!currentStatus;
        updateMerchant({
            id,
            data: { status: !isActive }
        });
    };

    const handleToggleEnvironment = (id: number, currentEnv: 'sandbox' | 'production') => {
        const nextEnv = currentEnv === 'production' ? 'sandbox' : 'production';
        updateMerchant({
            id,
            data: { environment: nextEnv }
        });
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">

            {/* En-tête de page */}
            <div className="border-b border-slate-100 pb-5">
                <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                    Gestion des Marchands B2B
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                    Surveille la balance des intégrateurs, bascule les environnements d&apos;API et gère les droits d&apos;accès à la passerelle de production.
                </p>
            </div>

            {/* Tableau des Marchands */}
            <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="bg-slate-50/75 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                            <th className="py-3 px-5">Entreprise / Contact</th>
                            <th className="py-3 px-5">Environnement</th>
                            <th className="py-3 px-5 text-right">Balance Actuelle</th>
                            <th className="py-3 px-5 text-center">Réseau d&apos;Accès</th>
                            <th className="py-3 px-5 text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                        {merchants?.map((merchant) => {
                            const isActive = typeof merchant.status === 'string' ? merchant.status === '1' : !!merchant.status;
                            const balanceNum = typeof merchant.wallet?.balance === 'string'
                                ? parseFloat(merchant.wallet.balance)
                                : merchant.wallet?.balance || 0;

                            return (
                                <tr key={merchant.id} className="hover:bg-slate-50/50 transition-all">
                                    {/* Infos basiques */}
                                    <td className="py-4 px-5">
                                        <div className="font-bold text-slate-900 text-sm">{merchant.company_name}</div>
                                        <div className="text-slate-400 font-medium mt-0.5">{merchant.name} • {merchant.email}</div>
                                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">+{merchant.phone}</div>
                                    </td>

                                    {/* Badge Sandbox / Production */}
                                    <td className="py-4 px-5 vertical-align-middle">
                                        <button
                                            onClick={() => handleToggleEnvironment(merchant.id, merchant.environment)}
                                            disabled={isUpdating}
                                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono tracking-wider uppercase border transition-all ${
                                                merchant.environment === 'production'
                                                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-600 hover:bg-amber-500/10 hover:text-amber-600 hover:border-amber-500/20'
                                                    : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/20'
                                            }`}
                                        >
                                            {merchant.environment === 'production' ? '🚀 Production' : '🧪 Sandbox'}
                                        </button>
                                    </td>

                                    {/* Solde Financier du Marchand */}
                                    <td className="py-4 px-5 text-right font-mono font-bold text-sm text-slate-900">
                                        {balanceNum.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">{merchant.wallet?.currency || 'XAF'}</span>
                                    </td>

                                    {/* Statut d'activation */}
                                    <td className="py-4 px-5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          {isActive ? 'Autorisé' : 'Révoqué'}
                      </span>
                                    </td>

                                    {/* Actionneurs */}
                                    <td className="py-4 px-5 text-right">
                                        <button
                                            onClick={() => handleToggleStatus(merchant.id, merchant.status)}
                                            disabled={isUpdating}
                                            className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl transition-all ${
                                                isActive
                                                    ? 'bg-red-50 text-red-600 hover:bg-red-500 hover:text-white'
                                                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                                            }`}
                                        >
                                            {isActive ? '🚫 Suspendre' : '🔓 Activer'}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>

                {merchants?.length === 0 && (
                    <div className="p-8 text-center text-slate-400 font-medium">
                        Aucun marchand n&apos;est actuellement configuré sur la plateforme.
                    </div>
                )}
            </div>
        </div>
    );
}