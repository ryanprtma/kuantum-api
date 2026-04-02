import type { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { openApiDocument } from './document.js';

export function setupOpenApi(app: Express): void {
  app.get('/api/openapi.json', (_req, res) => {
    res.json(openApiDocument);
  });

  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument as Record<string, unknown>, {
      customSiteTitle: 'Kuantum API',
      customCss: '.swagger-ui .topbar { display: none }',
    })
  );
}
