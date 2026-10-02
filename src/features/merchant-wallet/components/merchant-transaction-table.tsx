'use client';

import { useEffect, useState } from 'react';
import { useMerchantTransactions } from '../hooks/use-merchant-wallet';
import { MerchantEnvironment, MerchantTransactionStatus, MerchantTransactionType } from '../types';

const STATUS_STYLES: Record<MerchantTransactionStatus, string> = {
  success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10',
  processing: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/10',
  pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/10',
  failed: 'bg-red-50 text-red-700 ring-1 ring-red-600/10',
  reversed: 'bg-slate-100 text-slate-700 ring-1 ring-slate-600/10',
};

const STATUS_LABELS: Record<MerchantTransactionStatus, string> = {
  success: 'Succès',
  processing: 'En cours',
  pending: 'En attente',
  failed: 'Échec',
  reversed: 'Annulée',
};

const TYPE_LABELS: Record<MerchantTransactionType, string> = {
  transfer: 'Transfert',
  withdrawal: 'Retrait',
  deposit: 'Dépôt',
};

const selectClass =
  'px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400';

export function MerchantTransactionTable({ environment }: { environment: MerchantEnvironment }) {
  const [page, setPage] = useState(1);
  const [type, setType] = useState<MerchantTransactionType | ''>('');
  const [status, setStatus] = useState<MerchantTransactionStatus | ''>('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Changer de filtre repart de la première page (le changement d'environnement
  // remonte le composant via sa `key`, cf. la page).
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isFetching, isError } = useMerchantTransactions({
    environment,
    type: type || undefined,
    status: status || undefined,
    search: debouncedSearch || undefined,
    page,
  });

  const transactions = data?.data;
  const meta = data?.meta;
  const hasFilters = Boolean(type || status || debouncedSearch);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Transactions</h2>
          <span className="text-xs bg-slate-200/60 text-slate-700 px-2.5 py-1 rounded-lg font-semibold">
            {meta?.total ?? 0}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Référence ou numéro"
            className={`${selectClass} w-44`}
          />
          <select value={type} onChange={(e) => {
              setType(e.target.value as MerchantTransactionType | '');
              setPage(1);
            }} className={selectClass}>
            <option value="">Tous les types</option>
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <select value={status} onChange={(e) => {
              setStatus(e.target.value as MerchantTransactionStatus | '');
              setPage(1);
            }} className={selectClass}>
            <option value="">Tous les statuts</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading && <div className="text-center py-8 text-sm text-slate-500 animate-pulse">Chargement des transactions...</div>}

      {isError && (
        <div className="text-center py-8 text-sm text-red-500 font-medium">⚠️ Impossible de charger les transactions.</div>
      )}

      {!isLoading && !isError && (
        <>
          <div className={`overflow-x-auto transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Référence</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Destinataire</th>
                  <th className="px-6 py-3.5">Montant</th>
                  <th className="px-6 py-3.5">Frais</th>
                  <th className="px-6 py-3.5">Statut</th>
                  <th className="px-6 py-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100 text-slate-700 font-medium">
                {transactions?.map((tx) => (
                  <tr key={tx.reference} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 font-mono">{tx.reference}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700">
                        {TYPE_LABELS[tx.type] ?? tx.type}
                      </span>
                      <div className="text-slate-500 font-semibold mt-1">{tx.recipient.operator}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-slate-900">{tx.recipient.phone}</div>
                      <div className="text-slate-400 mt-0.5">{tx.recipient.country}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-900 font-bold text-sm">
                        {tx.amount.toLocaleString('fr-FR')} {tx.currency}
                      </div>
                      {tx.currency_received !== tx.currency && (
                        <div className="text-[10px] text-amber-600 font-semibold mt-0.5">
                          → {tx.amount_received.toLocaleString('fr-FR')} {tx.currency_received}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {tx.fee.toLocaleString('fr-FR')} {tx.currency}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${STATUS_STYLES[tx.status]}`}>
                        {STATUS_LABELS[tx.status] ?? tx.status}
                      </span>
                      {tx.failure_reason && (
                        <div className="text-[10px] text-red-500 mt-1 max-w-[180px] truncate" title={tx.failure_reason}>
                          {tx.failure_reason}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-mono whitespace-nowrap">
                      {new Date(tx.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                  </tr>
                ))}

                {transactions?.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-400">
                      {hasFilters
                        ? 'Aucune transaction ne correspond à ces filtres.'
                        : environment === 'sandbox'
                          ? 'Aucune transaction de test. Appelez /api/v1/gateway/* avec une clé sk_test_ pour en créer.'
                          : 'Aucune transaction live pour le moment.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {meta && meta.last_page > 1 && (
            <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
              <span className="text-xs text-slate-500 font-medium">{meta.total} transactions</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || isFetching}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ← Précédent
                </button>
                <span className="text-xs font-bold text-slate-700 px-1">
                  Page {meta.current_page} / {meta.last_page}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                  disabled={page >= meta.last_page || isFetching}
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
