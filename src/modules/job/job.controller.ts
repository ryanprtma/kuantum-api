import type { Request, Response } from 'express';
import type { JobPatch } from './job.repository.js';
import * as jobService from './job.service.js';

export async function list(_req: Request, res: Response): Promise<void> {
  const rows = await jobService.listJobs();
  res.json(rows);
}

export async function getById(req: Request, res: Response): Promise<void> {
  const job = await jobService.getJobById(req.params.id);
  res.json(job);
}

export async function create(req: Request, res: Response): Promise<void> {
  const row = await jobService.createJob(req.body || {});
  res.status(201).json(row);
}

export async function patch(req: Request, res: Response): Promise<void> {
  const row = await jobService.updateJob(req.params.id, (req.body || {}) as JobPatch);
  res.json(row);
}

export async function listApplications(req: Request, res: Response): Promise<void> {
  const rows = await jobService.listApplicationsForJob(req.params.jobId);
  res.json(rows);
}
