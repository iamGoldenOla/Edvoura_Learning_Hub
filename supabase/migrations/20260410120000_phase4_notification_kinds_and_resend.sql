-- Phase 4: Add new notification kinds for alerting workflows

alter type public.notification_kind add value if not exists 'assignment_overdue';
alter type public.notification_kind add value if not exists 'tutor_ungraded_reminder';
alter type public.notification_kind add value if not exists 'lesson_upcoming_tutor';
