import * as companyRepo from './company.repository.js';
import { AppError } from '../../shared/errors.js';

export async function listCompanies() {
  return companyRepo.findAll();
}

export async function createCompany(body: { name?: string; industry?: string }) {
  const { name, industry } = body;
  if (!name || typeof name !== 'string') {
    throw new AppError('name is required', 400);
  }
  return companyRepo.insert({
    name,
    industry: (industry || 'Technology').toString(),
  });
}

export async function ensureDemoCompany() {
  const existingId = await companyRepo.findFirstId();
  if (existingId) {
    return { companyId: existingId, created: false };
  }
  const row = await companyRepo.insert({ name: 'Kuantum Labs', industry: 'Technology' });
  return { companyId: (row as { id: string }).id, created: true };
}
