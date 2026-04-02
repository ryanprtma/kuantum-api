import type { AnalysisRecord } from '../../types/analysis.js';

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function analyzeTranscriptStub(text: string): AnalysisRecord {
  const len = text.length;
  const preview = text.slice(0, 400).replace(/\s+/g, ' ').trim();
  const h = hashString(text || 'x');

  const overallScore = 65 + (h % 30);
  const pick = (base: number, spread: number) => base + (h % spread);

  const competencies = {
    technicalDepth: pick(75, 20),
    systemDesign: pick(70, 25),
    problemSolving: pick(78, 18),
    communication: pick(72, 20),
    teamFit: pick(68, 22),
    leadership: pick(76, 19),
  };

  const cultureLabels = ['Strong', 'Exceptional', 'Moderate', 'Stable'];
  const cultureLabel = cultureLabels[h % cultureLabels.length];

  return {
    summary: `Automated screening note (${len} chars). Candidate discussed: ${preview || '(empty transcript)'}`,
    overallScore,
    suggestedScore: overallScore,
    sentiment: 'neutral',
    topics: ['technical', 'communication'],
    competencies,
    cultureLabel,
    cultureFit: pick(80, 15),
    technical: competencies.technicalDepth / 10,
    communication: competencies.communication / 10,
    problemSolving: competencies.problemSolving / 10,
    keyMoments: [
      {
        quote:
          preview.length > 20
            ? `"${preview.slice(0, 180)}${preview.length > 180 ? '…' : ''}"`
            : '"Candidate provided limited detail in this sample."',
        timestamp: '12:45',
        topic: 'Operational excellence',
        signal: 'High value signal',
      },
    ],
    growthPrediction:
      'Shows trajectory towards expanded ownership based on examples and clarity of communication.',
    redFlags: 'None detected in this automated pass. Review full transcript for edge cases.',
    interviewerNotes: {
      confidence: 4 + (h % 2),
      clarity: 4,
      humility: 5,
    },
  };
}
