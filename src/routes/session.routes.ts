import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { requireUser } from '../middleware/require-user.js';
import { requireRecruiter } from '../middleware/require-recruiter.js';
import * as sessionController from '../modules/session/session.controller.js';

const r = Router();

r.get('/api/sessions/:sessionId/results', asyncHandler(sessionController.getResults));
r.get('/api/sessions', asyncHandler(sessionController.list));
r.post('/api/sessions', requireUser, requireRecruiter, asyncHandler(sessionController.create));

export default r;
