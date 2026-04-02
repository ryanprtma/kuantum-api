import pg from 'pg';
import dotenv from 'dotenv';
import type { QueryResult, QueryResultRow } from 'pg';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
});

export async function query<R extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<R>> {
  return pool.query<R>(text, params);
}
