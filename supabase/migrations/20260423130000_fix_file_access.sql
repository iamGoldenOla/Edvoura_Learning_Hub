-- Fix security policy for assignment files
drop policy if exists "assignment_files_select_authorized" on public.assignment_files;
create policy "assignment_files_select_authorized" on public.assignment_files
for select
using (
  exists (
    select 1 from public.assignments a
    join public.classes c on c.id = a.class_id
    where a.id = assignment_id
    and (
      a.created_by_user_id = auth.uid() -- Tutor who created it
      or c.primary_tutor_user_id = auth.uid() -- Assigned tutor
      or private.current_user_is_admin() -- Admin
      or exists (
        select 1 from public.class_enrollments ce
        where ce.class_id = c.id and ce.student_user_id = auth.uid() -- Enrolled student
      )
    )
  )
);
