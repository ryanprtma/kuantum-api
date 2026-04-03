import { randomBytes } from "crypto";
import { AppError } from "../../shared/errors.js";
import * as sessionRepo from "../session/session.repository.js";
import * as accessCodeRepo from "./access-code.repository.js";

function randomFrom(chars: string, len: number): string {
  const bytes = randomBytes(len);
  const out: string[] = [];
  for (let i = 0; i < len; i++) {
    out.push(chars[bytes[i] % chars.length]);
  }
  return out.join("");
}

function generateAccessCodeId(): string {
  // Uppercase alnum without easily-confused chars (still simple, not crypto-strong for guessing).
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return randomFrom(chars, 11);
}

function generateSessionCode(): string {
  // Mixed-case alnum similar to example: 872hysvY62
  const chars =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return randomFrom(chars, 10);
}

export type AccessCodeResponse = {
  valid: boolean;
  name: string;
  id: string;
  sessionCode: string;
  sessionId: string;
};

export async function getOrCreateAccessCodeForSession(
  sessionId: string,
): Promise<AccessCodeResponse> {
  // If access code already exists for the session, reuse it.
  const existing = await accessCodeRepo.findBySessionId(sessionId);
  if (existing && existing.valid) {
    return {
      valid: true,
      name: existing.name,
      id: existing.id,
      sessionCode: existing.session_code,
      sessionId: existing.session_id,
    };
  }

  const sessionRow = await sessionRepo.findInstructionRowBySessionId(sessionId);
  if (!sessionRow) {
    throw new AppError("Session not found", 404);
  }

  // Syarat: valid selama 3 hari untuk akses external.
  const expiresAt = new Date(
    Date.now() + 3 * 24 * 60 * 60 * 1000,
  ).toISOString();
  const token = sessionRow.token ? String(sessionRow.token) : "";
  const name = sessionRow.candidate_name
    ? String(sessionRow.candidate_name)
    : "Candidate";

  if (!token) {
    throw new AppError("Session token missing", 500);
  }

  // Retry a few times in case of rare unique collisions.
  for (let i = 0; i < 5; i++) {
    const id = generateAccessCodeId();
    const sessionCode = generateSessionCode();
    try {
      const created = await accessCodeRepo.insertAccessCode({
        id,
        sessionCode,
        sessionId,
        token,
        name,
        expiresAt,
      });
      return {
        valid: true,
        name: created.name,
        id: created.id,
        sessionCode: created.session_code,
        sessionId: created.session_id,
      };
    } catch (err: unknown) {
      // Unique collision => retry.
      const anyErr = err as { code?: string };
      if (anyErr?.code === "23505") continue;
      throw err;
    }
  }

  throw new AppError("Failed to generate access code", 500);
}

export async function getAccessCodeById(
  accessCodeId: string,
): Promise<AccessCodeResponse> {
  const row = await accessCodeRepo.findValidByAccessCodeId(accessCodeId);
  if (!row) {
    throw new AppError("Access code not valid", 404);
  }
  return {
    valid: true,
    name: row.name,
    id: row.id,
    sessionCode: row.session_code,
    sessionId: row.session_id,
  };
}

/** Public lookup: access code id (table id) atau session_code pendek. */
export async function lookupAccessCodePublic(
  raw: string,
): Promise<AccessCodeResponse> {
  const code = String(raw || "").trim();
  if (!code) {
    throw new AppError("code query required", 400);
  }
  try {
    return await getAccessCodeById(code);
  } catch {
    /* try session_code */
  }
  const row = await accessCodeRepo.findValidBySessionCode(code);
  if (!row) {
    throw new AppError("Access code not valid", 404);
  }
  return {
    valid: true,
    name: row.name,
    id: row.id,
    sessionCode: row.session_code,
    sessionId: row.session_id,
  };
}
