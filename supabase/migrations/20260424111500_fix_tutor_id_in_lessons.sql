create or replace function public.create_tutor_live_slot(
  p_class_id uuid,
  p_title text,
  p_scheduled_start_at timestamptz,
  p_scheduled_end_at timestamptz,
  p_join_url text default null,
  p_host_url text default null,
  p_provider public.live_class_provider default 'google_meet'
)
returns table (
  lesson_id uuid,
  join_url text,
  host_url text
)
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_lesson_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not private.current_user_has_role('tutor'::public.app_role)
     and not private.current_user_is_admin() then
    raise exception 'Tutor access required';
  end if;

  if not exists (
    select 1
    from public.classes c
    where c.id = p_class_id
      and c.primary_tutor_user_id = auth.uid()
  ) then
    raise exception 'Selected class is not assigned to the current tutor';
  end if;

  if p_scheduled_end_at <= p_scheduled_start_at then
    raise exception 'Lesson end time must be after the start time';
  end if;

  insert into public.lessons (
    class_id,
    title,
    scheduled_start_at,
    scheduled_end_at,
    provider,
    status,
    tutor_user_id,
    created_by_user_id
  )
  values (
    p_class_id,
    coalesce(nullif(trim(p_title), ''), 'Live Session'),
    p_scheduled_start_at,
    p_scheduled_end_at,
    p_provider,
    'scheduled',
    auth.uid(),
    auth.uid()
  )
  returning id into v_lesson_id;

  if coalesce(nullif(trim(p_join_url), ''), null) is not null
     or coalesce(nullif(trim(p_host_url), ''), null) is not null then
    insert into private.lesson_live_sessions (
      lesson_id,
      provider,
      join_url,
      host_url
    )
    values (
      v_lesson_id,
      p_provider,
      nullif(trim(p_join_url), ''),
      nullif(trim(p_host_url), '')
    )
    on conflict (lesson_id) do update
      set provider = excluded.provider,
          join_url = excluded.join_url,
          host_url = excluded.host_url;
  end if;

  return query
  select
    v_lesson_id,
    nullif(trim(p_join_url), ''),
    nullif(trim(p_host_url), '');
end;
$$;
