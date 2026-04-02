import { query } from '../../config/database.js';

export async function insert(params: {
  sessionId: string;
  transcriptText: string;
  segmentsJson: string | null;
  metaJson: string;
  aiAnalysisJson: string;
}) {
  const { rows } = await query(
    `INSERT INTO transcriptions (session_id, transcript_text, segments, meta, ai_analysis)
     VALUES ($1, $2, $3::jsonb, $4::jsonb, $5)
     RETURNING id, session_id, created_at, ai_analysis`,
    [params.sessionId, params.transcriptText, params.segmentsJson, params.metaJson, params.aiAnalysisJson]
  );
  return rows[0] as { id: string; session_id: string; created_at: Date; ai_analysis: string };
}

export async function findAllBySessionId(sessionId: string) {
  const { rows } = await query(
    `SELECT id, transcript_text, segments, meta, created_at
     FROM transcriptions WHERE session_id = $1 ORDER BY created_at ASC`,
    [sessionId]
  );
  return rows;
}
