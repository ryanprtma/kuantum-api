import * as jobRepo from '../job/job.repository.js';
import * as sessionRepo from '../session/session.repository.js';
import * as userRepo from '../user/user.repository.js';

export async function getDashboard(userId: string | null | undefined) {
  const user = userId ? await userRepo.findById(userId) : null;
  const [jobsCount, sessionsTotal, statusRows, jobHighlights, invited, inProgress, completed, recent] =
    await Promise.all([
      jobRepo.countAll(),
      sessionRepo.countSessionsTotal(),
      sessionRepo.countSessionsByStatus(),
      jobRepo.jobStatsWithSessions(),
      sessionRepo.listPipelineSamples('invited', 5),
      sessionRepo.listPipelineSamples('in_progress', 5),
      sessionRepo.listPipelineSamples('completed', 5),
      sessionRepo.listRecentActivity(6),
    ]);

  const byStatus = Object.fromEntries(statusRows.map((r) => [r.status, r.n]));

  const stats = {
    jobs: jobsCount,
    sessionsTotal,
    invited: byStatus.invited ?? 0,
    inProgress: byStatus.in_progress ?? 0,
    completed: byStatus.completed ?? 0,
  };

  const pipeline = {
    invited: invited.map(mapPipelineCard),
    inProgress: inProgress.map(mapPipelineCard),
    completed: completed.map(mapPipelineCard),
  };

  const recentActivity = recent.map((r: Record<string, unknown>) => ({
    type: 'interview_completed',
    message: `${r.candidate_name || 'Candidate'} completed interview for ${r.job_title}`,
    at: r.at,
    candidateName: r.candidate_name,
  }));

  return {
    user: user ? { name: user.name, email: user.email, roleTitle: user.role_title } : null,
    greetingName: user?.name || 'there',
    stats,
    jobHighlights: jobHighlights.map((j) => ({
      id: j.id,
      title: j.title,
      department: j.department,
      priority: j.priority,
      candidateCount: j.candidate_count,
      avgScore: j.avg_score ? Math.round(j.avg_score * 10) / 10 : null,
    })),
    pipeline,
    recentActivity,
  };
}

function mapPipelineCard(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.candidate_name || 'Unknown',
    jobTitle: row.job_title,
    score: row.overall_score != null ? `${row.overall_score}%` : null,
  };
}
