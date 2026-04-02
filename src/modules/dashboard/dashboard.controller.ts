import type { Request, Response } from 'express';
import * as dashboardService from './dashboard.service.js';

export async function get(req: Request, res: Response): Promise<void> {
  const data = await dashboardService.getDashboard(req.userId);
  res.json(data);
}
