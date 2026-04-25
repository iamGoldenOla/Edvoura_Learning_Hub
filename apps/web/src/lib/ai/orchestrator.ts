/**
 * EDVOURA AI ENGINE — LLM Orchestrator
 *
 * This is the brain.  It:
 * 1. Accepts a generation request (type + curriculum context)
 * 2. Assembles the prompt from the prompt templates
 * 3. Calls the LLM via Vercel AI SDK (model-agnostic)
 * 4. Validates the response with the Zod schema
 * 5. Retries if validation fails (up to MAX_RETRIES)
 * 6. Returns clean, validated data or throws a structured error
 */

import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// We use the @ai-sdk/openai package to create a custom provider for OpenRouter.
const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY ?? process.env.OPENAI_API_KEY,
});

// Primary model for OpenRouter
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL ?? 'meta-llama/llama-3.1-70b-instruct';

// Gemini Fallback
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

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

const MAX_RETRIES = 2;

/**
 * Strips markdown and parses JSON
 */
function cleanAndParse(text: string, schema: any) {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  const parsed = JSON.parse(cleaned);
  return schema.parse(parsed);
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

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const retryHint =
        attempt > 0
          ? `\n\n⚠️ Your previous response was rejected. Please be MORE thorough and ensure your JSON is valid. Attempt ${attempt + 1}/${MAX_RETRIES + 1}.`
          : '';

      // Try OpenRouter First
      if (process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY) {
        try {
          const { text } = await generateText({
            model: openrouter(DEFAULT_MODEL),
            system: SYSTEM_IDENTITY,
            prompt: userPrompt + retryHint,
            temperature: 0.7,
          });
          const validated = cleanAndParse(text, schema);
          return { success: true as const, data: validated, contentType: params.contentType, attempts: attempt + 1 };
        } catch (orErr) {
          console.warn('[AI Orchestrator] OpenRouter failed, trying Gemini...', orErr);
        }
      }

      // Try Gemini Fallback
      if (process.env.GEMINI_API_KEY) {
        const result = await geminiModel.generateContent(SYSTEM_IDENTITY + '\n\n' + userPrompt + retryHint);
        const text = result.response.text();
        const validated = cleanAndParse(text, schema);
        return { success: true as const, data: validated, contentType: params.contentType, attempts: attempt + 1 };
      }

      throw new Error('No valid AI API keys found (OPENROUTER_API_KEY or GEMINI_API_KEY)');
    } catch (err: any) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.error(`[AI Orchestrator] Attempt ${attempt + 1} failed:`, lastError.message);
    }
  }

  return {
    success: false as const,
    error: lastError?.message ?? 'Unknown generation failure',
    contentType: params.contentType,
    attempts: MAX_RETRIES + 1,
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
  const userPrompt = buildStudentAnalysisPrompt(params);
  try {
    if (process.env.GEMINI_API_KEY) {
       const result = await geminiModel.generateContent(SYSTEM_IDENTITY + '\n\n' + userPrompt);
       const text = result.response.text();
       const validated = cleanAndParse(text, StudentAnalysisSchema);
       return { success: true as const, data: validated, attempts: 1 };
    }
    const { text } = await generateText({
      model: openrouter(DEFAULT_MODEL),
      system: SYSTEM_IDENTITY,
      prompt: userPrompt,
      temperature: 0.5,
    });
    const validated = cleanAndParse(text, StudentAnalysisSchema);
    return { success: true as const, data: validated, attempts: 1 };
  } catch (err: any) {
    return { success: false as const, error: err.message, attempts: 1 };
  }
}

export async function generateParentReport(params: {
  childName: string;
  reportPeriod: string;
  performanceSummary: string;
  highlights: string[];
  concerns: string[];
}) {
  const userPrompt = buildParentReportPrompt(params);
  try {
    if (process.env.GEMINI_API_KEY) {
       const result = await geminiModel.generateContent(SYSTEM_IDENTITY + '\n\n' + userPrompt);
       const text = result.response.text();
       const validated = cleanAndParse(text, ParentReportSchema);
       return { success: true as const, data: validated, attempts: 1 };
    }
    const { text } = await generateText({
      model: openrouter(DEFAULT_MODEL),
      system: SYSTEM_IDENTITY,
      prompt: userPrompt,
      temperature: 0.6,
    });
    const validated = cleanAndParse(text, ParentReportSchema);
    return { success: true as const, data: validated, attempts: 1 };
  } catch (err: any) {
    return { success: false as const, error: err.message, attempts: 1 };
  }
}
