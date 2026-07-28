-- Storage RLS Policies for lesson-resources bucket

drop policy if exists "storage_lesson_resources_select_authorized" on storage.objects;
create policy "storage_lesson_resources_select_authorized" on storage.objects
for select
to authenticated
using (
  bucket_id = 'lesson-resources'
  and (
    private.current_user_has_role('tutor'::public.app_role)
    or private.current_user_is_admin()
    or exists (
      -- Student enrolled in any active class
      select 1 from public.class_enrollments ce
      where ce.student_user_id = auth.uid()
      and ce.status = 'active'
    )
    or exists (
      -- Parent of an enrolled student
      select 1 from public.parent_student_links psl
      join public.class_enrollments ce on ce.student_user_id = psl.student_user_id
      where psl.parent_user_id = auth.uid()
      and ce.status = 'active'
    )
  )
);

drop policy if exists "storage_lesson_resources_write_tutor" on storage.objects;
create policy "storage_lesson_resources_write_tutor" on storage.objects
for all
to authenticated
using (
  bucket_id = 'lesson-resources'
  and (
    private.current_user_has_role('tutor'::public.app_role)
    or private.current_user_is_admin()
  )
)
with check (
  bucket_id = 'lesson-resources'
  and (
    private.current_user_has_role('tutor'::public.app_role)
    or private.current_user_is_admin()
  )
);
