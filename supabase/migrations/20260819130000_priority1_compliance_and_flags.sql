-- ============================================================================
-- PRIORITY 1: SECTION A (MINORS' DATA COMPLIANCE) & SECTION B (AI CONTENT FLAGS)
-- Date: 2026-08-19
-- ============================================================================

-- 1. CONSENT RECORDS (Section A)
CREATE TABLE IF NOT EXISTS public.consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    guardian_email TEXT NOT NULL,
    consent_type VARCHAR(20) NOT NULL DEFAULT 'parental', -- 'parental' or 'self'
    consented_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address TEXT DEFAULT NULL,
    region_at_consent VARCHAR(20) NOT NULL DEFAULT 'NG'
);

CREATE INDEX IF NOT EXISTS idx_consent_records_student 
  ON public.consent_records (student_id);

-- 2. DATA PROCESSING LOG (Section A Audit Trail)
CREATE TABLE IF NOT EXISTS public.data_processing_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    action_type VARCHAR(50) NOT NULL, -- 'signup_consent', 'data_deletion', 'data_export'
    data_collected JSONB DEFAULT '{}'::jsonb,
    legal_basis VARCHAR(100) NOT NULL DEFAULT 'parental_consent', -- 'parental_consent', 'legal_obligation', 'legitimate_interest'
    processed_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address TEXT DEFAULT NULL,
    region_code VARCHAR(20) NOT NULL DEFAULT 'NG'
);

CREATE INDEX IF NOT EXISTS idx_data_processing_log_user 
  ON public.data_processing_log (user_id);

-- 3. QUESTION FLAGS (Section B Error-Reporting Loop)
CREATE TABLE IF NOT EXISTS public.question_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.question_bank(id) ON DELETE CASCADE,
    flagged_by UUID DEFAULT NULL,
    flag_reason VARCHAR(30) NOT NULL, -- 'wrong_answer', 'unclear', 'outdated', 'inappropriate', 'other'
    notes TEXT DEFAULT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'open', -- 'open', 'reviewing', 'resolved', 'dismissed'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_question_flags_question 
  ON public.question_flags (question_id, status);

-- RLS POLICIES
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_processing_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert consent_records" ON public.consent_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select consent_records" ON public.consent_records FOR SELECT USING (true);

CREATE POLICY "Allow public insert data_processing_log" ON public.data_processing_log FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select data_processing_log" ON public.data_processing_log FOR SELECT USING (true);

CREATE POLICY "Allow public insert question_flags" ON public.question_flags FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select question_flags" ON public.question_flags FOR SELECT USING (true);
