alter table public.ai_generated_content
  drop constraint if exists ai_generated_content_content_type_check;

alter table public.ai_generated_content
  add constraint ai_generated_content_content_type_check
  check (content_type in ('lesson_note', 'story', 'comprehension', 'quiz', 'worksheet', 'spelling_bee'));
