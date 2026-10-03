'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getApiDocsUrl } from '@/lib/utils';
import { CountryCoverage } from '@/features/coverage/components/country-coverage';
import { CoverageStats } from '@/features/coverage/components/coverage-stats';

const NAV_LINKS = [
  { href: '#services', label: 'Services' },
  { href: '#couverture', label: 'Couverture' },
  { href: '#integration', label: 'Intégration' },
  { href: '#securite', label: 'Sécurité' },
];

const SERVICES = [
  {
    title: 'Mobile Money',
    text: 'Envoyez vers les portefeuilles mobiles des principaux opérateurs, avec conversion de devise au taux affiché avant validation.',
    points: ['Transferts, retraits et dépôts', 'Cotation figée avant confirmation', 'Confirmation par statut ou webhook'],
    icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
        </svg>
    ),
  },
  {
    title: 'Virement bancaire',
    text: 'Versez directement sur un compte bancaire dans les pays ouverts. Les champs demandés s’adaptent à chaque pays.',
    points: ['IBAN, BIC ou numéro de compte selon le pays', 'Frais calculés avant débit', 'Suivi complet de chaque étape'],
    icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
        </svg>
    ),
  },
  {
    title: 'Suivi & Remboursement',
    text: 'Chaque opération a un statut clair, de la création à la confirmation. En cas de rejet ou d’échec, le solde est restitué.',
    points: ['Statuts consultables par API', 'Remboursement automatique', 'Historique d’audit des opérations'],
    icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
    ),
  },
];

const STEPS = [
  { step: '01', title: 'Créez votre compte', text: 'Inscription libre et immédiate, sans carte bancaire requise.' },
  { step: '02', title: 'Générez votre clé API', text: 'Configurez des permissions personnalisées selon vos besoins.' },
  { step: '03', title: 'Testez en Sandbox', text: 'Simulez succès, retards et échecs dans un environnement Isolé.' },
  { step: '04', title: 'Passez en Production', text: 'Activez vos identifiants live dès validation de votre dossier.' },
];

const SECURITY = [
  { title: 'Clés API scopées', text: 'Rôles granulaires (transfert, virement, lecture). Stockage sous hash sécurisé et révocation instantanée.' },
  { title: 'Requêtes idempotentes', text: 'L’en-tête Idempotency-Key empêche les doublons en cas de retentatives réseau.' },
  { title: 'Sandbox isolée', text: 'Environnement de simulation hermétique, sans impact sur les réseaux réels des opérateurs.' },
  { title: 'Documentation OpenAPI', text: 'Spécifications à jour générées directement depuis le code source pour un dev-experience idéal.' },
];

function SectionTitle({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
      <div className="mx-auto max-w-3xl text-center">
      <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold tracking-wide uppercase text-blue-700 ring-1 ring-inset ring-blue-700/10">
        {eyebrow}
      </span>
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          {title}
        </h2>
        {text && <p className="mt-4 text-lg leading-relaxed text-slate-600">{text}</p>}
      </div>
  );
}

function CodeWindow({ title, children }: { title: string; children: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
      <div className="group relative overflow-hidden rounded-2xl bg-slate-950 shadow-2xl ring-1 ring-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/50 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-500/80" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
            <span className="ml-2 font-mono text-xs font-medium text-slate-400">{title}</span>
          </div>
          <button
              onClick={handleCopy}
              className="rounded-md bg-slate-800 px-2.5 py-1 font-mono text-xs text-slate-300 transition hover:bg-slate-700 hover:text-white"
          >
            {copied ? 'Copié !' : 'Copier'}
          </button>
        </div>
        <pre className="overflow-x-auto p-5 font-mono text-xs leading-relaxed text-slate-300 sm:text-sm">
        <code>{children}</code>
      </pre>
      </div>
  );
}

export default function Home() {
  const docsUrl = getApiDocsUrl();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
      <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased selection:bg-blue-500 selection:text-white">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-3 transition hover:opacity-90">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 shadow-lg shadow-blue-500/25">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </span>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Digita<span className="text-blue-600">Gateway</span>
            </span>
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              {NAV_LINKS.map((l) => (
                  <a key={l.href} href={l.href} className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
                    {l.label}
                  </a>
              ))}
              <a href={docsUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
                Documentation
              </a>
            </nav>

            <div className="hidden items-center gap-3 md:flex">
              <Link href="/portal/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                Connexion
              </Link>
              <Link href="/portal/register" className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/30">
                Créer un compte
              </Link>
            </div>

            <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
                aria-label="Menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>

          {/* Mobile Navigation Dropdown */}
          {mobileMenuOpen && (
              <div className="border-b border-slate-200 bg-white px-4 pb-6 pt-2 md:hidden">
                <nav className="flex flex-col gap-2">
                  {NAV_LINKS.map((l) => (
                      <a key={l.href} href={l.href} onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50">
                        {l.label}
                      </a>
                  ))}
                  <a href={docsUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50">
                    Documentation
                  </a>
                  <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4">
                    <Link href="/portal/login" className="w-full text-center rounded-xl bg-slate-100 py-2.5 text-sm font-semibold text-slate-800">
                      Connexion
                    </Link>
                    <Link href="/portal/register" className="w-full text-center rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-md">
                      Créer un compte
                    </Link>
                  </div>
                </nav>
              </div>
          )}
        </header>

        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative overflow-hidden bg-white pb-20 pt-20 lg:pb-32 lg:pt-28">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

            <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-4 py-1.5 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600"></span>
              </span>
                <span className="text-xs font-semibold text-blue-900">API de transferts nouvelle génération</span>
              </div>

              <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
                Unifiez vos paiements <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 bg-clip-text text-transparent">
                Mobile Money & Banque
              </span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 sm:text-xl">
                Déployez une infrastructure de paiement robuste en quelques minutes. Intégrez l&apos;API, simulez vos flux en Sandbox et passez en production sans friction.
              </p>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link href="/portal/register" className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-blue-500/35">
                  Commencer gratuitement
                </Link>
                <a href={docsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-7 py-3.5 text-base font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-slate-800">
                  Explorer les Docs
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </a>
              </div>

              <div className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-500">
                <Link href="/portal/login" className="transition hover:text-slate-900 font-medium">Espace Marchand →</Link>
                <span className="text-slate-300">•</span>
                <a href="/apk/app-arm64-v8a-release.apk" download="DigitaGateway.apk" className="transition hover:text-slate-900 font-medium">
                  App Android (APK) ↓
                </a>
              </div>

              <div className="mt-16">
                <CoverageStats />
              </div>
            </div>
          </section>

          {/* Services */}
          <section id="services" className="scroll-mt-16 border-t border-slate-200/80 bg-slate-50/50 py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <SectionTitle
                  eyebrow="Services & Fonctionnalités"
                  title="Tout ce dont vous avez besoin pour vos opérations"
                  text="Une suite d'outils pensée pour automatiser et sécuriser vos transactions à grande échelle."
              />

              <div className="mt-16 grid gap-8 lg:grid-cols-3">
                {SERVICES.map((s) => (
                    <article key={s.title} className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5">
                      <div>
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                      {s.icon}
                    </span>
                        <h3 className="mt-6 text-xl font-bold text-slate-900">{s.title}</h3>
                        <p className="mt-3 text-sm leading-relaxed text-slate-600">{s.text}</p>
                      </div>
                      <ul className="mt-6 space-y-3 border-t border-slate-100 pt-6 text-sm text-slate-700">
                        {s.points.map((p) => (
                            <li key={p} className="flex items-center gap-3">
                              <svg className="h-5 w-5 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                              <span>{p}</span>
                            </li>
                        ))}
                      </ul>
                    </article>
                ))}
              </div>
            </div>
          </section>

          {/* Couverture */}
          <CountryCoverage />

          {/* Intégration Code */}
          <section id="integration" className="scroll-mt-16 border-t border-slate-200/80 bg-white py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <SectionTitle
                  eyebrow="Intégration Développeur"
                  title="Une API intuitive, conçue pour aller vite"
                  text="Format JSON standardisé, gestion explicite des erreurs et identifiants sécurisés."
              />

              <div className="mt-16 grid gap-8 lg:grid-cols-2">
                <CodeWindow title="POST /api/v1/gateway/transfers">
                  {`curl -X POST https://api.digitagateway.com/v1/gateway/transfers \\
  -H "Authorization: Bearer sk_test_51H8x9k..." \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: $(uuidgen)" \\
  -d '{
    "country": "CM",
    "carrier": "MTN",
    "number": "677000000",
    "amount": 5000
  }'`}
                </CodeWindow>

                <CodeWindow title="POST /api/v1/gateway/bank-transfers">
                  {`curl -X POST https://api.digitagateway.com/v1/gateway/bank-transfers \\
  -H "Authorization: Bearer sk_test_51H8x9k..." \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: $(uuidgen)" \\
  -d '{
    "country": "SN",
    "amount": 10000,
    "beneficiary": {
      "full_name": "Awa Diop",
      "bank_name": "CBAO",
      "account_number": "0123456789"
    }
  }'`}
                </CodeWindow>
              </div>

              <div className="mt-10 text-center">
                <a href={docsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 transition hover:text-blue-700">
                  Consulter la documentation interactive Swagger / OpenAPI
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </a>
              </div>
            </div>
          </section>

          {/* Étapes */}
          <section className="border-t border-slate-200/80 bg-slate-900 py-24 text-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
              <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-400 ring-1 ring-inset ring-blue-500/20">
                Mise en route
              </span>
                <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Prêt en 4 étapes simples</h2>
              </div>

              <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {STEPS.map((s) => (
                    <div key={s.title} className="relative rounded-2xl border border-slate-800 bg-slate-800/40 p-6 backdrop-blur">
                      <span className="font-mono text-3xl font-extrabold text-blue-500">{s.step}</span>
                      <h3 className="mt-4 text-lg font-bold text-white">{s.title}</h3>
                      <p className="mt-2 text-sm text-slate-400">{s.text}</p>
                    </div>
                ))}
              </div>
            </div>
          </section>

          {/* Sécurité */}
          <section id="securite" className="scroll-mt-16 bg-white py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <SectionTitle
                  eyebrow="Sécurité & Conformité"
                  title="Construit pour des exigences bancaires"
                  text="Une protection maximale à chaque couche pour vos données et vos transactions."
              />

              <div className="mt-16 grid gap-8 sm:grid-cols-2">
                {SECURITY.map((f) => (
                    <div key={f.title} className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-8 transition hover:border-slate-300">
                      <h3 className="text-lg font-bold text-slate-900">{f.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.text}</p>
                    </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="px-4 pb-24 sm:px-6 lg:px-8">
            <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 px-6 py-16 text-center shadow-2xl sm:px-12 lg:py-20">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
              <div className="relative">
                <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                  Prêt à intégrer DigitaGateway ?
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-lg text-blue-100">
                  Lancez vos tests en environnement Sandbox dès aujourd&apos;hui sans engagement.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <Link href="/portal/register" className="rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-blue-600 shadow-lg transition hover:bg-blue-50">
                    Créer un compte marchand
                  </Link>
                  <a href={docsUrl} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-white/30 bg-white/10 px-7 py-3.5 text-base font-semibold text-white backdrop-blur transition hover:bg-white/20">
                    Documentation API
                  </a>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800 bg-slate-950 py-12 text-slate-400">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 text-sm sm:px-6 md:flex-row lg:px-8">
            <div className="text-center md:text-left">
              <span className="text-lg font-bold text-white">Digita<span className="text-blue-500">Gateway</span></span>
              <p className="mt-1 text-xs text-slate-500">&copy; {new Date().getFullYear()} Digita-Gateway Inc. Tous droits réservés.</p>
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs">
              <a href="#couverture" className="transition hover:text-white">Couverture</a>
              <a href={docsUrl} target="_blank" rel="noopener noreferrer" className="transition hover:text-white">Documentation</a>
              <Link href="/portal/login" className="transition hover:text-white">Espace Marchand</Link>
              <Link href="/agent/login" className="transition hover:text-white">Espace Agent</Link>
              <Link href="/login" className="transition hover:text-white">Console Admin</Link>
            </nav>
          </div>
        </footer>
      </div>
  );
}