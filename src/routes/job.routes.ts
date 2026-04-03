import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { requireUser } from '../middleware/require-user.js';
import { requireRecruiter } from '../middleware/require-recruiter.js';
import * as jobController from '../modules/job/job.controller.js';

const r = Router();

r.get('/api/jobs', asyncHandler(jobController.list));
r.post('/api/jobs', requireUser, requireRecruiter, asyncHandler(jobController.create));
r.patch('/api/jobs/:id', requireUser, requireRecruiter, asyncHandler(jobController.patch));
r.get('/api/jobs/:jobId/applications', requireUser, requireRecruiter, asyncHandler(jobController.listApplications));
r.get('/api/jobs/:id', asyncHandler(jobController.getById));

export default r;
