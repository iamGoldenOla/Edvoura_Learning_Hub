export const EDVOURA_TASK_TYPES = [
  "GENERATE_LESSON_NOTE",
  "GENERATE_LESSON_PLAN",
  "GENERATE_QUIZ",
  "GENERATE_SPELLING",
  "ADAPT_LEARNING",
  "IMPROVE_CONTENT",
  "REGENERATE_CONTENT",
  "GENERATE_LESSON",
  "GENERATE_FINANCIAL_LITERACY",
  "GENERATE_COMMUNICATION_SKILL",
] as const;

export type EdvouraTaskType = (typeof EDVOURA_TASK_TYPES)[number];

export const EDVOURA_VISIBLE_TASK_TYPES: EdvouraTaskType[] = [
  "GENERATE_LESSON_NOTE",
  "GENERATE_LESSON_PLAN",
  "GENERATE_QUIZ",
  "GENERATE_SPELLING",
  "ADAPT_LEARNING",
  "IMPROVE_CONTENT",
  "REGENERATE_CONTENT",
];

export const EDVOURA_TASK_TYPE_LABELS: Record<EdvouraTaskType, string> = {
  GENERATE_LESSON_NOTE: "Generate Lesson Note",
  GENERATE_LESSON_PLAN: "Generate Lesson Plan",
  GENERATE_QUIZ: "Generate Quiz",
  GENERATE_SPELLING: "Generate Spelling Content",
  ADAPT_LEARNING: "Adaptive Recommendation",
  IMPROVE_CONTENT: "Improve Existing Content",
  REGENERATE_CONTENT: "Regenerate Fresh Content",
  GENERATE_LESSON: "Generate Lesson Note (Legacy)",
  GENERATE_FINANCIAL_LITERACY: "Generate Financial Literacy (Legacy)",
  GENERATE_COMMUNICATION_SKILL: "Generate Communication Skills (Legacy)",
};

export type EdvouraPromptInput = {
  taskType: EdvouraTaskType;
  subject: string;
  topic: string;
  grade: string;
  skillType: string;
  previousContent: string[];
  extraInstruction?: string;
  existingContent?: string;
  score?: number;
  history?: string;
};

const CORE_PROMPT = `You are Edvoura AI, a global autonomous learning intelligence system designed to support teachers, tutors, and students across multiple subjects from Primary to Senior Secondary levels.

CORE MISSION

Your objective is to:
- help teachers prepare strong lessons
- generate student-facing lesson notes
- generate structured assessments
- adapt to student performance
- maintain high educational standards globally

You are NOT just a chatbot.
You are a curriculum-driven teaching assistant and instructional designer.

CORE RULES

1. Always adapt output to:
- Grade Level: {{grade}}
- Subject: {{subject}}
- Skill Type: {{skill_type}}

2. Always be:
- Clear
- Structured
- Age-appropriate
- Useful for real classroom teaching

3. NEVER:
- Repeat the same questions, spelling words, or examples
- Give vague explanations
- Skip logical teaching steps
- Publish content without human review

4. ALWAYS:
- Use fresh examples and fresh wording
- Distinguish teacher-facing preparation from student-facing learning content
- Recommend instructional materials when relevant
- Return structured output
- Keep student learning quality high`;

function buildInstructionalMaterialsContract() {
  return `{
  "youtube_videos": [
    {
      "title": "",
      "search_query": "",
      "why_it_helps": ""
    }
  ],
  "image_resources": [
    {
      "title": "",
      "search_query": "",
      "why_it_helps": ""
    }
  ],
  "classroom_materials": [""]
}`;
}

export function buildOutputContract(taskType: EdvouraTaskType) {
  switch (taskType) {
    case "GENERATE_LESSON_NOTE":
    case "GENERATE_LESSON":
      return `TASK: GENERATE_LESSON_NOTE
Return JSON:
{
  "title": "",
  "lesson_summary": "",
  "explanation": "",
  "key_points": [],
  "worked_examples": [
    {
      "title": "",
      "explanation": ""
    }
  ],
  "real_world_examples": [],
  "practice_questions": [
    {
      "question": "",
      "difficulty": "easy | medium | hard"
    }
  ],
  "learning_checks": [],
  "instructional_materials": ${buildInstructionalMaterialsContract()}
}`;
    case "GENERATE_LESSON_PLAN":
      return `TASK: GENERATE_LESSON_PLAN
Return JSON:
{
  "title": "",
  "lesson_objectives": [],
  "prior_knowledge": "",
  "teacher_preparation": "",
  "instructional_materials": ${buildInstructionalMaterialsContract()},
  "lesson_stages": [
    {
      "stage_title": "",
      "duration_minutes": 0,
      "teacher_activity": "",
      "student_activity": "",
      "assessment_check": ""
    }
  ],
  "evaluation_questions": [],
  "assignment": "",
  "differentiation_strategies": [],
  "teacher_notes": ""
}`;
    case "GENERATE_QUIZ":
      return `TASK: GENERATE_QUIZ
Generate exactly 5 multiple choice questions.
Return JSON:
{
  "title": "",
  "questions": [{"question":"","options":["","","",""],"correct_answer":"","difficulty":"easy | medium | hard","explanation":""}]
}`;
    case "GENERATE_SPELLING":
      return `TASK: GENERATE_SPELLING
Generate total 30 words: 10 easy, 10 medium, 10 difficult.
Return JSON:
{"easy":[{"word":"","meaning":"","example_sentence":""}],"medium":[],"difficult":[],"exercise":""}`;
    case "ADAPT_LEARNING":
      return `TASK: ADAPT_LEARNING
Score logic:
- Score < 40 = RETEACH
- Score 40-70 = PRACTICE
- Score > 70 = ADVANCE
Return JSON:
{"decision":"RETEACH | PRACTICE | ADVANCE","reason":"","next_action":"","recommended_content_type":""}`;
    case "GENERATE_FINANCIAL_LITERACY":
      return `TASK: GENERATE_FINANCIAL_LITERACY
Treat this as a lesson-note style output for the subject Financial Literacy.
Return the same schema as GENERATE_LESSON_NOTE.`;
    case "GENERATE_COMMUNICATION_SKILL":
      return `TASK: GENERATE_COMMUNICATION_SKILL
Treat this as a lesson-note style output for the subject Communication Skills.
Return the same schema as GENERATE_LESSON_NOTE.`;
    case "IMPROVE_CONTENT":
      return `TASK: IMPROVE_CONTENT
Preserve educational goal, improve clarity/structure, remove repetition.
Return improved JSON content only.`;
    case "REGENERATE_CONTENT":
      return `TASK: REGENERATE_CONTENT
Keep topic and grade level, but produce fresh examples/questions/materials.
Return JSON content only.`;
  }
}

export function buildEdvouraPrompt(input: EdvouraPromptInput) {
  const avoidBlock = input.previousContent.length
    ? `Avoid these previously used items:\n${input.previousContent.map((item) => `- ${item}`).join("\n")}`
    : "No previous anti-repetition items found. Still avoid repeating patterns.";

  const existingContentBlock = input.existingContent
    ? `Existing content:\n${input.existingContent}`
    : "";
  const adaptLearningBlock =
    input.taskType === "ADAPT_LEARNING"
      ? `Score: ${input.score ?? 0}\nHistory: ${input.history ?? "No history provided"}`
      : "";
  const instructionBlock = input.extraInstruction
    ? `Extra instruction:\n${input.extraInstruction}`
    : "";

  const roleReminder =
    input.taskType === "GENERATE_LESSON_PLAN"
      ? `This is teacher-facing planning content. Do not write it as a student handout.`
      : input.taskType === "GENERATE_LESSON_NOTE" || input.taskType === "GENERATE_LESSON"
        ? `This is student-facing lesson-note content. Do not expose private teacher delivery notes or answer keys.`
        : `Keep the output aligned to the requested teaching artifact.`;

  return `${CORE_PROMPT}

Task Type: ${input.taskType}
Subject: ${input.subject}
Topic: ${input.topic}
Grade Level: ${input.grade}
Skill Type: ${input.skillType}
${adaptLearningBlock}
${existingContentBlock}
${instructionBlock}

${roleReminder}

When suggesting instructional materials:
- provide safe, age-appropriate YouTube search queries rather than invented private links
- provide image search queries that help the tutor find diagrams, charts, or real-life examples
- recommend concrete classroom materials the tutor can gather

${avoidBlock}

${buildOutputContract(input.taskType)}

Return only valid JSON. No markdown fences.`;
}
