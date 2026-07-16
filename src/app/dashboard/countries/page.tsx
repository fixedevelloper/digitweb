'use client';

import { useState, useRef } from 'react';
import { useCountries, Country } from '@/features/countries/hooks/use-countries';
import { Button } from '@/components/ui/button';

export default function CountriesPage() {
    const { data: countries, isLoading, error, updateCountry, isUpdating } = useCountries();

    // États pour la création et l'édition
    const [isCreating, setIsCreating] = useState(false);
    const [editingCountryId, setEditingCountryId] = useState<number | null>(null);

    // Références pour les inputs de type file
    const createFileInputRef = useRef<HTMLInputElement>(null);
    const editFileInputRef = useRef<HTMLInputElement>(null);

    // Structure de données locale pour les formulaires
    const [formData, setFormData] = useState<{
        name: string;
        iso: string;
        iso3: string;
        phonecode: number;
        currency: string;
        flag: File | null;
        flagPreview: string | null;
    }>({
        name: '',
        iso: '',
        iso3: '',
        phonecode: 237,
        currency: 'XAF',
        flag: null,
        flagPreview: null,
    });

    if (isLoading) {
        return <div className="p-6 text-sm font-semibold text-slate-500 animate-pulse">Analyse des zones de routage transfrontalières...</div>;
    }

    if (error) {
        return <div className="p-6 text-sm font-bold text-red-600">Erreur : Impossible de charger la liste des corridors régionaux.</div>;
    }

    const handleToggleCountry = (id: number, currentStatus: any) => {
        const isActive = typeof currentStatus === 'string' ? currentStatus === '1' : !!currentStatus;
        updateCountry({
            id,
            data: { status: !isActive }
        });
    };

    // Gestion du changement de fichier image
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            setFormData(prev => {
                // 1. Si un aperçu local existait déjà, on le nettoie de la mémoire
                // On vérifie qu'il s'agit bien d'une URL locale blob: pour ne pas détruire l'URL distante de ton API Laravel
                if (prev.flagPreview && prev.flagPreview.startsWith('blob:')) {
                    URL.revokeObjectURL(prev.flagPreview);
                }

                // 2. On retourne le nouvel état avec le nouvel aperçu
                return {
                    ...prev,
                    flag: file,
                    flagPreview: URL.createObjectURL(file)
                };
            });
        }
    };

    // Déclencheur Mode Édition
    const startEditing = (country: Country) => {
        setIsCreating(false);
        setEditingCountryId(country.id);
        setFormData({
            name: country.name,
            iso: country.iso,
            iso3: country.iso3,
            phonecode: Number(country.phonecode),
            currency: country.currency,
            flag: null,
            // Si ton API Laravel renvoie l'URL du drapeau stocké, mets-la ici en fallback
            flagPreview: (country as any).flag_url || null,
        });
    };

    // Déclencheur Mode Création
    const startCreating = () => {
        setEditingCountryId(null);
        setFormData({ name: '', iso: '', iso3: '', phonecode: 237, currency: 'XAF', flag: null, flagPreview: null });
        setIsCreating(true);
    };

    // Soumission avec instanciation de FormData pour Laravel
    const handleSaveSettings = (e: React.FormEvent, id?: number) => {
        e.preventDefault();

        const dataPayload = new FormData();
        dataPayload.append('name', formData.name);
        dataPayload.append('iso', formData.iso);
        dataPayload.append('iso3', formData.iso3);
        dataPayload.append('phonecode', String(formData.phonecode));
        dataPayload.append('currency', formData.currency);

        if (formData.flag) {
            dataPayload.append('flag', formData.flag); // Le fichier binaire
        }

        if (id) {
            // TRÈS IMPORTANT : On simule un PUT sous le capot d'un POST
            dataPayload.append('_method', 'PUT');

            updateCountry({
                id,
                data: dataPayload as any,
                // Assure-toi que ta méthode axios/fetch sous-jacente utilise bien POST !
            }, {
                onSuccess: () => setEditingCountryId(null)
            });
        } else {
            updateCountry({
                id: 0,
                data: dataPayload as any,
            }, {
                onSuccess: () => setIsCreating(false)
            });
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-150">

            {/* En-tête de page */}
            <div className="border-b border-slate-100 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                        Corridors & Zones Géographiques
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Définis les pays ouverts sur ta passerelle, gère les devises par défaut et associe les visuels des drapeaux.
                    </p>
                </div>
                <button
                    onClick={startCreating}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all self-start sm:self-center"
                >
                    ＋ Ajouter un Corridor
                </button>
            </div>

            {/* Formulaire de création */}
            {isCreating && (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-5 animate-in slide-in-from-top-4 duration-200">
                    <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Nouveau corridor de routage</h3>
                    <form onSubmit={(e) => handleSaveSettings(e)} className="space-y-4">

                        {/* Section Upload Drapeau */}
                        <div className="flex items-center gap-4 bg-white p-4 border border-slate-200 rounded-xl max-w-md">
                            <div className="w-16 h-10 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden shadow-inner">
                                {formData.flagPreview ? (
                                    <img src={formData.flagPreview} alt="Aperçu drapeau" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-[10px] text-slate-400 font-bold">No Flag</span>
                                )}
                            </div>
                            <div className="space-y-1">
                                <label className="block font-bold text-slate-500 uppercase tracking-wider text-[10px]">Image du drapeau</label>
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
                                    {formData.flag ? 'Changer l\'image' : 'Choisir un fichier'}
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <label className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Nom du Pays</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Cameroun"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-blue-500 text-xs font-semibold"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Code ISO (2 chars)</label>
                                <input
                                    type="text"
                                    required
                                    maxLength={2}
                                    placeholder="Ex: CM"
                                    value={formData.iso}
                                    onChange={e => setFormData({ ...formData, iso: e.target.value.toUpperCase() })}
                                    className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-blue-500 font-mono text-xs uppercase"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Code ISO-3 (3 chars)</label>
                                <input
                                    type="text"
                                    required
                                    maxLength={3}
                                    placeholder="Ex: CMR"
                                    value={formData.iso3}
                                    onChange={e => setFormData({ ...formData, iso3: e.target.value.toUpperCase() })}
                                    className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-blue-500 font-mono text-xs uppercase"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 max-w-md">
                            <div className="space-y-1">
                                <label className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Indicatif Tél.</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.phonecode}
                                    onChange={e => setFormData({ ...formData, phonecode: Number(e.target.value) })}
                                    className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-blue-500 font-mono text-xs"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Devise Locale</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.currency}
                                    onChange={e => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
                                    className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-blue-500 font-mono text-xs"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200/60">
                            <Button type="button" variant="outline" onClick={() => setIsCreating(false)} className="h-8 text-[11px] font-bold px-3">
                                Annuler
                            </Button>
                            <Button type="submit" disabled={isUpdating} className="h-8 text-[11px] font-bold px-3 bg-blue-600 text-white hover:bg-blue-500">
                                Enregistrer la zone
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Grille des Corridors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {countries?.map((country) => {
                    const isEditing = editingCountryId === country.id;
                    const isActive = typeof country.status === 'string' ? country.status === '1' : !!country.status;

                    return (
                        <div
                            key={country.id}
                            className={`bg-white rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                                isActive ? 'border-slate-200 shadow-sm' : 'border-red-200 bg-red-50/5 shadow-none'
                            }`}
                        >
                            <div>
                                {/* Header du Pays */}
                                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                                    <div className="flex items-center gap-3">

                                        {/* Box Drapeau ou code ISO */}
                                        <div className="w-12 h-8 rounded-lg bg-slate-100 border border-slate-200/60 flex items-center justify-center font-black text-xs text-slate-700 shadow-inner overflow-hidden">
                                            {isEditing && formData.flagPreview ? (
                                                <img src={formData.flagPreview} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (country as any).flag_url ? (
                                                <img src={(country as any).flag_url} alt={country.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{country.iso}</span>
                                            )}
                                        </div>

                                        <div className="space-y-0.5">
                                            <h3 className="text-sm font-bold text-slate-900">
                                                {isEditing ? formData.name || country.name : country.name}
                                            </h3>
                                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                                                ISO-3 : {isEditing ? formData.iso3 || country.iso3 : country.iso3}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleToggleCountry(country.id, country.status)}
                                        disabled={isUpdating}
                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${
                                            isActive
                                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 hover:bg-red-500 hover:text-white hover:border-transparent'
                                                : 'bg-red-500 text-white border-transparent hover:bg-emerald-600'
                                        }`}
                                    >
                                        {isActive ? '● Actif' : '○ Suspendu'}
                                    </button>
                                </div>

                                {/* Formulaire ou Données statiques */}
                                <div className="py-4 text-xs">
                                    {isEditing ? (
                                        <form onSubmit={(e) => handleSaveSettings(e, country.id)} className="space-y-4">

                                            {/* Changement de drapeau en mode édition */}
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
                                                    Mettre à jour le drapeau
                                                </Button>
                                                {formData.flag && <span className="text-[9px] text-emerald-600 font-bold">✓ Modifié</span>}
                                            </div>

                                            <div className="space-y-1">
                                                <label className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Nom Complet</label>
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-xs font-semibold"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <label className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Indicatif Tél.</label>
                                                    <input
                                                        type="number"
                                                        value={formData.phonecode}
                                                        onChange={e => setFormData({ ...formData, phonecode: Number(e.target.value) })}
                                                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Devise Locale</label>
                                                    <input
                                                        type="text"
                                                        value={formData.currency}
                                                        onChange={e => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
                                                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <label className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">ISO (2 chars)</label>
                                                    <input
                                                        type="text"
                                                        maxLength={2}
                                                        value={formData.iso}
                                                        onChange={e => setFormData({ ...formData, iso: e.target.value.toUpperCase() })}
                                                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono text-xs uppercase"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">ISO-3 (3 chars)</label>
                                                    <input
                                                        type="text"
                                                        maxLength={3}
                                                        value={formData.iso3}
                                                        onChange={e => setFormData({ ...formData, iso3: e.target.value.toUpperCase() })}
                                                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono text-xs uppercase"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex justify-end gap-2 pt-1">
                                                <Button type="button" variant="outline" onClick={() => setEditingCountryId(null)} className="h-7 text-[10px] font-bold px-2.5">
                                                    Annuler
                                                </Button>
                                                <Button type="submit" disabled={isUpdating} className="h-7 text-[10px] font-bold px-2.5 bg-blue-600 text-white hover:bg-blue-500">
                                                    Sauvegarder
                                                </Button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4 bg-slate-50/80 p-3 border border-slate-100 rounded-xl font-medium text-slate-600">
                                            <div>
                                                <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Préfixe Tel</span>
                                                <span className="font-mono text-slate-800 font-bold text-sm">+{country.phonecode}</span>
                                            </div>
                                            <div>
                                                <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Devise Pivot</span>
                                                <span className="font-mono text-blue-600 font-bold text-sm">{country.currency}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {!isEditing && (
                                <div className="flex justify-end border-t border-slate-100 pt-3">
                                    <button
                                        onClick={() => startEditing(country)}
                                        className="text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition-all"
                                    >
                                        ✏️ Modifier les clés
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