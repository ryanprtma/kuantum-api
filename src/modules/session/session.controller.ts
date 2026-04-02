import type { Request, Response } from 'express';
import * as sessionService from './session.service.js';
import * as sessionResultsService from './session-results.service.js';

export async function create(req: Request, res: Response): Promise<void> {
  const payload = await sessionService.createSession(req.body || {});
  res.status(201).json(payload);
}

export async function list(_req: Request, res: Response): Promise<void> {
  const rows = await sessionService.listSessions();
  res.json(rows);
}

export async function getResults(req: Request, res: Response): Promise<void> {
  const payload = await sessionResultsService.getSessionResults(req.params.sessionId);
  res.json(payload);
}
