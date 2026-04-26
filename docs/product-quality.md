# Product Quality

The template includes baseline checks that should pass before merging changes.

## Commands

Run the full local quality gate:

```bash
npm run check
```

Individual commands:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
```

Apply formatting:

```bash
npm run format
```

## Tests

Tests use Vitest and live under `tests/**/*.test.ts`.

Current tests focus on pure, high-value primitives that do not require PostgreSQL or Redis:

- API key generation and hashing.
- RBAC role comparisons.
- Trusted origin construction.
- Queue job option generation.

## API Documentation

When `ENABLE_API_DOCS=true`, the API exposes:

- Swagger UI: `GET /docs`
- OpenAPI JSON: `GET /openapi.json`

Route schemas are the source of truth for generated docs.

## Continuous Integration

GitHub Actions runs the same checks on pushes to `main` and pull requests:

- `npm ci`
- `npm run prisma:generate`
- `npm run format:check`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
