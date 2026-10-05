import { NextRequest, NextResponse } from 'next/server';
import {
  clearSession, isArea, isSameOrigin, readToken, upstreamBase, upstreamHeaders,
} from '@/lib/server/session';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ area: string; path: string[] }> };

// En-têtes de la réponse API relayés au navigateur (le reste, dont Set-Cookie, est volontairement ignoré).
const FORWARDED_RESPONSE_HEADERS = ['content-type', 'content-disposition', 'retry-after', 'x-ratelimit-limit', 'x-ratelimit-remaining'];

// Exports Excel/PDF : plus longs que les appels JSON.
const TIMEOUT_MS = 120_000;

/**
 * Relais authentifié vers l'API Laravel : le navigateur appelle /bff/<espace>/<chemin API> ;
 * le jeton est lu dans le cookie HttpOnly et ajouté en Authorization. Aucune route d'API n'est
 * exposée autrement : Laravel reste seul juge des droits (rôle, statut, 2FA).
 */
async function relay(request: NextRequest, { params }: Ctx): Promise<NextResponse> {
  const { area, path } = await params;

  if (!isArea(area) || path.some((segment) => segment === '..' || segment === '.' || segment === '')) {
    return NextResponse.json({ message: 'Introuvable.' }, { status: 404 });
  }

  const unsafe = !['GET', 'HEAD', 'OPTIONS'].includes(request.method);
  if (unsafe && !isSameOrigin(request)) {
    return NextResponse.json({ message: 'Origine non autorisée.' }, { status: 403 });
  }

  const token = readToken(request, area);
  if (!token) {
    return NextResponse.json({ message: 'Session expirée. Reconnectez-vous.' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }

  const target = `${upstreamBase()}/${path.map(encodeURIComponent).join('/')}${request.nextUrl.search}`;

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers: upstreamHeaders(request, token),
      body: unsafe ? await request.arrayBuffer() : undefined,
      redirect: 'manual',
      cache: 'no-store',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    return NextResponse.json({ message: 'Le serveur est injoignable. Réessayez dans un instant.' }, { status: 502 });
  }

  const headers = new Headers({ 'Cache-Control': 'no-store' });
  for (const name of FORWARDED_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }

  const response = new NextResponse(upstream.body, { status: upstream.status, headers });

  // Jeton révoqué ou expiré côté API : on efface aussi le cookie, le client est renvoyé vers la connexion.
  if (upstream.status === 401) clearSession(response, area);

  return response;
}

export const GET = relay;
export const POST = relay;
export const PUT = relay;
export const PATCH = relay;
export const DELETE = relay;
