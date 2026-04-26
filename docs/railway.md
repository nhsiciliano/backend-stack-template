# Railway Deploy

## Topology

Use one Railway project with three services:

- API
- Worker
- Redis

Use Supabase for Postgres and Storage.

## API Service

Build command:

```bash
npm ci && npm run prisma:deploy && npm run build
```

Start command:

```bash
npm run start
```

Expose public networking for the API service.

## Worker Service

Build command:

```bash
npm ci && npm run build
```

Start command:

```bash
npm run start:worker
```

Do not expose public networking for the worker service.

Run `npm run prisma:deploy` from one release step or the API service only, not independently from every worker replica.

## Shared Variables

Set these on both API and worker:

- `APP_NAME`
- `HOST=0.0.0.0`
- `LOG_LEVEL=info`
- `BODY_LIMIT_BYTES=1048576`
- `RATE_LIMIT_MAX=300`
- `RATE_LIMIT_WINDOW=1 minute`
- `ENABLE_SECURITY_HEADERS=true`
- `ENABLE_API_DOCS=false`
- `ENABLE_DEV_ROUTES=false`
- `REQUIRE_DEV_ROUTE_AUTH=true`
- `DATABASE_URL`
- `DIRECT_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_UPLOADS_BUCKET`
- `REDIS_URL`
- `WORKER_CONCURRENCY`
- `JOB_ATTEMPTS`
- `JOB_BACKOFF_DELAY_MS`
- `JOB_REMOVE_ON_COMPLETE`
- `JOB_REMOVE_ON_FAIL`
- `DLQ_REMOVE_ON_COMPLETE`
- `DLQ_REMOVE_ON_FAIL`
- `INTERNAL_API_KEY`

Set CORS and social provider variables on the API service as needed.
