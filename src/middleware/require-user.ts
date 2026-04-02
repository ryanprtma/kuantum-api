import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors.js';

export function optionalUser(req: Request, _res: Response, next: NextFunction): void {
  const raw = req.headers['x-user-id'];
  req.userId = typeof raw === 'string' && raw.trim() ? raw.trim() : null;
  next();
}

export function requireUser(req: Request, _res: Response, next: NextFunction): void {
  const raw = req.headers['x-user-id'];
  if (!raw || typeof raw !== 'string' || !raw.trim()) {
    next(new AppError('Unauthorized', 401));
    return;
  }
  req.userId = raw.trim();
  next();
}
