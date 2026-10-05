'use client';

import { useEffect, useState } from 'react';
import { agentLogout } from '@/features/agent/hooks/use-agent-auth';

export default function AgentDashboardLayout({ children }: { children: React.ReactNode }) {
  // L'accès est contrôlé côté serveur par src/proxy.ts (cookie de session) ; ici, simple affichage du nom.
  const [name, setName] = useState('Agent');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(localStorage.getItem('agent_name') ?? 'Agent');
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 sticky top-0 z-40">
        <span className="text-base font-bold tracking-tight text-slate-900">
          Digita<span className="text-blue-600">Gateway</span>{' '}
          <span className="text-[10px] bg-orange-500/10 text-orange-600 px-1.5 py-0.5 rounded ml-1 uppercase font-semibold">Agent</span>
        </span>
        <div className="flex items-center gap-4 text-sm">
          <span className="font-medium text-slate-600">{name}</span>
          <button onClick={() => agentLogout()} className="text-xs font-bold text-red-500 hover:text-red-400">Déconnexion</button>
        </div>
      </header>
      <main className="p-6 md:p-8">{children}</main>
    </div>
  );
}
