import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors.js';

function isPgInvalidText(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'code' in err && (err as { code: string }).code === '22P02';
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message, code: err.code });
    return;
  }
  if (isPgInvalidText(err)) {
    res.status(400).json({ error: 'Invalid token or id format' });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
}
