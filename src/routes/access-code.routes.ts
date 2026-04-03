import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { requireUser } from '../middleware/require-user.js';
import { requireRecruiter } from '../middleware/require-recruiter.js';
import * as accessCodeController from '../modules/access-code/access-code.controller.js';

const r = Router();

// Recruiter/internal flow:
// POST /api/sessions/:sessionId/access-code -> returns { valid, name, id, sessionId }
r.post(
  '/api/sessions/:sessionId/access-code',
  requireUser,
  requireRecruiter,
  asyncHandler(accessCodeController.createForSession)
);

// Public validation: ?code=  (access code id atau session_code)
r.get('/api/access-codes/lookup', asyncHandler(accessCodeController.lookupQuery));

// GET /api/access-codes/:id -> { valid, name, id, sessionId }
r.get('/api/access-codes/:id', asyncHandler(accessCodeController.getByAccessCodeId));

export default r;

