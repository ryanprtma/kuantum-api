import { query } from '../../config/database.js';

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
}

export type AccessCodeRow = {
  id: string;
  session_code: string;
  session_id: string;
  token: string;
  name: string;
  valid: boolean;
  expires_at: string;
};

export async function findValidByAccessCodeId(accessCodeId: string): Promise<AccessCodeRow | null> {
  const { rows } = await query<AccessCodeRow>(
    `SELECT id, session_code, session_id::text AS session_id, token::text AS token, name, valid,
            expires_at::timestamptz::text AS expires_at
     FROM access_codes
     WHERE id = $1
       AND valid = true
       AND expires_at > now()`,
    [accessCodeId]
  );
  return rows[0] ?? null;
}

export async function findBySessionId(sessionId: string): Promise<AccessCodeRow | null> {
  const { rows } = await query<AccessCodeRow>(
    `SELECT id, session_code, session_id::text AS session_id, token::text AS token, name, valid,
            expires_at::timestamptz::text AS expires_at
     FROM access_codes
     WHERE session_id = $1
       AND valid = true
       AND expires_at > now()`,
    [sessionId]
  );
  return rows[0] ?? null;
}

export async function findValidBySessionCode(sessionCode: string): Promise<AccessCodeRow | null> {
  const { rows } = await query<AccessCodeRow>(
    `SELECT id, session_code, session_id::text AS session_id, token::text AS token, name, valid,
            expires_at::timestamptz::text AS expires_at
     FROM access_codes
     WHERE session_code = $1
       AND valid = true
       AND expires_at > now()`,
    [sessionCode]
  );
  return rows[0] ?? null;
}

/** Path param bisa `session_code` pendek atau `interview_sessions.id` (UUID). */
export async function findValidAccessForSessionRouteParam(param: string): Promise<AccessCodeRow | null> {
  const byCode = await findValidBySessionCode(param);
  if (byCode) return byCode;
  if (isUuid(param)) {
    return findBySessionId(param);
  }
  return null;
}

export async function insertAccessCode(params: {
  id: string;
  sessionCode: string;
  sessionId: string;
  token: string;
  name: string;
  expiresAt: string;
}): Promise<AccessCodeRow> {
  const { rows } = await query<AccessCodeRow>(
    `INSERT INTO access_codes (id, session_code, session_id, token, name, valid, expires_at)
     VALUES ($1, $2, $3::uuid, $4::uuid, $5, true, $6::timestamptz)
     ON CONFLICT (session_id) DO UPDATE
       SET id = EXCLUDED.id,
           session_code = EXCLUDED.session_code,
           token = EXCLUDED.token,
           name = EXCLUDED.name,
           valid = EXCLUDED.valid,
           expires_at = EXCLUDED.expires_at
     RETURNING id, session_code, session_id::text AS session_id, token::text AS token, name, valid,
               expires_at::timestamptz::text AS expires_at`,
    [params.id, params.sessionCode, params.sessionId, params.token, params.name, params.expiresAt]
  );
  return rows[0];
}

