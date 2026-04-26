# Scaling Architecture

The template separates HTTP and worker runtime concerns so each process can scale independently.

## Runtime Entrypoints

- API: `src/server.ts` uses `buildHttpApp()`.
- Worker: `src/worker.ts` uses `buildWorkerApp()`.

`buildHttpApp()` registers HTTP-only concerns such as security headers, CORS, routes, and queue producers.

`buildWorkerApp()` only registers core dependencies such as config and Prisma. It does not mount routes, CORS, rate limiting, or API queue producers.

## Recommended Production Topology

- Scale API replicas based on HTTP traffic.
- Scale worker replicas based on queue depth and processing latency.
- Keep Redis and PostgreSQL as shared external services.
- Run Prisma migrations once per release, not once per worker replica.

## Worker Tuning

Use environment variables to tune worker throughput and queue retention:

- `WORKER_CONCURRENCY`: concurrent jobs per worker process.
- `JOB_ATTEMPTS`: retry attempts before a job is considered failed.
- `JOB_BACKOFF_DELAY_MS`: exponential backoff base delay.
- `JOB_REMOVE_ON_COMPLETE`: completed jobs kept in Redis.
- `JOB_REMOVE_ON_FAIL`: failed jobs kept in Redis.
- `DLQ_REMOVE_ON_COMPLETE`: completed dead-letter jobs kept in Redis.
- `DLQ_REMOVE_ON_FAIL`: failed dead-letter jobs kept in Redis.

Scale horizontally first by increasing worker replicas. Increase `WORKER_CONCURRENCY` when jobs are I/O-bound and downstream services can handle the extra pressure.

## Queue Abstraction

Queue helpers live in `src/lib/queue.ts`:

- `createQueue()`
- `createDeadLetterQueue()`
- `createQueueEvents()`
- `createJobOptions()`

Feature modules should define their own queue definitions and reuse these helpers instead of creating BullMQ primitives directly.

## Internal Queue Operations

Internal queue endpoints are protected with `x-internal-api-key` and require `INTERNAL_API_KEY` to be configured.

The same internal auth helper is used by dev routes and SaaS security bootstrap endpoints.

```bash
curl http://localhost:3000/internal/jobs/queues \
  -H "x-internal-api-key: $INTERNAL_API_KEY"
```

List dead-letter jobs:

```bash
curl http://localhost:3000/internal/jobs/dlq \
  -H "x-internal-api-key: $INTERNAL_API_KEY"
```

Retry a dead-letter job:

```bash
curl -X POST http://localhost:3000/internal/jobs/dlq/<dlq-job-id>/retry \
  -H "x-internal-api-key: $INTERNAL_API_KEY"
```

Do not expose internal endpoints publicly without network-level protection.
