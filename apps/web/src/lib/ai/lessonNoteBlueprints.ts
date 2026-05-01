import blueprints from "./lesson-note-blueprints.json";

type SubjectBlueprint = {
  display_name?: string;
  must_cover?: string[];
  resource_search_terms?: string[];
  topic_overrides?: Record<
    string,
    {
      hook?: string;
      summary?: string;
      explanation_paragraphs?: string[];
      types_or_categories?: string[];
      importance_points?: string[];
      must_cover?: string[];
      worked_examples?: string[];
      real_world_examples?: string[];
      misconceptions?: string[];
    }
  >;
};

type BlueprintRoot = {
  default: {
    lesson_flow: string[];
    explanation_requirements: string[];
    practice_question_angles: string[];
  };
  subjects: Record<string, SubjectBlueprint>;
};

const lessonBlueprints = blueprints as BlueprintRoot;

const SUBJECT_ALIAS_MAP: Record<string, string> = {
  english: "English Language",
  "english language": "English Language",
  maths: "Mathematics",
  math: "Mathematics",
  mathematics: "Mathematics",
  "basic science": "Basic Science",
  "social studies": "Social Studies",
  "civic education": "Civic Education",
  "computer studies": "Computer Studies",
  agriculture: "Agricultural Science",
  agric: "Agricultural Science",
  "agricultural science": "Agricultural Science",
  spelling: "Spelling",
};

function normalizeKey(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function normalizeSubjectName(subject: string) {
  const trimmed = subject.trim();
  if (!trimmed) return "General Studies";
  return SUBJECT_ALIAS_MAP[normalizeKey(trimmed)] ?? trimmed;
}

export function getLessonNoteBlueprint(subject: string, topic: string) {
  const normalizedSubject = normalizeSubjectName(subject);
  const subjectBlueprint =
    lessonBlueprints.subjects[normalizedSubject] ??
    lessonBlueprints.subjects[subject] ??
    null;
  const topicKey = normalizeKey(topic);
  const topicBlueprint = subjectBlueprint?.topic_overrides?.[topicKey] ?? null;

  return {
    normalizedSubject,
    defaultBlueprint: lessonBlueprints.default,
    subjectBlueprint,
    topicBlueprint,
  };
}

export function buildLessonNoteBlueprintBlock(subject: string, topic: string, grade: string) {
  const { normalizedSubject, defaultBlueprint, subjectBlueprint, topicBlueprint } =
    getLessonNoteBlueprint(subject, topic);

  const lines = [
    `LESSON NOTE BLUEPRINT`,
    `Use the canonical Edvoura lesson-note blueprint for ${normalizedSubject} at ${grade}.`,
    `Write the actual lesson note the student should read, not teaching advice about how to present the lesson.`,
    "",
    "Default lesson flow:",
    ...defaultBlueprint.lesson_flow.map((item) => `- ${item}`),
    "",
    "Explanation requirements:",
    ...defaultBlueprint.explanation_requirements.map((item) => `- ${item}`),
  ];

  if (subjectBlueprint?.must_cover?.length) {
    lines.push("", `For ${normalizedSubject}, the lesson note must cover:`);
    lines.push(...subjectBlueprint.must_cover.map((item) => `- ${item}`));
  }

  if (topicBlueprint?.hook) {
    lines.push("", `Topic hook to build from:`, `- ${topicBlueprint.hook}`);
  }

  if (topicBlueprint?.must_cover?.length) {
    lines.push("", `For the topic "${topic}", the lesson note must explicitly cover:`);
    lines.push(...topicBlueprint.must_cover.map((item) => `- ${item}`));
  }

  if (topicBlueprint?.worked_examples?.length) {
    lines.push("", "Worked examples should include these angles:");
    lines.push(...topicBlueprint.worked_examples.map((item) => `- ${item}`));
  }

  if (topicBlueprint?.real_world_examples?.length) {
    lines.push("", "Real-world examples should draw from:");
    lines.push(...topicBlueprint.real_world_examples.map((item) => `- ${item}`));
  }

  if (topicBlueprint?.misconceptions?.length) {
    lines.push("", "Address these misconceptions directly:");
    lines.push(...topicBlueprint.misconceptions.map((item) => `- ${item}`));
  }

  if (subjectBlueprint?.resource_search_terms?.length) {
    lines.push("", "Instructional materials should lean toward these search patterns:");
    lines.push(...subjectBlueprint.resource_search_terms.map((item) => `- ${item}`));
  }

  lines.push(
    "",
    "Practice questions should include these angles:",
    ...defaultBlueprint.practice_question_angles.map((item) => `- ${item}`),
  );

  return lines.join("\n");
}
