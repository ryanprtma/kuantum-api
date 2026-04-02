import dotenv from 'dotenv';

dotenv.config();

export const PORT = Number(process.env.PORT) || 3001;

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, '');
}

const defaultPublicApp = 'http://localhost:5173';

/** URL publik app (link undangan, dll.) */
export const PUBLIC_APP_BASE_URL = stripTrailingSlash(process.env.PUBLIC_APP_BASE_URL || defaultPublicApp);

/**
 * Base URL untuk halaman wawancara agent (`/interview/:token`) dan redirect 302.
 * Diisi lewat env `INTERVIEW_REDIRECT_BASE_URL`; jika kosong, mengikuti `PUBLIC_APP_BASE_URL`.
 */
export const INTERVIEW_REDIRECT_BASE_URL = stripTrailingSlash(
  process.env.INTERVIEW_REDIRECT_BASE_URL || process.env.PUBLIC_APP_BASE_URL || defaultPublicApp
);

export const EXTERNAL_TRANSCRIPTION_URL_TEMPLATE = (process.env.EXTERNAL_TRANSCRIPTION_URL_TEMPLATE || '').trim();

export const EXTERNAL_TRANSCRIPTION_API_KEY = (process.env.EXTERNAL_TRANSCRIPTION_API_KEY || '').trim();

/**
 * External interview redirect
 * - Dipakai untuk mengalihkan session/interview ke provider eksternal.
 * - Jika template kosong, aplikasi tetap redirect ke halaman internal `/interview/:id`.
 * - Template bisa memakai placeholder:
 *   - {sessionId}
 *   - {internalToken}
 */
export const EXTERNAL_INTERVIEW_REDIRECT_URL_TEMPLATE = (
  process.env.EXTERNAL_INTERVIEW_REDIRECT_URL_TEMPLATE || ''
).trim();

/** Token internal untuk sistem eksternal agar bisa akses endpoint recruiter/redirect. */
export const EXTERNAL_INTERVIEW_INTERNAL_TOKEN = (
  process.env.EXTERNAL_INTERVIEW_INTERNAL_TOKEN || ''
).trim();

export function externalTranscriptionHeaders(): Record<string, string> {
  const raw = process.env.EXTERNAL_TRANSCRIPTION_HEADERS_JSON;
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}
