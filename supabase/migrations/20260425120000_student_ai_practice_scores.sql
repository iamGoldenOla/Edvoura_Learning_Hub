-- Migration: Track Student AI Practice Scores
-- Description: Stores results of automated AI quizzes for progress monitoring.

CREATE TABLE IF NOT EXISTS public.student_ai_practice_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject_name TEXT NOT NULL,
    topic TEXT NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.student_ai_practice_scores ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Students can insert their own scores
CREATE POLICY "Students can insert their own practice scores"
    ON public.student_ai_practice_scores
    FOR INSERT
    WITH CHECK (auth.uid() = student_id);

-- 2. Students can view their own scores
CREATE POLICY "Students can view their own practice scores"
    ON public.student_ai_practice_scores
    FOR SELECT
    USING (auth.uid() = student_id);

-- 3. Parents can view their children's scores
CREATE POLICY "Parents can view their children's practice scores"
    ON public.student_ai_practice_scores
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.parent_child_links
            WHERE parent_user_id = auth.uid()
            AND child_user_id = student_ai_practice_scores.student_id
        )
    );

-- 4. Tutors can view scores of students in their classes
CREATE POLICY "Tutors can view their students' practice scores"
    ON public.student_ai_practice_scores
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.class_enrollments ce
            JOIN public.classes c ON c.id = ce.class_id
            WHERE c.primary_tutor_user_id = auth.uid()
            AND ce.student_user_id = student_ai_practice_scores.student_id
        )
    );
