import { createApp } from './app.js';
import { pool } from './config/database.js';
import { PORT } from './config/env.js';

export async function startServer(): Promise<void> {
  await pool.query('SELECT 1');

  const app = createApp();
  app.listen(PORT, () => {
    console.log(`kuantum-api listening on http://localhost:${PORT}`);
  });
}
