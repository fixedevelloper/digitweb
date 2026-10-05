import type { NextRequest, NextResponse } from 'next/server';

/**
 * Sessions du dashboard : le jeton Sanctum vit dans un cookie HttpOnly posé par ce serveur
 * Next.js (jamais lisible par le JavaScript de la page, donc hors de portée d'une faille XSS).
 * Le navigateur parle uniquement à /bff/* ; ce serveur ajoute l'en-tête Authorization
 * avant de relayer vers l'API Laravel.
 */

export type Area = 'admin' | 'merchant' | 'agent';

interface AreaConfig {
  cookie: string;
  /** Durée du cookie (s). Le jeton Laravel, lui, expire selon SANCTUM_EXPIRATION. */
  maxAge: number;
  endpoints: Partial<Record<'login' | 'two-factor' | 'register' | 'logout', string>>;
}

export const AREAS: Record<Area, AreaConfig> = {
  admin: {
    cookie: 'digit_admin',
    maxAge: 60 * 60 * 8,
    endpoints: { login: '/admin/auth/login', 'two-factor': '/admin/auth/2fa', logout: '/admin/auth/logout' },
  },
  merchant: {
    cookie: 'digit_merchant',
    maxAge: 60 * 60 * 24 * 7,
    endpoints: { login: '/merchants/login', 'two-factor': '/merchants/2fa', register: '/merchants/register', logout: '/merchants/logout' },
  },
  agent: {
    cookie: 'digit_agent',
    maxAge: 60 * 60 * 12,
    endpoints: { login: '/agent/auth/login', logout: '/agent/auth/logout' },
  },
};

export function isArea(value: string): value is Area {
  return value in AREAS;
}

/** URL de l'API vue depuis CE serveur (réseau Docker interne : http://web/api). */
export function upstreamBase(): string {
  return (process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');
}

export function isSecureRequest(request: NextRequest): boolean {
  return (request.headers.get('x-forwarded-proto') ?? request.nextUrl.protocol.replace(':', '')) === 'https';
}

/**
 * Préfixe `__Host-` en HTTPS : le navigateur refuse alors tout cookie du même nom posé depuis un
 * autre sous-domaine (fixation de session) ou avec un Domain/Path élargi.
 */
export function cookieName(area: Area, secure: boolean): string {
  return (secure ? '__Host-' : '') + AREAS[area].cookie;
}

/** Noms possibles (HTTPS ou non) : utilisé pour la lecture et l'effacement. */
export function cookieNames(area: Area): string[] {
  return [AREAS[area].cookie, `__Host-${AREAS[area].cookie}`];
}

export function readToken(request: NextRequest, area: Area): string | undefined {
  for (const name of cookieNames(area)) {
    const value = request.cookies.get(name)?.value;
    if (value) return value;
  }
  return undefined;
}

export function cookieOptions(request: NextRequest, area: Area, maxAge = AREAS[area].maxAge) {
  return {
    httpOnly: true,
    secure: isSecureRequest(request),
    // Lax : un lien externe vers le dashboard garde la session ; les POST inter-sites n'envoient pas le cookie.
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}

/**
 * Protection CSRF supplémentaire pour les requêtes qui modifient des données : le navigateur
 * envoie toujours Origin sur un POST ; il doit correspondre à l'hôte du dashboard.
 */
export function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return false;

  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** IP du visiteur transmise par Caddy : sans elle, tous les utilisateurs partageraient la limite anti brute-force de l'API. */
export function clientIp(request: NextRequest): string | undefined {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || undefined;
}

export function upstreamHeaders(request: NextRequest, token?: string): Headers {
  const headers = new Headers({ Accept: 'application/json' });
  const type = request.headers.get('content-type');
  if (type) headers.set('Content-Type', type);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const ip = clientIp(request);
  if (ip) headers.set('X-Forwarded-For', ip);
  const proto = request.headers.get('x-forwarded-proto');
  if (proto) headers.set('X-Forwarded-Proto', proto);
  return headers;
}

/**
 * Efface les cookies de session. Un cookie `__Host-` n'est supprimé que si le Set-Cookie
 * d'expiration porte aussi `Secure` : d'où ce helper plutôt que `cookies.delete()`.
 */
export function clearSession(response: NextResponse, area: Area): void {
  for (const name of cookieNames(area)) {
    response.cookies.set(name, '', { httpOnly: true, secure: name.startsWith('__Host-'), sameSite: 'lax', path: '/', maxAge: 0 });
  }
}
