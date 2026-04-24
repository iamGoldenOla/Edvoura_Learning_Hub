-- Add start_tutor_lesson RPC
create or replace function public.start_tutor_lesson(p_lesson_id uuid)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if not exists (
    select 1
    from public.lessons lesson
    join public.classes class on class.id = lesson.class_id
    where lesson.id = p_lesson_id
      and class.primary_tutor_user_id = auth.uid()
  ) then
    raise exception 'Lesson not found or not assigned to you';
  end if;

  update public.lessons
  set status = 'live',
      actual_start_at = timezone('utc', now()),
      updated_at = timezone('utc', now())
  where id = p_lesson_id;
end;
$$;

grant execute on function public.start_tutor_lesson(uuid) to authenticated;
