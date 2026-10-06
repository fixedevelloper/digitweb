export type KybStatus = 'incomplete' | 'in_review' | 'approved' | 'rejected';

export interface KybDocument {
  id: number;
  type: string;
  original_name: string;
  mime: string;
  size: number;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  expires_at: string | null;
}

export interface KybChecklistItem {
  type: string;
  label: string;
  required: boolean;
  expires: boolean;
  expired: boolean;
  document: KybDocument | null;
}

export interface KybProfile {
  registration_number: string | null;
  tax_id: string | null;
  country: string | null;
  address: string | null;
  business_description: string | null;
  expected_monthly_volume: string | null;
}

export interface KybOverview {
  kyb_status: KybStatus;
  rejection_reason: string | null;
  grace_until: string | null;
  profile: KybProfile | null;
  profile_complete: boolean;
  can_submit: boolean;
  /** Le marchand a cliqué sur « Soumettre » (dossier en examen ou déjà décidé). */
  submitted: boolean;
  /** Ce qui empêche encore l'approbation, en clair. */
  blockers: string[];
  documents: KybChecklistItem[];
}

export const KYB_STATUS_LABELS: Record<KybStatus, { label: string; className: string }> = {
  incomplete: { label: 'Dossier incomplet', className: 'bg-slate-100 text-slate-600' },
  in_review: { label: 'En cours d\'examen', className: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Approuvé', className: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Refusé', className: 'bg-red-100 text-red-700' },
};

export const DOC_STATUS_LABELS = {
  pending: { label: 'En attente', className: 'text-amber-600' },
  approved: { label: 'Validée', className: 'text-emerald-600' },
  rejected: { label: 'Refusée', className: 'text-red-600' },
} as const;

/** Télécharge un fichier protégé (cookie de session) sans l'afficher dans le navigateur. */
export function saveBlob(data: Blob, filename: string) {
  const url = URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
