export type TransferStatus =
  | 'pending'
  | 'pending_manual_review'
  | 'assigned'
  | 'processing'
  | 'success'
  | 'failed'
  | 'rejected'
  | 'cancelled'
  | 'reversed';

export type TransferService = 'MOBILE_MONEY' | 'BANK_TRANSFER';
export type CountryServiceStatus = 'ACTIVE' | 'INACTIVE' | 'MANUAL';

export const SERVICE_LABELS: Record<TransferService, string> = {
  MOBILE_MONEY: 'Mobile Money',
  BANK_TRANSFER: 'Virement bancaire',
};

export const BANK_FIELDS = [
  'full_name', 'phone', 'email', 'bank_name', 'bank_code', 'branch_code',
  'account_number', 'iban', 'swift_bic', 'address', 'city',
] as const;

export interface Provider {
  id: number;
  code: string;
  name: string;
  services: TransferService[] | null;
  active: boolean;
  implemented: boolean; // une classe d'exécution existe ; sinon traité manuellement
}

export interface CountryService {
  id: number;
  country_id: number;
  service: TransferService;
  status: CountryServiceStatus;
  provider_id: number | null;
  min_amount: string | null;
  max_amount: string | null;
  daily_limit: string | null;
  monthly_limit: string | null;
  country?: { id: number; name: string; iso: string };
  provider?: { id: number; code: string; name: string; active: boolean } | null;
}

export interface FeeRule {
  id: number;
  country_id: number | null;
  service: TransferService;
  provider_id: number | null;
  currency: string;
  min_amount: string;
  max_amount: string | null;
  fixed_fee: string;
  percent_fee: string; // 0.0100 = 1 %
  active: boolean;
}

export interface Agent {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  status: boolean;
  created_at?: string;
}

export interface TransferProof {
  id: number;
  file_name: string;
  mime_type: string;
  size: number;
  uploaded_by: number | null;
  created_at: string;
}

export interface AuditEntry {
  action: string;
  user_id: number | null;
  role: string | null;
  old_status: string | null;
  new_status: string | null;
  comment: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

/** Transfert vu par les agents et l'administration (AgentTransferResource). */
export interface ManualTransfer {
  id: number;
  reference: string;
  customer: { id: number; name: string | null; phone: string | null };
  amount: number;
  fee: number;
  currency: string;
  amount_to_pay: number;
  currency_to_pay: string;
  destination_country: string;
  service: TransferService;
  processing_mode: 'AUTOMATIC' | 'MANUAL';
  operator: string;
  beneficiary: Record<string, string | null>;
  priority: string;
  status: TransferStatus;
  assigned_agent?: { id: number; name: string } | null;
  assigned_agent_id: number | null;
  provider_reference: string | null;
  processed_by: number | null;
  processed_at: string | null;
  rejection_reason: string | null;
  failure_reason: string | null;
  proofs?: TransferProof[];
  history?: AuditEntry[];
  created_at: string;
}

/** Collection paginée d'API Resources Laravel. */
export interface ResourcePage<T> {
  data: T[];
  meta: { current_page: number; last_page: number; total: number };
}
