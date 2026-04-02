export interface AnalysisRecord {
  summary?: string;
  overallScore?: number;
  suggestedScore?: number;
  sentiment?: string;
  topics?: string[];
  competencies?: {
    technicalDepth?: number;
    systemDesign?: number;
    problemSolving?: number;
    communication?: number;
    teamFit?: number;
    leadership?: number;
    technology?: number;
  };
  cultureLabel?: string;
  cultureFit?: number;
  technical?: number;
  communication?: number;
  problemSolving?: number;
  keyMoments?: Array<{
    quote?: string;
    timestamp?: string;
    topic?: string;
    signal?: string;
  }>;
  growthPrediction?: string;
  redFlags?: string;
  interviewerNotes?: Record<string, number>;
}
