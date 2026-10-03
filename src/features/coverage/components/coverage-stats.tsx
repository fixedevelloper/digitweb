'use client';

import { useCoverage } from '../hooks/use-coverage';

/** Chiffres clés calculés à partir de la couverture réelle (rien d'inventé : masqué tant que les données manquent). */
export function CoverageStats() {
  const { data } = useCoverage();

  if (!data || data.length === 0) return null;

  const stats = [
    { value: data.length, label: data.length > 1 ? 'pays couverts' : 'pays couvert' },
    { value: data.filter((c) => c.services.includes('MOBILE_MONEY')).length, label: 'avec Mobile Money' },
    { value: data.filter((c) => c.services.includes('BANK_TRANSFER')).length, label: 'avec virement bancaire' },
  ];

  return (
    <dl className="mx-auto mt-14 grid max-w-2xl grid-cols-3 divide-x divide-slate-200 rounded-2xl border border-slate-200 bg-white/70 py-5 shadow-sm backdrop-blur">
      {stats.map((s) => (
        <div key={s.label} className="px-4 text-center">
          <dt className="sr-only">{s.label}</dt>
          <dd className="text-3xl font-bold tracking-tight text-slate-900">{s.value}</dd>
          <p className="mt-1 text-xs font-medium text-slate-500">{s.label}</p>
        </div>
      ))}
    </dl>
  );
}
