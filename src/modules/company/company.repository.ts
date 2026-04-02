import { query } from '../../config/database.js';

export async function findAll() {
  const { rows } = await query('SELECT * FROM companies ORDER BY created_at DESC');
  return rows;
}

export async function findFirstId(): Promise<string | null> {
  const { rows } = await query<{ id: string }>('SELECT id FROM companies LIMIT 1');
  return rows[0]?.id ?? null;
}

export async function insert(params: { name: string; industry: string }) {
  const { rows } = await query(
    `INSERT INTO companies (name, industry) VALUES ($1, $2) RETURNING *`,
    [params.name.trim(), params.industry]
  );
  return rows[0];
}
