-- MIGRATION: Preloaded Comprehension Resources
-- This creates a table to store pre-loaded comprehension PDFs mapped to grade levels,
-- and a storage bucket for comprehension resource files.

-- 1. Create storage bucket for comprehension resources
insert into storage.buckets (id, name, public)
values ('comprehension-resources', 'comprehension-resources', true)
on conflict (id) do nothing;

-- 2. Allow authenticated users to read from the bucket
create policy "Authenticated users can read comprehension resources"
on storage.objects for select
to authenticated
using (bucket_id = 'comprehension-resources');

-- 3. Allow service role to upload
create policy "Service role can upload comprehension resources"
on storage.objects for insert
to service_role
with check (bucket_id = 'comprehension-resources');

-- 4. Create the preloaded_resources table
create table if not exists public.preloaded_resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  file_name text not null,
  storage_path text not null,
  public_url text not null,
  grade_level_code text not null,
  subject text not null default 'English Language',
  resource_type text not null default 'comprehension',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- 5. Index for fast grade-level lookups
create index if not exists idx_preloaded_resources_grade
  on public.preloaded_resources (grade_level_code);

-- 6. RLS: Authenticated users can read
alter table public.preloaded_resources enable row level security;

create policy "Authenticated users can read preloaded resources"
on public.preloaded_resources for select
to authenticated
using (true);

-- 7. Trigger for updated_at
create or replace trigger set_preloaded_resources_updated_at
before update on public.preloaded_resources
for each row execute function public.handle_updated_at();
