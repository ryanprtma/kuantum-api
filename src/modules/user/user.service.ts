import * as userRepo from './user.repository.js';
import { AppError } from '../../shared/errors.js';
import { isUserRole, type UserRole } from '../../shared/user-role.js';

export async function getUserById(id: string | null | undefined) {
  if (!id) return null;
  return userRepo.findById(id);
}

export async function updateProfile(
  userId: string | null | undefined,
  body: { name?: string; role?: string; industryPreference?: string }
) {
  if (!userId) {
    throw new AppError('Unauthorized', 401);
  }
  const { name, role, industryPreference } = body || {};
  if (role !== undefined && role !== null && role !== '' && !isUserRole(role)) {
    throw new AppError('role must be recruiter or applicant', 400);
  }
  const row = await userRepo.updateProfile(userId, {
    name,
    role:
      role === undefined
        ? undefined
        : role === null || role === ''
          ? null
          : (role as UserRole),
    industryPreference,
  });
  if (!row) {
    throw new AppError('User not found', 404);
  }
  return row;
}
