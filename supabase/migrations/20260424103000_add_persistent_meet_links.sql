-- Add persistent_meet_url to student_profiles
alter table public.student_profiles 
add column if not exists personal_meet_url text;

-- Add host_url to student_profiles for the tutor's use
alter table public.student_profiles 
add column if not exists personal_meet_host_url text;

-- Comment on columns
comment on column public.student_profiles.personal_meet_url is 'The student''s persistent Google Meet link for all lessons.';
comment on column public.student_profiles.personal_meet_host_url is 'The tutor''s host link for the student''s persistent Google Meet.';
