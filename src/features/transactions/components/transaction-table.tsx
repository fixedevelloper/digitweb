'use client';

import { useState } from 'react';
import { useTransactions } from '../hooks/use-transactions';
import { transactionApi } from '../services/transaction-api';

export function TransactionTable() {
  const [page, setPage] = useState(1);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [exportingFormat, setExportingFormat] = useState<'excel' | 'pdf' | null>(null);

  const { data: paginated, isLoading, isFetching, isError } = useTransactions(page, 20, { dateFrom, dateTo });
  const transactions = paginated?.data;

  const handleDateFromChange = (value: string) => {
    setDateFrom(value);
    setPage(1);
  };

  const handleDateToChange = (value: string) => {
    setDateTo(value);
    setPage(1);
  };

  const handleResetDates = () => {
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const handleExport = async (format: 'excel' | 'pdf') => {
    setExportingFormat(format);
    try {
      await transactionApi.exportTransactions(format, { dateFrom, dateTo });
    } catch {
      alert("Erreur : impossible de générer l'export. Réessaie dans quelques instants.");
    } finally {
      setExportingFormat(null);
    }
  };

  return (
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xl shadow-slate-100/40">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Journal d&apos;Audit Global</h2>
            <span className="text-xs bg-slate-200/60 text-slate-700 px-2.5 py-1 rounded-lg font-semibold">
              {paginated?.total ?? 0} Flux référencés
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Filtre par plage de dates */}
            <label className="flex items-center gap-1.5 text-slate-500 font-medium">
              Du
              <input
                  type="date"
                  value={dateFrom}
                  max={dateTo || undefined}
                  onChange={(e) => handleDateFromChange(e.target.value)}
                  className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              />
            </label>
            <label className="flex items-center gap-1.5 text-slate-500 font-medium">
              Au
              <input
                  type="date"
                  value={dateTo}
                  min={dateFrom || undefined}
                  onChange={(e) => handleDateToChange(e.target.value)}
                  className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              />
            </label>
            {(dateFrom || dateTo) && (
                <button
                    onClick={handleResetDates}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-200/60 transition-colors"
                >
                  ✕ Réinitialiser
                </button>
            )}

            {/* Exports */}
            <div className="flex items-center gap-2 ml-0 lg:ml-2 pl-0 lg:pl-2 lg:border-l lg:border-slate-200">
              <button
                  onClick={() => handleExport('excel')}
                  disabled={exportingFormat !== null}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {exportingFormat === 'excel' ? '⏳ Export...' : '📊 Excel'}
              </button>
              <button
                  onClick={() => handleExport('pdf')}
                  disabled={exportingFormat !== null}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {exportingFormat === 'pdf' ? '⏳ Export...' : '📄 PDF'}
              </button>
            </div>
          </div>
        </div>

        {isLoading && (
            <div className="text-center py-8 text-sm text-slate-500 animate-pulse">Chargement du grand livre des transactions...</div>
        )}

        {isError && (
            <div className="text-center py-8 text-sm text-red-500 font-medium">⚠️ Échec de connexion avec l&apos;API Digit-Gateway.</div>
        )}

        {!isLoading && !isError && (
        <>
        <div className={`overflow-x-auto transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
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
                    {dateFrom || dateTo
                        ? 'Aucun flux financier ne correspond à cette plage de dates.'
                        : "Aucun flux financier n'a encore transité par la passerelle aujourd'hui."}
                  </td>
                </tr>
            )}
            </tbody>
          </table>
        </div>

        {paginated && paginated.last_page > 1 && (
            <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
              <span className="text-xs text-slate-500 font-medium">
                {paginated.from ?? 0}–{paginated.to ?? 0} sur {paginated.total}
              </span>

              <div className="flex items-center gap-2">
                <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1 || isFetching}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ← Précédent
                </button>
                <span className="text-xs font-bold text-slate-700 px-1">
                  Page {paginated.current_page} / {paginated.last_page}
                </span>
                <button
                    onClick={() => setPage((p) => Math.min(paginated.last_page, p + 1))}
                    disabled={page >= paginated.last_page || isFetching}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Suivant →
                </button>
              </div>
            </div>
        )}
        </>
        )}
      </div>
  );
}