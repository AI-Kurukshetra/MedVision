# Setup Checklist

Use this before asking Codex to generate app code.

## Accounts and tools

- GitHub repository created and cloned locally
- Supabase project created
- Codex CLI authenticated with API key
- Vercel account ready
- Vercel connected to the GitHub repository
- Node.js installed locally
- Package manager chosen: `npm` unless there is a strong reason to use another
- Supabase CLI installed locally

## Required environment values

Collect these from Supabase project settings:

- `NEXT_PUBLIC_SUPABASE_URL= https://wjxfqcjpzuaamnohrehl.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqeGZxY2pwenVhYW1ub2hyZWhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NjU1MjksImV4cCI6MjA4OTA0MTUyOX0.WsF-9DpIxsLkLKV9uOkaKrYyNbxAEQlj0NOTyXb-Svs`
- `SUPABASE_PROJECT_ID = wjxfqcjpzuaamnohrehl`
- `SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqeGZxY2pwenVhYW1ub2hyZWhsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ2NTUyOSwiZXhwIjoyMDg5MDQxNTI5fQ.D99FZrg8PTGPNc_N9eHA0OOoL0oVZ6n8f8TOzgF9eVo`

Keep `SUPABASE_SERVICE_ROLE_KEY` server-only. Do not expose it in client code.

## Vercel project preparation

Prepare this before the final deployment step:

- create a Vercel project linked to the GitHub repository
- confirm the framework is detected as Next.js
- add the same environment variables in Vercel project settings
- keep `SUPABASE_SERVICE_ROLE_KEY` scoped to server-only usage in code
- plan to use preview deployments for each important milestone

## Local repo preparation

1. Open Codex CLI in the repository root.
2. Ask Codex to scaffold the Next.js application in the current folder.
3. Install Supabase client dependencies.
4. Create `.env.example`.
5. Create `.env.local` manually with real values.
6. Set up Supabase SSR utilities.
7. Run the local app once to verify the base setup.
8. Make the first deployable commit so Vercel can create an initial preview deployment.

## Supabase CLI preparation

1. Run `supabase login`
2. Run `supabase link --project-ref <your-project-id>`
3. Run `supabase init`

## Operating mode during the hackathon

- You act as operator.
- Codex acts as implementer.
- Every task should be small and specific.
- After each successful milestone, commit to git.

## Commit rhythm

Suggested commit sequence:

- `chore: scaffold next app`
- `chore: add supabase ssr setup`
- `feat: add schema and rls`
- `feat: add auth and profile bootstrap`
- `feat: add patient and study workflow`
- `feat: add viewer and reports`
- `feat: add analytics and demo polish`
- `chore: configure vercel deployment`
