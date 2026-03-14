# Demo Runbook

Use this as the demo script and final quality check.

## Demo goal

Show a complete clinical workflow, not isolated screens.

## Recommended demo storyline

### Step 1: Open the public landing page

- use the deployed Vercel URL
- explain the product in one sentence
- point out the workflow and feature summary
- use the CTA to move into sign-in

### Step 2: Admin enters the system

- sign in as admin
- land on the dashboard
- show high-level KPIs

### Step 3: Create a patient

- open patients page
- create a patient profile
- open patient detail page

### Step 4: Create a study

- create a new study for that patient
- set priority to urgent or normal
- assign a radiologist

### Step 5: Upload an image

- upload a demo X-ray image
- open study detail page
- confirm the image appears

### Step 6: Review in viewer

- open viewer
- zoom into the image
- adjust brightness/contrast
- create one or two annotations

### Step 7: Generate and finalize report

- open report editor
- use AI assist if available
- edit findings and impression
- finalize the report

### Step 8: Show collaboration or comments

- add a comment or second opinion request if implemented

### Step 9: Show admin visibility

- open audit logs
- show analytics dashboard
- show equipment dashboard if available

## Demo data checklist

Before demo day, make sure you have:

- at least one admin user
- at least one radiologist user
- at least one technician user
- one populated organization
- 3 to 5 patients
- 4 to 8 studies
- a few uploaded images
- at least one finalized report
- seeded audit logs

## Final pre-demo checklist

- auth works on a fresh browser session
- no broken routes
- environment variables set in Vercel
- Vercel production deployment is the same version you intend to demo
- latest Vercel preview deployment was checked before promoting to production
- Supabase storage bucket exists
- seeded demo data is present
- at least one urgent study exists
- at least one report draft exists
- viewer performs acceptably on the demo machine

## Fallback strategy

If any advanced feature is unstable:

- disable it from the main demo route
- keep the demo focused on patient -> study -> viewer -> report -> analytics

## Judge-facing one-line pitch

MedVision is an AI-assisted cloud radiology workflow platform that helps underserved clinics manage imaging studies, review scans, generate reports, and maintain operational visibility from a single web app.
