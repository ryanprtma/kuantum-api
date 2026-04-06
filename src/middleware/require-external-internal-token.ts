import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../shared/errors.js';
import { EXTERNAL_INTERVIEW_INTERNAL_TOKEN } from '../config/env.js';

function readInternalToken(req: Request): string | null {
  const a = req.headers['x-external-interview-internal-token'];
  const b = req.headers['x-interview-internal-token'];
  const c = req.headers['x-internal-token'];
  const raw = (a ?? b ?? c) as unknown;
  return typeof raw === 'string' && raw.trim() ? raw.trim() : null;
}

/**
 * Hanya untuk integrasi eksternal: wajib header token yang sama dengan env `EXTERNAL_INTERVIEW_INTERNAL_TOKEN`.
 */
export function requireExternalInternalToken(req: Request, _res: Response, next: NextFunction): void {
  const expected = EXTERNAL_INTERVIEW_INTERNAL_TOKEN;
  if (!expected) {
    next(new AppError('EXTERNAL_INTERVIEW_INTERNAL_TOKEN is not configured', 503));
    return;
  }
  const got = readInternalToken(req);
  if (!got || got !== expected) {
    next(new AppError('Unauthorized', 401));
    return;
  }
  next();
}
