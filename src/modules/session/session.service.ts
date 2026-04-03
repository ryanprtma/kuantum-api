import { randomUUID } from 'crypto';
import * as sessionRepo from './session.repository.js';
import * as accessCodeService from '../access-code/access-code.service.js';
import { AppError } from '../../shared/errors.js';
import {
  INTERVIEW_REDIRECT_BASE_URL,
  EXTERNAL_INTERVIEW_REDIRECT_URL_TEMPLATE,
  EXTERNAL_INTERVIEW_INTERNAL_TOKEN,
} from '../../config/env.js';

function defaultQuestionsFromJobTitle(title: string) {
  const t = (title || '').toLowerCase();
  if (t.includes('engineer') || t.includes('developer')) {
    return [
      'Ceritakan keputusan arsitektur kompleks yang baru-baru ini Anda ambil.',
      'Bagaimana Anda menangani perbedaan pendapat dengan stakeholder senior terkait trade-off teknologi?',
      'Ceritakan saat Anda mengoptimalkan sistem legacy untuk skalabilitas.',
    ];
  }
  return [
    'Apa yang memotivasi Anda untuk peran dan perusahaan ini?',
    'Ceritakan proyek yang menantang dan kontribusi Anda.',
    'Bagaimana Anda menentukan prioritas saat tenggat waktu saling bertabrakan?',
  ];
}

function asStr(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

function asNum(v: unknown): number | undefined {
  return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
}

function asBool(v: unknown): boolean | undefined {
  return typeof v === 'boolean' ? v : undefined;
}

function asStrArr(v: unknown): string[] {
  return Array.isArray(v) ? v.map(String) : [];
}

function ensureHttpScheme(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url.replace(/^\/+/, '')}`;
}

function buildExternalInterviewUrl(template: string, accessCodeId: string): string {
  const codeId = encodeURIComponent(accessCodeId);
  const internalToken = encodeURIComponent(EXTERNAL_INTERVIEW_INTERNAL_TOKEN || '');
  const preparedTemplate = ensureHttpScheme(template.trim());

  const replaced = preparedTemplate
    .replace(/\{accessCode\}/g, codeId)
    .replace(/\{sessionId\}/g, codeId)
    .replace(/\{internalToken\}/g, internalToken);

  if (replaced !== preparedTemplate) {
    return replaced;
  }

  const [baseUrl, hashFragment] = replaced.split('#', 2);
  const normalizedBase = baseUrl.replace(/[?&]+$/, '');
  const separator = normalizedBase.includes('?') ? '&' : '?';
  return `${normalizedBase}${separator}accesCode=${codeId}${hashFragment ? `#${hashFragment}` : ''}`;
}

export async function createSession(body: Record<string, unknown>) {
  const {
    jobApplicantId,
    agentInstruction,
    agentPersona,
    interviewLengthMinutes,
    focusAreas,
    dynamicProbing,
    questions,
  } = body;
  if (typeof jobApplicantId !== 'string' || !jobApplicantId) {
    throw new AppError('jobApplicantId is required', 400);
  }

  const existing = await sessionRepo.findSessionIdByJobApplicantId(jobApplicantId);
  if (existing) {
    throw new AppError('Interview session already exists for this application', 409);
  }

  const job = await sessionRepo.findJobApplicantContext(jobApplicantId);
  if (!job) {
    throw new AppError('Application not found', 404);
  }

  const title = asStr(job.title) ?? '';
  const companyName = asStr(job.company_name) ?? '';

  const resolvedInstruction =
    typeof agentInstruction === 'string' && agentInstruction.trim()
      ? agentInstruction.trim()
      : `You are a professional AI interviewer for ${title} at ${companyName}. Be concise, fair, and probe based on answers.`;

  const dq = job.default_questions;
  const defaultQs =
    Array.isArray(dq) && dq.length > 0 ? dq.map(String) : defaultQuestionsFromJobTitle(title);

  const qs =
    Array.isArray(questions) && questions.length > 0 ? questions.map(String) : defaultQs;

  const resolvedPersona =
    (typeof agentPersona === 'string' && agentPersona.trim()
      ? agentPersona.trim()
      : null) ||
    asStr(job.default_agent_persona) ||
    'Technical Advisor';

  const defLen = asNum(job.default_interview_length_minutes);
  const resolvedLength = Number.isFinite(interviewLengthMinutes as number)
    ? (interviewLengthMinutes as number)
    : defLen ?? 30;

  const resolvedFocus =
    Array.isArray(focusAreas) && focusAreas.length > 0
      ? focusAreas.map(String)
      : asStrArr(job.default_focus_areas);

  const resolvedProbing =
    typeof dynamicProbing === 'boolean'
      ? dynamicProbing
      : asBool(job.default_dynamic_probing) ?? true;

  const candidateId = randomUUID();
  const interviewId = randomUUID();
  const token = randomUUID();
  const session = await sessionRepo.insertSession({
    jobApplicantId,
    candidateId,
    interviewId,
    token,
    agentInstruction: resolvedInstruction,
    agentPersona: resolvedPersona,
    interviewLengthMinutes: resolvedLength,
    focusAreasJson: JSON.stringify(resolvedFocus),
    dynamicProbing: resolvedProbing,
    questionsJson: JSON.stringify(qs),
  });

  const s = session as { id: string };
  const interviewUrl = `${INTERVIEW_REDIRECT_BASE_URL}/interview/${s.id}`;

  const accessCode = await accessCodeService.getOrCreateAccessCodeForSession(s.id);

  let externalInterviewUrl: string | null = null;
  if (EXTERNAL_INTERVIEW_REDIRECT_URL_TEMPLATE) {
    externalInterviewUrl = buildExternalInterviewUrl(EXTERNAL_INTERVIEW_REDIRECT_URL_TEMPLATE, accessCode.id);
  }

  return { ...session, interviewUrl, externalInterviewUrl, accessCode };
}

export async function getSessionUrlsForExistingSession(sessionId: string) {
  const accessCode = await accessCodeService.getOrCreateAccessCodeForSession(sessionId);
  const interviewUrl = `${INTERVIEW_REDIRECT_BASE_URL}/interview/${sessionId}`;
  let externalInterviewUrl: string | null = null;
  if (EXTERNAL_INTERVIEW_REDIRECT_URL_TEMPLATE) {
    externalInterviewUrl = buildExternalInterviewUrl(EXTERNAL_INTERVIEW_REDIRECT_URL_TEMPLATE, accessCode.id);
  }
  return { interviewUrl, externalInterviewUrl, accessCode };
}

export async function listSessions() {
  return sessionRepo.listWithJobAndCompany();
}
