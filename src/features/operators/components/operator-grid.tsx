'use client';

import { useOperators } from '../hooks/use-operators';
import { Button } from '@/components/ui/button';

export function OperatorGrid() {
    const { data: operators, isLoading, isError, updateOperator } = useOperators();

    const toggleStatus = (id: number, currentStatus: boolean) => {
        updateOperator({ id, data: { status: !currentStatus } });
    };

    if (isLoading) return <div className="text-center py-12 text-sm text-slate-500 animate-pulse">Chargement de la configuration des passerelles télécoms...</div>;
    if (isError) return <div className="text-center py-12 text-sm text-red-500 font-medium">⚠️ Impossible de charger les configurations opérateurs.</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">Routage & Opérateurs Mobile Money</h2>
                    <p className="text-xs text-slate-500">Gérez les statuts de coupure, les expressions régulières de préfixe et la structure des frais.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {operators?.map((operator) => (
                    <div
                        key={operator.id}
                        className={`bg-white rounded-2xl border p-5 shadow-sm transition-all flex flex-col justify-between ${
                            operator.status ? 'border-slate-200/80' : 'border-red-200 bg-red-50/10'
                        }`}
                    >
                        {/* Header de la carte */}
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-xs text-slate-600 border border-slate-200 uppercase">
                                    {operator.name.substring(0, 3)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-sm">{operator.name}</h3>
                                    <code className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-semibold">
                                        {operator.code}
                                    </code>
                                </div>
                            </div>

                            {/* Toggle de Statut Commutateur de Production */}
                            <button
                                onClick={() => toggleStatus(operator.id, operator.status)}
                                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                    operator.status ? 'bg-emerald-500' : 'bg-slate-300'
                                }`}
                            >
                <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        operator.status ? 'translate-x-4' : 'translate-x-0'
                    }`}
                />
                            </button>
                        </div>

                        {/* Détails Techniques & Regex */}
                        <div className="mt-5 space-y-3 border-y border-slate-100 py-3.5 text-xs">
                            <div className="flex justify-between">
                                <span className="text-slate-400 font-medium">Validation Regex :</span>
                                <code className="text-[11px] font-mono font-bold bg-slate-50 text-blue-600 px-1 rounded">
                                    {operator.prefix_regex || 'Aucun'}
                                </code>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400 font-medium">Limites de transfert :</span>
                                <span className="font-bold text-slate-700">
                  {Number(operator.min_amount).toLocaleString()} - {Number(operator.max_amount).toLocaleString()} XAF
                </span>
                            </div>
                        </div>

                        {/* Structure Financière des Frais */}
                        <div className="mt-4 bg-slate-50 rounded-xl p-3 grid grid-cols-2 gap-2 text-center text-xs">
                            <div className="border-r border-slate-200">
                                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Frais Fixe</div>
                                <div className="font-bold text-slate-800 mt-0.5">{Number(operator.fixed_fee).toLocaleString()} XAF</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Frais Pourcentage</div>
                                <div className="font-bold text-slate-800 mt-0.5">{Number(operator.percent_fee * 100).toFixed(2)} %</div>
                            </div>
                        </div>

                        {/* Pied de Carte : Statut Visuel */}
                        <div className="mt-5 pt-1 flex items-center justify-between text-[11px]">
              <span className={`inline-flex items-center gap-1.5 font-bold ${
                  operator.status ? 'text-emerald-600' : 'text-red-500'
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${operator.status ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  {operator.status ? 'Passerelle Active' : 'Canal Interrompu'}
              </span>

                            <Button  variant="outline" className="h-7 text-[11px] rounded-lg border-slate-200 shadow-sm">
                                Ajuster les frais
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}