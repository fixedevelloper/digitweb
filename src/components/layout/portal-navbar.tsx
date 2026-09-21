'use client';

import { useMerchantProfile } from '@/features/merchant-auth/hooks/use-merchant-profile';

interface PortalNavbarProps {
  onMenuClick: () => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function PortalNavbar({ onMenuClick }: PortalNavbarProps) {
  const { data: merchant } = useMerchantProfile();

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-5">
        <button
          onClick={onMenuClick}
          aria-label="Ouvrir le menu"
          className="md:hidden -ml-1 mr-1 p-2 rounded-lg text-slate-600 hover:bg-slate-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {merchant && (
          <span
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono tracking-wider uppercase border ${
              merchant.environment === 'production'
                ? 'bg-blue-500/10 border-blue-500/20 text-blue-600'
                : 'bg-slate-100 border-slate-200 text-slate-500'
            }`}
          >
            {merchant.environment === 'production' ? '🚀 Production' : '🧪 Sandbox'}
          </span>
        )}
      </div>

      {merchant && (
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-slate-900 leading-tight">{merchant.company_name}</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">{merchant.name}</div>
          </div>

          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-xs font-black text-blue-600 shadow-sm select-none">
            {getInitials(merchant.company_name || merchant.name)}
          </div>
        </div>
      )}
    </header>
  );
}
