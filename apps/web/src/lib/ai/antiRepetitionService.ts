import type { EdvouraTaskType } from "./edvouraPromptBuilder";

export type AntiRepetitionItemDraft = {
  itemType: string;
  subject: string;
  topic: string;
  grade: string;
  skillType: string;
  originalText: string;
  textHash: string;
};

function stableHash(input: string) {
  let hash = 5381;
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) + hash) ^ input.charCodeAt(i);
  }
  return `h_${Math.abs(hash >>> 0).toString(16)}`;
}

export function buildPreviousContentBlock(items: string[]) {
  if (items.length === 0) return [];
  return items.slice(0, 40);
}

export function extractAntiRepetitionItems(params: {
  taskType: EdvouraTaskType;
  subject: string;
  topic: string;
  grade: string;
  skillType: string;
  content: unknown;
}) {
  const source = params.content as Record<string, unknown>;
  const collected: Array<{ itemType: string; text: string }> = [];

  if (Array.isArray(source.questions)) {
    for (const row of source.questions as Array<Record<string, unknown>>) {
      const text = String(row.question ?? row.questionText ?? "").trim();
      if (text) collected.push({ itemType: "quiz_question", text });
    }
  }

  if (Array.isArray(source.real_world_examples)) {
    for (const row of source.real_world_examples as string[]) {
      const text = String(row).trim();
      if (text) collected.push({ itemType: "lesson_example", text });
    }
  }

  if (Array.isArray(source.worked_examples)) {
    for (const row of source.worked_examples as Array<Record<string, unknown>>) {
      const text = String(row.title ?? row.explanation ?? "").trim();
      if (text) collected.push({ itemType: "worked_example", text });
    }
  }

  if (Array.isArray(source.practice_questions)) {
    for (const row of source.practice_questions as Array<Record<string, unknown>>) {
      const text = String(row.question ?? "").trim();
      if (text) collected.push({ itemType: "practice_question", text });
    }
  }

  if (Array.isArray(source.evaluation_questions)) {
    for (const row of source.evaluation_questions as string[]) {
      const text = String(row).trim();
      if (text) collected.push({ itemType: "evaluation_question", text });
    }
  }

  if (Array.isArray(source.lesson_objectives)) {
    for (const row of source.lesson_objectives as string[]) {
      const text = String(row).trim();
      if (text) collected.push({ itemType: "lesson_objective", text });
    }
  }

  if (source.instructional_materials && typeof source.instructional_materials === "object") {
    const materials = source.instructional_materials as Record<string, unknown>;
    const youtube = materials.youtube_videos;
    if (Array.isArray(youtube)) {
      for (const row of youtube as Array<Record<string, unknown>>) {
        const text = String(row.search_query ?? row.title ?? "").trim();
        if (text) collected.push({ itemType: "youtube_material", text });
      }
    }

    const images = materials.image_resources;
    if (Array.isArray(images)) {
      for (const row of images as Array<Record<string, unknown>>) {
        const text = String(row.search_query ?? row.title ?? "").trim();
        if (text) collected.push({ itemType: "image_material", text });
      }
    }

    const classroom = materials.classroom_materials;
    if (Array.isArray(classroom)) {
      for (const row of classroom as string[]) {
        const text = String(row).trim();
        if (text) collected.push({ itemType: "classroom_material", text });
      }
    }
  }

  const spellingBuckets = ["easy", "medium", "difficult"];
  for (const bucket of spellingBuckets) {
    const words = source[bucket];
    if (Array.isArray(words)) {
      for (const row of words as Array<Record<string, unknown>>) {
        const text = String(row.word ?? "").trim();
        if (text) collected.push({ itemType: "spelling_word", text });
      }
    }
  }

  return collected.map<AntiRepetitionItemDraft>((item) => ({
    itemType: item.itemType,
    subject: params.subject,
    topic: params.topic,
    grade: params.grade,
    skillType: params.skillType,
    originalText: item.text,
    textHash: stableHash(`${params.taskType}|${item.itemType}|${item.text.toLowerCase()}`),
  }));
}
