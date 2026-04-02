import * as userRepo from './user.repository.js';
import { AppError } from '../../shared/errors.js';

export async function getUserById(id: string | null | undefined) {
  if (!id) return null;
  return userRepo.findById(id);
}

export async function updateProfile(
  userId: string | null | undefined,
  body: { name?: string; roleTitle?: string; industryPreference?: string }
) {
  if (!userId) {
    throw new AppError('Unauthorized', 401);
  }
  const { name, roleTitle, industryPreference } = body || {};
  const row = await userRepo.updateProfile(userId, {
    name,
    roleTitle,
    industryPreference,
  });
  if (!row) {
    throw new AppError('User not found', 404);
  }
  return row;
}
