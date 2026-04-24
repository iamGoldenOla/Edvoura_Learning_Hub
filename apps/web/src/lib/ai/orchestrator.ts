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
 *
 * This design ensures the system works even if the AI degrades —
 * bad output is NEVER stored.
 */

import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

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

// ---------------------------------------------------------------------------
// Core content generation (Lesson Notes, Stories, Comprehensions, Quizzes)
// ---------------------------------------------------------------------------
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
          ? `\n\n⚠️ Your previous response was rejected because it did not meet quality or format requirements. Please be MORE thorough, MORE detailed, and ensure your JSON is valid. Attempt ${attempt + 1}/${MAX_RETRIES + 1}.`
          : '';

      const { text } = await generateText({
        model: openai('gpt-4o'),
        system: SYSTEM_IDENTITY,
        prompt: userPrompt + retryHint,
        temperature: 0.7,
        maxTokens: 4096,
      });

      // Strip any markdown wrapping the LLM might add
      const cleaned = text
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();

      const parsed = JSON.parse(cleaned);
      const validated = schema.parse(parsed);

      return {
        success: true as const,
        data: validated,
        contentType: params.contentType,
        attempts: attempt + 1,
      };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.error(
        `[AI Orchestrator] Attempt ${attempt + 1} failed for ${params.contentType}:`,
        lastError.message,
      );
    }
  }

  return {
    success: false as const,
    error: lastError?.message ?? 'Unknown generation failure',
    contentType: params.contentType,
    attempts: MAX_RETRIES + 1,
  };
}

// ---------------------------------------------------------------------------
// Student Analysis (Personalization Engine)
// ---------------------------------------------------------------------------
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

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const { text } = await generateText({
        model: openai('gpt-4o'),
        system: SYSTEM_IDENTITY,
        prompt: userPrompt,
        temperature: 0.5,
        maxTokens: 2048,
      });

      const cleaned = text
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();

      const parsed = JSON.parse(cleaned);
      const validated = StudentAnalysisSchema.parse(parsed);

      return { success: true as const, data: validated, attempts: attempt + 1 };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  return {
    success: false as const,
    error: lastError?.message ?? 'Student analysis failed',
    attempts: MAX_RETRIES + 1,
  };
}

// ---------------------------------------------------------------------------
// Parent Report Generator (Operations Engine)
// ---------------------------------------------------------------------------
export async function generateParentReport(params: {
  childName: string;
  reportPeriod: string;
  performanceSummary: string;
  highlights: string[];
  concerns: string[];
}) {
  const userPrompt = buildParentReportPrompt(params);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const { text } = await generateText({
        model: openai('gpt-4o'),
        system: SYSTEM_IDENTITY,
        prompt: userPrompt,
        temperature: 0.6,
        maxTokens: 1500,
      });

      const cleaned = text
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();

      const parsed = JSON.parse(cleaned);
      const validated = ParentReportSchema.parse(parsed);

      return { success: true as const, data: validated, attempts: attempt + 1 };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  return {
    success: false as const,
    error: lastError?.message ?? 'Parent report generation failed',
    attempts: MAX_RETRIES + 1,
  };
}
