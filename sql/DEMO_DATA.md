# Demo Data Guide (HR + Applicant Flows)

Data demo utama disiapkan di `sql/migrations/003_seed_demo.sql`.

## Akun Yang Siap Dipakai

- HR / Recruiter:
  - email: `demo@kuantum.local`
  - name: `Demo Recruiter`
  - role: `recruiter`
- Applicant (contoh):
  - `priya.sharma@example.com`
  - `chris.o@example.com`
  - `sam.patel@example.com`
  - `alex.rivera@example.com`
  - `jordan.kim@example.com`
  - `morgan.lee@example.com`
  - `alda.applicant@kuantum.local`
  - `bagas.applicant@kuantum.local`
  - `citra.applicant@kuantum.local`

## Skenario Status Yang Tercakup

- `invited`: sesi sudah dibuat, kandidat belum mulai.
- `in_progress`: kandidat sedang interview.
- `completed`: interview selesai, ada score + analysis.
- `applied` tanpa sesi: ada lamaran applicant tanpa sesi interview (untuk uji edge-case dashboard seeker).

## Flow End-to-End Yang Bisa Ditest

1. Recruiter login -> lihat dashboard/jobs/candidates/comparison/results.
2. Seeker login -> apply ke job -> dapat `applicationId` + `sessionId`.
3. Seeker buka preparation -> instruction-set valid via session UUID.
4. Seeker redirect ke agent interview menggunakan route kandidat.
5. Recruiter buka hasil sesi (`/api/sessions/:sessionId/results`) dan comparison (`/api/comparison?jobId=...`).

## Catatan

- Flow undang kandidat dari HR di frontend sekarang membuat applicant via `/api/auth/login`, set role applicant via `/api/users/me`, lalu membuat lamaran via `/api/applications`.
- Endpoint HR yang butuh recruiter memakai header `X-User-Id` recruiter.
