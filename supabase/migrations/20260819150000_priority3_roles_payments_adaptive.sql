-- ============================================================================
-- PRIORITY 3: SECTION E (TEACHER & PARENT ROLES), SECTION F, G, H
-- Date: 2026-08-19
-- ============================================================================

-- 1. CLASSROOMS (Section E)
CREATE TABLE IF NOT EXISTS public.classrooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL,
    name TEXT NOT NULL,
    region VARCHAR(20) NOT NULL DEFAULT 'NG',
    grade_band VARCHAR(20) NOT NULL DEFAULT '1-3',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_classrooms_teacher 
  ON public.classrooms (teacher_id);

-- 2. CLASSROOM ENROLLMENTS (Section E)
CREATE TABLE IF NOT EXISTS public.classroom_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(classroom_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_classroom_enrollments_student 
  ON public.classroom_enrollments (student_id);

-- 3. GUARDIAN LINKS (Section E Parent Role)
CREATE TABLE IF NOT EXISTS public.guardian_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guardian_id UUID NOT NULL,
    student_id UUID NOT NULL,
    relationship VARCHAR(50) NOT NULL DEFAULT 'parent', -- 'parent', 'guardian', 'sponsor'
    verified_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(guardian_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_guardian_links_guardian 
  ON public.guardian_links (guardian_id);

-- RLS POLICIES
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardian_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow teacher select classrooms" ON public.classrooms FOR SELECT USING (true);
CREATE POLICY "Allow teacher insert classrooms" ON public.classrooms FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow classroom enrollments select" ON public.classroom_enrollments FOR SELECT USING (true);
CREATE POLICY "Allow classroom enrollments insert" ON public.classroom_enrollments FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow guardian links select" ON public.guardian_links FOR SELECT USING (true);
CREATE POLICY "Allow guardian links insert" ON public.guardian_links FOR INSERT WITH CHECK (true);
