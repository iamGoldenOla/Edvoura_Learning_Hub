import { z } from "zod";
import type { EdvouraTaskType } from "./edvouraPromptBuilder";

const lessonSchema = z.object({
  title: z.string().min(3),
  explanation: z.string().min(40),
  real_world_examples: z.array(z.string().min(4)).min(1),
  story_based_explanation: z.string().min(20),
  key_points: z.array(z.string().min(3)).min(3),
  practice_questions: z
    .array(
      z.object({
        question: z.string().min(5),
        difficulty: z.string().min(3),
        answer: z.string().min(2),
        explanation: z.string().min(5),
      }),
    )
    .min(3),
});

const quizSchema = z.object({
  title: z.string().min(3),
  questions: z
    .array(
      z.object({
        question: z.string().min(5),
        options: z.array(z.string().min(1)).length(4),
        correct_answer: z.string().min(1),
        difficulty: z.enum(["easy", "medium", "hard"]),
        explanation: z.string().min(5),
      }),
    )
    .length(5),
});

const spellingSchema = z.object({
  easy: z
    .array(
      z.object({
        word: z.string().min(2),
        meaning: z.string().min(3),
        example_sentence: z.string().min(6),
      }),
    )
    .length(10),
  medium: z.array(z.any()).length(10),
  difficult: z.array(z.any()).length(10),
  exercise: z.string().min(8),
});

const adaptLearningSchema = z.object({
  decision: z.enum(["RETEACH", "PRACTICE", "ADVANCE"]),
  reason: z.string().min(8),
  next_action: z.string().min(8),
  recommended_content_type: z.string().min(3),
});

const financialSchema = z.object({
  explanation: z.string().min(20),
  real_life_scenario: z.string().min(10),
  practical_money_example: z.string().min(10),
  quiz_questions: z
    .array(
      z.object({
        question: z.string().min(4),
        options: z.array(z.string().min(1)).length(4),
        correct_answer: z.string().min(1),
        explanation: z.string().min(5),
      }),
    )
    .min(3),
});

const communicationSchema = z.object({
  explanation: z.string().min(20),
  example_conversation: z.string().min(20),
  practice_exercise: z.string().min(8),
  improvement_tips: z.array(z.string().min(4)).min(3),
});

const lenientContentSchema = z.record(z.unknown()).refine(
  (obj) => Object.keys(obj).length >= 2,
  { message: "AI response must contain at least 2 fields" },
);

function getSchema(taskType: EdvouraTaskType) {
  switch (taskType) {
    case "GENERATE_LESSON":
      return lessonSchema;
    case "IMPROVE_CONTENT":
    case "REGENERATE_CONTENT":
      return lenientContentSchema;
    case "GENERATE_QUIZ":
      return quizSchema;
    case "ADAPT_LEARNING":
      return adaptLearningSchema;
    case "GENERATE_SPELLING":
      return spellingSchema;
    case "GENERATE_FINANCIAL_LITERACY":
      return financialSchema;
    case "GENERATE_COMMUNICATION_SKILL":
      return communicationSchema;
  }
}

function joinTextParts(parts: Array<string | undefined>) {
  return parts.map((part) => part?.trim()).filter((part): part is string => Boolean(part)).join("\n\n");
}

function normalizeLessonPayload(parsed: unknown) {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return parsed;
  }

  const source = parsed as Record<string, unknown>;

  const hasDashboardLessonShape =
    typeof source.title === "string" &&
    typeof source.explanation === "string" &&
    Array.isArray(source.practice_questions);

  if (hasDashboardLessonShape) {
    return parsed;
  }

  const topic = typeof source.topic === "string" ? source.topic.trim() : "";
  const explanation = typeof source.explanation === "string" ? source.explanation.trim() : "";
  const objectives = Array.isArray(source.objectives)
    ? source.objectives.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
  const teacherNotes = typeof source.teacherNotes === "string" ? source.teacherNotes.trim() : "";
  const examples = Array.isArray(source.examples)
    ? source.examples
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const row = item as Record<string, unknown>;
          const context = typeof row.context === "string" ? row.context.trim() : "";
          const solution = typeof row.solution === "string" ? row.solution.trim() : "";
          return joinTextParts([context, solution ? `Solution: ${solution}` : ""]);
        })
        .filter((item): item is string => Boolean(item && item.length > 0))
    : [];
  const practiceQuestions = Array.isArray(source.practiceQuestions)
    ? source.practiceQuestions
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const row = item as Record<string, unknown>;
          const question = typeof row.question === "string" ? row.question.trim() : "";
          const answer = typeof row.answer === "string" ? row.answer.trim() : "";
          const difficultyRaw = typeof row.difficulty === "string" ? row.difficulty.trim().toLowerCase() : "";
          const difficulty =
            difficultyRaw === "easy" || difficultyRaw === "medium" || difficultyRaw === "hard"
              ? difficultyRaw
              : "medium";
          if (!question || !answer) {
            return null;
          }

          return {
            question,
            difficulty,
            answer,
            explanation: answer,
          };
        })
        .filter(
          (
            item,
          ): item is {
            question: string;
            difficulty: string;
            answer: string;
            explanation: string;
          } => Boolean(item),
        )
    : [];

  const legacySignalsPresent =
    Boolean(topic) ||
    objectives.length > 0 ||
    examples.length > 0 ||
    practiceQuestions.length > 0 ||
    Boolean(teacherNotes);

  if (!legacySignalsPresent) {
    return parsed;
  }

  return {
    title: typeof source.title === "string" && source.title.trim() ? source.title.trim() : topic || "Lesson Note",
    explanation,
    real_world_examples: examples,
    story_based_explanation: teacherNotes || explanation,
    key_points: objectives,
    practice_questions: practiceQuestions,
  };
}

function extractJsonPayload(text: string) {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const firstObject = cleaned.indexOf("{");
    const lastObject = cleaned.lastIndexOf("}");
    if (firstObject >= 0 && lastObject > firstObject) {
      return JSON.parse(cleaned.slice(firstObject, lastObject + 1));
    }
    throw new Error("AI did not return valid JSON.");
  }
}

export function parseAndValidateAIResponse(rawText: string, taskType: EdvouraTaskType) {
  const schema = getSchema(taskType);
  const parsed = extractJsonPayload(rawText);
  const normalized = taskType === "GENERATE_LESSON" ? normalizeLessonPayload(parsed) : parsed;
  return schema.parse(normalized);
}
