'use client';

import { useState } from 'react';
import { PortalSidebar } from '@/components/layout/portal-sidebar';
import { PortalNavbar } from '@/components/layout/portal-navbar';

export default function PortalDashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
