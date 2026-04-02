-- Kuantum hiring / voice agent schema

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT NOT NULL DEFAULT 'Technology',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT '',
  employment_type TEXT NOT NULL DEFAULT 'full-time',
  description TEXT NOT NULL DEFAULT '',
  requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  evaluation_weights JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs (company_id);

-- One session = one unique link for voice agent + candidate context
CREATE TABLE IF NOT EXISTS interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- candidate_id = public id for candidate/interview link
  candidate_id UUID DEFAULT gen_random_uuid(),
  -- interview_id = internal interview reference id
  interview_id UUID DEFAULT gen_random_uuid(),
  token UUID NOT NULL UNIQUE,
  job_id UUID NOT NULL REFERENCES jobs (id) ON DELETE CASCADE,
  candidate_name TEXT,
  candidate_email TEXT,
  agent_instruction TEXT NOT NULL DEFAULT '',
  agent_persona TEXT NOT NULL DEFAULT 'Technical Advisor',
  interview_length_minutes INT NOT NULL DEFAULT 30,
  focus_areas JSONB NOT NULL DEFAULT '[]'::jsonb,
  dynamic_probing BOOLEAN NOT NULL DEFAULT true,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'invited',
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '3 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE interview_sessions
  ADD COLUMN IF NOT EXISTS candidate_id UUID;
ALTER TABLE interview_sessions
  ALTER COLUMN candidate_id SET DEFAULT gen_random_uuid();

ALTER TABLE interview_sessions
  ADD COLUMN IF NOT EXISTS interview_id UUID;
ALTER TABLE interview_sessions
  ALTER COLUMN interview_id SET DEFAULT gen_random_uuid();

ALTER TABLE interview_sessions
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE interview_sessions
  ALTER COLUMN expires_at SET DEFAULT (now() + interval '3 days');

CREATE INDEX IF NOT EXISTS idx_sessions_token ON interview_sessions (token);
CREATE INDEX IF NOT EXISTS idx_sessions_candidate_id ON interview_sessions (candidate_id);
CREATE INDEX IF NOT EXISTS idx_sessions_job ON interview_sessions (job_id);

CREATE TABLE IF NOT EXISTS transcriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES interview_sessions (id) ON DELETE CASCADE,
  transcript_text TEXT NOT NULL,
  segments JSONB,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  ai_analysis TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transcriptions_session ON transcriptions (session_id);
