import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import * as candidateController from '../modules/candidate/candidate.controller.js';

const r = Router();

r.get('/api/candidates', asyncHandler(candidateController.list));

export default r;
