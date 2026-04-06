# Kuantum API - Deploy (public demo)

## Rekomendasi platform (paling cepat dengan Docker)
1. **Render** (Web Service + Managed Postgres)
2. Alternatif: **Railway** (Docker) atau **Fly.io** (lebih fleksibel)

Di bawah ini langkah khusus untuk **Render**.

## 1) Buat Managed Postgres
- Create database: PostgreSQL
- Ambil nilai **DATABASE_URL**

Pastikan extension `"pgcrypto"` tersedia (schema sudah pakai `CREATE EXTENSION IF NOT EXISTS "pgcrypto";`).

## 2) Deploy Kuantum API (Docker)
1. Create **Web Service**
2. Source: **Dockerfile**
3. Build context: `./kuantum-api`
4. Dockerfile: `./kuantum-api/Dockerfile`
5. Entrypoint sudah jalan migrasi otomatis (`docker-entrypoint.sh` menjalankan `dist/migrate.js`)

## 3) Environment Variables yang perlu diisi
Minimal:
- `DATABASE_URL` (dari Managed Postgres)
- `PORT` (default `3001`)

Agar link interview konsisten:
- `PUBLIC_APP_BASE_URL` (domain frontend kamu; kalau hanya API tanpa FE, set tetap sesuai yang kamu pakai untuk demo)
- `INTERVIEW_REDIRECT_BASE_URL` (optional; kalau kosong, fallback ke `PUBLIC_APP_BASE_URL`)

Untuk “token saja, tanpa auth/user” saat external memanggil endpoint recruiter:
- `EXTERNAL_INTERVIEW_INTERNAL_TOKEN` (buat nilai secret)

Opsional:
- `EXTERNAL_TRANSCRIPTION_URL_TEMPLATE` (kalau mau pakai STT provider eksternal)
- `EXTERNAL_TRANSCRIPTION_API_KEY`
- `EXTERNAL_TRANSCRIPTION_HEADERS_JSON`

## 4) Endpoint yang dipakai oleh public demo
- Public (tanpa auth header):
  - `GET /api/agent/instructions/:id` (di app route `/interview/:token`)
  - `GET /api/agent/transcriptions/:token`

- Protected (recruiter-only; pakai token internal):
  - `GET /api/agent/instruction-set/:sessionId`
  - `GET /api/agent/candidate/:candidateId/redirect`

## 5) CI/CD (opsional)
File CI sudah ada: `.github/workflows/kuantum-api-ci-cd.yml`
Ini akan build & publish image `kuantum-api` ke GHCR.

Kalau kamu ingin Render pull dari GHCR image, kamu bisa atur Image URL di Render. (Untuk itu biasanya perlu credential `read:packages`.)

## 6) Catatan keamanan demo
- Jangan commit `.env` yang berisi secret (token internal / credential DB).
- Endpoint public hanya read-only (instruksi/transkrip), tapi tetap disarankan rate limit di level platform.

