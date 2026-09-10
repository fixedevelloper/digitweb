'use client';

import { useWallets } from '@/features/wallets/hooks/use-wallets';
import { useEffect, useState } from 'react';

interface AdminProfile {
    name: string;
    phone: string;
}

interface NavbarProps {
    onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
    const { totalSystemLiquidity } = useWallets();
    const [admin, setAdmin] = useState<AdminProfile | null>(null);

    // Exemple de récupération du nom de l'admin (à adapter selon ta gestion d'état ou ton localStorage)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedName = localStorage.getItem('admin_name') || 'Lorenzo Mbah';
            const storedPhone = localStorage.getItem('admin_phone') || '657285050';
            setAdmin({ name: storedName, phone: storedPhone });
        }
    }, []);

    // Génération des initiales (ex: "Lorenzo Mbah" -> "LM")
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 sticky top-0 z-40">

            {/* Statut technique de la passerelle */}
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

                <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
                    Passerelle : <span className="text-emerald-600 font-bold">Opérationnelle</span>
                </div>

                {/* Aperçu rapide de la masse monétaire en circulation */}
                <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-medium text-slate-500">
                    <span className="text-slate-400">En circulation :</span>
                    <span className="font-mono font-bold text-slate-800">
            {totalSystemLiquidity ? totalSystemLiquidity.toLocaleString() : '---'}
          </span>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">XAF</span>
                </div>
            </div>

            {/* Profil de l'utilisateur ou SuperAdmin connecté */}
            {admin && (
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <div className="text-xs font-bold text-slate-900 leading-tight">{admin.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono font-semibold mt-0.5">+{admin.phone}</div>
                    </div>

                    <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-xs font-black text-blue-600 shadow-sm select-none">
                        {getInitials(admin.name)}
                    </div>
                </div>
            )}
        </header>
    );
}