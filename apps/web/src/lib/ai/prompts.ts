/**
 * EDVOURA AI ENGINE — Prompt Templates
 *
 * These are the carefully crafted system prompts that instruct the LLM.
 * They enforce African context, curriculum alignment, and professional depth.
 * The prompts work together with the Zod schemas — the prompt tells the AI
 * WHAT to write, the schema ensures it actually did.
 */

import type { ContentType } from './schemas';

// ---------------------------------------------------------------------------
// Master system identity used in every AI call
// ---------------------------------------------------------------------------
export const SYSTEM_IDENTITY = `You are EDVOURA AI — a world-class Nigerian education expert, curriculum specialist, and master tutor.

RULES YOU MUST FOLLOW:
1. You write like a brilliant, warm, experienced human teacher — NEVER robotic or generic.
2. Every explanation must be thorough, detailed, and highly comprehensive.
3. Use relatable, real-life African examples where appropriate (Nigerian markets, local foods, cultural references).
4. Adjust your language complexity to match the student's grade level precisely.
5. Include step-by-step breakdowns for complex concepts.
6. Your content must follow the specified curriculum system (WAEC, NECO, British, or Hybrid).
7. NEVER give shallow, lazy, or one-line answers. Every response must demonstrate mastery.
8. You must output ONLY valid JSON matching the exact schema provided. No markdown, no commentary.`;

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
  const { contentType, topic, subject, gradeLevel, curriculumSystem, objectives, difficulty, studentContext } = params;

  const difficultyLabel = difficulty && difficulty <= 3 ? 'beginner' : difficulty && difficulty <= 6 ? 'intermediate' : 'advanced';

  const objectivesBlock = objectives?.length
    ? `\nThe specific curriculum objectives to cover are:\n${objectives.map((o, i) => `${i + 1}. ${o}`).join('\n')}`
    : '';

  const studentBlock = studentContext
    ? `\nStudent context: ${studentContext}`
    : '';

  let minChars = 400;
  let lengthDesc = "at least 400 characters long — simple, engaging, and easy to read";

  const gradeStr = gradeLevel.toUpperCase();
  if (gradeStr.includes('SSS') || gradeStr.includes('10') || gradeStr.includes('11') || gradeStr.includes('12')) {
    minChars = 2000;
    lengthDesc = "at least 2000 characters long — detailed, highly advanced, and rigorous";
  } else if (gradeStr.includes('JSS') || gradeStr.includes('7') || gradeStr.includes('8') || gradeStr.includes('9') || gradeStr.includes('4') || gradeStr.includes('5') || gradeStr.includes('6')) {
    minChars = 1000;
    lengthDesc = "at least 1000 characters long — thorough and well-structured";
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
- explanation: a THOROUGH, DETAILED explanation (${lengthDesc}). Write as if you are the best teacher in Nigeria explaining this to a ${gradeLevel} student. Use analogies, real-life Nigerian examples, and step-by-step breakdowns. DO NOT BE LAZY.
- examples: at least 2 worked examples with detailed context and solution
- practiceQuestions: at least 5 questions with answers, covering easy/medium/hard difficulties
- teacherNotes: optional tips for the tutor delivering this lesson

Output ONLY valid JSON matching this structure. No markdown wrapping.`;

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

Output ONLY valid JSON with: title, moralLesson, ageSuitability, content, vocabulary[{word, meaning}]`;

    case 'comprehension':
      return `Create a detailed comprehension passage for ${gradeLevel} ${subject} on "${topic}".
Curriculum system: ${curriculumSystem}.
${objectivesBlock}
${studentBlock}

The passage MUST:
- Be thorough and educational (${lengthDesc})
- Include factual, inferential, AND evaluative questions
- Have at least 5 questions with detailed answers
- Include at least 3 vocabulary words with meanings
- Use clear, age-appropriate language for ${gradeLevel}

Output ONLY valid JSON with: title, passage, vocabulary[{word, meaning}], questions[{question, answer, type}]`;

    case 'quiz':
    case 'worksheet':
      return `Create a ${contentType === 'quiz' ? 'quiz' : 'worksheet'} for ${gradeLevel} ${subject} on "${topic}".
Curriculum system: ${curriculumSystem}.
Difficulty: ${difficultyLabel}.
${objectivesBlock}
${studentBlock}

Requirements:
- At least 5 questions covering multiple question types (multiple_choice, short_answer, true_false, fill_in_blank)
- Each question MUST have a detailed teaching explanation for the correct answer
- Questions should progress from easy to hard
- Include clear instructions

Output ONLY valid JSON with: title, instructions, questions[{questionText, questionType, options?, correctAnswer, explanation, difficulty}]`;

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
}) {
  return `Analyze the following student's academic performance and generate a comprehensive learning profile.

Student: ${params.studentName} (ID: ${params.studentId})
Grade Level: ${params.gradeLevel}

Performance Data:
${params.performanceData
  .map(
    (p) =>
      `- ${p.subject}: Average Score ${p.averageScore}%, ${p.assignmentsCompleted} assignments completed, ${p.attendanceRate}% attendance`,
  )
  .join('\n')}

You must provide:
1. overallAssessment: A detailed, professional assessment (min 50 chars)
2. learningPace: "accelerated", "standard", or "needs_intervention"
3. strongAreas: subjects where the student excels, with reasons
4. weakAreas: subjects needing attention, with specific reasons
5. recommendations: at least 2 actionable items with priority and target audience (tutor/parent/student)
6. revisionPlan: focus topics and a suggested weekly schedule

Be specific, data-driven, and constructive. This is for professional educational use.
Output ONLY valid JSON matching the schema.`;
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
- Summary must be thorough (min 200 chars) — parents want detail, not fluff
- Include specific highlights from the week
- Honestly but gently address areas for improvement
- Provide at least 1 actionable suggestion parents can do at home
- Never be alarming or discouraging

Output ONLY valid JSON with: childName, reportPeriod, summary, highlights[], areasForImprovement[], suggestionsForHome[], tone`;
}
