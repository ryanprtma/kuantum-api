import * as userRepo from '../user/user.repository.js';
import { AppError } from '../../shared/errors.js';

export async function login(body: { email?: string; name?: string }) {
  const { email, name } = body;
  if (!email || typeof email !== 'string') {
    throw new AppError('email is required', 400);
  }
  const user = await userRepo.upsertByEmail({ email, name });
  return {
    token: user.id,
    user,
  };
}
