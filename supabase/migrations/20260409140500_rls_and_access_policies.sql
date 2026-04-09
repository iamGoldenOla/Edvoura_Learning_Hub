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
