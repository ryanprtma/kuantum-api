import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../shared/errors.js';
import { EXTERNAL_INTERVIEW_INTERNAL_TOKEN } from '../config/env.js';
import * as accessCodeRepo from '../modules/access-code/access-code.repository.js';

function readInternalToken(req: Request): string | null {
  const a = req.headers['x-external-interview-internal-token'];
  const b = req.headers['x-interview-internal-token'];
  const c = req.headers['x-internal-token'];
  const raw = (a ?? b ?? c) as unknown;
  return typeof raw === 'string' && raw.trim() ? raw.trim() : null;
}

/**
 * Untuk endpoint yang dipakai external flow:
 * - Jika internal token valid, lewati (untuk recruiter/internal testing).
 * - Jika tidak, verifikasi `sessionId` path sebagai `access_codes.session_code`.
 */
export function requireAccessCodeOrInternalToken(req: Request, _res: Response, next: NextFunction): void {
  const expected = EXTERNAL_INTERVIEW_INTERNAL_TOKEN;
  const got = readInternalToken(req);
  if (expected && got && got === expected) {
    req.userId = null;
    next();
    return;
  }

  const sessionCode = req.params.sessionId;
  if (!sessionCode) {
    next(new AppError('Unauthorized', 401));
    return;
  }

  accessCodeRepo
    .findValidAccessForSessionRouteParam(sessionCode)
    .then((row) => {
      if (!row) {
        next(new AppError('Access code not valid or expired', 404));
        return;
      }
      next();
    })
    .catch((err) => next(err));
}

