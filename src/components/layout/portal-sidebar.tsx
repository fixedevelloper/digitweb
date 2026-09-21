'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMerchantLogout } from '@/features/merchant-auth/hooks/use-merchant-logout';
import { getApiDocsUrl } from '@/lib/utils';

interface PortalSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PortalSidebar({ isOpen, onClose }: PortalSidebarProps) {
  const pathname = usePathname();
  const handleLogout = useMerchantLogout();

  const menuItems = [
    { label: "Vue d'ensemble", href: '/portal/dashboard', icon: '📊' },
    { label: 'Clés API', href: '/portal/dashboard/api-keys', icon: '🔑' },
  ];

  const renderLink = (item: { label: string; href: string; icon: string }) => {
    const isActive = pathname === item.href;
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onClose}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
          isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' : 'hover:bg-slate-800/60 hover:text-white'
        }`}
      >
        <span className="text-base">{item.icon}</span>
        {item.label}
      </Link>
    );
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/60 md:hidden" onClick={onClose} aria-hidden="true" />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 transition-transform duration-200 ease-in-out md:static md:z-auto md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950/40">
          <div className="h-7 w-7 rounded bg-blue-600 flex items-center justify-center mr-2.5 font-bold text-white text-sm">
            DG
          </div>
          <span className="text-base font-bold tracking-tight text-white">
            Digit<span className="text-blue-500">Gateway</span>{' '}
            <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded ml-1 uppercase font-semibold">
              Merchant
            </span>
          </span>
          <button onClick={onClose} aria-label="Fermer le menu" className="ml-auto text-slate-400 hover:text-white md:hidden">
            ✕
          </button>
        </div>

        <div className="flex-1 p-4 space-y-6 overflow-y-auto">
          <nav className="space-y-1">
            <div className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Menu</div>
            {menuItems.map(renderLink)}
          </nav>

          <nav className="space-y-1">
            <div className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ressources</div>
            <a
              href={getApiDocsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-slate-800/60 hover:text-white"
            >
              <span className="text-base">📚</span>
              Documentation API
            </a>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/20 space-y-3">
          <div className="text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-400 font-medium">Session marchand</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-xl transition-all"
          >
            🚪 Se déconnecter
          </button>
        </div>
      </aside>
    </>
  );
}
