-- EDVOURA LEARNING HUB: AI ENGINE ORCHESTRATION SCHEMA
-- Migration: Creates the tables necessary for the AI Operations, Curriculum, and Tutor Engines.

-- =====================================================================================
-- 1. CURRICULUM INTELLIGENCE SYSTEM
-- Acts as the ground truth for AI generation. The AI cannot invent topics, it must pull from here.
-- =====================================================================================
CREATE TABLE public.curriculum_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_type TEXT NOT NULL CHECK (system_type IN ('WAEC', 'NECO', 'BRITISH', 'HYBRID', 'COMMON_CORE')),
  grade_level_id UUID NOT NULL REFERENCES public.grade_levels(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  learning_objectives JSONB NOT NULL, -- Array of string objectives
  difficulty_weight INT NOT NULL CHECK (difficulty_weight BETWEEN 1 AND 10),
  prerequisite_topics UUID[], -- Array of other curriculum_maps IDs
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: Admins have full access. Tutors and Students have read access.
ALTER TABLE public.curriculum_maps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read curriculum maps"
  ON public.curriculum_maps FOR SELECT
  USING (true);

CREATE POLICY "Super Admins can manage curriculum maps"
  ON public.curriculum_maps FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'
    )
  );

-- =====================================================================================
-- 2. AI CONTENT GENERATION TRACKER
-- Stores validated AI output (Lesson Notes, Stories, Comprehensions, Quizzes).
-- =====================================================================================
CREATE TABLE public.ai_generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN ('lesson_note', 'story', 'comprehension', 'quiz', 'worksheet')),
  curriculum_map_id UUID REFERENCES public.curriculum_maps(id) ON DELETE SET NULL,
  generated_by_user_id UUID NOT NULL REFERENCES auth.users(id), -- The Tutor/Admin who triggered it
  raw_output JSONB NOT NULL, -- The strictly validated JSON output from the AI
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'rejected', 'published')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: Generators (Tutors/Admins) can see their own. Admins can see all. Students see published.
ALTER TABLE public.ai_generated_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tutors can manage their generated content"
  ON public.ai_generated_content FOR ALL
  USING (generated_by_user_id = auth.uid());

CREATE POLICY "Students can read published AI content"
  ON public.ai_generated_content FOR SELECT
  USING (status = 'published');

CREATE POLICY "Super Admins can view all AI content"
  ON public.ai_generated_content FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'
    )
  );

-- =====================================================================================
-- 3. PERSONALIZATION ENGINE (Student Learning Profiles)
-- Tracks student strengths, weaknesses, and AI-recommended interventions.
-- =====================================================================================
CREATE TABLE public.student_learning_profiles (
  student_user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  learning_pace TEXT NOT NULL DEFAULT 'standard' CHECK (learning_pace IN ('accelerated', 'standard', 'needs_intervention')),
  strong_subjects UUID[] DEFAULT '{}', -- Array of subject_ids
  weak_subjects UUID[] DEFAULT '{}', -- Array of subject_ids
  recommended_interventions JSONB, -- AI-generated structured recommendations for Tutors/Parents
  last_analyzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: Students and Linked Parents can read. Admins and assigned Tutors can manage.
ALTER TABLE public.student_learning_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can read own learning profile"
  ON public.student_learning_profiles FOR SELECT
  USING (student_user_id = auth.uid());

CREATE POLICY "Parents can read their child's learning profile"
  ON public.student_learning_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_child_links pcl
      WHERE pcl.parent_user_id = auth.uid() AND pcl.child_user_id = student_learning_profiles.student_user_id
    )
  );

CREATE POLICY "Tutors can read profiles of enrolled students"
  ON public.student_learning_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.class_enrollments ce
      JOIN public.classes c ON c.id = ce.class_id
      WHERE ce.student_user_id = student_learning_profiles.student_user_id
      AND c.tutor_user_id = auth.uid()
      AND ce.status = 'active'
    )
  );

CREATE POLICY "System/Admins can manage learning profiles"
  ON public.student_learning_profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'admin')
    )
  );

-- =====================================================================================
-- 4. AI AUTOMATION LOGS (Operations Engine)
-- Logs automated actions triggered by the AI (e.g. sending reports, assigning remedial tasks).
-- =====================================================================================
CREATE TABLE public.ai_action_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('weekly_report', 'intervention_alert', 'schedule_adjustment', 'curriculum_adaptation')),
  target_user_id UUID REFERENCES auth.users(id), -- The student or parent affected
  action_payload JSONB NOT NULL,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: Only Super Admins can see raw automation logs.
ALTER TABLE public.ai_action_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super Admins can manage AI action logs"
  ON public.ai_action_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'
    )
  );

-- =====================================================================================
-- TRIGGERS
-- Auto-update timestamps
-- =====================================================================================
CREATE TRIGGER update_curriculum_maps_modtime
  BEFORE UPDATE ON public.curriculum_maps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_generated_content_modtime
  BEFORE UPDATE ON public.ai_generated_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_learning_profiles_modtime
  BEFORE UPDATE ON public.student_learning_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
