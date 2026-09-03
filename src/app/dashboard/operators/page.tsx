'use client';

import { useState, useRef } from 'react';
import { useOperators } from '@/features/operators/hooks/use-operators';
import { useUpdateOperator } from '@/features/operators/hooks/use-update-operator';
import { useCountries } from '@/features/countries/hooks/use-countries'; // Récupérer la liste pour le Select du pays
import { Button } from '@/components/ui/button';

export default function OperatorsPage() {
    const { data: operators, isLoading, error } = useOperators();
    const { data: countries } = useCountries();
    const updateOperatorMutation = useUpdateOperator();

    // États pour le contrôle des formulaires
    const [isCreating, setIsCreating] = useState(false);
    const [editingOperatorId, setEditingOperatorId] = useState<number | null>(null);

    // Références pour les inputs de type file
    const createFileInputRef = useRef<HTMLInputElement>(null);
    const editFileInputRef = useRef<HTMLInputElement>(null);

    // Structure de données locale pour les formulaires (Création & Édition)
    const [formData, setFormData] = useState<{
        name: string;
        code: string;
        country_id: string;
        prefix_regex: string;
        phone_length: number;
        fixed_fee: number;
        percent_fee: number;
        min_amount: number;
        max_amount: number;
        logo: File | null;
        logoPreview: string | null;
    }>({
        name: '',
        code: '',
        country_id: '',
        prefix_regex: '',
        phone_length: 9,
        fixed_fee: 0,
        percent_fee: 0,
        min_amount: 100,
        max_amount: 1000000,
        logo: null,
        logoPreview: null,
    });

    if (isLoading) {
        return <div className="p-6 text-sm font-semibold text-slate-500 animate-pulse">Chargement des infrastructures réseaux...</div>;
    }

    if (error) {
        return <div className="p-6 text-sm font-bold text-red-600">Erreur : Impossible de charger les configurations opérateurs.</div>;
    }

    // Gestion propre du changement de logo avec nettoyage mémoire
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData(prev => {
                if (prev.logoPreview && prev.logoPreview.startsWith('blob:')) {
                    URL.revokeObjectURL(prev.logoPreview);
                }
                return {
                    ...prev,
                    logo: file,
                    logoPreview: URL.createObjectURL(file)
                };
            });
        }
    };

    // Nettoyage global de l'aperçu d'image
    const resetFormState = () => {
        if (formData.logoPreview && formData.logoPreview.startsWith('blob:')) {
            URL.revokeObjectURL(formData.logoPreview);
        }
        setEditingOperatorId(null);
        setIsCreating(false);
        setFormData({
            name: '', code: '', country_id: '', prefix_regex: '',
            phone_length: 9, fixed_fee: 0, percent_fee: 0,
            min_amount: 100, max_amount: 1000000, logo: null, logoPreview: null
        });
    };

    // Déclencheur Mode Création
    const startCreating = () => {
        resetFormState();
        setIsCreating(true);
    };

    // Déclencheur Mode Édition
    const startEditing = (operator: any) => {
        if (formData.logoPreview && formData.logoPreview.startsWith('blob:')) {
            URL.revokeObjectURL(formData.logoPreview);
        }
        setIsCreating(false);
        setEditingOperatorId(operator.id);
        setFormData({
            name: operator.name,
            code: operator.code,
            country_id: String(operator.country_id || ''),
            prefix_regex: operator.prefix_regex || '',
            phone_length: Number(operator.phone_length),
            fixed_fee: Number(operator.fixed_fee),
            percent_fee: Number(operator.percent_fee),
            min_amount: Number(operator.min_amount),
            max_amount: Number(operator.max_amount),
            logo: null,
            logoPreview: operator.logo_url || null, // URL absolue renvoyée par Laravel
        });
    };

    const handleToggleStatus = (id: number, currentStatus: boolean | string) => {
        const nextStatus = typeof currentStatus === 'string' ? currentStatus === '1' : !currentStatus;
        updateOperatorMutation.mutate({
            id,
            data: { status: nextStatus } as any,
        });
    };

    // Soumission unifiée avec injection de FormData pour Laravel
    const handleSaveSettings = (e: React.FormEvent, id?: number) => {
        e.preventDefault();

        const dataPayload = new FormData();

        // Injecter le spoofing dès le début si c'est un update
        if (id) {
            dataPayload.append('_method', 'PUT');
        }

        // Sécuriser les valeurs pour éviter d'envoyer des valeurs 'undefined' ou 'null' textuels
        dataPayload.append('name', formData.name || '');
        dataPayload.append('code', formData.code || '');
        dataPayload.append('country_id', String(formData.country_id || ''));
        dataPayload.append('prefix_regex', formData.prefix_regex || '');
        dataPayload.append('phone_length', String(formData.phone_length ?? 9));
        dataPayload.append('fixed_fee', String(formData.fixed_fee ?? 0));
        dataPayload.append('percent_fee', String(formData.percent_fee ?? 0));
        dataPayload.append('min_amount', String(formData.min_amount ?? 100));
        dataPayload.append('max_amount', String(formData.max_amount ?? 1000000));

        if (formData.logo) {
            dataPayload.append('logo', formData.logo);
        }

        // Afficher le contenu réel dans ta console avant l'envoi
        console.log("--- CONTENU DU FORMDATA ---");
        dataPayload.forEach((value, key) => {
            console.log(`${key} ->`, value);
        });

        if (id) {
            updateOperatorMutation.mutate({ id, data: dataPayload as any }, {
                onSuccess: () => resetFormState()
            });
        } else {
            updateOperatorMutation.mutate({ id: 0, data: dataPayload as any }, {
                onSuccess: () => resetFormState()
            });
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">

            {/* Header de la page */}
            <div className="border-b border-slate-100 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                        Routage Telecom & Opérateurs
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Gère les statuts d&apos;activation (Kill-Switch), les logos des télécoms et la tarification par réseau régional.
                    </p>
                </div>
                <button
                    onClick={startCreating}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all self-start sm:self-center"
                >
                    ＋ Ajouter un Opérateur
                </button>
            </div>

            {/* Formulaire de création d'un opérateur */}
            {isCreating && (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-5 animate-in slide-in-from-top-4 duration-200">
                    <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Nouvelle Infrastructure Télécom</h3>
                    <form onSubmit={(e) => handleSaveSettings(e)} className="space-y-4 text-xs">

                        {/* Zone Téléversement Logo */}
                        <div className="flex items-center gap-4 bg-white p-4 border border-slate-200 rounded-xl max-w-md">
                            <div className="w-12 h-12 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden shadow-inner">
                                {formData.logoPreview ? (
                                    <img src={formData.logoPreview} alt="Aperçu logo" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-[10px] text-slate-400 font-bold text-center leading-tight">No<br/>Logo</span>
                                )}
                            </div>
                            <div className="space-y-1">
                                <label className="block font-bold text-slate-500 uppercase tracking-wider text-[10px]">Branding Opérateur</label>
                                <input
                                    type="file"
                                    ref={createFileInputRef}
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => createFileInputRef.current?.click()}
                                    className="h-7 text-[10px] font-bold px-2.5"
                                >
                                    {formData.logo ? 'Changer l\'image' : 'Choisir un logo'}
                                </Button>
                            </div>
                        </div>

                        {/* Informations générales */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <label className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Nom de l&apos;Opérateur</label>
                                <input
                                    type="text" required placeholder="Ex: MTN Cameroon"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-blue-500 text-xs font-semibold"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Code Unique</label>
                                <input
                                    type="text" required placeholder="Ex: MTN_CM"
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-blue-500 font-mono text-xs uppercase"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Corridor Assigné (Pays)</label>
                                <select
                                    required
                                    value={formData.country_id}
                                    onChange={e => setFormData({ ...formData, country_id: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-blue-500 text-xs font-semibold"
                                >
                                    <option value="">Sélectionner un pays...</option>
                                    {countries?.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name} ({c.currency})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Paramètres Techniques et frais */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <label className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Validation Regex</label>
                                <input
                                    type="text" placeholder="Ex: ^6(7|8)[0-9]{7}$"
                                    value={formData.prefix_regex}
                                    onChange={e => setFormData({ ...formData, prefix_regex: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg font-mono focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Longueur Numéro</label>
                                <input
                                    type="number" value={formData.phone_length}
                                    onChange={e => setFormData({ ...formData, phone_length: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Frais Fixes</label>
                                <input
                                    type="number" value={formData.fixed_fee}
                                    onChange={e => setFormData({ ...formData, fixed_fee: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Frais Taux (0.01 = 1%)</label>
                                <input
                                    type="number" step="0.0001" value={formData.percent_fee}
                                    onChange={e => setFormData({ ...formData, percent_fee: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Montant Min</label>
                                <input
                                    type="number" value={formData.min_amount}
                                    onChange={e => setFormData({ ...formData, min_amount: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Montant Max</label>
                                <input
                                    type="number" value={formData.max_amount}
                                    onChange={e => setFormData({ ...formData, max_amount: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                            <Button type="button" variant="outline" onClick={resetFormState} className="h-8 text-[11px] font-bold">
                                Annuler
                            </Button>
                            <Button type="submit" disabled={updateOperatorMutation.isPending} className="h-8 text-[11px] font-bold bg-blue-600 text-white hover:bg-blue-500">
                                Créer l&apos;opérateur
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Grille des Opérateurs */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {operators?.map((operator) => {
                    const isEditing = editingOperatorId === operator.id;
                    const isActive = typeof operator.status === 'string' ? operator.status === '1' : !!operator.status;

                    return (
                        <div
                            key={operator.id}
                            className={`bg-white rounded-2xl border transition-all p-5 space-y-4 flex flex-col justify-between ${
                                isActive ? 'border-slate-200 shadow-sm' : 'border-red-200 bg-red-50/5 shadow-none'
                            }`}
                        >
                            <div className="space-y-4">
                                {/* En-tête du composant de la carte opérateur */}
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <div className="flex items-center gap-3">

                                        {/* Box Logo Opérateur */}
                                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center font-bold text-slate-500 text-[11px] overflow-hidden shadow-inner bg-white">
                                            {isEditing && formData.logoPreview ? (
                                                <img src={formData.logoPreview} alt="Aperçu" className="w-full h-full object-cover" />
                                            ) : operator.logo_url ? (
                                                <img src={operator.logo_url} alt={operator.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{operator.code.substring(0, 3)}</span>
                                            )}
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900">
                                                {isEditing ? formData.name || operator.name : operator.name}
                                            </h3>
                                            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                                                Code : {operator.code} • Corridor : {operator.country?.name || 'Inconnu'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Kill-Switch */}
                                    <button
                                        onClick={() => handleToggleStatus(operator.id, operator.status)}
                                        disabled={updateOperatorMutation.isPending}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                                            isActive
                                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 hover:bg-red-500 hover:text-white hover:border-transparent'
                                                : 'bg-red-500 text-white border-transparent hover:bg-emerald-600'
                                        }`}
                                    >
                                        {isActive ? '● En Ligne' : '○ Coupé'}
                                    </button>
                                </div>

                                {/* Formulaire d'édition / Affichage standard */}
                                {isEditing ? (
                                    <form onSubmit={(e) => handleSaveSettings(e, operator.id)} className="space-y-4 text-xs">

                                        {/* Changement de logo en mode édition */}
                                        <div className="flex items-center gap-3 bg-slate-50 p-2.5 border border-slate-200 rounded-xl">
                                            <input
                                                type="file"
                                                ref={editFileInputRef}
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => editFileInputRef.current?.click()}
                                                className="h-6 text-[9px] font-bold px-2 bg-white"
                                            >
                                                Mettre à jour le logo
                                            </Button>
                                            {formData.logo && <span className="text-[9px] text-emerald-600 font-bold">✓ Chargé</span>}
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className="font-bold text-slate-500 uppercase tracking-wider">Nom Opérateur</label>
                                                <input
                                                    type="text" value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="font-bold text-slate-500 uppercase tracking-wider">Validation Regex</label>
                                                <input
                                                    type="text" value={formData.prefix_regex}
                                                    onChange={e => setFormData({ ...formData, prefix_regex: e.target.value })}
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-blue-500"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="font-bold text-slate-500 uppercase tracking-wider">Longueur Numéro</label>
                                                <input
                                                    type="number" value={formData.phone_length}
                                                    onChange={e => setFormData({ ...formData, phone_length: Number(e.target.value) })}
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="font-bold text-slate-500 uppercase tracking-wider">Frais Fixes ({operator.country?.currency})</label>
                                                <input
                                                    type="number" value={formData.fixed_fee}
                                                    onChange={e => setFormData({ ...formData, fixed_fee: Number(e.target.value) })}
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="font-bold text-slate-500 uppercase tracking-wider">Frais Taux (ex: 0.02 = 2%)</label>
                                                <input
                                                    type="number" step="0.0001" value={formData.percent_fee}
                                                    onChange={e => setFormData({ ...formData, percent_fee: Number(e.target.value) })}
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="font-bold text-slate-500 uppercase tracking-wider">Montant Min</label>
                                                <input
                                                    type="number" value={formData.min_amount}
                                                    onChange={e => setFormData({ ...formData, min_amount: Number(e.target.value) })}
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                                                />
                                            </div>
                                            <div className="space-y-1 col-span-2">
                                                <label className="font-bold text-slate-500 uppercase tracking-wider">Montant Max</label>
                                                <input
                                                    type="number" value={formData.max_amount}
                                                    onChange={e => setFormData({ ...formData, max_amount: Number(e.target.value) })}
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-2 pt-1">
                                            <Button type="button" variant="outline" onClick={resetFormState} className="h-7 text-[10px] font-bold px-2.5">
                                                Annuler
                                            </Button>
                                            <Button type="submit" disabled={updateOperatorMutation.isPending} className="h-7 text-[10px] font-bold px-2.5 bg-blue-600 text-white hover:bg-blue-500">
                                                Sauvegarder
                                            </Button>
                                        </div>
                                    </form>
                                ) : (
                                    // Affichage Standard des Paramètres Techniques
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-4 text-xs">
                                            <div className="space-y-1 bg-slate-50 p-2.5 border border-slate-100 rounded-xl">
                                                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Règles de Numérotation</span>
                                                <div className="font-mono text-slate-700 font-semibold mt-0.5 truncate" title={operator.prefix_regex}>
                                                    Regex: {operator.prefix_regex || 'Aucune'}
                                                </div>
                                                <div className="text-slate-500 text-[11px] mt-0.5">Longueur attendue : {operator.phone_length} chiffres</div>
                                            </div>

                                            <div className="space-y-1 bg-slate-50 p-2.5 border border-slate-100 rounded-xl">
                                                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Frais & Commissions</span>
                                                <div className="font-semibold text-slate-700 mt-0.5">
                                                    Fixe : {Number(operator.fixed_fee).toLocaleString()} {operator.country?.currency}
                                                </div>
                                                <div className="text-blue-600 font-bold text-[11px] mt-0.5">
                                                    Taux système : {Number(operator.percent_fee * 100).toFixed(2)} %
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-[11px] bg-slate-900 text-slate-400 px-3.5 py-2 rounded-xl font-mono">
                                            <span>Limites d&apos;envoi :</span>
                                            <span className="text-white font-bold">
                                                {Number(operator.min_amount).toLocaleString()} à {Number(operator.max_amount).toLocaleString()} {operator.country?.currency}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {!isEditing && (
                                <div className="flex justify-end border-t border-slate-100 pt-3">
                                    <button
                                        onClick={() => startEditing(operator)}
                                        className="text-[11px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-500 bg-blue-50 hover:bg-blue-100/80 px-3 py-1.5 rounded-lg transition-all"
                                    >
                                        ⚙️ Configurer la passerelle
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}