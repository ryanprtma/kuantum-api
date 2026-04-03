import type { Request, Response } from 'express';
import * as accessCodeService from './access-code.service.js';

export async function createForSession(req: Request, res: Response): Promise<void> {
  const sessionId = req.params.sessionId;
  const payload = await accessCodeService.getOrCreateAccessCodeForSession(sessionId);
  res.status(201).json(payload);
}

export async function getByAccessCodeId(req: Request, res: Response): Promise<void> {
  const id = req.params.id;
  const payload = await accessCodeService.getAccessCodeById(id);
  res.json(payload);
}

export async function lookupQuery(req: Request, res: Response): Promise<void> {
  const q = req.query.code;
  const raw = typeof q === "string" ? q : Array.isArray(q) ? q[0] : "";
  const code = typeof raw === "string" ? raw : "";
  const payload = await accessCodeService.lookupAccessCodePublic(code);
  res.json(payload);
}

