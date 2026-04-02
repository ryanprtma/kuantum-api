import { randomUUID } from 'crypto';
import * as sessionRepo from './session.repository.js';
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
      'Walk me through a complex architectural decision you made recently.',
      'How do you handle disagreement with a senior stakeholder on technology trade-offs?',
      'Describe a time you optimized a legacy system for scalability.',
    ];
  }
  return [
    'What motivates you in this role and company?',
    'Describe a challenging project and your contribution.',
    'How do you prioritize when deadlines conflict?',
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

export async function createSession(body: Record<string, unknown>) {
  const {
    jobId,
    candidateName,
    candidateEmail,
    agentInstruction,
    agentPersona,
    interviewLengthMinutes,
    focusAreas,
    dynamicProbing,
    questions,
  } = body;
  if (typeof jobId !== 'string' || !jobId) {
    throw new AppError('jobId is required', 400);
  }

  const job = await sessionRepo.findJobWithCompanyName(jobId);
  if (!job) {
    throw new AppError('Job not found', 404);
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
    candidateId,
    interviewId,
    token,
    jobId,
    candidateName: typeof candidateName === 'string' ? candidateName.trim() || null : null,
    candidateEmail: typeof candidateEmail === 'string' ? candidateEmail.trim() || null : null,
    agentInstruction: resolvedInstruction,
    agentPersona: resolvedPersona,
    interviewLengthMinutes: resolvedLength,
    focusAreasJson: JSON.stringify(resolvedFocus),
    dynamicProbing: resolvedProbing,
    questionsJson: JSON.stringify(qs),
  });

  const s = session as { id: string };
  const interviewUrl = `${INTERVIEW_REDIRECT_BASE_URL}/interview/${s.id}`;

  let externalInterviewUrl: string | null = null;
  if (EXTERNAL_INTERVIEW_REDIRECT_URL_TEMPLATE) {
    externalInterviewUrl = EXTERNAL_INTERVIEW_REDIRECT_URL_TEMPLATE.replace(
      /\{sessionId\}/g,
      encodeURIComponent(s.id)
    ).replace(
      /\{internalToken\}/g,
      encodeURIComponent(EXTERNAL_INTERVIEW_INTERNAL_TOKEN || '')
    );
  }

  return { ...session, interviewUrl, externalInterviewUrl };
}

export async function listSessions() {
  return sessionRepo.listWithJobAndCompany();
}
