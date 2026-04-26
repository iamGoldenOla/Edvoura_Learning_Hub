-- Harden assignment RPCs against ambiguous identifier collisions
-- (e.g. output-column names like class_id overlapping with table columns).

create or replace function public.create_tutor_assignment(
  assignment_title text,
  subject_name text,
  grade_level_code text,
  assignment_instructions text default null,
  due_at timestamptz default null,
  points_possible numeric default 100
)
returns table (
  assignment_id uuid,
  class_id uuid,
  enrolled_students integer
)
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_user_id uuid := auth.uid();
  v_subject_id uuid;
  v_grade_level_id uuid;
  v_grade_band_id uuid;
  v_grade_display_name text;
  v_subject_display_name text;
  v_class_id uuid;
  v_enrolled_count integer := 0;
  v_slug text;
  v_assignment_id uuid;
  v_assignment_title text := trim(coalesce(create_tutor_assignment.assignment_title, ''));
  v_subject_name text := trim(coalesce(create_tutor_assignment.subject_name, ''));
  v_grade_level_code text := trim(coalesce(create_tutor_assignment.grade_level_code, ''));
  v_assignment_instructions text := nullif(trim(coalesce(create_tutor_assignment.assignment_instructions, '')), '');
  v_due_at timestamptz := create_tutor_assignment.due_at;
  v_points_possible numeric := coalesce(create_tutor_assignment.points_possible, 100);
begin
  perform public.sync_current_user_membership();

  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if not (private.current_user_has_role('tutor'::public.app_role) or private.current_user_is_admin()) then
    raise exception 'Only tutors can create assignments';
  end if;

  if v_assignment_title = '' then
    raise exception 'Assignment title is required';
  end if;

  if v_subject_name = '' then
    raise exception 'Subject is required';
  end if;

  if v_grade_level_code = '' then
    raise exception 'Grade level code is required';
  end if;

  select gl.id, gl.band_id, gl.display_name
  into v_grade_level_id, v_grade_band_id, v_grade_display_name
  from public.grade_levels gl
  where gl.code = v_grade_level_code
  limit 1;

  if v_grade_level_id is null then
    raise exception 'Unknown grade level code: %', v_grade_level_code;
  end if;

  select s.id, s.name
  into v_subject_id, v_subject_display_name
  from public.subjects s
  where lower(s.name) = lower(v_subject_name)
  limit 1;

  if v_subject_id is null then
    v_slug := regexp_replace(lower(v_subject_name), '[^a-z0-9]+', '-', 'g');
    insert into public.subjects (slug, name, is_core, is_active)
    values (v_slug, v_subject_name, true, true)
    returning id, name into v_subject_id, v_subject_display_name;
  end if;

  select c.id
  into v_class_id
  from public.classes c
  where c.primary_tutor_user_id = v_user_id
    and c.subject_id = v_subject_id
    and c.grade_level_id = v_grade_level_id
    and c.status in ('draft', 'active')
  order by case when c.status = 'active' then 0 else 1 end, c.created_at desc
  limit 1;

  if v_class_id is null then
    insert into public.classes (
      subject_id,
      grade_band_id,
      grade_level_id,
      title,
      description,
      status,
      primary_tutor_user_id,
      created_by_user_id,
      starts_on
    )
    values (
      v_subject_id,
      v_grade_band_id,
      v_grade_level_id,
      v_grade_display_name || ' ' || v_subject_display_name,
      'Auto-generated live class for ' || v_grade_display_name || ' ' || v_subject_display_name,
      'active',
      v_user_id,
      v_user_id,
      current_date
    )
    returning id into v_class_id;
  else
    update public.classes
    set status = 'active', updated_at = timezone('utc', now())
    where classes.id = v_class_id;
  end if;

  insert into public.class_enrollments (class_id, student_user_id, status)
  select v_class_id, sp.user_id, 'active'
  from public.student_profiles sp
  where sp.grade_level_id = v_grade_level_id
  on conflict (class_id, student_user_id) do update
  set status = 'active', updated_at = timezone('utc', now());

  get diagnostics v_enrolled_count = row_count;

  insert into public.assignments (
    class_id,
    title,
    instructions,
    status,
    due_at,
    points_possible,
    created_by_user_id
  )
  values (
    v_class_id,
    v_assignment_title,
    v_assignment_instructions,
    'published',
    v_due_at,
    v_points_possible,
    v_user_id
  )
  returning assignments.id into v_assignment_id;

  insert into public.assignment_submissions (assignment_id, student_user_id, status)
  select v_assignment_id, ce.student_user_id, 'draft'
  from public.class_enrollments ce
  where ce.class_id = v_class_id
    and ce.status = 'active'
  on conflict (assignment_id, student_user_id) do nothing;

  return query
  select
    v_assignment_id as assignment_id,
    v_class_id as class_id,
    (
      select count(*)
      from public.class_enrollments ce
      where ce.class_id = v_class_id
        and ce.status = 'active'
    )::integer as enrolled_students;
end;
$$;

create or replace function public.submit_student_assignment(
  target_assignment_id uuid,
  submission_text text default null,
  submission_metadata jsonb default '{}'::jsonb
)
returns table (
  submission_id uuid,
  submission_status public.submission_status
)
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_user_id uuid := auth.uid();
  v_due_at timestamptz;
  v_class_id uuid;
  v_submission_text text := nullif(trim(coalesce(submit_student_assignment.submission_text, '')), '');
  v_submission_metadata jsonb := coalesce(submit_student_assignment.submission_metadata, '{}'::jsonb);
begin
  perform public.sync_current_user_membership();

  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if not private.current_user_has_role('student'::public.app_role) then
    raise exception 'Only students can submit assignments';
  end if;

  select a.due_at, a.class_id
  into v_due_at, v_class_id
  from public.assignments a
  where a.id = target_assignment_id;

  if v_class_id is null then
    raise exception 'Assignment not found';
  end if;

  if not exists (
    select 1
    from public.class_enrollments ce
    where ce.class_id = v_class_id
      and ce.student_user_id = v_user_id
      and ce.status = 'active'
  ) then
    raise exception 'You are not enrolled in this class';
  end if;

  insert into public.assignment_submissions (
    assignment_id,
    student_user_id,
    status,
    submitted_at,
    text_response,
    metadata
  )
  values (
    target_assignment_id,
    v_user_id,
    case
      when v_due_at is not null and timezone('utc', now()) > v_due_at then 'late'::public.submission_status
      else 'submitted'::public.submission_status
    end,
    timezone('utc', now()),
    v_submission_text,
    v_submission_metadata
  )
  on conflict (assignment_id, student_user_id) do update
  set
    status = case
      when v_due_at is not null and timezone('utc', now()) > v_due_at then 'late'::public.submission_status
      else 'submitted'::public.submission_status
    end,
    submitted_at = timezone('utc', now()),
    text_response = coalesce(excluded.text_response, public.assignment_submissions.text_response),
    metadata = coalesce(public.assignment_submissions.metadata, '{}'::jsonb) || coalesce(excluded.metadata, '{}'::jsonb),
    updated_at = timezone('utc', now())
  returning public.assignment_submissions.id, public.assignment_submissions.status into submission_id, submission_status;

  return next;
end;
$$;

grant execute on function public.create_tutor_assignment(text, text, text, text, timestamptz, numeric) to authenticated;
grant execute on function public.submit_student_assignment(uuid, text, jsonb) to authenticated;
