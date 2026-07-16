// @/features/wallets/components/adjust-wallet-modal.tsx
import { useState } from 'react';
import { useAdjustWallet } from '../hooks/use-adjust-wallet'; // Import de votre hook

interface AdjustWalletModalProps {
    walletId: number;
    userPhone: string;
    onClose: () => void;
}

export function AdjustWalletModal({ walletId, userPhone, onClose }: AdjustWalletModalProps) {
    const { mutate, isPending } = useAdjustWallet();
    const [type, setType] = useState<'credit' | 'debit'>('credit');
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            setErrorMessage("Veuillez entrer un montant valide supérieur à 0.");
            return;
        }

        if (!reason.trim()) {
            setErrorMessage("Un motif d'ajustement est requis pour l'audit.");
            return;
        }

        mutate(
            {
                walletId,
                type,
                amount: parsedAmount,
                reason: reason.trim(),
            },
            {
                onSuccess: () => {
                    // Ferme proprement la modale lors de la réussite de la mutation
                    onClose();
                },
                onError: (error: any) => {
                    setErrorMessage(error.message || "Une erreur est survenue lors de l'ajustement.");
                }
            }
        );
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-100">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 max-w-md w-full shadow-2xl space-y-4">
                <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                        Ajustement Manuel de Solde
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Modification arbitraire sur le compte : <span className="font-mono font-bold text-slate-700">{userPhone}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Sélecteur de type d'opération */}
                    <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setType('credit')}
                            className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                                type === 'credit'
                                    ? 'bg-white text-emerald-600 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            ➕ Créditer
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('debit')}
                            className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                                type === 'debit'
                                    ? 'bg-white text-red-600 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            ➖ Débiter
                        </button>
                    </div>

                    {/* Champ de Saisie du Montant */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Montant (XAF)
                        </label>
                        <input
                            type="number"
                            required
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Saisissez la valeur"
                            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                        />
                    </div>

                    {/* Motif de l'Ajustement */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Motif réglementaire
                        </label>
                        <textarea
                            required
                            rows={3}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Ex: Correction suite à un échec de validation MTN Mobile Money..."
                            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 resize-none"
                        />
                    </div>

                    {/* Message d'erreur localisé */}
                    {errorMessage && (
                        <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-medium">
                            ⚠️ {errorMessage}
                        </div>
                    )}

                    {/* Actions de validation */}
                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            disabled={isPending}
                            onClick={onClose}
                            className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 rounded-xl transition-all"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white rounded-xl shadow-sm transition-all ${
                                isPending
                                    ? 'bg-slate-400 cursor-not-allowed'
                                    : type === 'credit'
                                    ? 'bg-emerald-600 hover:bg-emerald-700'
                                    : 'bg-red-600 hover:bg-red-700'
                            }`}
                        >
                            {isPending ? 'Exécution...' : 'Appliquer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}