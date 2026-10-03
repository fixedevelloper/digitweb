import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extrait un message lisible d'une erreur Axios, en priorité depuis la
 * première erreur de validation Laravel (422 `errors`), sinon depuis
 * `message`, sinon un texte générique.
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined;
    const firstFieldError = data?.errors ? Object.values(data.errors)[0]?.[0] : undefined;
    return firstFieldError || data?.message || "Une erreur est survenue.";
  }
  return "Une erreur est survenue.";
}

/**
 * URL de la documentation OpenAPI (Scramble) servie par l'API Laravel.
 *
 * Si NEXT_PUBLIC_DOCS_URL est défini (doc déployée sur un sous-domaine dédié,
 * ex: https://docs.digitagateway.com — cf. DOCS_DOMAIN côté digit-api), on
 * l'utilise tel quel. Sinon on dérive /docs/api de NEXT_PUBLIC_API_URL, comme
 * en local où la doc reste sur le même domaine que l'API.
 */
export function getApiDocsUrl(): string {
  if (process.env.NEXT_PUBLIC_DOCS_URL) {
    return process.env.NEXT_PUBLIC_DOCS_URL;
  }

  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  return `${base.replace(/\/api\/?$/, '')}/docs/api`;
}
