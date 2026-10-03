'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { WALLET_CURRENCY } from '@/features/exchange-rates/currencies';
import { useCurrencyOptions } from '@/features/currencies/hooks/use-currencies';
import { useExchangeRates, useSaveExchangeRate } from '@/features/exchange-rates/hooks/use-exchange-rates';

const formatRate = (value: number) => value.toLocaleString('fr-FR', { maximumFractionDigits: 8 });

const formatDate = (value: string) => new Date(value).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });

export default function ExchangeRatesPage() {
    const { data, isLoading, error } = useExchangeRates();
    const saveMutation = useSaveExchangeRate();
    const currencies = useCurrencyOptions();
    const symbolOf = (code: string) => currencies.find((c) => c.code === code)?.symbol ?? code;

    const [form, setForm] = useState({ base_currency: 'USD', quote_currency: WALLET_CURRENCY, rate: '' });

    if (isLoading) {
        return <div className="p-6 text-sm font-semibold text-slate-500 animate-pulse">Chargement des taux de change...</div>;
    }

    if (error) {
        return <div className="p-6 text-sm font-bold text-red-600">Erreur : Impossible de charger les taux de change.</div>;
    }

    const rate = Number(form.rate);
    const hasValidRate = form.rate !== '' && rate > 0 && form.base_currency !== form.quote_currency;

    // Préremplit le formulaire avec le taux en vigueur d'une paire, pour une simple mise à jour
    const editPair = (base: string, quote: string, currentRate: number) => {
        setForm({ base_currency: base, quote_currency: quote, rate: String(currentRate) });
        saveMutation.reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!hasValidRate) return;

        saveMutation.mutate({ base_currency: form.base_currency, quote_currency: form.quote_currency, rate });
    };

    const apiError = (saveMutation.error as { response?: { data?: { message?: string } } } | null)?.response?.data?.message;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">

            {/* Header de la page */}
            <div className="border-b border-slate-100 pb-5">
                <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                    Taux de Change
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                    Taux manuels appliqués aux opérateurs dont la devise diffère de celle des wallets ({WALLET_CURRENCY}). Un taux saisi dans un sens sert aussi dans l&apos;autre.
                </p>
            </div>

            {/* Taux en vigueur */}
            <section className="space-y-3">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Taux en vigueur</h2>

                {data?.current.length ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {data.current.map((current) => (
                            <div key={current.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
                                <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                                    {current.base_currency} / {current.quote_currency}
                                </div>
                                <div className="text-2xl font-black text-slate-900">
                                    1 {current.base_currency} = {formatRate(current.rate)} {symbolOf(current.quote_currency)}
                                </div>
                                <div className="text-xs text-slate-500 font-semibold">
                                    1 {current.quote_currency} = {formatRate(1 / current.rate)} {current.base_currency}
                                </div>
                                <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400">
                                    <span>
                                        {formatDate(current.created_at)}{current.author?.name ? ` · ${current.author.name}` : ''}
                                    </span>
                                    <button
                                        onClick={() => editPair(current.base_currency, current.quote_currency, current.rate)}
                                        className="text-[11px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-500 bg-blue-50 hover:bg-blue-100/80 px-3 py-1.5 rounded-lg transition-all"
                                    >
                                        Modifier
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold rounded-xl px-4 py-3">
                        Aucun taux configuré : les opérateurs dans une autre devise que {WALLET_CURRENCY} refuseront toute cotation.
                    </div>
                )}
            </section>

            {/* Saisie d'un nouveau taux */}
            <section className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Définir un taux</h3>
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <label className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">1 unité de</label>
                            <select
                                value={form.base_currency}
                                onChange={e => setForm({ ...form, base_currency: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-blue-500 text-xs font-semibold"
                            >
                                {currencies.map((currency) => (
                                    <option key={currency.code} value={currency.code}>{currency.code} — {currency.name} ({currency.symbol})</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Vaut (taux)</label>
                            <input
                                type="number" required min="0" step="any" placeholder="Ex: 605"
                                value={form.rate}
                                onChange={e => setForm({ ...form, rate: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-blue-500 font-mono"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">En</label>
                            <select
                                value={form.quote_currency}
                                onChange={e => setForm({ ...form, quote_currency: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-blue-500 text-xs font-semibold"
                            >
                                {currencies.map((currency) => (
                                    <option key={currency.code} value={currency.code}>{currency.code} — {currency.name} ({currency.symbol})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {form.base_currency === form.quote_currency && (
                        <p className="text-red-600 font-semibold">Choisissez deux devises différentes.</p>
                    )}

                    {hasValidRate && (
                        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-600 font-semibold space-y-0.5">
                            <div>1 {form.base_currency} = {formatRate(rate)} {form.quote_currency}</div>
                            <div>1 {form.quote_currency} = {formatRate(1 / rate)} {form.base_currency}</div>
                        </div>
                    )}

                    {saveMutation.isError && (
                        <p className="text-red-600 font-semibold">{apiError || "L'enregistrement du taux a échoué."}</p>
                    )}
                    {saveMutation.isSuccess && (
                        <p className="text-emerald-600 font-semibold">Taux enregistré. Il s&apos;applique aux prochaines cotations.</p>
                    )}

                    <div className="flex justify-end pt-2 border-t border-slate-200">
                        <Button type="submit" disabled={!hasValidRate || saveMutation.isPending} className="h-8 text-[11px] font-bold bg-blue-600 text-white hover:bg-blue-500">
                            Enregistrer le taux
                        </Button>
                    </div>
                </form>
            </section>

            {/* Historique */}
            <section className="space-y-3">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Historique</h2>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-3.5">Date</th>
                                <th className="px-6 py-3.5">Paire</th>
                                <th className="px-6 py-3.5">Taux</th>
                                <th className="px-6 py-3.5">Saisi par</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data?.history.map((entry) => (
                                <tr key={entry.id}>
                                    <td className="px-6 py-3 text-slate-500">{formatDate(entry.created_at)}</td>
                                    <td className="px-6 py-3 font-mono font-bold text-slate-700">{entry.base_currency} / {entry.quote_currency}</td>
                                    <td className="px-6 py-3 font-semibold text-slate-900">
                                        1 {entry.base_currency} = {formatRate(entry.rate)} {entry.quote_currency}
                                    </td>
                                    <td className="px-6 py-3 text-slate-500">{entry.author?.name || '—'}</td>
                                </tr>
                            ))}
                            {!data?.history.length && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-6 text-center text-slate-400">Aucun taux enregistré.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
