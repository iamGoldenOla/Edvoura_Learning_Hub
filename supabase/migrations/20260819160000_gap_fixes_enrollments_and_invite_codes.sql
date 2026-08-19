-- ============================================================================
-- GAP FIXES: CLASSROOM INVITE CODES & GUARDIAN VERIFICATION
-- Date: 2026-08-19
-- ============================================================================

-- Add invite_code to classrooms
ALTER TABLE public.classrooms 
  ADD COLUMN IF NOT EXISTS invite_code VARCHAR(20) UNIQUE;

-- Create default classroom for testing
INSERT INTO public.classrooms (id, teacher_id, name, region, grade_band, invite_code)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000002',
  'Primary 3 Excellence Class',
  'NG',
  '1-3',
  'EDV-3A-9812'
)
ON CONFLICT (id) DO NOTHING;
