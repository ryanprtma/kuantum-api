import * as jobRepo from '../job/job.repository.js';
import * as sessionRepo from '../session/session.repository.js';
import { AppError } from '../../shared/errors.js';
import type { AnalysisRecord } from '../../types/analysis.js';

function mapRow(row: Record<string, unknown>) {
  let analysis: AnalysisRecord | null = null;
  if (typeof row.last_analysis === 'string' && row.last_analysis) {
    try {
      analysis = JSON.parse(row.last_analysis) as AnalysisRecord;
    } catch {
      analysis = null;
    }
  }
  const c = analysis?.competencies || {};
  const tech = (c.technicalDepth ?? (c as { technology?: number }).technology ?? 80) / 10;
  const solve = (c.problemSolving ?? 80) / 10;
  const comm = (c.communication ?? 80) / 10;
  const score =
    (row.overall_score as number | null) ?? analysis?.overallScore ?? analysis?.suggestedScore ?? 0;
  return {
    sessionId: row.id,
    name: row.candidate_name || 'Unknown',
    tech,
    solve,
    comm,
    culture: analysis?.cultureLabel || '—',
    score: Math.round(score as number),
    status: row.status === 'completed' ? 'Finalist' : 'Interviewed',
    initials: (String(row.candidate_name || '?')
      .split(/\s+/)
      .map((s) => s[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()),
    analysis,
  };
}

export async function getComparison(jobId: string | undefined) {
  if (!jobId) {
    throw new AppError('jobId query parameter is required', 400);
  }
  const job = await jobRepo.findByIdWithCompany(jobId);
  if (!job) {
    throw new AppError('Job not found', 404);
  }
  const rows = await sessionRepo.listCompletedForJob(jobId, 15);
  const mapped = rows.map((r) => mapRow(r as Record<string, unknown>));
  const sorted = [...mapped].sort((a, b) => b.score - a.score);
  const top = sorted[0];
  const maxFit = top ? `${top.score}%` : '—';
  const finalists = sorted.filter((r) => r.score > 0).length;
  const recommendation = top?.analysis?.summary
    ? `${top.name} — ${top.analysis.summary.slice(0, 120)}…`
    : top
      ? `${top.name} leads with ${top.score}% overall fit for this role.`
      : 'Complete interviews to see AI comparison.';

  const j = job as { title: string; id: string };
  return {
    jobTitle: j.title,
    jobId: j.id,
    finalists,
    maxFit,
    recommendation,
    rows: sorted,
  };
}
