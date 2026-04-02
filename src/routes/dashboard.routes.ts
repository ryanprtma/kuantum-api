import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import * as dashboardController from '../modules/dashboard/dashboard.controller.js';

const r = Router();

r.get('/api/dashboard', asyncHandler(dashboardController.get));

export default r;
