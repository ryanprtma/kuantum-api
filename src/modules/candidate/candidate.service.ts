import * as sessionRepo from '../session/session.repository.js';
import { mapSessionRowToInterviewItem } from '../interview/interview.mapper.js';

export async function listCandidatesForDashboard() {
  const rows = await sessionRepo.listForCandidates();
  return rows.map((r: Record<string, unknown>) => mapSessionRowToInterviewItem(r));
}
