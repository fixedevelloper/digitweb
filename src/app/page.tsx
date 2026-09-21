import Link from 'next/link';
import { getApiDocsUrl } from '@/lib/utils';

export default function Home() {
  const docsUrl = getApiDocsUrl();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 antialiased">
      {/* 1. Header / Navigation */}
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
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
            >
              Documentation
            </a>
            <Link
              href="/portal/login"
              className="hidden sm:inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
            >
              Espace marchand
            </Link>
            <Link
              href="/portal/register"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* 2. Section Hero */}
        <section className="relative overflow-hidden py-20 sm:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse"></span>
              API Mobile Money pour développeurs
            </span>
            <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
              Intégrez le <span className="text-blue-600">mobile money</span> à votre produit en quelques minutes.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Une API REST unique pour envoyer, recevoir et suivre des transferts mobile money. Créez votre compte,
              générez une clé API sandbox et passez votre premier appel sans attendre de validation.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
              <Link
                href="/portal/register"
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/10 hover:bg-blue-500 transition-all"
              >
                Créer un compte développeur
              </Link>
              <a
                href={docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-slate-800 transition-all"
              >
                Voir la documentation
                <span aria-hidden="true">→</span>
              </a>
            </div>
            <p className="mt-6 text-xs text-slate-400">
              Déjà un compte ?{' '}
              <Link href="/portal/login" className="font-semibold text-slate-600 hover:text-slate-800">
                Connectez-vous à votre espace marchand
              </Link>
              {' · '}
              Vous êtes un utilisateur de l&apos;app ?{' '}
              <a href="/apk/digitwave-server-v7-0.apk" download="DigitGateway.apk" className="font-semibold text-slate-600 hover:text-slate-800">
                Téléchargez DigitGateway Android
              </a>
              {' · '}
              <Link href="/login" className="font-semibold text-slate-600 hover:text-slate-800">
                Console admin
              </Link>
            </p>
          </div>
        </section>

        {/* 3. Extrait de code — premier appel API */}
        <section className="border-t border-slate-200 bg-white py-20 sm:py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-base font-semibold leading-7 text-blue-600">En quelques lignes</h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  Un transfert, un seul appel.
                </p>
                <p className="mt-4 text-base leading-7 text-slate-600">
                  Chaque clé API est scopée (transfert, retrait, dépôt, lecture), hashée en base et révocable à tout
                  moment depuis votre espace marchand. Commencez en environnement sandbox, sans engagement.
                </p>
                <Link
                  href="/portal/register"
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-500"
                >
                  Générer ma première clé API <span aria-hidden="true">→</span>
                </Link>
              </div>

              <div className="rounded-2xl bg-slate-900 shadow-xl overflow-hidden">
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-slate-800">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
                  <span className="ml-2 text-[11px] font-mono text-slate-500">terminal</span>
                </div>
                <pre className="p-5 text-[12.5px] leading-relaxed text-slate-300 overflow-x-auto">
                  <code>{`curl -X POST https://votre-domaine.tld/api/v1/gateway/transfers \\
  -H "Authorization: Bearer sk_test_51H8x9k..." \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: $(uuidgen)" \\
  -d '{
    "country": "CM",
    "carrier": "MTN",
    "number": "677000000",
    "amount": 5000
  }'`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Comment ça marche */}
        <section className="border-t border-slate-200 bg-slate-50 py-20 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-base font-semibold leading-7 text-blue-600">Mise en route</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                De l&apos;inscription au premier transfert.
              </p>
            </div>

            <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3">
              {[
                { step: '1', title: 'Créez votre compte', text: "Inscription libre et immédiate, en environnement sandbox." },
                { step: '2', title: 'Générez une clé API', text: 'Choisissez les permissions nécessaires (transfert, retrait, dépôt, lecture).' },
                { step: '3', title: 'Passez en production', text: 'Après validation de votre dossier, activez vos clés de production.' },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="mx-auto h-10 w-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shadow-sm">
                    {item.step}
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Caractéristiques */}
        <section id="features" className="border-t border-slate-200 bg-white py-24 sm:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-blue-600">Performance & Sécurité</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Pensé pour les équipes qui intègrent, pas seulement pour celles qui administrent.
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
                    Intégration self-service
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                    <p className="flex-auto">
                      Créez votre compte marchand et générez une clé API sandbox immédiatement, sans validation
                      manuelle préalable. La production s&apos;active une fois votre dossier vérifié.
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
                    Clés API scopées
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                    <p className="flex-auto">
                      Chaque clé n&apos;expose que les permissions nécessaires (transfert, retrait, dépôt, lecture),
                      n&apos;est jamais stockée en clair et se révoque en un clic depuis votre espace marchand.
                    </p>
                  </dd>
                </div>

                {/* Feature 3 */}
                <div className="flex flex-col bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    Documentation vivante
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                    <p className="flex-auto">
                      Spécification OpenAPI générée automatiquement depuis le code, toujours synchronisée avec les
                      endpoints réels et testable directement depuis le navigateur.
                    </p>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>
      </main>

      {/* 6. Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div>
            &copy; {new Date().getFullYear()} <span className="text-white font-medium">Digit-Gateway</span>. Tous droits réservés.
          </div>
          <div className="flex items-center gap-6 text-xs">
            <a href={docsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              Documentation
            </a>
            <Link href="/portal/login" className="hover:text-white transition-colors">
              Espace marchand
            </Link>
            <Link href="/login" className="hover:text-white transition-colors">
              Console admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
