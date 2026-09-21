'use client';

import { useState } from 'react';
import { useMerchantProfile } from '@/features/merchant-auth/hooks/use-merchant-profile';
import { ApiKeyTable } from '@/features/api-keys/components/api-key-table';
import { CreateApiKeyModal } from '@/features/api-keys/components/create-api-key-modal';

export default function ApiKeysPage() {
  const { data: merchant } = useMerchantProfile();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-150">
      <div className="flex items-start justify-between border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">Clés API</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Générez et gérez les clés utilisées par vos serveurs pour appeler la passerelle DigitGateway.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-sm transition-all shrink-0"
        >
          + Générer une clé
        </button>
      </div>

      <ApiKeyTable />

      {isModalOpen && (
        <CreateApiKeyModal
          merchantEnvironment={merchant?.environment ?? 'sandbox'}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
