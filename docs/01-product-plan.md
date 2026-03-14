# Product Plan

## Product statement

MedVision is an AI-assisted cloud radiology workflow platform for underserved clinics. It focuses on the imaging workflow from patient intake to scan review, reporting, collaboration, and admin visibility.

## Problem being solved

Small clinics often lack streamlined systems for:

- patient and study tracking
- centralized scan access
- radiologist workflow management
- fast reporting
- remote collaboration
- operational visibility

## Hackathon product position

Do not position this as a full PACS replacement.

Position it as:

**AI-assisted cloud radiology workflow for clinics with limited infrastructure.**

## Primary users

### Admin

- manages users and organization setup
- monitors activity and operations
- views audit and analytics dashboards

### Technician

- creates studies
- uploads scan images
- updates study status
- monitors equipment status

### Radiologist

- works from a review queue
- opens viewer
- adds annotations
- drafts and finalizes reports
- requests or provides second opinion comments

### Referring doctor

- views patient studies and final reports
- tracks case progress
- adds collaboration comments when needed

## Core MVP features

### 1. Authentication and RBAC

- sign up and sign in
- organization-aware access
- roles: `admin`, `radiologist`, `technician`, `doctor`
- protected routes

### 2. Public landing page

- polished public homepage at `/`
- clear value proposition for underserved clinics
- product workflow overview
- feature highlights
- role-based benefits
- call-to-action buttons for sign in and demo access
- Vercel-friendly static-first implementation where practical

### 3. Patient management

- create patient
- edit patient
- search patients
- patient detail page
- study and report timeline per patient

### 4. Study management

- create study
- assign patient
- set modality and body part
- set priority and status
- assign radiologist and technician
- view study details

### 5. Image upload and storage

- upload X-ray or demo image
- store file in Supabase Storage
- persist metadata in Postgres
- choose primary image for a study

### 6. Viewer and annotations

- open image viewer for a study
- zoom and pan
- brightness and contrast controls
- create annotation markers and notes
- save annotations

### 7. Reporting workflow

- draft report
- structured sections: findings, impression, recommendations
- AI summary field
- finalize report

### 8. Worklist

- pending studies
- urgent studies
- assigned studies
- status-based filters

### 9. Audit logs

- log key system activity
- show entity, action, user, and time

### 10. Analytics

- studies created today
- pending reports
- average turnaround time
- study count by status
- study count by priority

## Landing page plan

The landing page is not just decoration. It should support the demo, the product pitch, and the deployed Vercel URL.

### Landing page goals

- communicate the problem quickly
- make the product look real before sign-in
- explain the workflow in one scroll
- give judges a clean entry point on the public URL
- provide clear actions for `Sign in` and `Open demo`

### Recommended sections

1. Hero with strong headline, subcopy, and CTA
2. Problem statement focused on underserved clinics
3. Workflow strip: upload, review, annotate, report
4. Feature grid for patient management, viewer, reporting, analytics, AI assist
5. Role-based value section for admin, technician, radiologist, doctor
6. Product screenshot or UI preview section
7. Trust and deployment section highlighting cloud-native workflow
8. Final CTA

### Design direction

- clinical and modern, not generic SaaS blue-purple
- use a strong visual system with purposeful typography
- show product screenshots or styled mock panels
- keep mobile layout first-class
- keep page fast and simple enough for Vercel preview deployments

### Content rules

- do not overclaim medical compliance
- do not say the platform replaces full hospital PACS infrastructure
- emphasize workflow speed, accessibility, and operational visibility
- keep copy aligned with the hackathon MVP you actually built

## Demo differentiators

These are not required for the earliest milestone, but they add strong demo value.

### AI findings assistant

- suggested findings
- suggested impression
- abnormality flag
- confidence score

### Image quality scoring

- quality score
- quality notes
- retake recommendation

### Collaboration

- study comments
- second opinion requests
- shared review trail

### Equipment dashboard

- status badges
- last sync
- last calibration
- maintenance due

## Explicit non-goals for the hackathon

- real imaging hardware integration
- full DICOM ingestion pipeline
- HL7 or FHIR integrations
- billing and insurance
- real HIPAA compliance program
- native mobile app
- predictive maintenance ML
- advanced PACS interoperability

## Success criteria

The MVP is successful if a demo can show this sequence end to end:

1. Judge or user lands on a polished public homepage.
2. Admin signs in.
3. Admin or technician creates a patient.
4. Technician creates a study and uploads an image.
5. Study appears in the radiologist worklist.
6. Radiologist opens the viewer and adds annotations.
7. Radiologist generates or edits a report.
8. Report is finalized.
9. Admin views audit logs and analytics.
