# Vercel Deployment Plan

This document defines how MedVision should be prepared and deployed on Vercel.

## Deployment target

- hosting platform: Vercel
- framework: Next.js App Router
- repo integration: GitHub
- backend services: Supabase only

## Deployment principles

- keep the architecture Vercel-native
- avoid custom servers
- keep secrets server-only
- rely on Vercel preview deployments during development
- use production deployment only after the preview build is verified

## Required Vercel project configuration

### Connect repository

1. Import the GitHub repository into Vercel.
2. Let Vercel detect the framework as Next.js.
3. Keep default build settings unless the project later requires a change.

### Environment variables

Add these in Vercel project settings for Preview and Production:

- `NEXT_PUBLIC_SUPABASE_URL= https://wjxfqcjpzuaamnohrehl.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqeGZxY2pwenVhYW1ub2hyZWhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NjU1MjksImV4cCI6MjA4OTA0MTUyOX0.WsF-9DpIxsLkLKV9uOkaKrYyNbxAEQlj0NOTyXb-Svs`
- `SUPABASE_PROJECT_ID = wjxfqcjpzuaamnohrehl`
- `SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqeGZxY2pwenVhYW1ub2hyZWhsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ2NTUyOSwiZXhwIjoyMDg5MDQxNTI5fQ.D99FZrg8PTGPNc_N9eHA0OOoL0oVZ6n8f8TOzgF9eVo`

Rules:

- `NEXT_PUBLIC_*` variables are safe for browser use
- `SUPABASE_SERVICE_ROLE_KEY` must only be used in server-only code
- do not reference server-only env vars from client components

## Supabase auth configuration for deployment

Before public testing, make sure Supabase auth settings include the deployed Vercel URLs.

Add:

- local URL for development
- Vercel preview URL pattern if needed during testing
- final production domain used for the demo

This is required so sign-in and auth callbacks work correctly on deployed environments.

## What the codebase should support

Codex should keep the project deployable by following these rules:

- use standard Next.js App Router patterns
- keep route handlers and server actions compatible with Vercel
- avoid filesystem assumptions that break on serverless deployment
- avoid long-running background processes
- keep uploads flowing through Supabase Storage, not local disk
- keep any service-role logic isolated to server-only modules

## Deployment workflow

### During development

1. Push a milestone branch or main branch commit to GitHub.
2. Wait for Vercel preview deployment.
3. Test auth, dashboard routes, and key forms on the preview URL.
4. Fix issues before merging or promoting.

### Before final demo

1. Merge stable code to main.
2. Confirm production env vars in Vercel.
3. Trigger or wait for production deployment.
4. Test the full demo flow on the production URL.

## Minimum smoke test on deployed URL

Run this after each important preview or production deployment:

1. open landing or login page
2. sign in successfully
3. navigate to dashboard
4. load patients list
5. load studies list
6. open one study
7. open viewer
8. save or view one report

## Codex prompt guidance for deployment-sensitive code

When a task may affect deployment, tell Codex explicitly:

```text
Keep this implementation compatible with Vercel deployment.
Do not expose server-only secrets to the client.
Prefer standard Next.js App Router patterns that work in preview and production deployments on Vercel.
```

## Manual operator checklist

- Vercel project linked to GitHub
- Preview and Production env vars added
- Supabase auth URLs updated
- latest preview deployment checked
- production deployment checked
- public demo URL saved
