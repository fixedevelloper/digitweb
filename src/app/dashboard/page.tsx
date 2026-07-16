'use client';

import { useDashboardStats } from '@/features/dashboard/hooks/use-dashboard-stats';

export default function DashboardOverview() {
    const { data: stats, isLoading, isError, error } = useDashboardStats();

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div>
                    <div className="h-9 w-48 bg-slate-200 rounded-lg" />
                    <div className="h-4 w-80 bg-slate-100 rounded mt-2" />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm h-28" />
                    ))}
                </div>
                <div className="h-[400px] bg-white rounded-2xl border border-slate-200" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-6 bg-red-50 border border-red-100 rounded-2xl text-center">
                <p className="text-sm font-semibold text-red-700">⚠️ Échec de la récupération des statistiques en temps réel.</p>
                <p className="text-xs text-red-500 mt-1">{(error as Error)?.message || 'Erreur de connexion avec l\'API.'}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-150">
            {/* En-tête de la page */}
            <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
                    Vue d'ensemble
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                    Suivi en temps réel de vos flux et transferts d'argent sur la passerelle.
                </p>
            </div>

            {/* Grille d'indicateurs clés de performance */}
            <div className="grid gap-4 md:grid-cols-3">
                {/* Volume de Transactions Mensuel */}
                <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-lg text-white">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Volume Transféré (Mois)
                    </p>
                    <p className="text-2xl font-black text-white mt-2">
                        {(stats?.monthlyVolume ?? 0).toLocaleString()} <span className="text-blue-400 text-lg font-bold">XAF</span>
                    </p>
                    <div className="text-[10px] text-slate-400 mt-3 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Flux cumulés sur les 30 derniers jours
                    </div>
                </div>

                {/* Total des transactions validées */}
                <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Transactions Réussies
                    </p>
                    <p className="text-2xl font-black text-emerald-600 mt-2">
                        {(stats?.successfulTransactionsCount ?? 0).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-3">
                        Statut final validé sans litige
                    </p>
                </div>

                {/* Taux de succès global */}
                <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Taux de succès global
                    </p>
                    <p className="text-2xl font-black text-slate-900 mt-2">
                        {stats?.successRate ? stats.successRate.toFixed(1) : '0.0'}%
                    </p>
                    <p className="text-[10px] text-slate-400 mt-3">
                        Ratio d'exécution des passerelles de paiement
                    </p>
                </div>
            </div>

            {/* Zone du Diagramme de Courbes */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
                    <div>
                        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                            Analyse comparative des Flux
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Évolution journalière des opérations de crédit (dépôts/entrées) face aux débits (retraits/sorties).
                        </p>
                    </div>
                </div>

                {/* Note : Tu peux intégrer ici directement ton composant de rendu Recharts, Chart.js ou le widget interactif ci-dessus */}
                <div className="w-full">
                    {/* Composant ou Iframe du module graphique de courbes branché sur `stats.dailyHistory` */}
                </div>
            </div>
        </div>
    );
}