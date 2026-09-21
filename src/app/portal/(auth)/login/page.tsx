'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MerchantLoginForm } from '@/features/merchant-auth/components/login-form';

export default function PortalLoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem('merchant_auth_token')) {
      router.replace('/portal/dashboard');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <MerchantLoginForm />
    </div>
  );
}
