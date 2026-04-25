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
} from './schemas';
import {
  SYSTEM_IDENTITY,
  buildGenerationPrompt,
  buildStudentAnalysisPrompt,
  buildParentReportPrompt,
} from './prompts';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL ?? 'meta-llama/llama-3.1-70b-instruct';
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';
const MAX_RETRIES = 2;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const geminiModel = genAI.getGenerativeModel({ model: GEMINI_MODEL });

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
  let lastError: Error | null = null;

  for (const [index, key] of keys.entries()) {
    try {
      const openrouter = createOpenRouterClient(key);
      const { text } = await generateText({
        model: openrouter(DEFAULT_MODEL),
        system: SYSTEM_IDENTITY,
        prompt,
        temperature,
      });

      return { text, provider: `openrouter:${index + 1}` };
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`[AI Orchestrator] OpenRouter key ${index + 1} failed.`, lastError.message);
    }
  }

  if (lastError) {
    throw lastError;
  }

  throw new Error('No valid OpenRouter keys configured');
}

async function tryGeminiText(prompt: string) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const result = await geminiModel.generateContent(`${SYSTEM_IDENTITY}\n\n${prompt}`);
  return { text: result.response.text(), provider: `gemini:${GEMINI_MODEL}` };
}

async function generateValidatedWithFallback<TSchema extends z.ZodTypeAny>(options: {
  prompt: string;
  schema: TSchema;
  temperature: number;
  maxRetries?: number;
}) {
  const maxRetries = options.maxRetries ?? 1;
  let lastError: Error | null = null;

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
      console.warn('[AI Orchestrator] OpenRouter failed, trying Gemini...', lastError.message);
    }

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
      console.error(`[AI Orchestrator] Attempt ${attempt + 1} failed:`, lastError.message);
    }
  }

  return {
    success: false as const,
    error:
      lastError?.message ??
      'No valid AI provider keys found. Set OPENROUTER_API_KEY/OPENROUTER_KEY_* or GEMINI_API_KEY.',
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
