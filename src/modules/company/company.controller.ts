import type { Request, Response } from 'express';
import * as companyService from './company.service.js';

export async function list(_req: Request, res: Response): Promise<void> {
  const rows = await companyService.listCompanies();
  res.json(rows);
}

export async function create(req: Request, res: Response): Promise<void> {
  const row = await companyService.createCompany(req.body || {});
  res.status(201).json(row);
}
