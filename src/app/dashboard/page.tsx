'use client';

import { useDashboardStats } from '@/features/dashboard/hooks/use-dashboard-stats';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

export default function DashboardOverview() {
    const { data: stats, isLoading, isError, error } = useDashboardStats();

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div>
                    <div className="h-9 w-48 bg-slate-200 rounded-lg" />
                    <div className="h-4 w-80 bg-slate-100 rounded mt-2" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {[1, 2, 3, 4].map((n) => (
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
                    Vue d&apos;ensemble
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                    Suivi en temps réel de vos flux et transferts d&apos;argent sur la passerelle.
                </p>
            </div>

            {/* Grille d'indicateurs clés de performance */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
                        Ratio d&apos;exécution des passerelles de paiement
                    </p>
                </div>

                {/* Comptes actifs */}
                <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Comptes actifs
                    </p>
                    <p className="text-2xl font-black text-slate-900 mt-2">
                        {(stats?.activeAccountsCount ?? 0).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-3">
                        Utilisateurs avec un compte activé
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

                <div className="w-full h-[320px]">
                    {stats?.dailyHistory && stats.dailyHistory.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.dailyHistory} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="creditGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="debitGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <YAxis
                                    tick={{ fontSize: 11, fill: '#64748b' }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(value: number) => value.toLocaleString()}
                                />
                                <Tooltip
                                    formatter={(value) => `${Number(value).toLocaleString()} XAF`}
                                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                                />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                <Area type="monotone" dataKey="credit" name="Crédits (dépôts)" stroke="#10b981" fill="url(#creditGradient)" strokeWidth={2} />
                                <Area type="monotone" dataKey="debit" name="Débits (retraits/transferts)" stroke="#f43f5e" fill="url(#debitGradient)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-sm text-slate-400">
                            Aucune donnée sur les 7 derniers jours.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}