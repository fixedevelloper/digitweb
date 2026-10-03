import { TransferStatus } from './types';

export const STATUS_META: Record<TransferStatus, { label: string; className: string }> = {
  pending: { label: 'En attente', className: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/10' },
  pending_manual_review: { label: 'À traiter', className: 'bg-orange-50 text-orange-700 ring-1 ring-orange-600/10' },
  assigned: { label: 'Pris en charge', className: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/10' },
  processing: { label: 'En traitement', className: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/10' },
  success: { label: 'Terminé', className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10' },
  failed: { label: 'Échec', className: 'bg-red-50 text-red-700 ring-1 ring-red-600/10' },
  rejected: { label: 'Rejeté', className: 'bg-red-50 text-red-700 ring-1 ring-red-600/10' },
  cancelled: { label: 'Annulé', className: 'bg-slate-100 text-slate-600 ring-1 ring-slate-500/10' },
  reversed: { label: 'Remboursé', className: 'bg-slate-100 text-slate-600 ring-1 ring-slate-500/10' },
};

export const MANUAL_STATUSES: TransferStatus[] = [
  'pending_manual_review', 'assigned', 'processing', 'success', 'rejected', 'failed', 'cancelled',
];

export const formatMoney = (value: number | string | null | undefined, currency?: string) =>
  `${Number(value ?? 0).toLocaleString('fr-FR', { maximumFractionDigits: 2 })}${currency ? ` ${currency}` : ''}`;
