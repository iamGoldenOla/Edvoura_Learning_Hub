-- ============================================================================
-- PRIORITY 2: SECTION C (PROGRAMMATIC SEO PAGES) & SECTION D (TOPIC MASTERY ANALYTICS)
-- Date: 2026-08-19
-- ============================================================================

-- 1. SEO LANDING PAGES (Section C)
CREATE TABLE IF NOT EXISTS public.seo_landing_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID REFERENCES public.subject_catalog(id) ON DELETE CASCADE,
    region_code VARCHAR(20) NOT NULL DEFAULT 'NG',
    grade_band VARCHAR(20) NOT NULL DEFAULT '1-3',
    slug TEXT UNIQUE NOT NULL,
    meta_title TEXT NOT NULL,
    meta_description TEXT NOT NULL,
    intro_content TEXT NOT NULL,
    sample_question_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    last_regenerated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seo_landing_pages_slug 
  ON public.seo_landing_pages (slug);

-- Seed Initial Landing Page Entry for Nigeria Primary 3 Mathematics
INSERT INTO public.seo_landing_pages (region_code, grade_band, slug, meta_title, meta_description, intro_content, sample_question_ids)
VALUES (
  'NG',
  '1-3',
  'practice-ng-grade-3-mathematics',
  'Primary 3 Mathematics Practice Questions & Quiz — Edvoura Nigeria',
  'Practice Primary 3 Mathematics questions aligned to the NERDC curriculum in Nigeria. Free sample questions, place values, addition, and interactive drills.',
  'Master Primary 3 Mathematics in Nigeria with Edvoura Learning Hub. Our question bank is specifically aligned to the NERDC curriculum standard, covering place values, double-digit addition, basic geometry, and mental arithmetic designed for Grade 3 pupils in Lagos, Abuja, and across Nigeria.',
  '[]'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- 2. TOPIC MASTERY (Section D Analytics)
CREATE TABLE IF NOT EXISTS public.topic_mastery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    correct_count INT NOT NULL DEFAULT 0,
    attempt_count INT NOT NULL DEFAULT 0,
    mastery_score NUMERIC(5,2) NOT NULL DEFAULT 0.00, -- Computed percentage (0.00 to 100.00)
    last_attempted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, subject, topic)
);

CREATE INDEX IF NOT EXISTS idx_topic_mastery_student 
  ON public.topic_mastery (student_id, subject, mastery_score);

-- RLS POLICIES
ALTER TABLE public.seo_landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_mastery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select seo_landing_pages" ON public.seo_landing_pages FOR SELECT USING (true);
CREATE POLICY "Allow public insert seo_landing_pages" ON public.seo_landing_pages FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow student select topic_mastery" ON public.topic_mastery FOR SELECT USING (true);
CREATE POLICY "Allow student upsert topic_mastery" ON public.topic_mastery FOR ALL USING (true);
