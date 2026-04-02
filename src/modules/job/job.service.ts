import * as jobRepo from './job.repository.js';
import type { JobPatch } from './job.repository.js';
import { AppError } from '../../shared/errors.js';

export async function listJobs() {
  return jobRepo.findAllWithCompany();
}

export async function getJobById(id: string) {
  const job = await jobRepo.findByIdWithCompany(id);
  if (!job) {
    throw new AppError('Job not found', 404);
  }
  return job;
}

export async function createJob(body: Record<string, unknown>) {
  const {
    companyId,
    title,
    department,
    employmentType,
    description,
    requirements,
    evaluationWeights,
    priority,
  } = body;
  if (typeof companyId !== 'string' || !title || typeof title !== 'string') {
    throw new AppError('companyId and title are required', 400);
  }
  return jobRepo.insert({
    companyId,
    title: title.trim(),
    department: (department || '').toString(),
    employmentType: (employmentType || 'full-time').toString(),
    description: (description || '').toString(),
    requirementsJson: JSON.stringify(Array.isArray(requirements) ? requirements : []),
    evaluationWeightsJson: JSON.stringify(
      evaluationWeights && typeof evaluationWeights === 'object' ? evaluationWeights : {}
    ),
    priority: (priority as string) || 'standard',
  });
}

export async function updateJob(id: string, body: JobPatch) {
  await getJobById(id);
  await jobRepo.updateById(id, body || {});
  return jobRepo.findByIdWithCompany(id);
}
