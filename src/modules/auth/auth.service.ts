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

/**
 * Logout is client-driven (hapus X-User-Id di localStorage).
 * Endpoint ini idempotent dan tidak menyimpan sesi di server pada model auth saat ini.
 */
export async function logout(opts?: { userId?: string | null }) {
  void opts?.userId;
  return {
    ok: true as const,
    message: 'Logged out',
  };
}
