import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const MAX_BYTES = 8 * 1024;

/**
 * Réception des violations de CSP (report-uri). Public par nature : le navigateur n'envoie pas
 * de cookie. On se contente de journaliser une ligne compacte (visible avec `docker compose logs
 * dashboard`) ; le corps est borné et jamais interprété.
 */
export async function POST(request: NextRequest) {
  const raw = (await request.text()).slice(0, MAX_BYTES);

  try {
    const report = JSON.parse(raw)['csp-report'] ?? JSON.parse(raw);
    console.warn('[CSP]', JSON.stringify({
      directive: report['violated-directive'] ?? report.effectiveDirective,
      blocked: report['blocked-uri'] ?? report.blockedURL,
      document: report['document-uri'] ?? report.documentURL,
      source: report['source-file'] ?? report.sourceFile,
      line: report['line-number'] ?? report.lineNumber,
      disposition: report.disposition,
    }).slice(0, 600));
  } catch {
    // Rapport illisible : ignoré.
  }

  return new NextResponse(null, { status: 204 });
}
