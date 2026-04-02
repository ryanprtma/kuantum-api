import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import * as healthController from '../modules/health/health.controller.js';

const r = Router();

r.get('/health', asyncHandler(healthController.get));

export default r;
