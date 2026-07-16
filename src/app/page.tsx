import Link from 'next/link';

export default function Home() {
  return (
      <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 antialiased">
        {/* 1. Header / Navigation Légère */}
        <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Digit<span className="text-blue-600">Gateway</span>
            </span>
            </div>
            <div>
              <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
              >
                Accéder au Dashboard
              </Link>
            </div>
          </div>
        </header>

        {/* 2. Section Hero */}
        <main className="flex-1">
          <section className="relative overflow-hidden py-20 sm:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse"></span>
              Console Core Engine & Fintech API
            </span>
              <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
                L'infrastructure moderne pour vos <span className="text-blue-600">transferts d'argent</span>.
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                Pilotez, surveillez et optimisez vos flux financiers depuis une interface unifiée. Connecté nativement à l'écosystème performant de votre API Laravel.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-4">
                <Link
                    href="/login"
                    className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/10 hover:bg-blue-500 transition-all"
                >
                  Connecter ma session
                </Link>
                <a
                    href="#features"
                    className="text-sm font-semibold leading-6 text-slate-700 hover:text-slate-900 transition-colors"
                >
                  En savoir plus <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </section>

          {/* 3. Section Caractéristiques Techniques & Fonctionnelles */}
          <section id="features" className="border-t border-slate-200 bg-white py-24 sm:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-2xl lg:text-center">
                <h2 className="text-base font-semibold leading-7 text-blue-600">Performance & Sécurité</h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Tout ce dont vous avez besoin pour manager vos flux.
                </p>
              </div>

              <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                  {/* Feature 1 */}
                  <div className="flex flex-col bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                      <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      Réactivité Asynchrone
                    </dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                      <p className="flex-auto">
                        Synchronisation en temps réel de vos balances financières et états de transactions grâce aux caches avancés de TanStack Query.
                      </p>
                    </dd>
                  </div>

                  {/* Feature 2 */}
                  <div className="flex flex-col bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                      <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      Sécurité Renforcée
                    </dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                      <p className="flex-auto">
                        Authentification étanche adossée à Laravel Sanctum avec isolation complète des tokens de session et communications sécurisées par intercepteurs.
                      </p>
                    </dd>
                  </div>

                  {/* Feature 3 */}
                  <div className="flex flex-col bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                      <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      Analytics & Suivi
                    </dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                      <p className="flex-auto">
                        Tableaux de bord analytiques structurés sur des primitives Shadcn UI. Une lisibilité instantanée de vos KPI de transfert.
                      </p>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </section>
        </main>

        {/* 4. Footer */}
        <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
            <div>
              &copy; {new Date().getFullYear()} <span className="text-white font-medium">Digit-Gateway</span>. Tous droits réservés.
            </div>
            <div className="flex space-x-6 text-xs">
              <span className="text-slate-500">Stack : Next.js 16 &bull; Laravel API &bull; TanStack Query</span>
            </div>
          </div>
        </footer>
      </div>
  );
}