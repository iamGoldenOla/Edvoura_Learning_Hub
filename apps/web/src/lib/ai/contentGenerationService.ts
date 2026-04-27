import { parseAndValidateAIResponse } from "./aiContentValidator";
import {
  buildEdvouraPrompt,
  type EdvouraPromptInput,
  type EdvouraTaskType,
} from "./edvouraPromptBuilder";
import { DEFAULT_EDVOURA_AI_MODEL, generateWithPuterAI } from "./puterClient";
import {
  buildPreviousContentBlock,
  extractAntiRepetitionItems,
} from "./antiRepetitionService";
import { fetchPreviousItems, saveAiDraft } from "./aiContentRepository";

export type GenerateEdvouraInput = {
  userRole: "tutor" | "super_admin" | "admin";
  taskType: EdvouraTaskType;
  subject: string;
  topic: string;
  grade: string;
  skillType: string;
  extraInstruction?: string;
  existingContent?: string;
  score?: number;
  history?: string;
};

const allowedRoles = new Set(["tutor", "super_admin", "admin"]);

function validateRole(role: string) {
  if (!allowedRoles.has(role)) {
    throw new Error("Only tutors and super admins can generate AI content.");
  }
}

function stringifyForReading(content: unknown) {
  return JSON.stringify(content, null, 2);
}

export async function generateEdvouraContent(input: GenerateEdvouraInput) {
  validateRole(input.userRole);

  const previousItems = await fetchPreviousItems({
    subject: input.subject,
    topic: input.topic,
    grade: input.grade,
    skillType: input.skillType,
  });

  const promptInput: EdvouraPromptInput = {
    taskType: input.taskType,
    subject: input.subject,
    topic: input.topic,
    grade: input.grade,
    skillType: input.skillType,
    previousContent: buildPreviousContentBlock(previousItems),
    extraInstruction: input.extraInstruction,
    existingContent: input.existingContent,
    score: input.score,
    history: input.history,
  };

  const prompt = buildEdvouraPrompt(promptInput);
  const model = process.env.NEXT_PUBLIC_EDVOURA_AI_MODEL || DEFAULT_EDVOURA_AI_MODEL;

  let generatedText = "";
  try {
    const response = await generateWithPuterAI(prompt, { model });
    generatedText = response.text;
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error(
          "AI generation is temporarily unavailable. You can still create or edit this content manually.",
        );
  }

  let parsed: unknown;
  try {
    parsed = parseAndValidateAIResponse(generatedText, input.taskType);
  } catch {
    const repairPrompt = `${prompt}\n\nYour previous answer failed JSON validation. Return strict valid JSON only.`;
    const repairResponse = await generateWithPuterAI(repairPrompt, { model });
    parsed = parseAndValidateAIResponse(repairResponse.text, input.taskType);
  }

  const antiRepetitionItems = extractAntiRepetitionItems({
    taskType: input.taskType,
    subject: input.subject,
    topic: input.topic,
    grade: input.grade,
    skillType: input.skillType,
    content: parsed,
  });

  const titleCandidate =
    typeof parsed === "object" && parsed !== null && "title" in parsed
      ? String((parsed as { title?: string }).title ?? "").trim()
      : "";
  const title = titleCandidate || `${input.subject}: ${input.topic}`;

  const saved = await saveAiDraft({
    title,
    subject: input.subject,
    topic: input.topic,
    grade: input.grade,
    skillType: input.skillType,
    taskType: input.taskType,
    contentJson: parsed,
    contentText: stringifyForReading(parsed),
    modelUsed: model,
    previousContentHashes: antiRepetitionItems.map((item) => item.textHash),
    antiRepetitionItems,
  });

  return {
    contentId: saved.record.id,
    status: saved.record.status,
    content: parsed,
  };
}
