import * as sessionRepo from '../session/session.repository.js';
import { INTERVIEW_REDIRECT_BASE_URL } from '../../config/env.js';

const STATUS_MAP: Record<string, string> = {
  invited: 'Invited',
  in_progress: 'In Progress',
  completed: 'Completed',
};

export async function listCandidatesForDashboard() {
  const rows = await sessionRepo.listForCandidates();
  return rows.map((r: Record<string, unknown>) => {
    let score = '--';
    if (r.overall_score != null) {
      score = `${r.overall_score}%`;
    } else if (typeof r.last_analysis === 'string' && r.last_analysis) {
      try {
        const parsed = JSON.parse(r.last_analysis) as { suggestedScore?: number };
        if (parsed?.suggestedScore != null) score = `${parsed.suggestedScore}%`;
      } catch {
        score = '—';
      }
    }
    return {
      id: r.id,
      name: r.name || 'Unknown',
      email: r.email || '',
      job: r.job_title,
      score,
      status: STATUS_MAP[String(r.status)] || r.status,
      date: new Date(r.created_at as string).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      interviewUrl: `${INTERVIEW_REDIRECT_BASE_URL}/interview/${r.id}`,
      resultsUrl: `/results/${r.id}`,
    };
  });
}
