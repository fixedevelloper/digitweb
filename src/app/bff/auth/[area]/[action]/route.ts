import { NextRequest, NextResponse } from 'next/server';
import {
  AREAS, clearSession, cookieName, cookieOptions, isArea, isSameOrigin, readToken, upstreamBase, upstreamHeaders,
} from '@/lib/server/session';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ area: string; action: string }> };

const json = (body: unknown, status: number) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

/**
 * Connexion / 2FA / inscription / déconnexion. Quand l'API renvoie un jeton, il est placé dans
 * un cookie HttpOnly et RETIRÉ de la réponse : le JavaScript du navigateur ne le voit jamais.
 */
export async function POST(request: NextRequest, { params }: Ctx) {
  const { area, action } = await params;

  if (!isArea(area) || !(action in AREAS[area].endpoints)) return json({ message: 'Introuvable.' }, 404);
  if (!isSameOrigin(request)) return json({ message: 'Origine non autorisée.' }, 403);

  const path = AREAS[area].endpoints[action as keyof (typeof AREAS)[typeof area]['endpoints']]!;

  if (action === 'logout') return logout(request, area, path);

  let upstream: Response;
  try {
    upstream = await fetch(`${upstreamBase()}${path}`, {
      method: 'POST',
      headers: upstreamHeaders(request),
      body: await request.arrayBuffer(),
      redirect: 'manual',
      cache: 'no-store',
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    return json({ message: 'Le serveur est injoignable. Réessayez dans un instant.' }, 502);
  }

  const data = await upstream.json().catch(() => null);

  if (!data) return json({ message: 'Réponse invalide du serveur.' }, 502);

  const headers: Record<string, string> = { 'Cache-Control': 'no-store' };
  const retryAfter = upstream.headers.get('retry-after');
  if (retryAfter) headers['Retry-After'] = retryAfter;

  // Connexion réussie : le jeton part dans le cookie HttpOnly et n'est PAS renvoyé au navigateur.
  if (upstream.ok && typeof data === 'object' && typeof data.token === 'string') {
    const { token, ...safe } = data as { token: string } & Record<string, unknown>;
    const response = NextResponse.json(safe, { status: upstream.status, headers });
    const options = cookieOptions(request, area);

    clearSession(response, area); // un éventuel cookie de l'autre schéma (http/https) ne doit pas subsister
    response.cookies.set(cookieName(area, options.secure), token, options);

    return response;
  }

  return NextResponse.json(data, { status: upstream.status, headers });
}

/** Révoque le jeton côté API puis efface le cookie, même si l'API est injoignable. */
async function logout(request: NextRequest, area: keyof typeof AREAS, path: string) {
  const token = readToken(request, area);

  if (token) {
    await fetch(`${upstreamBase()}${path}`, {
      method: 'POST',
      headers: upstreamHeaders(request, token),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    }).catch(() => undefined);
  }

  const response = json({ status: 'success' }, 200);
  clearSession(response, area);

  return response;
}
