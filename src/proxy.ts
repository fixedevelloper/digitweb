import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { readToken, type Area } from '@/lib/server/session';
import { buildCsp, cspHeaderName, cspMode, newNonce } from '@/lib/server/csp';

/**
 * 1. Contrôle d'accès des pages côté serveur : sans cookie de session, on redirige vers la
 *    connexion AVANT d'envoyer la moindre page. La validité réelle du jeton reste vérifiée par
 *    l'API à chaque appel.
 * 2. Content-Security-Policy avec un nonce par requête (voir lib/server/csp.ts). Les pages sont donc
 *    rendues à la demande (cf. `dynamic = 'force-dynamic'` dans app/layout.tsx).
 */
const SPACES: { area: Area; login: string; home: string; guarded: RegExp; guest: RegExp }[] = [
  { area: 'admin', login: '/login', home: '/dashboard', guarded: /^\/dashboard(\/|$)/, guest: /^\/login$/ },
  { area: 'merchant', login: '/portal/login', home: '/portal/dashboard', guarded: /^\/portal\/dashboard(\/|$)/, guest: /^\/portal\/(login|register)$/ },
  { area: 'agent', login: '/agent/login', home: '/agent/dashboard', guarded: /^\/agent\/dashboard(\/|$)/, guest: /^\/agent\/login$/ },
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  for (const space of SPACES) {
    const hasSession = !!readToken(request, space.area);

    if (space.guarded.test(pathname) && !hasSession) {
      return NextResponse.redirect(new URL(space.login, request.url));
    }

    if (space.guest.test(pathname) && hasSession) {
      return NextResponse.redirect(new URL(space.home, request.url));
    }
  }

  const mode = cspMode();
  if (mode === 'off') return NextResponse.next();

  const nonce = newNonce();
  const csp = buildCsp(nonce);
  const header = cspHeaderName(mode);

  // Next.js lit le nonce dans l'en-tête de la REQUÊTE pour l'appliquer à ses scripts et styles.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set(header, csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set(header, csp);

  return response;
}

export const config = {
  matcher: [
    {
      // Pages uniquement : ni le relais /bff, ni les fichiers statiques, ni les prefetch.
      source: '/((?!bff|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
