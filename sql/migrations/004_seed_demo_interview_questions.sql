-- Isi pertanyaan wawancara untuk semua sesi demo (idempotent; memperbaiki DB yang sudah jalan 003 dengan questions kosong)

UPDATE interview_sessions
SET questions = '["Walk me through how you would design rate limiting for a public API.","Describe a production incident involving scaling and what you changed afterward.","How do you balance consistency vs availability for user-facing writes?"]'::jsonb
WHERE id = '00001001-0000-4000-a000-000000000101'::uuid;

UPDATE interview_sessions
SET questions = '["Design a job queue for async interview processing—what components and failure modes do you plan for?","How do you handle poison messages and dead-letter queues in practice?","Compare when you would pick a log-based queue vs a simple Redis list for this product."]'::jsonb
WHERE id = '00001002-0000-4000-a000-000000000102'::uuid;

UPDATE interview_sessions
SET questions = '["How would you plan and execute a zero-downtime Postgres major upgrade?","Describe how you mentor engineers during incidents or postmortems.","What SLOs or metrics do you use to prove reliability for backend services you own?"]'::jsonb
WHERE id = '00001003-0000-4000-a000-000000000103'::uuid;

UPDATE interview_sessions
SET questions = '["Explain how you migrated or would migrate read traffic to replicas without downtime.","When would you choose an outbox pattern versus full event sourcing?","How do you align with product when backend scope or timelines are unclear?"]'::jsonb
WHERE id = '00001004-0000-4000-a000-000000000104'::uuid;

UPDATE interview_sessions
SET questions = '["Walk me through debugging a slow or failing query in production.","How do you communicate with stakeholders when the root cause is still unknown?","Describe a time you improved observability after an incident."]'::jsonb
WHERE id = '00001005-0000-4000-a000-000000000105'::uuid;

UPDATE interview_sessions
SET questions = '["Walk me through a recent portfolio piece—problem, process, and outcome.","How do you hand off specs or interaction details to engineering?","How do you validate information architecture or flow changes with users?"]'::jsonb
WHERE id = '00001006-0000-4000-a000-000000000106'::uuid;
