-- Demo data: users → job_applicants → interview_sessions → transcriptions / access_codes
-- Setiap sesi wawancara terikat 1:1 ke job_applicants (lamaran harus ada dulu).

INSERT INTO users (id, email, name, role, industry_preference)
VALUES (
  '00000001-0000-4000-a000-000000000001'::uuid,
  'demo@kuantum.local',
  'Demo Recruiter',
  'recruiter',
  'Technology'
)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  industry_preference = EXCLUDED.industry_preference;

INSERT INTO companies (id, name, industry)
VALUES ('00000002-0000-4000-a000-000000000002'::uuid, 'Sprout Labs', 'Technology')
ON CONFLICT (id) DO NOTHING;

INSERT INTO jobs (
  id, company_id, title, department, employment_type, description,
  requirements, evaluation_weights, priority
)
VALUES (
  '00000003-0000-4000-a000-000000000003'::uuid,
  '00000002-0000-4000-a000-000000000002'::uuid,
  'Senior Backend Engineer',
  'Engineering',
  'full-time',
  'Own hiring-intelligence APIs, PostgreSQL, and reliability for real-time voice interviews.',
  '["5+ years backend","PostgreSQL","TypeScript","Node.js","distributed systems"]'::jsonb,
  '{"technical": 0.4, "communication": 0.3, "culture": 0.3}'::jsonb,
  'high'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO jobs (
  id, company_id, title, department, employment_type, description,
  requirements, evaluation_weights, priority
)
VALUES (
  '00000004-0000-4000-a000-000000000004'::uuid,
  '00000002-0000-4000-a000-000000000002'::uuid,
  'Product Designer',
  'Design',
  'full-time',
  'Shape end-to-end flows for recruiters and candidates across web and voice.',
  '["Figma","design systems","user research"]'::jsonb,
  '{"craft": 0.35, "communication": 0.35, "strategy": 0.3}'::jsonb,
  'standard'
)
ON CONFLICT (id) DO NOTHING;

-- Pipeline demo candidates (applicant users + lamaran + sesi)
INSERT INTO users (id, email, name, role, industry_preference)
VALUES
  ('00000021-0000-4000-a000-000000000021'::uuid, 'priya.sharma@example.com', 'Priya Sharma', 'applicant', 'Technology'),
  ('00000022-0000-4000-a000-000000000022'::uuid, 'chris.o@example.com', 'Chris Okonkwo', 'applicant', 'Technology'),
  ('00000023-0000-4000-a000-000000000023'::uuid, 'sam.patel@example.com', 'Sam Patel', 'applicant', 'Technology'),
  ('00000024-0000-4000-a000-000000000024'::uuid, 'alex.rivera@example.com', 'Alex Rivera', 'applicant', 'Technology'),
  ('00000025-0000-4000-a000-000000000025'::uuid, 'jordan.kim@example.com', 'Jordan Kim', 'applicant', 'Technology'),
  ('00000026-0000-4000-a000-000000000026'::uuid, 'morgan.lee@example.com', 'Morgan Lee', 'applicant', 'Technology')
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  industry_preference = EXCLUDED.industry_preference;

INSERT INTO job_applicants (id, job_id, user_id)
VALUES
  ('00000041-0000-4000-a000-000000000101'::uuid, '00000003-0000-4000-a000-000000000003'::uuid, '00000021-0000-4000-a000-000000000021'::uuid),
  ('00000041-0000-4000-a000-000000000102'::uuid, '00000003-0000-4000-a000-000000000003'::uuid, '00000022-0000-4000-a000-000000000022'::uuid),
  ('00000041-0000-4000-a000-000000000103'::uuid, '00000003-0000-4000-a000-000000000003'::uuid, '00000023-0000-4000-a000-000000000023'::uuid),
  ('00000041-0000-4000-a000-000000000104'::uuid, '00000003-0000-4000-a000-000000000003'::uuid, '00000024-0000-4000-a000-000000000024'::uuid),
  ('00000041-0000-4000-a000-000000000105'::uuid, '00000003-0000-4000-a000-000000000003'::uuid, '00000025-0000-4000-a000-000000000025'::uuid),
  ('00000041-0000-4000-a000-000000000106'::uuid, '00000004-0000-4000-a000-000000000004'::uuid, '00000026-0000-4000-a000-000000000026'::uuid)
ON CONFLICT (id) DO NOTHING;

INSERT INTO interview_sessions (
  id, job_applicant_id, candidate_id, interview_id, token,
  agent_instruction, agent_persona, interview_length_minutes,
  focus_areas, dynamic_probing, questions, status, overall_score, expires_at, created_at
)
VALUES
  (
    '00001001-0000-4000-a000-000000000101'::uuid,
    '00000041-0000-4000-a000-000000000101'::uuid,
    '30001001-0000-4000-8000-000000000101'::uuid,
    '40001001-0000-4000-8000-000000000101'::uuid,
    '10001001-0000-4000-8000-000000000101'::uuid,
    'Focus on API design and scaling. Ask for concrete tradeoffs.',
    'Technical Advisor',
    35,
    '["APIs","scaling","reliability"]'::jsonb,
    true,
    '["Walk me through how you would design rate limiting for a public API.","Describe a production incident involving scaling and what you changed afterward.","How do you balance consistency vs availability for user-facing writes?"]'::jsonb,
    'invited',
    NULL,
    TIMESTAMPTZ '2100-01-01T00:00:00Z',
    now() - interval '6 days'
  ),
  (
    '00001002-0000-4000-a000-000000000102'::uuid,
    '00000041-0000-4000-a000-000000000102'::uuid,
    '30001002-0000-4000-8000-000000000102'::uuid,
    '40001002-0000-4000-8000-000000000102'::uuid,
    '10001002-0000-4000-8000-000000000102'::uuid,
    'Probe system design and failure modes.',
    'Technical Advisor',
    30,
    '["system design","queues"]'::jsonb,
    true,
    '["Design a job queue for async interview processing—what components and failure modes do you plan for?","How do you handle poison messages and dead-letter queues in practice?","Compare when you would pick a log-based queue vs a simple Redis list for this product."]'::jsonb,
    'in_progress',
    NULL,
    TIMESTAMPTZ '2100-01-01T00:00:00Z',
    now() - interval '2 days'
  ),
  (
    '00001003-0000-4000-a000-000000000103'::uuid,
    '00000041-0000-4000-a000-000000000103'::uuid,
    '30001003-0000-4000-8000-000000000103'::uuid,
    '40001003-0000-4000-8000-000000000103'::uuid,
    '10001003-0000-4000-8000-000000000103'::uuid,
    'Senior backend loop; emphasize ownership and metrics.',
    'Technical Advisor',
    40,
    '["architecture","mentoring"]'::jsonb,
    true,
    '["How would you plan and execute a zero-downtime Postgres major upgrade?","Describe how you mentor engineers during incidents or postmortems.","What SLOs or metrics do you use to prove reliability for backend services you own?"]'::jsonb,
    'completed',
    91,
    TIMESTAMPTZ '2100-01-01T00:00:00Z',
    now() - interval '4 days'
  ),
  (
    '00001004-0000-4000-a000-000000000104'::uuid,
    '00000041-0000-4000-a000-000000000104'::uuid,
    '30001004-0000-4000-8000-000000000104'::uuid,
    '40001004-0000-4000-8000-000000000104'::uuid,
    '10001004-0000-4000-8000-000000000104'::uuid,
    'Backend depth and collaboration with product.',
    'Technical Advisor',
    30,
    '["APIs","PostgreSQL"]'::jsonb,
    true,
    '["Explain how you migrated or would migrate read traffic to replicas without downtime.","When would you choose an outbox pattern versus full event sourcing?","How do you align with product when backend scope or timelines are unclear?"]'::jsonb,
    'completed',
    88,
    TIMESTAMPTZ '2100-01-01T00:00:00Z',
    now() - interval '3 days'
  ),
  (
    '00001005-0000-4000-a000-000000000105'::uuid,
    '00000041-0000-4000-a000-000000000105'::uuid,
    '30001005-0000-4000-8000-000000000105'::uuid,
    '40001005-0000-4000-8000-000000000105'::uuid,
    '10001005-0000-4000-8000-000000000105'::uuid,
    'Assess debugging and communication under ambiguity.',
    'Technical Advisor',
    30,
    '["debugging","communication"]'::jsonb,
    true,
    '["Walk me through debugging a slow or failing query in production.","How do you communicate with stakeholders when the root cause is still unknown?","Describe a time you improved observability after an incident."]'::jsonb,
    'completed',
    76,
    TIMESTAMPTZ '2100-01-01T00:00:00Z',
    now() - interval '5 days'
  ),
  (
    '00001006-0000-4000-a000-000000000106'::uuid,
    '00000041-0000-4000-a000-000000000106'::uuid,
    '30001006-0000-4000-8000-000000000106'::uuid,
    '40001006-0000-4000-8000-000000000106'::uuid,
    '10001006-0000-4000-8000-000000000106'::uuid,
    'Portfolio walkthrough and collaboration with engineering.',
    'Product Partner',
    30,
    '["systems thinking","handoff"]'::jsonb,
    true,
    '["Walk me through a recent portfolio piece—problem, process, and outcome.","How do you hand off specs or interaction details to engineering?","How do you validate information architecture or flow changes with users?"]'::jsonb,
    'completed',
    72,
    TIMESTAMPTZ '2100-01-01T00:00:00Z',
    now() - interval '7 days'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO transcriptions (id, session_id, transcript_text, meta, ai_analysis, created_at)
VALUES (
  '00002001-0000-4000-a000-000000000201'::uuid,
  '00001005-0000-4000-a000-000000000105'::uuid,
  $$Jordan: I would start by adding observability before scaling the workers. We used p95 latency as our guardrail.
Interviewer: How did you handle poison messages?
Jordan: Dead-letter queue with replay tooling for support.$$,
  '{}'::jsonb,
  $json${
    "summary": "Solid operational instincts; communication could be crisper under follow-ups.",
    "overallScore": 76,
    "suggestedScore": 76,
    "competencies": {
      "technicalDepth": 78,
      "systemDesign": 72,
      "problemSolving": 80,
      "communication": 70,
      "teamFit": 82,
      "leadership": 68
    },
    "cultureLabel": "Good fit",
    "keyMoments": [
      {"quote": "p95 latency as our guardrail", "topic": "SRE", "signal": "positive"}
    ],
    "growthPrediction": "Strong mid-level; coach on structured answers.",
    "redFlags": "None critical"
  }$json$,
  now() - interval '5 days' + interval '45 minutes'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO transcriptions (id, session_id, transcript_text, meta, ai_analysis, created_at)
VALUES (
  '00002002-0000-4000-a000-000000000202'::uuid,
  '00001004-0000-4000-a000-000000000104'::uuid,
  $$Alex: We migrated reads to a replica set and kept writes on the primary with optimistic locking.
Interviewer: Tradeoffs vs event sourcing?
Alex: Event sourcing was heavier than we needed; we chose outbox for reliability.$$,
  '{}'::jsonb,
  $json${
    "summary": "Clear ownership of migrations and pragmatic tradeoffs; strong collaborator.",
    "overallScore": 88,
    "suggestedScore": 88,
    "competencies": {
      "technicalDepth": 88,
      "systemDesign": 85,
      "problemSolving": 86,
      "communication": 84,
      "teamFit": 90,
      "leadership": 78
    },
    "cultureLabel": "Strong fit",
    "keyMoments": [
      {"quote": "outbox for reliability", "topic": "Data", "signal": "positive"}
    ],
    "growthPrediction": "Ready for staff-level scope on platform.",
    "redFlags": ""
  }$json$,
  now() - interval '3 days' + interval '20 minutes'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO transcriptions (id, session_id, transcript_text, meta, ai_analysis, created_at)
VALUES (
  '00002003-0000-4000-a000-000000000203'::uuid,
  '00001003-0000-4000-a000-000000000103'::uuid,
  $$Sam: I led the Postgres upgrade with zero downtime using logical replication and staged cutover.
Interviewer: How do you mentor juniors on incidents?
Sam: Blameless postmortems and pairing on runbooks.$$,
  '{}'::jsonb,
  $json${
    "summary": "Exceptional depth on reliability and leadership; top pick for senior backend.",
    "overallScore": 91,
    "suggestedScore": 91,
    "competencies": {
      "technicalDepth": 92,
      "systemDesign": 90,
      "problemSolving": 88,
      "communication": 86,
      "teamFit": 93,
      "leadership": 90
    },
    "cultureLabel": "Strong fit",
    "keyMoments": [
      {"quote": "zero downtime using logical replication", "topic": "Operations", "signal": "positive"},
      {"quote": "Blameless postmortems", "topic": "Culture", "signal": "positive"}
    ],
    "growthPrediction": "Could own org-wide platform roadmap.",
    "redFlags": ""
  }$json$,
  now() - interval '4 days' + interval '10 minutes'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO transcriptions (id, session_id, transcript_text, meta, ai_analysis, created_at)
VALUES (
  '00002004-0000-4000-a000-000000000204'::uuid,
  '00001006-0000-4000-a000-000000000106'::uuid,
  $$Morgan: The recruiter dashboard needed a calmer hierarchy—we tested two IA variants with five teams.
Interviewer: How do you work with eng on delivery?
Morgan: Shared Figma + API contracts weekly; async Loom for edge cases.$$,
  '{}'::jsonb,
  $json${
    "summary": "Structured researcher-designer with strong cross-functional habits.",
    "overallScore": 72,
    "suggestedScore": 72,
    "competencies": {
      "technicalDepth": 65,
      "systemDesign": 70,
      "problemSolving": 75,
      "communication": 88,
      "teamFit": 85,
      "leadership": 72
    },
    "cultureLabel": "Good fit",
    "keyMoments": [
      {"quote": "tested two IA variants", "topic": "Research", "signal": "positive"}
    ],
    "growthPrediction": "Great IC4 designer; grow strategic narrative.",
    "redFlags": ""
  }$json$,
  now() - interval '7 days' + interval '30 minutes'
)
ON CONFLICT (id) DO NOTHING;

-- Applicant demo (Alda, Bagas, Citra): lamaran dulu, lalu sesi untuk Alda & Bagas
INSERT INTO users (id, email, name, role, industry_preference)
VALUES
  (
    '00000011-0000-4000-a000-000000000011'::uuid,
    'alda.applicant@kuantum.local',
    'Alda Prameswari',
    'applicant',
    'Technology'
  ),
  (
    '00000012-0000-4000-a000-000000000012'::uuid,
    'bagas.applicant@kuantum.local',
    'Bagas Santoso',
    'applicant',
    'Technology'
  ),
  (
    '00000013-0000-4000-a000-000000000013'::uuid,
    'citra.applicant@kuantum.local',
    'Citra Lestari',
    'applicant',
    'Design'
  )
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  industry_preference = EXCLUDED.industry_preference;

INSERT INTO job_applicants (id, job_id, user_id)
VALUES
  (
    '00004001-0000-4000-a000-000000000401'::uuid,
    '00000003-0000-4000-a000-000000000003'::uuid,
    '00000011-0000-4000-a000-000000000011'::uuid
  ),
  (
    '00004002-0000-4000-a000-000000000402'::uuid,
    '00000004-0000-4000-a000-000000000004'::uuid,
    '00000012-0000-4000-a000-000000000012'::uuid
  ),
  (
    '00004003-0000-4000-a000-000000000403'::uuid,
    '00000003-0000-4000-a000-000000000003'::uuid,
    '00000013-0000-4000-a000-000000000013'::uuid
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO interview_sessions (
  id,
  job_applicant_id,
  candidate_id,
  interview_id,
  token,
  agent_instruction,
  agent_persona,
  interview_length_minutes,
  focus_areas,
  dynamic_probing,
  questions,
  status,
  expires_at,
  created_at
)
VALUES
  (
    '00003001-0000-4000-a000-000000000301'::uuid,
    '00004001-0000-4000-a000-000000000401'::uuid,
    '30003001-0000-4000-8000-000000000301'::uuid,
    '40004001-0000-4000-8000-000000000301'::uuid,
    '50005001-0000-4000-8000-000000000301'::uuid,
    'Fokus pada backend API design, reliability, dan trade-off yang praktis.',
    'Technical Advisor',
    30,
    '["API design","reliability","communication"]'::jsonb,
    true,
    '["Ceritakan keputusan desain API yang paling sulit dan trade-off yang dipilih.","Bagaimana Anda mengukur reliability service backend yang Anda kelola?","Jelaskan contoh saat Anda memecahkan incident production dengan tekanan waktu."]'::jsonb,
    'invited',
    TIMESTAMPTZ '2100-01-01T00:00:00Z',
    now() - interval '1 day'
  ),
  (
    '00003002-0000-4000-a000-000000000302'::uuid,
    '00004002-0000-4000-a000-000000000402'::uuid,
    '30003002-0000-4000-8000-000000000302'::uuid,
    '40004002-0000-4000-8000-000000000302'::uuid,
    '50005002-0000-4000-8000-000000000302'::uuid,
    'Fokus pada product thinking, collaboration, dan design rationale.',
    'Product Partner',
    30,
    '["problem solving","collaboration","design systems"]'::jsonb,
    true,
    '["Bagaimana Anda menerjemahkan requirement ambigu menjadi flow produk yang jelas?","Ceritakan cara Anda berkolaborasi dengan engineer saat terjadi constraint teknis.","Contoh keputusan design system yang berdampak ke konsistensi produk."]'::jsonb,
    'invited',
    TIMESTAMPTZ '2100-01-01T00:00:00Z',
    now() - interval '12 hours'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO access_codes (id, session_code, session_id, token, name, valid, expires_at, created_at)
VALUES
  (
    'ALDA2INTERV',
    'AldaSess01',
    '00003001-0000-4000-a000-000000000301'::uuid,
    '50005001-0000-4000-8000-000000000301'::uuid,
    'Alda Prameswari',
    true,
    TIMESTAMPTZ '2100-01-01T00:00:00Z',
    now() - interval '1 day'
  ),
  (
    'BGS2INTERVW',
    'BagasSes02',
    '00003002-0000-4000-a000-000000000302'::uuid,
    '50005002-0000-4000-8000-000000000302'::uuid,
    'Bagas Santoso',
    true,
    TIMESTAMPTZ '2100-01-01T00:00:00Z',
    now() - interval '12 hours'
  )
ON CONFLICT (session_id) DO UPDATE SET
  id = EXCLUDED.id,
  session_code = EXCLUDED.session_code,
  token = EXCLUDED.token,
  name = EXCLUDED.name,
  valid = EXCLUDED.valid,
  expires_at = EXCLUDED.expires_at;
