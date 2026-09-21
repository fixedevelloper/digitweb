'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PortalIndexPage() {
  const router = useRouter();

  useEffect(() => {
    const hasToken = !!localStorage.getItem('merchant_auth_token');
    router.replace(hasToken ? '/portal/dashboard' : '/portal/login');
  }, [router]);

  return null;
}
