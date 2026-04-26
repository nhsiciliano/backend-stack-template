import { Type, type Static } from '@sinclair/typebox'
import envSchema from 'env-schema'

const envSchemaDefinition = Type.Object({
  APP_NAME: Type.String({ default: 'Backend Stack Template' }),
  HOST: Type.String({ default: '0.0.0.0' }),
  PORT: Type.Number({ default: 3000 }),
  LOG_LEVEL: Type.Union(
    [
      Type.Literal('trace'),
      Type.Literal('debug'),
      Type.Literal('info'),
      Type.Literal('warn'),
      Type.Literal('error'),
      Type.Literal('fatal'),
    ],
    { default: 'info' },
  ),
  BODY_LIMIT_BYTES: Type.Number({ default: 1048576 }),
  RATE_LIMIT_MAX: Type.Number({ default: 300 }),
  RATE_LIMIT_WINDOW: Type.String({ default: '1 minute' }),
  ENABLE_SECURITY_HEADERS: Type.Boolean({ default: true }),
  ENABLE_API_DOCS: Type.Boolean({ default: true }),
  ENABLE_DEV_ROUTES: Type.Boolean({ default: true }),
  REQUIRE_DEV_ROUTE_AUTH: Type.Boolean({ default: true }),
  CORS_ORIGIN: Type.String({ default: 'http://localhost:3000' }),
  TRUSTED_ORIGINS: Type.Optional(Type.String()),
  DATABASE_URL: Type.String(),
  DIRECT_URL: Type.String(),
  BETTER_AUTH_SECRET: Type.String({ minLength: 32 }),
  BETTER_AUTH_URL: Type.String(),
  RESEND_API_KEY: Type.String(),
  EMAIL_FROM: Type.String(),
  GOOGLE_CLIENT_ID: Type.Optional(Type.String()),
  GOOGLE_CLIENT_SECRET: Type.Optional(Type.String()),
  MICROSOFT_CLIENT_ID: Type.Optional(Type.String()),
  MICROSOFT_CLIENT_SECRET: Type.Optional(Type.String()),
  MICROSOFT_TENANT_ID: Type.Optional(Type.String()),
  APPLE_CLIENT_ID: Type.Optional(Type.String()),
  APPLE_TEAM_ID: Type.Optional(Type.String()),
  APPLE_KEY_ID: Type.Optional(Type.String()),
  APPLE_PRIVATE_KEY: Type.Optional(Type.String()),
  APPLE_APP_BUNDLE_IDENTIFIER: Type.Optional(Type.String()),
  SUPABASE_URL: Type.String(),
  SUPABASE_ANON_KEY: Type.String(),
  SUPABASE_SERVICE_ROLE_KEY: Type.String(),
  SUPABASE_UPLOADS_BUCKET: Type.String({ default: 'uploads' }),
  REDIS_URL: Type.String(),
  WORKER_CONCURRENCY: Type.Number({ default: 1 }),
  JOB_ATTEMPTS: Type.Number({ default: 2 }),
  JOB_BACKOFF_DELAY_MS: Type.Number({ default: 1000 }),
  JOB_REMOVE_ON_COMPLETE: Type.Number({ default: 100 }),
  JOB_REMOVE_ON_FAIL: Type.Number({ default: 100 }),
  DLQ_REMOVE_ON_COMPLETE: Type.Number({ default: 500 }),
  DLQ_REMOVE_ON_FAIL: Type.Number({ default: 500 }),
  INTERNAL_API_KEY: Type.Optional(Type.String({ minLength: 32 })),
})

export type AppConfig = Static<typeof envSchemaDefinition>

export function loadConfig(): AppConfig {
  return envSchema<AppConfig>({
    schema: envSchemaDefinition,
    dotenv: true,
  })
}
