import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import * as interviewController from '../modules/interview/interview.controller.js';

const r = Router();

r.patch('/api/interviews/:applicationId', asyncHandler(interviewController.patchByApplication));
r.get('/api/interviews', asyncHandler(interviewController.list));

export default r;
