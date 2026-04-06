import { AppError } from '../../shared/errors.js';
import * as sessionRepo from '../session/session.repository.js';
import { mapSessionRowToInterviewItem } from './interview.mapper.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type InterviewListFilter = 'all' | 'completed';

export type InterviewListItem = ReturnType<typeof mapSessionRowToInterviewItem>;

export type ListInterviewsPagedResult = {
  items: InterviewListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const MAX_PAGE_SIZE = 100;

function clampInt(n: unknown, fallback: number, min: number, max: number): number {
  const x = typeof n === 'number' ? n : parseInt(String(n), 10);
  if (!Number.isFinite(x)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(x)));
}

/**
 * Daftar interview (session) dengan ringkasan untuk HR: kandidat, role, skor, status, tanggal.
 */
export async function listInterviews(filter: InterviewListFilter = 'all') {
  const rows = await sessionRepo.listForCandidates();
  let mapped = rows.map((r: Record<string, unknown>) => mapSessionRowToInterviewItem(r));
  if (filter === 'completed') {
    mapped = mapped.filter((item) => String(item.status || '').toLowerCase().includes('completed'));
  }
  return mapped;
}

/**
 * Sama seperti listInterviews, dengan slice server-side untuk pagination.
 * Query: `page` (default 1), `pageSize` (default 10, max 100).
 */
export async function listInterviewsPaged(
  filter: InterviewListFilter,
  pageRaw: unknown,
  pageSizeRaw: unknown
): Promise<ListInterviewsPagedResult> {
  const mapped = await listInterviews(filter);
  const total = mapped.length;
  const pageSize = clampInt(pageSizeRaw, 10, 1, MAX_PAGE_SIZE);
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
  let page = typeof pageRaw === 'number' || typeof pageRaw === 'string' ? parseInt(String(pageRaw), 10) : NaN;
  if (!Number.isFinite(page) || page < 1) page = 1;
  if (totalPages > 0) page = Math.min(page, totalPages);

  const start = (page - 1) * pageSize;
  const items = mapped.slice(start, start + pageSize);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
  };
}

/**
 * Integrasi eksternal: `applicationId` = `job_applicants.id`, ambil session terbaru, set status (saat ini hanya `completed`).
 */
export async function setLatestInterviewStatusByApplicationId(
  applicationIdRaw: unknown,
  statusRaw: unknown
) {
  const status = String(statusRaw || '')
    .trim()
    .toLowerCase();
  if (status !== 'completed') {
    throw new AppError('Query status must be completed', 400);
  }

  const applicationId =
    typeof applicationIdRaw === 'string'
      ? applicationIdRaw.trim()
      : applicationIdRaw != null
        ? String(applicationIdRaw).trim()
        : '';
  if (!applicationId || !UUID_RE.test(applicationId)) {
    throw new AppError('applicationId must be a valid UUID (job_applicants.id)', 400);
  }

  const sessionId = await sessionRepo.findLatestSessionIdByJobApplicantId(applicationId);
  if (!sessionId) {
    throw new AppError('No interview session found for this application', 404);
  }

  await sessionRepo.updateStatus(sessionId, 'completed');
  return { sessionId, applicationId, status: 'completed' as const };
}
