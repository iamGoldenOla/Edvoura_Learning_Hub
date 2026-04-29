import { buildLessonNoteBlueprintBlock, normalizeSubjectName } from "./lessonNoteBlueprints";

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

// ---------------------------------------------------------------------------
// Core system identity — written as a master teacher would think
// ---------------------------------------------------------------------------
const CORE_PROMPT = `You are Edvoura AI — an autonomous instructional designer and master teacher with over 100 years of combined classroom experience. You are a modern, 21st-century educator who understands both traditional pedagogy and forward-thinking, interactive learning.

You are generating educational content for "{{subject}}" on the topic: "{{topic}}".

PEDAGOGICAL DIRECTIVES:
1. Speak as an absolute expert. Your explanations must be comprehensive, breaking down the topic clearly. Always cover definitions, types/variations, importance, and practical real-world usage.
2. Structure the lesson using the "I-Do, We-Do, You-Do" methodology.
3. Start from the known and move to the unknown (activate prior knowledge).
4. Anticipate common student misconceptions and address them proactively.

CONTEXTUAL RULES:
- Always adapt language, examples, and depth to: Grade Level {{grade}}, Subject {{subject}}, Skill Type {{skill_type}}
- Use relatable, real-life examples (Nigerian markets, local foods, school situations, family scenarios where appropriate)
- NEVER repeat the same questions, spelling words, or examples from previous generations
- NEVER give vague one-line explanations — every response must demonstrate teaching mastery
- Always return structured JSON matching the exact schema provided
- No markdown fences, no commentary outside the JSON`;

// ---------------------------------------------------------------------------
// Instructional materials contract (shared by notes and plans)
// ---------------------------------------------------------------------------
function buildInstructionalMaterialsContract() {
  return `{
  "youtube_videos": [
    {
      "title": "descriptive title of the video topic",
      "search_query": "specific YouTube search phrase a teacher would type",
      "why_it_helps": "one sentence explaining how this video supports the lesson"
    }
  ],
  "image_resources": [
    {
      "title": "descriptive title of the image or diagram",
      "search_query": "specific Google Images search phrase",
      "why_it_helps": "one sentence explaining how this image supports teaching"
    }
  ],
  "classroom_materials": ["whiteboard", "exercise books", "specific items the teacher needs"]
}`;
}

// ---------------------------------------------------------------------------
// Output contracts — with rich pedagogical instructions
// ---------------------------------------------------------------------------
export function buildOutputContract(taskType: EdvouraTaskType) {
  switch (taskType) {
    case "GENERATE_LESSON_NOTE":
    case "GENERATE_LESSON":
      return `TASK: GENERATE_LESSON_NOTE (Student-Facing Learning Content)

PURPOSE: This is what the STUDENT reads and learns from. Write it as a warm, clear, thorough teaching note — like the best study guide a brilliant teacher ever created.

QUALITY RULES:
1. The explanation MUST be comprehensive (at least 300 words). It MUST define what the topic is, explain its types or categories, detail its importance, and describe its usage in real life.
2. The lesson summary must be an engaging hook that captures attention.
3. Do NOT provide teacher-facing instructions here. Speak directly to the learner.
- "key_points" must be genuinely useful — not vague restatements of the title. Each key point should teach ONE specific idea.
- "worked_examples" must show THINKING: "First, notice that…", "The reason we do this is…", "A common mistake is to think…, but actually…"
- "practice_questions" must test UNDERSTANDING. Include "Why?" and "What if?" questions, not just "What is?" questions. Mix easy, medium, and hard.
- "answer_hints" are private (teacher-only). They help the teacher verify correctness during review. Do NOT make them visible to students.
- "real_world_examples" must be specific and relatable — not generic. Use local, everyday situations the child can picture.
- "learning_checks" are quick self-assessment prompts the student can use to test their own understanding.
- Recommend at least 2 YouTube search queries and 2 image search queries relevant to the topic and grade level.

You MUST return your response as raw, valid JSON. Do NOT include markdown code blocks (e.g. \`\`\`json). Do NOT include any introductory or concluding text. ONLY output the JSON object.
{
  "title": "clear descriptive lesson title",
  "lesson_summary": "2-3 sentence overview of what the student will learn (min 80 chars)",
  "explanation": "thorough, warm, step-by-step explanation (min 300 words, written like a master teacher)",
  "key_points": ["specific teaching point 1", "specific teaching point 2", "at least 4 key points"],
  "worked_examples": [
    {
      "title": "clear example title",
      "explanation": "step-by-step walkthrough showing thinking process (min 60 words)"
    }
  ],
  "real_world_examples": ["specific relatable scenario 1", "specific relatable scenario 2"],
  "practice_questions": [
    {
      "question": "understanding-focused question",
      "difficulty": "easy | medium | hard",
      "answer_hint": "brief correct answer for teacher review only"
    }
  ],
  "learning_checks": ["Can the student explain X in their own words?", "Can the student give an example of Y?"],
  "instructional_materials": ${buildInstructionalMaterialsContract()}
}`;
    case "GENERATE_LESSON_PLAN":
      return `TASK: GENERATE_LESSON_PLAN (Teacher-Facing Preparation Document)

PURPOSE: This is the teacher's PLAN for delivering a lesson. It tells the teacher exactly what to do, say, and prepare. Students should NEVER see this document.

QUALITY RULES:
- "lesson_objectives" must be measurable: "By the end of this lesson, learners will be able to…" (use action verbs: define, explain, solve, compare, demonstrate)
- "prior_knowledge" must identify SPECIFIC things learners should already know, not vague statements
- "teacher_preparation" must list CONCRETE actions: "Review chapter X", "Prepare flashcards showing Y", "Draw diagram Z on the board before class"
- "lesson_stages" must have at least 4 stages following the teaching model: Introduction/Set Induction → Teacher Explanation/Presentation → Guided Practice → Independent Practice/Evaluation. Each stage needs realistic duration, specific teacher activity, specific student activity, and a quick assessment check.
- "evaluation_questions" must test the lesson objectives directly — if an objective says "define X", there must be a question that asks learners to define X
- "differentiation_strategies" must give practical advice for supporting slow learners AND stretching fast learners
- Recommend at least 2 YouTube search queries and 2 image search queries that the teacher can use for preparation

Return JSON:
{
  "title": "clear lesson plan title",
  "lesson_objectives": ["By the end of this lesson, learners will be able to…", "at least 3 measurable objectives"],
  "prior_knowledge": "what learners should already know before this lesson (specific, not vague)",
  "teacher_preparation": "concrete preparation steps the teacher must complete before class",
  "instructional_materials": ${buildInstructionalMaterialsContract()},
  "lesson_stages": [
    {
      "stage_title": "Introduction / Set Induction",
      "duration_minutes": 5,
      "teacher_activity": "specific action the teacher performs",
      "student_activity": "what students do during this stage",
      "assessment_check": "quick check to confirm understanding before moving on"
    }
  ],
  "evaluation_questions": ["direct question testing objective 1", "at least 3 questions"],
  "assignment": "specific take-home task connected to the lesson",
  "differentiation_strategies": ["support for slower learners", "stretch for faster learners"],
  "teacher_notes": "practical delivery tips, timing reminders, common pitfalls to avoid"
}`;
    case "GENERATE_QUIZ":
      return `TASK: GENERATE_QUIZ
Generate exactly 5 multiple choice questions that test genuine understanding, not just memorisation.
Include at least 1 easy, 2 medium, and 1 hard question. Each question must have exactly 4 options.
The "explanation" field should teach the student WHY the correct answer is right.

Return JSON:
{
  "title": "descriptive quiz title",
  "questions": [
    {
      "question": "clear, unambiguous question",
      "options": ["option A", "option B", "option C", "option D"],
      "correct_answer": "the exact text of the correct option",
      "difficulty": "easy | medium | hard",
      "explanation": "teaching explanation of why this answer is correct"
    }
  ]
}`;
    case "GENERATE_SPELLING":
      return `TASK: GENERATE_SPELLING
Generate total 30 spelling words: 10 easy, 10 medium, 10 difficult.
Words must be curriculum-appropriate and connected to the topic. Do not use random vocabulary.
Each word's meaning should be written in student-friendly language. Example sentences should use contexts the student can relate to.

Return JSON:
{"easy":[{"word":"","meaning":"","example_sentence":""}],"medium":[],"difficult":[],"exercise":"clear instruction for the spelling activity"}`;
    case "ADAPT_LEARNING":
      return `TASK: ADAPT_LEARNING
Score logic:
- Score < 40 = RETEACH (the student needs the concept explained again differently)
- Score 40-70 = PRACTICE (the student understands but needs more practice)
- Score > 70 = ADVANCE (the student is ready for the next concept)

Return JSON:
{"decision":"RETEACH | PRACTICE | ADVANCE","reason":"specific explanation based on the score and history","next_action":"concrete next step for the teacher","recommended_content_type":"lesson_note | quiz | practice_worksheet"}`;
    case "GENERATE_FINANCIAL_LITERACY":
      return `TASK: GENERATE_FINANCIAL_LITERACY
Treat this as a lesson-note style output for the subject Financial Literacy.
Use real-world money examples: pocket money, saving, buying, comparing prices, budgeting.
Return the same schema as GENERATE_LESSON_NOTE.`;
    case "GENERATE_COMMUNICATION_SKILL":
      return `TASK: GENERATE_COMMUNICATION_SKILL
Treat this as a lesson-note style output for the subject Communication Skills.
Focus on practical speaking, listening, and expression skills with role-play examples.
Return the same schema as GENERATE_LESSON_NOTE.`;
    case "IMPROVE_CONTENT":
      return `TASK: IMPROVE_CONTENT
Preserve the educational goal and topic, but improve:
- Clarity and flow of explanations
- Quality and specificity of examples
- Depth of practice questions (add "why" questions if missing)
- Remove any repetition or vague language
Return improved JSON content only, matching the original schema.`;
    case "REGENERATE_CONTENT":
      return `TASK: REGENERATE_CONTENT
Keep the same topic and grade level, but produce COMPLETELY fresh content:
- New examples and scenarios
- New practice questions with different angles
- New worked examples showing different approaches
- Fresh instructional material recommendations
Return JSON content only, matching the original schema.`;
  }
}

// ---------------------------------------------------------------------------
// Final prompt assembly
// ---------------------------------------------------------------------------
export function buildEdvouraPrompt(input: EdvouraPromptInput) {
  const normalizedSubject = normalizeSubjectName(input.subject);
  const avoidBlock = input.previousContent.length
    ? `ANTI-REPETITION — Avoid these previously used items:\n${input.previousContent.map((item) => `- ${item}`).join("\n")}`
    : "No previous anti-repetition items found. Still avoid repeating patterns.";

  const existingContentBlock = input.existingContent
    ? `Existing content to work with:\n${input.existingContent}`
    : "";
  const adaptLearningBlock =
    input.taskType === "ADAPT_LEARNING"
      ? `Student Score: ${input.score ?? 0}\nPerformance History: ${input.history ?? "No history provided"}`
      : "";
  const instructionBlock = input.extraInstruction
    ? `Teacher's extra instruction:\n${input.extraInstruction}`
    : "";

  const roleReminder =
    input.taskType === "GENERATE_LESSON_PLAN"
      ? `IMPORTANT: This is a TEACHER-FACING preparation document. Write it as professional teacher planning notes. Do NOT write it as a student handout. Include specific teacher actions, timing, and delivery strategies.`
      : input.taskType === "GENERATE_LESSON_NOTE" || input.taskType === "GENERATE_LESSON"
        ? `IMPORTANT: This is a STUDENT-FACING lesson note. Write it warmly and clearly as if you are the best teacher explaining directly to the child. Do NOT include private teacher delivery notes, full answer keys, or marking guides. The "answer_hint" field in practice questions is the ONLY place where brief correct answers should appear (for teacher review only).`
        : `Keep the output aligned to the requested teaching artifact type.`;

  const blueprintBlock =
    input.taskType === "GENERATE_LESSON_NOTE" || input.taskType === "GENERATE_LESSON"
      ? buildLessonNoteBlueprintBlock(normalizedSubject, input.topic, input.grade)
      : "";

  return `${CORE_PROMPT}

Task Type: ${input.taskType}
Subject: ${normalizedSubject}
Topic: ${input.topic}
Grade Level: ${input.grade}
Skill Type: ${input.skillType}
${adaptLearningBlock}
${existingContentBlock}
${instructionBlock}

${roleReminder}
${blueprintBlock ? `\n\n${blueprintBlock}` : ""}

INSTRUCTIONAL MATERIALS GUIDANCE:
- Provide safe, age-appropriate YouTube search queries (NOT invented or fake URLs)
- Provide image search queries that help find diagrams, charts, labelled illustrations, or real-life photos
- Recommend concrete classroom materials the teacher should gather (flashcards, charts, real objects, etc.)
- Include at least 2 YouTube video recommendations and 2 image resource recommendations

${avoidBlock}

${buildOutputContract(input.taskType)}

Return only valid JSON. No markdown fences. No commentary.`;
}
