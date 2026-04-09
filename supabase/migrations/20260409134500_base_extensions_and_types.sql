create extension if not exists pgcrypto with schema extensions;
create extension if not exists citext with schema extensions;
create extension if not exists pgmq with schema extensions;
create extension if not exists pg_cron with schema extensions;

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
