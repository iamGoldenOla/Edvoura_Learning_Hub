create table if not exists public.tutor_live_content_posts (
  id uuid primary key default extensions.gen_random_uuid(),
  tutor_user_id uuid not null references public.tutor_profiles (user_id) on delete cascade,
  headline text not null,
  agenda text not null,
  explanation text,
  class_task text not null,
  homework text,
  resource_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists tutor_live_content_posts_active_updated_idx
  on public.tutor_live_content_posts (is_active, updated_at desc);

create table if not exists public.dashboard_chat_messages (
  id uuid primary key default extensions.gen_random_uuid(),
  channel_id text not null check (channel_id in ('tutor-parent', 'tutor-student-7-12', 'parent-student-7-12')),
  sender_user_id uuid not null references public.profiles (id) on delete cascade,
  sender_role public.app_role not null check (sender_role in ('student', 'parent', 'tutor')),
  sender_name text not null,
  text text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists dashboard_chat_messages_channel_created_idx
  on public.dashboard_chat_messages (channel_id, created_at desc);

alter table public.tutor_live_content_posts enable row level security;
alter table public.dashboard_chat_messages enable row level security;

drop policy if exists "tutor_live_content_posts_select_authenticated" on public.tutor_live_content_posts;
create policy "tutor_live_content_posts_select_authenticated" on public.tutor_live_content_posts
for select
using (auth.uid() is not null);

drop policy if exists "tutor_live_content_posts_insert_tutor_only" on public.tutor_live_content_posts;
create policy "tutor_live_content_posts_insert_tutor_only" on public.tutor_live_content_posts
for insert
with check (
  auth.uid() = tutor_user_id
  and private.current_user_has_role('tutor'::public.app_role)
);

drop policy if exists "tutor_live_content_posts_update_owner_tutor_only" on public.tutor_live_content_posts;
create policy "tutor_live_content_posts_update_owner_tutor_only" on public.tutor_live_content_posts
for update
using (
  auth.uid() = tutor_user_id
  and private.current_user_has_role('tutor'::public.app_role)
)
with check (
  auth.uid() = tutor_user_id
  and private.current_user_has_role('tutor'::public.app_role)
);

drop policy if exists "dashboard_chat_messages_select_channel_role_members" on public.dashboard_chat_messages;
create policy "dashboard_chat_messages_select_channel_role_members" on public.dashboard_chat_messages
for select
using (
  auth.uid() is not null
  and (
    (channel_id = 'tutor-parent' and (private.current_user_has_role('tutor'::public.app_role) or private.current_user_has_role('parent'::public.app_role)))
    or (channel_id = 'tutor-student-7-12' and (private.current_user_has_role('tutor'::public.app_role) or private.current_user_has_role('student'::public.app_role)))
    or (channel_id = 'parent-student-7-12' and (private.current_user_has_role('parent'::public.app_role) or private.current_user_has_role('student'::public.app_role)))
  )
);

drop policy if exists "dashboard_chat_messages_insert_sender_only" on public.dashboard_chat_messages;
create policy "dashboard_chat_messages_insert_sender_only" on public.dashboard_chat_messages
for insert
with check (
  auth.uid() = sender_user_id
  and (
    (channel_id = 'tutor-parent' and sender_role in ('tutor', 'parent'))
    or (channel_id = 'tutor-student-7-12' and sender_role in ('tutor', 'student'))
    or (channel_id = 'parent-student-7-12' and sender_role in ('parent', 'student'))
  )
);
