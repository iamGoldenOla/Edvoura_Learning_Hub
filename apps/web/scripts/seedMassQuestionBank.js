const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

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

function generateHash(str) {
  const normalized = str.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, ' ').trim();
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

const massQuestions = [
  // --- NIGERIA (NG) MATHEMATICS & BASIC SCIENCE ---
  {
    subject: 'Mathematics',
    grade_band: '1-3',
    specific_grade: 'Grade 3',
    curriculum_region: 'NG',
    topic: 'Place Values & Expanded Notation',
    question_text: 'In the number 458, what is the place value of the digit 5?',
    question_type: 'mcq',
    options: ['Tens', 'Hundreds', 'Units', 'Thousands'],
    correct_answer: 'Tens',
    explanation: 'In 458, 4 is in the Hundreds place, 5 is in the Tens place (50), and 8 is in the Units place.',
    difficulty: 'easy',
    source: 'ai-generated',
    status: 'approved',
  },
  {
    subject: 'Mathematics',
    grade_band: '1-3',
    curriculum_region: 'NG',
    topic: 'Basic Addition & Word Problems',
    question_text: 'Kofi bought 24 oranges from the market and Ada gave him 18 more. How many oranges does Kofi have in total?',
    question_type: 'mcq',
    options: ['42 oranges', '32 oranges', '52 oranges', '40 oranges'],
    correct_answer: '42 oranges',
    explanation: '24 + 18 = 42 oranges in total.',
    difficulty: 'easy',
    source: 'ai-generated',
    status: 'approved',
  },
  {
    subject: 'Basic Science & Technology',
    grade_band: '1-3',
    curriculum_region: 'NG',
    topic: 'Living Things & Ecosystems',
    question_text: 'Which of the following organisms requires sunlight, water, and air to manufacture its own food?',
    question_type: 'mcq',
    options: ['Green Plants', 'Goat', 'Fish', 'Earthworm'],
    correct_answer: 'Green Plants',
    explanation: 'Green plants use sunlight, water, and carbon dioxide to perform photosynthesis and make food.',
    difficulty: 'easy',
    source: 'ai-generated',
    status: 'approved',
  },

  // --- UNITED STATES (US) MATHEMATICS & SCIENCE ---
  {
    subject: 'Mathematics',
    grade_band: '1-3',
    specific_grade: 'Grade 3',
    curriculum_region: 'US',
    topic: 'Fractions & Visual Representations',
    question_text: 'What fraction of a pizza is remaining if 3 out of 8 equal slices have been eaten?',
    question_type: 'mcq',
    options: ['5/8', '3/8', '1/2', '3/5'],
    correct_answer: '5/8',
    explanation: 'Subtracting 3 eaten slices from the 8 total slices leaves 5 slices, or 5/8 of the pizza.',
    difficulty: 'easy',
    source: 'ai-generated',
    status: 'approved',
  },
  {
    subject: 'Mathematics',
    grade_band: '1-3',
    curriculum_region: 'US',
    topic: 'Measurement & Length Units',
    question_text: 'Which unit of measurement is best suited for measuring the length of a classroom pencil?',
    question_type: 'mcq',
    options: ['Inches', 'Miles', 'Yards', 'Gallons'],
    correct_answer: 'Inches',
    explanation: 'Inches are the standard small unit of length used for objects like pencils or notebooks in US customary units.',
    difficulty: 'easy',
    source: 'ai-generated',
    status: 'approved',
  },

  // --- UNITED KINGDOM (UK) ENGLISH & GEOGRAPHY ---
  {
    subject: 'English / Language Arts',
    grade_band: '1-3',
    specific_grade: 'Grade 3',
    curriculum_region: 'UK',
    topic: 'Spelling & Punctuation Conventions',
    question_text: 'Which sentence uses British English spelling and correct punctuation?',
    question_type: 'mcq',
    options: [
      'The colourful bird flew across the garden.',
      'The colorful bird flew across the garden.',
      'the colourful bird flew across the garden',
      'The colourful bird, flew across the garden'
    ],
    correct_answer: 'The colourful bird flew across the garden.',
    explanation: 'British English spells "colourful" with a "u" and sentences must start with a capital letter and end with a full stop.',
    difficulty: 'easy',
    source: 'ai-generated',
    status: 'approved',
  },

  // --- INDIA (IN) MATHEMATICS & SCIENCE ---
  {
    subject: 'Mathematics',
    grade_band: '1-3',
    specific_grade: 'Grade 3',
    curriculum_region: 'IN',
    topic: 'Indian Currency & Mental Math',
    question_text: 'Rohan spends ₹45 on a notebook and ₹35 on a pen. How much total change should he receive from a ₹100 note?',
    question_type: 'mcq',
    options: ['₹20', '₹80', '₹30', '₹25'],
    correct_answer: '₹20',
    explanation: 'Total cost = ₹45 + ₹35 = ₹80. Change from ₹100 = 100 - 80 = ₹20.',
    difficulty: 'easy',
    source: 'ai-generated',
    status: 'approved',
  },

  // --- GLOBAL MATHEMATICS & SCIENCE ---
  {
    subject: 'Mathematics',
    grade_band: '1-3',
    specific_grade: 'Grade 3',
    curriculum_region: 'GLOBAL',
    topic: 'Basic Multiplication & Arrays',
    question_text: 'What is 6 multiplied by 7?',
    question_type: 'mcq',
    options: ['42', '36', '48', '40'],
    correct_answer: '42',
    explanation: '6 × 7 = 42.',
    difficulty: 'medium',
    source: 'ai-generated',
    status: 'approved',
  },
  {
    subject: 'Basic Science & Technology',
    grade_band: '1-3',
    curriculum_region: 'GLOBAL',
    topic: 'States of Matter',
    question_text: 'What happens when liquid water is heated to its boiling point?',
    question_type: 'mcq',
    options: ['It turns into water vapor (gas)', 'It turns into ice (solid)', 'It turns into oil', 'It disappears permanently'],
    correct_answer: 'It turns into water vapor (gas)',
    explanation: 'Heating liquid water to 100°C causes evaporation, changing its state of matter from liquid to gas.',
    difficulty: 'easy',
    source: 'ai-generated',
    status: 'approved',
  },
];

const seoPagesToSeed = [
  {
    slug: 'practice-ng-grade-3-mathematics',
    region_code: 'NG',
    grade_band: '1-3',
    meta_title: 'Free Primary 3 Mathematics Practice Questions (NG) — 🇳🇬 Nigeria',
    meta_description: 'Practice Primary 3 Mathematics questions aligned to the NERDC curriculum in Nigeria. Free sample questions, place values, addition, and interactive drills.',
    intro_content: 'Master Primary 3 Mathematics in Nigeria with Edvoura Learning Hub. Our question bank is specifically aligned to the NERDC curriculum standard, covering place values, double-digit addition, basic geometry, and mental arithmetic designed for Grade 3 pupils in Lagos, Abuja, and across Nigeria.',
  },
  {
    slug: 'practice-us-grade-3-mathematics',
    region_code: 'US',
    grade_band: '1-3',
    meta_title: 'Free Grade 3 Math Practice Questions (US) — 🇺🇸 United States',
    meta_description: 'Practice Grade 3 Math questions aligned to Common Core State Standards in the US. Fractions, place value, and measurement practice.',
    intro_content: 'Excel in Grade 3 Math with Edvoura Learning Hub. Designed for US students adhering to Common Core State Standards (CCSS.MATH.CONTENT.3.OA and 3.NF), our question bank features interactive drills on fractions, measurement, arrays, and word problems.',
  },
  {
    slug: 'practice-uk-grade-3-english',
    region_code: 'UK',
    grade_band: '1-3',
    meta_title: 'Free Key Stage 1/2 English Practice (UK) — 🇬🇧 United Kingdom',
    meta_description: 'Practice Primary English questions aligned to the UK National Curriculum. Grammar, punctuation, and British spelling rules.',
    intro_content: 'Build strong English literacy skills for Key Stage 1 and 2 students in England and Wales. Our UK question bank emphasizes British spelling conventions, grammar, punctuation, and reading comprehension.',
  },
  {
    slug: 'practice-in-grade-3-mathematics',
    region_code: 'IN',
    grade_band: '1-3',
    meta_title: 'Free Class 3 Mathematics Practice (IN) — 🇮🇳 India',
    meta_description: 'Practice Class 3 Maths questions aligned to CBSE and ICSE board standards in India.',
    intro_content: 'Prepare for CBSE and ICSE Class 3 Mathematics with Edvoura. Featuring Indian currency calculations, place values, geometry, and mental maths exercises for students across India.',
  },
];

async function seedMassData() {
  console.log('=== SEEDING MASS QUESTION BANK & PROGRAMMATIC SEO PAGES ===');

  for (const q of massQuestions) {
    const hash = generateHash(q.question_text);
    const { error } = await supabase
      .from('question_bank')
      .upsert({ ...q, content_hash: hash }, { onConflict: 'content_hash' });

    if (error) console.error(`Error seeding question "${q.question_text.slice(0, 30)}...":`, error.message);
  }

  for (const p of seoPagesToSeed) {
    const { error } = await supabase
      .from('seo_landing_pages')
      .upsert(p, { onConflict: 'slug' });

    if (error) console.error(`Error seeding SEO page "${p.slug}":`, error.message);
  }

  console.log('Successfully seeded mass questions and programmatic SEO landing pages!');
}

seedMassData();
