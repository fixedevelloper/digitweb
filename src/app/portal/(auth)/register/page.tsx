'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MerchantRegisterForm } from '@/features/merchant-auth/components/register-form';

export default function PortalRegisterPage() {
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem('merchant_auth_token')) {
      router.replace('/portal/dashboard');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <MerchantRegisterForm />
    </div>
  );
}
