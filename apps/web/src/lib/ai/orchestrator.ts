/**
 * EDVOURA AI ENGINE - LLM Orchestrator
 *
 * This is the brain. It:
 * 1. Accepts a generation request (type + curriculum context)
 * 2. Assembles the prompt from the prompt templates
 * 3. Calls the LLM via OpenRouter first, then Gemini fallback
 * 4. Validates the response with the Zod schema
 * 5. Retries if validation fails (up to MAX_RETRIES)
 * 6. Returns clean, validated data or throws a structured error
 */

import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

import {
  type ContentType,
  getSchemaForType,
  StudentAnalysisSchema,
  ParentReportSchema,
  LessonExplainerSchema,
} from './schemas';
import {
  SYSTEM_IDENTITY,
  buildGenerationPrompt,
  buildStudentAnalysisPrompt,
  buildParentReportPrompt,
  buildLessonExplainerPrompt,
} from './prompts';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL ?? 'meta-llama/llama-3.1-70b-instruct';
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';
const MAX_RETRIES = 3;
const OPENROUTER_MODEL_CANDIDATES = [
  DEFAULT_MODEL,
  'meta-llama/llama-3.1-70b-instruct',
  'mistralai/mistral-large',
  'anthropic/claude-3.5-sonnet',
];
const blockedOpenRouterKeys = new Set<string>();

const isOpenRouterAuthError = (message: string) =>
  /user not found|invalid api key|unauthorized|401|403/i.test(message);

function createOpenRouterClient(apiKey: string) {
  return createOpenAI({
    baseURL: OPENROUTER_BASE_URL,
    apiKey,
  });
}

function getOpenRouterKeys() {
  const numberedKeys = Object.entries(process.env)
    .filter(([name, value]) => /^OPENROUTER_KEY_\d+$/.test(name) && typeof value === 'string' && value.trim())
    .sort(([left], [right]) => {
      const leftNumber = Number.parseInt(left.replace('OPENROUTER_KEY_', ''), 10);
      const rightNumber = Number.parseInt(right.replace('OPENROUTER_KEY_', ''), 10);
      return leftNumber - rightNumber;
    })
    .map(([, value]) => value!.trim());

  const primaryKeys = [process.env.OPENROUTER_API_KEY, process.env.OPENAI_API_KEY]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .map((value) => value.trim());

  return [...new Set([...primaryKeys, ...numberedKeys])].filter((key) => !blockedOpenRouterKeys.has(key));
}

function getOpenRouterModels() {
  const envModels = [process.env.OPENROUTER_MODEL_FALLBACKS]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .flatMap((value) => value.split(',').map((entry) => entry.trim()).filter(Boolean));

  return [...new Set([...OPENROUTER_MODEL_CANDIDATES, ...envModels])];
}

function getGeminiKeys() {
  const numberedKeys = Object.entries(process.env)
    .filter(([name, value]) => /^GEMINI_API_KEY_\d+$/.test(name) && typeof value === 'string' && value.trim())
    .sort(([left], [right]) => {
      const leftNumber = Number.parseInt(left.replace('GEMINI_API_KEY_', ''), 10);
      const rightNumber = Number.parseInt(right.replace('GEMINI_API_KEY_', ''), 10);
      return leftNumber - rightNumber;
    })
    .map(([, value]) => value!.trim());

  const primaryKeys = [process.env.GEMINI_API_KEY]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .map((value) => value.trim());

  return [...new Set([...primaryKeys, ...numberedKeys])];
}

/**
 * Strips markdown fences and extracts the first valid JSON object/array.
 */
export function extractJsonPayload(text: string) {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const firstObject = cleaned.indexOf('{');
    const lastObject = cleaned.lastIndexOf('}');

    if (firstObject >= 0 && lastObject > firstObject) {
      return JSON.parse(cleaned.slice(firstObject, lastObject + 1));
    }

    const firstArray = cleaned.indexOf('[');
    const lastArray = cleaned.lastIndexOf(']');

    if (firstArray >= 0 && lastArray > firstArray) {
      return JSON.parse(cleaned.slice(firstArray, lastArray + 1));
    }

    throw new Error('Model returned invalid JSON');
  }
}

function cleanAndParse(text: string, schema: z.ZodTypeAny) {
  const parsed = extractJsonPayload(text);
  return schema.parse(parsed);
}

async function tryOpenRouterText(prompt: string, temperature: number) {
  const keys = getOpenRouterKeys();
  const models = getOpenRouterModels();
  const failures: string[] = [];

  for (const [index, key] of keys.entries()) {
    let authFailureCountForKey = 0;
    for (const modelName of models) {
      try {
        const openrouter = createOpenRouterClient(key);
        const { text } = await generateText({
          model: openrouter(modelName),
          system: SYSTEM_IDENTITY,
          prompt,
          temperature,
        });

        return { text, provider: `openrouter:${index + 1}:${modelName}` };
      } catch (error: unknown) {
        const failure = error instanceof Error ? error.message : String(error);
        failures.push(`key_${index + 1}/${modelName}: ${failure}`);
        if (isOpenRouterAuthError(failure)) {
          authFailureCountForKey += 1;
        }
        console.warn(`[AI Orchestrator] OpenRouter key ${index + 1} model ${modelName} failed.`, failure);
      }
    }

    if (authFailureCountForKey >= models.length) {
      blockedOpenRouterKeys.add(key);
    }
  }

  if (failures.length > 0) {
    throw new Error(`OpenRouter failed across all keys/models: ${failures.slice(0, 6).join(' | ')}`);
  }

  throw new Error('No valid OpenRouter keys configured');
}

function buildEmergencyEducationalContent(params: {
  contentType: ContentType;
  topic: string;
  subject: string;
  gradeLevel: string;
}) {
  const baseTopic = params.topic.trim() || 'Core concept';
  const subject = params.subject.trim() || 'General Studies';
  const grade = params.gradeLevel.trim() || 'grade_7';

  if (params.contentType === 'lesson_note') {
    return {
      topic: baseTopic,
      objectives: [
        `Define ${baseTopic} in clear terms suitable for ${grade}.`,
        `Identify real-life uses of ${baseTopic} within ${subject}.`,
        `Apply ${baseTopic} to guided class and homework exercises.`,
      ],
      explanation: `${baseTopic} is a key topic in ${subject}. Students in ${grade} should understand what it means, why it matters, and how to solve related tasks using a step-by-step approach. Start with concrete examples, then move to structured practice where learners explain each step out loud before writing final answers.`,
      examples: [
        {
          context: `Example 1: Daily-life scenario connected to ${baseTopic} in ${subject}.`,
          solution: 'Break the task into smaller steps, solve each step carefully, and check your final response for accuracy.',
        },
        {
          context: `Example 2: Classroom activity that reinforces ${baseTopic} with partner discussion.`,
          solution: 'Use the same method, justify each step, and compare your answer with an alternative method.',
        },
      ],
      practiceQuestions: [
        { question: `State one key idea about ${baseTopic}.`, answer: `A key idea is that ${baseTopic} can be explained clearly and applied in tasks.`, difficulty: 'easy' as const },
        { question: `Give a simple example of ${baseTopic} in ${subject}.`, answer: `Use a short real-life example and explain the steps used.`, difficulty: 'easy' as const },
        { question: `Solve an intermediate task on ${baseTopic} and show steps.`, answer: 'Show each step in sequence and verify the final result.', difficulty: 'medium' as const },
        { question: `Explain how to avoid common mistakes in ${baseTopic}.`, answer: 'Check units, signs, and logic before final submission.', difficulty: 'hard' as const },
      ],
      teacherNotes: 'Use guided practice first, then independent practice with feedback.',
    };
  }

  if (params.contentType === 'story') {
    return {
      title: `${baseTopic}: A Learning Story`,
      moralLesson: 'Consistent effort and honest practice lead to mastery.',
      ageSuitability: '9-14',
      content: `Ada wanted to improve in ${subject}, but ${baseTopic} looked difficult at first. Her tutor showed her how to break hard work into small steps. Every day she practiced one part, asked questions, and reviewed mistakes without fear. After a few weeks, she could solve class tasks confidently and even helped her friends understand the same topic. On test day, Ada stayed calm, followed the method she practiced, and finished with strong results. She learned that progress comes from patience, reflection, and steady work.`,
      vocabulary: [
        { word: 'Mastery', meaning: 'Strong understanding gained through practice.' },
        { word: 'Consistent', meaning: 'Doing something regularly without stopping.' },
        { word: 'Reflect', meaning: 'To think carefully about what went well or badly.' },
      ],
    };
  }

  if (params.contentType === 'comprehension') {
    return {
      title: `${baseTopic} Reading Passage`,
      passage: `${baseTopic} is an important part of ${subject}. Many students improve quickly when they learn how to organize information, practice daily, and explain ideas in their own words. Teachers can support this by using examples from school and home. When learners get feedback and correct mistakes early, confidence grows and performance becomes more stable over time.`,
      vocabulary: [
        { word: 'Organize', meaning: 'To arrange ideas in a clear order.' },
        { word: 'Feedback', meaning: 'Advice that helps improve performance.' },
        { word: 'Stable', meaning: 'Consistent and not changing suddenly.' },
      ],
      questions: [
        { question: `Why is ${baseTopic} important?`, answer: 'It builds understanding and improves performance over time.', type: 'factual' as const },
        { question: 'What actions help students improve faster?', answer: 'Daily practice, clear methods, and feedback.', type: 'inferential' as const },
        { question: 'How can teachers help struggling learners?', answer: 'Use relatable examples and correct mistakes early.', type: 'factual' as const },
        { question: 'Do you think confidence affects performance? Why?', answer: 'Yes, confidence helps students attempt tasks and persist.', type: 'evaluative' as const },
      ],
    };
  }

  if (params.contentType === 'spelling_bee') {
    return {
      title: `${subject} ${grade} Spelling Bee: ${baseTopic}`,
      instructions: 'Spell each word, say its meaning, and use it in a correct sentence.',
      theme: baseTopic,
      words: [
        { word: 'learning', pronunciation: 'LUR-ning', syllables: 2, definition: 'The process of gaining knowledge.', exampleSentence: 'Learning takes time and steady effort.', hint: 'Starts with l-e-a', difficulty: 'easy' as const },
        { word: 'practice', pronunciation: 'PRAK-tis', syllables: 2, definition: 'Doing something repeatedly to improve.', exampleSentence: 'Practice helps students become confident.', hint: 'Contains c-t-i', difficulty: 'easy' as const },
        { word: 'concept', pronunciation: 'KON-sept', syllables: 2, definition: 'An idea or principle.', exampleSentence: 'The concept was explained with examples.', hint: 'Ends with cept', difficulty: 'medium' as const },
        { word: 'analysis', pronunciation: 'uh-NAL-uh-sis', syllables: 4, definition: 'Detailed examination of something.', exampleSentence: 'Her analysis of the problem was accurate.', hint: 'Starts with ana', difficulty: 'medium' as const },
        { word: 'revision', pronunciation: 'ri-VI-zhun', syllables: 3, definition: 'Reviewing work to improve understanding.', exampleSentence: 'Revision before exams improves retention.', hint: 'Contains visi', difficulty: 'medium' as const },
        { word: 'resilience', pronunciation: 'ri-ZIL-yens', syllables: 4, definition: 'Ability to recover from difficulties.', exampleSentence: 'Resilience helps students keep trying.', hint: 'Starts with resi', difficulty: 'hard' as const },
        { word: 'achievement', pronunciation: 'uh-CHEEV-ment', syllables: 3, definition: 'Something done successfully.', exampleSentence: 'Finishing the project was a big achievement.', hint: 'Contains chiev', difficulty: 'hard' as const },
        { word: 'discipline', pronunciation: 'DIS-uh-plin', syllables: 3, definition: 'Self-control and orderly behavior.', exampleSentence: 'Discipline helps learners manage time well.', hint: 'Ends with pline', difficulty: 'hard' as const },
      ],
    };
  }

  return {
    title: `${subject} ${grade}: ${baseTopic} Quiz`,
    instructions: 'Answer all questions and explain your reasoning where possible.',
    questions: [
      { questionText: `What is ${baseTopic}?`, questionType: 'short_answer' as const, correctAnswer: `A core idea in ${subject}.`, explanation: 'Define the topic clearly before solving questions.', difficulty: 'easy' as const },
      { questionText: `Which statement best describes ${baseTopic}?`, questionType: 'multiple_choice' as const, options: ['It is irrelevant', 'It supports learning goals', 'It is only for advanced students', 'It cannot be practiced'], correctAnswer: 'It supports learning goals', explanation: 'The topic builds foundational understanding.', difficulty: 'easy' as const },
      { questionText: `True or False: Practice improves performance in ${baseTopic}.`, questionType: 'true_false' as const, correctAnswer: 'True', explanation: 'Repeated correct practice improves mastery.', difficulty: 'easy' as const },
      { questionText: `Complete: A good study habit is ____ review.`, questionType: 'fill_in_blank' as const, correctAnswer: 'daily', explanation: 'Frequent revision reinforces memory.', difficulty: 'medium' as const },
      { questionText: `Give one real-life application of ${baseTopic}.`, questionType: 'short_answer' as const, correctAnswer: 'Any relevant classroom or daily-life example.', explanation: 'Application shows true understanding.', difficulty: 'medium' as const },
      { questionText: 'Which action best improves weak areas?', questionType: 'multiple_choice' as const, options: ['Ignore mistakes', 'Review mistakes and retry', 'Stop practicing', 'Memorize only'], correctAnswer: 'Review mistakes and retry', explanation: 'Correction loop drives improvement.', difficulty: 'medium' as const },
      { questionText: 'True or False: Feedback can be ignored when preparing for tests.', questionType: 'true_false' as const, correctAnswer: 'False', explanation: 'Feedback helps refine weak points.', difficulty: 'hard' as const },
      { questionText: `Name one strategy to master ${baseTopic}.`, questionType: 'short_answer' as const, correctAnswer: 'Break tasks into steps and practice consistently.', explanation: 'Structured methods improve performance.', difficulty: 'hard' as const },
    ],
  };
}

async function tryGeminiText(prompt: string) {
  const keys = getGeminiKeys();
  if (keys.length === 0) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const failures: string[] = [];

  for (const [index, key] of keys.entries()) {
    try {
      const genAI = new GoogleGenerativeAI(key);
      const geminiModel = genAI.getGenerativeModel({ model: GEMINI_MODEL });
      const result = await geminiModel.generateContent(`${SYSTEM_IDENTITY}\n\n${prompt}`);
      return { text: result.response.text(), provider: `gemini:${index + 1}:${GEMINI_MODEL}` };
    } catch (error: unknown) {
      const failure = error instanceof Error ? error.message : String(error);
      failures.push(`key_${index + 1}: ${failure}`);
      console.warn(`[AI Orchestrator] Gemini key ${index + 1} failed.`, failure);
    }
  }

  throw new Error(`Gemini failed across all configured keys: ${failures.slice(0, 6).join(' | ')}`);
}

async function generateValidatedWithFallback<TSchema extends z.ZodTypeAny>(options: {
  prompt: string;
  schema: TSchema;
  temperature: number;
  maxRetries?: number;
}) {
  const maxRetries = options.maxRetries ?? 1;
  const hasGeminiFallback = getGeminiKeys().length > 0;
  let lastError: Error | null = null;
  let lastOpenRouterError: string | null = null;
  let lastGeminiError: string | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const retryHint =
      attempt > 0
        ? `\n\nYour previous response was rejected. Return only valid JSON that matches the requested schema exactly. Attempt ${attempt + 1}/${maxRetries + 1}.`
        : '';
    const promptWithRetry = options.prompt + retryHint;

    try {
      const openRouterResult = await tryOpenRouterText(promptWithRetry, options.temperature);
      return {
        success: true as const,
        data: cleanAndParse(openRouterResult.text, options.schema),
        provider: openRouterResult.provider,
        attempts: attempt + 1,
      };
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error));
      lastOpenRouterError = lastError.message;
      console.warn('[AI Orchestrator] OpenRouter failed, trying Gemini...', lastError.message);
    }

    if (hasGeminiFallback) {
      try {
        const geminiResult = await tryGeminiText(promptWithRetry);
        return {
          success: true as const,
          data: cleanAndParse(geminiResult.text, options.schema),
          provider: geminiResult.provider,
          attempts: attempt + 1,
        };
      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error(String(error));
        lastGeminiError = lastError.message;
        console.error(`[AI Orchestrator] Attempt ${attempt + 1} failed:`, lastError.message);
      }
    } else {
      console.warn('[AI Orchestrator] Gemini fallback is disabled (no GEMINI_API_KEY configured).');
    }
  }

  const combinedError = [lastOpenRouterError ? `OpenRouter: ${lastOpenRouterError}` : null, lastGeminiError ? `Gemini: ${lastGeminiError}` : null]
    .filter(Boolean)
    .join(' | ');

  return {
    success: false as const,
    error:
      combinedError ||
      (lastError?.message ??
        'No valid OpenRouter provider keys found. Set OPENROUTER_API_KEY or OPENROUTER_KEY_* env vars.'),
    attempts: maxRetries + 1,
  };
}

export async function generateEducationalContent(params: {
  contentType: ContentType;
  topic: string;
  subject: string;
  gradeLevel: string;
  curriculumSystem: string;
  objectives?: string[];
  difficulty?: number;
  studentContext?: string;
}) {
  const schema = getSchemaForType(params.contentType);
  const userPrompt = buildGenerationPrompt(params);

  const result = await generateValidatedWithFallback({
    prompt: userPrompt,
    schema,
    temperature: 0.7,
    maxRetries: MAX_RETRIES,
  });

  if (!result.success) {
    const emergencyContent = buildEmergencyEducationalContent(params);
    const emergencyValidation = schema.safeParse(emergencyContent);

    if (emergencyValidation.success) {
      return {
        success: true as const,
        data: emergencyValidation.data,
        contentType: params.contentType,
        attempts: result.attempts,
        provider: 'fallback:local-template',
      };
    }

    return {
      success: false as const,
      error: result.error,
      contentType: params.contentType,
      attempts: result.attempts,
    };
  }

  return {
    success: true as const,
    data: result.data,
    contentType: params.contentType,
    attempts: result.attempts,
    provider: result.provider,
  };
}

export async function analyzeStudentPerformance(params: {
  studentName: string;
  studentId: string;
  gradeLevel: string;
  performanceData: {
    subject: string;
    averageScore: number;
    assignmentsCompleted: number;
    attendanceRate: number;
  }[];
  topicPerformance?: {
    subject: string;
    topic: string;
    score: number;
    source: 'assignment' | 'ai_practice';
    feedback?: string | null;
  }[];
}) {
  const result = await generateValidatedWithFallback({
    prompt: buildStudentAnalysisPrompt(params),
    schema: StudentAnalysisSchema,
    temperature: 0.5,
  });

  if (!result.success) {
    return { success: false as const, error: result.error, attempts: result.attempts };
  }

  return { success: true as const, data: result.data, attempts: result.attempts, provider: result.provider };
}

export async function generateParentReport(params: {
  childName: string;
  reportPeriod: string;
  performanceSummary: string;
  highlights: string[];
  concerns: string[];
}) {
  const result = await generateValidatedWithFallback({
    prompt: buildParentReportPrompt(params),
    schema: ParentReportSchema,
    temperature: 0.6,
  });

  if (!result.success) {
    return { success: false as const, error: result.error, attempts: result.attempts };
  }

  return { success: true as const, data: result.data, attempts: result.attempts, provider: result.provider };
}

export async function explainLessonContent(params: {
  mode: 'simple' | 'harder_examples' | 'checks_for_understanding' | 'revision_notes';
  topic: string;
  subject: string;
  gradeLevel: string;
  lessonText: string;
}) {
  const result = await generateValidatedWithFallback({
    prompt: buildLessonExplainerPrompt(params),
    schema: LessonExplainerSchema,
    temperature: 0.55,
  });

  if (!result.success) {
    return { success: false as const, error: result.error, attempts: result.attempts };
  }

  return { success: true as const, data: result.data, attempts: result.attempts, provider: result.provider };
}

export async function generateFlashcards(params: {
  subject: string;
  topic: string;
  gradeLevel: string;
}) {
  const flashcardSchema = z.array(
    z.object({
      front: z.string().min(3),
      back: z.string().min(3),
    }),
  ).min(6);

  const prompt = `Generate 10 educational flashcards for a ${params.gradeLevel} student.
Subject: ${params.subject}
Topic: ${params.topic}

Each flashcard must have a "front" (question or concept) and a "back" (answer or explanation).
Make them engaging, simple, and age-appropriate.

Return ONLY a JSON array of objects with "front" and "back" keys.`;

  const result = await generateValidatedWithFallback({
    prompt,
    schema: flashcardSchema,
    temperature: 0.5,
  });

  if (!result.success) {
    return { success: false as const, error: result.error, attempts: result.attempts };
  }

  return { success: true as const, data: result.data, attempts: result.attempts, provider: result.provider };
}
