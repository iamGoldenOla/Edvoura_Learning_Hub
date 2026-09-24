-- Notable Figures for "Do You Know?" game
CREATE TABLE IF NOT EXISTS public.notable_figures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  birth_year INTEGER,
  death_year INTEGER,
  nationality TEXT NOT NULL DEFAULT 'Unknown',
  field VARCHAR(100) NOT NULL DEFAULT 'Politics',
  notable_achievement TEXT NOT NULL,
  wikidata_id VARCHAR(50) DEFAULT NULL,
  source VARCHAR(50) NOT NULL DEFAULT 'wikidata',
  image_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Band-specific biography questions
CREATE TABLE IF NOT EXISTS public.biography_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  figure_id UUID NOT NULL REFERENCES public.notable_figures(id) ON DELETE CASCADE,
  grade_band VARCHAR(20) NOT NULL DEFAULT '1-3',
  question_text TEXT NOT NULL,
  question_type VARCHAR(20) NOT NULL DEFAULT 'mcq',
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer TEXT NOT NULL,
  explanation TEXT NOT NULL DEFAULT '',
  age_appropriateness_note TEXT DEFAULT '',
  status VARCHAR(30) NOT NULL DEFAULT 'pending_review',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- "What Am I?" riddle sequences
CREATE TABLE IF NOT EXISTS public.riddle_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  answer TEXT NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'Science',
  grade_band VARCHAR(20) NOT NULL DEFAULT '1-3',
  clue_1 TEXT NOT NULL,
  clue_2 TEXT NOT NULL,
  clue_3 TEXT NOT NULL,
  clue_4 TEXT NOT NULL,
  curriculum_topic TEXT DEFAULT '',
  status VARCHAR(30) NOT NULL DEFAULT 'pending_review',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Nursery/Preschool milestone tracking
CREATE TABLE IF NOT EXISTS public.nursery_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  area VARCHAR(100) NOT NULL,
  milestone_name TEXT NOT NULL,
  achieved BOOLEAN DEFAULT false,
  observed_at TIMESTAMPTZ DEFAULT NULL,
  teacher_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bio_questions_band ON public.biography_questions (grade_band, status);
CREATE INDEX IF NOT EXISTS idx_riddle_sequences_band ON public.riddle_sequences (grade_band, status);
CREATE INDEX IF NOT EXISTS idx_nursery_milestones_student ON public.nursery_milestones (student_id, area);
