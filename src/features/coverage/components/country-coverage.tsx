'use client';

import { useMemo, useState } from 'react';
import { useCoverage } from '../hooks/use-coverage';
import { COVERAGE_SERVICE_LABELS, CoveredCountry, CoverageService } from '../types';

type Filter = 'ALL' | CoverageService;

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'ALL', label: 'Tous les pays' },
  { value: 'MOBILE_MONEY', label: 'Mobile Money' },
  { value: 'BANK_TRANSFER', label: 'Virement bancaire' },
];

const SERVICE_STYLES: Record<CoverageService, string> = {
  MOBILE_MONEY: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
  BANK_TRANSFER: 'bg-blue-50 text-blue-700 ring-blue-600/15',
};

function Flag({ country }: { country: CoveredCountry }) {
  if (country.flag_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={country.flag_url} alt="" className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200" loading="lazy" />;
  }
  return (
    <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-500 ring-1 ring-slate-200">
      {country.iso}
    </span>
  );
}

function CountryCard({ country }: { country: CoveredCountry }) {
  const shown = country.operators.slice(0, 3);
  const extra = country.operators.length - shown.length;

  return (
    <li className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="flex items-center gap-3">
        <Flag country={country} />
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-slate-900">{country.name}</h3>
          <p className="text-xs text-slate-500">{country.iso}{country.currency ? ` · ${country.currency}` : ''}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {country.services.map((s) => (
          <span key={s} className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${SERVICE_STYLES[s]}`}>
            {COVERAGE_SERVICE_LABELS[s]}
          </span>
        ))}
      </div>

      {shown.length > 0 && (
        <p className="mt-3 text-xs leading-5 text-slate-500">
          {shown.join(', ')}{extra > 0 ? ` +${extra}` : ''}
        </p>
      )}
    </li>
  );
}

export function CountryCoverage() {
  const { data, isLoading, isError, refetch } = useCoverage();
  const [filter, setFilter] = useState<Filter>('ALL');
  const [query, setQuery] = useState('');

  const countries = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter((c) =>
      (filter === 'ALL' || c.services.includes(filter)) &&
      (q === '' || c.name.toLowerCase().includes(q) || c.iso.toLowerCase() === q || c.operators.some((o) => o.toLowerCase().includes(q))),
    );
  }, [data, filter, query]);

  return (
    <section id="couverture" className="scroll-mt-16 border-t border-slate-200 bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-blue-600">Couverture pays</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Où pouvez-vous envoyer de l&apos;argent ?</p>
          <p className="mt-4 text-base leading-7 text-slate-600">
            La liste ci-dessous reflète en temps réel les pays et services actuellement ouverts. Elle s&apos;étend au fil
            des nouveaux corridors.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div role="tablist" aria-label="Filtrer par service" className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                role="tab"
                aria-selected={filter === f.value}
                onClick={() => setFilter(f.value)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                  filter === f.value ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un pays ou un opérateur"
            aria-label="Rechercher un pays ou un opérateur"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 sm:w-72"
          />
        </div>

        {isLoading && (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-busy="true">
            {Array.from({ length: 8 }).map((_, i) => (
              <li key={i} className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white" />
            ))}
          </ul>
        )}

        {isError && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-sm text-slate-600">La couverture n&apos;a pas pu être chargée pour le moment.</p>
            <button onClick={() => refetch()} className="mt-3 text-sm font-semibold text-blue-600 hover:text-blue-500">Réessayer</button>
          </div>
        )}

        {!isLoading && !isError && countries.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            {(data ?? []).length === 0
              ? 'Les premiers corridors seront bientôt disponibles.'
              : 'Aucun pays ne correspond à votre recherche.'}
          </div>
        )}

        {countries.length > 0 && (
          <>
            <p className="mt-6 text-xs font-medium text-slate-500" aria-live="polite">
              {countries.length} pays {filter !== 'ALL' || query ? 'correspondant(s)' : 'couverts'}
            </p>
            <ul className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {countries.map((c) => <CountryCard key={c.iso} country={c} />)}
            </ul>
          </>
        )}

        <p className="mt-8 text-center text-xs text-slate-400">
          Votre pays n&apos;y figure pas ? Contactez-nous pour étudier l&apos;ouverture d&apos;un nouveau corridor.
        </p>
      </div>
    </section>
  );
}
