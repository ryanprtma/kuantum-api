-- Add candidate/interview ids and 3-day expiry for interview links.
-- Idempotent migration for existing databases.

ALTER TABLE interview_sessions
  ADD COLUMN IF NOT EXISTS candidate_id UUID;

ALTER TABLE interview_sessions
  ADD COLUMN IF NOT EXISTS interview_id UUID;

ALTER TABLE interview_sessions
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Backfill old rows
UPDATE interview_sessions
SET candidate_id = gen_random_uuid()
WHERE candidate_id IS NULL;

UPDATE interview_sessions
SET interview_id = gen_random_uuid()
WHERE interview_id IS NULL;

UPDATE interview_sessions
SET expires_at = created_at + interval '3 days'
WHERE expires_at IS NULL;

ALTER TABLE interview_sessions
  ALTER COLUMN candidate_id SET NOT NULL;

ALTER TABLE interview_sessions
  ALTER COLUMN interview_id SET NOT NULL;

ALTER TABLE interview_sessions
  ALTER COLUMN expires_at SET NOT NULL;

ALTER TABLE interview_sessions
  ALTER COLUMN candidate_id SET DEFAULT gen_random_uuid();

ALTER TABLE interview_sessions
  ALTER COLUMN interview_id SET DEFAULT gen_random_uuid();

ALTER TABLE interview_sessions
  ALTER COLUMN expires_at SET DEFAULT (now() + interval '3 days');

CREATE UNIQUE INDEX IF NOT EXISTS uq_sessions_candidate_id ON interview_sessions (candidate_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_sessions_interview_id ON interview_sessions (interview_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON interview_sessions (expires_at);
