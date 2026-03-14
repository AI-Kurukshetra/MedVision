create function public.storage_object_matches_org_prefix(object_name text, org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    split_part(object_name, '/', 1) = 'org'
    and split_part(object_name, '/', 2) = org_id::text
    and split_part(object_name, '/', 3) = 'studies'
$$;

insert into storage.buckets (id, name, public)
values ('study-images', 'study-images', false)
on conflict (id) do update set
  name = excluded.name,
  public = excluded.public;

create policy "study_images_select_org_objects"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'study-images'
  and public.storage_object_matches_org_prefix(name, public.current_organization_id())
  and public.is_org_member(public.current_organization_id())
);

create policy "study_images_insert_org_objects"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'study-images'
  and public.storage_object_matches_org_prefix(name, public.current_organization_id())
  and public.has_role(array['admin', 'technician', 'radiologist']::public.app_role[])
  and public.is_org_member(public.current_organization_id())
);

create policy "study_images_delete_org_objects"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'study-images'
  and public.storage_object_matches_org_prefix(name, public.current_organization_id())
  and public.has_role(array['admin', 'technician']::public.app_role[])
  and public.is_org_member(public.current_organization_id())
);
