import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { requireExternalInternalToken } from '../middleware/require-external-internal-token.js';
import * as interviewController from '../modules/interview/interview.controller.js';

const r = Router();

r.patch(
  '/api/interviews/:applicationId',
  requireExternalInternalToken,
  asyncHandler(interviewController.patchByApplication)
);
r.get('/api/interviews', asyncHandler(interviewController.list));

export default r;
