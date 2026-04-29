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
import { getLessonNoteBlueprint, normalizeSubjectName } from "./lessonNoteBlueprints";
import { buildLocalLessonNote, buildLocalLessonPlan } from "./localLessonComposer";

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

function isWeakLessonNote(content: unknown) {
  if (!content || typeof content !== "object" || Array.isArray(content)) {
    return true;
  }

  const payload = content as Record<string, unknown>;
  const explanation =
    typeof payload.explanation === "string" ? payload.explanation.trim() : "";
  const summary =
    typeof payload.lesson_summary === "string" ? payload.lesson_summary.trim() : "";
  const keyPoints = Array.isArray(payload.key_points)
    ? payload.key_points.filter((item): item is string => typeof item === "string")
    : [];
  const examples = Array.isArray(payload.real_world_examples)
    ? payload.real_world_examples.filter((item): item is string => typeof item === "string")
    : [];
  const workedExamples = Array.isArray(payload.worked_examples)
    ? payload.worked_examples
    : [];
  const learningChecks = Array.isArray(payload.learning_checks)
    ? payload.learning_checks.filter((item): item is string => typeof item === "string")
    : [];

  const genericPatterns = [
    /is a key topic in/i,
    /students in .* should understand what it means/i,
    /daily-life scenario connected to/i,
    /classroom activity that reinforces/i,
    /break the task into smaller steps/i,
    /guided practice/i,
    /model thinking/i,
    /begin by telling the learner/i,
    /help learners build real understanding/i,
    /if the lesson is practical/i,
    /if the lesson is more descriptive/i,
  ];

  const hasGenericExplanation = genericPatterns.some((pattern) => pattern.test(explanation));
  const hasGenericSummary = genericPatterns.some((pattern) => pattern.test(summary));
  const hasGenericKeyPoints = keyPoints.some((point) =>
    /define .* clearly|identify .* uses|apply .* to guided/i.test(point),
  );
  const hasGenericExamples = examples.some((example) =>
    genericPatterns.some((pattern) => pattern.test(example)),
  );

  return (
    explanation.length < 280 ||
    summary.length < 80 ||
    keyPoints.length < 4 ||
    workedExamples.length < 2 ||
    learningChecks.length < 3 ||
    hasGenericExplanation ||
    hasGenericSummary ||
    hasGenericKeyPoints ||
    hasGenericExamples
  );
}

function buildEmergencyCanonicalContent(input: GenerateEdvouraInput) {
  const normalizedSubject = normalizeSubjectName(input.subject);
  const title = `${normalizedSubject}: ${input.topic}`;
  const { topicBlueprint } = getLessonNoteBlueprint(normalizedSubject, input.topic);

  switch (input.taskType) {
    case "GENERATE_LESSON":
    case "GENERATE_LESSON_NOTE":
      return {
        title,
        lesson_summary:
          topicBlueprint?.hook
            ? `${topicBlueprint.hook} In this lesson, learners will understand what ${input.topic} means, where it appears in real life, and why it is important.`
            : `${input.topic} helps learners understand the meaning of the topic, its main features, and why it matters in everyday life.`,
        explanation:
          topicBlueprint && normalizedSubject === "Basic Science" && input.topic.trim().toLowerCase() === "air"
            ? `Air is the invisible substance all around us. We cannot see air, but it is everywhere. We feel it when the wind blows on our faces, when a fan cools us, and when we breathe in and out. Air does not have a colour, but it is real. One way we know air is real is that it occupies space. When we blow air into a balloon, the balloon becomes bigger. That shows that air enters the balloon and fills it. Another way we know air is present is when the leaves of trees move outside. Moving air is called wind.\n\nAir is very important to living things. Human beings and animals need air to breathe and stay alive. Plants also need air to grow well. Without air, people, animals, and plants would not survive. Air also helps in many daily activities. It helps fires burn, it fills tyres, it helps kites fly, and it dries clothes spread outside in the sun and wind.\n\nWe should remember that air is not 'nothing'. Even though we cannot see it, we can feel its effects and observe what it does. If you wave a book close to your face, you will feel moving air. If you blow into an empty nylon bag, it expands because air has entered it. So, air is useful, real, and necessary for life.`
            : topicBlueprint && normalizedSubject === "English Language" && input.topic.trim().toLowerCase() === "parts of speech"
              ? `Parts of speech are the different jobs that words do in a sentence. Just as people in a school have different duties, words also have different duties when we speak or write. Some words name people, places, animals, or things. Some words show actions. Some words describe, while others join words or show feeling.\n\nIn English Language, the main parts of speech include nouns, pronouns, verbs, adjectives, adverbs, prepositions, conjunctions, and interjections. A noun is a naming word, such as boy, school, or mango. A pronoun takes the place of a noun, such as he, she, or they. A verb shows action or state of being, such as run, eat, is, or are. An adjective describes a noun, such as tall boy or red bag. An adverb describes how an action happens, such as quickly or softly.\n\nPrepositions show position or relationship, such as in, on, under, and beside. Conjunctions join words or sentences, such as and, but, and because. Interjections show sudden feelings, such as wow!, oh!, or hurray!\n\nParts of speech are important because they help us speak and write correctly. When we understand the job a word is doing, it becomes easier to form good sentences, read with understanding, and express our ideas clearly.`
              : `${input.topic} is an important topic in ${normalizedSubject}. ${topicBlueprint?.hook ?? ""} Learners should first understand its meaning in simple language. After that, they should know the main features or parts connected to the topic. They should also understand why the topic is important and where it appears in everyday life. Good lesson notes should not speak about how a teacher will teach; they should clearly teach the learner the actual idea, give concrete examples, and help the learner explain the topic in their own words.`,
        key_points: [
          ...(topicBlueprint?.must_cover?.slice(0, 4).map((item) => `${item.charAt(0).toUpperCase()}${item.slice(1)}.`) ?? [
            `${input.topic} should be explained in simple language that a learner in ${input.grade} can understand.`,
            `Learners should know the meaning of ${input.topic}, its main features, and why it is important.`,
            `The lesson should connect ${input.topic} to everyday life in school, at home, or in the community.`,
            `Learners should practise talking about ${input.topic} using correct examples and short written answers.`,
          ]),
        ],
        worked_examples: [
          {
            title: "Worked Example 1",
            explanation:
              topicBlueprint?.worked_examples?.[0]
                ? `${topicBlueprint.worked_examples[0]} Explain it step by step in simple language so the learner can follow the reasoning clearly.`
                : `Use one clear example to show the meaning of ${input.topic} and explain why it fits the lesson.`,
          },
          {
            title: "Worked Example 2",
            explanation:
              topicBlueprint?.worked_examples?.[1]
                ? `${topicBlueprint.worked_examples[1]} Explain it step by step in simple language so the learner can connect it to real life.`
                : `Use a second real-life example so learners can connect ${input.topic} to home, school, or community life.`,
          },
        ],
        real_world_examples:
          topicBlueprint?.real_world_examples?.map((item) => `Real-life example: ${item}.`) ?? [
            `A learner should be able to spot ${input.topic} in a familiar place such as the classroom, home, school compound, market, or road depending on the lesson topic.`,
            `A teacher can also use a short demonstration, picture, object, or story so that learners see that ${input.topic} is part of the real world and not just a textbook idea.`,
          ],
        practice_questions: [
          {
            question: `Define ${input.topic} in your own words.`,
            difficulty: "easy",
            answer_hint: `A good answer should explain the meaning of ${input.topic} simply and correctly.`,
          },
          {
            question: `Give one example that shows ${input.topic} in real life.`,
            difficulty: "easy",
            answer_hint: `Choose a home, school, or community example that clearly matches the lesson idea.`,
          },
          {
            question: `State two important facts every learner should remember about ${input.topic}.`,
            difficulty: "medium",
            answer_hint: `Think about the definition, features, uses, or importance of the topic.`,
          },
          {
            question: `Why is ${input.topic} important in ${input.subject}?`,
            difficulty: "medium",
            answer_hint: `Explain how the topic helps the learner understand the world, solve problems, or describe real situations.`,
          },
        ],
        learning_checks: [
          `Can the learner define ${input.topic} correctly without copying the teacher word for word?`,
          `Can the learner give at least one correct everyday example of ${input.topic}?`,
          `Can the learner explain why ${input.topic} matters in simple language?`,
        ],
        instructional_materials: {
          youtube_videos: [
            {
              title: `${input.topic} explained for ${input.grade}`,
              search_query: `${normalizedSubject} ${input.topic} lesson for ${input.grade}`,
              why_it_helps: "Helps the learner hear and see the topic explained with visuals, examples, and simple language.",
            },
            {
              title: `${input.topic} for children`,
              search_query: `${input.topic} for children ${input.grade}`,
              why_it_helps: "Provides a second child-friendly explanation using visuals and concrete examples.",
            },
          ],
          image_resources: [
            {
              title: `${input.topic} diagrams and real-life pictures`,
              search_query: `${normalizedSubject} ${input.topic} diagram for ${input.grade}`,
              why_it_helps: "Gives the learner diagrams, labelled pictures, or concrete visuals that make the topic easier to understand and remember.",
            },
            {
              title: `${input.topic} labelled pictures`,
              search_query: `${input.topic} labelled pictures for children`,
              why_it_helps: "Supports visual recall with clear labelled images suited to primary learners.",
            },
          ],
          classroom_materials: [
            "Whiteboard and markers",
            "Student exercise books",
            `${input.topic} charts, pictures, or concrete teaching aids`,
          ],
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

function shouldQualityCheckLesson(taskType: EdvouraTaskType) {
  return [
    "GENERATE_LESSON",
    "GENERATE_LESSON_NOTE",
    "GENERATE_FINANCIAL_LITERACY",
    "GENERATE_COMMUNICATION_SKILL",
  ].includes(taskType);
}

function shouldUseLocalBlueprintEngine(taskType: EdvouraTaskType) {
  return ["GENERATE_LESSON", "GENERATE_LESSON_NOTE", "GENERATE_LESSON_PLAN"].includes(taskType);
}

export async function generateEdvouraContent(input: GenerateEdvouraInput) {
  validateRole(input.userRole);
  const normalizedSubject = normalizeSubjectName(input.subject);

  const previousItems = await fetchPreviousItems({
    subject: normalizedSubject,
    topic: input.topic,
    grade: input.grade,
    skillType: input.skillType,
  });

  const promptInput: EdvouraPromptInput = {
    taskType: input.taskType,
    subject: normalizedSubject,
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

  let parsed: unknown;
  let generatedText = "";

  if (shouldUseLocalBlueprintEngine(input.taskType)) {
    parsed =
      input.taskType === "GENERATE_LESSON_PLAN"
        ? buildLocalLessonPlan({ ...input, subject: normalizedSubject })
        : buildLocalLessonNote({ ...input, subject: normalizedSubject });
    providerUsed = "local_blueprint_engine";
    modelUsed = "deterministic_blueprint_v1";
  } else {
  
    try {
      const response = await generateWithPuterAI(prompt, { model });
      generatedText = response.text;
      
      try {
        parsed = parseAndValidateAIResponse(generatedText, input.taskType);
        if (shouldQualityCheckLesson(input.taskType) && isWeakLessonNote(parsed)) {
          throw new Error("Generated lesson note was too generic for student learning.");
        }
      } catch (error) {
        console.warn("First validation failed, attempting repair. Error:", error);
        const repairPrompt = buildRepairPrompt(prompt, input.taskType, error);
        try {
          const repairResponse = await generateWithPuterAI(repairPrompt, { model });
          parsed = parseAndValidateAIResponse(repairResponse.text, input.taskType);
          if (shouldQualityCheckLesson(input.taskType) && isWeakLessonNote(parsed)) {
            throw new Error("Repaired lesson note was still too generic for student learning.");
          }
        } catch {
          console.error("AI Repair failed. Original text from Puter:", generatedText);
          throw new Error(
            `AI generated content could not be parsed into the required format. The AI responded with: ${generatedText.substring(0, 100)}...`
          );
        }
      }
    } catch (error) {
      console.warn("Puter AI generation failed, falling back to server API...", error);
      try {
        const serverResult = await generateViaServerFallback(input);
        if (serverResult) {
          if (shouldQualityCheckLesson(input.taskType) && isWeakLessonNote(serverResult)) {
            parsed = buildEmergencyCanonicalContent(input);
            providerUsed = "emergency_template";
            modelUsed = "dashboard_template";
          } else {
            parsed = serverResult;
            providerUsed = "server_api_fallback";
            modelUsed = "gemini-1.5-pro-or-flash";
          }
        } else {
          throw new Error("Server fallback not supported for this task type.");
        }
      } catch (fallbackError) {
        const emergencyContent = buildEmergencyCanonicalContent(input);
        if (!emergencyContent) {
          const errMessage = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
          throw new Error(`AI generation failed on both Puter and Server API. Reason: ${errMessage}`);
        }
        parsed = emergencyContent;
        providerUsed = "emergency_template";
        modelUsed = "dashboard_template";
      }
    }
  }

  const antiRepetitionItems = extractAntiRepetitionItems({
    taskType: input.taskType,
    subject: normalizedSubject,
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
    subject: normalizedSubject,
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
