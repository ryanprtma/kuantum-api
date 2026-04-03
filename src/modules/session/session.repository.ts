import { query } from '../../config/database.js';

export async function findJobApplicantContext(jobApplicantId: string): Promise<Record<string, unknown> | null> {
  const { rows } = await query(
    `SELECT j.*, c.name AS company_name,
            u.name AS user_name, u.email AS user_email,
            a.id::text AS application_id
     FROM job_applicants a
     JOIN jobs j ON j.id = a.job_id
     JOIN companies c ON c.id = j.company_id
     JOIN users u ON u.id = a.user_id
     WHERE a.id = $1::uuid`,
    [jobApplicantId]
  );
  return (rows[0] as Record<string, unknown>) ?? null;
}

export async function findSessionIdByJobApplicantId(jobApplicantId: string): Promise<string | null> {
  const { rows } = await query<{ id: string }>(
    `SELECT id::text AS id FROM interview_sessions WHERE job_applicant_id = $1::uuid`,
    [jobApplicantId]
  );
  return rows[0]?.id ?? null;
}

export async function insertSession(params: {
  jobApplicantId: string;
  candidateId: string;
  interviewId: string;
  token: string;
  agentInstruction: string;
  agentPersona: string;
  interviewLengthMinutes: number;
  focusAreasJson: string;
  dynamicProbing: boolean;
  questionsJson: string;
}) {
  const { rows } = await query(
    `INSERT INTO interview_sessions (
      job_applicant_id, candidate_id, interview_id, token,
      agent_instruction, agent_persona, interview_length_minutes,
      focus_areas, dynamic_probing, questions, status
    ) VALUES (
      $1::uuid, $2::uuid, $3::uuid, $4::uuid,
      $5, $6, $7, $8::jsonb, $9, $10::jsonb, 'invited'
    ) RETURNING *`,
    [
      params.jobApplicantId,
      params.candidateId,
      params.interviewId,
      params.token,
      params.agentInstruction,
      params.agentPersona,
      params.interviewLengthMinutes,
      params.focusAreasJson,
      params.dynamicProbing,
      params.questionsJson,
    ]
  );
  return rows[0];
}

export async function listWithJobAndCompany() {
  const { rows } = await query(
    `SELECT s.*, j.title AS job_title, c.name AS company_name
     FROM interview_sessions s
     JOIN job_applicants a ON a.id = s.job_applicant_id
     JOIN jobs j ON j.id = a.job_id
     JOIN companies c ON c.id = j.company_id
     ORDER BY s.created_at DESC`
  );
  return rows;
}

const instructionRowSelect = `SELECT s.id AS session_id, s.token, s.agent_instruction, s.agent_persona,
            s.interview_length_minutes, s.focus_areas, s.dynamic_probing, s.questions,
            u.name AS candidate_name, u.email AS candidate_email, s.status, s.candidate_id, s.interview_id, s.expires_at,
            j.id AS job_id, j.title AS job_title, j.department, j.employment_type, j.description,
            j.requirements,
            c.id AS company_id, c.name AS company_name, c.industry AS company_industry
     FROM interview_sessions s
     JOIN job_applicants a ON a.id = s.job_applicant_id
     JOIN jobs j ON j.id = a.job_id
     JOIN companies c ON c.id = j.company_id
     JOIN users u ON u.id = a.user_id`;

export async function findInstructionRowByToken(token: string) {
  const { rows } = await query(
    `${instructionRowSelect} WHERE s.token = $1::uuid OR s.id = $1::uuid OR s.candidate_id = $1::uuid`,
    [token]
  );
  return rows[0] ?? null;
}

export async function findInstructionRowBySessionId(sessionId: string) {
  const { rows } = await query(`${instructionRowSelect} WHERE s.id = $1::uuid`, [sessionId]);
  return rows[0] ?? null;
}

export async function findIdByToken(token: string): Promise<string | null> {
  const { rows } = await query<{ id: string }>(
    `SELECT id FROM interview_sessions WHERE token = $1::uuid OR id = $1::uuid OR candidate_id = $1::uuid`,
    [token]
  );
  return rows[0]?.id ?? null;
}

export async function findCandidateIdBySessionId(sessionId: string): Promise<string | null> {
  const { rows } = await query<{ candidate_id: string }>(
    `SELECT candidate_id::text AS candidate_id FROM interview_sessions WHERE id = $1::uuid`,
    [sessionId]
  );
  return rows[0]?.candidate_id ?? null;
}

export async function findLinkIdentityBySessionId(
  sessionId: string
): Promise<{ candidate_id: string; expires_at: string } | null> {
  const { rows } = await query<{ candidate_id: string; expires_at: string }>(
    `SELECT candidate_id::text AS candidate_id, expires_at::text AS expires_at
     FROM interview_sessions
     WHERE id = $1::uuid`,
    [sessionId]
  );
  return rows[0] ?? null;
}

export async function findLinkIdentityByCandidateId(
  candidateId: string
): Promise<{ candidate_id: string; expires_at: string } | null> {
  const { rows } = await query<{ candidate_id: string; expires_at: string }>(
    `SELECT candidate_id::text AS candidate_id, expires_at::text AS expires_at
     FROM interview_sessions
     WHERE candidate_id = $1::uuid`,
    [candidateId]
  );
  return rows[0] ?? null;
}

export async function updateStatus(sessionId: string, status: string): Promise<void> {
  await query(`UPDATE interview_sessions SET status = $2 WHERE id = $1`, [sessionId, status]);
}

export async function updateOverallScore(sessionId: string, score: number): Promise<void> {
  await query(`UPDATE interview_sessions SET overall_score = $2 WHERE id = $1`, [sessionId, score]);
}

export async function findResultsDetailById(sessionId: string) {
  const { rows } = await query(
    `SELECT s.*, j.id AS resolved_job_id, j.title AS job_title, j.department, j.employment_type, j.description,
            c.name AS company_name, c.industry AS company_industry,
            u.name AS candidate_name, u.email AS candidate_email,
            (SELECT t.transcript_text FROM transcriptions t WHERE t.session_id = s.id ORDER BY t.created_at DESC LIMIT 1) AS latest_transcript,
            (SELECT t.ai_analysis FROM transcriptions t WHERE t.session_id = s.id ORDER BY t.created_at DESC LIMIT 1) AS latest_analysis
     FROM interview_sessions s
     JOIN job_applicants a ON a.id = s.job_applicant_id
     JOIN jobs j ON j.id = a.job_id
     JOIN companies c ON c.id = j.company_id
     JOIN users u ON u.id = a.user_id
     WHERE s.id = $1::uuid`,
    [sessionId]
  );
  return rows[0] ?? null;
}

export async function listPipelineSamples(status: string, limit = 5) {
  const { rows } = await query(
    `SELECT s.id, u.name AS candidate_name, s.status, j.title AS job_title, s.overall_score
     FROM interview_sessions s
     JOIN job_applicants a ON a.id = s.job_applicant_id
     JOIN jobs j ON j.id = a.job_id
     JOIN users u ON u.id = a.user_id
     WHERE s.status = $1
     ORDER BY s.created_at DESC
     LIMIT $2`,
    [status, limit]
  );
  return rows;
}

export async function listRecentActivity(limit = 6) {
  const { rows } = await query(
    `SELECT u.name AS candidate_name, j.title AS job_title, t.created_at AS at
     FROM transcriptions t
     JOIN interview_sessions s ON s.id = t.session_id
     JOIN job_applicants a ON a.id = s.job_applicant_id
     JOIN jobs j ON j.id = a.job_id
     JOIN users u ON u.id = a.user_id
     ORDER BY t.created_at DESC
     LIMIT $1`,
    [limit]
  );
  return rows;
}

export async function countSessionsByStatus() {
  const { rows } = await query<{ status: string; n: number }>(
    `SELECT status, COUNT(*)::int AS n FROM interview_sessions GROUP BY status`
  );
  return rows;
}

export async function countSessionsTotal(): Promise<number> {
  const { rows } = await query<{ n: number }>(`SELECT COUNT(*)::int AS n FROM interview_sessions`);
  return rows[0]?.n ?? 0;
}

export async function listCompletedForJob(jobId: string, limit = 12) {
  const { rows } = await query(
    `SELECT s.id, u.name AS candidate_name, s.status, s.overall_score, s.created_at,
            j.title AS job_title,
            (SELECT t.ai_analysis FROM transcriptions t WHERE t.session_id = s.id ORDER BY t.created_at DESC LIMIT 1) AS last_analysis
     FROM interview_sessions s
     JOIN job_applicants a ON a.id = s.job_applicant_id
     JOIN jobs j ON j.id = a.job_id
     JOIN users u ON u.id = a.user_id
     WHERE j.id = $1::uuid AND s.status = 'completed'
     ORDER BY s.overall_score DESC NULLS LAST, s.created_at DESC
     LIMIT $2`,
    [jobId, limit]
  );
  return rows;
}

export async function listForCandidates() {
  const { rows } = await query(
    `SELECT s.id, s.token, u.name, u.email,
            s.status, s.created_at, s.overall_score, s.candidate_id, s.interview_id, s.expires_at,
            j.title AS job_title,
            (SELECT t.ai_analysis FROM transcriptions t WHERE t.session_id = s.id ORDER BY t.created_at DESC LIMIT 1) AS last_analysis
     FROM interview_sessions s
     JOIN job_applicants a ON a.id = s.job_applicant_id
     JOIN jobs j ON j.id = a.job_id
     JOIN users u ON u.id = a.user_id
     ORDER BY s.created_at DESC`
  );
  return rows;
}
