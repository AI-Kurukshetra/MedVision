-- MedVision local seed data.
-- This seed avoids direct auth.users writes and focuses on organization-scoped entities.

insert into public.organizations (id, name, slug)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'Demo Imaging Clinic',
    'demo-imaging-clinic'
  )
on conflict (slug) do update set
  name = excluded.name;

insert into public.patients (
  id,
  organization_id,
  patient_code,
  full_name,
  dob,
  gender,
  phone,
  email,
  address,
  medical_history
)
values
  (
    '22222222-2222-2222-2222-222222222221',
    '11111111-1111-1111-1111-111111111111',
    'PT-1001',
    'Jane Smith',
    '1986-04-12',
    'female',
    '+1-555-0101',
    'jane.smith@example.com',
    '143 Harbor St, Springfield',
    'Prior asthma history'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'PT-1002',
    'Michael Lee',
    '1979-09-03',
    'male',
    '+1-555-0102',
    'michael.lee@example.com',
    '88 Pine Ave, Springfield',
    'Type 2 diabetes'
  )
on conflict (organization_id, patient_code) do update set
  full_name = excluded.full_name,
  dob = excluded.dob,
  gender = excluded.gender,
  phone = excluded.phone,
  email = excluded.email,
  address = excluded.address,
  medical_history = excluded.medical_history;

insert into public.studies (
  id,
  organization_id,
  patient_id,
  study_code,
  modality,
  body_part,
  priority,
  status,
  ordered_by,
  notes,
  study_date
)
values
  (
    '33333333-3333-3333-3333-333333333331',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222221',
    'ST-2001',
    'xray',
    'chest',
    'urgent',
    'under_review',
    'Dr. Garcia',
    'Persistent cough and fever',
    now() - interval '3 hours'
  ),
  (
    '33333333-3333-3333-3333-333333333332',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'ST-2002',
    'xray',
    'knee',
    'normal',
    'uploaded',
    'Dr. Patel',
    'Post-fall evaluation',
    now() - interval '1 day'
  )
on conflict (organization_id, study_code) do update set
  patient_id = excluded.patient_id,
  modality = excluded.modality,
  body_part = excluded.body_part,
  priority = excluded.priority,
  status = excluded.status,
  ordered_by = excluded.ordered_by,
  notes = excluded.notes,
  study_date = excluded.study_date;

insert into public.study_images (
  id,
  organization_id,
  study_id,
  storage_path,
  file_name,
  mime_type,
  file_size,
  width,
  height,
  is_primary
)
values
  (
    '44444444-4444-4444-4444-444444444441',
    '11111111-1111-1111-1111-111111111111',
    '33333333-3333-3333-3333-333333333331',
    'org/11111111-1111-1111-1111-111111111111/studies/33333333-3333-3333-3333-333333333331/chest-xray-1.png',
    'chest-xray-1.png',
    'image/png',
    349812,
    1920,
    1080,
    true
  ),
  (
    '44444444-4444-4444-4444-444444444442',
    '11111111-1111-1111-1111-111111111111',
    '33333333-3333-3333-3333-333333333332',
    'org/11111111-1111-1111-1111-111111111111/studies/33333333-3333-3333-3333-333333333332/knee-xray-1.png',
    'knee-xray-1.png',
    'image/png',
    287421,
    1600,
    1200,
    true
  )
on conflict (storage_path) do update set
  file_name = excluded.file_name,
  mime_type = excluded.mime_type,
  file_size = excluded.file_size,
  width = excluded.width,
  height = excluded.height,
  is_primary = excluded.is_primary;

insert into public.reports (
  id,
  organization_id,
  study_id,
  status,
  findings,
  impression,
  recommendations,
  ai_summary
)
values
  (
    '55555555-5555-5555-5555-555555555551',
    '11111111-1111-1111-1111-111111111111',
    '33333333-3333-3333-3333-333333333331',
    'draft',
    'Patchy right lower lobe opacity.',
    'Likely infectious process.',
    'Clinical correlation and repeat imaging if symptoms worsen.',
    'Suggested: community-acquired pneumonia pattern.'
  )
on conflict (study_id) do update set
  status = excluded.status,
  findings = excluded.findings,
  impression = excluded.impression,
  recommendations = excluded.recommendations,
  ai_summary = excluded.ai_summary;

insert into public.ai_analyses (
  id,
  organization_id,
  study_id,
  quality_score,
  quality_notes,
  abnormality_flag,
  suggested_findings,
  suggested_impression,
  confidence
)
values
  (
    '66666666-6666-6666-6666-666666666661',
    '11111111-1111-1111-1111-111111111111',
    '33333333-3333-3333-3333-333333333331',
    91.40,
    'Adequate exposure and positioning.',
    true,
    'Right basal infiltrate with mild pleural blunting.',
    'Possible lower respiratory tract infection.',
    88.30
  )
on conflict (id) do update set
  quality_score = excluded.quality_score,
  quality_notes = excluded.quality_notes,
  abnormality_flag = excluded.abnormality_flag,
  suggested_findings = excluded.suggested_findings,
  suggested_impression = excluded.suggested_impression,
  confidence = excluded.confidence;

insert into public.equipment (
  id,
  organization_id,
  name,
  model,
  serial_number,
  status,
  last_sync_at,
  last_calibrated_at,
  usage_count,
  maintenance_due_at
)
values
  (
    '77777777-7777-7777-7777-777777777771',
    '11111111-1111-1111-1111-111111111111',
    'Portable X-ray Unit A',
    'XR-Portable-2',
    'SN-XR-2001',
    'online',
    now() - interval '20 minutes',
    now() - interval '19 days',
    182,
    now() + interval '42 days'
  ),
  (
    '77777777-7777-7777-7777-777777777772',
    '11111111-1111-1111-1111-111111111111',
    'Portable X-ray Unit B',
    'XR-Portable-1',
    'SN-XR-2002',
    'maintenance',
    now() - interval '2 days',
    now() - interval '4 months',
    401,
    now() + interval '2 days'
  )
on conflict (organization_id, serial_number) do update set
  name = excluded.name,
  model = excluded.model,
  status = excluded.status,
  last_sync_at = excluded.last_sync_at,
  last_calibrated_at = excluded.last_calibrated_at,
  usage_count = excluded.usage_count,
  maintenance_due_at = excluded.maintenance_due_at;

insert into public.audit_logs (
  id,
  organization_id,
  user_id,
  entity_type,
  entity_id,
  action,
  metadata
)
values
  (
    '88888888-8888-8888-8888-888888888881',
    '11111111-1111-1111-1111-111111111111',
    null,
    'study',
    '33333333-3333-3333-3333-333333333331',
    'upload',
    '{"source":"seed","note":"Demo image metadata inserted"}'::jsonb
  ),
  (
    '88888888-8888-8888-8888-888888888882',
    '11111111-1111-1111-1111-111111111111',
    null,
    'report',
    '55555555-5555-5555-5555-555555555551',
    'update',
    '{"source":"seed","note":"Draft report created"}'::jsonb
  )
on conflict (id) do update set
  entity_type = excluded.entity_type,
  entity_id = excluded.entity_id,
  action = excluded.action,
  metadata = excluded.metadata;
