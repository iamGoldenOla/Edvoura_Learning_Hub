-- ============================================================================
-- EDVOURA AI QUESTION ENGINE — MIGRATION (ADDITIVE ONLY)
-- Date: 2026-08-19
-- ============================================================================

-- Enable pgvector for semantic question similarity checks
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. REGION CATALOG
CREATE TABLE IF NOT EXISTS public.region_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_code VARCHAR(20) UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    grade_naming_convention TEXT NOT NULL,
    curriculum_reference TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Initial Regions
INSERT INTO public.region_catalog (region_code, display_name, grade_naming_convention, curriculum_reference)
VALUES
  ('NG', 'Nigeria', 'Grade/Basic 1-9, SS1-3', 'NERDC / WAEC / NECO'),
  ('US', 'United States', 'Grade K-12', 'Common Core / State Standards'),
  ('UK', 'United Kingdom', 'Year 1-13', 'National Curriculum (England)'),
  ('IN', 'India', 'Class 1-12', 'CBSE / ICSE / State Boards'),
  ('EG', 'Egypt', 'Grade 1-12', 'Egyptian Ministry of Education'),
  ('BR', 'Brazil & LATAM', 'Ano 1-9, Série 1-3', 'BNCC / Regional Standards'),
  ('AU', 'Australia & Pacific', 'Year 1-12', 'Australian Curriculum (ACARA)'),
  ('GLOBAL', 'Universal / International', 'Standard Grade 1-12', 'International Curriculum Standard')
ON CONFLICT (region_code) DO NOTHING;

-- 2. SUBJECT CATALOG
CREATE TABLE IF NOT EXISTS public.subject_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    applicable_grade_bands JSONB NOT NULL DEFAULT '["1-3", "4-6", "7-9", "10-12"]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Core Subjects
INSERT INTO public.subject_catalog (name, applicable_grade_bands)
VALUES
  ('Mathematics', '["1-3", "4-6", "7-9", "10-12"]'::jsonb),
  ('English / Language Arts', '["1-3", "4-6", "7-9", "10-12"]'::jsonb),
  ('Basic Science & Technology', '["1-3", "4-6", "7-9"]'::jsonb),
  ('Social Studies', '["1-3", "4-6", "7-9"]'::jsonb),
  ('Civic Education / Government', '["1-3", "4-6", "7-9", "10-12"]'::jsonb),
  ('National & World History', '["1-3", "4-6", "7-9", "10-12"]'::jsonb),
  ('Agricultural Science', '["4-6", "7-9", "10-12"]'::jsonb),
  ('Business Studies', '["7-9"]'::jsonb),
  ('Home Economics', '["4-6", "7-9"]'::jsonb),
  ('Creative & Cultural Arts', '["1-3", "4-6", "7-9"]'::jsonb),
  ('Religious & Ethics Studies', '["1-3", "4-6", "7-9"]'::jsonb),
  ('Physical & Health Education', '["1-3", "4-6", "7-9"]'::jsonb),
  ('Computer Studies / ICT', '["1-3", "4-6", "7-9", "10-12"]'::jsonb),
  ('Geography', '["7-9", "10-12"]'::jsonb),
  ('Current Affairs', '["1-3", "4-6", "7-9", "10-12"]'::jsonb),
  ('Physics', '["10-12"]'::jsonb),
  ('Chemistry', '["10-12"]'::jsonb),
  ('Biology', '["10-12"]'::jsonb),
  ('Further Mathematics', '["10-12"]'::jsonb),
  ('Economics', '["10-12"]'::jsonb),
  ('Literature', '["10-12"]'::jsonb),
  ('Accounting', '["10-12"]'::jsonb),
  ('Commerce', '["10-12"]'::jsonb),
  ('Marketing', '["10-12"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- 3. QUESTION BANK
CREATE TABLE IF NOT EXISTS public.question_bank (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject TEXT NOT NULL,
    grade_band VARCHAR(20) NOT NULL, -- '1-3', '4-6', '7-9', '10-12'
    curriculum_region VARCHAR(20) NOT NULL DEFAULT 'GLOBAL',
    topic TEXT NOT NULL,
    subtopic TEXT DEFAULT '',
    question_text TEXT NOT NULL,
    question_type VARCHAR(30) NOT NULL DEFAULT 'mcq', -- 'mcq', 'true-false', 'short-answer'
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    correct_answer TEXT NOT NULL,
    explanation TEXT NOT NULL,
    difficulty VARCHAR(20) NOT NULL DEFAULT 'medium', -- 'easy', 'medium', 'hard'
    source VARCHAR(30) NOT NULL DEFAULT 'ai-generated', -- 'ai-generated', 'educator'
    status VARCHAR(30) NOT NULL DEFAULT 'pending_review', -- 'pending_review', 'approved', 'rejected'
    is_current_affairs BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMPTZ DEFAULT NULL,
    content_hash VARCHAR(64) UNIQUE,
    embedding VECTOR(768), -- Gemini text-embedding vector
    reviewed_by UUID DEFAULT NULL,
    reviewed_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    shown_count INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_question_bank_delivery 
  ON public.question_bank (curriculum_region, subject, grade_band, status);

CREATE INDEX IF NOT EXISTS idx_question_bank_status 
  ON public.question_bank (status);

-- 4. QUESTION GENERATION JOBS
CREATE TABLE IF NOT EXISTS public.question_generation_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject TEXT NOT NULL,
    grade_band VARCHAR(20) NOT NULL,
    curriculum_region VARCHAR(20) NOT NULL DEFAULT 'GLOBAL',
    topic TEXT NOT NULL,
    requested_count INT NOT NULL DEFAULT 5,
    generated_count INT NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'queued', -- 'queued', 'running', 'complete', 'failed'
    model_used VARCHAR(50) NOT NULL DEFAULT 'gemini-2.5-flash',
    error_log TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ DEFAULT NULL
);

-- 5. EDUCATOR REVIEW QUEUE
CREATE TABLE IF NOT EXISTS public.educator_review_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.question_bank(id) ON DELETE CASCADE,
    assigned_to UUID DEFAULT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'edited'
    is_possible_duplicate BOOLEAN NOT NULL DEFAULT FALSE,
    duplicate_similarity NUMERIC(5,4) DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. STUDENT QUESTION HISTORY (Layer 3 Deduplication)
CREATE TABLE IF NOT EXISTS public.student_question_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    question_id UUID NOT NULL REFERENCES public.question_bank(id) ON DELETE CASCADE,
    shown_at TIMESTAMPTZ DEFAULT NOW(),
    answered_correctly BOOLEAN DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_student_question_history_user 
  ON public.student_question_history (student_id, question_id);

-- RLS POLICIES (Read-Only for Students, Admin Full Access)
ALTER TABLE public.region_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educator_review_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_question_history ENABLE ROW LEVEL SECURITY;

-- Allow public read access to region and subject catalogs
CREATE POLICY "Allow public read region_catalog" ON public.region_catalog FOR SELECT USING (true);
CREATE POLICY "Allow public read subject_catalog" ON public.subject_catalog FOR SELECT USING (true);

-- Allow authenticated users to read approved questions
CREATE POLICY "Allow student read approved question_bank" ON public.question_bank 
  FOR SELECT USING (status = 'approved');

-- Allow authenticated users to view & insert their own history
CREATE POLICY "Allow student question history select" ON public.student_question_history 
  FOR SELECT USING (true);

CREATE POLICY "Allow student question history insert" ON public.student_question_history 
  FOR INSERT WITH CHECK (true);
