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

  if (Array.isArray(source.practice_questions)) {
    for (const row of source.practice_questions as Array<Record<string, unknown>>) {
      const text = String(row.question ?? "").trim();
      if (text) collected.push({ itemType: "practice_question", text });
    }
  }

  if (typeof source.story_based_explanation === "string" && source.story_based_explanation.trim()) {
    collected.push({
      itemType: "story_example",
      text: source.story_based_explanation.trim(),
    });
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
