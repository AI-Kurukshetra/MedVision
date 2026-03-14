# MedVision

AI-assisted cloud radiology workflow platform for underserved clinics, built with Next.js App Router and Supabase.

## Status

Phases 1 through 10 from `docs/04-implementation-phases.md` are implemented:

- public landing page
- auth + profile bootstrap
- patients and studies workflows
- image upload + viewer controls
- annotations + reporting
- audit logs + analytics + notifications
- AI report draft assistant

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure environment variables:

   ```bash
   cp .env.example .env.local
   ```

3. Fill these values in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` (for local dev use `http://localhost:3000`)
- `SUPABASE_PROJECT_ID`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)

4. Run app:

   ```bash
   npm run dev
   ```

5. Verify:

   ```bash
   npm run lint
   npm run build
   ```

## Supabase migrations

Schema and policies are under `supabase/migrations`:

- `20260314123000_initial_schema_and_rls.sql`
- `20260314123100_storage_policies.sql`

Seed data:

- `supabase/seed.sql`

## Phase 11 checklist (production deployment)

### Completed in codebase

- server-only handling for service role key
- Vercel-compatible Next.js App Router patterns
- auth callback route at `/auth/callback` for email confirmation links
- `NEXT_PUBLIC_SITE_URL` support for auth redirect generation
- production build passes (`npm run build`)

### Still manual in platforms

1. Vercel project setup
- import GitHub repo `AI-Kurukshetra/MedVision`
- framework preset: Next.js
- production branch: `main`

2. Vercel environment variables (Preview + Production)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `SUPABASE_PROJECT_ID`
- `SUPABASE_SERVICE_ROLE_KEY`

3. Supabase auth URL configuration
- Site URL: your production domain (for example `https://medvision.vercel.app`)
- Additional Redirect URLs:
  - `http://localhost:3000/auth/callback`
  - `https://<preview-domain>/auth/callback`
  - `https://<production-domain>/auth/callback`

4. Production deployment
- push `main` branch
- confirm Vercel production deployment succeeds

5. Smoke test on production URL
- open `/`
- sign up/sign in
- open `/dashboard`
- create patient
- create study
- upload image and open `/viewer/[studyId]`
- create annotation
- generate AI draft and finalize report
- check `/analytics` and `/admin/audit-logs` (admin user)

## Notes

- `.env*` files are ignored by git except `.env.example`.
- `docs/` is ignored for new files by `.gitignore`; existing tracked docs remain tracked.
