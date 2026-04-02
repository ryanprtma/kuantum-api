import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import * as jobController from '../modules/job/job.controller.js';

const r = Router();

r.get('/api/jobs', asyncHandler(jobController.list));
r.post('/api/jobs', asyncHandler(jobController.create));
r.patch('/api/jobs/:id', asyncHandler(jobController.patch));
r.get('/api/jobs/:id', asyncHandler(jobController.getById));

export default r;
