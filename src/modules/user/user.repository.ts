import { query } from '../../config/database.js';

export interface UserRow {
  id: string;
  email: string;
  name: string | null;
  role_title: string | null;
  industry_preference: string | null;
  created_at: Date;
}

export async function findById(id: string): Promise<UserRow | null> {
  const { rows } = await query<UserRow>(
    `SELECT id, email, name, role_title, industry_preference, created_at FROM users WHERE id = $1::uuid`,
    [id]
  );
  return rows[0] ?? null;
}

export async function findByEmail(email: string): Promise<UserRow | null> {
  const { rows } = await query<UserRow>(
    `SELECT id, email, name, role_title, industry_preference, created_at FROM users WHERE email = $1`,
    [email.toLowerCase().trim()]
  );
  return rows[0] ?? null;
}

export async function upsertByEmail(params: { email: string; name?: string }): Promise<UserRow> {
  const { rows } = await query<UserRow>(
    `INSERT INTO users (email, name)
     VALUES ($1, $2)
     ON CONFLICT (email) DO UPDATE SET name = COALESCE(EXCLUDED.name, users.name)
     RETURNING id, email, name, role_title, industry_preference, created_at`,
    [params.email.toLowerCase().trim(), params.name?.trim() || null]
  );
  return rows[0] as UserRow;
}

export async function updateProfile(
  id: string,
  fields: { name?: string | null; roleTitle?: string | null; industryPreference?: string | null }
): Promise<UserRow | null> {
  const { rows } = await query<UserRow>(
    `UPDATE users SET
       name = COALESCE($2, name),
       role_title = COALESCE($3, role_title),
       industry_preference = COALESCE($4, industry_preference)
     WHERE id = $1::uuid
     RETURNING id, email, name, role_title, industry_preference, created_at`,
    [id, fields.name ?? null, fields.roleTitle ?? null, fields.industryPreference ?? null]
  );
  return rows[0] ?? null;
}
