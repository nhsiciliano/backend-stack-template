# Supabase

This template uses Supabase for PostgreSQL and optional private file storage.

## Variables

- `DATABASE_URL`
- `DIRECT_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_UPLOADS_BUCKET=uploads`

## Storage

The included migration creates a private `uploads` bucket.

Apply Supabase migrations with the Supabase CLI if you use Supabase-managed migrations.

The admin client lives in `src/lib/supabase.ts` and uses the service role key. Never expose that key to the frontend.
