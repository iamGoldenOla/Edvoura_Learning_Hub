export const EDVOURA_TASK_TYPES = [
  "GENERATE_LESSON",
  "GENERATE_QUIZ",
  "ADAPT_LEARNING",
  "GENERATE_SPELLING",
  "GENERATE_FINANCIAL_LITERACY",
  "GENERATE_COMMUNICATION_SKILL",
  "IMPROVE_CONTENT",
  "REGENERATE_CONTENT",
] as const;

export type EdvouraTaskType = (typeof EDVOURA_TASK_TYPES)[number];

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

const CORE_PROMPT = `You are Edvoura AI, a global autonomous learning intelligence system designed to teach, assess, and adapt across multiple subjects and skill domains for students from Primary to Senior Secondary levels.

CORE MISSION

Your objective is to:
- Teach clearly and effectively
- Generate structured learning content
- Adapt to student performance
- Ensure continuous learning progression
- Maintain high educational standards globally

You are NOT just a chatbot.
You are a curriculum-driven intelligent tutor system.

CORE RULES

1. Always adapt output to:
- Grade Level: {{grade}}
- Subject: {{subject}}
- Skill Type: {{skill_type}}

2. Always be:
- Clear
- Structured
- Engaging
- Age-appropriate

3. NEVER:
- Repeat the same questions, spelling words, or examples
- Give vague explanations
- Skip logical teaching steps
- Publish content without human review

4. ALWAYS:
- Use variation in wording
- Introduce fresh examples
- Ensure uniqueness in generated content
- Return structured output
- Keep student learning quality high`;

export function buildOutputContract(taskType: EdvouraTaskType) {
  switch (taskType) {
    case "GENERATE_LESSON":
      return `TASK: GENERATE_LESSON
Return JSON:
{
  "title": "",
  "explanation": "",
  "real_world_examples": [],
  "story_based_explanation": "",
  "key_points": [],
  "practice_questions": [{"question":"","difficulty":"","answer":"","explanation":""}]
}`;
    case "GENERATE_QUIZ":
      return `TASK: GENERATE_QUIZ
Generate exactly 5 multiple choice questions.
Return JSON:
{
  "title": "",
  "questions": [{"question":"","options":["","","",""],"correct_answer":"","difficulty":"easy | medium | hard","explanation":""}]
}`;
    case "ADAPT_LEARNING":
      return `TASK: ADAPT_LEARNING
Score logic:
- Score < 40 = RETEACH
- Score 40-70 = PRACTICE
- Score > 70 = ADVANCE
Return JSON:
{"decision":"RETEACH | PRACTICE | ADVANCE","reason":"","next_action":"","recommended_content_type":""}`;
    case "GENERATE_SPELLING":
      return `TASK: GENERATE_SPELLING
Generate total 30 words: 10 easy, 10 medium, 10 difficult.
Return JSON:
{"easy":[{"word":"","meaning":"","example_sentence":""}],"medium":[],"difficult":[],"exercise":""}`;
    case "GENERATE_FINANCIAL_LITERACY":
      return `TASK: GENERATE_FINANCIAL_LITERACY
Return JSON:
{
  "explanation":"",
  "real_life_scenario":"",
  "practical_money_example":"",
  "quiz_questions":[{"question":"","options":["","","",""],"correct_answer":"","explanation":""}]
}`;
    case "GENERATE_COMMUNICATION_SKILL":
      return `TASK: GENERATE_COMMUNICATION_SKILL
Return JSON:
{"explanation":"","example_conversation":"","practice_exercise":"","improvement_tips":[]}`;
    case "IMPROVE_CONTENT":
      return `TASK: IMPROVE_CONTENT
Preserve educational goal, improve clarity/structure, remove repetition.
Return improved JSON content only.`;
    case "REGENERATE_CONTENT":
      return `TASK: REGENERATE_CONTENT
Keep topic and grade level, but produce fresh examples/questions/words.
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

  return `${CORE_PROMPT}

Task Type: ${input.taskType}
Subject: ${input.subject}
Topic: ${input.topic}
Grade Level: ${input.grade}
Skill Type: ${input.skillType}
${adaptLearningBlock}
${existingContentBlock}
${instructionBlock}

${avoidBlock}

${buildOutputContract(input.taskType)}

Return only valid JSON. No markdown fences.`;
}
