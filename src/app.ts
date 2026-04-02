import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { errorHandler } from './middleware/error-handler.js';
import { optionalUser } from './middleware/require-user.js';
import { setupOpenApi } from './openapi/setup.js';

export function createApp() {
  const app = express();
  app.use(cors({ origin: true }));
  app.use(express.json({ limit: '2mb' }));
  setupOpenApi(app);
  app.use(optionalUser);
  app.use(routes);
  app.use(errorHandler);
  return app;
}
