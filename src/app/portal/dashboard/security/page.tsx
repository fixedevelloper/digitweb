'use client';

import { merchantApiClient } from '@/lib/merchant-api-client';
import { TwoFactorSettings } from '@/features/security/components/two-factor-settings';

export default function MerchantSecurityPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="border-b border-slate-100 pb-5">
        <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">Sécurité</h1>
        <p className="text-xs text-slate-500 mt-0.5">Protégez l&apos;accès à votre espace (clés API, webhooks, solde) par un second facteur.</p>
      </div>
      <TwoFactorSettings client={merchantApiClient} basePath="/merchants/2fa" />
    </div>
  );
}
