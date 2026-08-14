/**
 * EDVOURA AI ENGINE - Prompt Templates (LEGACY)
 *
 * ⚠️ DEPRECATED: This prompt system is retained only for backward compatibility
 * with the /api/ai/generate server-side fallback route.
 *
 * For all new AI content generation (lesson notes, lesson plans, quizzes, spelling),
 * use the unified prompt system in:
 *   - edvouraPromptBuilder.ts  (prompt construction)
 *   - aiContentValidator.ts    (schema validation & normalization)
 *   - contentGenerationService.ts (orchestration)
 *
 * The new system uses artifact-based taskType (GENERATE_LESSON_NOTE, GENERATE_LESSON_PLAN, etc.)
 * instead of content-type-based generation (lesson_note, quiz, etc.).
 *
 * These prompts instruct the LLM to return curriculum-aligned, structured output.
 * The prompt defines what to write; the Zod schema enforces the contract.
 */

import type { ContentType } from './schemas';

// ---------------------------------------------------------------------------
// Master system identity used in every AI call
// ---------------------------------------------------------------------------
export const SYSTEM_IDENTITY = `You are EDVOURA AI - a world-class Nigerian education expert, curriculum specialist, and master tutor.

RULES YOU MUST FOLLOW:
1. You write like a brilliant, warm, experienced human teacher - never robotic or generic.
2. Every explanation must be thorough, detailed, and highly comprehensive.
3. Use relatable, real-life African examples where appropriate (Nigerian markets, local foods, cultural references).
4. Adjust your language complexity to match the student's grade level precisely.
5. Include step-by-step breakdowns for complex concepts.
6. Your content must follow the specified curriculum system (WAEC, NECO, British, or Hybrid).
7. Never give shallow, lazy, or one-line answers. Every response must demonstrate mastery.
8. You must output only valid JSON matching the exact schema provided. No markdown. No commentary.`;

// ---------------------------------------------------------------------------
// Content-type-specific prompts
// ---------------------------------------------------------------------------
export function buildGenerationPrompt(params: {
  contentType: ContentType;
  topic: string;
  subject: string;
  gradeLevel: string;
  curriculumSystem: string;
  objectives?: string[];
  difficulty?: number;
  studentContext?: string;
}) {
  const { contentType, topic, subject, gradeLevel, curriculumSystem, objectives, difficulty, studentContext } =
    params;

  const difficultyLabel =
    difficulty && difficulty <= 3 ? 'beginner' : difficulty && difficulty <= 6 ? 'intermediate' : 'advanced';

  const objectivesBlock = objectives?.length
    ? `\nThe specific curriculum objectives to cover are:\n${objectives.map((objective, index) => `${index + 1}. ${objective}`).join('\n')}`
    : '';

  const studentBlock = studentContext ? `\nStudent context: ${studentContext}` : '';

  let lengthDesc = 'at least 400 characters long - simple, engaging, and easy to read';

  const gradeStr = gradeLevel.toUpperCase();
  if (gradeStr.includes('SSS') || gradeStr.includes('10') || gradeStr.includes('11') || gradeStr.includes('12')) {
    lengthDesc = 'at least 2000 characters long - detailed, highly advanced, and rigorous';
  } else if (
    gradeStr.includes('JSS') ||
    gradeStr.includes('7') ||
    gradeStr.includes('8') ||
    gradeStr.includes('9') ||
    gradeStr.includes('4') ||
    gradeStr.includes('5') ||
    gradeStr.includes('6')
  ) {
    lengthDesc = 'at least 1000 characters long - thorough and well-structured';
  }

  switch (contentType) {
    case 'lesson_note':
      return `Generate a highly comprehensive, expert-level lesson note for ${gradeLevel} ${subject} on the topic "${topic}".
Curriculum system: ${curriculumSystem}.
Difficulty level: ${difficultyLabel} (${difficulty ?? 5}/10).
${objectivesBlock}
${studentBlock}

DIRECT PEDAGOGICAL DIRECTIVES:
- DIVE DIRECTLY INTO SUBJECT FACTS: Provide exact scientific facts, formulas, principles, categories, and real-life mechanics of "${topic}". DO NOT write generic meta-talk or fictional stories about students studying in class.
- IF SCIENCE / BASIC SCIENCE: Explain composition, properties, key components, physical/biological laws, respiration/combustion/chemical effects, and simple hands-on observations or experiments.
- IF MATHEMATICS: Explain step-by-step mathematical reasoning, rules, formulas, worked calculations, and common traps.
- IF LANGUAGES: Explain grammar rules, stylistic devices, vocabulary, and contextual usage.
- IF SOCIAL/CIVIC/GEOGRAPHY: Explain factual structures, historical facts, civic duties, or geographical phenomena.

The lesson note MUST include:
- topic: the exact topic title
- objectives: at least 3 clear, measurable learning objectives
- explanation: a thorough, detailed explanation (${lengthDesc}). Write as if you are a master educator explaining this to a ${gradeLevel} student. Use clear analogies, step-by-step breakdowns, and concrete real-world examples.
- examples: at least 2 worked examples with detailed context and solution
- practiceQuestions: at least 5 questions with answers, covering easy/medium/hard difficulties
- teacherNotes: optional tips for the tutor delivering this lesson

Output only valid JSON matching this structure.`;

    case 'story':
      return `Write a captivating, creative narrative story / fable for ${gradeLevel} students.
Theme/Topic: "${topic}"
Subject connection: ${subject}
${studentBlock}

CRITICAL STORYTELLING INSTRUCTIONS:
- You are writing a creative, imaginative, narrative story / fable / tale about "${topic}".
- DO NOT treat "${topic}" as an academic school subject or write a meta-story about a student studying in a classroom! Write an actual engaging story where "${topic}" is the main character, plot, or central element!
- For example, if the topic is "The Great Lion", write a story about a majestic, brave lion in a sun-drenched savanna, his adventures, his kingdom, and the lessons he learns.
- Set the story in a rich, vivid setting (African savanna, forest, ancient kingdom, or village setting).
- Give characters vivid names and distinct personalities.
- Have a clear narrative arc with a beginning, middle/conflict, and satisfying resolution.
- Teach a clear moral lesson embedded naturally in the tale.
- Include at least 3 vocabulary words from the story with their definitions.

Output only valid JSON with: title, moralLesson, ageSuitability, content, vocabulary[{word, meaning}]`;

    case 'comprehension':
      return `Create a detailed comprehension passage for ${gradeLevel} ${subject} on "${topic}".
Curriculum system: ${curriculumSystem}.
${objectivesBlock}
${studentBlock}

The passage MUST:
- Be thorough and educational (${lengthDesc})
- Include factual, inferential, and evaluative questions
- Have at least 5 questions with detailed answers
- Include at least 3 vocabulary words with meanings
- Use clear, age-appropriate language for ${gradeLevel}

Output only valid JSON with: title, passage, vocabulary[{word, meaning}], questions[{question, answer, type}]`;

    case 'quiz':
    case 'worksheet':
      return `Create a highly intelligent, comprehensive ${contentType === 'quiz' ? 'quiz' : 'worksheet'} for ${gradeLevel} ${subject} on "${topic}".
Curriculum system: ${curriculumSystem}.
${objectivesBlock}
${studentBlock}
Generation Seed Nonce: ${Date.now()}_${Math.floor(Math.random() * 1000000)}

CRITICAL ANTI-REPETITION & VARIATION REQUIREMENTS:
- Generate fresh, unique questions every time! DO NOT repeat previously generated questions or static textbook examples.
- Generate 10 to 20 diverse, unique questions pulled from deep subject knowledge.
- For mathematics/calculation topics: Use randomized numbers, varied variable names, and distinct real-world story scenarios.
- Divide questions across difficulty levels: easy, medium, and hard.
- For multiple_choice questions, provide exactly 4 distinct options.
- For every question, provide the exact correct answer.
- For every question, provide a detailed teaching explanation of why the answer is correct.
- Emphasize multiple_choice, but you may mix in short_answer, true_false, or fill_in_blank.
- Include clear instructions for the student.

Output only valid JSON with: title, instructions, questions[{questionText, questionType, options?, correctAnswer, explanation, difficulty}]`;

    case 'spelling_bee':
      return `Create a tutor-quality spelling bee challenge for ${gradeLevel} ${subject} on "${topic}".
Curriculum system: ${curriculumSystem}.
${objectivesBlock}
${studentBlock}

CRITICAL REQUIREMENTS:
- Generate exactly 10 unique spelling bee words aligned to the topic and age level.
- Mix difficulty levels across easy, medium, and hard.
- For each word provide:
  - word
  - pronunciation
  - syllables as a number
  - definition
  - exampleSentence
  - hint that helps the student spell without revealing the word
  - difficulty
- Write instructions a tutor can read aloud to students.
- Keep the word list educational and curriculum-aware, not random vocabulary.
- Use clear Nigerian classroom context where useful.

Output only valid JSON with: title, instructions, theme, words[{word, pronunciation, syllables, definition, exampleSentence, hint, difficulty}]`;

    default:
      return `Generate educational content for ${gradeLevel} ${subject} on "${topic}". Output valid JSON.`;
  }
}

// ---------------------------------------------------------------------------
// Student Analysis prompt
// ---------------------------------------------------------------------------
export function buildStudentAnalysisPrompt(params: {
  studentName: string;
  studentId: string;
  gradeLevel: string;
  performanceData: {
    subject: string;
    averageScore: number;
    assignmentsCompleted: number;
    attendanceRate: number;
  }[];
  topicPerformance?: {
    subject: string;
    topic: string;
    score: number;
    source: 'assignment' | 'ai_practice';
    feedback?: string | null;
  }[];
}) {
  const topicBlock =
    params.topicPerformance && params.topicPerformance.length > 0
      ? `\nTopic-level evidence:\n${params.topicPerformance
          .map(
            (item) =>
              `- ${item.subject} / ${item.topic}: ${item.score}% via ${item.source}${item.feedback ? ` | feedback: ${item.feedback}` : ''}`,
          )
          .join('\n')}`
      : '\nTopic-level evidence: none available.';

  return `Analyze the following student's academic performance and generate a comprehensive learning profile.

Student: ${params.studentName} (ID: ${params.studentId})
Grade Level: ${params.gradeLevel}

Performance Data:
${params.performanceData
  .map(
    (item) =>
      `- ${item.subject}: Average Score ${item.averageScore}%, ${item.assignmentsCompleted} assignments completed, ${item.attendanceRate}% attendance`,
  )
  .join('\n')}
${topicBlock}

You must provide:
1. overallAssessment: A detailed, professional assessment (min 50 chars)
2. learningPace: "accelerated", "standard", or "needs_intervention"
3. strongAreas: subjects where the student excels, optionally with topicFocus, and clear reasons
4. weakAreas: subjects needing attention, optionally with topicFocus, with specific reasons and severity
5. weakTopics: at least 1 topic-level weakness using the topic evidence provided, including evidence, latestScore, and trend
6. recommendations: at least 2 actionable items with priority and target audience (tutor/parent/student)
7. tutorActions: at least 2 concrete tutor interventions with targetSubject, optional targetTopic, and rationale
8. parentSummary: a headline, concise summary, and 2+ supportActions the parent can do at home
9. studentPlan: encouragement, 2+ focusTopics, 3+ nextSteps, and a recommended practiceStyle
10. revisionPlan: focusTopics, a suggested weekly schedule, and 2+ weeklyGoals

Be specific, data-driven, and constructive.
Output only valid JSON matching the schema.`;
}

// ---------------------------------------------------------------------------
// Parent Report prompt
// ---------------------------------------------------------------------------
export function buildParentReportPrompt(params: {
  childName: string;
  reportPeriod: string;
  performanceSummary: string;
  highlights: string[];
  concerns: string[];
}) {
  return `Generate a warm, professional weekly report for the parent of ${params.childName}.
Report period: ${params.reportPeriod}

Academic summary: ${params.performanceSummary}
Highlights: ${params.highlights.join('; ')}
Concerns: ${params.concerns.join('; ')}

The report must:
- Use a warm, encouraging, professional tone (tone: "warm_professional")
- Summary must be thorough (min 200 chars) - parents want detail, not fluff
- Include specific highlights from the week
- Honestly but gently address areas for improvement
- Provide at least 1 actionable suggestion parents can do at home
- Never be alarming or discouraging

Output only valid JSON with: childName, reportPeriod, summary, highlights[], areasForImprovement[], suggestionsForHome[], tone`;
}

export function buildLessonExplainerPrompt(params: {
  mode: 'simple' | 'harder_examples' | 'checks_for_understanding' | 'revision_notes';
  topic: string;
  subject: string;
  gradeLevel: string;
  lessonText: string;
}) {
  const modeInstructionMap = {
    simple:
      'Explain the lesson simply, clearly, and warmly as if reteaching a confused student. Break down the concept in easier language without sounding childish.',
    harder_examples:
      'Keep the core explanation concise, then give stronger, more challenging worked examples that stretch the student beyond the original lesson.',
    checks_for_understanding:
      'Explain the lesson briefly, then generate 5 checks for understanding with answer hints that help the student think without giving away the full answer.',
    revision_notes:
      'Turn the lesson into compact but high-quality revision notes with memory cues, key facts, and exam-ready reminders.',
  } as const;

  return `You are explaining a published lesson for a ${params.gradeLevel} student.
Subject: ${params.subject}
Topic: ${params.topic}
Mode: ${params.mode}

Lesson source:
${params.lessonText}

Instruction:
${modeInstructionMap[params.mode]}

Return ONLY valid JSON with:
- mode
- title
- explanation
- examples: array of short example strings (empty array if not needed)
- checks: array of {question, answerHint} (empty array if not needed)
- revisionNotes: array of short bullet-note strings (empty array if not needed)
- nextStep: one concrete next action for the student

Make the response precise, student-friendly, and curriculum-aware.`;
}
