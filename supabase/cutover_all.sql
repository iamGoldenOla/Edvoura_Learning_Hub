create extension if not exists pgcrypto with schema extensions;
create extension if not exists citext with schema extensions;
create extension if not exists pgmq;
create extension if not exists pg_cron;

create schema if not exists private;
create schema if not exists billing;
create schema if not exists audit;
create schema if not exists analytics;

do $$
begin
  create type public.app_role as enum (
    'student',
    'parent',
    'tutor',
    'admin',
    'super_admin'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.guardian_relationship as enum (
    'mother',
    'father',
    'guardian',
    'sibling',
    'other'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.tutor_approval_status as enum (
    'pending',
    'approved',
    'rejected',
    'suspended'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.class_status as enum (
    'draft',
    'active',
    'completed',
    'archived'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.live_class_provider as enum (
    'zoom',
    'google_meet',
    'native_later'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.lesson_status as enum (
    'draft',
    'scheduled',
    'live',
    'completed',
    'cancelled'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.attendance_status as enum (
    'present',
    'absent',
    'late',
    'excused'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.assignment_status as enum (
    'draft',
    'published',
    'closed',
    'archived'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.submission_status as enum (
    'draft',
    'submitted',
    'late',
    'graded',
    'returned'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.quiz_status as enum (
    'draft',
    'published',
    'closed',
    'archived'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.quiz_attempt_status as enum (
    'in_progress',
    'submitted',
    'graded',
    'timed_out'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.notification_status as enum (
    'unread',
    'read',
    'archived'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.notification_channel as enum (
    'in_app',
    'email'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.notification_kind as enum (
    'lesson_reminder',
    'assignment_due',
    'submission_graded',
    'billing_issue',
    'admin_alert'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type billing.subscription_status as enum (
    'trialing',
    'active',
    'past_due',
    'cancelled',
    'incomplete',
    'paused'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type billing.invoice_status as enum (
    'draft',
    'open',
    'paid',
    'void',
    'uncollectible'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type billing.payment_status as enum (
    'pending',
    'succeeded',
    'failed',
    'refunded',
    'partially_refunded'
  );
exception
  when duplicate_object then null;
end
$$;

create or replace function private.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email extensions.citext not null unique,
  full_name text,
  phone_number text,
  avatar_path text,
  timezone text not null default 'Africa/Lagos',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_roles (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.app_role not null,
  granted_by_user_id uuid references public.profiles (id),
  granted_at timestamptz not null default timezone('utc', now()),
  revoked_at timestamptz,
  unique (user_id, role)
);

create table if not exists public.grade_bands (
  id uuid primary key default extensions.gen_random_uuid(),
  code text not null unique,
  name text not null,
  min_grade smallint not null,
  max_grade smallint not null,
  sort_order integer not null unique,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.grade_levels (
  id uuid primary key default extensions.gen_random_uuid(),
  code text not null unique,
  display_name text not null,
  numeric_level smallint not null unique,
  band_id uuid not null references public.grade_bands (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.subjects (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique,
  name text not null unique,
  is_core boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.parent_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  preferred_contact_method text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.student_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  grade_level_id uuid not null references public.grade_levels (id),
  learner_band_id uuid not null references public.grade_bands (id),
  school_name text,
  academic_goal_notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tutor_profiles (
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

create table if not exists public.admin_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  title text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.parent_student_links (
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

create table if not exists public.classes (
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

create table if not exists public.class_enrollments (
  id uuid primary key default extensions.gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  student_user_id uuid not null references public.student_profiles (user_id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'paused', 'completed', 'withdrawn')),
  enrolled_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (class_id, student_user_id)
);

create table if not exists public.lessons (
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

create table if not exists private.lesson_live_sessions (
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

create table if not exists public.lesson_attendance (
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

create table if not exists public.assignments (
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

create table if not exists public.assignment_files (
  id uuid primary key default extensions.gen_random_uuid(),
  assignment_id uuid not null references public.assignments (id) on delete cascade,
  bucket_id text not null,
  object_path text not null,
  uploaded_by_user_id uuid not null references public.profiles (id),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.assignment_submissions (
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

create table if not exists public.submission_files (
  id uuid primary key default extensions.gen_random_uuid(),
  submission_id uuid not null references public.assignment_submissions (id) on delete cascade,
  bucket_id text not null,
  object_path text not null,
  uploaded_by_user_id uuid not null references public.profiles (id),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.submission_grades (
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

create table if not exists public.quizzes (
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

create table if not exists public.quiz_questions (
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

create table if not exists public.quiz_attempts (
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

create table if not exists public.quiz_responses (
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

create table if not exists public.progress_snapshots (
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

create table if not exists public.notifications (
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

create table if not exists public.notification_deliveries (
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

create table if not exists billing.plans (
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

create table if not exists billing.subscriptions (
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

create table if not exists billing.invoices (
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

create table if not exists billing.payments (
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

create table if not exists billing.coupons (
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

create table if not exists billing.referrals (
  id uuid primary key default extensions.gen_random_uuid(),
  referrer_user_id uuid not null references public.profiles (id) on delete cascade,
  referred_user_id uuid references public.profiles (id) on delete set null,
  code text not null unique,
  reward_status text not null default 'pending' check (reward_status in ('pending', 'earned', 'paid', 'cancelled')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists billing.tutor_payout_accounts (
  id uuid primary key default extensions.gen_random_uuid(),
  tutor_user_id uuid not null unique references public.tutor_profiles (user_id) on delete cascade,
  stripe_connected_account_id text unique,
  onboarding_status text not null default 'not_started' check (onboarding_status in ('not_started', 'pending', 'verified', 'restricted')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists billing.tutor_payouts (
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

create table if not exists audit.audit_logs (
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

create table if not exists analytics.domain_events (
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
revoke all on schema private from anon, authenticated;
revoke all on schema billing from anon;
revoke all on schema audit from anon, authenticated;
revoke all on schema analytics from anon, authenticated;

create or replace function private.current_user_has_role(required_role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and role = required_role
      and revoked_at is null
  );
$$;

create or replace function private.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    private.current_user_has_role('admin'::public.app_role)
    or private.current_user_has_role('super_admin'::public.app_role);
$$;

create or replace function private.can_access_student(target_student_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    auth.uid() = target_student_user_id
    or private.current_user_is_admin()
    or exists (
      select 1
      from public.parent_student_links psl
      where psl.student_user_id = target_student_user_id
        and psl.parent_user_id = auth.uid()
        and psl.is_active = true
    )
    or exists (
      select 1
      from public.class_enrollments ce
      join public.classes c
        on c.id = ce.class_id
      where ce.student_user_id = target_student_user_id
        and c.primary_tutor_user_id = auth.uid()
        and ce.status = 'active'
    );
$$;

create or replace function private.can_access_class(target_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    private.current_user_is_admin()
    or exists (
      select 1
      from public.classes c
      where c.id = target_class_id
        and (
          c.primary_tutor_user_id = auth.uid()
          or c.created_by_user_id = auth.uid()
        )
    )
    or exists (
      select 1
      from public.class_enrollments ce
      left join public.parent_student_links psl
        on psl.student_user_id = ce.student_user_id
       and psl.parent_user_id = auth.uid()
       and psl.is_active = true
      where ce.class_id = target_class_id
        and ce.status = 'active'
        and (
          ce.student_user_id = auth.uid()
          or psl.id is not null
        )
    );
$$;

create or replace function private.can_access_lesson(target_lesson_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    private.current_user_is_admin()
    or exists (
      select 1
      from public.lessons l
      where l.id = target_lesson_id
        and l.tutor_user_id = auth.uid()
    )
    or exists (
      select 1
      from public.lessons l
      where l.id = target_lesson_id
        and private.can_access_class(l.class_id)
    );
$$;

create or replace function private.can_access_assignment(target_assignment_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    private.current_user_is_admin()
    or exists (
      select 1
      from public.assignments a
      where a.id = target_assignment_id
        and (
          a.created_by_user_id = auth.uid()
          or private.can_access_class(a.class_id)
        )
    );
$$;

create or replace function private.can_access_submission(target_submission_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    private.current_user_is_admin()
    or exists (
      select 1
      from public.assignment_submissions s
      join public.assignments a
        on a.id = s.assignment_id
      left join public.parent_student_links psl
        on psl.student_user_id = s.student_user_id
       and psl.parent_user_id = auth.uid()
       and psl.is_active = true
      where s.id = target_submission_id
        and (
          s.student_user_id = auth.uid()
          or psl.id is not null
          or a.created_by_user_id = auth.uid()
          or private.can_access_class(a.class_id)
        )
    );
$$;

create or replace function private.can_access_quiz(target_quiz_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    private.current_user_is_admin()
    or exists (
      select 1
      from public.quizzes q
      where q.id = target_quiz_id
        and (
          q.created_by_user_id = auth.uid()
          or private.can_access_class(q.class_id)
        )
    );
$$;

create or replace function private.can_access_quiz_attempt(target_attempt_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    private.current_user_is_admin()
    or exists (
      select 1
      from public.quiz_attempts qa
      join public.quizzes q
        on q.id = qa.quiz_id
      left join public.parent_student_links psl
        on psl.student_user_id = qa.student_user_id
       and psl.parent_user_id = auth.uid()
       and psl.is_active = true
      where qa.id = target_attempt_id
        and (
          qa.student_user_id = auth.uid()
          or psl.id is not null
          or q.created_by_user_id = auth.uid()
          or private.can_access_class(q.class_id)
        )
    );
$$;

create or replace function private.can_access_billing_account(target_account_owner_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() = target_account_owner_user_id or private.current_user_is_admin();
$$;

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.grade_bands enable row level security;
alter table public.grade_levels enable row level security;
alter table public.subjects enable row level security;
alter table public.parent_profiles enable row level security;
alter table public.student_profiles enable row level security;
alter table public.tutor_profiles enable row level security;
alter table public.admin_profiles enable row level security;
alter table public.parent_student_links enable row level security;
alter table public.classes enable row level security;
alter table public.class_enrollments enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_attendance enable row level security;
alter table public.assignments enable row level security;
alter table public.assignment_files enable row level security;
alter table public.assignment_submissions enable row level security;
alter table public.submission_files enable row level security;
alter table public.submission_grades enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.quiz_responses enable row level security;
alter table public.progress_snapshots enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_deliveries enable row level security;
alter table billing.plans enable row level security;
alter table billing.subscriptions enable row level security;
alter table billing.invoices enable row level security;
alter table billing.payments enable row level security;
alter table billing.coupons enable row level security;
alter table billing.referrals enable row level security;
alter table billing.tutor_payout_accounts enable row level security;
alter table billing.tutor_payouts enable row level security;

create policy "profiles_select_self_admin_or_linked_student"
on public.profiles
for select
using (
  id = auth.uid()
  or private.current_user_is_admin()
  or private.can_access_student(id)
);

create policy "profiles_update_self"
on public.profiles
for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "user_roles_select_self_or_admin"
on public.user_roles
for select
using (
  user_id = auth.uid()
  or private.current_user_is_admin()
);

create policy "grade_bands_select_authenticated"
on public.grade_bands
for select
using (auth.uid() is not null);

create policy "grade_levels_select_authenticated"
on public.grade_levels
for select
using (auth.uid() is not null);

create policy "subjects_select_authenticated"
on public.subjects
for select
using (auth.uid() is not null);

create policy "parent_profiles_select_self_or_admin"
on public.parent_profiles
for select
using (
  user_id = auth.uid()
  or private.current_user_is_admin()
);

create policy "parent_profiles_update_self"
on public.parent_profiles
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "student_profiles_select_authorized"
on public.student_profiles
for select
using (
  private.can_access_student(user_id)
  or private.current_user_is_admin()
);

create policy "tutor_profiles_select_self_or_admin"
on public.tutor_profiles
for select
using (
  user_id = auth.uid()
  or private.current_user_is_admin()
);

create policy "tutor_profiles_update_self"
on public.tutor_profiles
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "admin_profiles_select_self_or_admin"
on public.admin_profiles
for select
using (
  user_id = auth.uid()
  or private.current_user_is_admin()
);

create policy "parent_student_links_select_authorized"
on public.parent_student_links
for select
using (
  parent_user_id = auth.uid()
  or student_user_id = auth.uid()
  or private.current_user_is_admin()
);

create policy "classes_select_authorized"
on public.classes
for select
using (private.can_access_class(id));

create policy "class_enrollments_select_authorized"
on public.class_enrollments
for select
using (
  student_user_id = auth.uid()
  or private.can_access_class(class_id)
  or private.current_user_is_admin()
);

create policy "lessons_select_authorized"
on public.lessons
for select
using (private.can_access_lesson(id));

create policy "lesson_attendance_select_authorized"
on public.lesson_attendance
for select
using (
  student_user_id = auth.uid()
  or private.can_access_lesson(lesson_id)
  or private.current_user_is_admin()
  or exists (
    select 1
    from public.parent_student_links psl
    where psl.student_user_id = student_user_id
      and psl.parent_user_id = auth.uid()
      and psl.is_active = true
  )
);

create policy "assignments_select_authorized"
on public.assignments
for select
using (private.can_access_assignment(id));

create policy "assignment_files_select_authorized"
on public.assignment_files
for select
using (private.can_access_assignment(assignment_id));

create policy "assignment_submissions_select_authorized"
on public.assignment_submissions
for select
using (private.can_access_submission(id));

create policy "submission_files_select_authorized"
on public.submission_files
for select
using (private.can_access_submission(submission_id));

create policy "submission_grades_select_authorized"
on public.submission_grades
for select
using (private.can_access_submission(submission_id));

create policy "quizzes_select_authorized"
on public.quizzes
for select
using (private.can_access_quiz(id));

create policy "quiz_questions_select_authorized"
on public.quiz_questions
for select
using (private.can_access_quiz(quiz_id));

create policy "quiz_attempts_select_authorized"
on public.quiz_attempts
for select
using (private.can_access_quiz_attempt(id));

create policy "quiz_responses_select_authorized"
on public.quiz_responses
for select
using (private.can_access_quiz_attempt(attempt_id));

create policy "progress_snapshots_select_authorized"
on public.progress_snapshots
for select
using (
  private.can_access_student(student_user_id)
  or private.current_user_is_admin()
);

create policy "notifications_select_recipient"
on public.notifications
for select
using (recipient_user_id = auth.uid());

create policy "notification_deliveries_select_recipient"
on public.notification_deliveries
for select
using (
  exists (
    select 1
    from public.notifications n
    where n.id = notification_id
      and n.recipient_user_id = auth.uid()
  )
);

create policy "billing_plans_select_active_authenticated"
on billing.plans
for select
using (is_active = true and auth.uid() is not null);

create policy "billing_subscriptions_select_owner_or_admin"
on billing.subscriptions
for select
using (private.can_access_billing_account(account_owner_user_id));

create policy "billing_invoices_select_owner_or_admin"
on billing.invoices
for select
using (
  private.current_user_is_admin()
  or exists (
    select 1
    from billing.subscriptions s
    where s.id = subscription_id
      and private.can_access_billing_account(s.account_owner_user_id)
  )
);

create policy "billing_payments_select_owner_or_admin"
on billing.payments
for select
using (
  private.current_user_is_admin()
  or exists (
    select 1
    from billing.invoices i
    join billing.subscriptions s
      on s.id = i.subscription_id
    where i.id = invoice_id
      and private.can_access_billing_account(s.account_owner_user_id)
  )
);

create policy "billing_coupons_select_authenticated"
on billing.coupons
for select
using (is_active = true and auth.uid() is not null);

create policy "billing_referrals_select_owner_or_admin"
on billing.referrals
for select
using (
  referrer_user_id = auth.uid()
  or referred_user_id = auth.uid()
  or private.current_user_is_admin()
);

create policy "billing_tutor_payout_accounts_select_owner_or_admin"
on billing.tutor_payout_accounts
for select
using (
  tutor_user_id = auth.uid()
  or private.current_user_is_admin()
);

create policy "billing_tutor_payouts_select_owner_or_admin"
on billing.tutor_payouts
for select
using (
  tutor_user_id = auth.uid()
  or private.current_user_is_admin()
);

create policy "storage_avatars_select_owner"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'avatars'
  and ((storage.foldername(name))[1] = auth.uid()::text or private.current_user_is_admin())
);

create policy "storage_avatars_insert_owner"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);
-- Phase 3: Rename Stripe columns to Paystack equivalents
-- The Kysely types already reference paystack_* names. This migration aligns the DB columns.

-- billing.plans: stripe_price_id → paystack_plan_code
alter table billing.plans rename column stripe_price_id to paystack_plan_code;

-- billing.subscriptions: stripe_customer_id → paystack_customer_code
alter table billing.subscriptions rename column stripe_customer_id to paystack_customer_code;

-- billing.subscriptions: stripe_subscription_id → paystack_subscription_code
alter table billing.subscriptions rename column stripe_subscription_id to paystack_subscription_code;

-- billing.invoices: stripe_invoice_id → paystack_reference
alter table billing.invoices rename column stripe_invoice_id to paystack_reference;

-- billing.payments: stripe_payment_intent_id → paystack_payment_reference
alter table billing.payments rename column stripe_payment_intent_id to paystack_payment_reference;

-- billing.tutor_payout_accounts: stripe_connected_account_id → paystack_subaccount_code
alter table billing.tutor_payout_accounts rename column stripe_connected_account_id to paystack_subaccount_code;

-- Add paystack_customer_code to parent_profiles for quick lookup
alter table public.parent_profiles
  add column if not exists paystack_customer_code text unique;
-- Phase 4: Add new notification kinds for alerting workflows

alter type public.notification_kind add value if not exists 'assignment_overdue';
alter type public.notification_kind add value if not exists 'tutor_ungraded_reminder';
alter type public.notification_kind add value if not exists 'lesson_upcoming_tutor';
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

create policy "tutor_live_content_posts_select_authenticated"
on public.tutor_live_content_posts
for select
using (auth.uid() is not null);

create policy "tutor_live_content_posts_insert_tutor_only"
on public.tutor_live_content_posts
for insert
with check (
  auth.uid() = tutor_user_id
  and private.current_user_has_role('tutor'::public.app_role)
);

create policy "tutor_live_content_posts_update_owner_tutor_only"
on public.tutor_live_content_posts
for update
using (
  auth.uid() = tutor_user_id
  and private.current_user_has_role('tutor'::public.app_role)
)
with check (
  auth.uid() = tutor_user_id
  and private.current_user_has_role('tutor'::public.app_role)
);

create policy "dashboard_chat_messages_select_channel_role_members"
on public.dashboard_chat_messages
for select
using (
  auth.uid() is not null
  and (
    (channel_id = 'tutor-parent' and (private.current_user_has_role('tutor'::public.app_role) or private.current_user_has_role('parent'::public.app_role)))
    or (channel_id = 'tutor-student-7-12' and (private.current_user_has_role('tutor'::public.app_role) or private.current_user_has_role('student'::public.app_role)))
    or (channel_id = 'parent-student-7-12' and (private.current_user_has_role('parent'::public.app_role) or private.current_user_has_role('student'::public.app_role)))
  )
);

create policy "dashboard_chat_messages_insert_sender_only"
on public.dashboard_chat_messages
for insert
with check (
  auth.uid() = sender_user_id
  and (
    (channel_id = 'tutor-parent' and sender_role in ('tutor', 'parent'))
    or (channel_id = 'tutor-student-7-12' and sender_role in ('tutor', 'student'))
    or (channel_id = 'parent-student-7-12' and sender_role in ('parent', 'student'))
  )
);
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

create policy "learning_activity_events_select_admin_tutor_parent_student"
on public.learning_activity_events
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

create policy "learning_activity_events_insert_admin_tutor"
on public.learning_activity_events
for insert
with check (
  auth.uid() is not null
  and (
    private.current_user_is_admin()
    or private.current_user_has_role('tutor'::public.app_role)
  )
);
alter table public.classes
add column if not exists grade_level_id uuid references public.grade_levels (id);

create index if not exists idx_classes_grade_level_id
on public.classes (grade_level_id);

create or replace function public.sync_current_user_membership()
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text := nullif(trim(coalesce(auth.jwt() ->> 'email', '')), '');
  v_metadata jsonb := coalesce(auth.jwt() -> 'user_metadata', '{}'::jsonb);
  v_role_text text := lower(coalesce(nullif(trim(v_metadata ->> 'role'), ''), 'student'));
  v_role public.app_role := case
    when v_role_text in ('student', 'parent', 'tutor', 'admin', 'super_admin') then v_role_text::public.app_role
    else 'student'::public.app_role
  end;
  v_full_name text := nullif(trim(v_metadata ->> 'full_name'), '');
  v_grade_level_code text := coalesce(
    nullif(trim(v_metadata ->> 'grade_level_code'), ''),
    case
      when coalesce(v_metadata ->> 'selected_grade', '') ~ '^[0-9]+$' then 'grade_' || (v_metadata ->> 'selected_grade')
      else null
    end
  );
  v_school_name text := nullif(trim(v_metadata ->> 'school_name'), '');
  v_academic_goal_notes text := nullif(trim(v_metadata ->> 'academic_goal_notes'), '');
  v_grade_level_id uuid;
  v_band_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  insert into public.profiles (id, email, full_name)
  values (v_user_id, coalesce(v_email, v_user_id::text || '@placeholder.local'), v_full_name)
  on conflict (id) do update
  set
    email = coalesce(excluded.email, public.profiles.email),
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    updated_at = timezone('utc', now());

  insert into public.user_roles (user_id, role)
  values (v_user_id, v_role)
  on conflict (user_id, role) do update
  set revoked_at = null;

  if v_role = 'student' then
    select gl.id, gl.band_id
    into v_grade_level_id, v_band_id
    from public.grade_levels gl
    where gl.code = coalesce(v_grade_level_code, 'grade_7')
    limit 1;

    if v_grade_level_id is not null then
      insert into public.student_profiles (
        user_id,
        grade_level_id,
        learner_band_id,
        school_name,
        academic_goal_notes
      )
      values (
        v_user_id,
        v_grade_level_id,
        v_band_id,
        v_school_name,
        v_academic_goal_notes
      )
      on conflict (user_id) do update
      set
        grade_level_id = excluded.grade_level_id,
        learner_band_id = excluded.learner_band_id,
        school_name = coalesce(excluded.school_name, public.student_profiles.school_name),
        academic_goal_notes = coalesce(excluded.academic_goal_notes, public.student_profiles.academic_goal_notes),
        updated_at = timezone('utc', now());

      insert into public.class_enrollments (class_id, student_user_id, status)
      select c.id, v_user_id, 'active'
      from public.classes c
      where c.status = 'active'
        and c.grade_level_id = v_grade_level_id
      on conflict (class_id, student_user_id) do update
      set
        status = 'active',
        updated_at = timezone('utc', now());
    end if;
  elsif v_role = 'parent' then
    insert into public.parent_profiles (user_id)
    values (v_user_id)
    on conflict (user_id) do update
    set updated_at = timezone('utc', now());
  elsif v_role = 'tutor' then
    insert into public.tutor_profiles (user_id, approval_status)
    values (v_user_id, 'approved')
    on conflict (user_id) do update
    set updated_at = timezone('utc', now());
  elsif v_role in ('admin', 'super_admin') then
    insert into public.admin_profiles (user_id)
    values (v_user_id)
    on conflict (user_id) do update
    set updated_at = timezone('utc', now());
  end if;

  return jsonb_build_object(
    'user_id', v_user_id,
    'role', v_role,
    'grade_level_code', v_grade_level_code
  );
end;
$$;

create or replace function public.create_tutor_assignment(
  assignment_title text,
  subject_name text,
  grade_level_code text,
  assignment_instructions text default null,
  due_at timestamptz default null,
  points_possible numeric default 100
)
returns table (
  assignment_id uuid,
  class_id uuid,
  enrolled_students integer
)
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_user_id uuid := auth.uid();
  v_subject_id uuid;
  v_grade_level_id uuid;
  v_grade_band_id uuid;
  v_grade_display_name text;
  v_subject_display_name text;
  v_class_id uuid;
  v_enrolled_count integer := 0;
  v_slug text;
begin
  perform public.sync_current_user_membership();

  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if not (private.current_user_has_role('tutor'::public.app_role) or private.current_user_is_admin()) then
    raise exception 'Only tutors can create assignments';
  end if;

  select gl.id, gl.band_id, gl.display_name
  into v_grade_level_id, v_grade_band_id, v_grade_display_name
  from public.grade_levels gl
  where gl.code = grade_level_code
  limit 1;

  if v_grade_level_id is null then
    raise exception 'Unknown grade level code: %', grade_level_code;
  end if;

  select s.id, s.name
  into v_subject_id, v_subject_display_name
  from public.subjects s
  where lower(s.name) = lower(trim(subject_name))
  limit 1;

  if v_subject_id is null then
    v_slug := regexp_replace(lower(trim(subject_name)), '[^a-z0-9]+', '-', 'g');

    insert into public.subjects (slug, name, is_core, is_active)
    values (v_slug, trim(subject_name), true, true)
    returning id, name into v_subject_id, v_subject_display_name;
  end if;

  select c.id
  into v_class_id
  from public.classes c
  where c.primary_tutor_user_id = v_user_id
    and c.subject_id = v_subject_id
    and c.grade_level_id = v_grade_level_id
    and c.status in ('draft', 'active')
  order by case when c.status = 'active' then 0 else 1 end, c.created_at desc
  limit 1;

  if v_class_id is null then
    insert into public.classes (
      subject_id,
      grade_band_id,
      grade_level_id,
      title,
      description,
      status,
      primary_tutor_user_id,
      created_by_user_id,
      starts_on
    )
    values (
      v_subject_id,
      v_grade_band_id,
      v_grade_level_id,
      v_grade_display_name || ' ' || v_subject_display_name,
      'Auto-generated live class for ' || v_grade_display_name || ' ' || v_subject_display_name,
      'active',
      v_user_id,
      v_user_id,
      current_date
    )
    returning id into v_class_id;
  else
    update public.classes
    set
      status = 'active',
      updated_at = timezone('utc', now())
    where id = v_class_id;
  end if;

  insert into public.class_enrollments (class_id, student_user_id, status)
  select v_class_id, sp.user_id, 'active'
  from public.student_profiles sp
  where sp.grade_level_id = v_grade_level_id
  on conflict (class_id, student_user_id) do update
  set
    status = 'active',
    updated_at = timezone('utc', now());

  get diagnostics v_enrolled_count = row_count;

  insert into public.assignments (
    class_id,
    title,
    instructions,
    status,
    due_at,
    points_possible,
    created_by_user_id
  )
  values (
    v_class_id,
    trim(assignment_title),
    nullif(trim(coalesce(assignment_instructions, '')), ''),
    'published',
    due_at,
    coalesce(points_possible, 100),
    v_user_id
  )
  returning id into assignment_id;

  insert into public.assignment_submissions (assignment_id, student_user_id, status)
  select assignment_id, ce.student_user_id, 'draft'
  from public.class_enrollments ce
  where ce.class_id = v_class_id
    and ce.status = 'active'
  on conflict (assignment_id, student_user_id) do nothing;

  class_id := v_class_id;
  enrolled_students := (
    select count(*)
    from public.class_enrollments ce
    where ce.class_id = v_class_id
      and ce.status = 'active'
  );

  return next;
end;
$$;

create or replace function public.submit_student_assignment(
  target_assignment_id uuid,
  submission_text text default null,
  submission_metadata jsonb default '{}'::jsonb
)
returns table (
  submission_id uuid,
  submission_status public.submission_status
)
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_user_id uuid := auth.uid();
  v_due_at timestamptz;
  v_class_id uuid;
begin
  perform public.sync_current_user_membership();

  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if not private.current_user_has_role('student'::public.app_role) then
    raise exception 'Only students can submit assignments';
  end if;

  select a.due_at, a.class_id
  into v_due_at, v_class_id
  from public.assignments a
  where a.id = target_assignment_id;

  if v_class_id is null then
    raise exception 'Assignment not found';
  end if;

  if not exists (
    select 1
    from public.class_enrollments ce
    where ce.class_id = v_class_id
      and ce.student_user_id = v_user_id
      and ce.status = 'active'
  ) then
    raise exception 'You are not enrolled in this class';
  end if;

  insert into public.assignment_submissions (
    assignment_id,
    student_user_id,
    status,
    submitted_at,
    text_response,
    metadata
  )
  values (
    target_assignment_id,
    v_user_id,
    case
      when v_due_at is not null and timezone('utc', now()) > v_due_at then 'late'::public.submission_status
      else 'submitted'::public.submission_status
    end,
    timezone('utc', now()),
    nullif(trim(coalesce(submission_text, '')), ''),
    coalesce(submission_metadata, '{}'::jsonb)
  )
  on conflict (assignment_id, student_user_id) do update
  set
    status = case
      when v_due_at is not null and timezone('utc', now()) > v_due_at then 'late'::public.submission_status
      else 'submitted'::public.submission_status
    end,
    submitted_at = timezone('utc', now()),
    text_response = nullif(trim(coalesce(excluded.text_response, public.assignment_submissions.text_response, '')), ''),
    metadata = coalesce(public.assignment_submissions.metadata, '{}'::jsonb) || coalesce(excluded.metadata, '{}'::jsonb),
    updated_at = timezone('utc', now())
  returning id, status into submission_id, submission_status;

  return next;
end;
$$;

create or replace function public.grade_student_submission(
  target_submission_id uuid,
  score numeric,
  feedback_text text default null,
  rubric_json jsonb default '{}'::jsonb
)
returns table (
  submission_id uuid,
  graded_score numeric
)
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_user_id uuid := auth.uid();
begin
  perform public.sync_current_user_membership();

  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if not (private.current_user_has_role('tutor'::public.app_role) or private.current_user_is_admin()) then
    raise exception 'Only tutors can grade submissions';
  end if;

  if not private.can_access_submission(target_submission_id) then
    raise exception 'You do not have access to this submission';
  end if;

  insert into public.submission_grades (
    submission_id,
    grader_user_id,
    score,
    feedback_text,
    rubric_json,
    graded_at
  )
  values (
    target_submission_id,
    v_user_id,
    score,
    nullif(trim(coalesce(feedback_text, '')), ''),
    coalesce(rubric_json, '{}'::jsonb),
    timezone('utc', now())
  )
  on conflict (submission_id) do update
  set
    grader_user_id = v_user_id,
    score = excluded.score,
    feedback_text = coalesce(excluded.feedback_text, public.submission_grades.feedback_text),
    rubric_json = coalesce(excluded.rubric_json, '{}'::jsonb),
    graded_at = timezone('utc', now()),
    updated_at = timezone('utc', now());

  update public.assignment_submissions
  set
    status = 'graded',
    updated_at = timezone('utc', now())
  where id = target_submission_id;

  submission_id := target_submission_id;
  graded_score := score;
  return next;
end;
$$;

grant execute on function public.sync_current_user_membership() to authenticated;
grant execute on function public.create_tutor_assignment(text, text, text, text, timestamptz, numeric) to authenticated;
grant execute on function public.submit_student_assignment(uuid, text, jsonb) to authenticated;
grant execute on function public.grade_student_submission(uuid, numeric, text, jsonb) to authenticated;
create policy "storage_assignment_assets_select_authorized"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'assignment-assets'
  and (storage.foldername(name))[1] = 'assignments'
  and array_length(storage.foldername(name), 1) >= 2
  and private.can_access_assignment(((storage.foldername(name))[2])::uuid)
);

create policy "storage_assignment_assets_insert_tutor"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'assignment-assets'
  and (storage.foldername(name))[1] = 'assignments'
  and array_length(storage.foldername(name), 1) >= 2
  and private.can_access_assignment(((storage.foldername(name))[2])::uuid)
  and (
    private.current_user_has_role('tutor'::public.app_role)
    or private.current_user_is_admin()
  )
);

create policy "storage_student_work_select_authorized"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'student-work'
  and (storage.foldername(name))[1] = 'submissions'
  and array_length(storage.foldername(name), 1) >= 2
  and private.can_access_submission(((storage.foldername(name))[2])::uuid)
);

create policy "storage_student_work_insert_authorized"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'student-work'
  and (storage.foldername(name))[1] = 'submissions'
  and array_length(storage.foldername(name), 1) >= 2
  and private.can_access_submission(((storage.foldername(name))[2])::uuid)
);

create or replace function public.attach_assignment_asset(
  target_assignment_id uuid,
  object_path text,
  bucket_id text default 'assignment-assets'
)
returns uuid
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_file_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not private.can_access_assignment(target_assignment_id) then
    raise exception 'You do not have access to this assignment';
  end if;

  if not (
    private.current_user_has_role('tutor'::public.app_role)
    or private.current_user_is_admin()
  ) then
    raise exception 'Only tutors can attach assignment assets';
  end if;

  insert into public.assignment_files (
    assignment_id,
    bucket_id,
    object_path,
    uploaded_by_user_id
  )
  values (
    target_assignment_id,
    bucket_id,
    object_path,
    auth.uid()
  )
  returning id into v_file_id;

  return v_file_id;
end;
$$;

create or replace function public.attach_submission_file(
  target_submission_id uuid,
  object_path text,
  bucket_id text default 'student-work'
)
returns uuid
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_file_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not private.can_access_submission(target_submission_id) then
    raise exception 'You do not have access to this submission';
  end if;

  insert into public.submission_files (
    submission_id,
    bucket_id,
    object_path,
    uploaded_by_user_id
  )
  values (
    target_submission_id,
    bucket_id,
    object_path,
    auth.uid()
  )
  returning id into v_file_id;

  return v_file_id;
end;
$$;

grant execute on function public.attach_assignment_asset(uuid, text, text) to authenticated;
grant execute on function public.attach_submission_file(uuid, text, text) to authenticated;
create or replace function public.create_tutor_live_slot(
  p_class_id uuid,
  p_title text,
  p_scheduled_start_at timestamptz,
  p_scheduled_end_at timestamptz,
  p_join_url text default null,
  p_host_url text default null,
  p_provider public.live_class_provider default 'google_meet'
)
returns table (
  lesson_id uuid,
  join_url text,
  host_url text
)
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_lesson_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not private.current_user_has_role('tutor'::public.app_role)
     and not private.current_user_is_admin() then
    raise exception 'Tutor access required';
  end if;

  if not exists (
    select 1
    from public.classes c
    where c.id = p_class_id
      and c.primary_tutor_user_id = auth.uid()
  ) then
    raise exception 'Selected class is not assigned to the current tutor';
  end if;

  if p_scheduled_end_at <= p_scheduled_start_at then
    raise exception 'Lesson end time must be after the start time';
  end if;

  insert into public.lessons (
    class_id,
    title,
    scheduled_start_at,
    scheduled_end_at,
    provider,
    status
  )
  values (
    p_class_id,
    coalesce(nullif(trim(p_title), ''), 'Live Session'),
    p_scheduled_start_at,
    p_scheduled_end_at,
    p_provider,
    'scheduled'
  )
  returning id into v_lesson_id;

  if coalesce(nullif(trim(p_join_url), ''), null) is not null
     or coalesce(nullif(trim(p_host_url), ''), null) is not null then
    insert into private.lesson_live_sessions (
      lesson_id,
      provider,
      join_url,
      host_url
    )
    values (
      v_lesson_id,
      p_provider,
      nullif(trim(p_join_url), ''),
      nullif(trim(p_host_url), '')
    )
    on conflict (lesson_id) do update
      set provider = excluded.provider,
          join_url = excluded.join_url,
          host_url = excluded.host_url;
  end if;

  return query
  select
    v_lesson_id,
    nullif(trim(p_join_url), ''),
    nullif(trim(p_host_url), '');
end;
$$;

grant execute on function public.create_tutor_live_slot(uuid, text, timestamptz, timestamptz, text, text, public.live_class_provider) to authenticated;

create or replace function public.list_tutor_live_schedule()
returns table (
  id uuid,
  title text,
  class_title text,
  subject_name text,
  grade_level_name text,
  scheduled_start_at timestamptz,
  scheduled_end_at timestamptz,
  status text,
  provider text,
  join_url text,
  host_url text
)
language sql
security definer
set search_path = public, private
as $$
  select
    lesson.id,
    lesson.title,
    class.title as class_title,
    subject.name as subject_name,
    grade_level.display_name as grade_level_name,
    lesson.scheduled_start_at,
    lesson.scheduled_end_at,
    lesson.status::text,
    lesson.provider::text,
    live.join_url,
    live.host_url
  from public.lessons lesson
  join public.classes class
    on class.id = lesson.class_id
  join public.subjects subject
    on subject.id = class.subject_id
  join public.grade_levels grade_level
    on grade_level.id = class.grade_level_id
  left join private.lesson_live_sessions live
    on live.lesson_id = lesson.id
  where class.primary_tutor_user_id = auth.uid()
  order by lesson.scheduled_start_at asc;
$$;

grant execute on function public.list_tutor_live_schedule() to authenticated;

create or replace function public.list_student_live_lessons()
returns table (
  id uuid,
  title text,
  class_title text,
  subject_name text,
  scheduled_start_at timestamptz,
  scheduled_end_at timestamptz,
  status text,
  provider text,
  join_url text
)
language sql
security definer
set search_path = public, private
as $$
  select
    lesson.id,
    lesson.title,
    class.title as class_title,
    subject.name as subject_name,
    lesson.scheduled_start_at,
    lesson.scheduled_end_at,
    lesson.status::text,
    lesson.provider::text,
    live.join_url
  from public.class_enrollments enrollment
  join public.classes class
    on class.id = enrollment.class_id
  join public.subjects subject
    on subject.id = class.subject_id
  join public.lessons lesson
    on lesson.class_id = class.id
  left join private.lesson_live_sessions live
    on live.lesson_id = lesson.id
  where enrollment.student_user_id = auth.uid()
    and enrollment.status = 'active'
    and lesson.status in ('scheduled', 'live')
    and lesson.scheduled_end_at >= timezone('utc', now())
  order by lesson.scheduled_start_at asc;
$$;

grant execute on function public.list_student_live_lessons() to authenticated;
