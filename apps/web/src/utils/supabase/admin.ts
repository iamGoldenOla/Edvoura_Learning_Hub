import { createClient } from '@supabase/supabase-js';

// Note: This client bypasses RLS. Never expose it to the browser.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key_for_build',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
