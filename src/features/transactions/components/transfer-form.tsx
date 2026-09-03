'use client';

import { useState, useEffect } from 'react';
import { useCreateTransfer } from '../hooks/use-create-transfer';
import { useOperators } from '@/features/operators/hooks/use-operators';
import { Button } from '@/components/ui/button';

export function TransferForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const { data: operators } = useOperators();
  const createTransferMutation = useCreateTransfer();

  // Filtrer uniquement les opérateurs actifs sur le réseau de production
  const activeOperators = operators?.filter(op => op.status) || [];
  const selectedOperator = activeOperators.find(op => op.id === Number(selectedOperatorId));

  // Validation dynamique du numéro selon la Regex de l'opérateur choisi
  useEffect(() => {
    if (!phone || !selectedOperator) {
      setValidationError(null);
      return;
    }

    if (selectedOperator.prefix_regex) {
      const regex = new RegExp(selectedOperator.prefix_regex);
      if (!regex.test(phone)) {
        setValidationError(`Le format du numéro ne correspond pas à un réseau ${selectedOperator.name}.`);
        return;
      }
    }

    if (phone.length !== selectedOperator.phone_length) {
      setValidationError(`La longueur attendue pour ce réseau est de ${selectedOperator.phone_length} chiffres (hors indicatif).`);
      return;
    }

    setValidationError(null);
  }, [phone, selectedOperator]);

  // Calcul des frais prévisionnels à afficher à l'admin
  const numericAmount = Number(amount) || 0;
  const estimatedFees = selectedOperator
      ? Number(selectedOperator.fixed_fee) + (numericAmount * Number(selectedOperator.percent_fee))
      : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validationError || !selectedOperator) return;

    if (numericAmount < Number(selectedOperator.min_amount) || numericAmount > Number(selectedOperator.max_amount)) {
      setValidationError(`Le montant doit être compris entre ${Number(selectedOperator.min_amount).toLocaleString()} et ${Number(selectedOperator.max_amount).toLocaleString()} XAF.`);
      return;
    }

    createTransferMutation.mutate({
      recipient_name: name,
      recipient_phone: phone,
      recipient_operator: selectedOperator.code, // Envoi du code standardisé (ex: MTN_CG, AIRTEL_TZ)
      amount_sent: numericAmount,
      fees: estimatedFees
    }, {
      onSuccess: () => {
        setIsOpen(false);
        setName('');
        setPhone('');
        setAmount('');
        setSelectedOperatorId('');
      }
    });
  };

  return (
      <div>
        <Button onClick={() => setIsOpen(true)} className="bg-blue-600 hover:bg-blue-500 font-bold text-xs uppercase tracking-wider rounded-xl">
          ➕ Nouveau Transfert
        </Button>

        {isOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Initier un transfert de fonds</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Le débit s&apos;effectuera directement sur la balance de l&apos;initiateur.</p>
                </div>

                {validationError && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-semibold text-red-800">
                      ⚠️ {validationError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Choix du réseau télécom */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Opérateur & Corridor</label>
                    <select
                        value={selectedOperatorId}
                        onChange={e => { setSelectedOperatorId(e.target.value); setPhone(''); }}
                        required
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 font-medium"
                    >
                      <option value="">Sélectionner le réseau de routage</option>
                      {activeOperators.map(op => (
                          <option key={op.id} value={op.id}>
                            {op.name} ({op.code})
                          </option>
                      ))}
                    </select>
                  </div>

                  {/* Nom du bénéficiaire */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Nom complet du destinataire</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Ex: Jean Paul" className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
                  </div>

                  {/* Numéro de téléphone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Téléphone local (sans indicatif)</label>
                    <input
                        type="text"
                        value={phone}
                        onChange={e => setPhone(e.target.value.replace(/\s/g, ''))}
                        required
                        disabled={!selectedOperatorId}
                        placeholder={selectedOperator ? `Ex: ${selectedOperator.phone_length} chiffres` : "Sélectionnez un opérateur d'abord"}
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-blue-500 disabled:bg-slate-100"
                    />
                  </div>

                  {/* Montant numérique */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Montant brut à transférer</label>
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="Montant nominal" className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
                  </div>

                  {/* Encadré d'Aperçu des Frais Réels */}
                  {selectedOperator && numericAmount > 0 && (
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-xs space-y-1.5">
                        <div className="flex justify-between text-slate-500 font-medium">
                          <span>Frais du réseau ({Number(selectedOperator.percent_fee * 100).toFixed(1)}%) :</span>
                          <span className="font-mono text-slate-700">+{estimatedFees.toLocaleString()} XAF</span>
                        </div>
                        <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-1.5">
                          <span>Total à débiter du wallet :</span>
                          <span className="text-blue-600 font-mono">{(numericAmount + estimatedFees).toLocaleString()} XAF</span>
                        </div>
                      </div>
                  )}

                  {/* Actions de validation */}
                  <div className="flex justify-end gap-2.5 pt-2">
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="h-9 rounded-xl text-xs font-semibold">
                      Annuler
                    </Button>
                    <Button
                        type="submit"
                        disabled={createTransferMutation.isPending || !!validationError || !selectedOperatorId}
                        className="h-9 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800"
                    >
                      {createTransferMutation.isPending ? 'Exécution du flux...' : "Confirmer l'envoi"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
        )}
      </div>
  );
}