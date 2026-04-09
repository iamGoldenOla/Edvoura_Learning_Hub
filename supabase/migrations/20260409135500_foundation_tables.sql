create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email extensions.citext not null unique,
  full_name text,
  phone_number text,
  avatar_path text,
  timezone text not null default 'Africa/Lagos',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.user_roles (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.app_role not null,
  granted_by_user_id uuid references public.profiles (id),
  granted_at timestamptz not null default timezone('utc', now()),
  revoked_at timestamptz,
  unique (user_id, role)
);

create table public.grade_bands (
  id uuid primary key default extensions.gen_random_uuid(),
  code text not null unique,
  name text not null,
  min_grade smallint not null,
  max_grade smallint not null,
  sort_order integer not null unique,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.grade_levels (
  id uuid primary key default extensions.gen_random_uuid(),
  code text not null unique,
  display_name text not null,
  numeric_level smallint not null unique,
  band_id uuid not null references public.grade_bands (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.subjects (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique,
  name text not null unique,
  is_core boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.parent_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  preferred_contact_method text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.student_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  grade_level_id uuid not null references public.grade_levels (id),
  learner_band_id uuid not null references public.grade_bands (id),
  school_name text,
  academic_goal_notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.tutor_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  approval_status public.tutor_approval_status not null default 'pending',
  headline text,
  bio text,
  expertise_summary text,
  availability_notes text,
  approved_by_user_id uuid references public.profiles (id),
  approved_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.admin_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  title text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.parent_student_links (
  id uuid primary key default extensions.gen_random_uuid(),
  parent_user_id uuid not null references public.parent_profiles (user_id) on delete cascade,
  student_user_id uuid not null references public.student_profiles (user_id) on delete cascade,
  relationship public.guardian_relationship not null,
  is_primary_guardian boolean not null default false,
  can_view_billing boolean not null default true,
  can_view_progress boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (parent_user_id, student_user_id)
);

create table public.classes (
  id uuid primary key default extensions.gen_random_uuid(),
  subject_id uuid not null references public.subjects (id),
  grade_band_id uuid not null references public.grade_bands (id),
  title text not null,
  description text,
  status public.class_status not null default 'draft',
  primary_tutor_user_id uuid references public.tutor_profiles (user_id),
  max_students integer check (max_students is null or max_students > 0),
  starts_on date,
  ends_on date,
  created_by_user_id uuid not null references public.profiles (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.class_enrollments (
  id uuid primary key default extensions.gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  student_user_id uuid not null references public.student_profiles (user_id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'paused', 'completed', 'withdrawn')),
  enrolled_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (class_id, student_user_id)
);

create table public.lessons (
  id uuid primary key default extensions.gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  tutor_user_id uuid references public.tutor_profiles (user_id),
  title text not null,
  description text,
  provider public.live_class_provider not null default 'zoom',
  status public.lesson_status not null default 'draft',
  scheduled_start_at timestamptz not null,
  scheduled_end_at timestamptz not null,
  actual_start_at timestamptz,
  actual_end_at timestamptz,
  meeting_summary text,
  created_by_user_id uuid not null references public.profiles (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (scheduled_end_at > scheduled_start_at)
);

create table private.lesson_live_sessions (
  lesson_id uuid primary key references public.lessons (id) on delete cascade,
  provider public.live_class_provider not null,
  external_meeting_id text,
  join_url text,
  host_url text,
  passcode text,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.lesson_attendance (
  id uuid primary key default extensions.gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  student_user_id uuid not null references public.student_profiles (user_id) on delete cascade,
  status public.attendance_status not null,
  joined_at timestamptz,
  left_at timestamptz,
  recorded_by_user_id uuid references public.profiles (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (lesson_id, student_user_id)
);

create table public.assignments (
  id uuid primary key default extensions.gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  lesson_id uuid references public.lessons (id) on delete set null,
  title text not null,
  instructions text,
  status public.assignment_status not null default 'draft',
  due_at timestamptz,
  points_possible numeric(6, 2) not null default 100,
  created_by_user_id uuid not null references public.profiles (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.assignment_files (
  id uuid primary key default extensions.gen_random_uuid(),
  assignment_id uuid not null references public.assignments (id) on delete cascade,
  bucket_id text not null,
  object_path text not null,
  uploaded_by_user_id uuid not null references public.profiles (id),
  created_at timestamptz not null default timezone('utc', now())
);

create table public.assignment_submissions (
  id uuid primary key default extensions.gen_random_uuid(),
  assignment_id uuid not null references public.assignments (id) on delete cascade,
  student_user_id uuid not null references public.student_profiles (user_id) on delete cascade,
  status public.submission_status not null default 'draft',
  submitted_at timestamptz,
  text_response text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (assignment_id, student_user_id)
);

create table public.submission_files (
  id uuid primary key default extensions.gen_random_uuid(),
  submission_id uuid not null references public.assignment_submissions (id) on delete cascade,
  bucket_id text not null,
  object_path text not null,
  uploaded_by_user_id uuid not null references public.profiles (id),
  created_at timestamptz not null default timezone('utc', now())
);

create table public.submission_grades (
  id uuid primary key default extensions.gen_random_uuid(),
  submission_id uuid not null unique references public.assignment_submissions (id) on delete cascade,
  grader_user_id uuid not null references public.profiles (id),
  score numeric(6, 2),
  feedback_text text,
  rubric_json jsonb not null default '{}'::jsonb,
  graded_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.quizzes (
  id uuid primary key default extensions.gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  lesson_id uuid references public.lessons (id) on delete set null,
  title text not null,
  instructions text,
  status public.quiz_status not null default 'draft',
  starts_at timestamptz,
  ends_at timestamptz,
  time_limit_minutes integer,
  created_by_user_id uuid not null references public.profiles (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.quiz_questions (
  id uuid primary key default extensions.gen_random_uuid(),
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  position integer not null,
  question_type text not null,
  prompt text not null,
  options_json jsonb not null default '[]'::jsonb,
  correct_answer_json jsonb not null default '{}'::jsonb,
  points numeric(6, 2) not null default 1,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (quiz_id, position)
);

create table public.quiz_attempts (
  id uuid primary key default extensions.gen_random_uuid(),
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  student_user_id uuid not null references public.student_profiles (user_id) on delete cascade,
  status public.quiz_attempt_status not null default 'in_progress',
  started_at timestamptz not null default timezone('utc', now()),
  submitted_at timestamptz,
  score numeric(6, 2),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (quiz_id, student_user_id)
);

create table public.quiz_responses (
  id uuid primary key default extensions.gen_random_uuid(),
  attempt_id uuid not null references public.quiz_attempts (id) on delete cascade,
  question_id uuid not null references public.quiz_questions (id) on delete cascade,
  answer_json jsonb not null default '{}'::jsonb,
  is_correct boolean,
  awarded_points numeric(6, 2),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (attempt_id, question_id)
);

create table public.progress_snapshots (
  id uuid primary key default extensions.gen_random_uuid(),
  student_user_id uuid not null references public.student_profiles (user_id) on delete cascade,
  subject_id uuid references public.subjects (id) on delete set null,
  snapshot_date date not null,
  attendance_rate numeric(5, 2),
  assignment_completion_rate numeric(5, 2),
  average_score numeric(5, 2),
  mastery_notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.notifications (
  id uuid primary key default extensions.gen_random_uuid(),
  recipient_user_id uuid not null references public.profiles (id) on delete cascade,
  actor_user_id uuid references public.profiles (id) on delete set null,
  kind public.notification_kind not null,
  title text not null,
  body text not null,
  status public.notification_status not null default 'unread',
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.notification_deliveries (
  id uuid primary key default extensions.gen_random_uuid(),
  notification_id uuid not null references public.notifications (id) on delete cascade,
  channel public.notification_channel not null,
  delivery_status text not null check (delivery_status in ('queued', 'sent', 'delivered', 'failed')),
  provider text,
  external_delivery_id text,
  attempted_at timestamptz,
  delivered_at timestamptz,
  error_message text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table billing.plans (
  id uuid primary key default extensions.gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  interval text not null check (interval in ('monthly', 'termly', 'annual')),
  amount_minor integer not null check (amount_minor >= 0),
  currency_code text not null default 'NGN',
  stripe_price_id text unique,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table billing.subscriptions (
  id uuid primary key default extensions.gen_random_uuid(),
  account_owner_user_id uuid not null references public.profiles (id) on delete cascade,
  plan_id uuid references billing.plans (id),
  stripe_customer_id text,
  stripe_subscription_id text unique,
  status billing.subscription_status not null default 'incomplete',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table billing.invoices (
  id uuid primary key default extensions.gen_random_uuid(),
  subscription_id uuid references billing.subscriptions (id) on delete set null,
  stripe_invoice_id text unique,
  status billing.invoice_status not null default 'draft',
  amount_due_minor integer not null default 0,
  amount_paid_minor integer not null default 0,
  currency_code text not null default 'NGN',
  due_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table billing.payments (
  id uuid primary key default extensions.gen_random_uuid(),
  invoice_id uuid references billing.invoices (id) on delete set null,
  stripe_payment_intent_id text unique,
  status billing.payment_status not null default 'pending',
  amount_minor integer not null default 0,
  currency_code text not null default 'NGN',
  paid_at timestamptz,
  failure_reason text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table billing.coupons (
  id uuid primary key default extensions.gen_random_uuid(),
  code text not null unique,
  percent_off numeric(5, 2),
  amount_off_minor integer,
  max_redemptions integer,
  redeem_by timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table billing.referrals (
  id uuid primary key default extensions.gen_random_uuid(),
  referrer_user_id uuid not null references public.profiles (id) on delete cascade,
  referred_user_id uuid references public.profiles (id) on delete set null,
  code text not null unique,
  reward_status text not null default 'pending' check (reward_status in ('pending', 'earned', 'paid', 'cancelled')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table billing.tutor_payout_accounts (
  id uuid primary key default extensions.gen_random_uuid(),
  tutor_user_id uuid not null unique references public.tutor_profiles (user_id) on delete cascade,
  stripe_connected_account_id text unique,
  onboarding_status text not null default 'not_started' check (onboarding_status in ('not_started', 'pending', 'verified', 'restricted')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table billing.tutor_payouts (
  id uuid primary key default extensions.gen_random_uuid(),
  tutor_user_id uuid not null references public.tutor_profiles (user_id) on delete cascade,
  period_start date not null,
  period_end date not null,
  amount_minor integer not null default 0,
  currency_code text not null default 'NGN',
  status text not null default 'pending' check (status in ('pending', 'processing', 'paid', 'failed')),
  external_payout_id text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table audit.audit_logs (
  id uuid primary key default extensions.gen_random_uuid(),
  actor_user_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_table text not null,
  entity_id uuid,
  request_id text,
  ip_address inet,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table analytics.domain_events (
  id uuid primary key default extensions.gen_random_uuid(),
  event_name text not null,
  actor_user_id uuid references public.profiles (id) on delete set null,
  subject_table text,
  subject_id uuid,
  event_payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    avatar_path
  )
  values (
    new.id,
    new.email,
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'avatar_path'), '')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_path = coalesce(excluded.avatar_path, public.profiles.avatar_path),
    updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_auth_user();

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute procedure private.touch_updated_at();

create trigger set_grade_bands_updated_at
before update on public.grade_bands
for each row
execute procedure private.touch_updated_at();

create trigger set_grade_levels_updated_at
before update on public.grade_levels
for each row
execute procedure private.touch_updated_at();

create trigger set_subjects_updated_at
before update on public.subjects
for each row
execute procedure private.touch_updated_at();

create trigger set_parent_profiles_updated_at
before update on public.parent_profiles
for each row
execute procedure private.touch_updated_at();

create trigger set_student_profiles_updated_at
before update on public.student_profiles
for each row
execute procedure private.touch_updated_at();

create trigger set_tutor_profiles_updated_at
before update on public.tutor_profiles
for each row
execute procedure private.touch_updated_at();

create trigger set_admin_profiles_updated_at
before update on public.admin_profiles
for each row
execute procedure private.touch_updated_at();

create trigger set_parent_student_links_updated_at
before update on public.parent_student_links
for each row
execute procedure private.touch_updated_at();

create trigger set_classes_updated_at
before update on public.classes
for each row
execute procedure private.touch_updated_at();

create trigger set_class_enrollments_updated_at
before update on public.class_enrollments
for each row
execute procedure private.touch_updated_at();

create trigger set_lessons_updated_at
before update on public.lessons
for each row
execute procedure private.touch_updated_at();

create trigger set_lesson_live_sessions_updated_at
before update on private.lesson_live_sessions
for each row
execute procedure private.touch_updated_at();

create trigger set_lesson_attendance_updated_at
before update on public.lesson_attendance
for each row
execute procedure private.touch_updated_at();

create trigger set_assignments_updated_at
before update on public.assignments
for each row
execute procedure private.touch_updated_at();

create trigger set_assignment_submissions_updated_at
before update on public.assignment_submissions
for each row
execute procedure private.touch_updated_at();

create trigger set_submission_grades_updated_at
before update on public.submission_grades
for each row
execute procedure private.touch_updated_at();

create trigger set_quizzes_updated_at
before update on public.quizzes
for each row
execute procedure private.touch_updated_at();

create trigger set_quiz_questions_updated_at
before update on public.quiz_questions
for each row
execute procedure private.touch_updated_at();

create trigger set_quiz_attempts_updated_at
before update on public.quiz_attempts
for each row
execute procedure private.touch_updated_at();

create trigger set_quiz_responses_updated_at
before update on public.quiz_responses
for each row
execute procedure private.touch_updated_at();

create trigger set_notifications_updated_at
before update on public.notifications
for each row
execute procedure private.touch_updated_at();

create trigger set_notification_deliveries_updated_at
before update on public.notification_deliveries
for each row
execute procedure private.touch_updated_at();

create trigger set_billing_plans_updated_at
before update on billing.plans
for each row
execute procedure private.touch_updated_at();

create trigger set_billing_subscriptions_updated_at
before update on billing.subscriptions
for each row
execute procedure private.touch_updated_at();

create trigger set_billing_invoices_updated_at
before update on billing.invoices
for each row
execute procedure private.touch_updated_at();

create trigger set_billing_payments_updated_at
before update on billing.payments
for each row
execute procedure private.touch_updated_at();

create trigger set_billing_coupons_updated_at
before update on billing.coupons
for each row
execute procedure private.touch_updated_at();

create trigger set_billing_referrals_updated_at
before update on billing.referrals
for each row
execute procedure private.touch_updated_at();

create trigger set_billing_tutor_payout_accounts_updated_at
before update on billing.tutor_payout_accounts
for each row
execute procedure private.touch_updated_at();

create trigger set_billing_tutor_payouts_updated_at
before update on billing.tutor_payouts
for each row
execute procedure private.touch_updated_at();

create index idx_user_roles_user_id on public.user_roles (user_id);
create index idx_parent_student_links_parent on public.parent_student_links (parent_user_id);
create index idx_parent_student_links_student on public.parent_student_links (student_user_id);
create index idx_classes_primary_tutor on public.classes (primary_tutor_user_id);
create index idx_class_enrollments_student on public.class_enrollments (student_user_id);
create index idx_lessons_class_id on public.lessons (class_id);
create index idx_lessons_tutor_user_id on public.lessons (tutor_user_id);
create index idx_assignments_class_id on public.assignments (class_id);
create index idx_assignment_submissions_student_user_id on public.assignment_submissions (student_user_id);
create index idx_quizzes_class_id on public.quizzes (class_id);
create index idx_quiz_attempts_student_user_id on public.quiz_attempts (student_user_id);
create index idx_notifications_recipient_user_id on public.notifications (recipient_user_id, status, created_at desc);
create index idx_billing_subscriptions_account_owner on billing.subscriptions (account_owner_user_id);
create index idx_audit_logs_actor_user_id on audit.audit_logs (actor_user_id, created_at desc);
create index idx_domain_events_event_name on analytics.domain_events (event_name, occurred_at desc);

insert into public.grade_bands (code, name, min_grade, max_grade, sort_order)
values
  ('grades_1_3', 'Grades 1-3', 1, 3, 1),
  ('grades_4_6', 'Grades 4-6', 4, 6, 2),
  ('grades_7_12', 'Grades 7-12', 7, 12, 3)
on conflict (code) do update
set
  name = excluded.name,
  min_grade = excluded.min_grade,
  max_grade = excluded.max_grade,
  sort_order = excluded.sort_order,
  updated_at = timezone('utc', now());

insert into public.grade_levels (code, display_name, numeric_level, band_id)
values
  ('grade_1', 'Grade 1', 1, (select id from public.grade_bands where code = 'grades_1_3')),
  ('grade_2', 'Grade 2', 2, (select id from public.grade_bands where code = 'grades_1_3')),
  ('grade_3', 'Grade 3', 3, (select id from public.grade_bands where code = 'grades_1_3')),
  ('grade_4', 'Grade 4', 4, (select id from public.grade_bands where code = 'grades_4_6')),
  ('grade_5', 'Grade 5', 5, (select id from public.grade_bands where code = 'grades_4_6')),
  ('grade_6', 'Grade 6', 6, (select id from public.grade_bands where code = 'grades_4_6')),
  ('grade_7', 'Grade 7', 7, (select id from public.grade_bands where code = 'grades_7_12')),
  ('grade_8', 'Grade 8', 8, (select id from public.grade_bands where code = 'grades_7_12')),
  ('grade_9', 'Grade 9', 9, (select id from public.grade_bands where code = 'grades_7_12')),
  ('grade_10', 'Grade 10', 10, (select id from public.grade_bands where code = 'grades_7_12')),
  ('grade_11', 'Grade 11', 11, (select id from public.grade_bands where code = 'grades_7_12')),
  ('grade_12', 'Grade 12', 12, (select id from public.grade_bands where code = 'grades_7_12'))
on conflict (code) do update
set
  display_name = excluded.display_name,
  numeric_level = excluded.numeric_level,
  band_id = excluded.band_id,
  updated_at = timezone('utc', now());

insert into public.subjects (slug, name, is_core)
values
  ('mathematics', 'Mathematics', true),
  ('english-language', 'English Language', true),
  ('basic-science', 'Basic Science', true),
  ('social-studies', 'Social Studies', true),
  ('computer-studies', 'Computer Studies', true),
  ('creative-arts', 'Creative Arts', false),
  ('civic-education', 'Civic Education', false),
  ('biology', 'Biology', true),
  ('chemistry', 'Chemistry', true),
  ('physics', 'Physics', true)
on conflict (slug) do update
set
  name = excluded.name,
  is_core = excluded.is_core,
  updated_at = timezone('utc', now());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', false, 5242880, array['image/png', 'image/jpeg', 'image/webp']),
  ('assignment-assets', 'assignment-assets', false, 52428800, array['application/pdf', 'image/png', 'image/jpeg', 'video/mp4']),
  ('student-work', 'student-work', false, 52428800, array['application/pdf', 'image/png', 'image/jpeg', 'video/mp4']),
  ('lesson-resources', 'lesson-resources', false, 52428800, array['application/pdf', 'image/png', 'image/jpeg', 'video/mp4'])
on conflict (id) do nothing;
