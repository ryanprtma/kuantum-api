import { readFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { pool } from './config/database.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootSql = join(__dirname, '..', 'sql');

async function migrate(): Promise<void> {
  const schemaPath = join(rootSql, 'schema.sql');
  await pool.query(readFileSync(schemaPath, 'utf8'));

  const migrationsDir = join(rootSql, 'migrations');
  try {
    const files = readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();
    for (const f of files) {
      await pool.query(readFileSync(join(migrationsDir, f), 'utf8'));
      console.log(`Applied migration: ${f}`);
    }
  } catch {
    // migrations folder optional
  }

  console.log('Migration OK');
  await pool.end();
}

migrate().catch((err: Error) => {
  console.error(err);
  process.exit(1);
});
