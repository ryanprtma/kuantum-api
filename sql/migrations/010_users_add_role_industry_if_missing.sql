-- DB lama: users tanpa kolom role (enum), atau hanya role_title (text); CREATE TABLE IF NOT EXISTS tidak meng-upgrade tabel.
DO $$
BEGIN
  CREATE TYPE user_role AS ENUM ('recruiter', 'applicant');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE users ADD COLUMN IF NOT EXISTS role user_role;
ALTER TABLE users ADD COLUMN IF NOT EXISTS industry_preference TEXT;

-- Backfill dari role_title jika kolom itu masih ada (skema lama)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'role_title'
  ) THEN
    UPDATE users
    SET role = CASE lower(trim(role_title))
      WHEN 'recruiter' THEN 'recruiter'::user_role
      WHEN 'applicant' THEN 'applicant'::user_role
      ELSE NULL
    END
    WHERE role IS NULL AND role_title IS NOT NULL AND trim(role_title) <> '';
  END IF;
END $$;
