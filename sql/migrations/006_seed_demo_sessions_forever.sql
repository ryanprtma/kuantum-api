-- Make demo session ids usable "forever" by moving expires_at far future.
-- Idempotent (safe to re-run).

UPDATE interview_sessions
SET expires_at = TIMESTAMPTZ '2100-01-01T00:00:00Z'
WHERE id IN (
  '00001001-0000-4000-a000-000000000101'::uuid,
  '00001002-0000-4000-a000-000000000102'::uuid,
  '00001003-0000-4000-a000-000000000103'::uuid,
  '00001004-0000-4000-a000-000000000104'::uuid,
  '00001005-0000-4000-a000-000000000105'::uuid,
  '00001006-0000-4000-a000-000000000106'::uuid
);

