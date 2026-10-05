'use client';

import { MerchantRegisterForm } from '@/features/merchant-auth/components/register-form';

export default function PortalRegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <MerchantRegisterForm />
    </div>
  );
}
