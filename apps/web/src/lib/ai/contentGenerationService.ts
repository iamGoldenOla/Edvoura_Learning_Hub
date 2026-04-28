import { parseAndValidateAIResponse } from "./aiContentValidator";
import {
  buildEdvouraPrompt,
  buildOutputContract,
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

function getValidationMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown validation failure";
}

function buildRepairPrompt(basePrompt: string, taskType: EdvouraTaskType, error: unknown) {
  return `${basePrompt}

Your previous answer failed JSON validation.
Validation error:
${getValidationMessage(error)}

Return strict valid JSON only.
Match this schema exactly:
${buildOutputContract(taskType)}

Do not return explanations about the error.
Do not return an array of validation issues.
Do not include commentary.`;
}

function getServerFallbackContentType(taskType: EdvouraTaskType) {
  switch (taskType) {
    case "GENERATE_LESSON":
      return "lesson_note";
    case "GENERATE_QUIZ":
      return "quiz";
    case "GENERATE_SPELLING":
      return "spelling_bee";
    default:
      return null;
  }
}

function buildEmergencyCanonicalContent(input: GenerateEdvouraInput) {
  const title = `${input.subject}: ${input.topic}`;

  switch (input.taskType) {
    case "GENERATE_LESSON":
      return {
        title,
        explanation: `${input.topic} is an important ${input.subject} topic for ${input.grade}. Learners should understand what it means, where it appears in everyday life, and how to explain it clearly using age-appropriate examples and guided practice.`,
        real_world_examples: [
          `${input.topic} can be connected to a simple home or classroom example that learners can observe directly.`,
          `${input.topic} can also be practiced through guided discussion, drawing, or a short hands-on classroom activity.`,
        ],
        story_based_explanation: `A tutor can introduce ${input.topic} through a short classroom story, then guide learners into independent practice with feedback.`,
        key_points: [
          `Define ${input.topic} clearly.`,
          `Identify where ${input.topic} appears in daily life.`,
          `Practice explaining ${input.topic} with confidence.`,
        ],
        practice_questions: [
          { question: `What is ${input.topic}?`, difficulty: "easy", answer: `${input.topic} is a key concept in ${input.subject}.`, explanation: `Start by defining ${input.topic} in simple language.` },
          { question: `Give one real-life example of ${input.topic}.`, difficulty: "easy", answer: `Use a classroom or home example linked to ${input.topic}.`, explanation: `A real-life example shows practical understanding.` },
          { question: `How can a pupil practice ${input.topic}?`, difficulty: "medium", answer: `Through guided classwork, discussion, and short exercises.`, explanation: `Practice helps the learner remember and apply the idea.` },
        ],
      };
    case "GENERATE_QUIZ":
      return {
        title,
        questions: [
          { question: `What is ${input.topic}?`, options: ["A correct idea", "A random guess", "An unrelated topic", "A wrong answer"], correct_answer: "A correct idea", difficulty: "easy", explanation: `This checks whether the learner recognizes the basic idea behind ${input.topic}.` },
          { question: `Which option best matches ${input.topic} in ${input.subject}?`, options: ["A suitable answer", "An impossible answer", "A repeated error", "An unrelated answer"], correct_answer: "A suitable answer", difficulty: "easy", explanation: `The correct option should align directly with the topic.` },
          { question: `Why is ${input.topic} important?`, options: ["It supports understanding", "It should be ignored", "It removes learning", "It has no purpose"], correct_answer: "It supports understanding", difficulty: "medium", explanation: `${input.topic} matters because it supports understanding and application.` },
          { question: `What should a learner do when practicing ${input.topic}?`, options: ["Explain each step", "Skip the work", "Memorize without thinking", "Avoid correction"], correct_answer: "Explain each step", difficulty: "medium", explanation: `Explaining steps improves understanding.` },
          { question: `Which habit improves mastery of ${input.topic}?`, options: ["Steady practice", "Ignoring feedback", "Rushing carelessly", "Avoiding examples"], correct_answer: "Steady practice", difficulty: "hard", explanation: `Steady practice with feedback supports mastery.` },
        ],
      };
    case "GENERATE_SPELLING":
      return {
        easy: Array.from({ length: 10 }, (_, index) => ({
          word: `easyword${index + 1}`,
          meaning: `A simple ${input.grade.toLowerCase()} spelling word linked to ${input.topic}.`,
          example_sentence: `The tutor used easyword${index + 1} during the ${input.topic} lesson.`,
        })),
        medium: Array.from({ length: 10 }, (_, index) => ({
          word: `mediumword${index + 1}`,
          meaning: `A medium-level spelling word linked to ${input.topic}.`,
          example_sentence: `The class practiced mediumword${index + 1} during revision.`,
        })),
        difficult: Array.from({ length: 10 }, (_, index) => ({
          word: `difficultword${index + 1}`,
          meaning: `A difficult spelling word linked to ${input.topic}.`,
          example_sentence: `The tutor challenged the class with difficultword${index + 1}.`,
        })),
        exercise: `Spell the words aloud, define them, and use each one in a short sentence connected to ${input.topic}.`,
      };
    case "GENERATE_FINANCIAL_LITERACY":
      return {
        explanation: `${input.topic} should be taught in simple, practical language so learners understand money decisions in real life.`,
        real_life_scenario: `A child is given a small allowance and must decide how much to save, spend, or share responsibly.`,
        practical_money_example: `If a learner has 500 naira, they can compare saving part of it with spending all of it at once.`,
        quiz_questions: [
          { question: `Why is saving useful?`, options: ["It helps future needs", "It wastes money", "It stops learning", "It has no benefit"], correct_answer: "It helps future needs", explanation: `Saving helps learners prepare for future needs.` },
          { question: `What is a responsible money habit?`, options: ["Planning spending", "Buying everything at once", "Ignoring needs", "Forgetting prices"], correct_answer: "Planning spending", explanation: `Planning spending is a responsible money habit.` },
          { question: `Why should learners compare prices?`, options: ["To make better choices", "To waste time", "To avoid thinking", "To spend carelessly"], correct_answer: "To make better choices", explanation: `Comparing prices supports better money decisions.` },
        ],
      };
    case "GENERATE_COMMUNICATION_SKILL":
      return {
        explanation: `${input.topic} should help learners speak clearly, listen actively, and respond with confidence.`,
        example_conversation: `Tutor: Can you explain your idea clearly?\nStudent: Yes, I will speak slowly, use simple words, and listen before responding.`,
        practice_exercise: `Ask learners to role-play a short conversation based on ${input.topic} and then reflect on what made the message clear.`,
        improvement_tips: [
          "Speak clearly and at a calm pace.",
          "Listen before responding.",
          "Use simple, respectful language.",
        ],
      };
    case "ADAPT_LEARNING":
      return {
        decision: (input.score ?? 0) < 40 ? "RETEACH" : (input.score ?? 0) <= 70 ? "PRACTICE" : "ADVANCE",
        reason: `This recommendation is based on the learner's score and recent performance pattern.`,
        next_action: `Use a focused follow-up activity on ${input.topic}.`,
        recommended_content_type: "lesson_note",
      };
    default:
      return null;
  }
}

async function generateViaServerFallback(input: GenerateEdvouraInput) {
  const contentType = getServerFallbackContentType(input.taskType);
  if (!contentType) {
    return null;
  }

  const response = await fetch("/api/ai/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contentType,
      topic: input.topic,
      subject: input.subject,
      gradeLevel: input.grade,
      curriculumSystem: "WAEC",
      studentContext: input.extraInstruction,
      skipSave: true,
    }),
  });

  const data = (await response.json().catch(() => ({}))) as {
    content?: unknown;
    error?: string;
    detail?: string;
  };

  if (!response.ok || !data.content) {
    throw new Error(data.detail || data.error || "Server AI fallback failed.");
  }

  return parseAndValidateAIResponse(JSON.stringify(data.content), input.taskType);
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
  let providerUsed = "puter";
  let modelUsed = model;

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
  } catch (error) {
    const repairPrompt = buildRepairPrompt(prompt, input.taskType, error);
    try {
      const repairResponse = await generateWithPuterAI(repairPrompt, { model });
      parsed = parseAndValidateAIResponse(repairResponse.text, input.taskType);
    } catch (repairError) {
      try {
        const fallbackResult = await generateViaServerFallback(input);
        if (fallbackResult) {
          parsed = fallbackResult;
          providerUsed = "server_fallback";
          modelUsed = "legacy_orchestrator";
        } else {
          const emergency = buildEmergencyCanonicalContent(input);
          if (!emergency) {
            throw (repairError instanceof Error ? repairError : error);
          }
          parsed = emergency;
          providerUsed = "emergency_template";
          modelUsed = "dashboard_template";
        }
      } catch (fallbackError) {
        const emergency = buildEmergencyCanonicalContent(input);
        if (!emergency) {
          throw (fallbackError instanceof Error ? fallbackError : repairError);
        }
        parsed = emergency;
        providerUsed = "emergency_template";
        modelUsed = "dashboard_template";
      }
    }
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
    modelUsed,
    aiProvider: providerUsed,
    previousContentHashes: antiRepetitionItems.map((item) => item.textHash),
    antiRepetitionItems,
  });

  return {
    contentId: saved.record.id,
    status: saved.record.status,
    content: parsed,
  };
}
