import type { Request, Response } from 'express';
import * as companyService from '../company/company.service.js';

export async function post(_req: Request, res: Response): Promise<void> {
  const result = await companyService.ensureDemoCompany();
  const status = result.created ? 201 : 200;
  res.status(status).json(result);
}
