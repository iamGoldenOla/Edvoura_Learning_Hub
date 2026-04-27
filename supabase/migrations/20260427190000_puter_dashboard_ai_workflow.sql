-- Puter dashboard AI workflow hardening
-- Adds review-state columns + anti-repetition memory table.

alter table public.ai_generated_content
  add column if not exists title text,
  add column if not exists subject text,
  add column if not exists topic text,
  add column if not exists grade text,
  add column if not exists skill_type text,
  add column if not exists task_type text,
  add column if not exists content_json jsonb,
  add column if not exists content_text text,
  add column if not exists generated_by_role text,
  add column if not exists reviewed_by_user_id uuid references auth.users(id),
  add column if not exists review_note text,
  add column if not exists model_used text,
  add column if not exists ai_provider text,
  add column if not exists previous_content_hashes text[] default '{}',
  add column if not exists approved_at timestamptz,
  add column if not exists published_at timestamptz;

update public.ai_generated_content
set content_json = coalesce(content_json, raw_output),
    content_text = coalesce(content_text, raw_output::text),
    title = coalesce(title, raw_output->>'title'),
    subject = coalesce(subject, 'General Studies'),
    topic = coalesce(topic, coalesce(raw_output->>'topic', 'General Topic')),
    grade = coalesce(grade, 'General Grade'),
    skill_type = coalesce(skill_type, 'General'),
    generated_by_role = coalesce(generated_by_role, 'tutor'),
    task_type = coalesce(task_type, 'GENERATE_LESSON'),
    model_used = coalesce(model_used, 'legacy'),
    ai_provider = coalesce(ai_provider, 'legacy')
where true;

alter table public.ai_generated_content
  alter column status set default 'DRAFT';

-- Make status validation case-insensitive to preserve compatibility
alter table public.ai_generated_content
  drop constraint if exists ai_generated_content_status_check;

alter table public.ai_generated_content
  add constraint ai_generated_content_status_check
  check (upper(status) in ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'PUBLISHED'));

create table if not exists public.anti_repetition_items (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.ai_generated_content(id) on delete cascade,
  item_type text not null,
  subject text not null,
  topic text not null,
  grade text not null,
  skill_type text not null,
  text_hash text not null,
  original_text text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists anti_repetition_items_text_hash_key
  on public.anti_repetition_items (text_hash);

create index if not exists anti_repetition_items_lookup_idx
  on public.anti_repetition_items (subject, topic, grade, skill_type, created_at desc);

alter table public.anti_repetition_items enable row level security;

drop policy if exists "Students can read published AI content" on public.ai_generated_content;
create policy "Students can read published AI content"
  on public.ai_generated_content for select
  using (upper(status) = 'PUBLISHED');

drop policy if exists "Super Admins can view all AI content" on public.ai_generated_content;
create policy "Super Admins can manage all AI content"
  on public.ai_generated_content for all
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role = 'super_admin'
    )
  )
  with check (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role = 'super_admin'
    )
  );

drop policy if exists "Tutors and admins can read anti repetition items" on public.anti_repetition_items;
create policy "Tutors and admins can read anti repetition items"
  on public.anti_repetition_items for select
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role in ('tutor', 'admin', 'super_admin')
    )
  );

drop policy if exists "Tutors and admins can insert anti repetition items" on public.anti_repetition_items;
create policy "Tutors and admins can insert anti repetition items"
  on public.anti_repetition_items for insert
  with check (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role in ('tutor', 'admin', 'super_admin')
    )
  );
