-- Fix recursive RLS policies
-- 1. Classes
drop policy if exists "classes_select_authorized" on public.classes;
create policy "classes_select_authorized" on public.classes
for select
using (
  primary_tutor_user_id = auth.uid()
  or created_by_user_id = auth.uid()
  or private.current_user_is_admin()
  or exists (
    select 1 from public.class_enrollments ce
    where ce.class_id = id and ce.student_user_id = auth.uid()
  )
  or exists (
    select 1 from public.class_enrollments ce
    join public.parent_student_links psl on psl.student_user_id = ce.student_user_id
    where ce.class_id = id and psl.parent_user_id = auth.uid() and psl.is_active = true
  )
);

-- 2. Lessons
drop policy if exists "lessons_select_authorized" on public.lessons;
create policy "lessons_select_authorized" on public.lessons
for select
using (
  tutor_user_id = auth.uid()
  or created_by_user_id = auth.uid()
  or private.current_user_is_admin()
  or exists (
    select 1 from public.classes c
    where c.id = class_id and (
      c.primary_tutor_user_id = auth.uid()
      or c.created_by_user_id = auth.uid()
    )
  )
  or exists (
    select 1 from public.class_enrollments ce
    where ce.class_id = class_id and ce.student_user_id = auth.uid()
  )
);

-- 3. Assignments
drop policy if exists "assignments_select_authorized" on public.assignments;
create policy "assignments_select_authorized" on public.assignments
for select
using (
  created_by_user_id = auth.uid()
  or private.current_user_is_admin()
  or exists (
    select 1 from public.classes c
    where c.id = class_id and (
      c.primary_tutor_user_id = auth.uid()
      or c.created_by_user_id = auth.uid()
    )
  )
  or exists (
    select 1 from public.class_enrollments ce
    where ce.class_id = class_id and ce.student_user_id = auth.uid()
  )
);
