import type { Request, Response } from 'express';
import * as candidateService from './candidate.service.js';

export async function list(_req: Request, res: Response): Promise<void> {
  const rows = await candidateService.listCandidatesForDashboard();
  res.json(rows);
}
