import { query } from '../../config/database.js';
import type { UserRole } from '../../shared/user-role.js';

export interface UserRow {
  id: string;
  email: string;
  name: string | null;
  role: UserRole | null;
  industry_preference: string | null;
  created_at: Date;
}

export async function findById(id: string): Promise<UserRow | null> {
  const { rows } = await query<UserRow>(
    `SELECT id, email, name, role, industry_preference, created_at FROM users WHERE id = $1::uuid`,
    [id]
  );
  return rows[0] ?? null;
}

export async function findByEmail(email: string): Promise<UserRow | null> {
  const { rows } = await query<UserRow>(
    `SELECT id, email, name, role, industry_preference, created_at FROM users WHERE email = $1`,
    [email.toLowerCase().trim()]
  );
  return rows[0] ?? null;
}

export async function upsertByEmail(params: { email: string; name?: string }): Promise<UserRow> {
  const { rows } = await query<UserRow>(
    `INSERT INTO users (email, name)
     VALUES ($1, $2)
     ON CONFLICT (email) DO UPDATE SET name = COALESCE(EXCLUDED.name, users.name)
     RETURNING id, email, name, role, industry_preference, created_at`,
    [params.email.toLowerCase().trim(), params.name?.trim() || null]
  );
  return rows[0] as UserRow;
}

export async function updateProfile(
  id: string,
  fields: { name?: string | null; role?: UserRole | null; industryPreference?: string | null }
): Promise<UserRow | null> {
  const { rows } = await query<UserRow>(
    `UPDATE users SET
       name = COALESCE($2, name),
       role = COALESCE($3, role),
       industry_preference = COALESCE($4, industry_preference)
     WHERE id = $1::uuid
     RETURNING id, email, name, role, industry_preference, created_at`,
    [id, fields.name ?? null, fields.role ?? null, fields.industryPreference ?? null]
  );
  return rows[0] ?? null;
}

export async function setRole(id: string, role: UserRole): Promise<UserRow | null> {
  const { rows } = await query<UserRow>(
    `UPDATE users
     SET role = $2
     WHERE id = $1::uuid
     RETURNING id, email, name, role, industry_preference, created_at`,
    [id, role]
  );
  return rows[0] ?? null;
}
