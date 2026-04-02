import * as sessionRepo from './session.repository.js';
import { AppError } from '../../shared/errors.js';
import type { AnalysisRecord } from '../../types/analysis.js';

export async function getSessionResults(sessionId: string) {
  const row = await sessionRepo.findResultsDetailById(sessionId);
  if (!row) {
    throw new AppError('Session not found', 404);
  }
  const r = row as Record<string, unknown>;
  let analysis: AnalysisRecord | null = null;
  const latest = r.latest_analysis;
  if (typeof latest === 'string' && latest) {
    try {
      analysis = JSON.parse(latest) as AnalysisRecord;
    } catch {
      analysis = null;
    }
  }
  const competencies = analysis?.competencies
    ? [
        { label: 'Technical depth', val: analysis.competencies.technicalDepth ?? 0, status: 'scored' },
        { label: 'System Design', val: analysis.competencies.systemDesign ?? 0, status: 'scored' },
        { label: 'Problem Solving', val: analysis.competencies.problemSolving ?? 0, status: 'scored' },
        { label: 'Communication', val: analysis.competencies.communication ?? 0, status: 'scored' },
        { label: 'Team Fit', val: analysis.competencies.teamFit ?? 0, status: 'scored' },
        { label: 'Leadership', val: analysis.competencies.leadership ?? 0, status: 'scored' },
      ]
    : [];

  return {
    sessionId: r.id,
    status: r.status,
    overallScore: (r.overall_score as number | null) ?? analysis?.overallScore ?? null,
    candidate: {
      name: r.candidate_name,
      email: r.candidate_email,
    },
    job: {
      id: r.resolved_job_id,
      title: r.job_title,
      department: r.department,
      employmentType: r.employment_type,
      description: r.description,
    },
    company: {
      name: r.company_name,
      industry: r.company_industry,
    },
    interviewLengthMinutes: r.interview_length_minutes,
    transcript: r.latest_transcript,
    summary: analysis?.summary,
    analysis,
    competencies,
    keyMoments: analysis?.keyMoments || [],
    growthPrediction: analysis?.growthPrediction,
    redFlags: analysis?.redFlags,
    interviewerNotes: analysis?.interviewerNotes,
  };
}
