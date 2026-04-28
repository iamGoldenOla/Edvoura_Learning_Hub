import { z } from "zod";
import type { EdvouraTaskType } from "./edvouraPromptBuilder";

const difficultySchema = z.enum(["easy", "medium", "hard"]);

const resourceSchema = z.object({
  title: z.string().min(3),
  search_query: z.string().min(3),
  why_it_helps: z.string().min(8),
  url: z.string().url().optional(),
});

const instructionalMaterialsSchema = z.object({
  youtube_videos: z.array(resourceSchema).min(1),
  image_resources: z.array(resourceSchema).min(1),
  classroom_materials: z.array(z.string().min(3)).min(1),
});

const lessonNoteSchema = z.object({
  title: z.string().min(3),
  lesson_summary: z.string().min(30),
  explanation: z.string().min(80),
  key_points: z.array(z.string().min(3)).min(3),
  worked_examples: z.array(z.object({
    title: z.string().min(3),
    explanation: z.string().min(20),
  })).min(2),
  real_world_examples: z.array(z.string().min(4)).min(2),
  practice_questions: z.array(
    z.object({
      question: z.string().min(5),
      difficulty: difficultySchema,
    }),
  ).min(3),
  learning_checks: z.array(z.string().min(5)).min(2),
  instructional_materials: instructionalMaterialsSchema,
});

const lessonPlanSchema = z.object({
  title: z.string().min(3),
  lesson_objectives: z.array(z.string().min(8)).min(3),
  prior_knowledge: z.string().min(10),
  teacher_preparation: z.string().min(20),
  instructional_materials: instructionalMaterialsSchema,
  lesson_stages: z.array(
    z.object({
      stage_title: z.string().min(3),
      duration_minutes: z.number().int().min(1),
      teacher_activity: z.string().min(10),
      student_activity: z.string().min(10),
      assessment_check: z.string().min(8),
    }),
  ).min(4),
  evaluation_questions: z.array(z.string().min(5)).min(3),
  assignment: z.string().min(8),
  differentiation_strategies: z.array(z.string().min(5)).min(2),
  teacher_notes: z.string().min(10),
});

const quizSchema = z.object({
  title: z.string().min(3),
  questions: z
    .array(
      z.object({
        question: z.string().min(5),
        options: z.array(z.string().min(1)).length(4),
        correct_answer: z.string().min(1),
        difficulty: difficultySchema,
        explanation: z.string().min(5),
      }),
    )
    .length(5),
});

const spellingWordSchema = z.object({
  word: z.string().min(2),
  meaning: z.string().min(3),
  example_sentence: z.string().min(6),
});

const spellingSchema = z.object({
  easy: z.array(spellingWordSchema).length(10),
  medium: z.array(spellingWordSchema).length(10),
  difficult: z.array(spellingWordSchema).length(10),
  exercise: z.string().min(8),
});

const adaptLearningSchema = z.object({
  decision: z.enum(["RETEACH", "PRACTICE", "ADVANCE"]),
  reason: z.string().min(8),
  next_action: z.string().min(8),
  recommended_content_type: z.string().min(3),
});

const lenientContentSchema = z.record(z.unknown()).refine(
  (obj) => Object.keys(obj).length >= 2,
  { message: "AI response must contain at least 2 fields" },
);

function getSchema(taskType: EdvouraTaskType) {
  switch (taskType) {
    case "GENERATE_LESSON_NOTE":
    case "GENERATE_LESSON":
    case "GENERATE_FINANCIAL_LITERACY":
    case "GENERATE_COMMUNICATION_SKILL":
      return lessonNoteSchema;
    case "GENERATE_LESSON_PLAN":
      return lessonPlanSchema;
    case "GENERATE_QUIZ":
      return quizSchema;
    case "GENERATE_SPELLING":
      return spellingSchema;
    case "ADAPT_LEARNING":
      return adaptLearningSchema;
    case "IMPROVE_CONTENT":
    case "REGENERATE_CONTENT":
      return lenientContentSchema;
  }
}

function joinTextParts(parts: Array<string | undefined>) {
  return parts.map((part) => part?.trim()).filter((part): part is string => Boolean(part)).join("\n\n");
}

function buildYouTubeSearchUrl(query: string) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

function buildImageSearchUrl(query: string) {
  return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`;
}

function normalizeResourceArray(
  raw: unknown,
  kind: "youtube" | "image",
  fallbackTopic: string,
) {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => {
      if (typeof item === "string") {
        const searchQuery = item.trim() || fallbackTopic;
        return {
          title: searchQuery,
          search_query: searchQuery,
          why_it_helps: "Supports clearer visual understanding of the topic.",
          url: kind === "youtube" ? buildYouTubeSearchUrl(searchQuery) : buildImageSearchUrl(searchQuery),
        };
      }

      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const title = typeof row.title === "string" ? row.title.trim() : "";
      const searchQuery =
        typeof row.search_query === "string"
          ? row.search_query.trim()
          : typeof row.query === "string"
            ? row.query.trim()
            : title || fallbackTopic;
      const whyItHelps =
        typeof row.why_it_helps === "string"
          ? row.why_it_helps.trim()
          : typeof row.reason === "string"
            ? row.reason.trim()
            : "Supports clearer visual understanding of the topic.";
      const url = typeof row.url === "string" && row.url.trim()
        ? row.url.trim()
        : kind === "youtube"
          ? buildYouTubeSearchUrl(searchQuery)
          : buildImageSearchUrl(searchQuery);

      if (!title && !searchQuery) return null;
      return {
        title: title || searchQuery,
        search_query: searchQuery,
        why_it_helps: whyItHelps,
        url,
      };
    })
    .filter((item): item is { title: string; search_query: string; why_it_helps: string; url: string } => Boolean(item));
}

function buildDefaultInstructionalMaterials(topic: string, subject: string, grade: string) {
  return {
    youtube_videos: [
      {
        title: `${subject} ${topic} lesson for ${grade}`,
        search_query: `${subject} ${topic} lesson for ${grade}`,
        why_it_helps: "Helps the teacher find an age-appropriate explainer or demonstration video.",
        url: buildYouTubeSearchUrl(`${subject} ${topic} lesson for ${grade}`),
      },
    ],
    image_resources: [
      {
        title: `${topic} diagram or real-life picture`,
        search_query: `${subject} ${topic} diagram for ${grade}`,
        why_it_helps: "Helps the teacher find visual examples, diagrams, or labeled illustrations.",
        url: buildImageSearchUrl(`${subject} ${topic} diagram for ${grade}`),
      },
    ],
    classroom_materials: ["Whiteboard", "Exercise books", `${topic} teaching aids`],
  };
}

function normalizeInstructionalMaterials(
  raw: unknown,
  topic: string,
  subject: string,
  grade: string,
) {
  const defaults = buildDefaultInstructionalMaterials(topic, subject, grade);
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return defaults;
  }

  const source = raw as Record<string, unknown>;
  const youtubeVideos = normalizeResourceArray(source.youtube_videos, "youtube", `${subject} ${topic}`);
  const imageResources = normalizeResourceArray(source.image_resources, "image", `${subject} ${topic}`);
  const classroomMaterials = Array.isArray(source.classroom_materials)
    ? source.classroom_materials.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];

  return {
    youtube_videos: youtubeVideos.length > 0 ? youtubeVideos : defaults.youtube_videos,
    image_resources: imageResources.length > 0 ? imageResources : defaults.image_resources,
    classroom_materials: classroomMaterials.length > 0 ? classroomMaterials : defaults.classroom_materials,
  };
}

function normalizeLessonNotePayload(parsed: unknown) {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return parsed;
  }

  const source = parsed as Record<string, unknown>;
  const topic = typeof source.topic === "string" ? source.topic.trim() : "";
  const title = typeof source.title === "string" ? source.title.trim() : topic || "Lesson Note";
  const subject = typeof source.subject === "string" ? source.subject.trim() : "General Studies";
  const grade = typeof source.grade === "string" ? source.grade.trim() : "Grade Level";
  const explanation = typeof source.explanation === "string" ? source.explanation.trim() : "";
  const lessonSummary =
    typeof source.lesson_summary === "string"
      ? source.lesson_summary.trim()
      : explanation
        ? explanation.slice(0, 220)
        : "";
  const keyPoints = Array.isArray(source.key_points)
    ? source.key_points.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : Array.isArray(source.objectives)
      ? source.objectives.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      : [];
  const realWorldExamples = Array.isArray(source.real_world_examples)
    ? source.real_world_examples.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : Array.isArray(source.examples)
      ? source.examples
          .map((item) => {
            if (!item || typeof item !== "object") return null;
            const row = item as Record<string, unknown>;
            const context = typeof row.context === "string" ? row.context.trim() : "";
            const solution = typeof row.solution === "string" ? row.solution.trim() : "";
            return joinTextParts([context, solution ? `Teaching idea: ${solution}` : ""]);
          })
          .filter((item): item is string => Boolean(item))
      : [];
  const workedExamples = Array.isArray(source.worked_examples)
    ? source.worked_examples
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const row = item as Record<string, unknown>;
          const exampleTitle = typeof row.title === "string" ? row.title.trim() : "";
          const exampleExplanation = typeof row.explanation === "string" ? row.explanation.trim() : "";
          return exampleTitle && exampleExplanation ? { title: exampleTitle, explanation: exampleExplanation } : null;
        })
        .filter((item): item is { title: string; explanation: string } => Boolean(item))
    : Array.isArray(source.examples)
      ? source.examples
          .map((item, index) => {
            if (!item || typeof item !== "object") return null;
            const row = item as Record<string, unknown>;
            const context = typeof row.context === "string" ? row.context.trim() : "";
            const solution = typeof row.solution === "string" ? row.solution.trim() : "";
            return context || solution
              ? {
                  title: `Worked Example ${index + 1}`,
                  explanation: joinTextParts([context, solution ? `Model thinking: ${solution}` : ""]),
                }
              : null;
          })
          .filter((item): item is { title: string; explanation: string } => Boolean(item))
      : [];
  const practiceQuestions = Array.isArray(source.practice_questions)
    ? source.practice_questions
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const row = item as Record<string, unknown>;
          const question = typeof row.question === "string" ? row.question.trim() : "";
          const difficultyRaw = typeof row.difficulty === "string" ? row.difficulty.trim().toLowerCase() : "";
          const difficulty =
            difficultyRaw === "easy" || difficultyRaw === "medium" || difficultyRaw === "hard"
              ? difficultyRaw
              : "medium";
          return question ? { question, difficulty } : null;
        })
        .filter((item): item is { question: string; difficulty: "easy" | "medium" | "hard" } => Boolean(item))
    : Array.isArray(source.practiceQuestions)
      ? source.practiceQuestions
          .map((item) => {
            if (!item || typeof item !== "object") return null;
            const row = item as Record<string, unknown>;
            const question = typeof row.question === "string" ? row.question.trim() : "";
            const difficultyRaw = typeof row.difficulty === "string" ? row.difficulty.trim().toLowerCase() : "";
            const difficulty =
              difficultyRaw === "easy" || difficultyRaw === "medium" || difficultyRaw === "hard"
                ? difficultyRaw
                : "medium";
            return question ? { question, difficulty } : null;
          })
          .filter((item): item is { question: string; difficulty: "easy" | "medium" | "hard" } => Boolean(item))
      : [];
  const learningChecks = Array.isArray(source.learning_checks)
    ? source.learning_checks.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : practiceQuestions.slice(0, 3).map((item) => item.question);

  return {
    title,
    lesson_summary: lessonSummary || `${title} helps learners understand the core idea in simple language.`,
    explanation,
    key_points: keyPoints,
    worked_examples: workedExamples,
    real_world_examples: realWorldExamples,
    practice_questions: practiceQuestions,
    learning_checks: learningChecks,
    instructional_materials: normalizeInstructionalMaterials(
      source.instructional_materials,
      topic || title,
      subject,
      grade,
    ),
  };
}

function normalizeLessonPlanPayload(parsed: unknown) {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return parsed;
  }

  const source = parsed as Record<string, unknown>;
  const topic = typeof source.topic === "string" ? source.topic.trim() : "";
  const title = typeof source.title === "string" ? source.title.trim() : topic || "Lesson Plan";
  const subject = typeof source.subject === "string" ? source.subject.trim() : "General Studies";
  const grade = typeof source.grade === "string" ? source.grade.trim() : "Grade Level";
  const objectives = Array.isArray(source.lesson_objectives)
    ? source.lesson_objectives.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : Array.isArray(source.objectives)
      ? source.objectives.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      : [];
  const teacherNotes = typeof source.teacher_notes === "string"
    ? source.teacher_notes.trim()
    : typeof source.teacherNotes === "string"
      ? source.teacherNotes.trim()
      : "";
  const lessonStages = Array.isArray(source.lesson_stages)
    ? source.lesson_stages
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const row = item as Record<string, unknown>;
          const stageTitle = typeof row.stage_title === "string" ? row.stage_title.trim() : "";
          const teacherActivity = typeof row.teacher_activity === "string" ? row.teacher_activity.trim() : "";
          const studentActivity = typeof row.student_activity === "string" ? row.student_activity.trim() : "";
          const assessmentCheck = typeof row.assessment_check === "string" ? row.assessment_check.trim() : "";
          const duration = typeof row.duration_minutes === "number" ? row.duration_minutes : 0;
          return stageTitle && teacherActivity && studentActivity && assessmentCheck && duration > 0
            ? {
                stage_title: stageTitle,
                duration_minutes: duration,
                teacher_activity: teacherActivity,
                student_activity: studentActivity,
                assessment_check: assessmentCheck,
              }
            : null;
        })
        .filter(
          (
            item,
          ): item is {
            stage_title: string;
            duration_minutes: number;
            teacher_activity: string;
            student_activity: string;
            assessment_check: string;
          } => Boolean(item),
        )
    : Array.isArray(source.examples)
      ? [
          {
            stage_title: "Introduction",
            duration_minutes: 5,
            teacher_activity: `Introduce ${topic || title} using simple questions and prior knowledge.`,
            student_activity: `Listen, answer opening questions, and connect the topic to what they already know.`,
            assessment_check: `Ask pupils to state what they already know about ${topic || title}.`,
          },
          {
            stage_title: "Teacher Explanation",
            duration_minutes: 10,
            teacher_activity: explanationFromLegacy(source),
            student_activity: `Observe, respond to prompts, and take brief notes.`,
            assessment_check: `Ask pupils to restate the main idea in their own words.`,
          },
          {
            stage_title: "Guided Practice",
            duration_minutes: 10,
            teacher_activity: `Guide pupils through the worked examples step by step.`,
            student_activity: `Attempt short guided tasks with teacher support.`,
            assessment_check: `Watch whether pupils can complete the guided examples correctly.`,
          },
          {
            stage_title: "Independent Practice",
            duration_minutes: 10,
            teacher_activity: `Assign short independent practice questions and support struggling learners.`,
            student_activity: `Complete practice questions independently or in pairs.`,
            assessment_check: `Review responses and correct misunderstandings immediately.`,
          },
        ]
      : [];

  return {
    title,
    lesson_objectives: objectives,
    prior_knowledge:
      (typeof source.prior_knowledge === "string" && source.prior_knowledge.trim()) ||
      `Learners should have a simple background understanding related to ${topic || title}.`,
    teacher_preparation:
      (typeof source.teacher_preparation === "string" && source.teacher_preparation.trim()) ||
      `Review the topic, prepare concrete examples, and gather age-appropriate visual and classroom materials.`,
    instructional_materials: normalizeInstructionalMaterials(
      source.instructional_materials,
      topic || title,
      subject,
      grade,
    ),
    lesson_stages: lessonStages,
    evaluation_questions: Array.isArray(source.evaluation_questions)
      ? source.evaluation_questions.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      : extractEvaluationQuestionsFromLegacy(source),
    assignment:
      (typeof source.assignment === "string" && source.assignment.trim()) ||
      `Complete a short follow-up task on ${topic || title} at home.`,
    differentiation_strategies: Array.isArray(source.differentiation_strategies)
      ? source.differentiation_strategies.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      : [
          "Support slower learners with visual prompts and guided examples.",
          "Stretch stronger learners with an extra challenge question.",
        ],
    teacher_notes: teacherNotes || `Use a warm tone, concrete examples, and frequent checking for understanding.`,
  };
}

function explanationFromLegacy(source: Record<string, unknown>) {
  return typeof source.explanation === "string" && source.explanation.trim()
    ? source.explanation.trim()
    : "Explain the topic clearly with simple examples and guided questioning.";
}

function extractEvaluationQuestionsFromLegacy(source: Record<string, unknown>) {
  const practiceQuestions = Array.isArray(source.practice_questions)
    ? source.practice_questions
    : Array.isArray(source.practiceQuestions)
      ? source.practiceQuestions
      : [];

  return practiceQuestions
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      return typeof row.question === "string" && row.question.trim() ? row.question.trim() : null;
    })
    .filter((item): item is string => Boolean(item));
}

function normalizeQuizPayload(parsed: unknown) {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return parsed;
  }

  const source = parsed as Record<string, unknown>;
  if (!Array.isArray(source.questions)) {
    return parsed;
  }

  return {
    title: typeof source.title === "string" ? source.title : "Quiz",
    questions: (source.questions as Array<Record<string, unknown>>)
      .map((item) => {
        const question = typeof item.question === "string" ? item.question.trim() : typeof item.questionText === "string" ? item.questionText.trim() : "";
        const options = Array.isArray(item.options)
          ? item.options.filter((option): option is string => typeof option === "string")
          : [];
        const correctAnswer = typeof item.correct_answer === "string"
          ? item.correct_answer.trim()
          : typeof item.correctAnswer === "string"
            ? item.correctAnswer.trim()
            : "";
        const difficultyRaw = typeof item.difficulty === "string" ? item.difficulty.trim().toLowerCase() : "medium";
        const difficulty =
          difficultyRaw === "easy" || difficultyRaw === "medium" || difficultyRaw === "hard"
            ? difficultyRaw
            : "medium";
        const explanation = typeof item.explanation === "string" ? item.explanation.trim() : "";
        return question && options.length === 4 && correctAnswer && explanation
          ? { question, options, correct_answer: correctAnswer, difficulty, explanation }
          : null;
      })
      .filter(
        (
          item,
        ): item is {
          question: string;
          options: string[];
          correct_answer: string;
          difficulty: "easy" | "medium" | "hard";
          explanation: string;
        } => Boolean(item),
      )
      .slice(0, 5),
  };
}

function normalizeSpellingPayload(parsed: unknown) {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return parsed;
  }

  const source = parsed as Record<string, unknown>;
  if (Array.isArray(source.easy) && Array.isArray(source.medium) && Array.isArray(source.difficult)) {
    return parsed;
  }

  if (!Array.isArray(source.words)) {
    return parsed;
  }

  const buckets = {
    easy: [] as Array<z.infer<typeof spellingWordSchema>>,
    medium: [] as Array<z.infer<typeof spellingWordSchema>>,
    difficult: [] as Array<z.infer<typeof spellingWordSchema>>,
  };

  for (const item of source.words as Array<Record<string, unknown>>) {
    const word = typeof item.word === "string" ? item.word.trim() : "";
    const meaning = typeof item.definition === "string"
      ? item.definition.trim()
      : typeof item.meaning === "string"
        ? item.meaning.trim()
        : "";
    const exampleSentence = typeof item.exampleSentence === "string"
      ? item.exampleSentence.trim()
      : typeof item.example_sentence === "string"
        ? item.example_sentence.trim()
        : "";
    const difficulty = typeof item.difficulty === "string" ? item.difficulty.trim().toLowerCase() : "medium";
    if (!word || !meaning || !exampleSentence) continue;
    const normalized = { word, meaning, example_sentence: exampleSentence };
    if (difficulty === "easy" && buckets.easy.length < 10) buckets.easy.push(normalized);
    else if (difficulty === "hard" && buckets.difficult.length < 10) buckets.difficult.push(normalized);
    else if (buckets.medium.length < 10) buckets.medium.push(normalized);
  }

  return {
    easy: buckets.easy,
    medium: buckets.medium,
    difficult: buckets.difficult,
    exercise:
      (typeof source.instructions === "string" && source.instructions.trim()) ||
      (typeof source.exercise === "string" && source.exercise.trim()) ||
      "Spell the words, define them, and use them in sentences.",
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
  const normalized =
    taskType === "GENERATE_LESSON_NOTE" ||
    taskType === "GENERATE_LESSON" ||
    taskType === "GENERATE_FINANCIAL_LITERACY" ||
    taskType === "GENERATE_COMMUNICATION_SKILL"
      ? normalizeLessonNotePayload(parsed)
      : taskType === "GENERATE_LESSON_PLAN"
        ? normalizeLessonPlanPayload(parsed)
        : taskType === "GENERATE_QUIZ"
          ? normalizeQuizPayload(parsed)
          : taskType === "GENERATE_SPELLING"
            ? normalizeSpellingPayload(parsed)
            : parsed;

  return schema.parse(normalized);
}
