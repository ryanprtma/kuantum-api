import type { Request, Response } from 'express';
import * as service from './job-applicant.service.js';

export async function create(req: Request, res: Response): Promise<void> {
  const payload = await service.createForApplicant(req.userId, req.body || {});
  res.status(201).json(payload);
}

export async function listMine(req: Request, res: Response): Promise<void> {
  const payload = await service.listMine(req.userId);
  res.json(payload);
}

export async function getMineActiveSession(req: Request, res: Response): Promise<void> {
  const payload = await service.getActiveSessionForMine(req.userId, req.params.applicationId);
  res.json(payload);
}

export async function getMineDetail(req: Request, res: Response): Promise<void> {
  const payload = await service.getMineDetail(req.userId, req.params.applicationId);
  res.json(payload);
}
