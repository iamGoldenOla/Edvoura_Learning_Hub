-- Add portal_access_blocked to parent_profiles for manual admin access gating
alter table public.parent_profiles
add column if not exists portal_access_blocked boolean not null default false;
