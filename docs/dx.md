# Developer Experience

This template is optimized for creating production-ready backend projects quickly.

## One-command Local Setup

```bash
npm run setup:local
```

This command installs dependencies, starts local infrastructure, generates the Prisma client, and applies local migrations.

## Local Infrastructure

Start PostgreSQL and Redis:

```bash
npm run dev:services
```

Stop local infrastructure:

```bash
npm run dev:services:down
```

Services exposed locally:

- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

## Generate A Module

```bash
npm run generate:module -- products
```

This creates:

- `src/modules/products/service.ts`
- `src/modules/products/routes.ts`

It also registers the module in `src/routes.ts`.

Generated endpoint:

```http
GET /products/status
```

## Recommended Flow

```bash
npm run setup:local
npm run generate:module -- products
npm run dev
```

Run the worker separately when testing queues:

```bash
npm run dev:worker
```

## Production Migration Flow

Create migrations locally:

```bash
npm run prisma:migrate
```

Apply migrations in production:

```bash
npm run prisma:deploy
```
