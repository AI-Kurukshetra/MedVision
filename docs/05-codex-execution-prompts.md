# Codex Execution Prompts

Use these prompts one at a time. Do not merge them into one giant request.

## Prompt 1: Scaffold the app

```text
Create a new Next.js app in the current repository using:
- latest Next.js with App Router
- TypeScript
- ESLint
- Tailwind CSS
- src/ directory
- import alias @/*

Important constraints:
- scaffold in the current folder, not a nested folder
- do not add demo content
- keep the project minimal and clean
- production grade system
- UI should be looks good and professional

After scaffolding, show me:
1. what files were created
2. what commands I should run next
```

## Prompt 2: Build the landing page shell

```text
Build the public landing page for this project at `/`.

Requirements:
- make it feel like a serious healthcare workflow product, not a generic template
- include a hero section, workflow overview, feature grid, role-based benefits, and final CTA
- add clear actions for `Sign in` and `Get started`
- keep it responsive and visually strong on desktop and mobile
- keep it compatible with Vercel deployment
- do not build authenticated product features yet

Design direction:
- modern clinical product
- bold but restrained
- no generic purple SaaS styling
- align with the future dashboard visual language

After implementation, summarize the sections created and any assets or placeholder content still needed.
```

## Prompt 3: Install Supabase dependencies

```text
Install the minimum dependencies needed for a Next.js App Router project using current Supabase SSR-friendly patterns.

Requirements:
- install the Supabase client package
- install the Supabase SSR support package if needed by the current recommended setup
- keep the dependency list minimal

After installation, show exactly what was added and where it will be used.
```

## Prompt 4: Prepare environment files

```text
Create a `.env.example` file for this project.

Include:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_PROJECT_ID
- SUPABASE_SERVICE_ROLE_KEY

Do not include real values.
Also explain which values I should copy from the Supabase dashboard and which one must remain server-only.
```

## Prompt 5: Wire Supabase in Next.js

```text
Set up Supabase for Next.js App Router using SSR-friendly patterns.

Create:
- a browser client utility
- a server client utility
- middleware or auth session handling if required by the chosen setup

Requirements:
- use environment variables from `.env.local`
- keep the implementation minimal and current
- do not build any product features yet
- keep the setup compatible with Vercel deployment

After creating files, explain the purpose of each file.
```

## Prompt 6: Generate the database layer

```text
Create only the database layer for this project.

Generate:
1. a complete Supabase SQL migration
2. all enums
3. all tables
4. indexes
5. helper SQL functions for RLS checks
6. updated_at trigger function
7. RLS policies for all application tables
8. storage policy migration for the `study-images` bucket
9. a small seed SQL file for local development

Important:
- output files into standard Supabase migration structure
- do not generate frontend code yet
- before writing SQL, restate schema assumptions and resolve contradictions safely
- use the contract in `docs/03-database-and-rls.md`
```

## Prompt 7: Generate TypeScript DB types

```text
Set up typed database support for the app.

Requirements:
- create or document the exact command needed to generate TypeScript types from Supabase
- store the generated types in a centralized file
- update Supabase client utilities to use the generated database types

Do not build UI yet.
```

## Prompt 8: Build auth only

```text
Build only authentication and profile bootstrap.

Implement:
- sign up page
- sign in page
- sign out flow
- protected dashboard layout
- first-login flow that ensures a profile row exists

Requirements:
- use the existing Supabase SSR setup
- keep routes clean and typed
- do not build patients, studies, reports, or analytics yet
```

## Prompt 9: Build patient management

```text
Build patient management only.

Implement:
- patients list page
- patient search
- create patient flow
- edit patient flow
- patient detail page

Requirements:
- use RLS-safe queries
- keep forms simple and reliable
- add empty states and loading states
- do not build study creation yet
```

## Prompt 10: Build study management

```text
Build study management only.

Implement:
- studies list page
- create study flow
- assign patient
- assign radiologist and technician
- set priority and status
- study detail page
- radiologist worklist filters

Requirements:
- use typed Supabase queries
- do not build viewer or report editing yet
```

## Prompt 11: Build image upload and viewer

```text
Build image upload and viewer features only.

Implement:
- study image upload to Supabase Storage
- metadata persistence in `study_images`
- viewer page for a study
- zoom and pan
- brightness and contrast controls

Requirements:
- use the `study-images` private bucket
- follow the path convention from `docs/03-database-and-rls.md`
- do not build annotations or reports yet
```

## Prompt 12: Build annotations and reporting

```text
Build annotations and reporting only.

Implement:
- annotation create/read/update/delete flow
- report editor with findings, impression, recommendations
- save draft
- finalize report

Requirements:
- radiologist workflow first
- enforce role-based behavior through existing schema and RLS
- keep UI practical, not decorative
```

## Prompt 13: Build analytics and demo polish

```text
Build admin visibility and demo polish features.

Implement:
- audit log page
- analytics dashboard
- notification surface
- better loading, empty, and error states

Requirements:
- use real aggregated data where practical
- keep the dashboard easy to demo
```

## Prompt 14: Prepare Vercel deployment

```text
Prepare the project for Vercel deployment.

Implement or verify:
- no server-only secrets are imported into client components
- environment variable usage is consistent and documented
- auth redirect configuration is easy to wire for deployed domains
- README deployment steps include Vercel
- the project is ready for preview and production deployments

Do not add unnecessary infrastructure.
Explain any manual Vercel settings I still need to configure.
```

## Prompt 15: Add a differentiator

```text
Build one high-value differentiator feature.

Preferred order:
1. AI findings assistant
2. study comments / second opinion flow
3. equipment dashboard
4. image quality scoring

Pick the first one not already implemented.
Keep the implementation hackathon-practical and clearly demoable.
```
