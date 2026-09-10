'use client';

import { useState } from 'react';
import { AppUser, useUsers } from '@/features/users/hooks/use-users';

interface GeneratedPassword {
    userId: number;
    userName: string;
    phone: string;
    password: string;
}

export default function UsersPage() {
    const { data: users, isLoading, error, updateUser, isUpdating, generatePassword, isGeneratingPassword } = useUsers();
    const [generatingId, setGeneratingId] = useState<number | null>(null);
    const [result, setResult] = useState<GeneratedPassword | null>(null);

    if (isLoading) {
        return <div className="p-6 text-sm font-semibold text-slate-500 animate-pulse">Chargement du registre des utilisateurs mobile money...</div>;
    }

    if (error) {
        return <div className="p-6 text-sm font-bold text-red-600">Erreur : Impossible de récupérer les comptes utilisateurs.</div>;
    }

    const handleToggleStatus = (id: number, currentStatus: any) => {
        const isActive = typeof currentStatus === 'string' ? currentStatus === '1' : !!currentStatus;
        updateUser({
            id,
            data: { status: !isActive }
        });
    };

    const handleGeneratePassword = async (user: AppUser) => {
        setGeneratingId(user.id);
        try {
            const response = await generatePassword(user.id);
            setResult({
                userId: user.id,
                userName: user.name || 'Utilisateur',
                phone: response.phone,
                password: response.password,
            });
        } catch {
            alert("Erreur : impossible de générer un nouveau mot de passe pour cet utilisateur.");
        } finally {
            setGeneratingId(null);
        }
    };

    const whatsappHref = result
        ? `https://wa.me/${result.phone}?text=${encodeURIComponent(
              `Bonjour ${result.userName}, voici votre nouveau mot de passe Digit Gateway : ${result.password}\n\nMerci de le changer dès votre prochaine connexion.`
          )}`
        : '#';

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">

            {/* En-tête de page */}
            <div className="border-b border-slate-100 pb-5">
                <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                    Gestion des Utilisateurs
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                    Consulte les clients mobile money inscrits sur l&apos;app Flutter, leur solde de portefeuille et gère les révocations d&apos;accès. Génère un nouveau mot de passe sur demande WhatsApp reçue d&apos;un utilisateur ayant oublié le sien.
                </p>
            </div>

            {/* Tableau des Utilisateurs */}
            <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="bg-slate-50/75 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                            <th className="py-3 px-5">Utilisateur</th>
                            <th className="py-3 px-5">Inscription</th>
                            <th className="py-3 px-5 text-right">Solde Portefeuille</th>
                            <th className="py-3 px-5 text-center">Statut</th>
                            <th className="py-3 px-5 text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                        {users?.map((user) => {
                            const isActive = typeof user.status === 'string' ? user.status === '1' : !!user.status;
                            const balanceNum = typeof user.wallet?.balance === 'string'
                                ? parseFloat(user.wallet.balance)
                                : user.wallet?.balance || 0;

                            return (
                                <tr key={user.id} className="hover:bg-slate-50/50 transition-all">
                                    {/* Infos basiques */}
                                    <td className="py-4 px-5">
                                        <div className="font-bold text-slate-900 text-sm">{user.name || 'Utilisateur sans nom'}</div>
                                        <div className="text-slate-400 font-medium mt-0.5">{user.email || '—'}</div>
                                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">+{user.phone}</div>
                                    </td>

                                    {/* Date d'inscription */}
                                    <td className="py-4 px-5 text-slate-500">
                                        {new Date(user.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>

                                    {/* Solde Financier */}
                                    <td className="py-4 px-5 text-right font-mono font-bold text-sm text-slate-900">
                                        {balanceNum.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">{user.wallet?.currency || 'XAF'}</span>
                                    </td>

                                    {/* Statut d'activation */}
                                    <td className="py-4 px-5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          {isActive ? 'Actif' : 'Suspendu'}
                      </span>
                                    </td>

                                    {/* Actionneurs */}
                                    <td className="py-4 px-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleGeneratePassword(user)}
                                                disabled={isGeneratingPassword}
                                                className="text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50"
                                            >
                                                {isGeneratingPassword && generatingId === user.id ? '⏳ ...' : '🔑 Générer mdp'}
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatus(user.id, user.status)}
                                                disabled={isUpdating}
                                                className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl transition-all ${
                                                    isActive
                                                        ? 'bg-red-50 text-red-600 hover:bg-red-500 hover:text-white'
                                                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                                                }`}
                                            >
                                                {isActive ? '🚫 Suspendre' : '🔓 Activer'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>

                {users?.length === 0 && (
                    <div className="p-8 text-center text-slate-400 font-medium">
                        Aucun utilisateur n&apos;est actuellement inscrit sur la plateforme.
                    </div>
                )}
            </div>

            {/* Modale : mot de passe généré, à transmettre via WhatsApp */}
            {result && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
                    onClick={() => setResult(null)}
                >
                    <div
                        className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div>
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                                Nouveau mot de passe généré
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">
                                Pour <span className="font-semibold text-slate-700">{result.userName}</span> (+{result.phone})
                            </p>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center">
                            <span className="text-lg font-mono font-black tracking-[0.2em] text-slate-900">
                                {result.password}
                            </span>
                        </div>

                        <p className="text-[11px] text-slate-400">
                            Ce mot de passe ne sera plus affiché : transmets-le à l&apos;utilisateur maintenant, par exemple via WhatsApp.
                        </p>

                        <div className="flex gap-2">
                            <a
                                href={whatsappHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 text-center text-xs font-bold uppercase tracking-wider px-3 py-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-all"
                            >
                                💬 Envoyer via WhatsApp
                            </a>
                            <button
                                onClick={() => setResult(null)}
                                className="text-xs font-bold uppercase tracking-wider px-3 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
