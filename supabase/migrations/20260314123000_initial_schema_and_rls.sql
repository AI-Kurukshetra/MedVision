create extension if not exists pgcrypto;

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

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete restrict,
  full_name text not null,
  email text not null,
  role public.app_role not null default 'doctor',
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, email)
);

create table public.patients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete restrict,
  patient_code text not null,
  full_name text not null,
  dob date,
  gender text,
  phone text,
  email text,
  address text,
  medical_history text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, patient_code)
);

create table public.studies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete restrict,
  patient_id uuid not null references public.patients (id) on delete cascade,
  study_code text not null,
  modality text not null default 'xray',
  body_part text,
  priority public.study_priority not null default 'normal',
  status public.study_status not null default 'draft',
  ordered_by text,
  assigned_radiologist_id uuid references public.profiles (id) on delete set null,
  technician_id uuid references public.profiles (id) on delete set null,
  notes text,
  study_date timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, study_code)
);

create table public.study_images (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete restrict,
  study_id uuid not null references public.studies (id) on delete cascade,
  storage_path text not null unique,
  file_name text not null,
  mime_type text not null,
  file_size bigint,
  width integer,
  height integer,
  is_primary boolean not null default false,
  uploaded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.annotations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete restrict,
  study_id uuid not null references public.studies (id) on delete cascade,
  study_image_id uuid references public.study_images (id) on delete cascade,
  created_by uuid not null references public.profiles (id) on delete cascade,
  type public.annotation_type not null,
  data jsonb not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete restrict,
  study_id uuid not null unique references public.studies (id) on delete cascade,
  radiologist_id uuid references public.profiles (id) on delete set null,
  status public.report_status not null default 'draft',
  findings text,
  impression text,
  recommendations text,
  ai_summary text,
  finalized_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.study_comments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete restrict,
  study_id uuid not null references public.studies (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  comment_type public.comment_type not null default 'general',
  body text not null,
  created_at timestamptz not null default now()
);

create table public.ai_analyses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete restrict,
  study_id uuid not null references public.studies (id) on delete cascade,
  generated_by uuid references public.profiles (id) on delete set null,
  quality_score numeric(5, 2),
  quality_notes text,
  abnormality_flag boolean not null default false,
  suggested_findings text,
  suggested_impression text,
  confidence numeric(5, 2),
  created_at timestamptz not null default now()
);

create table public.equipment (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete restrict,
  name text not null,
  model text,
  serial_number text,
  status public.equipment_status not null default 'online',
  last_sync_at timestamptz,
  last_calibrated_at timestamptz,
  usage_count integer not null default 0,
  maintenance_due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, serial_number)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete restrict,
  user_id uuid not null references public.profiles (id) on delete cascade,
  type public.notification_type not null default 'info',
  title text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete restrict,
  user_id uuid references public.profiles (id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action public.audit_action not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index profiles_organization_id_idx on public.profiles (organization_id);
create index profiles_role_idx on public.profiles (role);
create index patients_organization_id_idx on public.patients (organization_id);
create index patients_org_full_name_idx on public.patients (organization_id, full_name);
create index patients_org_patient_code_idx on public.patients (organization_id, patient_code);
create index studies_organization_id_idx on public.studies (organization_id);
create index studies_patient_id_idx on public.studies (patient_id);
create index studies_status_idx on public.studies (status);
create index studies_priority_idx on public.studies (priority);
create index studies_assigned_radiologist_id_idx on public.studies (assigned_radiologist_id);
create index studies_study_date_desc_idx on public.studies (study_date desc);
create index study_images_organization_id_idx on public.study_images (organization_id);
create index study_images_study_id_idx on public.study_images (study_id);
create index annotations_organization_id_idx on public.annotations (organization_id);
create index annotations_study_id_idx on public.annotations (study_id);
create index annotations_study_image_id_idx on public.annotations (study_image_id);
create index reports_organization_id_idx on public.reports (organization_id);
create index reports_study_id_idx on public.reports (study_id);
create index reports_radiologist_id_idx on public.reports (radiologist_id);
create index study_comments_organization_id_idx on public.study_comments (organization_id);
create index study_comments_study_id_idx on public.study_comments (study_id);
create index ai_analyses_organization_id_idx on public.ai_analyses (organization_id);
create index ai_analyses_study_id_idx on public.ai_analyses (study_id);
create index equipment_organization_id_idx on public.equipment (organization_id);
create index notifications_user_id_idx on public.notifications (user_id);
create index audit_logs_organization_id_idx on public.audit_logs (organization_id);
create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);

create function public.current_profile()
returns public.profiles
language sql
stable
security definer
set search_path = public
as $$
  select p.*
  from public.profiles p
  where p.id = auth.uid()
  limit 1
$$;

create function public.current_organization_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.organization_id
  from public.profiles p
  where p.id = auth.uid()
  limit 1
$$;

create function public.current_user_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select p.role
  from public.profiles p
  where p.id = auth.uid()
  limit 1
$$;

create function public.is_org_member(target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.organization_id = target_org
      and p.is_active = true
  )
$$;

create function public.has_role(allowed_roles public.app_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() = any (allowed_roles)
$$;

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_patients_updated_at
before update on public.patients
for each row execute function public.set_updated_at();

create trigger set_studies_updated_at
before update on public.studies
for each row execute function public.set_updated_at();

create trigger set_annotations_updated_at
before update on public.annotations
for each row execute function public.set_updated_at();

create trigger set_reports_updated_at
before update on public.reports
for each row execute function public.set_updated_at();

create trigger set_equipment_updated_at
before update on public.equipment
for each row execute function public.set_updated_at();

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.patients enable row level security;
alter table public.studies enable row level security;
alter table public.study_images enable row level security;
alter table public.annotations enable row level security;
alter table public.reports enable row level security;
alter table public.study_comments enable row level security;
alter table public.ai_analyses enable row level security;
alter table public.equipment enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

create policy organizations_select_own
on public.organizations
for select
using (public.is_org_member(id));

create policy organizations_update_admin
on public.organizations
for update
using (
  public.is_org_member(id)
  and public.has_role(array['admin']::public.app_role[])
)
with check (
  public.is_org_member(id)
  and public.has_role(array['admin']::public.app_role[])
);

create policy profiles_select_org
on public.profiles
for select
using (public.is_org_member(organization_id));

create policy profiles_update_self_or_admin
on public.profiles
for update
using (
  (id = auth.uid() and public.is_org_member(organization_id))
  or (
    public.is_org_member(organization_id)
    and public.has_role(array['admin']::public.app_role[])
  )
)
with check (
  public.is_org_member(organization_id)
  and (
    id = auth.uid()
    or public.has_role(array['admin']::public.app_role[])
  )
);

create policy patients_select_org
on public.patients
for select
using (public.is_org_member(organization_id));

create policy patients_insert_roles
on public.patients
for insert
with check (
  public.is_org_member(organization_id)
  and public.has_role(array['admin', 'technician', 'doctor']::public.app_role[])
);

create policy patients_update_roles
on public.patients
for update
using (
  public.is_org_member(organization_id)
  and public.has_role(array['admin', 'technician', 'doctor']::public.app_role[])
)
with check (
  public.is_org_member(organization_id)
  and public.has_role(array['admin', 'technician', 'doctor']::public.app_role[])
);

create policy patients_delete_admin
on public.patients
for delete
using (
  public.is_org_member(organization_id)
  and public.has_role(array['admin']::public.app_role[])
);

create policy studies_select_org
on public.studies
for select
using (public.is_org_member(organization_id));

create policy studies_insert_roles
on public.studies
for insert
with check (
  public.is_org_member(organization_id)
  and public.has_role(array['admin', 'technician', 'doctor']::public.app_role[])
);

create policy studies_update_roles
on public.studies
for update
using (
  public.is_org_member(organization_id)
  and public.has_role(array['admin', 'technician', 'radiologist']::public.app_role[])
)
with check (
  public.is_org_member(organization_id)
  and public.has_role(array['admin', 'technician', 'radiologist']::public.app_role[])
);

create policy studies_delete_admin
on public.studies
for delete
using (
  public.is_org_member(organization_id)
  and public.has_role(array['admin']::public.app_role[])
);

create policy study_images_select_org
on public.study_images
for select
using (public.is_org_member(organization_id));

create policy study_images_insert_roles
on public.study_images
for insert
with check (
  public.is_org_member(organization_id)
  and public.has_role(array['admin', 'technician', 'radiologist']::public.app_role[])
);

create policy study_images_update_roles
on public.study_images
for update
using (
  public.is_org_member(organization_id)
  and public.has_role(array['admin', 'technician']::public.app_role[])
)
with check (
  public.is_org_member(organization_id)
  and public.has_role(array['admin', 'technician']::public.app_role[])
);

create policy study_images_delete_roles
on public.study_images
for delete
using (
  public.is_org_member(organization_id)
  and public.has_role(array['admin', 'technician']::public.app_role[])
);

create policy annotations_select_org
on public.annotations
for select
using (public.is_org_member(organization_id));

create policy annotations_insert_roles
on public.annotations
for insert
with check (
  public.is_org_member(organization_id)
  and public.has_role(array['admin', 'radiologist', 'doctor']::public.app_role[])
  and created_by = auth.uid()
);

create policy annotations_update_creator_or_admin
on public.annotations
for update
using (
  public.is_org_member(organization_id)
  and (
    created_by = auth.uid()
    or public.has_role(array['admin']::public.app_role[])
  )
)
with check (
  public.is_org_member(organization_id)
  and (
    created_by = auth.uid()
    or public.has_role(array['admin']::public.app_role[])
  )
);

create policy annotations_delete_creator_or_admin
on public.annotations
for delete
using (
  public.is_org_member(organization_id)
  and (
    created_by = auth.uid()
    or public.has_role(array['admin']::public.app_role[])
  )
);

create policy reports_select_org
on public.reports
for select
using (public.is_org_member(organization_id));

create policy reports_insert_roles
on public.reports
for insert
with check (
  public.is_org_member(organization_id)
  and public.has_role(array['admin', 'radiologist']::public.app_role[])
);

create policy reports_update_admin_or_radiologist
on public.reports
for update
using (
  public.is_org_member(organization_id)
  and (
    public.has_role(array['admin']::public.app_role[])
    or radiologist_id = auth.uid()
  )
)
with check (
  public.is_org_member(organization_id)
  and (
    public.has_role(array['admin']::public.app_role[])
    or radiologist_id = auth.uid()
  )
);

create policy reports_delete_admin
on public.reports
for delete
using (
  public.is_org_member(organization_id)
  and public.has_role(array['admin']::public.app_role[])
);

create policy study_comments_select_org
on public.study_comments
for select
using (public.is_org_member(organization_id));

create policy study_comments_insert_member
on public.study_comments
for insert
with check (
  public.is_org_member(organization_id)
  and user_id = auth.uid()
);

create policy study_comments_delete_creator_or_admin
on public.study_comments
for delete
using (
  public.is_org_member(organization_id)
  and (
    user_id = auth.uid()
    or public.has_role(array['admin']::public.app_role[])
  )
);

create policy ai_analyses_select_org
on public.ai_analyses
for select
using (public.is_org_member(organization_id));

create policy ai_analyses_insert_roles
on public.ai_analyses
for insert
with check (
  public.is_org_member(organization_id)
  and public.has_role(array['admin', 'radiologist']::public.app_role[])
);

create policy ai_analyses_delete_admin
on public.ai_analyses
for delete
using (
  public.is_org_member(organization_id)
  and public.has_role(array['admin']::public.app_role[])
);

create policy equipment_select_org
on public.equipment
for select
using (public.is_org_member(organization_id));

create policy equipment_insert_roles
on public.equipment
for insert
with check (
  public.is_org_member(organization_id)
  and public.has_role(array['admin', 'technician']::public.app_role[])
);

create policy equipment_update_roles
on public.equipment
for update
using (
  public.is_org_member(organization_id)
  and public.has_role(array['admin', 'technician']::public.app_role[])
)
with check (
  public.is_org_member(organization_id)
  and public.has_role(array['admin', 'technician']::public.app_role[])
);

create policy equipment_delete_admin
on public.equipment
for delete
using (
  public.is_org_member(organization_id)
  and public.has_role(array['admin']::public.app_role[])
);

create policy notifications_select_own
on public.notifications
for select
using (user_id = auth.uid());

create policy notifications_update_own
on public.notifications
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy audit_logs_select_org
on public.audit_logs
for select
using (public.is_org_member(organization_id));

create policy audit_logs_insert_member
on public.audit_logs
for insert
with check (
  public.is_org_member(organization_id)
  and (
    user_id is null
    or user_id = auth.uid()
  )
);

create policy audit_logs_delete_admin
on public.audit_logs
for delete
using (
  public.is_org_member(organization_id)
  and public.has_role(array['admin']::public.app_role[])
);
