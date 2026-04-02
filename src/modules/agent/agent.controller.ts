import type { Request, Response } from 'express';
import * as agentService from './agent.service.js';

export async function getInstructions(req: Request, res: Response): Promise<void> {
  const payload = await agentService.getInstructionsByToken(req.params.token);
  res.json(payload);
}

export async function getTranscriptions(req: Request, res: Response): Promise<void> {
  const payload = await agentService.getTranscriptionsForDisplay(req.params.token);
  res.json(payload);
}

export async function postTranscription(req: Request, res: Response): Promise<void> {
  const payload = await agentService.submitTranscription(req.body || {});
  res.status(201).json(payload);
}

/** By interview session id (candidate row / pipeline id). Requires X-User-Id. */
export async function getInstructionSetBySession(req: Request, res: Response): Promise<void> {
  const payload = await agentService.getInstructionSetBySessionId(req.params.sessionId);
  res.json(payload);
}

/** HTTP 302 ke halaman wawancara agent (`/interview/:candidateId`). Requires X-User-Id. */
export async function redirectToInterviewAgent(req: Request, res: Response): Promise<void> {
  const url = await agentService.getInterviewRedirectUrlForSession(req.params.candidateId);
  res.redirect(302, url);
}
