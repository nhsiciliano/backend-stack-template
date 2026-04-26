# Auth

Better Auth is configured in `src/auth.ts` and mounted in `src/modules/auth/routes.ts` at `/auth/*`.

## Required Variables

- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `DATABASE_URL`
- `DIRECT_URL`
- `RESEND_API_KEY`
- `EMAIL_FROM`

## Email and Password

Email/password auth is enabled with:

- email verification required
- no automatic sign-in before verification
- minimum password length of 12
- password reset token expiry of 30 minutes
- session revocation on password reset

## Social Providers

Social auth is optional. Providers are only enabled when their env vars are set.

- Google: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- Microsoft: `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_TENANT_ID`
- Apple: `APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY`

## Trusted Origins

Set `TRUSTED_ORIGINS` as a comma-separated list of client origins.
