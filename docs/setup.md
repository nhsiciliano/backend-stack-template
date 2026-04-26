# Local Setup

## Requirements

- Node.js 20+
- PostgreSQL or Supabase Postgres
- Redis
- Resend API key for email flows

## Install

Fast path:

```bash
cp .env.example .env
npm run setup:local
```

Manual path:

```bash
npm install
cp .env.example .env
npm run dev:services
```

Fill in required values in `.env`.

## Database

Generate Prisma client:

```bash
npm run prisma:generate
```

Apply the schema:

```bash
npm run prisma:migrate
```

Deploy migrations in production:

```bash
npm run prisma:deploy
```

## Run

API:

```bash
npm run dev
```

Worker:

```bash
npm run dev:worker
```

## Quality

```bash
npm run check
```
