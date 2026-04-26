# Backend Stack Template

A production-oriented backend template with Fastify, TypeScript, Better Auth, Prisma, Supabase, Redis/BullMQ, Resend, and Railway deployment defaults.

## Stack

- Fastify 5
- TypeScript
- Better Auth with Prisma adapter
- Prisma + PostgreSQL
- Supabase Postgres and Storage
- Resend email delivery
- Redis + BullMQ background jobs
- Railway-ready API and worker processes

## Quick Start

```bash
cp .env.example .env
npm run setup:local
npm run dev
```

Manual setup:

```bash
npm install
npm run dev:services
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Run the worker in a separate terminal:

```bash
npm run dev:worker
```

## Main Endpoints

- `GET /`
- `GET /health`
- `GET|POST|OPTIONS /auth/*`
- `POST /jobs/example`
- `GET /jobs/:id`
- `GET /dev/config` when `ENABLE_DEV_ROUTES=true`

## Generate Modules

```bash
npm run generate:module -- products
```

This creates `src/modules/products` and registers `GET /products/status` automatically.

See `docs/dx.md` for the recommended backend creation workflow.

## Auth

Better Auth is mounted at `/auth/*` and includes:

- email/password sign up and sign in
- required email verification
- password reset via Resend
- optional Google, Microsoft, and Apple social providers

Generate a strong auth secret:

```bash
openssl rand -base64 32
```

## Background Jobs

The API enqueues jobs into Redis with BullMQ. The worker processes the same queue with `npm run start:worker`.

## Production Hardening

- Database changes are managed with Prisma migrations. Use `npm run prisma:deploy` in production.
- `/health` checks PostgreSQL and Redis and returns `503` when a critical dependency is unavailable.
- Security headers, Redis-backed rate limiting, request IDs, CORS, and body size limits are configured from environment variables.

Example:

```bash
curl -X POST http://localhost:3000/jobs/example \
  -H 'content-type: application/json' \
  -d '{"message":"hello"}'
```

## Deployment

Use one Railway project with three services:

- API service: `npm run start`
- Worker service: `npm run start:worker`
- Redis service

Keep Supabase as the database and storage provider.

See `docs/railway.md` for details.
