import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { requireAccessCodeOrInternalToken } from '../middleware/require-access-code-or-internal-token.js';
import { requireUserOrExternalInterviewToken } from '../middleware/require-user-or-external-interview-token.js';
import * as agentController from '../modules/agent/agent.controller.js';

const r = Router();

r.get('/api/agent/instructions/:token', asyncHandler(agentController.getInstructions));
r.get(
  '/api/agent/instruction-set/:sessionId',
  requireAccessCodeOrInternalToken,
  asyncHandler(agentController.getInstructionSetBySession)
);
r.get(
  '/api/agent/candidate/:candidateId/redirect',
  requireUserOrExternalInterviewToken,
  asyncHandler(agentController.redirectToInterviewAgent)
);
r.get('/api/agent/transcriptions/:token', asyncHandler(agentController.getTranscriptions));
r.post('/api/agent/transcriptions', asyncHandler(agentController.postTranscription));

export default r;
