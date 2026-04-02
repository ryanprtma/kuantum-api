import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import * as companyController from '../modules/company/company.controller.js';

const r = Router();

r.get('/api/companies', asyncHandler(companyController.list));
r.post('/api/companies', asyncHandler(companyController.create));

export default r;
