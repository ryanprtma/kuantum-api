-- Demo account + sample data for dashboard, candidates, comparison, interview & results (idempotent)

INSERT INTO users (id, email, name, role_title, industry_preference)
VALUES (
  '00000001-0000-4000-a000-000000000001'::uuid,
  'demo@kuantum.local',
  'Demo Recruiter',
  'Senior Hiring Manager',
  'Technology'
)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role_title = EXCLUDED.role_title,
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

INSERT INTO interview_sessions (
  id, token, job_id, candidate_name, candidate_email,
  agent_instruction, agent_persona, interview_length_minutes,
  focus_areas, dynamic_probing, questions, status, overall_score, created_at
)
VALUES (
  '00001001-0000-4000-a000-000000000101'::uuid,
  '10001001-0000-4000-8000-000000000101'::uuid,
  '00000003-0000-4000-a000-000000000003'::uuid,
  'Priya Sharma',
  'priya.sharma@example.com',
  'Focus on API design and scaling. Ask for concrete tradeoffs.',
  'Technical Advisor',
  35,
  '["APIs","scaling","reliability"]'::jsonb,
  true,
  '["Walk me through how you would design rate limiting for a public API.","Describe a production incident involving scaling and what you changed afterward.","How do you balance consistency vs availability for user-facing writes?"]'::jsonb,
  'invited',
  NULL,
  now() - interval '6 days'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO interview_sessions (
  id, token, job_id, candidate_name, candidate_email,
  agent_instruction, agent_persona, interview_length_minutes,
  focus_areas, dynamic_probing, questions, status, overall_score, created_at
)
VALUES (
  '00001002-0000-4000-a000-000000000102'::uuid,
  '10001002-0000-4000-8000-000000000102'::uuid,
  '00000003-0000-4000-a000-000000000003'::uuid,
  'Chris Okonkwo',
  'chris.o@example.com',
  'Probe system design and failure modes.',
  'Technical Advisor',
  30,
  '["system design","queues"]'::jsonb,
  true,
  '["Design a job queue for async interview processing—what components and failure modes do you plan for?","How do you handle poison messages and dead-letter queues in practice?","Compare when you would pick a log-based queue vs a simple Redis list for this product."]'::jsonb,
  'in_progress',
  NULL,
  now() - interval '2 days'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO interview_sessions (
  id, token, job_id, candidate_name, candidate_email,
  agent_instruction, agent_persona, interview_length_minutes,
  focus_areas, dynamic_probing, questions, status, overall_score, created_at
)
VALUES (
  '00001003-0000-4000-a000-000000000103'::uuid,
  '10001003-0000-4000-8000-000000000103'::uuid,
  '00000003-0000-4000-a000-000000000003'::uuid,
  'Sam Patel',
  'sam.patel@example.com',
  'Senior backend loop; emphasize ownership and metrics.',
  'Technical Advisor',
  40,
  '["architecture","mentoring"]'::jsonb,
  true,
  '["How would you plan and execute a zero-downtime Postgres major upgrade?","Describe how you mentor engineers during incidents or postmortems.","What SLOs or metrics do you use to prove reliability for backend services you own?"]'::jsonb,
  'completed',
  91,
  now() - interval '4 days'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO interview_sessions (
  id, token, job_id, candidate_name, candidate_email,
  agent_instruction, agent_persona, interview_length_minutes,
  focus_areas, dynamic_probing, questions, status, overall_score, created_at
)
VALUES (
  '00001004-0000-4000-a000-000000000104'::uuid,
  '10001004-0000-4000-8000-000000000104'::uuid,
  '00000003-0000-4000-a000-000000000003'::uuid,
  'Alex Rivera',
  'alex.rivera@example.com',
  'Backend depth and collaboration with product.',
  'Technical Advisor',
  30,
  '["APIs","PostgreSQL"]'::jsonb,
  true,
  '["Explain how you migrated or would migrate read traffic to replicas without downtime.","When would you choose an outbox pattern versus full event sourcing?","How do you align with product when backend scope or timelines are unclear?"]'::jsonb,
  'completed',
  88,
  now() - interval '3 days'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO interview_sessions (
  id, token, job_id, candidate_name, candidate_email,
  agent_instruction, agent_persona, interview_length_minutes,
  focus_areas, dynamic_probing, questions, status, overall_score, created_at
)
VALUES (
  '00001005-0000-4000-a000-000000000105'::uuid,
  '10001005-0000-4000-8000-000000000105'::uuid,
  '00000003-0000-4000-a000-000000000003'::uuid,
  'Jordan Kim',
  'jordan.kim@example.com',
  'Assess debugging and communication under ambiguity.',
  'Technical Advisor',
  30,
  '["debugging","communication"]'::jsonb,
  true,
  '["Walk me through debugging a slow or failing query in production.","How do you communicate with stakeholders when the root cause is still unknown?","Describe a time you improved observability after an incident."]'::jsonb,
  'completed',
  76,
  now() - interval '5 days'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO interview_sessions (
  id, token, job_id, candidate_name, candidate_email,
  agent_instruction, agent_persona, interview_length_minutes,
  focus_areas, dynamic_probing, questions, status, overall_score, created_at
)
VALUES (
  '00001006-0000-4000-a000-000000000106'::uuid,
  '10001006-0000-4000-8000-000000000106'::uuid,
  '00000004-0000-4000-a000-000000000004'::uuid,
  'Morgan Lee',
  'morgan.lee@example.com',
  'Portfolio walkthrough and collaboration with engineering.',
  'Product Partner',
  30,
  '["systems thinking","handoff"]'::jsonb,
  true,
  '["Walk me through a recent portfolio piece—problem, process, and outcome.","How do you hand off specs or interaction details to engineering?","How do you validate information architecture or flow changes with users?"]'::jsonb,
  'completed',
  72,
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
