CREATE TABLE IF NOT EXISTS public.storybooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'Unknown',
  publisher TEXT DEFAULT '',
  source VARCHAR(100) NOT NULL DEFAULT 'african-storybook',
  source_url TEXT DEFAULT '',
  license_type VARCHAR(50) NOT NULL DEFAULT 'CC-BY-4.0',
  language VARCHAR(50) NOT NULL DEFAULT 'English',
  grade_band VARCHAR(20) NOT NULL DEFAULT '1-3',
  specific_grade VARCHAR(50) DEFAULT 'Grade 1',
  cover_image_url TEXT DEFAULT '',
  content_body TEXT NOT NULL DEFAULT '',
  page_count INTEGER DEFAULT 1,
  genre VARCHAR(100) DEFAULT 'Fiction',
  status VARCHAR(30) NOT NULL DEFAULT 'approved',
  uploaded_by UUID DEFAULT NULL,
  rights_attestation BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.storybook_reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  storybook_id UUID NOT NULL REFERENCES public.storybooks(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'started',
  pages_read INTEGER DEFAULT 0,
  total_pages INTEGER DEFAULT 1,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ DEFAULT NULL,
  UNIQUE(student_id, storybook_id)
);

CREATE INDEX IF NOT EXISTS idx_storybooks_grade_band ON public.storybooks (grade_band, language, status);
CREATE INDEX IF NOT EXISTS idx_storybook_progress_student ON public.storybook_reading_progress (student_id);
