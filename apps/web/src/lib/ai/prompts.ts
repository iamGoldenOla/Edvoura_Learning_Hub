/**
 * EDVOURA AI ENGINE - Prompt Templates
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
      return `Generate a highly comprehensive lesson note for ${gradeLevel} ${subject} on the topic "${topic}".
Curriculum system: ${curriculumSystem}.
Difficulty level: ${difficultyLabel} (${difficulty ?? 5}/10).
${objectivesBlock}
${studentBlock}

The lesson note MUST include:
- topic: the exact topic title
- objectives: at least 3 clear, measurable learning objectives
- explanation: a thorough, detailed explanation (${lengthDesc}). Write as if you are the best teacher in Nigeria explaining this to a ${gradeLevel} student. Use analogies, real-life Nigerian examples, and step-by-step breakdowns.
- examples: at least 2 worked examples with detailed context and solution
- practiceQuestions: at least 5 questions with answers, covering easy/medium/hard difficulties
- teacherNotes: optional tips for the tutor delivering this lesson

Output only valid JSON matching this structure.`;

    case 'story':
      return `Write a captivating, age-appropriate story for ${gradeLevel} students.
Theme/Topic: "${topic}"
Subject connection: ${subject}
${studentBlock}

The story MUST:
- Be set in an African context (Nigerian town, school, market, family compound, etc.)
- Have vivid characters with African names
- Teach a clear moral lesson
- Be rich, immersive, and ${lengthDesc}
- Include at least 3 vocabulary words with meanings

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

CRITICAL REQUIREMENTS:
- Generate exactly 20 diverse, unique questions pulled from deep subject knowledge. Do not repeat questions.
- Divide the 20 questions across difficulty levels: roughly 7 easy, 7 medium, and 6 hard questions.
- For multiple_choice questions, provide exactly 4 options.
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
