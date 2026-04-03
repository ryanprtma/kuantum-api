import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../shared/errors.js';
import * as userRepo from '../modules/user/user.repository.js';

/**
 * Harus dipasang setelah `requireUser`.
 * Memastikan akun memiliki role `recruiter` (alur HR).
 */
export function requireRecruiter(req: Request, _res: Response, next: NextFunction): void {
  const userId = req.userId;
  if (!userId) {
    next(new AppError('Unauthorized', 401));
    return;
  }
  userRepo
    .findById(userId)
    .then((user) => {
      if (!user) {
        next(new AppError('User not found', 404));
        return;
      }
      if (user.role !== 'recruiter') {
        next(new AppError('Recruiter role required', 403));
        return;
      }
      next();
    })
    .catch(next);
}
