export interface Country {
  id: number;
  name: string;
  iso: string;
  currency: string;
  phonecode: number;
  status: boolean;
  flag: string | null;
}

export interface Operator {
  id: number;
  country_id: number;
  name: string;
  code: string;
  logo_url: string | null;
  status: boolean;
  fixed_fee: number;
  percent_fee: number;
  min_amount: number;
  max_amount: number;
  country:Country;
  prefix_regex:string;
  phone_length:number
}

export interface Transaction {
  id: number;
  reference: string;
  gateway_reference: string | null;
  type: 'transfer' | 'deposit' | 'withdrawal' | 'payment';
  user_id: number;
  recipient_id: number | null;
  recipient_name: string | null;
  recipient_phone: string;
  recipient_operator: string;

  // Détails financiers
  amount_sent: number;
  currency_sent: string;
  country_name: string;

  // Ventilation des commissions (Crucial pour l'Admin)
  fees: number;               // Frais facturés au client
  agent_commission: number;   // Commission point de vente
  gateway_fees: number;       // Facturé par l'agrégateur/opérateur
  exchange_rate: number;

  amount_to_receive: number;
  currency_received: string;

  // États de l'opérateur
  status: 'pending' | 'processing' | 'success' | 'failed' | 'reversed';
  failure_code: string | null;
  failure_reason: string | null;

  ip_address: string | null;
  device_signature: string | null;
  completed_at: string | null;
  created_at: string;
}
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface CreateTransferInput {
  recipient_name: string;
  recipient_phone: string;
  recipient_operator: string; // Ex: 'MTN_CM', 'ORANGE_GN'
  amount_sent: number;
  fees: number;
}