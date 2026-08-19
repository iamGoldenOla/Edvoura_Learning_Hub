import crypto from 'crypto';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabaseAdmin } from '@/utils/supabase/admin';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export interface QuestionInput {
  question_text: string;
  question_type?: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  topic: string;
  subtopic?: string;
  curriculum_region: string;
  subject: string;
  grade_band: string;
  is_current_affairs?: boolean;
  expires_at?: string | null;
}

export interface GenerationJobParams {
  subject: string;
  grade_band: string;
  curriculum_region: string;
  regional_grade_label?: string;
  topic: string;
  requested_count: number;
  difficulty?: string;
}

/**
 * Layer 1 Deduplication: Normalize question text and compute SHA-256 hash
 */
export function generateContentHash(questionText: string): string {
  const normalized = questionText
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Layer 2 Deduplication: Generate vector embedding using Gemini embedding model
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    if (!GEMINI_API_KEY) return [];
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await model.embedContent(text);
    return result.embedding.values || [];
  } catch (error) {
    console.warn('[EMBEDDING WARNING] Could not generate vector embedding:', error);
    return [];
  }
}

/**
 * Cosine similarity calculation for vector embeddings
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length === 0 || vecB.length === 0 || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Layer 2 Similarity Check against existing questions in the SAME curriculum region & topic
 */
export async function checkLayer2Similarity(
  newEmbedding: number[],
  region: string,
  subject: string,
  topic: string,
  threshold = 0.92
): Promise<{ isPossibleDuplicate: boolean; maxSimilarity: number }> {
  if (newEmbedding.length === 0) return { isPossibleDuplicate: false, maxSimilarity: 0 };

  try {
    const { data: existingQuestions } = await supabaseAdmin
      .from('question_bank')
      .select('id, question_text, embedding')
      .eq('curriculum_region', region)
      .eq('subject', subject)
      .eq('topic', topic)
      .not('embedding', 'is', null)
      .limit(100);

    let maxSimilarity = 0;

    if (existingQuestions && existingQuestions.length > 0) {
      for (const q of existingQuestions) {
        if (Array.isArray(q.embedding)) {
          const sim = cosineSimilarity(newEmbedding, q.embedding as number[]);
          if (sim > maxSimilarity) maxSimilarity = sim;
        }
      }
    }

    return {
      isPossibleDuplicate: maxSimilarity >= threshold,
      maxSimilarity,
    };
  } catch (err) {
    console.error('[LAYER 2 SIMILARITY ERROR]', err);
    return { isPossibleDuplicate: false, maxSimilarity: 0 };
  }
}

/**
 * Generate questions using Gemini Flash model
 */
export async function generateQuestionsWithGemini(params: GenerationJobParams): Promise<QuestionInput[]> {
  const {
    subject,
    grade_band,
    curriculum_region,
    regional_grade_label = grade_band,
    topic,
    requested_count,
    difficulty = 'medium',
  } = params;

  // Fetch recent questions to prevent immediate repetition in prompt
  const { data: recentQs } = await supabaseAdmin
    .from('question_bank')
    .select('question_text')
    .eq('curriculum_region', curriculum_region)
    .eq('subject', subject)
    .eq('topic', topic)
    .order('created_at', { ascending: false })
    .limit(10);

  const recentTexts = recentQs ? recentQs.map((q) => q.question_text).join('\n- ') : 'None';

  const prompt = `You are an educational content generator for Edvoura Learning Hub, a global K-12 tutoring platform serving students across multiple countries and curricula. Generate ${requested_count} quiz questions for:

Subject: ${subject}
Grade band: ${grade_band} (${regional_grade_label})
Curriculum region: ${curriculum_region}
Topic: ${topic}
Difficulty: ${difficulty}

Questions already in the bank for this subject/topic/region (do not repeat these or generate close variations of them):
- ${recentTexts}

Requirements:
- Align to the curriculum standards and conventions of ${curriculum_region} specifically — spelling conventions (e.g. British vs American English), units of measurement, historical/civic content, and cultural references should all match that region unless the subject is tagged GLOBAL.
- If curriculum_region is GLOBAL, avoid region-specific references entirely and keep the content universally applicable.
- Each question must be self-contained and unambiguous.
- For MCQ: exactly 4 options, only one correct, distractors must be plausible (not silly or obviously wrong).
- Include a one-sentence explanation of the correct answer.
- Avoid culturally inappropriate or ambiguous references. Region-specific content is expected and correct when curriculum_region calls for it (e.g. Nigerian civic content for NG, US civic content for US) — the goal is regional relevance, not neutrality.
- If category is "current_affairs", only use verifiable events from the last 30 days that are relevant to ${curriculum_region} (or globally significant, if curriculum_region is GLOBAL), and include the event date in the explanation.

Return ONLY valid JSON, no markdown fences, no preamble, in this exact shape:
[
  {
    "question_text": "...",
    "question_type": "mcq",
    "options": ["...", "...", "...", "..."],
    "correct_answer": "...",
    "explanation": "...",
    "difficulty": "easy|medium|hard",
    "topic": "...",
    "subtopic": "...",
    "curriculum_region": "${curriculum_region}"
  }
]`;

  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' });
  const response = await model.generateContent(prompt);
  const rawText = response.response.text().trim();

  // Strip markdown code fences if present
  const cleanedJson = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();

  const parsed = JSON.parse(cleanedJson);
  if (!Array.isArray(parsed)) {
    throw new Error('Gemini output is not a JSON array');
  }

  return parsed.map((item) => ({
    question_text: String(item.question_text || ''),
    question_type: String(item.question_type || 'mcq'),
    options: Array.isArray(item.options) ? item.options.map(String) : [],
    correct_answer: String(item.correct_answer || ''),
    explanation: String(item.explanation || ''),
    difficulty: (item.difficulty as 'easy' | 'medium' | 'hard') || difficulty,
    topic: String(item.topic || topic),
    subtopic: String(item.subtopic || ''),
    curriculum_region: String(item.curriculum_region || curriculum_region),
    subject,
    grade_band,
  }));
}

/**
 * Ingest generated questions into question_bank & educator_review_queue
 */
export async function ingestGeneratedQuestions(questions: QuestionInput[]): Promise<{
  insertedCount: number;
  duplicateCount: number;
}> {
  let insertedCount = 0;
  let duplicateCount = 0;

  for (const q of questions) {
    if (!q.question_text || q.options.length < 2 || !q.correct_answer) {
      continue;
    }

    const contentHash = generateContentHash(q.question_text);
    const embedding = await generateEmbedding(q.question_text);

    // Layer 2 similarity check
    const { isPossibleDuplicate, maxSimilarity } = await checkLayer2Similarity(
      embedding,
      q.curriculum_region,
      q.subject,
      q.topic
    );

    const questionPayload = {
      subject: q.subject,
      grade_band: q.grade_band,
      curriculum_region: q.curriculum_region,
      topic: q.topic,
      subtopic: q.subtopic || '',
      question_text: q.question_text,
      question_type: q.question_type || 'mcq',
      options: q.options,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      difficulty: q.difficulty || 'medium',
      source: 'ai-generated',
      status: 'pending_review',
      is_current_affairs: Boolean(q.is_current_affairs),
      expires_at: q.expires_at || null,
      content_hash: contentHash,
      embedding: embedding.length > 0 ? embedding : null,
    };

    // Insert into question_bank (Layer 1 content_hash UNIQUE constraint prevents exact duplicates)
    const { data: insertedQ, error: insertErr } = await supabaseAdmin
      .from('question_bank')
      .insert(questionPayload)
      .select('id')
      .single();

    if (insertErr) {
      if (insertErr.code === '23505') {
        // Unique hash violation (Layer 1 duplicate)
        duplicateCount++;
        console.log(`[LAYER 1 DEDUP BLOCKED] ${q.question_text.slice(0, 50)}...`);
      } else {
        console.error('[QUESTION BANK INSERT ERROR]', insertErr);
      }
      continue;
    }

    insertedCount++;

    // Add to Educator Review Queue with Layer 2 duplicate flags
    if (insertedQ?.id) {
      await supabaseAdmin.from('educator_review_queue').insert({
        question_id: insertedQ.id,
        status: 'pending',
        is_possible_duplicate: isPossibleDuplicate,
        duplicate_similarity: isPossibleDuplicate ? maxSimilarity : null,
      });
    }
  }

  return { insertedCount, duplicateCount };
}
