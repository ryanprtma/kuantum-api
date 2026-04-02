import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import * as authController from '../modules/auth/auth.controller.js';

const r = Router();

r.post('/api/auth/login', asyncHandler(authController.login));

export default r;
