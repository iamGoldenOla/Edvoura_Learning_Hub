-- Add RPC to attach assets to assignments
drop function if exists public.attach_assignment_asset(uuid, text, text);
create or replace function public.attach_assignment_asset(
  target_assignment_id uuid,
  object_path text,
  bucket_id text default 'assignment-assets'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
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
  );
end;
$$;

grant execute on function public.attach_assignment_asset to authenticated;
