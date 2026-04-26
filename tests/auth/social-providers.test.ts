import { describe, expect, it } from 'vitest'
import type { AppConfig } from '../../src/config/env.js'
import { buildTrustedOrigins } from '../../src/lib/auth/social-providers.js'

const baseConfig = {
  APP_NAME: 'Test App',
  HOST: '0.0.0.0',
  PORT: 3000,
  LOG_LEVEL: 'info',
  BODY_LIMIT_BYTES: 1048576,
  RATE_LIMIT_MAX: 300,
  RATE_LIMIT_WINDOW: '1 minute',
  ENABLE_SECURITY_HEADERS: true,
  ENABLE_DEV_ROUTES: true,
  REQUIRE_DEV_ROUTE_AUTH: true,
  CORS_ORIGIN: 'http://localhost:3000',
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/test',
  DIRECT_URL: 'postgresql://postgres:postgres@localhost:5432/test',
  BETTER_AUTH_SECRET: 'test-secret-at-least-32-characters',
  BETTER_AUTH_URL: 'http://localhost:3000',
  RESEND_API_KEY: 'test',
  EMAIL_FROM: 'Test <test@example.com>',
  SUPABASE_URL: 'http://localhost:54321',
  SUPABASE_ANON_KEY: 'anon',
  SUPABASE_SERVICE_ROLE_KEY: 'service',
  SUPABASE_UPLOADS_BUCKET: 'uploads',
  REDIS_URL: 'redis://localhost:6379',
  WORKER_CONCURRENCY: 1,
  JOB_ATTEMPTS: 2,
  JOB_BACKOFF_DELAY_MS: 1000,
  JOB_REMOVE_ON_COMPLETE: 100,
  JOB_REMOVE_ON_FAIL: 100,
  DLQ_REMOVE_ON_COMPLETE: 500,
  DLQ_REMOVE_ON_FAIL: 500,
} satisfies AppConfig

describe('trusted origins', () => {
  it('combines trusted origins and CORS origin without duplicates', () => {
    const origins = buildTrustedOrigins({
      ...baseConfig,
      TRUSTED_ORIGINS: 'http://localhost:5173, http://localhost:3000',
    })

    expect(origins).toEqual(['http://localhost:5173', 'http://localhost:3000'])
  })

  it('adds Apple origin when Apple sign in is configured', () => {
    const origins = buildTrustedOrigins({
      ...baseConfig,
      APPLE_CLIENT_ID: 'com.example.app',
    })

    expect(origins).toContain('https://appleid.apple.com')
  })
})
