import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { requireUser } from '../middleware/require-user.js';
import * as userController from '../modules/user/user.controller.js';

const r = Router();

r.get('/api/users/me', requireUser, asyncHandler(userController.getMe));
r.patch('/api/users/me', requireUser, asyncHandler(userController.patchMe));

export default r;
