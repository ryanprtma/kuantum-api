import { query } from "../../config/database.js";
import { AppError } from "../../shared/errors.js";

export async function insertOrGetApplication(params: {
  jobId: string;
  userId: string;
}): Promise<{ id: string }> {
  const insert = await query<{ id: string }>(
    `INSERT INTO job_applicants (job_id, user_id)
     VALUES ($1::uuid, $2::uuid)
     ON CONFLICT (job_id, user_id) DO NOTHING
     RETURNING id::text AS id`,
    [params.jobId, params.userId],
  );
  if (insert.rows[0]) {
    return { id: insert.rows[0].id };
  }
  const sel = await query<{ id: string }>(
    `SELECT id::text AS id FROM job_applicants
     WHERE job_id = $1::uuid AND user_id = $2::uuid`,
    [params.jobId, params.userId],
  );
  const id = sel.rows[0]?.id;
  if (!id) {
    throw new AppError("Could not resolve application", 500);
  }
  return { id };
}

export async function listByJobId(jobId: string) {
  const { rows } = await query(
    `SELECT a.id::text AS id, a.user_id::text AS user_id, u.email, u.name,
            s.id::text AS session_id
     FROM job_applicants a
     JOIN users u ON u.id = a.user_id
     LEFT JOIN interview_sessions s ON s.job_applicant_id = a.id
     WHERE a.job_id = $1::uuid
     ORDER BY a.created_at DESC`,
    [jobId],
  );
  return rows as Record<string, unknown>[];
}

export async function findById(id: string) {
  const { rows } = await query(
    `SELECT a.id::text AS id, a.job_id::text AS job_id, a.user_id::text AS user_id, a.created_at::text AS created_at,
            j.title AS job_title, j.department, j.employment_type,
            s.status, s.expires_at::text AS expires_at,
            u.name AS candidate_name, u.email AS candidate_email
     FROM job_applicants a
     JOIN jobs j ON j.id = a.job_id
     JOIN users u ON u.id = a.user_id
     LEFT JOIN interview_sessions s ON s.job_applicant_id = a.id
     WHERE a.id = $1::uuid`,
    [id],
  );
  return (rows[0] as Record<string, unknown>) ?? null;
}

export async function findByIdAndUser(id: string, userId: string) {
  const { rows } = await query(
    `SELECT a.id::text AS id, a.job_id::text AS job_id, a.user_id::text AS user_id, a.created_at::text AS created_at,
            j.title AS job_title, j.department, j.employment_type,
            s.id::text AS session_id, s.status, s.expires_at::text AS expires_at,
            u.name AS candidate_name, u.email AS candidate_email
     FROM job_applicants a
     JOIN jobs j ON j.id = a.job_id
     JOIN users u ON u.id = a.user_id
     LEFT JOIN interview_sessions s ON s.job_applicant_id = a.id
     WHERE a.id = $1::uuid AND a.user_id = $2::uuid`,
    [id, userId],
  );
  return (rows[0] as Record<string, unknown>) ?? null;
}

export async function listByUser(userId: string) {
  const { rows } = await query(
    `SELECT a.id::text AS id, a.job_id::text AS job_id, a.user_id::text AS user_id, a.created_at::text AS created_at,
            j.title AS job_title, j.department, j.employment_type,
            c.name AS company_name,
            s.status, s.id::text AS session_id, s.expires_at::text AS expires_at
     FROM job_applicants a
     JOIN jobs j ON j.id = a.job_id
     JOIN companies c ON c.id = j.company_id
     LEFT JOIN interview_sessions s ON s.job_applicant_id = a.id
     WHERE a.user_id = $1::uuid
     ORDER BY a.created_at DESC`,
    [userId],
  );
  return rows as Record<string, unknown>[];
}

export async function findSessionIdByApplicationId(
  applicationId: string,
): Promise<string | null> {
  const { rows } = await query<{ id: string }>(
    `SELECT id::text AS id FROM interview_sessions WHERE job_applicant_id = $1::uuid`,
    [applicationId],
  );
  return rows[0]?.id ?? null;
}

export async function findApplicationIdBySessionId(
  sessionId: string,
): Promise<string | null> {
  const { rows } = await query<{ id: string }>(
    `SELECT job_applicant_id::text AS id FROM interview_sessions WHERE id = $1::uuid`,
    [sessionId],
  );
  return rows[0]?.id ?? null;
}
