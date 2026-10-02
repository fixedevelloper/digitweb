export type MerchantEnvironment = 'sandbox' | 'production';

export type MerchantTransactionStatus = 'pending' | 'processing' | 'success' | 'failed' | 'reversed';

export type MerchantTransactionType = 'transfer' | 'withdrawal' | 'deposit';

export interface MerchantWallet {
  currency: string;
  /** Solde réel (opérations faites avec une clé sk_live_). */
  balance: number;
  /** Solde fictif de test (opérations faites avec une clé sk_test_). */
  sandbox_balance: number;
  sandbox_max_balance: number;
}

export interface MerchantTransaction {
  reference: string;
  environment: MerchantEnvironment;
  type: MerchantTransactionType;
  status: MerchantTransactionStatus;
  amount: number;
  fee: number;
  currency: string;
  amount_received: number;
  currency_received: string;
  exchange_rate: number;
  recipient: {
    phone: string;
    operator: string;
    country: string;
  };
  failure_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface MerchantTransactionFilters {
  environment: MerchantEnvironment;
  type?: MerchantTransactionType;
  status?: MerchantTransactionStatus;
  search?: string;
  page: number;
}

export interface PaginatedMerchantTransactions {
  data: MerchantTransaction[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
