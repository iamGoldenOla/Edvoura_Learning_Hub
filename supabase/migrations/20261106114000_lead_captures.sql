-- ============================================================================
-- MIGRATION: LEAD CAPTURES & PROSPECTIVE CLIENT INQUIRIES
-- Date: 2026-11-06
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.lead_captures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT,
  subject_topic TEXT DEFAULT 'General Inquiry',
  message_body TEXT,
  status TEXT DEFAULT 'new', -- 'new', 'contacted', 'converted', 'closed'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lead_captures ENABLE ROW LEVEL SECURITY;

-- Allow public anonymous/authenticated visitors to insert inquiries
CREATE POLICY "Public can insert lead captures"
  ON public.lead_captures
  FOR INSERT
  WITH CHECK (true);

-- Allow admins/service role to select and update all leads
CREATE POLICY "Admins can view lead captures"
  ON public.lead_captures
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update lead captures"
  ON public.lead_captures
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'super_admin')
    )
  );

CREATE INDEX IF NOT EXISTS idx_lead_captures_created_at ON public.lead_captures(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_captures_email ON public.lead_captures(email);
