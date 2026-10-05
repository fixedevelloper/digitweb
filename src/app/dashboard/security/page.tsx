'use client';

import { apiClient } from '@/lib/api-client';
import { TwoFactorSettings } from '@/features/security/components/two-factor-settings';

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Sécurité du compte</h1>
        <p className="text-slate-500">Protégez votre accès administrateur par un second facteur.</p>
      </div>
      <TwoFactorSettings client={apiClient} basePath="/admin/2fa" />
    </div>
  );
}
