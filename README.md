# MedVision

MedVision is an AI-assisted cloud radiology workflow platform for underserved clinics. This repository is being built in phases from the implementation plan in `docs/`.

## Phase 1 status

The app foundation is in place:

- Next.js App Router with TypeScript and Tailwind CSS
- Supabase SSR packages installed
- browser, server, and middleware Supabase helpers
- `.env.example` ready for local setup

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your local environment file:

   ```bash
   cp .env.example .env.local
   ```

3. Fill in values from your Supabase project:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_PROJECT_ID`
- `SUPABASE_SERVICE_ROLE_KEY`

`SUPABASE_SERVICE_ROLE_KEY` must remain server-only and should never be imported into client components.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Verify the production build:

   ```bash
   npm run build
   ```

## Project structure

```text
src/
  app/
  lib/
    supabase/
docs/
```

The build order and implementation contract live in these docs:

- `docs/04-implementation-phases.md`
- `docs/02-technical-architecture.md`
- `docs/03-database-and-rls.md`
