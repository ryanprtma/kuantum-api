import { startServer } from './server.js';

startServer().catch((err: Error) => {
  console.error('Database connection failed. Check DATABASE_URL and run npm run db:migrate');
  console.error(err.message);
  process.exit(1);
});
