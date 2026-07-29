/**
 * UPLOAD & SEED COMPREHENSION PDFs
 * 
 * Run this script ONCE after applying the migration.
 * It reads PDFs from /comprehension_pdf/, uploads them to Supabase Storage,
 * and inserts records into the preloaded_resources table.
 * 
 * Usage:
 *   node scripts/seed_comprehension.js [--remote]
 * 
 * Requirements:
 *   - Supabase running (local or remote)
 *   - Valid SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// ── Parse .env ──────────────────────────────────────────────────────────
function parseEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8').replace(/\r/g, '');
  const env = {};
  content.split('\n').forEach(line => {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (m) {
      let val = (m[2] || '').trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
        val = val.slice(1, -1);
      env[m[1]] = val;
    }
  });
  return env;
}

const rootEnv = parseEnv(path.resolve(__dirname, '../../../.env'));
const localEnv = parseEnv(path.resolve(__dirname, '../../../.env.local'));
const webEnv = parseEnv(path.resolve(__dirname, '../.env.local'));

// By default, merge them (local .env.local overrides root)
let env = { ...rootEnv, ...localEnv, ...webEnv };

const isRemote = process.argv.includes('--remote');

// If --remote is passed, force using production settings from root .env
if (isRemote) {
  console.log('Force connecting to production/remote Supabase database...');
  env = rootEnv;
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Grade Mapping ───────────────────────────────────────────────────────
const PDF_GRADE_MAP = [
  // Grade 1
  { file: 'Year 1 Comprehension.pdf', grade: 'grade_1', title: 'Year 1 Comprehension Workbook' },
  { file: 'daily-reading-practice-grade-1.pdf', grade: 'grade_1', title: 'Daily Reading Practice - Grade 1' },

  // Grade 2
  { file: 'Year 2 Comprehension.pdf', grade: 'grade_2', title: 'Year 2 Comprehension Workbook' },
  { file: 'daily-reading-practice-grade-2.pdf', grade: 'grade_2', title: 'Daily Reading Practice - Grade 2' },

  // Grade 3
  { file: 'YEAR 3 COMPREHENSION PASSAGE.pdf', grade: 'grade_3', title: 'Year 3 Comprehension Passages' },
  { file: 'Year 3 Comprehension.pdf', grade: 'grade_3', title: 'Year 3 Comprehension Workbook' },
  { file: 'daily-reading-practice-grade-3..pdf', grade: 'grade_3', title: 'Daily Reading Practice - Grade 3' },

  // Grade 4
  { file: 'Year 4 Comprehension.pdf', grade: 'grade_4', title: 'Year 4 Comprehension Workbook' },
  { file: 'daily-reading-practice-grade-4.pdf', grade: 'grade_4', title: 'Daily Reading Practice - Grade 4' },

  // Grade 5
  { file: 'Year 5 Comprehension.pdf', grade: 'grade_5', title: 'Year 5 Comprehension Workbook' },
  { file: 'Core5_Comprehension_Passages_G5.pdf', grade: 'grade_5', title: 'Core Comprehension Passages - Grade 5' },
  { file: 'Grade 5 comprehension - seat work.pdf', grade: 'grade_5', title: 'Grade 5 Comprehension Seat Work' },
  { file: 'daily-reading-practice-grade-5.pdf', grade: 'grade_5', title: 'Daily Reading Practice - Grade 5' },
  { file: 'paired-passages-grade-5.pdf', grade: 'grade_5', title: 'Paired Passages - Grade 5' },

  // Grade 6
  { file: 'Year 6 Comprehension.pdf', grade: 'grade_6', title: 'Year 6 Comprehension Workbook' },
  { file: 'Reading Comprehension 6.pdf', grade: 'grade_6', title: 'Reading Comprehension - Grade 6' },
  { file: 'Grade 6 comprehension sols.pdf', grade: 'grade_6', title: 'Grade 6 Comprehension Solutions' },
  { file: 'daily-reading-practice-grade-6.pdf', grade: 'grade_6', title: 'Daily Reading Practice - Grade 6' },

  // Grade 7
  { file: 'Grade 7 English Language Arts - Reading.pdf', grade: 'grade_7', title: 'Grade 7 English Language Arts - Reading' },
  { file: 'Grade 7 Reading SOL2010.pdf', grade: 'grade_7', title: 'Grade 7 Reading Standards (SOL)' },
  { file: 'Grade 7 reading.pdf', grade: 'grade_7', title: 'Grade 7 Reading Workbook' },

  // Grade 8
  { file: '8th-grade-comprehension-ela.pdf', grade: 'grade_8', title: '8th Grade Comprehension (ELA)' },
  { file: 'Copy-of-iready-at-home-activity-packets-student-ela-grade-8-2020.pdf', grade: 'grade_8', title: 'iReady At-Home Activity Packets - Grade 8' },
  { file: 'Grade 8 Reading SOL2008.pdf', grade: 'grade_8', title: 'Grade 8 Reading Standards (SOL)' },
  { file: 'Year_8_Knowledge_Organiser_English.pdf', grade: 'grade_8', title: 'Year 8 English Knowledge Organiser' },

  // Grade 9
  { file: '9thGrade-English-V2-Worksheets.pdf', grade: 'grade_9', title: '9th Grade English Worksheets' },
  { file: 'Grade 9 Comprehension Home-work.pdf', grade: 'grade_9', title: 'Grade 9 Comprehension Homework' },
  { file: 'Grade 9 English HL Test.pdf', grade: 'grade_9', title: 'Grade 9 English HL Test' },
  { file: '17-SAMPLE-Yr-9-English-Part-1-Reading-Comprehension-Gradgrind-Table-format.pdf', grade: 'grade_9', title: 'Year 9 Reading Comprehension Sample' },

  // Grade 10
  { file: 'Grade-10-Comprehension-ela.pdf', grade: 'grade_10', title: 'Grade 10 Comprehension (ELA)' },
  { file: 'Grade-10-MCAS-Comprehension-2012.pdf', grade: 'grade_10', title: 'Grade 10 MCAS Comprehension' },
  { file: 'test-bank-grade-10-2022-2023-questions-st.-term-1.pdf', grade: 'grade_10', title: 'Grade 10 Test Bank - Term 1' },

  // Grade 11
  { file: 'Grade-11th-English-V2-Workbook.pdf', grade: 'grade_11', title: 'Grade 11 English Workbook' },
  { file: '9781107651944_excerpt-comprehension-answers.pdf', grade: 'grade_11', title: 'Cambridge Comprehension Answers' },

  // Grade 12
  { file: 'Grade 12.pdf', grade: 'grade_12', title: 'Grade 12 Comprehension' },
  { file: 'Grade-12efp_sample_questions.pdf', grade: 'grade_12', title: 'Grade 12 Sample Questions' },
  { file: 'Grade-12th-Comprehension-English-V2-Workbook.pdf', grade: 'grade_12', title: 'Grade 12 English Comprehension Workbook' },
];

// ── Main ────────────────────────────────────────────────────────────────
async function main() {
  const pdfDir = path.resolve(__dirname, '../../../comprehension_pdf');

  if (!fs.existsSync(pdfDir)) {
    console.error(`PDF directory not found: ${pdfDir}`);
    process.exit(1);
  }

  console.log(`\nConnecting to: ${SUPABASE_URL}`);
  console.log(`PDF source:    ${pdfDir}`);
  console.log(`Total PDFs:    ${PDF_GRADE_MAP.length}\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const entry of PDF_GRADE_MAP) {
    const filePath = path.join(pdfDir, entry.file);

    if (!fs.existsSync(filePath)) {
      console.log(`⚠  SKIP (file not found): ${entry.file}`);
      skipCount++;
      continue;
    }

    // Check if already seeded
    const { data: existing } = await supabase
      .from('preloaded_resources')
      .select('id')
      .eq('file_name', entry.file)
      .maybeSingle();

    if (existing) {
      console.log(`⏭  SKIP (already seeded): ${entry.file}`);
      skipCount++;
      continue;
    }

    // Upload to storage
    const fileBuffer = fs.readFileSync(filePath);
    const storagePath = `${entry.grade}/${entry.file.replace(/[^a-zA-Z0-9._-]/g, '-')}`;

    console.log(`📤 Uploading: ${entry.file} → ${storagePath} ...`);

    const { error: uploadError } = await supabase.storage
      .from('comprehension-resources')
      .upload(storagePath, fileBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error(`   ❌ Upload failed: ${uploadError.message}`);
      errorCount++;
      continue;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('comprehension-resources')
      .getPublicUrl(storagePath);

    const publicUrl = urlData?.publicUrl || '';

    // Insert DB record
    const { error: insertError } = await supabase
      .from('preloaded_resources')
      .insert({
        title: entry.title,
        description: `Comprehension resource for ${entry.grade.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}`,
        file_name: entry.file,
        storage_path: storagePath,
        public_url: publicUrl,
        grade_level_code: entry.grade,
        subject: 'English Language',
        resource_type: 'comprehension',
      });

    if (insertError) {
      console.error(`   ❌ DB insert failed: ${insertError.message}`);
      errorCount++;
      continue;
    }

    console.log(`   ✅ Done`);
    successCount++;
  }

  console.log(`\n${'═'.repeat(50)}`);
  console.log(`✅ Uploaded: ${successCount}`);
  console.log(`⏭  Skipped:  ${skipCount}`);
  console.log(`❌ Errors:   ${errorCount}`);
  console.log(`${'═'.repeat(50)}\n`);
}

main().catch(console.error);
