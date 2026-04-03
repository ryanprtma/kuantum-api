import { query } from '../../config/database.js';

export interface JobInsertParams {
  companyId: string;
  title: string;
  department: string;
  employmentType: string;
  description: string;
  requirementsJson: string;
  evaluationWeightsJson: string;
  priority?: string;
}

export interface JobPatch {
  title?: string;
  department?: string;
  employmentType?: string;
  description?: string;
  priority?: string;
  requirements?: unknown[];
  evaluationWeights?: Record<string, unknown>;
  defaultAgentPersona?: string;
  defaultInterviewLengthMinutes?: number;
  defaultFocusAreas?: unknown[];
  defaultDynamicProbing?: boolean;
  defaultQuestions?: unknown[];
}

export async function countAll(): Promise<number> {
  const { rows } = await query<{ n: number }>(`SELECT COUNT(*)::int AS n FROM jobs`);
  return rows[0]?.n ?? 0;
}

export async function findAllWithCompany() {
  const { rows } = await query(
    `SELECT j.*, c.name AS company_name, c.industry AS company_industry
     FROM jobs j
     JOIN companies c ON c.id = j.company_id
     ORDER BY j.created_at DESC`
  );
  return rows;
}

export async function findByIdWithCompany(id: string) {
  const { rows } = await query(
    `SELECT j.*, c.name AS company_name, c.industry AS company_industry
     FROM jobs j
     JOIN companies c ON c.id = j.company_id
     WHERE j.id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function insert(params: JobInsertParams) {
  const { rows } = await query(
    `INSERT INTO jobs (
      company_id, title, department, employment_type, description, requirements, evaluation_weights, priority
    ) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, COALESCE($8, 'standard'))
    RETURNING *`,
    [
      params.companyId,
      params.title,
      params.department,
      params.employmentType,
      params.description,
      params.requirementsJson,
      params.evaluationWeightsJson,
      params.priority,
    ]
  );
  return rows[0];
}

export async function updateById(id: string, p: JobPatch) {
  const sets: string[] = [];
  const vals: unknown[] = [];
  let n = 1;
  const add = (col: string, val: unknown) => {
    sets.push(`${col} = $${n}`);
    vals.push(val);
    n += 1;
  };

  if (p.title !== undefined) add('title', p.title);
  if (p.department !== undefined) add('department', p.department);
  if (p.employmentType !== undefined) add('employment_type', p.employmentType);
  if (p.description !== undefined) add('description', p.description);
  if (p.priority !== undefined) add('priority', p.priority);
  if (p.requirements !== undefined) {
    sets.push(`requirements = $${n}::jsonb`);
    vals.push(JSON.stringify(p.requirements));
    n += 1;
  }
  if (p.evaluationWeights !== undefined) {
    sets.push(`evaluation_weights = $${n}::jsonb`);
    vals.push(JSON.stringify(p.evaluationWeights));
    n += 1;
  }
  if (p.defaultAgentPersona !== undefined) add('default_agent_persona', p.defaultAgentPersona);
  if (p.defaultInterviewLengthMinutes !== undefined) {
    add('default_interview_length_minutes', p.defaultInterviewLengthMinutes);
  }
  if (p.defaultFocusAreas !== undefined) {
    sets.push(`default_focus_areas = $${n}::jsonb`);
    vals.push(JSON.stringify(p.defaultFocusAreas));
    n += 1;
  }
  if (p.defaultDynamicProbing !== undefined) add('default_dynamic_probing', p.defaultDynamicProbing);
  if (p.defaultQuestions !== undefined) {
    sets.push(`default_questions = $${n}::jsonb`);
    vals.push(JSON.stringify(p.defaultQuestions));
    n += 1;
  }

  if (sets.length === 0) {
    return findByIdWithCompany(id);
  }
  sets.push('updated_at = now()');
  vals.push(id);
  const sql = `UPDATE jobs SET ${sets.join(', ')} WHERE id = $${n}::uuid RETURNING *`;
  const { rows } = await query(sql, vals);
  return rows[0] ?? null;
}

export async function jobStatsWithSessions() {
  const { rows } = await query<{
    id: string;
    title: string;
    department: string;
    priority: string;
    candidate_count: number;
    avg_score: number;
  }>(
    `SELECT j.id, j.title, j.department, j.priority,
            COUNT(s.id)::int AS candidate_count,
            COALESCE(AVG(s.overall_score) FILTER (WHERE s.overall_score IS NOT NULL), 0)::float AS avg_score
     FROM jobs j
     LEFT JOIN job_applicants a ON a.job_id = j.id
     LEFT JOIN interview_sessions s ON s.job_applicant_id = a.id
     GROUP BY j.id
     ORDER BY candidate_count DESC, j.created_at DESC
     LIMIT 6`
  );
  return rows;
}
