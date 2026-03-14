# MedVision Docs

This folder contains the project plan for building the MedVision hackathon MVP with Codex CLI, Next.js, Supabase, and Vercel.

## Recommended reading order

1. [00-setup-checklist.md](/home/bacancy/Workspace/MedVision/docs/00-setup-checklist.md)
2. [01-product-plan.md](/home/bacancy/Workspace/MedVision/docs/01-product-plan.md)
3. [02-technical-architecture.md](/home/bacancy/Workspace/MedVision/docs/02-technical-architecture.md)
4. [03-database-and-rls.md](/home/bacancy/Workspace/MedVision/docs/03-database-and-rls.md)
5. [04-implementation-phases.md](/home/bacancy/Workspace/MedVision/docs/04-implementation-phases.md)
6. [05-codex-execution-prompts.md](/home/bacancy/Workspace/MedVision/docs/05-codex-execution-prompts.md)
7. [06-demo-runbook.md](/home/bacancy/Workspace/MedVision/docs/06-demo-runbook.md)
8. [07-vercel-deployment.md](/home/bacancy/Workspace/MedVision/docs/07-vercel-deployment.md)

## Goal

Build an AI-assisted cloud radiology workflow platform for underserved clinics.

The MVP should allow a user to:

- authenticate into an organization-scoped workspace
- create patients
- create studies
- upload study images
- review images in a viewer
- annotate findings
- draft and finalize reports
- track activity through audit logs
- view operational analytics
- optionally generate AI-assisted report suggestions

## Working principle

This project should be built in small, bounded Codex tasks. Avoid asking Codex to build the entire platform in one prompt.

## Deployment target

The primary deployment target is Vercel.

That means the app should be built with:

- standard Next.js App Router conventions
- environment variables managed in Vercel
- no custom long-running backend services
- server-only secrets isolated from client bundles
- preview deployments used for validation during the hackathon
