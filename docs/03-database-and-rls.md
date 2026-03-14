# Database and RLS Plan

This is the implementation contract for the database layer. Codex should build this before frontend features.

## Design rules

- single organization per user
- `profiles.id = auth.users.id`
- every main table is organization-scoped
- RLS enabled on all exposed application tables
- helper SQL functions used to keep policies readable

## Enums

```sql
create type public.app_role as enum (
  'admin',
  'radiologist',
  'technician',
  'doctor'
);

create type public.study_priority as enum (
  'low',
  'normal',
  'urgent'
);

create type public.study_status as enum (
  'draft',
  'uploaded',
  'under_review',
  'reported',
  'completed',
  'archived'
);

create type public.report_status as enum (
  'draft',
  'final'
);

create type public.annotation_type as enum (
  'point',
  'rect',
  'line',
  'text',
  'freehand'
);

create type public.comment_type as enum (
  'general',
  'second_opinion',
  'ai_note'
);

create type public.equipment_status as enum (
  'online',
  'offline',
  'maintenance'
);

create type public.notification_type as enum (
  'info',
  'warning',
  'success',
  'error'
);

create type public.audit_action as enum (
  'create',
  'update',
  'delete',
  'view',
  'upload',
  'download',
  'finalize',
  'assign',
  'login'
);
```

## Tables

### organizations

- `id uuid primary key default gen_random_uuid()`
- `name text not null`
- `slug text not null unique`
- `created_at timestamptz not null default now()`

### profiles

- `id uuid primary key references auth.users(id) on delete cascade`
- `organization_id uuid not null references public.organizations(id) on delete restrict`
- `full_name text not null`
- `email text not null`
- `role public.app_role not null default 'doctor'`
- `avatar_url text`
- `is_active boolean not null default true`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `unique (organization_id, email)`

### patients

- `id uuid primary key default gen_random_uuid()`
- `organization_id uuid not null references public.organizations(id) on delete restrict`
- `patient_code text not null`
- `full_name text not null`
- `dob date`
- `gender text`
- `phone text`
- `email text`
- `address text`
- `medical_history text`
- `created_by uuid references public.profiles(id) on delete set null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `unique (organization_id, patient_code)`

### studies

- `id uuid primary key default gen_random_uuid()`
- `organization_id uuid not null references public.organizations(id) on delete restrict`
- `patient_id uuid not null references public.patients(id) on delete cascade`
- `study_code text not null`
- `modality text not null default 'xray'`
- `body_part text`
- `priority public.study_priority not null default 'normal'`
- `status public.study_status not null default 'draft'`
- `ordered_by text`
- `assigned_radiologist_id uuid references public.profiles(id) on delete set null`
- `technician_id uuid references public.profiles(id) on delete set null`
- `notes text`
- `study_date timestamptz not null default now()`
- `created_by uuid references public.profiles(id) on delete set null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `unique (organization_id, study_code)`

### study_images

- `id uuid primary key default gen_random_uuid()`
- `organization_id uuid not null references public.organizations(id) on delete restrict`
- `study_id uuid not null references public.studies(id) on delete cascade`
- `storage_path text not null unique`
- `file_name text not null`
- `mime_type text not null`
- `file_size bigint`
- `width integer`
- `height integer`
- `is_primary boolean not null default false`
- `uploaded_by uuid references public.profiles(id) on delete set null`
- `created_at timestamptz not null default now()`

### annotations

- `id uuid primary key default gen_random_uuid()`
- `organization_id uuid not null references public.organizations(id) on delete restrict`
- `study_id uuid not null references public.studies(id) on delete cascade`
- `study_image_id uuid references public.study_images(id) on delete cascade`
- `created_by uuid not null references public.profiles(id) on delete cascade`
- `type public.annotation_type not null`
- `data jsonb not null`
- `note text`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### reports

- `id uuid primary key default gen_random_uuid()`
- `organization_id uuid not null references public.organizations(id) on delete restrict`
- `study_id uuid not null unique references public.studies(id) on delete cascade`
- `radiologist_id uuid references public.profiles(id) on delete set null`
- `status public.report_status not null default 'draft'`
- `findings text`
- `impression text`
- `recommendations text`
- `ai_summary text`
- `finalized_at timestamptz`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### study_comments

- `id uuid primary key default gen_random_uuid()`
- `organization_id uuid not null references public.organizations(id) on delete restrict`
- `study_id uuid not null references public.studies(id) on delete cascade`
- `user_id uuid not null references public.profiles(id) on delete cascade`
- `comment_type public.comment_type not null default 'general'`
- `body text not null`
- `created_at timestamptz not null default now()`

### ai_analyses

- `id uuid primary key default gen_random_uuid()`
- `organization_id uuid not null references public.organizations(id) on delete restrict`
- `study_id uuid not null references public.studies(id) on delete cascade`
- `generated_by uuid references public.profiles(id) on delete set null`
- `quality_score numeric(5,2)`
- `quality_notes text`
- `abnormality_flag boolean not null default false`
- `suggested_findings text`
- `suggested_impression text`
- `confidence numeric(5,2)`
- `created_at timestamptz not null default now()`

### equipment

- `id uuid primary key default gen_random_uuid()`
- `organization_id uuid not null references public.organizations(id) on delete restrict`
- `name text not null`
- `model text`
- `serial_number text`
- `status public.equipment_status not null default 'online'`
- `last_sync_at timestamptz`
- `last_calibrated_at timestamptz`
- `usage_count integer not null default 0`
- `maintenance_due_at timestamptz`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `unique (organization_id, serial_number)`

### notifications

- `id uuid primary key default gen_random_uuid()`
- `organization_id uuid not null references public.organizations(id) on delete restrict`
- `user_id uuid not null references public.profiles(id) on delete cascade`
- `type public.notification_type not null default 'info'`
- `title text not null`
- `message text not null`
- `read boolean not null default false`
- `created_at timestamptz not null default now()`

### audit_logs

- `id uuid primary key default gen_random_uuid()`
- `organization_id uuid not null references public.organizations(id) on delete restrict`
- `user_id uuid references public.profiles(id) on delete set null`
- `entity_type text not null`
- `entity_id uuid`
- `action public.audit_action not null`
- `metadata jsonb not null default '{}'::jsonb`
- `created_at timestamptz not null default now()`

## Relationship summary

- one organization has many profiles
- one organization has many patients
- one organization has many studies
- one organization has many study images
- one organization has many annotations
- one organization has many reports
- one organization has many comments
- one organization has many AI analyses
- one organization has many equipment rows
- one organization has many notifications
- one organization has many audit logs
- one patient has many studies
- one study has many images
- one study has many annotations
- one study has one report in the MVP
- one study has many comments
- one study has many AI analyses

## Required indexes

Create indexes for:

- `profiles(organization_id)`
- `profiles(role)`
- `patients(organization_id)`
- `patients(organization_id, full_name)`
- `patients(organization_id, patient_code)`
- `studies(organization_id)`
- `studies(patient_id)`
- `studies(status)`
- `studies(priority)`
- `studies(assigned_radiologist_id)`
- `studies(study_date desc)`
- `study_images(organization_id)`
- `study_images(study_id)`
- `annotations(organization_id)`
- `annotations(study_id)`
- `annotations(study_image_id)`
- `reports(organization_id)`
- `reports(study_id)`
- `reports(radiologist_id)`
- `study_comments(organization_id)`
- `study_comments(study_id)`
- `ai_analyses(organization_id)`
- `ai_analyses(study_id)`
- `equipment(organization_id)`
- `notifications(user_id)`
- `audit_logs(organization_id)`
- `audit_logs(entity_type, entity_id)`

## Helper SQL functions

Codex should generate:

- `public.current_profile()`
- `public.current_organization_id()`
- `public.current_user_role()`
- `public.is_org_member(target_org uuid)`
- `public.has_role(allowed_roles public.app_role[])`
- `public.set_updated_at()`

These functions should be used to simplify RLS policies.

## Trigger plan

Attach `set_updated_at()` to:

- `profiles`
- `patients`
- `studies`
- `annotations`
- `reports`
- `equipment`

## RLS rules

### organizations

- org members can read their own organization
- only org admins can update their organization

### profiles

- org members can read profiles in their org
- users can update their own profile
- admins can update profiles in their org

### patients

- all org members can read patients
- admins, technicians, and doctors can insert and update patients
- admins can delete patients

### studies

- all org members can read studies
- admins, technicians, and doctors can insert studies
- admins, technicians, and radiologists can update studies
- admins can delete studies

### study_images

- all org members can read image metadata
- admins, technicians, and radiologists can insert image metadata
- admins and technicians can update or delete image metadata

### annotations

- all org members can read annotations
- admins, radiologists, and doctors can insert annotations
- only creator or admin can update or delete annotations

### reports

- all org members can read reports
- admins and radiologists can insert reports
- admin or report radiologist can update reports
- admins can delete reports

### study_comments

- all org members can read comments
- any org member can insert their own comment
- comment creator or admin can delete comment

### ai_analyses

- all org members can read analyses
- admins and radiologists can insert analyses
- admins can delete analyses

### equipment

- all org members can read equipment
- admins and technicians can insert and update equipment
- admins can delete equipment

### notifications

- user can read their own notifications
- user can update their own notifications

### audit_logs

- all org members can read audit logs
- org member can insert audit logs for self or system-null user
- admins can delete audit logs

## Storage RLS plan

Use a private bucket named `study-images`.

Object path convention:

```text
org/{organization_id}/studies/{study_id}/{filename}
```

Storage rules:

- org members can read files within their organization prefix
- admins, technicians, and radiologists can upload files within their organization prefix
- admins and technicians can delete files within their organization prefix

## Migration deliverables

Codex should generate:

1. complete schema migration
2. helper functions for RLS
3. updated-at trigger function
4. RLS policies for all tables
5. storage policy migration
6. seed SQL for local development
