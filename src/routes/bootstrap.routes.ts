import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import * as bootstrapController from '../modules/bootstrap/bootstrap.controller.js';

const r = Router();

r.post('/api/bootstrap', asyncHandler(bootstrapController.post));

export default r;
