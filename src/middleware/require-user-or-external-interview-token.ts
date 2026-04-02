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
 * Memungkinkan akses hanya via token internal untuk sistem eksternal.
 * Tidak memakai `X-User-Id` (supaya flow-nya "token saja, tanpa auth/user").
 */
export function requireUserOrExternalInterviewToken(req: Request, _res: Response, next: NextFunction): void {
  const expected = EXTERNAL_INTERVIEW_INTERNAL_TOKEN;
  const got = readInternalToken(req);
  if (expected && got && got === expected) {
    req.userId = null; // endpoint ini tidak benar-benar membutuhkan user
    next();
    return;
  }

  next(new AppError('Unauthorized', 401));
}

