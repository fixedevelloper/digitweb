'use client';

import { useState } from 'react';
import { useAdjustWallet } from '../hooks/use-adjust-wallet';
import { Button } from '@/components/ui/button';

interface AdjustWalletModalProps {
    walletId: number;
    userPhone: string;
    onClose: () => void;
}

export function AdjustWalletModal({ walletId, userPhone, onClose }: AdjustWalletModalProps) {
    const [type, setType] = useState<'credit' | 'debit'>('credit');
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const adjustMutation = useAdjustWallet();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            setErrorMessage('Le montant doit être un nombre strictement supérieur à 0.');
            return;
        }

        if (!reason.trim()) {
            setErrorMessage('Un motif d’ajustement est obligatoire pour le journal d’audit.');
            return;
        }

        adjustMutation.mutate(
            { walletId, type, amount: numericAmount, reason },
            {
                onSuccess: () => {
                    onClose();
                },
                onError: (error: any) => {
                    setErrorMessage(error.message || 'Une erreur est survenue.');
                },
            }
        );
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-6">

                {/* En-tête */}
                <div>
                    <h3 className="text-base font-bold text-slate-900">Ajustement Manuel de Compte</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Modification directe sur le compte associé au téléphone : <span className="font-mono font-bold text-slate-700">{userPhone}</span>
                    </p>
                </div>

                {errorMessage && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-semibold text-red-800">
                        ⚠️ {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Sélecteur d'action (Crédit / Débit) */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Type d'opération</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setType('credit')}
                                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                                    type === 'credit'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-500/10'
                                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                📥 Créditer (Ajouter)
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('debit')}
                                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                                    type === 'debit'
                                        ? 'bg-red-50 text-red-700 border-red-300 ring-2 ring-red-500/10'
                                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                📤 Débiter (Retirer)
                            </button>
                        </div>
                    </div>

                    {/* Saisie du montant */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Montant (XAF)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Ex: 25000"
                            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                            required
                        />
                    </div>

                    {/* Motif / Raison d'audit */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Raison / Référence du litige</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Ex: Régularisation suite à échec de l'API Orange Money - Référence OmX42"
                            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 h-20 resize-none"
                            required
                        />
                    </div>

                    {/* Boutons d'actions */}
                    <div className="flex justify-end gap-2.5 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={adjustMutation.isPending}
                            className="h-9 rounded-xl text-xs font-semibold"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={adjustMutation.isPending}
                            className={`h-9 rounded-xl text-xs font-semibold text-white ${
                                type === 'credit' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'
                            }`}
                        >
                            {adjustMutation.isPending ? 'Exécution...' : 'Confirmer la modification'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}