# Technical Architecture

## Stack

- Frontend and full-stack app: Next.js App Router with TypeScript
- Database and auth: Supabase Postgres and Supabase Auth
- File storage: Supabase Storage
- Realtime updates: Supabase Realtime where useful
- Deployment: Vercel

## App structure

Recommended route structure:

```text
src/app/
  page.tsx
  (auth)/
    login/page.tsx
    signup/page.tsx
  (dashboard)/
    layout.tsx
    dashboard/page.tsx
    patients/page.tsx
    patients/new/page.tsx
    patients/[id]/page.tsx
    studies/page.tsx
    studies/new/page.tsx
    studies/[id]/page.tsx
    viewer/[studyId]/page.tsx
    reports/[id]/page.tsx
    analytics/page.tsx
    equipment/page.tsx
    admin/users/page.tsx
    admin/audit-logs/page.tsx
```

Recommended library structure:

```text
src/
  components/
    landing/
  lib/
    supabase/
    auth/
    db/
    actions/
    ai/
    utils/
  types/
```

## Architectural rules

- Use App Router only.
- Use TypeScript everywhere.
- Prefer server components for data fetching.
- Use server actions or route handlers for mutations.
- Do not bypass RLS from client code.
- Keep service-role usage minimal and server-only.
- Use Supabase SSR-friendly clients for browser and server.
- Keep the landing page mostly static and cache-friendly unless a dynamic element is necessary.

## Auth model

- Authentication uses Supabase Auth.
- User profile is stored in `public.profiles`.
- `profiles.id` equals `auth.users.id`.
- Each user belongs to exactly one organization for the hackathon.

## Multi-tenant model

Organization is the tenant boundary.

Every main data table includes `organization_id`.

All app queries must stay organization-scoped through RLS.

## Storage model

Use one private bucket:

- `study-images`

Suggested object path:

```text
org/{organization_id}/studies/{study_id}/{filename}
```

This keeps storage access control aligned with organization-based RLS.

## Landing page architecture

The public landing page should live at `/` and remain separate from authenticated dashboard routes.

Recommended landing page structure:

- hero section
- workflow overview
- feature highlights
- role-based value section
- screenshot or product preview strip
- CTA footer

Recommended component grouping:

```text
src/components/landing/
  hero.tsx
  workflow.tsx
  feature-grid.tsx
  role-benefits.tsx
  product-preview.tsx
  cta-banner.tsx
```

Landing page rules:

- prefer server-rendered static content
- no auth requirement for `/`
- primary CTAs should route to `/login` and `/signup`
- keep visuals aligned with the actual product UI so the public page and app feel like one system
- optimize for Vercel preview and production performance

## Viewer strategy

For hackathon speed, treat the viewer as an advanced image viewer rather than a true diagnostic DICOM workstation.

Support:

- standard image formats first
- annotation overlays stored as JSON
- adjustable viewport controls

If time allows, DICOM metadata parsing can be added later as a narrow enhancement.

## Realtime strategy

Use realtime only for features where it adds clear demo value:

- new comments
- study status updates
- notification badges

Do not make the whole app depend on realtime.

## Deployment model

- Vercel hosts the Next.js app
- Supabase hosts DB/Auth/Storage
- environment variables configured in Vercel before deployment
- GitHub pushes trigger preview and production deployments through Vercel

## Vercel-specific rules

- prefer standard Node-compatible Next.js features supported by Vercel
- avoid infrastructure that requires a custom always-on server
- keep heavy logic in efficient server actions or route handlers
- keep secrets in Vercel environment variables, never in checked-in files
- make sure protected server-only code does not leak service-role access to the client
- use preview deployments to validate auth, env vars, and route behavior before promoting to production

## Environment variable strategy

Environment variables will exist in two places:

- local `.env.local` for development
- Vercel project settings for preview and production

Minimum required variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_PROJECT_ID`
- `SUPABASE_SERVICE_ROLE_KEY`

Only `NEXT_PUBLIC_*` variables may be exposed client-side.

## Quality bar

The code should be:

- modular
- typed
- easy for Codex to extend
- good enough for demo use

It does not need enterprise-scale abstraction.
