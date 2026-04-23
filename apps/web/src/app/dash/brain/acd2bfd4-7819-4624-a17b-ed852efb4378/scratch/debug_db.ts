import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function debugData() {
  console.log("Checking assignments...");
  const { data: assignments, error: aErr } = await supabase
    .from('assignments')
    .select('id, title, class_id')
    .order('created_at', { ascending: false })
    .limit(3);
  
  if (aErr) console.error("Assignments Error:", aErr);
  else {
    console.log("Recent Assignments:", JSON.stringify(assignments, null, 2));
    
    if (assignments && assignments.length > 0) {
      const assignmentIds = assignments.map(a => a.id);
      console.log("\nChecking assignment_files for these assignments...");
      const { data: files, error: fErr } = await supabase
        .from('assignment_files')
        .select('*')
        .in('assignment_id', assignmentIds);

      if (fErr) console.error("Files Error:", fErr);
      else console.log("Assignment Files:", JSON.stringify(files, null, 2));
    }
  }

  console.log("\nChecking student James Jedidiahz...");
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .ilike('full_name', '%James Jedidiahz%')
    .maybeSingle();
  
  if (profile) {
    console.log("James Profile:", JSON.stringify(profile, null, 2));
    const { data: enrollments } = await supabase
      .from('class_enrollments')
      .select('class_id')
      .eq('student_user_id', profile.id);
    console.log("James Enrollments:", JSON.stringify(enrollments, null, 2));
  } else {
    console.log("James not found.");
  }
}

debugData();
