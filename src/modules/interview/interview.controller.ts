import type { Request, Response } from 'express';
import * as interviewService from './interview.service.js';

export async function list(req: Request, res: Response): Promise<void> {
  const raw = String(req.query.status || '').toLowerCase();
  const filter = raw === 'completed' ? 'completed' : 'all';
  const payload = await interviewService.listInterviewsPaged(filter, req.query.page, req.query.pageSize);
  res.json(payload);
}
