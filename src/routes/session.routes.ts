import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import * as sessionController from '../modules/session/session.controller.js';

const r = Router();

r.get('/api/sessions/:sessionId/results', asyncHandler(sessionController.getResults));
r.get('/api/sessions', asyncHandler(sessionController.list));
r.post('/api/sessions', asyncHandler(sessionController.create));

export default r;
