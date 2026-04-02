import type { Request, Response } from 'express';

export function get(_req: Request, res: Response): void {
  res.json({ ok: true, service: 'kuantum-api' });
}
