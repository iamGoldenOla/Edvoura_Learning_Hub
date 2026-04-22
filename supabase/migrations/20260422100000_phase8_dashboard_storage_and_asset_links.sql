create policy "storage_assignment_assets_select_authorized"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'assignment-assets'
  and (storage.foldername(name))[1] = 'assignments'
  and array_length(storage.foldername(name), 1) >= 2
  and private.can_access_assignment(((storage.foldername(name))[2])::uuid)
);

create policy "storage_assignment_assets_insert_tutor"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'assignment-assets'
  and (storage.foldername(name))[1] = 'assignments'
  and array_length(storage.foldername(name), 1) >= 2
  and private.can_access_assignment(((storage.foldername(name))[2])::uuid)
  and (
    private.current_user_has_role('tutor'::public.app_role)
    or private.current_user_is_admin()
  )
);

create policy "storage_student_work_select_authorized"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'student-work'
  and (storage.foldername(name))[1] = 'submissions'
  and array_length(storage.foldername(name), 1) >= 2
  and private.can_access_submission(((storage.foldername(name))[2])::uuid)
);

create policy "storage_student_work_insert_authorized"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'student-work'
  and (storage.foldername(name))[1] = 'submissions'
  and array_length(storage.foldername(name), 1) >= 2
  and private.can_access_submission(((storage.foldername(name))[2])::uuid)
);

create or replace function public.attach_assignment_asset(
  target_assignment_id uuid,
  object_path text,
  bucket_id text default 'assignment-assets'
)
returns uuid
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_file_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not private.can_access_assignment(target_assignment_id) then
    raise exception 'You do not have access to this assignment';
  end if;

  if not (
    private.current_user_has_role('tutor'::public.app_role)
    or private.current_user_is_admin()
  ) then
    raise exception 'Only tutors can attach assignment assets';
  end if;

  insert into public.assignment_files (
    assignment_id,
    bucket_id,
    object_path,
    uploaded_by_user_id
  )
  values (
    target_assignment_id,
    bucket_id,
    object_path,
    auth.uid()
  )
  returning id into v_file_id;

  return v_file_id;
end;
$$;

create or replace function public.attach_submission_file(
  target_submission_id uuid,
  object_path text,
  bucket_id text default 'student-work'
)
returns uuid
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_file_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not private.can_access_submission(target_submission_id) then
    raise exception 'You do not have access to this submission';
  end if;

  insert into public.submission_files (
    submission_id,
    bucket_id,
    object_path,
    uploaded_by_user_id
  )
  values (
    target_submission_id,
    bucket_id,
    object_path,
    auth.uid()
  )
  returning id into v_file_id;

  return v_file_id;
end;
$$;

grant execute on function public.attach_assignment_asset(uuid, text, text) to authenticated;
grant execute on function public.attach_submission_file(uuid, text, text) to authenticated;
