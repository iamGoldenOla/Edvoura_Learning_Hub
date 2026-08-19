const path = require('path');
const fs = require('fs');

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

let env = { ...rootEnv, ...localEnv, ...webEnv };

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL || 'https://xynawxgiwekfxzymvobk.supabase.co';
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';

const webNodeModules = path.resolve(__dirname, '../node_modules');
const { createClient } = require(path.join(webNodeModules, '@supabase', 'supabase-js'));

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const classroomsAllGrades = [
  // Primary / Basic Grades (1-3)
  {
    teacher_id: '00000000-0000-0000-0000-000000000002',
    name: 'Primary 1 Sunshine Class',
    region: 'NG',
    grade_band: '1-3',
    invite_code: 'EDV-NG-P101',
  },
  {
    teacher_id: '00000000-0000-0000-0000-000000000002',
    name: 'Primary 3 Excellence Class',
    region: 'NG',
    grade_band: '1-3',
    invite_code: 'EDV-NG-P303',
  },

  // Intermediate / Upper Basic Grades (4-6)
  {
    teacher_id: '00000000-0000-0000-0000-000000000002',
    name: 'Primary 5 Science & Math Achievers',
    region: 'NG',
    grade_band: '4-6',
    invite_code: 'EDV-NG-P505',
  },
  {
    teacher_id: '00000000-0000-0000-0000-000000000002',
    name: 'US Grade 5 Common Core Math',
    region: 'US',
    grade_band: '4-6',
    invite_code: 'EDV-US-G505',
  },

  // Junior Secondary / Middle School (7-9 / JSS 1-3 / Year 7-9)
  {
    teacher_id: '00000000-0000-0000-0000-000000000002',
    name: 'JSS 2 Basic Science & Technology',
    region: 'NG',
    grade_band: '7-9',
    invite_code: 'EDV-NG-JSS2',
  },
  {
    teacher_id: '00000000-0000-0000-0000-000000000002',
    name: 'UK Year 8 Key Stage 3 Science',
    region: 'UK',
    grade_band: '7-9',
    invite_code: 'EDV-UK-Y808',
  },

  // Senior Secondary / High School (10-12 / SS 1-3 / Year 10-13 / Class 10-12)
  {
    teacher_id: '00000000-0000-0000-0000-000000000002',
    name: 'SS 3 WAEC & NECO Champions',
    region: 'NG',
    grade_band: '10-12',
    invite_code: 'EDV-NG-SS30',
  },
  {
    teacher_id: '00000000-0000-0000-0000-000000000002',
    name: 'US Grade 11 Physics & Chemistry',
    region: 'US',
    grade_band: '10-12',
    invite_code: 'EDV-US-G110',
  },
  {
    teacher_id: '00000000-0000-0000-0000-000000000002',
    name: 'India Class 12 CBSE Board Masterclass',
    region: 'IN',
    grade_band: '10-12',
    invite_code: 'EDV-IN-C120',
  },
];

async function seedAllGrades() {
  console.log('=== SEEDING CLASSROOMS ACROSS ALL GRADES (1 TO 12) & REGIONS ===');
  for (const c of classroomsAllGrades) {
    const { error } = await supabase
      .from('classrooms')
      .upsert(c, { onConflict: 'invite_code' });

    if (error) {
      console.error(`Error seeding classroom "${c.name}":`, error.message);
    } else {
      console.log(`✅ Seeded: "${c.name}" [Grade Band: ${c.grade_band}, Region: ${c.region}, Invite Code: ${c.invite_code}]`);
    }
  }
}

seedAllGrades();
