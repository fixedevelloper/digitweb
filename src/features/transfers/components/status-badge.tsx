import { STATUS_META } from '../status';
import { TransferStatus } from '../types';

export function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status as TransferStatus] ?? {
    label: status,
    className: 'bg-slate-100 text-slate-600 ring-1 ring-slate-500/10',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${meta.className}`}>
      {meta.label}
    </span>
  );
}
