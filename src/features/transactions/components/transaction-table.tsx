'use client';

import { useTransactions } from '../hooks/use-transactions';

export function TransactionTable() {
  const { data: transactions, isLoading, isError } = useTransactions();

  if (isLoading) return <div className="text-center py-8 text-sm text-slate-500 animate-pulse">Chargement du grand livre des transactions...</div>;
  if (isError) return <div className="text-center py-8 text-sm text-red-500 font-medium">⚠️ Échec de connexion avec l'API Digit-Gateway.</div>;

  return (
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xl shadow-slate-100/40">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Journal d'Audit Global</h2>
          <span className="text-xs bg-slate-200/60 text-slate-700 px-2.5 py-1 rounded-lg font-semibold">
          {transactions?.length || 0} Flux référencés
        </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-3.5">Référence Internes / API</th>
              <th className="px-6 py-3.5">Type & Réseau</th>
              <th className="px-6 py-3.5">Bénéficiaire</th>
              <th className="px-6 py-3.5">Montant Envoyé</th>
              <th className="px-6 py-3.5">Marge Net Admin</th>
              <th className="px-6 py-3.5">Statut</th>
              <th className="px-6 py-3.5">Date</th>
            </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-100 text-slate-700 font-medium">
            {transactions?.map((tx) => {
              // Calcul de la marge nette générée par Digit-Gateway pour l'administrateur
              const netMargin = Number(tx.fees) - Number(tx.gateway_fees);

              return (
                  <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Références */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{tx.reference}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        API: {tx.gateway_reference || 'N/A'}
                      </div>
                    </td>

                    {/* Type & Opérateur */}
                    <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase mb-1 ${
                        tx.type === 'transfer' ? 'bg-blue-50 text-blue-700' :
                            tx.type === 'deposit' ? 'bg-purple-50 text-purple-700' : 'bg-orange-50 text-orange-700'
                    }`}>
                      {tx.type}
                    </span>
                      <div className="text-slate-500 font-semibold">{tx.recipient_operator}</div>
                    </td>

                    {/* Destinataire */}
                    <td className="px-6 py-4">
                      <div className="text-slate-900 font-bold">{tx.recipient_name || 'Utilisateur Externe'}</div>
                      <div className="text-slate-400 font-mono mt-0.5">{tx.recipient_phone}</div>
                    </td>

                    {/* Montant Envoyé */}
                    <td className="px-6 py-4">
                      <div className="text-slate-900 font-bold text-sm">
                        {Number(tx.amount_sent).toLocaleString()} {tx.currency_sent}
                      </div>
                    </td>

                    {/* Marge bénéficiaire de la plateforme */}
                    <td className="px-6 py-4">
                      <div className={`font-bold ${netMargin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        +{netMargin.toLocaleString()} {tx.currency_sent}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Frais Opérateur: {Number(tx.gateway_fees).toLocaleString()}</div>
                    </td>

                    {/* États Système */}
                    <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                        tx.status === 'success' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10' :
                            tx.status === 'processing' ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/10' :
                                tx.status === 'pending' ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/10' :
                                    'bg-red-50 text-red-700 ring-1 ring-red-600/10'
                    }`}>
                      {tx.status}
                    </span>
                      {tx.failure_code && (
                          <div className="text-[10px] text-red-500 mt-1 max-w-[150px] truncate" title={tx.failure_reason || ''}>
                            Err: {tx.failure_code}
                          </div>
                      )}
                    </td>

                    {/* Horodatage */}
                    <td className="px-6 py-4 text-slate-400 font-mono">
                      {new Date(tx.created_at).toLocaleDateString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
              );
            })}

            {transactions?.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-400">
                    Aucun flux financier n'a encore transité par la passerelle aujourd'hui.
                  </td>
                </tr>
            )}
            </tbody>
          </table>
        </div>
      </div>
  );
}