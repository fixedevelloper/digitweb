export type CoverageService = 'MOBILE_MONEY' | 'BANK_TRANSFER';

export interface CoveredCountry {
  name: string;
  iso: string;
  currency: string | null;
  flag_url: string | null;
  services: CoverageService[];
  operators: string[];
}

export const COVERAGE_SERVICE_LABELS: Record<CoverageService, string> = {
  MOBILE_MONEY: 'Mobile Money',
  BANK_TRANSFER: 'Virement bancaire',
};
