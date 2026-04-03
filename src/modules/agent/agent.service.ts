import * as sessionRepo from '../session/session.repository.js';
import * as accessCodeRepo from '../access-code/access-code.repository.js';
import * as jobApplicantRepo from '../job-applicant/job-applicant.repository.js';
import * as transcriptionRepo from './transcription.repository.js';
import { analyzeTranscriptStub } from './analysis.service.js';
import { AppError } from '../../shared/errors.js';
import {
  INTERVIEW_REDIRECT_BASE_URL,
  EXTERNAL_INTERVIEW_REDIRECT_URL_TEMPLATE,
  EXTERNAL_INTERVIEW_INTERNAL_TOKEN,
  EXTERNAL_TRANSCRIPTION_URL_TEMPLATE,
  EXTERNAL_TRANSCRIPTION_API_KEY,
  externalTranscriptionHeaders,
} from '../../config/env.js';

export type InstructionContext = {
  sessionId: string;
  candidateId: string;
  interviewId: string;
  token: string;
  expiresAt: string;
  agentInstruction: string;
  agentPersona: string;
  interviewLengthMinutes: number;
  focusAreas: unknown[];
  dynamicProbing: boolean;
  companyProfile: {
    id: unknown;
    name: unknown;
    industry: unknown;
  };
  jobDescription: {
    id: unknown;
    title: unknown;
    department: unknown;
    employmentType: unknown;
    description: unknown;
    requirements: unknown;
  };
  questions: string[];
  candidate: {
    name: unknown;
    email: unknown;
  };
  status: unknown;
};

function mapInstructionRow(row: Record<string, unknown>): InstructionContext {
  const companyProfile = {
    id: row.company_id,
    name: row.company_name,
    industry: row.company_industry,
  };

  const jobDescription = {
    id: row.job_id,
    title: row.job_title,
    department: row.department,
    employmentType: row.employment_type,
    description: row.description,
    requirements: row.requirements,
  };

  const q = row.questions;
  const questions = Array.isArray(q) ? (q as unknown[]).map(String) : [];

  return {
    sessionId: String(row.session_id),
    candidateId: String(row.candidate_id),
    interviewId: String(row.interview_id),
    token: String(row.token),
    expiresAt: String(row.expires_at),
    agentInstruction: String(row.agent_instruction ?? ''),
    agentPersona: String(row.agent_persona ?? 'Technical Advisor'),
    interviewLengthMinutes: Number(row.interview_length_minutes) || 30,
    focusAreas: (row.focus_areas as unknown[]) || [],
    dynamicProbing: Boolean(row.dynamic_probing),
    companyProfile,
    jobDescription,
    questions,
    candidate: {
      name: row.candidate_name,
      email: row.candidate_email,
    },
    status: row.status,
  };
}

function assertLinkIsNotExpired(expiresAt: string): void {
  const exp = new Date(expiresAt).getTime();
  if (!Number.isFinite(exp)) return;
  if (Date.now() > exp) {
    throw new AppError('Interview link has expired', 410);
  }
}

function formatRequirements(req: unknown): string {
  if (Array.isArray(req)) {
    return req.map((x, i) => `${i + 1}. ${String(x)}`).join('\n');
  }
  if (req && typeof req === 'object') {
    try {
      return JSON.stringify(req, null, 2);
    } catch {
      return String(req);
    }
  }
  if (req == null || req === '') return '(none listed)';
  return String(req);
}

function formatFocusAreas(areas: unknown[]): string {
  if (!areas.length) return '(use role defaults)';
  return areas.map((a, i) => `${i + 1}. ${String(a)}`).join('\n');
}

function translateAgentInstructionToId(input: string): string {
  const s = input.trim();
  if (!s) return s;
  const sl = s.toLowerCase();

  // Current common prompt in DB (English) -> Indonesian.
  if (sl.includes('focus on api design') && sl.includes('scaling') && sl.includes('concrete trade')) {
    return 'Fokus pada desain API dan scaling. Tanyakan trade-off yang konkret.';
  }

  return s;
}

function translateQuestionToId(input: string): string {
  const s = input.trim();
  if (!s) return s;
  const sl = s.toLowerCase();

  // Rate limiting
  if (sl.includes('design rate limiting') && sl.includes('public api')) {
    return 'Ceritakan bagaimana Anda akan merancang rate limiting untuk API publik.';
  }

  // Production incident scaling
  if (sl.includes('production incident') && sl.includes('scaling')) {
    return 'Ceritakan sebuah insiden produksi yang terkait scaling dan apa yang Anda ubah setelahnya.';
  }

  // Consistency vs availability for writes
  if (
    sl.includes('consistency') &&
    sl.includes('availability') &&
    sl.includes('user-facing') &&
    sl.includes('writes')
  ) {
    return 'Bagaimana Anda menyeimbangkan konsistensi vs ketersediaan untuk write yang terlihat pengguna?';
  }

  // Old default questions (English) -> Indonesian (keep in sync with session defaults).
  if (sl === 'walk me through a complex architectural decision you made recently.') {
    return 'Ceritakan keputusan arsitektur kompleks yang baru-baru ini Anda ambil.';
  }
  if (sl.includes('disagreement with a senior stakeholder') && sl.includes('trade-offs')) {
    return 'Bagaimana Anda menangani perbedaan pendapat dengan stakeholder senior terkait trade-off teknologi?';
  }
  if (sl.includes('optimized a legacy system') && sl.includes('scalability')) {
    return 'Ceritakan saat Anda mengoptimalkan sistem legacy untuk skalabilitas.';
  }
  if (sl === 'what motivates you in this role and company?') {
    return 'Apa yang memotivasi Anda untuk peran dan perusahaan ini?';
  }
  if (sl.includes('describe a challenging project') && sl.includes('your contribution')) {
    return 'Ceritakan proyek yang menantang dan kontribusi Anda.';
  }
  if (sl.includes('prioritize when deadlines conflict')) {
    return 'Bagaimana Anda menentukan prioritas saat tenggat waktu saling bertabrakan?';
  }

  return s;
}

/** Prompt siap pakai untuk LLM / voice agent */
export function buildGeneratedInstructionSet(ctx: InstructionContext): {
  fullPrompt: string;
  sections: {
    identityAndRole: string;
    companyProfile: string;
    jobDescription: string;
    candidateContext: string;
    interviewFormat: string;
    questionList: string;
  };
} {
  const title = String(ctx.jobDescription.title ?? '');
  const companyName = String(ctx.companyProfile.name ?? '');
  const dept = String(ctx.jobDescription.department ?? '');
  const desc = String(ctx.jobDescription.description ?? '');
  const emp = String(ctx.jobDescription.employmentType ?? 'full-time');
  const reqBlock = formatRequirements(ctx.jobDescription.requirements);
  const candName = ctx.candidate.name != null ? String(ctx.candidate.name) : 'the candidate';
  const candEmail = ctx.candidate.email != null ? String(ctx.candidate.email) : '';

  const identityAndRole = [
    `You are the interviewer persona: "${ctx.agentPersona}".`,
    `Conduct a structured voice interview for the role "${title}" at ${companyName}.`,
    `Stay professional, concise, and fair. Ask follow-ups when answers are vague.`,
  ].join('\n');

  const companyProfile = [
    `Company: ${companyName}`,
    `Industry: ${String(ctx.companyProfile.industry ?? '')}`,
    `Company id (reference): ${String(ctx.companyProfile.id ?? '')}`,
  ].join('\n');

  const jobDescription = [
    `Role: ${title}`,
    `Department: ${dept}`,
    `Employment: ${emp}`,
    ``,
    `Description:`,
    desc || '(no description)',
    ``,
    `Requirements / expectations:`,
    reqBlock,
  ].join('\n');

  const candidateContext = [
    `Candidate name: ${candName}`,
    candEmail ? `Candidate email: ${candEmail}` : null,
    `Session status: ${String(ctx.status ?? '')}`,
  ]
    .filter(Boolean)
    .join('\n');

  const interviewFormat = [
    `Target length: approximately ${ctx.interviewLengthMinutes} minutes.`,
    `Focus areas for probing:`,
    formatFocusAreas(ctx.focusAreas as unknown[]),
    `Dynamic probing (dig deeper based on answers): ${ctx.dynamicProbing ? 'yes' : 'no'}`,
  ].join('\n');

  const questionList =
    ctx.questions.length > 0
      ? ctx.questions.map((q, i) => `${i + 1}. ${q}`).join('\n')
      : '(Tidak ada daftar tetap — simpulkan dari job description dan area fokus.)';

  const coreInstruction = [
    `## Interviewer-specific instructions`,
    ctx.agentInstruction.trim() || '(Use default professional interview behavior.)',
  ].join('\n');

  const fullPrompt = [
    `# Voice interview agent — instruction set`,
    ``,
    identityAndRole,
    ``,
    `# Company profile`,
    companyProfile,
    ``,
    `# Job description`,
    jobDescription,
    ``,
    `# Candidate context`,
    candidateContext,
    ``,
    `# Interview format`,
    interviewFormat,
    ``,
    coreInstruction,
    ``,
    `# Pertanyaan yang perlu dibahas (tanyakan secara natural; urutan fleksibel)`,
    questionList,
  ].join('\n');

  return {
    fullPrompt,
    sections: {
      identityAndRole,
      companyProfile,
      jobDescription,
      candidateContext,
      interviewFormat,
      questionList,
    },
  };
}

export async function getInstructionSetBySessionId(
  rawSessionId: string | undefined,
  rawApplicationId?: string
) {
  const requestedSessionId = rawSessionId?.trim();
  if (!requestedSessionId) {
    throw new AppError('sessionId (candidate session id) is required', 400);
  }
  const requestedApplicationId = rawApplicationId?.trim();

  const isUuid = (s: string): boolean =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);

  // `requestedSessionId` can be:
  // - internal UUID (interview_sessions.id)
  // - external short session code (access_codes.session_code)
  let sessionUuid: string;
  if (isUuid(requestedSessionId)) {
    sessionUuid = requestedSessionId;
  } else {
    const accessRow = await accessCodeRepo.findValidBySessionCode(requestedSessionId);
    if (!accessRow) {
      throw new AppError('Access code not valid or expired', 404);
    }
    sessionUuid = accessRow.session_id;
  }

  if (requestedApplicationId) {
    const sessionIdByApplication = await jobApplicantRepo.findSessionIdByApplicationId(requestedApplicationId);
    if (!sessionIdByApplication) {
      throw new AppError('Application not found', 404);
    }
    if (sessionIdByApplication !== sessionUuid) {
      throw new AppError('applicationId does not match sessionId', 400);
    }
  }

  // Auto-resolve application id from applicant table when query param is omitted.
  const resolvedApplicationId =
    requestedApplicationId || (await jobApplicantRepo.findApplicationIdBySessionId(sessionUuid));

  const row = await sessionRepo.findInstructionRowBySessionId(sessionUuid);
  if (!row) {
    throw new AppError('Session not found', 404);
  }
  const base = mapInstructionRow(row as Record<string, unknown>);
  assertLinkIsNotExpired(base.expiresAt);
  const instructionBaseRaw =
    base.agentInstruction.trim() || '(Use default professional interview behavior.)';
  const instructionBase = translateAgentInstructionToId(instructionBaseRaw);
  const questionBlock =
    base.questions.length > 0
      ? base.questions
          .map((q, i) => `${i + 1}. ${translateQuestionToId(q)}`)
          .join('\n')
      : '';

  const instruction =
    questionBlock.length > 0 ? `${instructionBase}\n\nPertanyaan yang perlu dibahas:\n${questionBlock}` : instructionBase;

  // NOTE: `instruction` = agentInstruction + merged question list.
  // (This intentionally removes the previous `generated.fullPrompt/sections` structure.)
  return {
    id: requestedSessionId,
    applicationId: resolvedApplicationId || null,
    instruction,
    job: {
      title: String(base.jobDescription.title ?? ''),
      description: String(base.jobDescription.description ?? ''),
    },
    company: {
      name: String(base.companyProfile.name ?? ''),
      description: String(base.companyProfile.industry ?? ''),
      address: '',
    },
    // Placeholders (no columns exist currently for these fields in the DB schema).
    jobUrl: 'https://example.com/software-engineer',
    companyLandingPage: 'https://company.com',
  };
}

/** `sessionId` = `interview_sessions.id` (link memakai session id). */
export async function getInterviewRedirectUrlForSession(rawSessionId: string | undefined): Promise<string> {
  const sessionId = rawSessionId?.trim();
  if (!sessionId) {
    throw new AppError('sessionId is required', 400);
  }
  const link = await sessionRepo.findLinkIdentityBySessionId(sessionId);
  if (!link) {
    throw new AppError('Session not found', 404);
  }
  assertLinkIsNotExpired(link.expires_at);

  if (!EXTERNAL_INTERVIEW_REDIRECT_URL_TEMPLATE) {
    return `${INTERVIEW_REDIRECT_BASE_URL}/interview/${sessionId}`;
  }

  const internalToken = EXTERNAL_INTERVIEW_INTERNAL_TOKEN || '';
  const url = EXTERNAL_INTERVIEW_REDIRECT_URL_TEMPLATE.replace(
    /\{sessionId\}/g,
    encodeURIComponent(sessionId)
  ).replace(
    /\{internalToken\}/g,
    encodeURIComponent(internalToken)
  );

  return url;
}

export async function getTranscriptionsForDisplay(rawToken: string | undefined) {
  const token = rawToken?.trim();
  if (!token) {
    throw new AppError('token is required', 400);
  }
  const sessionId = await sessionRepo.findIdByToken(token);
  if (!sessionId) {
    throw new AppError('Session not found for token', 404);
  }
  const instructionRow = await sessionRepo.findInstructionRowBySessionId(sessionId);
  if (instructionRow) {
    const base = mapInstructionRow(instructionRow as Record<string, unknown>);
    assertLinkIsNotExpired(base.expiresAt);
  }

  if (EXTERNAL_TRANSCRIPTION_URL_TEMPLATE) {
    const url = EXTERNAL_TRANSCRIPTION_URL_TEMPLATE.replace(/\{token\}/g, encodeURIComponent(token)).replace(
      /\{sessionId\}/g,
      encodeURIComponent(sessionId)
    );
    const headers: Record<string, string> = {
      Accept: 'application/json, text/plain, */*',
      ...externalTranscriptionHeaders(),
    };
    if (EXTERNAL_TRANSCRIPTION_API_KEY) {
      headers.Authorization = `Bearer ${EXTERNAL_TRANSCRIPTION_API_KEY}`;
    }
    const res = await fetch(url, { headers, method: 'GET' });
    const text = await res.text();
    let payload: unknown;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = { raw: text };
    }
    if (!res.ok) {
      const msg =
        typeof payload === 'object' ? JSON.stringify(payload) : text;
      throw new AppError(`External transcription API error: ${res.status} ${msg}`.slice(0, 500), 502);
    }
    return {
      source: 'external' as const,
      sessionId,
      token,
      data: payload,
    };
  }

  const rows = await transcriptionRepo.findAllBySessionId(sessionId);
  return {
    source: 'database' as const,
    sessionId,
    token,
    transcriptions: rows.map((r: Record<string, unknown>) => ({
      id: r.id,
      transcriptText: r.transcript_text,
      segments: r.segments,
      meta: r.meta,
      createdAt: r.created_at,
    })),
  };
}

export async function getInstructionsByToken(rawToken: string | undefined) {
  const token = rawToken?.trim();
  if (!token) {
    throw new AppError('token is required', 400);
  }
  const row = await sessionRepo.findInstructionRowByToken(token);
  if (!row) {
    throw new AppError('Invalid or expired interview link', 404);
  }
  const mapped = mapInstructionRow(row as Record<string, unknown>);
  assertLinkIsNotExpired(mapped.expiresAt);
  return mapped;
}

export async function submitTranscription(body: Record<string, unknown>) {
  const { token, transcript, segments, meta } = body;
  if (typeof token !== 'string' || typeof transcript !== 'string') {
    throw new AppError('token and transcript (string) are required', 400);
  }

  const sessionId = await sessionRepo.findIdByToken(token);
  if (!sessionId) {
    throw new AppError('Session not found for token', 404);
  }
  const instructionRow = await sessionRepo.findInstructionRowBySessionId(sessionId);
  if (instructionRow) {
    const base = mapInstructionRow(instructionRow as Record<string, unknown>);
    assertLinkIsNotExpired(base.expiresAt);
  }

  const analysisObj = analyzeTranscriptStub(transcript);
  const aiAnalysis = JSON.stringify(analysisObj);

  const row = await transcriptionRepo.insert({
    sessionId,
    transcriptText: transcript,
    segmentsJson: segments != null ? JSON.stringify(segments) : null,
    metaJson: JSON.stringify(meta && typeof meta === 'object' ? meta : {}),
    aiAnalysisJson: aiAnalysis,
  });

  await sessionRepo.updateStatus(sessionId, 'completed');
  const overall = analysisObj.overallScore ?? analysisObj.suggestedScore;
  if (overall != null && Number.isFinite(Number(overall))) {
    await sessionRepo.updateOverallScore(sessionId, Math.round(Number(overall)));
  }

  return {
    id: row.id,
    sessionId: row.session_id,
    createdAt: row.created_at,
    analysis: analysisObj,
    rawAnalysis: row.ai_analysis,
  };
}
