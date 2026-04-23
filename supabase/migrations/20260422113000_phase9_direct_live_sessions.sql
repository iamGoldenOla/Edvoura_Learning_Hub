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
    created_by_user_id
  )
  values (
    p_class_id,
    coalesce(nullif(trim(p_title), ''), 'Live Session'),
    p_scheduled_start_at,
    p_scheduled_end_at,
    p_provider,
    'scheduled',
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

grant execute on function public.create_tutor_live_slot(uuid, text, timestamptz, timestamptz, text, text, public.live_class_provider) to authenticated;

create or replace function public.list_tutor_live_schedule()
returns table (
  id uuid,
  title text,
  class_title text,
  subject_name text,
  grade_level_name text,
  scheduled_start_at timestamptz,
  scheduled_end_at timestamptz,
  status text,
  provider text,
  join_url text,
  host_url text
)
language sql
security definer
set search_path = public, private
as $$
  select
    lesson.id,
    lesson.title,
    class.title as class_title,
    subject.name as subject_name,
    grade_level.display_name as grade_level_name,
    lesson.scheduled_start_at,
    lesson.scheduled_end_at,
    lesson.status::text,
    lesson.provider::text,
    live.join_url,
    live.host_url
  from public.lessons lesson
  join public.classes class
    on class.id = lesson.class_id
  join public.subjects subject
    on subject.id = class.subject_id
  join public.grade_levels grade_level
    on grade_level.id = class.grade_level_id
  left join private.lesson_live_sessions live
    on live.lesson_id = lesson.id
  where class.primary_tutor_user_id = auth.uid()
  order by lesson.scheduled_start_at asc;
$$;

grant execute on function public.list_tutor_live_schedule() to authenticated;

create or replace function public.list_student_live_lessons()
returns table (
  id uuid,
  title text,
  class_title text,
  subject_name text,
  scheduled_start_at timestamptz,
  scheduled_end_at timestamptz,
  status text,
  provider text,
  join_url text
)
language sql
security definer
set search_path = public, private
as $$
  select
    lesson.id,
    lesson.title,
    class.title as class_title,
    subject.name as subject_name,
    lesson.scheduled_start_at,
    lesson.scheduled_end_at,
    lesson.status::text,
    lesson.provider::text,
    live.join_url
  from public.class_enrollments enrollment
  join public.classes class
    on class.id = enrollment.class_id
  join public.subjects subject
    on subject.id = class.subject_id
  join public.lessons lesson
    on lesson.class_id = class.id
  left join private.lesson_live_sessions live
    on live.lesson_id = lesson.id
  where enrollment.student_user_id = auth.uid()
    and enrollment.status = 'active'
    and lesson.status in ('scheduled', 'live')
    and lesson.scheduled_end_at >= timezone('utc', now())
  order by lesson.scheduled_start_at asc;
$$;

grant execute on function public.list_student_live_lessons() to authenticated;
