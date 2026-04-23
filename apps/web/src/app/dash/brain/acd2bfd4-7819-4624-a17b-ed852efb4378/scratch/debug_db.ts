import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function debugData() {
  console.log("Checking assignments...");
  const { data: assignments, error: aErr } = await supabase
    .from('assignments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (aErr) console.error("Assignments Error:", aErr);
  else console.log("Recent Assignments:", JSON.stringify(assignments, null, 2));

  console.log("\nChecking classes...");
  const { data: classes, error: cErr } = await supabase
    .from('classes')
    .select('*')
    .limit(5);

  if (cErr) console.error("Classes Error:", cErr);
  else console.log("Recent Classes:", JSON.stringify(classes, null, 2));
}

debugData();
