alter table public.classes
add column if not exists grade_level_id uuid references public.grade_levels (id);

create index if not exists idx_classes_grade_level_id
on public.classes (grade_level_id);

create or replace function public.sync_current_user_membership()
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text := nullif(trim(coalesce(auth.jwt() ->> 'email', '')), '');
  v_metadata jsonb := coalesce(auth.jwt() -> 'user_metadata', '{}'::jsonb);
  v_role_text text := lower(coalesce(nullif(trim(v_metadata ->> 'role'), ''), 'student'));
  v_role public.app_role := case
    when v_role_text in ('student', 'parent', 'tutor', 'admin', 'super_admin') then v_role_text::public.app_role
    else 'student'::public.app_role
  end;
  v_full_name text := nullif(trim(v_metadata ->> 'full_name'), '');
  v_grade_level_code text := coalesce(
    nullif(trim(v_metadata ->> 'grade_level_code'), ''),
    case
      when coalesce(v_metadata ->> 'selected_grade', '') ~ '^[0-9]+$' then 'grade_' || (v_metadata ->> 'selected_grade')
      else null
    end
  );
  v_school_name text := nullif(trim(v_metadata ->> 'school_name'), '');
  v_academic_goal_notes text := nullif(trim(v_metadata ->> 'academic_goal_notes'), '');
  v_grade_level_id uuid;
  v_band_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  insert into public.profiles (id, email, full_name)
  values (v_user_id, coalesce(v_email, v_user_id::text || '@placeholder.local'), v_full_name)
  on conflict (id) do update
  set
    email = coalesce(excluded.email, public.profiles.email),
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    updated_at = timezone('utc', now());

  insert into public.user_roles (user_id, role)
  values (v_user_id, v_role)
  on conflict (user_id, role) do update
  set revoked_at = null;

  if v_role = 'student' then
    select gl.id, gl.band_id
    into v_grade_level_id, v_band_id
    from public.grade_levels gl
    where gl.code = coalesce(v_grade_level_code, 'grade_7')
    limit 1;

    if v_grade_level_id is not null then
      insert into public.student_profiles (
        user_id,
        grade_level_id,
        learner_band_id,
        school_name,
        academic_goal_notes
      )
      values (
        v_user_id,
        v_grade_level_id,
        v_band_id,
        v_school_name,
        v_academic_goal_notes
      )
      on conflict (user_id) do update
      set
        grade_level_id = excluded.grade_level_id,
        learner_band_id = excluded.learner_band_id,
        school_name = coalesce(excluded.school_name, public.student_profiles.school_name),
        academic_goal_notes = coalesce(excluded.academic_goal_notes, public.student_profiles.academic_goal_notes),
        updated_at = timezone('utc', now());

      insert into public.class_enrollments (class_id, student_user_id, status)
      select c.id, v_user_id, 'active'
      from public.classes c
      where c.status = 'active'
        and c.grade_level_id = v_grade_level_id
      on conflict (class_id, student_user_id) do update
      set
        status = 'active',
        updated_at = timezone('utc', now());
    end if;
  elsif v_role = 'parent' then
    insert into public.parent_profiles (user_id)
    values (v_user_id)
    on conflict (user_id) do update
    set updated_at = timezone('utc', now());
  elsif v_role = 'tutor' then
    insert into public.tutor_profiles (user_id, approval_status)
    values (v_user_id, 'approved')
    on conflict (user_id) do update
    set updated_at = timezone('utc', now());
  elsif v_role in ('admin', 'super_admin') then
    insert into public.admin_profiles (user_id)
    values (v_user_id)
    on conflict (user_id) do update
    set updated_at = timezone('utc', now());
  end if;

  return jsonb_build_object(
    'user_id', v_user_id,
    'role', v_role,
    'grade_level_code', v_grade_level_code
  );
end;
$$;

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
begin
  perform public.sync_current_user_membership();

  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if not (private.current_user_has_role('tutor'::public.app_role) or private.current_user_is_admin()) then
    raise exception 'Only tutors can create assignments';
  end if;

  select gl.id, gl.band_id, gl.display_name
  into v_grade_level_id, v_grade_band_id, v_grade_display_name
  from public.grade_levels gl
  where gl.code = grade_level_code
  limit 1;

  if v_grade_level_id is null then
    raise exception 'Unknown grade level code: %', grade_level_code;
  end if;

  select s.id, s.name
  into v_subject_id, v_subject_display_name
  from public.subjects s
  where lower(s.name) = lower(trim(subject_name))
  limit 1;

  if v_subject_id is null then
    v_slug := regexp_replace(lower(trim(subject_name)), '[^a-z0-9]+', '-', 'g');

    insert into public.subjects (slug, name, is_core, is_active)
    values (v_slug, trim(subject_name), true, true)
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
    set
      status = 'active',
      updated_at = timezone('utc', now())
    where id = v_class_id;
  end if;

  insert into public.class_enrollments (class_id, student_user_id, status)
  select v_class_id, sp.user_id, 'active'
  from public.student_profiles sp
  where sp.grade_level_id = v_grade_level_id
  on conflict (class_id, student_user_id) do update
  set
    status = 'active',
    updated_at = timezone('utc', now());

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
    trim(assignment_title),
    nullif(trim(coalesce(assignment_instructions, '')), ''),
    'published',
    due_at,
    coalesce(points_possible, 100),
    v_user_id
  )
  returning id into assignment_id;

  insert into public.assignment_submissions (assignment_id, student_user_id, status)
  select assignment_id, ce.student_user_id, 'draft'
  from public.class_enrollments ce
  where ce.class_id = v_class_id
    and ce.status = 'active'
  on conflict (assignment_id, student_user_id) do nothing;

  class_id := v_class_id;
  enrolled_students := (
    select count(*)
    from public.class_enrollments ce
    where ce.class_id = v_class_id
      and ce.status = 'active'
  );

  return next;
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
    nullif(trim(coalesce(submission_text, '')), ''),
    coalesce(submission_metadata, '{}'::jsonb)
  )
  on conflict (assignment_id, student_user_id) do update
  set
    status = case
      when v_due_at is not null and timezone('utc', now()) > v_due_at then 'late'::public.submission_status
      else 'submitted'::public.submission_status
    end,
    submitted_at = timezone('utc', now()),
    text_response = nullif(trim(coalesce(excluded.text_response, public.assignment_submissions.text_response, '')), ''),
    metadata = coalesce(public.assignment_submissions.metadata, '{}'::jsonb) || coalesce(excluded.metadata, '{}'::jsonb),
    updated_at = timezone('utc', now())
  returning id, status into submission_id, submission_status;

  return next;
end;
$$;

create or replace function public.grade_student_submission(
  target_submission_id uuid,
  score numeric,
  feedback_text text default null,
  rubric_json jsonb default '{}'::jsonb
)
returns table (
  submission_id uuid,
  graded_score numeric
)
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_user_id uuid := auth.uid();
begin
  perform public.sync_current_user_membership();

  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if not (private.current_user_has_role('tutor'::public.app_role) or private.current_user_is_admin()) then
    raise exception 'Only tutors can grade submissions';
  end if;

  if not private.can_access_submission(target_submission_id) then
    raise exception 'You do not have access to this submission';
  end if;

  insert into public.submission_grades (
    submission_id,
    grader_user_id,
    score,
    feedback_text,
    rubric_json,
    graded_at
  )
  values (
    target_submission_id,
    v_user_id,
    score,
    nullif(trim(coalesce(feedback_text, '')), ''),
    coalesce(rubric_json, '{}'::jsonb),
    timezone('utc', now())
  )
  on conflict (submission_id) do update
  set
    grader_user_id = v_user_id,
    score = excluded.score,
    feedback_text = coalesce(excluded.feedback_text, public.submission_grades.feedback_text),
    rubric_json = coalesce(excluded.rubric_json, '{}'::jsonb),
    graded_at = timezone('utc', now()),
    updated_at = timezone('utc', now());

  update public.assignment_submissions
  set
    status = 'graded',
    updated_at = timezone('utc', now())
  where id = target_submission_id;

  submission_id := target_submission_id;
  graded_score := score;
  return next;
end;
$$;

grant execute on function public.sync_current_user_membership() to authenticated;
grant execute on function public.create_tutor_assignment(text, text, text, text, timestamptz, numeric) to authenticated;
grant execute on function public.submit_student_assignment(uuid, text, jsonb) to authenticated;
grant execute on function public.grade_student_submission(uuid, numeric, text, jsonb) to authenticated;
