import type { Request, Response } from 'express';
import * as authService from './auth.service.js';

export async function login(req: Request, res: Response): Promise<void> {
  const payload = await authService.login(req.body || {});
  res.json(payload);
}
