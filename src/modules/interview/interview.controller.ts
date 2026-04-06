import type { Request, Response } from 'express';
import * as interviewService from './interview.service.js';

export async function list(req: Request, res: Response): Promise<void> {
  const raw = String(req.query.status || '').toLowerCase();
  const filter = raw === 'completed' ? 'completed' : 'all';
  const payload = await interviewService.listInterviewsPaged(filter, req.query.page, req.query.pageSize);
  res.json(payload);
}

/** `PATCH /api/interviews/:applicationId?status=completed` — UUID `job_applicants.id`. Wajib header token internal. */
export async function patchByApplication(req: Request, res: Response): Promise<void> {
  const payload = await interviewService.setLatestInterviewStatusByApplicationId(
    req.params.applicationId,
    req.query.status
  );
  res.json(payload);
}
