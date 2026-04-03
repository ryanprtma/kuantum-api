-- Sebelum seed 003: hapus baris dengan email demo jika sudah ada (mis. login upsert membuat UUID lain),
-- agar INSERT seed dengan UUID tetap tidak melanggar FK / bentrok.
DELETE FROM users
WHERE email IN (
  'demo@kuantum.local',
  'priya.sharma@example.com',
  'chris.o@example.com',
  'sam.patel@example.com',
  'alex.rivera@example.com',
  'jordan.kim@example.com',
  'morgan.lee@example.com',
  'alda.applicant@kuantum.local',
  'bagas.applicant@kuantum.local',
  'citra.applicant@kuantum.local'
);
