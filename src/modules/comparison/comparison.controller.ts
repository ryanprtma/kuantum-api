import type { Request, Response } from 'express';
import * as comparisonService from './comparison.service.js';

export async function get(req: Request, res: Response): Promise<void> {
  const jobId = typeof req.query.jobId === 'string' ? req.query.jobId : undefined;
  const data = await comparisonService.getComparison(jobId);
  res.json(data);
}
