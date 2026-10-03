export const API_KEY_SCOPES = [
  { value: 'transfer.write', label: 'Envoi de transfert', description: "Initier un transfert d'argent" },
  { value: 'bank_transfer.write', label: 'Virement bancaire', description: 'Initier un virement bancaire (GET /v1/gateway/bank-countries, POST /v1/gateway/bank-transfers)' },
  { value: 'withdrawal.write', label: 'Retrait', description: 'Initier un retrait (cash-out)' },
  { value: 'deposit.write', label: 'Dépôt', description: 'Initier un dépôt (cash-in)' },
  { value: 'transactions.read', label: 'Lecture transactions', description: "Consulter l'historique et le statut des transactions" },
  { value: 'wallet.read', label: 'Lecture du solde', description: 'Consulter le solde (GET /v1/gateway/wallet)' },
  { value: 'countries.read', label: 'Pays & opérateurs', description: 'Lister les pays et opérateurs disponibles' },
] as const;

export type ApiKeyScope = (typeof API_KEY_SCOPES)[number]['value'];

export interface ApiKey {
  id: number;
  name: string;
  key_prefix: string;
  environment: 'sandbox' | 'production';
  scopes: ApiKeyScope[];
  last_used_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

export interface CreateApiKeyInput {
  name: string;
  environment: 'sandbox' | 'production';
  scopes: ApiKeyScope[];
}

export interface CreateApiKeyResult {
  id: number;
  name: string;
  environment: 'sandbox' | 'production';
  scopes: ApiKeyScope[];
  key: string;
}
