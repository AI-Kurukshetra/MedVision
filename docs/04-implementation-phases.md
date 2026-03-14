# Implementation Phases

This is the recommended build order. Each phase should end in a working checkpoint and a git commit.

## Phase 1: App foundation

Goal: make the repo runnable.

Tasks:

- scaffold Next.js app in current repo
- install Supabase dependencies
- create `.env.example`
- set up browser and server Supabase clients
- set up auth middleware if needed
- confirm local dev server runs
- ensure the app can build cleanly for Vercel

Definition of done:

- app starts locally
- env file shape is documented
- Supabase client utilities exist
- `next build` is expected to pass without deployment-specific hacks

## Phase 2: Public landing page

Goal: make the deployed URL useful before sign-in.

Tasks:

- build a polished landing page at `/`
- add hero, workflow, features, and CTA sections
- connect CTAs to auth routes
- keep the page responsive and Vercel-friendly
- align visual language with the in-app dashboard direction

Definition of done:

- public homepage looks intentional on desktop and mobile
- sign-in and sign-up routes are reachable from the landing page
- page is suitable as the demo entry URL

## Phase 3: Database and security

Goal: lock the data model first.

Tasks:

- generate initial SQL migration
- create enums
- create all tables
- create indexes
- add helper RLS functions
- add updated-at trigger
- enable RLS on all exposed tables
- add storage policies
- generate seed file

Definition of done:

- migration applies successfully
- schema is typed and consistent
- RLS is enabled everywhere needed

## Phase 4: Auth and profile bootstrap

Goal: users can enter the app safely.

Tasks:

- sign up page
- sign in page
- sign out flow
- protected dashboard layout
- first-login profile bootstrap
- organization-aware session handling

Definition of done:

- user can sign up
- user can sign in
- user can reach protected routes
- profile row exists after onboarding

## Phase 5: Patient management

Goal: establish the first core business entity.

Tasks:

- patients list page
- search and filters
- create patient form
- edit patient flow
- patient detail page
- study timeline section

Definition of done:

- patient CRUD works
- patient detail page is usable

## Phase 6: Study workflow

Goal: connect patients to imaging workflow.

Tasks:

- studies list page
- create study form
- assign patient and staff
- set priority and status
- study detail page
- study worklist filters

Definition of done:

- study CRUD works
- study list and detail pages are functional

## Phase 7: Image upload and viewer

Goal: make the product visually real.

Tasks:

- create storage bucket integration
- upload study images
- persist image metadata
- build viewer page
- support zoom and pan
- add brightness and contrast controls

Definition of done:

- image upload works
- uploaded image can be opened in viewer

## Phase 8: Annotations and reports

Goal: complete the radiologist workflow.

Tasks:

- save annotation overlays
- build report editor
- structured findings/impression/recommendations
- save draft
- finalize report

Definition of done:

- annotations persist
- report can be drafted and finalized

## Phase 9: Audit, analytics, and polish

Goal: improve admin visibility and demo quality.

Tasks:

- log critical actions
- audit log page
- analytics dashboard
- notifications UI
- improved empty states and loading states
- validate preview deployment on Vercel

Definition of done:

- admin can inspect activity
- dashboard has meaningful KPI cards
- preview deployment is usable with correct environment variables

## Phase 10: Demo differentiators

Goal: add high-value demo features if time remains.

Tasks:

- AI findings assistant
- AI-generated report draft
- study comments and second opinion workflow
- equipment dashboard
- quality scoring

Definition of done:

- at least one differentiator is demo-ready

## Phase 11: Production deployment for demo

Goal: have a stable public demo URL on Vercel.

Tasks:

- configure Vercel environment variables for production
- verify Supabase auth redirect URLs match deployed domain
- trigger a production deployment from the main branch
- smoke test auth, dashboard, uploads, and reporting on the deployed app

Definition of done:

- Vercel production deployment succeeds
- core demo flow works on the public URL

## Stop rules

If time is short, stop after Phase 8 and stabilize. That is already a complete demo story.
