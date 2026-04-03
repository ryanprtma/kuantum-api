-- DB lama: job_applicants.session_id NOT NULL + FK ke interview_sessions.
-- Skema baru: lamaran bisa ada tanpa sesi sampai HR membuat undangan (session_id NULL).

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'job_applicants' AND column_name = 'session_id'
  ) THEN
    ALTER TABLE job_applicants ALTER COLUMN session_id DROP NOT NULL;
  END IF;
END $$;
