import { TransactionTable } from '@/features/transactions/components/transaction-table';
import { TransferForm } from '@/features/transactions/components/transfer-form';

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Transferts</h1>
          <p className="text-slate-500">Historique des transactions et envoi de fonds.</p>
        </div>
      {/*  <TransferForm />*/}
      </div>
      <TransactionTable />
    </div>
  );
}
