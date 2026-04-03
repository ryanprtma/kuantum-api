import { AppError } from '../../shared/errors.js';
import * as userRepo from '../user/user.repository.js';
import * as sessionService from '../session/session.service.js';
import * as sessionRepo from '../session/session.repository.js';
import * as jobApplicantRepo from './job-applicant.repository.js';

function isApplicantRole(role: string | null | undefined): boolean {
  return role === 'applicant';
}

async function ensureApplicantUser(userId: string | null | undefined) {
  if (!userId) {
    throw new AppError('Unauthorized', 401);
  }
  const user = await userRepo.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  if (!isApplicantRole(user.role)) {
    if (!user.role) {
      const updated = await userRepo.setRole(user.id, 'applicant');
      if (updated) return updated;
    }
    throw new AppError('User role must be applicant', 403);
  }
  return user;
}

export async function createForApplicant(
  userId: string | null | undefined,
  body: { jobId?: string }
) {
  const user = await ensureApplicantUser(userId);
  const jobId = body?.jobId;
  if (!jobId || typeof jobId !== 'string') {
    throw new AppError('jobId is required', 400);
  }

  const app = await jobApplicantRepo.insertOrGetApplication({ jobId, userId: user.id });

  const existingSessionId = await sessionRepo.findSessionIdByJobApplicantId(app.id);
  if (existingSessionId) {
    const urls = await sessionService.getSessionUrlsForExistingSession(existingSessionId);
    return {
      applicationId: app.id,
      sessionId: existingSessionId,
      jobId,
      userId: user.id,
      interviewUrl: urls.interviewUrl,
      externalInterviewUrl: urls.externalInterviewUrl,
      accessCode: urls.accessCode,
      status: 'invited',
    };
  }

  // Application only — recruiter creates interview session later (POST /api/sessions).
  return {
    applicationId: app.id,
    jobId,
    userId: user.id,
    status: 'applied',
    sessionId: null,
    interviewUrl: null,
    externalInterviewUrl: null,
    accessCode: null,
  };
}

export async function listMine(userId: string | null | undefined) {
  await ensureApplicantUser(userId);
  const rows = await jobApplicantRepo.listByUser(userId as string);
  return rows.map((r) => ({
    id: r.id,
    jobId: r.job_id,
    sessionId: r.session_id,
    jobTitle: r.job_title,
    department: r.department,
    employmentType: r.employment_type,
    companyName: r.company_name,
    status: r.session_id ? (r.status || 'invited') : 'applied',
    expiresAt: r.expires_at,
    createdAt: r.created_at,
  }));
}

const ACTIVE_SESSION_STATUSES = new Set(['invited', 'in_progress']);

/**
 * Sesi wawancara yang masih bisa diikuti (invited / in_progress) untuk lamaran ini.
 */
export async function getActiveSessionForMine(
  userId: string | null | undefined,
  applicationId: string,
) {
  await ensureApplicantUser(userId);
  const row = await jobApplicantRepo.findByIdAndUser(applicationId, userId as string);
  if (!row) {
    throw new AppError('Application not found', 404);
  }
  let sessionId = row.session_id ? String(row.session_id) : null;
  if (!sessionId) {
    sessionId = await sessionRepo.findSessionIdByJobApplicantId(applicationId);
  }
  if (!sessionId) {
    return { active: false as const };
  }
  let status = '';
  if (row.session_id && row.status != null && String(row.status).trim() !== '') {
    status = String(row.status);
  } else {
    const srow = await sessionRepo.findInstructionRowBySessionId(sessionId);
    status = srow?.status != null ? String(srow.status) : '';
  }
  if (!ACTIVE_SESSION_STATUSES.has(status)) {
    return {
      active: false as const,
      sessionId,
      status: status || undefined,
    };
  }
  const urls = await sessionService.getSessionUrlsForExistingSession(sessionId);
  return {
    active: true as const,
    sessionId,
    status,
    interviewUrl: urls.interviewUrl,
    externalInterviewUrl: urls.externalInterviewUrl,
    accessCode: {
      id: urls.accessCode.id,
      sessionCode: urls.accessCode.sessionCode,
    },
  };
}

export async function getMineDetail(userId: string | null | undefined, applicationId: string) {
  await ensureApplicantUser(userId);
  const row = await jobApplicantRepo.findByIdAndUser(applicationId, userId as string);
  if (!row) {
    throw new AppError('Application not found', 404);
  }
  const base = {
    id: row.id,
    jobId: row.job_id,
    sessionId: row.session_id,
    userId: row.user_id,
    status: row.status,
    candidateName: row.candidate_name,
    candidateEmail: row.candidate_email,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    job: {
      title: row.job_title,
      department: row.department,
      employmentType: row.employment_type,
    },
  };
  const sessionId = row.session_id ? String(row.session_id) : null;
  if (!sessionId) {
    return {
      ...base,
      interviewUrl: null,
      externalInterviewUrl: null,
      accessCode: null,
    };
  }
  const urls = await sessionService.getSessionUrlsForExistingSession(sessionId);
  return {
    ...base,
    interviewUrl: urls.interviewUrl,
    externalInterviewUrl: urls.externalInterviewUrl,
    accessCode: {
      id: urls.accessCode.id,
      sessionCode: urls.accessCode.sessionCode,
    },
  };
}
