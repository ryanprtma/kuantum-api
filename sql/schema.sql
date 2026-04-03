-- Snapshot skema (mirror sql/migrations/002_users_dashboard.sql). Untuk DB baru, jalankan migrasi berurutan.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
  CREATE TYPE user_role AS ENUM ('recruiter', 'applicant');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

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
  priority TEXT NOT NULL DEFAULT 'standard',
  default_agent_persona TEXT NOT NULL DEFAULT 'Technical Advisor',
  default_interview_length_minutes INT NOT NULL DEFAULT 30,
  default_focus_areas JSONB NOT NULL DEFAULT '[]'::jsonb,
  default_dynamic_probing BOOLEAN NOT NULL DEFAULT true,
  default_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs (company_id);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  password_hash TEXT,
  role user_role,
  industry_preference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS job_applicants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (job_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_job_applicants_user_created ON job_applicants (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_applicants_job ON job_applicants (job_id);

CREATE TABLE IF NOT EXISTS interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_applicant_id UUID NOT NULL UNIQUE REFERENCES job_applicants (id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL,
  interview_id UUID NOT NULL,
  token UUID NOT NULL UNIQUE,
  agent_instruction TEXT NOT NULL DEFAULT '',
  agent_persona TEXT NOT NULL DEFAULT 'Technical Advisor',
  interview_length_minutes INT NOT NULL DEFAULT 30,
  focus_areas JSONB NOT NULL DEFAULT '[]'::jsonb,
  dynamic_probing BOOLEAN NOT NULL DEFAULT true,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'invited',
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '3 days'),
  overall_score INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_sessions_candidate_id ON interview_sessions (candidate_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_sessions_interview_id ON interview_sessions (interview_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON interview_sessions (token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON interview_sessions (expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON interview_sessions (status);

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

CREATE TABLE IF NOT EXISTS access_codes (
  id TEXT PRIMARY KEY,
  session_code TEXT NOT NULL UNIQUE,
  session_id UUID NOT NULL UNIQUE REFERENCES interview_sessions (id) ON DELETE CASCADE,
  token UUID NOT NULL,
  name TEXT NOT NULL,
  valid BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '3 days')
);

CREATE INDEX IF NOT EXISTS idx_access_codes_expires_at ON access_codes (expires_at);
