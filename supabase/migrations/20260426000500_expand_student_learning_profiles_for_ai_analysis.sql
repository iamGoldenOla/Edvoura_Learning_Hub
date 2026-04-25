alter table public.student_learning_profiles
  add column if not exists latest_analysis jsonb,
  add column if not exists focus_topics text[] not null default '{}'::text[],
  add column if not exists parent_summary jsonb;
