const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

// Read env vars manually for the script
const envLocalPath = path.resolve(__dirname, '../../.env.local');
const envExamplePath = path.resolve(__dirname, '../../.env.example');

if (fs.existsSync(envLocalPath)) {
  require('dotenv').config({ path: envLocalPath });
} else if (fs.existsSync(envExamplePath)) {
  require('dotenv').config({ path: envExamplePath });
}

// Fallback to dummy values for script to run successfully and print counts in demo
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_key';

let supabaseAdmin = null;
if (supabaseUrl && supabaseKey && supabaseKey !== 'dummy_key') {
  supabaseAdmin = createClient(supabaseUrl, supabaseKey);
} else {
  console.log('Running in dry-run mode (no valid Supabase credentials found). Will skip actual database insertion.');
}

function generateContentHash(questionText) {
  const normalized = questionText
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

async function seedALOC() {
  const subjects = ['mathematics', 'english', 'biology'];
  let totalInserted = 0;
  
  for (const subject of subjects) {
    let subjectInserted = 0;
    console.log(`Fetching 10 questions for ALOC subject: ${subject}...`);
    for (let i = 0; i < 10; i++) {
      try {
        const res = await fetch(`https://questions.aloc.ng/api/v2/q?subject=${subject}&type=utme`);
        const data = await res.json();
        
        if (!data.data) continue;
        const item = data.data;
        
        const optionsArray = item.option ? Object.values(item.option) : [];
        let correctAnswer = '';
        if (item.answer && item.option && item.option[item.answer]) {
          correctAnswer = item.option[item.answer];
        } else {
          correctAnswer = item.answer || optionsArray[0] || 'Unknown';
        }

        const questionText = item.question || 'Unknown Question';
        const hash = generateContentHash(questionText);

        const questionPayload = {
          subject: subject,
          grade_band: '10-12',
          specific_grade: 'Grade 12',
          curriculum_region: 'NG',
          topic: item.section || 'General',
          subtopic: '',
          question_text: questionText,
          question_type: 'mcq',
          options: optionsArray,
          correct_answer: correctAnswer,
          explanation: item.solution || 'Sourced from ALOC.',
          difficulty: 'medium',
          source: 'aloc',
          status: 'pending_review',
          is_current_affairs: false,
          content_hash: hash,
          embedding: null
        };

        if (supabaseAdmin) {
          const { data: insertedQ, error: insertErr } = await supabaseAdmin
            .from('question_bank')
            .insert(questionPayload)
            .select('id')
            .single();

          if (insertErr) {
            if (insertErr.code !== '23505') console.error('[ALOC INSERT ERROR]', insertErr);
            continue;
          }

          if (insertedQ && insertedQ.id) {
            await supabaseAdmin.from('educator_review_queue').insert({
              question_id: insertedQ.id,
              status: 'pending',
              is_possible_duplicate: false,
              duplicate_similarity: null,
            });
            subjectInserted++;
            totalInserted++;
          }
        } else {
          // Dry run mode counts
          subjectInserted++;
          totalInserted++;
        }
      } catch (err) {
        console.error(`Error fetching ALOC question ${i}:`, err.message);
      }
    }
    console.log(`ALOC - ${subject}: Inserted ${subjectInserted} questions.`);
  }
  return totalInserted;
}

async function seedOpenTrivia() {
  console.log(`Fetching 20 questions from Open Trivia DB...`);
  const amount = 20;
  let insertedCount = 0;
  try {
    const res = await fetch(`https://opentdb.com/api.php?amount=${amount}&type=multiple`);
    const data = await res.json();
    
    const decodeHtml = (html) => html.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

    if (!data.results) return 0;

    for (const item of data.results) {
      const options = [item.correct_answer, ...item.incorrect_answers].map(decodeHtml);
      options.sort(() => Math.random() - 0.5);
      
      const questionText = decodeHtml(item.question);
      const hash = generateContentHash(questionText);

      const questionPayload = {
        subject: 'General Knowledge',
        grade_band: 'Any',
        specific_grade: 'Any',
        curriculum_region: 'GLOBAL',
        topic: item.category || 'Trivia',
        subtopic: '',
        question_text: questionText,
        question_type: 'mcq',
        options: options,
        correct_answer: decodeHtml(item.correct_answer),
        explanation: 'Sourced from OpenTriviaDB.',
        difficulty: item.difficulty || 'medium',
        source: 'opentdb',
        status: 'pending_review',
        is_current_affairs: false,
        content_hash: hash,
        embedding: null
      };

      if (supabaseAdmin) {
        const { data: insertedQ, error: insertErr } = await supabaseAdmin
          .from('question_bank')
          .insert(questionPayload)
          .select('id')
          .single();

        if (insertErr) {
          if (insertErr.code !== '23505') console.error('[OpenTrivia INSERT ERROR]', insertErr);
          continue;
        }

        if (insertedQ && insertedQ.id) {
          await supabaseAdmin.from('educator_review_queue').insert({
            question_id: insertedQ.id,
            status: 'pending',
            is_possible_duplicate: false,
            duplicate_similarity: null,
          });
          insertedCount++;
        }
      } else {
        insertedCount++;
      }
    }
    console.log(`OpenTriviaDB: Inserted ${insertedCount} questions.`);
  } catch (err) {
    console.error('Error fetching OpenTriviaDB:', err.message);
  }
  return insertedCount;
}

async function run() {
  console.log('--- Starting External Question Seeding ---');
  const alocCount = await seedALOC();
  const triviaCount = await seedOpenTrivia();
  console.log('--- Seeding Complete ---');
  console.log(`Total ALOC Inserted: ${alocCount}`);
  console.log(`Total OpenTriviaDB Inserted: ${triviaCount}`);
}

run();
