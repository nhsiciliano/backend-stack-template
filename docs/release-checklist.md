# Release Checklist

Use this checklist before publishing a new version or deploying a generated backend.

## Local Verification

- Run `npm run prisma:generate` after schema changes.
- Run `npm run check` and confirm format, lint, typecheck, tests, and build pass.
- Run `npm audit` and document unresolved advisories with rationale.
- Confirm no secrets are committed in `.env`, logs, docs, or examples.

## Database

- Create migrations locally with `npm run prisma:migrate`.
- Review generated SQL before merging.
- Apply migrations in production with `npm run prisma:deploy` once per release.
- Do not run migrations independently from every worker replica.

## Production Environment

- Start from `.env.production.example`.
- Set `ENABLE_DEV_ROUTES=false`.
- Set `ENABLE_API_DOCS=false` unless docs are intentionally public or network-protected.
- Set `ENABLE_INTERNAL_ROUTES=false` unless internal operations are behind network-level protection.
- Generate strong values for `BETTER_AUTH_SECRET` and `INTERNAL_API_KEY` with `openssl rand -base64 32`.
- Verify `CORS_ORIGIN`, `TRUSTED_ORIGINS`, and `BETTER_AUTH_URL` match production domains.

## Smoke Tests

- Verify `GET /health` returns `200` with database and Redis checks passing.
- Verify auth endpoints are reachable under `/auth/*`.
- Enqueue a job with `POST /jobs/example` and confirm the worker processes it.
- If API docs are enabled, verify `GET /openapi.json` and `GET /docs`.
- If internal routes are enabled, verify they require `x-internal-api-key`.

## GitHub

- Open a pull request into `main`.
- Confirm GitHub Actions CI passes.
- Squash or merge only after review.
