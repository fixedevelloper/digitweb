'use client';

import { MerchantLoginForm } from '@/features/merchant-auth/components/login-form';

export default function PortalLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <MerchantLoginForm />
    </div>
  );
}
