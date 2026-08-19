-- ============================================================================
-- EXACT INDIVIDUAL GRADE LEVELS (GRADES 1 TO 12 UNIQUE DISCRIMINATORS)
-- Date: 2026-08-19
-- ============================================================================

-- Add specific_grade to question_bank (e.g. 'Grade 1', 'Grade 2', 'Grade 3', 'JSS 1', 'SS 3', 'Year 10', 'Class 12')
ALTER TABLE public.question_bank 
  ADD COLUMN IF NOT EXISTS specific_grade VARCHAR(50) NOT NULL DEFAULT 'Grade 3';

-- Add specific_grade to classrooms
ALTER TABLE public.classrooms 
  ADD COLUMN IF NOT EXISTS specific_grade VARCHAR(50) NOT NULL DEFAULT 'Grade 3';

CREATE INDEX IF NOT EXISTS idx_question_bank_exact_grade 
  ON public.question_bank (curriculum_region, subject, specific_grade, status);

CREATE INDEX IF NOT EXISTS idx_classrooms_exact_grade 
  ON public.classrooms (specific_grade);
