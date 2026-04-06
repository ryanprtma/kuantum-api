import type { Request, Response } from 'express';
import * as authService from './auth.service.js';

export async function login(req: Request, res: Response): Promise<void> {
  const payload = await authService.login(req.body || {});
  res.json(payload);
}

export async function logout(req: Request, res: Response): Promise<void> {
  const userId = req.header('x-user-id')?.trim() || null;
  const payload = await authService.logout({ userId });
  res.json(payload);
}
