create table if not exists public.learning_activity_events (
  id uuid primary key default extensions.gen_random_uuid(),
  event_type text not null,
  actor_user_id uuid references public.profiles (id) on delete set null,
  class_id uuid references public.classes (id) on delete set null,
  lesson_id uuid references public.lessons (id) on delete set null,
  assignment_id uuid references public.assignments (id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists learning_activity_events_event_type_created_idx
  on public.learning_activity_events (event_type, created_at desc);

create index if not exists learning_activity_events_class_created_idx
  on public.learning_activity_events (class_id, created_at desc);

alter table public.learning_activity_events enable row level security;

drop policy if exists "learning_activity_events_select_admin_tutor_parent_student" on public.learning_activity_events;
create policy "learning_activity_events_select_admin_tutor_parent_student" on public.learning_activity_events
for select
using (
  private.current_user_is_admin()
  or (
    class_id is not null
    and private.can_access_class(class_id)
  )
  or (
    lesson_id is not null
    and private.can_access_lesson(lesson_id)
  )
  or (
    assignment_id is not null
    and private.can_access_assignment(assignment_id)
  )
);

drop policy if exists "learning_activity_events_insert_admin_tutor" on public.learning_activity_events;
create policy "learning_activity_events_insert_admin_tutor" on public.learning_activity_events
for insert
with check (
  auth.uid() is not null
  and (
    private.current_user_is_admin()
    or private.current_user_has_role('tutor'::public.app_role)
  )
);
