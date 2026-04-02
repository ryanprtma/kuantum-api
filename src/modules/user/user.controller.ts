import type { Request, Response } from 'express';
import * as userService from './user.service.js';

export async function getMe(req: Request, res: Response): Promise<void> {
  const user = await userService.getUserById(req.userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json(user);
}

export async function patchMe(req: Request, res: Response): Promise<void> {
  const row = await userService.updateProfile(req.userId, req.body || {});
  res.json(row);
}
