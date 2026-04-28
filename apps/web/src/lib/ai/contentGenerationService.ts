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
    case "GENERATE_LESSON_NOTE":
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
    case "GENERATE_LESSON_NOTE":
      return {
        title,
        lesson_summary: `${input.topic} introduces learners to the main idea in simple, memorable language.`,
        explanation: `${input.topic} is an important ${input.subject} topic for ${input.grade}. Learners should understand what it means, where it appears in everyday life, and how to explain it clearly using age-appropriate examples and guided practice.`,
        key_points: [
          `Define ${input.topic} clearly.`,
          `Identify where ${input.topic} appears in daily life.`,
          `Practice explaining ${input.topic} with confidence.`,
        ],
        worked_examples: [
          {
            title: "Worked Example 1",
            explanation: `Show one home or classroom example related to ${input.topic} and explain why it matches the lesson idea.`,
          },
          {
            title: "Worked Example 2",
            explanation: `Guide learners through a second example that uses a different situation but the same concept.`,
          },
        ],
        real_world_examples: [
          `${input.topic} can be connected to a simple home or classroom example that learners can observe directly.`,
          `${input.topic} can also be practiced through guided discussion, drawing, or a short hands-on classroom activity.`,
        ],
        practice_questions: [
          { question: `What is ${input.topic}?`, difficulty: "easy", answer_hint: `${input.topic} is a key concept in ${input.subject} that learners should be able to define in simple terms.` },
          { question: `Give one real-life example of ${input.topic}.`, difficulty: "easy", answer_hint: `An everyday situation where ${input.topic} applies, such as at home or school.` },
          { question: `How can a pupil practice ${input.topic}?`, difficulty: "medium", answer_hint: `Through guided exercises, classroom discussion, or hands-on activities related to ${input.topic}.` },
        ],
        learning_checks: [
          `Can the learner explain ${input.topic} in simple words?`,
          `Can the learner connect ${input.topic} to one daily-life example?`,
        ],
        instructional_materials: {
          youtube_videos: [
            {
              title: `${input.subject} ${input.topic} lesson`,
              search_query: `${input.subject} ${input.topic} lesson for ${input.grade}`,
              why_it_helps: "Helps the tutor find a short explainer or revision video.",
            },
          ],
          image_resources: [
            {
              title: `${input.topic} diagrams and pictures`,
              search_query: `${input.subject} ${input.topic} diagram for ${input.grade}`,
              why_it_helps: "Provides simple visual aids that support explanation and recall.",
            },
          ],
          classroom_materials: ["Whiteboard", "Exercise books", `${input.topic} visual aids`],
        },
      };
    case "GENERATE_LESSON_PLAN":
      return {
        title,
        lesson_objectives: [
          `Help learners define ${input.topic} clearly.`,
          `Help learners identify practical examples of ${input.topic}.`,
          `Help learners apply ${input.topic} in guided classroom tasks.`,
        ],
        prior_knowledge: `Learners should have a simple background idea related to ${input.topic}.`,
        teacher_preparation: `Review the topic, gather visual aids, and prepare simple examples suitable for ${input.grade}.`,
        instructional_materials: {
          youtube_videos: [
            {
              title: `${input.subject} ${input.topic} teacher explainer`,
              search_query: `${input.subject} ${input.topic} lesson for ${input.grade}`,
              why_it_helps: "Supports the tutor's own preparation before class.",
            },
          ],
          image_resources: [
            {
              title: `${input.topic} diagrams and pictures`,
              search_query: `${input.subject} ${input.topic} diagram for ${input.grade}`,
              why_it_helps: "Provides visual materials that make the lesson concrete and memorable.",
            },
          ],
          classroom_materials: ["Whiteboard", "Marker", "Flash cards", `${input.topic} teaching aids`],
        },
        lesson_stages: [
          {
            stage_title: "Introduction",
            duration_minutes: 5,
            teacher_activity: `Ask simple opening questions that connect ${input.topic} to learners' daily experience.`,
            student_activity: "Respond to opening questions and share prior ideas.",
            assessment_check: `Check whether learners can connect the topic to something familiar.`,
          },
          {
            stage_title: "Presentation",
            duration_minutes: 10,
            teacher_activity: `Explain ${input.topic} clearly using one or two concrete examples.`,
            student_activity: "Listen, observe, and answer guided questions.",
            assessment_check: `Ask learners to explain the idea in simple words.`,
          },
          {
            stage_title: "Guided Practice",
            duration_minutes: 10,
            teacher_activity: "Lead the class through a short worked example step by step.",
            student_activity: "Attempt guided examples with teacher support.",
            assessment_check: "Observe whether learners can follow the process correctly.",
          },
          {
            stage_title: "Independent Practice",
            duration_minutes: 10,
            teacher_activity: "Give a short class task and circulate to support struggling learners.",
            student_activity: "Attempt short independent or pair work tasks.",
            assessment_check: "Review answers and correct misconceptions before closing.",
          },
        ],
        evaluation_questions: [
          `What is ${input.topic}?`,
          `Give one example of ${input.topic}.`,
          `Why is ${input.topic} important?`,
        ],
        assignment: `Complete a short home activity about ${input.topic}.`,
        differentiation_strategies: [
          "Use simpler visual prompts for learners who need more support.",
          "Give stronger learners an extension question or explanation task.",
        ],
        teacher_notes: "Keep the lesson practical, visual, and discussion-based.",
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
        title,
        lesson_summary: `${input.topic} helps learners understand practical money habits in everyday life.`,
        explanation: `${input.topic} should be taught in simple, practical language so learners understand money decisions in real life.`,
        key_points: [
          `Explain ${input.topic} using age-appropriate money situations.`,
          "Show the value of planning and thoughtful choices.",
          "Connect money ideas to real life at home or school.",
        ],
        worked_examples: [
          {
            title: "Allowance Example",
            explanation: "A child receives pocket money and must decide how much to save and how much to spend wisely.",
          },
          {
            title: "Price Comparison Example",
            explanation: "A learner compares two prices and decides which option is more sensible.",
          },
        ],
        real_world_examples: [
          "A child is given a small allowance and must decide how much to save, spend, or share responsibly.",
          "A learner compares prices before buying a classroom item or snack.",
        ],
        practice_questions: [
          { question: `Why is saving useful?`, difficulty: "easy", answer_hint: "Saving helps set aside money for future needs and unexpected expenses." },
          { question: `What is a responsible money habit?`, difficulty: "medium", answer_hint: "Planning spending, comparing prices, and saving regularly are responsible money habits." },
          { question: `Why should learners compare prices?`, difficulty: "medium", answer_hint: "Comparing prices helps choose the best value and avoid overspending." },
        ],
        learning_checks: [
          "Can the learner explain why saving matters?",
          "Can the learner describe one responsible money habit?",
        ],
        instructional_materials: {
          youtube_videos: [
            {
              title: `Financial literacy for ${input.grade}`,
              search_query: `financial literacy ${input.topic} for ${input.grade}`,
              why_it_helps: "Provides relatable money examples and simple visual explanations.",
            },
          ],
          image_resources: [
            {
              title: "Money charts and price visuals",
              search_query: `money chart ${input.topic} for children`,
              why_it_helps: "Supports concrete teaching with coins, notes, and price comparison visuals.",
            },
          ],
          classroom_materials: ["Play money", "Price tags", "Chart paper"],
        },
      };
    case "GENERATE_COMMUNICATION_SKILL":
      return {
        title,
        lesson_summary: `${input.topic} helps learners express themselves clearly and respectfully.`,
        explanation: `${input.topic} should help learners speak clearly, listen actively, and respond with confidence.`,
        key_points: [
          "Speak clearly and at an appropriate pace.",
          "Listen carefully before responding.",
          "Use respectful and effective language.",
        ],
        worked_examples: [
          {
            title: "Role-play Example",
            explanation: "One learner explains an idea while another listens and responds politely.",
          },
          {
            title: "Class Discussion Example",
            explanation: "Learners practice taking turns, speaking clearly, and staying on topic.",
          },
        ],
        real_world_examples: [
          "Greeting a teacher or classmate clearly and respectfully.",
          "Explaining an idea during a class discussion without interrupting others.",
        ],
        practice_questions: [
          { question: `What makes communication clear?`, difficulty: "easy", answer_hint: "Clear communication means speaking at the right pace, using simple words, and staying on topic." },
          { question: `Why is listening important?`, difficulty: "easy", answer_hint: "Listening helps understand others, avoid misunderstandings, and respond thoughtfully." },
          { question: `How can a learner speak more confidently?`, difficulty: "medium", answer_hint: "Practice regularly, prepare what to say, and start with small group discussions." },
        ],
        learning_checks: [
          "Can the learner identify one strong communication habit?",
          "Can the learner role-play a short respectful conversation?",
        ],
        instructional_materials: {
          youtube_videos: [
            {
              title: `Communication skills for ${input.grade}`,
              search_query: `communication skills for children ${input.grade}`,
              why_it_helps: "Provides short visual demonstrations of good speaking and listening habits.",
            },
          ],
          image_resources: [
            {
              title: "Speaking and listening visuals",
              search_query: `speaking listening classroom poster for children`,
              why_it_helps: "Supports discussion with simple visual reminders and classroom posters.",
            },
          ],
          classroom_materials: ["Role-play cards", "Discussion prompts", "Poster paper"],
        },
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
