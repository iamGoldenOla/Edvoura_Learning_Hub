-- Insert 'Games' into the public.subjects table
INSERT INTO public.subjects (slug, name, is_core, is_active)
VALUES ('games', 'Games', false, true)
ON CONFLICT (slug) DO UPDATE
SET 
  name = EXCLUDED.name,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc', now());
