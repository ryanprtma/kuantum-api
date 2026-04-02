/**
 * OpenAPI 3.0 — Kuantum hiring / voice agent API
 */
export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Kuantum API',
    version: '1.0.0',
    description:
      'REST API untuk dashboard hiring, sesi wawancara voice agent, dan analisis kandidat. ' +
      'Autentikasi demo: kirim header **X-User-Id** dengan UUID yang dikembalikan dari `POST /api/auth/login` (bukan JWT).',
  },
  tags: [
    { name: 'Health', description: 'Kesehatan service' },
    { name: 'Bootstrap', description: 'Inisialisasi data demo' },
    { name: 'Auth', description: 'Login tanpa password' },
    { name: 'Users', description: 'Profil pengguna (header X-User-Id)' },
    { name: 'Dashboard', description: 'Ringkasan metrik' },
    { name: 'Comparison', description: 'Perbandingan kandidat per lowongan' },
    { name: 'Companies', description: 'Perusahaan' },
    { name: 'Jobs', description: 'Lowongan' },
    { name: 'Sessions', description: 'Sesi wawancara & hasil' },
    { name: 'Agent', description: 'Instruksi agen (token publik atau session + X-User-Id), transkrip' },
    { name: 'Candidates', description: 'Pipeline kandidat' },
  ],
  servers: [{ url: '/', description: 'Origin yang sama (dev: :3001, Docker UI: :8080)' }],
  components: {
    securitySchemes: {
      UserId: {
        type: 'apiKey',
        in: 'header',
        name: 'X-User-Id',
        description: 'UUID user dari response login',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: { error: { type: 'string' } },
      },
      LoginBody: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          token: { type: 'string', description: 'UUID — gunakan sebagai X-User-Id' },
          user: { type: 'object', additionalProperties: true },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string' },
          name: { type: 'string', nullable: true },
          role_title: { type: 'string', nullable: true },
          industry_preference: { type: 'string', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      UserPatch: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          roleTitle: { type: 'string' },
          industryPreference: { type: 'string' },
        },
      },
      CompanyCreate: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
          industry: { type: 'string', default: 'Technology' },
        },
      },
      JobCreate: {
        type: 'object',
        required: ['companyId', 'title'],
        properties: {
          companyId: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          department: { type: 'string' },
          employmentType: { type: 'string', example: 'full-time' },
          description: { type: 'string' },
          requirements: { type: 'array', items: { type: 'string' } },
          evaluationWeights: { type: 'object', additionalProperties: { type: 'number' } },
          priority: { type: 'string', enum: ['standard', 'high'] },
        },
      },
      SessionCreate: {
        type: 'object',
        required: ['jobId'],
        properties: {
          jobId: { type: 'string', format: 'uuid' },
          candidateName: { type: 'string' },
          candidateEmail: { type: 'string' },
          agentInstruction: { type: 'string' },
          agentPersona: { type: 'string' },
          interviewLengthMinutes: { type: 'number' },
          focusAreas: { type: 'array', items: { type: 'string' } },
          dynamicProbing: { type: 'boolean' },
          questions: { type: 'array', items: { type: 'string' } },
        },
      },
      TranscriptionPost: {
        type: 'object',
        required: ['token', 'transcript'],
        properties: {
          token: { type: 'string', description: 'UUID token sesi' },
          transcript: { type: 'string' },
          segments: {},
          meta: { type: 'object' },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean' },
                    service: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/bootstrap': {
      post: {
        tags: ['Bootstrap'],
        summary: 'Pastikan perusahaan demo ada',
        responses: {
          '200': {
            description: 'Perusahaan sudah ada',
            content: { 'application/json': { schema: { type: 'object', additionalProperties: true } } },
          },
          '201': {
            description: 'Perusahaan baru dibuat',
            content: { 'application/json': { schema: { type: 'object', additionalProperties: true } } },
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login (tanpa password)',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginBody' } } },
        },
        responses: {
          '200': {
            description: 'Token = user id',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' } } },
          },
          '400': {
            description: 'Validasi gagal',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/api/users/me': {
      get: {
        tags: ['Users'],
        summary: 'Profil saya',
        security: [{ UserId: [] }],
        responses: {
          '200': { content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          '401': { description: 'Tanpa X-User-Id' },
          '404': { description: 'User tidak ditemukan' },
        },
      },
      patch: {
        tags: ['Users'],
        summary: 'Update profil',
        security: [{ UserId: [] }],
        requestBody: {
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UserPatch' } } },
        },
        responses: {
          '200': { content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/api/dashboard': {
      get: {
        tags: ['Dashboard'],
        summary: 'Dashboard ringkasan',
        description: 'Jika **X-User-Id** diset, greeting memakai nama user.',
        parameters: [
          {
            name: 'X-User-Id',
            in: 'header',
            required: false,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '200': {
            description: 'Stats, pipeline, recent activity',
            content: { 'application/json': { schema: { type: 'object', additionalProperties: true } } },
          },
        },
      },
    },
    '/api/comparison': {
      get: {
        tags: ['Comparison'],
        summary: 'Bandingkan kandidat untuk satu lowongan',
        parameters: [
          {
            name: 'jobId',
            in: 'query',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '200': {
            description: 'Baris kandidat + rekomendasi',
            content: { 'application/json': { schema: { type: 'object', additionalProperties: true } } },
          },
          '400': { description: 'jobId wajib' },
          '404': { description: 'Job tidak ditemukan' },
        },
      },
    },
    '/api/companies': {
      get: {
        tags: ['Companies'],
        summary: 'Daftar perusahaan',
        responses: {
          '200': { content: { 'application/json': { schema: { type: 'array', items: { type: 'object' } } } } },
        },
      },
      post: {
        tags: ['Companies'],
        summary: 'Buat perusahaan',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CompanyCreate' } } },
        },
        responses: {
          '201': { description: 'Dibuat' },
        },
      },
    },
    '/api/jobs': {
      get: {
        tags: ['Jobs'],
        summary: 'Daftar lowongan',
        responses: {
          '200': { content: { 'application/json': { schema: { type: 'array', items: { type: 'object' } } } } },
        },
      },
      post: {
        tags: ['Jobs'],
        summary: 'Buat lowongan',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/JobCreate' } } },
        },
        responses: {
          '201': { description: 'Dibuat' },
          '400': { description: 'companyId & title wajib' },
        },
      },
    },
    '/api/jobs/{id}': {
      get: {
        tags: ['Jobs'],
        summary: 'Detail lowongan',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'Job + company' },
          '404': { description: 'Tidak ditemukan' },
        },
      },
      patch: {
        tags: ['Jobs'],
        summary: 'Update lowongan',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: { type: 'object', additionalProperties: true, description: 'JobPatch — field opsional' },
            },
          },
        },
        responses: {
          '200': { description: 'Updated' },
          '404': { description: 'Tidak ditemukan' },
        },
      },
    },
    '/api/sessions': {
      get: {
        tags: ['Sessions'],
        summary: 'Daftar sesi (dengan job & company)',
        responses: {
          '200': { content: { 'application/json': { schema: { type: 'array', items: { type: 'object' } } } } },
        },
      },
      post: {
        tags: ['Sessions'],
        summary: 'Buat sesi + link wawancara',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/SessionCreate' } } },
        },
        responses: {
          '201': {
            description: 'Sesi + interviewUrl',
            content: { 'application/json': { schema: { type: 'object', additionalProperties: true } } },
          },
          '400': { description: 'jobId wajib' },
          '404': { description: 'Job tidak ditemukan' },
        },
      },
    },
    '/api/sessions/{sessionId}/results': {
      get: {
        tags: ['Sessions'],
        summary: 'Detail hasil wawancara',
        parameters: [
          { name: 'sessionId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': { description: 'Transkrip, analisis, kompetensi' },
          '404': { description: 'Sesi tidak ditemukan' },
        },
      },
    },
    '/api/agent/instructions/{token}': {
      get: {
        tags: ['Agent'],
        summary: 'Instruksi & konteks untuk klien voice (publik via token)',
        parameters: [{ name: 'token', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'Konteks wawancara' },
          '404': { description: 'Link tidak valid' },
        },
      },
    },
    '/api/agent/candidate/{candidateId}/redirect': {
      get: {
        tags: ['Agent'],
        summary: 'Redirect ke halaman wawancara agent (HTTP 302)',
        description:
          '`candidateId` = `interview_sessions.id`. Mengembalikan **302** dengan header `Location` ke `{INTERVIEW_REDIRECT_BASE_URL}/interview/{token}` (env `INTERVIEW_REDIRECT_BASE_URL`, default `PUBLIC_APP_BASE_URL`). Wajib **X-User-Id**.',
        security: [{ UserId: [] }],
        parameters: [
          { name: 'candidateId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '302': {
            description: 'Redirect ke app — buka di browser atau ikuti header Location',
            headers: {
              Location: {
                schema: { type: 'string', example: 'http://localhost:8080/interview/00000000-0000-4000-8000-000000000000' },
              },
            },
          },
          '401': { description: 'Tanpa X-User-Id' },
          '404': { description: 'Sesi tidak ditemukan' },
        },
      },
    },
    '/api/agent/instruction-set/{sessionId}': {
      get: {
        tags: ['Agent'],
        summary: 'Instruction set + prompt untuk agent (by session / candidate row id)',
        description:
          '`sessionId` = `interview_sessions.id` (id yang sama dengan pipeline kandidat). ' +
          'Mengembalikan profil perusahaan, deskripsi pekerjaan, daftar pertanyaan, dan `generated.fullPrompt` siap pakai untuk LLM/voice agent. ' +
          'Akses hanya lewat token internal server (`EXTERNAL_INTERVIEW_INTERNAL_TOKEN`) via header **X-Internal-Token** (atau `X-Interview-Internal-Token` / `X-External-Interview-Internal-Token`).',
        parameters: [
          { name: 'sessionId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          {
            name: 'X-Internal-Token',
            in: 'header',
            required: true,
            schema: { type: 'string' },
            description: 'Token internal untuk akses recruiter instruction-set (bukan X-User-Id)',
          },
        ],
        responses: {
          '200': {
            description: 'Struktur konteks + generated.sections + generated.fullPrompt',
            content: { 'application/json': { schema: { type: 'object', additionalProperties: true } } },
          },
          '401': { description: 'Tanpa X-User-Id' },
          '404': { description: 'Sesi tidak ditemukan' },
        },
      },
    },
    '/api/agent/transcriptions/{token}': {
      get: {
        tags: ['Agent'],
        summary: 'Ambil transkrip untuk tampilan (DB atau eksternal)',
        parameters: [{ name: 'token', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'Transkrip / payload eksternal' },
          '404': { description: 'Sesi tidak ditemukan' },
        },
      },
    },
    '/api/agent/transcriptions': {
      post: {
        tags: ['Agent'],
        summary: 'Kirim transkrip + analisis stub',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/TranscriptionPost' } } },
        },
        responses: {
          '201': { description: 'Tersimpan; status sesi → completed' },
          '400': { description: 'token & transcript wajib' },
          '404': { description: 'Sesi tidak ditemukan' },
        },
      },
    },
    '/api/candidates': {
      get: {
        tags: ['Candidates'],
        summary: 'Daftar kandidat / pipeline',
        responses: {
          '200': { content: { 'application/json': { schema: { type: 'array', items: { type: 'object' } } } } },
        },
      },
    },
  },
} as const;
