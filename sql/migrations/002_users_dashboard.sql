-- Users & job interview defaults (idempotent)

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  password_hash TEXT,
  role_title TEXT,
  industry_preference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'standard';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS default_agent_persona TEXT NOT NULL DEFAULT 'Technical Advisor';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS default_interview_length_minutes INT NOT NULL DEFAULT 30;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS default_focus_areas JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS default_dynamic_probing BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS default_questions JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE interview_sessions ADD COLUMN IF NOT EXISTS overall_score INT;

CREATE INDEX IF NOT EXISTS idx_sessions_job_status ON interview_sessions (job_id, status);
