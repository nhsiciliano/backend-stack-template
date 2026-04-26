# Backend Stack Template

Production-ready backend starter for building SaaS APIs quickly, safely, and with room to scale.

Plantilla de backend lista para producción para crear APIs SaaS rápido, con seguridad y capacidad de escalar.

## English

### What This Is

Backend Stack Template is a pragmatic Fastify + TypeScript foundation for teams that want to ship backend products without rebuilding the same infrastructure every time.

It includes authentication, PostgreSQL, background jobs, email, storage, API documentation, CI, local infrastructure, SaaS primitives, and production hardening defaults.

### Who It Is For

- Founders building SaaS products and MVPs.
- Agencies that need to start client backends fast.
- Developers who want a clean backend foundation without adopting a heavy framework.
- Teams that need API + worker separation from day one.

### What You Get

- Fastify 5 API with strict TypeScript.
- Better Auth with email/password, email verification, password reset, and optional social providers.
- Prisma + PostgreSQL with migration-based production workflow.
- Supabase-ready Postgres and Storage integration.
- Redis + BullMQ background jobs with worker scaling and DLQ operations.
- Organization, membership, RBAC helper, API key, and audit-log foundations.
- Security headers, Redis-backed rate limiting, request IDs, CORS, body limits, and protected internal routes.
- OpenAPI JSON and Swagger UI generated from route schemas.
- Docker Compose for local PostgreSQL and Redis.
- Module generator for creating new backend features quickly.
- ESLint, Prettier, Vitest, TypeScript checks, build checks, and GitHub Actions CI.
- Railway deployment guidance for API, worker, and Redis services.

### Architecture

```text
Client / App
    |
    v
Fastify API ── PostgreSQL / Prisma
    |
    v
Redis / BullMQ ── Worker Process
    |
    v
External services: Resend, Supabase Storage, Social OAuth providers
```

API and worker runtimes are separated:

- API entrypoint: `src/server.ts`
- Worker entrypoint: `src/worker.ts`
- HTTP app builder: `buildHttpApp()`
- Worker app builder: `buildWorkerApp()`

### Quick Start

```bash
cp .env.example .env
npm run setup:local
npm run dev
```

Run the worker in another terminal:

```bash
npm run dev:worker
```

Manual setup:

```bash
npm install
npm run dev:services
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

### Generate A Module

```bash
npm run generate:module -- products
```

This creates `src/modules/products` and automatically registers:

```http
GET /products/status
```

See `docs/dx.md` for the backend creation workflow.

### Main Endpoints

- `GET /`
- `GET /health`
- `GET /docs` when `ENABLE_API_DOCS=true`
- `GET /openapi.json` when `ENABLE_API_DOCS=true`
- `GET|POST|OPTIONS /auth/*`
- `POST /jobs/example`
- `GET /jobs/:id`
- `GET /dev/config` when `ENABLE_DEV_ROUTES=true`

Internal operations are available only when `ENABLE_INTERNAL_ROUTES=true` and require `x-internal-api-key`.

### Quality Gate

```bash
npm run check
```

This runs formatting checks, linting, TypeScript checks, tests, and build.

See `docs/product-quality.md` for details.

### Production Readiness

- Use `.env.production.example` as the production environment baseline.
- Use `npm run prisma:deploy` for production migrations.
- Keep `ENABLE_DEV_ROUTES=false` in production.
- Keep `ENABLE_API_DOCS=false` unless docs are intentionally public or network-protected.
- Keep `ENABLE_INTERNAL_ROUTES=false` unless internal operations are behind network-level protection.
- Run API and worker as separate processes.
- Scale API replicas for HTTP traffic and worker replicas for queue throughput.

See:

- `docs/security-saas.md`
- `docs/scaling.md`
- `docs/release-checklist.md`
- `docs/railway.md`

## Español

### Qué Es

Backend Stack Template es una base pragmática con Fastify + TypeScript para equipos que quieren lanzar productos backend sin reconstruir la misma infraestructura en cada proyecto.

Incluye autenticación, PostgreSQL, jobs en background, email, storage, documentación de API, CI, infraestructura local, fundamentos SaaS y defaults orientados a producción.

### Para Quién Es

- Founders creando SaaS y MVPs.
- Agencias que necesitan iniciar backends de clientes rápidamente.
- Desarrolladores que quieren una base limpia sin adoptar un framework pesado.
- Equipos que necesitan separar API y workers desde el primer día.

### Qué Incluye

- API con Fastify 5 y TypeScript estricto.
- Better Auth con email/password, verificación de email, reset de password y proveedores sociales opcionales.
- Prisma + PostgreSQL con flujo de migraciones para producción.
- Integración preparada para Supabase Postgres y Storage.
- Redis + BullMQ para jobs en background, workers escalables y DLQ.
- Bases para organizaciones, membresías, RBAC, API keys y audit logs.
- Security headers, rate limiting con Redis, request IDs, CORS, límites de body y rutas internas protegidas.
- OpenAPI JSON y Swagger UI generados desde los schemas de rutas.
- Docker Compose para PostgreSQL y Redis local.
- Generador de módulos para crear features backend rápidamente.
- ESLint, Prettier, Vitest, typecheck, build check y CI con GitHub Actions.
- Guía de deploy en Railway para API, worker y Redis.

### Arquitectura

```text
Cliente / App
    |
    v
Fastify API ── PostgreSQL / Prisma
    |
    v
Redis / BullMQ ── Worker Process
    |
    v
Servicios externos: Resend, Supabase Storage, proveedores OAuth
```

La API y el worker están separados:

- Entrada API: `src/server.ts`
- Entrada worker: `src/worker.ts`
- Builder HTTP: `buildHttpApp()`
- Builder worker: `buildWorkerApp()`

### Inicio Rápido

```bash
cp .env.example .env
npm run setup:local
npm run dev
```

Ejecuta el worker en otra terminal:

```bash
npm run dev:worker
```

Setup manual:

```bash
npm install
npm run dev:services
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

### Generar Un Módulo

```bash
npm run generate:module -- products
```

Esto crea `src/modules/products` y registra automáticamente:

```http
GET /products/status
```

Ver `docs/dx.md` para el flujo recomendado de creación de backends.

### Endpoints Principales

- `GET /`
- `GET /health`
- `GET /docs` cuando `ENABLE_API_DOCS=true`
- `GET /openapi.json` cuando `ENABLE_API_DOCS=true`
- `GET|POST|OPTIONS /auth/*`
- `POST /jobs/example`
- `GET /jobs/:id`
- `GET /dev/config` cuando `ENABLE_DEV_ROUTES=true`

Las operaciones internas solo están disponibles cuando `ENABLE_INTERNAL_ROUTES=true` y requieren `x-internal-api-key`.

### Calidad

```bash
npm run check
```

Este comando ejecuta formato, lint, typecheck, tests y build.

Ver `docs/product-quality.md` para más detalles.

### Producción

- Usa `.env.production.example` como base para variables de producción.
- Usa `npm run prisma:deploy` para aplicar migraciones en producción.
- Mantén `ENABLE_DEV_ROUTES=false` en producción.
- Mantén `ENABLE_API_DOCS=false` salvo que la documentación sea pública intencionalmente o esté protegida por red.
- Mantén `ENABLE_INTERNAL_ROUTES=false` salvo que las operaciones internas estén protegidas a nivel de red.
- Ejecuta API y worker como procesos separados.
- Escala réplicas de API para tráfico HTTP y réplicas de worker para throughput de colas.

Ver:

- `docs/security-saas.md`
- `docs/scaling.md`
- `docs/release-checklist.md`
- `docs/railway.md`

## License

MIT
