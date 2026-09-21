'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PortalSidebar } from '@/components/layout/portal-sidebar';
import { PortalNavbar } from '@/components/layout/portal-navbar';

export default function PortalDashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem('merchant_auth_token')) {
      router.replace('/portal/login');
      return;
    }
    setIsChecking(false);
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm font-semibold text-slate-400">
        Chargement de votre espace marchand...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <PortalSidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <PortalNavbar onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
