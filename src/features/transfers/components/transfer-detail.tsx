import { formatMoney } from '../status';
import { ManualTransfer, SERVICE_LABELS } from '../types';
import { StatusBadge } from './status-badge';

const FIELD_LABELS: Record<string, string> = {
  full_name: 'Nom', phone: 'Téléphone', email: 'Email', bank_name: 'Banque', bank_code: 'Code banque',
  branch_code: 'Code agence', account_number: 'N° de compte', iban: 'IBAN', swift_bic: 'SWIFT/BIC',
  address: 'Adresse', city: 'Ville', operator: 'Opérateur',
};

/** Détail d'un transfert : montants, bénéficiaire, preuves et historique d'audit. */
export function TransferDetail({ transfer }: { transfer: ManualTransfer }) {
  return (
    <div className="space-y-5 text-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-xs text-slate-500">{transfer.reference}</div>
          <div className="text-lg font-bold text-slate-900">{formatMoney(transfer.amount_to_pay, transfer.currency_to_pay)}</div>
          <div className="text-xs text-slate-500">
            Débité : {formatMoney(transfer.amount + transfer.fee, transfer.currency)} (frais {formatMoney(transfer.fee, transfer.currency)})
          </div>
        </div>
        <StatusBadge status={transfer.status} />
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        <div><dt className="text-slate-400">Client</dt><dd className="font-medium">{transfer.customer.name ?? '—'} · {transfer.customer.phone}</dd></div>
        <div><dt className="text-slate-400">Service</dt><dd className="font-medium">{SERVICE_LABELS[transfer.service]}</dd></div>
        <div><dt className="text-slate-400">Pays</dt><dd className="font-medium">{transfer.destination_country}</dd></div>
        <div><dt className="text-slate-400">Agent</dt><dd className="font-medium">{transfer.assigned_agent?.name ?? '—'}</dd></div>
      </dl>

      <section>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Bénéficiaire</h3>
        <dl className="rounded-xl border border-slate-200 divide-y divide-slate-100">
          {Object.entries(transfer.beneficiary).filter(([, v]) => v).map(([key, value]) => (
            <div key={key} className="flex justify-between gap-4 px-3 py-1.5 text-xs">
              <dt className="text-slate-500">{FIELD_LABELS[key] ?? key}</dt>
              <dd className="font-medium text-slate-900 text-right break-all">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {(transfer.rejection_reason || transfer.failure_reason) && (
        <div className="p-3 rounded-xl bg-red-50 text-xs text-red-800">
          {transfer.rejection_reason ?? transfer.failure_reason}
        </div>
      )}

      {transfer.proofs && transfer.proofs.length > 0 && (
        <section>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Preuves</h3>
          <ul className="text-xs space-y-1">
            {transfer.proofs.map((p) => (
              <li key={p.id} className="flex justify-between rounded-lg bg-slate-50 px-3 py-1.5">
                <span className="font-medium">{p.file_name}</span>
                <span className="text-slate-400">{Math.round(p.size / 1024)} Ko</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {transfer.history && (
        <section>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Historique</h3>
          <ol className="text-xs space-y-1.5 border-l-2 border-slate-200 pl-3">
            {transfer.history.map((h, i) => (
              <li key={i}>
                <span className="font-semibold text-slate-800">{h.action}</span>
                <span className="text-slate-400"> · {h.role ?? 'système'} · {new Date(h.created_at).toLocaleString('fr-FR')}</span>
                {h.comment && <div className="text-slate-500">{h.comment}</div>}
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
