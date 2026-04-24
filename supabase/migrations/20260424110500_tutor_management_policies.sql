-- Allow tutors to create classes
drop policy if exists "tutors_insert_classes" on public.classes;
create policy "tutors_insert_classes" on public.classes
for insert
to authenticated
with check (
  (private.current_user_has_role('tutor'::public.app_role) or private.current_user_is_admin())
  and primary_tutor_user_id = auth.uid()
);

-- Allow tutors to update their own classes
drop policy if exists "tutors_update_classes" on public.classes;
create policy "tutors_update_classes" on public.classes
for update
to authenticated
using (
  primary_tutor_user_id = auth.uid()
  or created_by_user_id = auth.uid()
  or private.current_user_is_admin()
)
with check (
  primary_tutor_user_id = auth.uid()
  or created_by_user_id = auth.uid()
  or private.current_user_is_admin()
);

-- Allow tutors to delete their own lessons (to cancel meetings)
drop policy if exists "tutors_delete_lessons" on public.lessons;
create policy "tutors_delete_lessons" on public.lessons
for delete
to authenticated
using (
  tutor_user_id = auth.uid()
  or created_by_user_id = auth.uid()
  or private.current_user_is_admin()
);
