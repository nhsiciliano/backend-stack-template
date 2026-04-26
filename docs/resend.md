# Resend

Resend is used for Better Auth verification and password reset emails.

## Variables

- `RESEND_API_KEY`
- `EMAIL_FROM`

For local testing, Resend's onboarding sender can be used. For production, verify your sending domain in Resend and use an address from that domain.

Email delivery is implemented in `src/lib/email.ts`.
