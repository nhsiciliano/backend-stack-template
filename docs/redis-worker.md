# Redis and Worker

BullMQ is configured in `src/lib/queue.ts`.

The API creates jobs through `src/modules/jobs/service.ts`.

The worker entrypoint is `src/worker.ts`.

## Run Locally

Start Redis, then run:

```bash
npm run dev
npm run dev:worker
```

## Production

Run API and worker as separate processes. Both need the same:

- `DATABASE_URL`
- `DIRECT_URL`
- `REDIS_URL`
- `BETTER_AUTH_SECRET`
- Supabase variables

Only the API needs public networking.

Tune worker throughput with `WORKER_CONCURRENCY`. Scale worker replicas horizontally before increasing concurrency for CPU-bound jobs.

Dead-letter queue operations are available through protected internal endpoints documented in `docs/scaling.md`.
