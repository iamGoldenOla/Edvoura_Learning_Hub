/**
 * EDVOURA AI ENGINE — Zod Validation Schemas
 *
 * These schemas are the "dumb-proof" firewall.  Every AI output MUST pass
 * through these validators before touching the database.  If the LLM gives
 * shallow, lazy, or structurally wrong answers the validator rejects them
 * and the orchestrator retries or escalates to a human.
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// 1. LESSON NOTE
// ---------------------------------------------------------------------------
export const LessonNoteSchema = z.object({
  topic: z.string().min(5, 'Topic must be at least 5 characters'),
  objectives: z
    .array(z.string().min(10))
    .min(3, 'At least 3 learning objectives required'),
  explanation: z
    .string()
    .min(120, 'Explanation must be comprehensive'),
  examples: z
    .array(
      z.object({
        context: z.string().min(20, 'Example context must be detailed'),
        solution: z.string().min(20, 'Example solution must be detailed'),
      }),
    )
    .min(2, 'At least 2 worked examples required'),
  practiceQuestions: z
    .array(
      z.object({
        question: z.string().min(10),
        answer: z.string().min(5),
        difficulty: z.enum(['easy', 'medium', 'hard']),
      }),
    )
    .min(4, 'At least 4 practice questions required'),
  teacherNotes: z.string().optional(),
});

export type LessonNote = z.infer<typeof LessonNoteSchema>;

// ---------------------------------------------------------------------------
// 2. STORY
// ---------------------------------------------------------------------------
export const StorySchema = z.object({
  title: z.string().min(5),
  moralLesson: z.string().min(10, 'Moral lesson must be meaningful'),
  ageSuitability: z.string(), // e.g. "6-8", "9-12"
  content: z
    .string()
    .min(180, 'Story must be rich and immersive'),
  vocabulary: z
    .array(
      z.object({
        word: z.string(),
        meaning: z.string().min(3),
      }),
    )
    .min(3, 'At least 3 vocabulary words required'),
});

export type Story = z.infer<typeof StorySchema>;

// ---------------------------------------------------------------------------
// 3. COMPREHENSION PASSAGE
// ---------------------------------------------------------------------------
export const ComprehensionSchema = z.object({
  title: z.string().min(5),
  passage: z
    .string()
    .min(180, 'Passage must be thorough'),
  vocabulary: z
    .array(
      z.object({
        word: z.string(),
        meaning: z.string().min(3),
      }),
    )
    .min(3),
  questions: z
    .array(
      z.object({
        question: z.string().min(10),
        answer: z.string().min(3),
        type: z.enum(['factual', 'inferential', 'evaluative']),
      }),
    )
    .min(4, 'At least 4 comprehension questions required'),
});

export type Comprehension = z.infer<typeof ComprehensionSchema>;

// ---------------------------------------------------------------------------
// 4. QUIZ / WORKSHEET
// ---------------------------------------------------------------------------
export const QuizSchema = z.object({
  title: z.string().min(5),
  instructions: z.string().min(20),
  questions: z
    .array(
      z.object({
        questionText: z.string().min(10),
        questionType: z.enum(['multiple_choice', 'short_answer', 'true_false', 'fill_in_blank']),
        options: z.array(z.string()).optional(), // for MCQ
        correctAnswer: z.string().min(1),
        explanation: z.string().min(5, 'Each answer must have a teaching explanation'),
        difficulty: z.enum(['easy', 'medium', 'hard']),
      }),
    )
    .min(8, 'At least 8 quiz questions required'),
});

export type Quiz = z.infer<typeof QuizSchema>;

// ---------------------------------------------------------------------------
// 5. SPELLING BEE
// ---------------------------------------------------------------------------
export const SpellingBeeSchema = z.object({
  title: z.string().min(5),
  instructions: z.string().min(20),
  theme: z.string().min(3),
  words: z
    .array(
      z.object({
        word: z.string().min(2),
        pronunciation: z.string().min(2),
        syllables: z.number().int().min(1).max(10),
        definition: z.string().min(8),
        exampleSentence: z.string().min(12),
        hint: z.string().min(5),
        difficulty: z.enum(['easy', 'medium', 'hard']),
      }),
    )
    .min(8, 'At least 8 spelling bee words required'),
});

export type SpellingBee = z.infer<typeof SpellingBeeSchema>;

// ---------------------------------------------------------------------------
// 6. STUDENT ANALYSIS (Personalization Engine output)
// ---------------------------------------------------------------------------
export const StudentAnalysisSchema = z.object({
  studentId: z.string().uuid(),
  overallAssessment: z.string().min(50),
  learningPace: z.enum(['accelerated', 'standard', 'needs_intervention']),
  strongAreas: z
    .array(
      z.object({
        subject: z.string(),
        topicFocus: z.string().optional(),
        reason: z.string().min(20),
      }),
    )
    .min(1),
  weakAreas: z
    .array(
      z.object({
        subject: z.string(),
        topicFocus: z.string().optional(),
        reason: z.string().min(20),
        severity: z.enum(['high', 'medium', 'low']),
      }),
    )
    .min(1),
  weakTopics: z
    .array(
      z.object({
        subject: z.string(),
        topic: z.string().min(3),
        evidence: z.string().min(20),
        latestScore: z.number().min(0).max(100).nullable(),
        trend: z.enum(['declining', 'inconsistent', 'emerging']),
      }),
    )
    .min(1),
  recommendations: z
    .array(
      z.object({
        action: z.string().min(20),
        priority: z.enum(['high', 'medium', 'low']),
        targetAudience: z.enum(['tutor', 'parent', 'student']),
      }),
    )
    .min(2, 'At least 2 actionable recommendations required'),
  tutorActions: z
    .array(
      z.object({
        action: z.string().min(20),
        priority: z.enum(['high', 'medium', 'low']),
        targetSubject: z.string().min(2),
        targetTopic: z.string().optional(),
        rationale: z.string().min(20),
      }),
    )
    .min(2, 'At least 2 tutor actions required'),
  parentSummary: z.object({
    headline: z.string().min(10),
    summary: z.string().min(60),
    supportActions: z.array(z.string().min(12)).min(2),
  }),
  studentPlan: z.object({
    encouragement: z.string().min(20),
    focusTopics: z.array(z.string().min(3)).min(2),
    nextSteps: z.array(z.string().min(10)).min(3),
    practiceStyle: z.string().min(12),
  }),
  revisionPlan: z.object({
    focusTopics: z.array(z.string().min(3)).min(2),
    suggestedSchedule: z.string().min(30),
    weeklyGoals: z.array(z.string().min(8)).min(2),
  }),
});

export type StudentAnalysis = z.infer<typeof StudentAnalysisSchema>;

// ---------------------------------------------------------------------------
// 7. PARENT REPORT (Auto-generated weekly digest)
// ---------------------------------------------------------------------------
export const ParentReportSchema = z.object({
  childName: z.string(),
  reportPeriod: z.string(),
  summary: z
    .string()
    .min(200, 'Parent report summary must be thorough and warm'),
  highlights: z.array(z.string().min(10)).min(1),
  areasForImprovement: z.array(z.string().min(10)),
  suggestionsForHome: z
    .array(z.string().min(20))
    .min(1, 'At least 1 actionable suggestion for parents'),
  tone: z.literal('warm_professional'),
});

export type ParentReport = z.infer<typeof ParentReportSchema>;

// ---------------------------------------------------------------------------
// 8. LESSON EXPLAINER
// ---------------------------------------------------------------------------
export const LessonExplainerSchema = z.object({
  mode: z.enum(['simple', 'harder_examples', 'checks_for_understanding', 'revision_notes']),
  title: z.string().min(5),
  explanation: z.string().min(120),
  examples: z.array(z.string().min(12)).max(5).default([]),
  checks: z
    .array(
      z.object({
        question: z.string().min(8),
        answerHint: z.string().min(5),
      }),
    )
    .max(5)
    .default([]),
  revisionNotes: z.array(z.string().min(8)).max(8).default([]),
  nextStep: z.string().min(12),
});

export type LessonExplainer = z.infer<typeof LessonExplainerSchema>;

// ---------------------------------------------------------------------------
// Content type union for the generation API
// ---------------------------------------------------------------------------
export const CONTENT_TYPES = [
  'lesson_note',
  'story',
  'comprehension',
  'quiz',
  'worksheet',
  'spelling_bee',
] as const;

export type ContentType = (typeof CONTENT_TYPES)[number];

export function getSchemaForType(type: ContentType) {
  switch (type) {
    case 'lesson_note':
      return LessonNoteSchema;
    case 'story':
      return StorySchema;
    case 'comprehension':
      return ComprehensionSchema;
    case 'quiz':
    case 'worksheet':
      return QuizSchema;
    case 'spelling_bee':
      return SpellingBeeSchema;
  }
}
