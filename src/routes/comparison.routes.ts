import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import * as comparisonController from '../modules/comparison/comparison.controller.js';

const r = Router();

r.get('/api/comparison', asyncHandler(comparisonController.get));

export default r;
