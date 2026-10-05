import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { readToken, type Area } from '@/lib/server/session';

/**
 * Contrôle d'accès des pages côté serveur : sans cookie de session, on redirige vers la
 * connexion AVANT d'envoyer la moindre page (plus de « flash » de contenu protégé).
 * La validité réelle du jeton reste vérifiée par l'API à chaque appel.
 */
const SPACES: { area: Area; base: string; login: string; home: string; guarded: RegExp; guest: RegExp }[] = [
  { area: 'admin', base: '/dashboard', login: '/login', home: '/dashboard', guarded: /^\/dashboard(\/|$)/, guest: /^\/login$/ },
  { area: 'merchant', base: '/portal', login: '/portal/login', home: '/portal/dashboard', guarded: /^\/portal\/dashboard(\/|$)/, guest: /^\/portal\/(login|register)$/ },
  { area: 'agent', base: '/agent', login: '/agent/login', home: '/agent/dashboard', guarded: /^\/agent\/dashboard(\/|$)/, guest: /^\/agent\/login$/ },
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

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/portal/:path*', '/agent/:path*'],
};
