-- REDEFINE list_tutor_live_schedule() TO SUPPORT NULL grade_level_id CLASSES (1-ON-1 SESSIONS)
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
    coalesce(grade_level.display_name, '1-on-1') as grade_level_name,
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
  left join public.grade_levels grade_level
    on grade_level.id = class.grade_level_id
  left join private.lesson_live_sessions live
    on live.lesson_id = lesson.id
  where class.primary_tutor_user_id = auth.uid()
  order by lesson.scheduled_start_at asc;
$$;

-- RLS Update: Allow tutors to view all profiles and student profiles to select target students
drop policy if exists "profiles_select_self_admin_or_linked_student" on public.profiles;
create policy "profiles_select_self_admin_or_linked_student" on public.profiles
for select
using (
  id = auth.uid()
  or private.current_user_is_admin()
  or private.can_access_student(id)
  or private.current_user_has_role('tutor'::public.app_role)
);

drop policy if exists "student_profiles_select_authorized" on public.student_profiles;
create policy "student_profiles_select_authorized" on public.student_profiles
for select
using (
  private.can_access_student(user_id)
  or private.current_user_is_admin()
  or private.current_user_has_role('tutor'::public.app_role)
);

-- RLS Update: Allow tutors to enroll students to classes they own
drop policy if exists "tutors_insert_class_enrollments" on public.class_enrollments;
create policy "tutors_insert_class_enrollments" on public.class_enrollments
for insert
to authenticated
with check (
  exists (
    select 1 from public.classes c
    where c.id = class_id
      and (c.primary_tutor_user_id = auth.uid() or c.created_by_user_id = auth.uid())
  )
  or private.current_user_is_admin()
);

-- RLS Update: Allow tutors to delete classes they own/created (upon cascading cleanups)
drop policy if exists "tutors_delete_classes" on public.classes;
create policy "tutors_delete_classes" on public.classes
for delete
to authenticated
using (
  primary_tutor_user_id = auth.uid()
  or created_by_user_id = auth.uid()
  or private.current_user_is_admin()
);
