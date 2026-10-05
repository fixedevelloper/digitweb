/**
 * Content-Security-Policy du dashboard.
 *
 * Objectif : même si une faille XSS permettait d'injecter du HTML, le navigateur refuse
 * d'exécuter tout script qui ne porte pas le nonce généré pour CETTE requête, et de contacter
 * un serveur non prévu. Les jetons de session étant déjà en cookies HttpOnly, c'est la 2e barrière.
 *
 * - `script-src` : nonce + 'strict-dynamic' (les scripts chargés par un script de confiance le sont aussi) ;
 *   aucun 'unsafe-inline' ni 'unsafe-eval' en production.
 * - `style-src` : nonce pour les balises <style> ; les attributs style="" (utilisés par Recharts) restent
 *   permis via `style-src-attr` : ils ne peuvent pas exécuter de code.
 * - `img-src` / `connect-src` : l'origine de l'API (logos, drapeaux, endpoint public de couverture).
 */

export type CspMode = 'enforce' | 'report-only' | 'off';

export function cspMode(): CspMode {
  const mode = process.env.CSP_MODE;
  return mode === 'report-only' || mode === 'off' ? mode : 'enforce';
}

export function cspHeaderName(mode: CspMode): string {
  return mode === 'report-only' ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy';
}

function apiOrigin(): string | null {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').origin;
  } catch {
    return null;
  }
}

export function buildCsp(nonce: string): string {
  const dev = process.env.NODE_ENV === 'development';
  const api = apiOrigin();

  const directives: string[] = [
    "default-src 'self'",
    // React utilise eval() en développement uniquement (reconstruction des piles d'erreur).
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ''}`,
    `style-src 'self' ${dev ? "'unsafe-inline'" : `'nonce-${nonce}'`}`,
    "style-src-attr 'unsafe-inline'",
    `img-src 'self' data: blob:${api ? ` ${api}` : ''}`,
    "font-src 'self'",
    `connect-src 'self'${api ? ` ${api}` : ''}${dev ? ' ws: wss:' : ''}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'report-uri /bff/csp-report',
  ];

  if (!dev) directives.push('upgrade-insecure-requests');

  return directives.join('; ');
}

export function newNonce(): string {
  return btoa(crypto.randomUUID());
}
