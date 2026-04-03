/**
 * OpenAPI 3.0 — Kuantum hiring / voice agent API
 */
export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Kuantum API",
    version: "1.0.0",
    description:
      "REST API untuk dashboard hiring, sesi wawancara voice agent, dan analisis kandidat. " +
      "Autentikasi demo: kirim header **X-User-Id** dengan UUID yang dikembalikan dari `POST /api/auth/login` (bukan JWT).",
  },
  tags: [
    { name: "Health", description: "Kesehatan service" },
    { name: "Bootstrap", description: "Inisialisasi data demo" },
    { name: "Auth", description: "Login tanpa password" },
    { name: "Users", description: "Profil pengguna (header X-User-Id)" },
    { name: "Dashboard", description: "Ringkasan metrik" },
    { name: "Comparison", description: "Perbandingan kandidat per lowongan" },
    { name: "Companies", description: "Perusahaan" },
    { name: "Jobs", description: "Lowongan" },
    { name: "Sessions", description: "Sesi wawancara & hasil" },
    {
      name: "Agent",
      description:
        "Instruksi agen (token publik atau session + X-User-Id), transkrip",
    },
    { name: "Candidates", description: "Pipeline kandidat" },
    {
      name: "Applications",
      description: "Lamaran job dari applicant (seeker)",
    },
  ],
  servers: [
    {
      url: "/",
      description: "Origin yang sama (dev: :3001, Docker UI: :8080)",
    },
  ],
  components: {
    securitySchemes: {
      UserId: {
        type: "apiKey",
        in: "header",
        name: "X-User-Id",
        description: "UUID user dari response login",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: { error: { type: "string" } },
      },
      LoginBody: {
        type: "object",
        required: ["email"],
        properties: {
          email: { type: "string", format: "email" },
          name: { type: "string" },
        },
      },
      LoginResponse: {
        type: "object",
        properties: {
          token: {
            type: "string",
            description: "UUID — gunakan sebagai X-User-Id",
          },
          user: { type: "object", additionalProperties: true },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          email: { type: "string" },
          name: { type: "string", nullable: true },
          role: {
            type: "string",
            enum: ["recruiter", "applicant"],
            nullable: true,
          },
          industry_preference: { type: "string", nullable: true },
          created_at: { type: "string", format: "date-time" },
        },
      },
      UserPatch: {
        type: "object",
        properties: {
          name: { type: "string" },
          role: { type: "string", enum: ["recruiter", "applicant"] },
          industryPreference: { type: "string" },
        },
      },
      CompanyCreate: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string" },
          industry: { type: "string", default: "Technology" },
        },
      },
      JobCreate: {
        type: "object",
        required: ["companyId", "title"],
        properties: {
          companyId: { type: "string", format: "uuid" },
          title: { type: "string" },
          department: { type: "string" },
          employmentType: { type: "string", example: "full-time" },
          description: { type: "string" },
          requirements: { type: "array", items: { type: "string" } },
          evaluationWeights: {
            type: "object",
            additionalProperties: { type: "number" },
          },
          priority: { type: "string", enum: ["standard", "high"] },
        },
      },
      SessionCreate: {
        type: "object",
        required: ["jobApplicantId"],
        properties: {
          jobApplicantId: {
            type: "string",
            format: "uuid",
            description:
              "ID lamaran (job_applicants). Kandidat harus sudah apply ke job tersebut.",
          },
          agentInstruction: { type: "string" },
          agentPersona: { type: "string" },
          interviewLengthMinutes: { type: "number" },
          focusAreas: { type: "array", items: { type: "string" } },
          dynamicProbing: { type: "boolean" },
          questions: { type: "array", items: { type: "string" } },
        },
      },
      AccessCodeResponse: {
        type: "object",
        required: ["valid", "name", "id", "sessionId", "sessionCode"],
        properties: {
          valid: { type: "boolean" },
          name: { type: "string" },
          id: { type: "string" },
          sessionId: { type: "string", format: "uuid" },
          sessionCode: { type: "string" },
        },
      },
      TranscriptionPost: {
        type: "object",
        required: ["token", "transcript"],
        properties: {
          token: { type: "string", description: "UUID token sesi" },
          transcript: { type: "string" },
          segments: {},
          meta: { type: "object" },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    ok: { type: "boolean" },
                    service: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/bootstrap": {
      post: {
        tags: ["Bootstrap"],
        summary: "Pastikan perusahaan demo ada",
        responses: {
          "200": {
            description: "Perusahaan sudah ada",
            content: {
              "application/json": {
                schema: { type: "object", additionalProperties: true },
              },
            },
          },
          "201": {
            description: "Perusahaan baru dibuat",
            content: {
              "application/json": {
                schema: { type: "object", additionalProperties: true },
              },
            },
          },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login (tanpa password)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginBody" },
            },
          },
        },
        responses: {
          "200": {
            description: "Token = user id",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginResponse" },
              },
            },
          },
          "400": {
            description: "Validasi gagal",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/users/me": {
      get: {
        tags: ["Users"],
        summary: "Profil saya",
        security: [{ UserId: [] }],
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
              },
            },
          },
          "401": { description: "Tanpa X-User-Id" },
          "404": { description: "User tidak ditemukan" },
        },
      },
      patch: {
        tags: ["Users"],
        summary: "Update profil",
        security: [{ UserId: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserPatch" },
            },
          },
        },
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
              },
            },
          },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/api/dashboard": {
      get: {
        tags: ["Dashboard"],
        summary: "Dashboard ringkasan",
        description: "Jika **X-User-Id** diset, greeting memakai nama user.",
        parameters: [
          {
            name: "X-User-Id",
            in: "header",
            required: false,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description: "Stats, pipeline, recent activity",
            content: {
              "application/json": {
                schema: { type: "object", additionalProperties: true },
              },
            },
          },
        },
      },
    },
    "/api/comparison": {
      get: {
        tags: ["Comparison"],
        summary: "Bandingkan kandidat untuk satu lowongan",
        parameters: [
          {
            name: "jobId",
            in: "query",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description: "Baris kandidat + rekomendasi",
            content: {
              "application/json": {
                schema: { type: "object", additionalProperties: true },
              },
            },
          },
          "400": { description: "jobId wajib" },
          "404": { description: "Job tidak ditemukan" },
        },
      },
    },
    "/api/companies": {
      get: {
        tags: ["Companies"],
        summary: "Daftar perusahaan",
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { type: "array", items: { type: "object" } },
              },
            },
          },
        },
      },
      post: {
        tags: ["Companies"],
        summary: "Buat perusahaan",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CompanyCreate" },
            },
          },
        },
        responses: {
          "201": { description: "Dibuat" },
        },
      },
    },
    "/api/jobs": {
      get: {
        tags: ["Jobs"],
        summary: "Daftar lowongan",
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { type: "array", items: { type: "object" } },
              },
            },
          },
        },
      },
      post: {
        tags: ["Jobs"],
        summary: "Buat lowongan",
        security: [{ UserId: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/JobCreate" },
            },
          },
        },
        responses: {
          "201": { description: "Dibuat" },
          "400": { description: "companyId & title wajib" },
          "401": { description: "Tanpa X-User-Id" },
          "403": { description: "Bukan role recruiter" },
        },
      },
    },
    "/api/jobs/{id}": {
      get: {
        tags: ["Jobs"],
        summary: "Detail lowongan",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": { description: "Job + company" },
          "404": { description: "Tidak ditemukan" },
        },
      },
      patch: {
        tags: ["Jobs"],
        summary: "Update lowongan",
        security: [{ UserId: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                additionalProperties: true,
                description: "JobPatch — field opsional",
              },
            },
          },
        },
        responses: {
          "200": { description: "Updated" },
          "401": { description: "Tanpa X-User-Id" },
          "403": { description: "Bukan role recruiter" },
          "404": { description: "Tidak ditemukan" },
        },
      },
    },
    "/api/sessions": {
      get: {
        tags: ["Sessions"],
        summary: "Daftar sesi (dengan job & company)",
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { type: "array", items: { type: "object" } },
              },
            },
          },
        },
      },
      post: {
        tags: ["Sessions"],
        summary: "Buat sesi + link wawancara",
        security: [{ UserId: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SessionCreate" },
            },
          },
        },
        responses: {
          "201": {
            description: "Sesi + interviewUrl",
            content: {
              "application/json": {
                schema: { type: "object", additionalProperties: true },
              },
            },
          },
          "400": { description: "jobApplicantId wajib" },
          "401": { description: "Tanpa X-User-Id" },
          "403": { description: "Bukan role recruiter" },
          "404": { description: "Lamaran tidak ditemukan" },
          "409": { description: "Sesi untuk lamaran ini sudah ada" },
        },
      },
    },
    "/api/sessions/{sessionId}/access-code": {
      post: {
        tags: ["AccessCode"],
        summary: "Generate akses code untuk session",
        parameters: [
          {
            name: "sessionId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "201": {
            description: "Akses code valid + mapping ke session",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AccessCodeResponse" },
              },
            },
          },
          "404": { description: "Session tidak ditemukan" },
        },
      },
    },
    "/api/access-codes/{id}": {
      get: {
        tags: ["AccessCode"],
        summary: "Validasi akses code",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Akses code valid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AccessCodeResponse" },
              },
            },
          },
          "404": { description: "Akses code tidak valid / expired" },
        },
      },
    },
    "/api/sessions/{sessionId}/results": {
      get: {
        tags: ["Sessions"],
        summary: "Detail hasil wawancara",
        parameters: [
          {
            name: "sessionId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": { description: "Transkrip, analisis, kompetensi" },
          "404": { description: "Sesi tidak ditemukan" },
        },
      },
    },
    "/api/agent/instructions/{token}": {
      get: {
        tags: ["Agent"],
        summary: "Instruksi & konteks untuk klien voice (publik via token)",
        parameters: [
          {
            name: "token",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": { description: "Konteks wawancara" },
          "404": { description: "Link tidak valid" },
        },
      },
    },
    "/api/agent/candidate/{candidateId}/redirect": {
      get: {
        tags: ["Agent"],
        summary: "Redirect ke halaman wawancara agent (HTTP 302)",
        description:
          "`candidateId` = `interview_sessions.id`. Mengembalikan **302** dengan header `Location` ke `{INTERVIEW_REDIRECT_BASE_URL}/interview/{token}` (env `INTERVIEW_REDIRECT_BASE_URL`, default `PUBLIC_APP_BASE_URL`). Wajib **X-User-Id**.",
        security: [{ UserId: [] }],
        parameters: [
          {
            name: "candidateId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "302": {
            description:
              "Redirect ke app — buka di browser atau ikuti header Location",
            headers: {
              Location: {
                schema: {
                  type: "string",
                  example:
                    "http://localhost:8080/interview/00000000-0000-4000-8000-000000000000",
                },
              },
            },
          },
          "401": { description: "Tanpa X-User-Id" },
          "404": { description: "Sesi tidak ditemukan" },
        },
      },
    },
    "/api/agent/instruction-set/{sessionId}": {
      get: {
        tags: ["Agent"],
        summary:
          "Instruction set + prompt untuk agent (by session / candidate row id)",
        description:
          "`sessionId` dapat berupa: " +
          "- `interview_sessions.id` (UUID, untuk internal/recruiter) ATAU " +
          "- `access_codes.session_code` (string pendek, dari akses code external). " +
          "Endpoint mengembalikan profil perusahaan, deskripsi pekerjaan, daftar pertanyaan (digabung ke `instruction`), dan prompt siap pakai untuk LLM/voice agent. " +
          "Untuk akses external, cukup kirim `sessionId` dari object akses code (validated di backend).",
        parameters: [
          {
            name: "sessionId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
          {
            name: "X-Internal-Token",
            in: "header",
            required: true,
            schema: { type: "string" },
            description:
              "Token internal untuk akses recruiter instruction-set (bukan X-User-Id)",
          },
          {
            name: "applicationId",
            in: "query",
            required: false,
            schema: { type: "string", format: "uuid" },
            description:
              "Opsional. Verifikasi bahwa applicationId terhubung ke sessionId yang diminta.",
          },
        ],
        responses: {
          "200": {
            description:
              "Struktur instruction-set: {id, instruction, job, company, jobUrl, companyLandingPage}",
            content: {
              "application/json": {
                schema: { type: "object", additionalProperties: true },
              },
            },
          },
          "401": { description: "Tanpa X-User-Id" },
          "404": { description: "Sesi tidak ditemukan" },
        },
      },
    },
    "/api/agent/transcriptions/{token}": {
      get: {
        tags: ["Agent"],
        summary: "Ambil transkrip untuk tampilan (DB atau eksternal)",
        parameters: [
          {
            name: "token",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": { description: "Transkrip / payload eksternal" },
          "404": { description: "Sesi tidak ditemukan" },
        },
      },
    },
    "/api/agent/transcriptions": {
      post: {
        tags: ["Agent"],
        summary: "Kirim transkrip + analisis stub",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TranscriptionPost" },
            },
          },
        },
        responses: {
          "201": { description: "Tersimpan; status sesi → completed" },
          "400": { description: "token & transcript wajib" },
          "404": { description: "Sesi tidak ditemukan" },
        },
      },
    },
    "/api/candidates": {
      get: {
        tags: ["Candidates"],
        summary: "Daftar kandidat / pipeline",
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { type: "array", items: { type: "object" } },
              },
            },
          },
        },
      },
    },
    "/api/applications": {
      post: {
        tags: ["Applications"],
        summary: "Create application untuk applicant saat apply job",
        security: [{ UserId: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["jobId"],
                properties: {
                  jobId: { type: "string", format: "uuid" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Application + session berhasil dibuat" },
          "401": { description: "Tanpa X-User-Id" },
          "403": { description: "Role user bukan applicant" },
        },
      },
    },
    "/api/applications/me": {
      get: {
        tags: ["Applications"],
        summary: "List application milik applicant login",
        security: [{ UserId: [] }],
        responses: {
          "200": { description: "Daftar application user" },
          "401": { description: "Tanpa X-User-Id" },
        },
      },
    },
    "/api/applications/{applicationId}": {
      get: {
        tags: ["Applications"],
        summary: "Detail application milik applicant login",
        security: [{ UserId: [] }],
        parameters: [
          {
            name: "applicationId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": { description: "Detail application" },
          "401": { description: "Tanpa X-User-Id" },
          "404": { description: "Application tidak ditemukan" },
        },
      },
    },
  },
} as const;
