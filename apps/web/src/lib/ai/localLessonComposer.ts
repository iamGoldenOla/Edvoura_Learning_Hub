import { getLessonNoteBlueprint, normalizeSubjectName } from "./lessonNoteBlueprints";
import type { GenerateEdvouraInput } from "./contentGenerationService";

type LessonNoteQuestion = {
  question: string;
  difficulty: "easy" | "medium" | "hard";
  answer_hint: string;
};

function buildInstructionalMaterials(subject: string, topic: string, grade: string) {
  return {
    youtube_videos: [
      {
        title: `${topic} lesson for ${grade}`,
        search_query: `${subject} ${topic} lesson for ${grade}`,
        why_it_helps: "Provides a child-friendly explanation with visuals and familiar examples.",
      },
      {
        title: `${topic} explained for children`,
        search_query: `${topic} for children ${grade}`,
        why_it_helps: "Gives the learner a second simple explanation using age-appropriate language.",
      },
    ],
    image_resources: [
      {
        title: `${topic} labelled pictures`,
        search_query: `${subject} ${topic} labelled diagram for ${grade}`,
        why_it_helps: "Helps learners see clear pictures or diagrams connected to the lesson.",
      },
      {
        title: `${topic} real-life examples`,
        search_query: `${topic} real life pictures for children`,
        why_it_helps: "Shows how the topic appears in everyday life outside the textbook.",
      },
    ],
    classroom_materials: [
      "Whiteboard and markers",
      "Student exercise books",
      `${topic} charts, pictures, or real objects`,
    ],
  };
}

function ensureSentence(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function buildGenericExplanation(subject: string, topic: string, grade: string) {
  return [
    `${topic} is an important topic in ${subject}. In this lesson, learners in ${grade} should understand what ${topic} means in simple and correct language.`,
    `A good lesson note should explain the main features, parts, uses, or types connected to ${topic}. It should also help the learner understand where the topic appears in everyday life at home, in school, or in the wider community.`,
    `Learners should be able to talk about ${topic} clearly, give examples, and answer simple questions that show real understanding.`,
  ].join("\n\n");
}

function buildGenericQuestions(topic: string, subject: string): LessonNoteQuestion[] {
  return [
    {
      question: `What is ${topic}?`,
      difficulty: "easy",
      answer_hint: `${topic} should be explained in simple words as it relates to ${subject}.`,
    },
    {
      question: `Give one real-life example of ${topic}.`,
      difficulty: "easy",
      answer_hint: `Use one correct example from home, school, the road, or the community.`,
    },
    {
      question: `Why is ${topic} important?`,
      difficulty: "medium",
      answer_hint: `Explain one or two ways ${topic} helps people in daily life.`,
    },
    {
      question: `What would happen if ${topic} was not available or not used properly?`,
      difficulty: "hard",
      answer_hint: `Think about the problems people would face without it.`,
    },
  ];
}

export function buildLocalLessonNote(input: GenerateEdvouraInput) {
  const subject = normalizeSubjectName(input.subject);
  const topic = input.topic.trim();
  const { topicBlueprint } = getLessonNoteBlueprint(subject, topic);

  const summary =
    topicBlueprint?.summary ??
    `${topic} helps learners understand the meaning of the topic, its main features, and why it matters in everyday life.`;

  const explanation =
    topicBlueprint?.explanation_paragraphs?.join("\n\n") ??
    buildGenericExplanation(subject, topic, input.grade);

  const keyPoints =
    topicBlueprint?.must_cover?.slice(0, 5).map((item) => ensureSentence(item.charAt(0).toUpperCase() + item.slice(1))) ??
    [
      ensureSentence(`${topic} should be explained in simple language a learner can understand`),
      ensureSentence(`Learners should know the meaning of ${topic} and its main features`),
      ensureSentence(`${topic} should be connected to real life at home, school, or in the community`),
      ensureSentence(`Learners should be able to answer questions and give examples about ${topic}`),
    ];

  const workedExamples =
    topicBlueprint?.worked_examples?.slice(0, 2).map((item, index) => ({
      title: `Worked Example ${index + 1}`,
      explanation: ensureSentence(item),
    })) ??
    [
      {
        title: "Worked Example 1",
        explanation: `Use one clear example to explain the meaning of ${topic} and why it fits the lesson.`,
      },
      {
        title: "Worked Example 2",
        explanation: `Use a second everyday example so the learner sees how ${topic} works in real life.`,
      },
    ];

  const realWorldExamples =
    topicBlueprint?.real_world_examples?.slice(0, 4).map((item) => ensureSentence(item.charAt(0).toUpperCase() + item.slice(1))) ??
    [
      ensureSentence(`${topic} can be seen in daily life at home, school, or in the community`),
      ensureSentence(`Learners should notice how ${topic} affects everyday activities around them`),
    ];

  let practiceQuestions: LessonNoteQuestion[] = buildGenericQuestions(topic, subject);

  if (subject === "Basic Science" && topic.toLowerCase() === "air") {
    practiceQuestions = [
      {
        question: "What is air?",
        difficulty: "easy",
        answer_hint: "Air is the invisible substance all around us.",
      },
      {
        question: "Give two ways we know that air is present even though we cannot see it.",
        difficulty: "medium",
        answer_hint: "Examples include a balloon filling up, wind moving leaves, breathing, or a fan blowing.",
      },
      {
        question: "Why is air important to people, animals, and plants?",
        difficulty: "medium",
        answer_hint: "They need air to live and grow.",
      },
      {
        question: "What would happen if there was no air?",
        difficulty: "hard",
        answer_hint: "Living things would not survive and many activities would stop.",
      },
    ];
  }

  if (subject === "Social Studies" && topic.toLowerCase() === "transportation") {
    practiceQuestions = [
      {
        question: "What is transportation?",
        difficulty: "easy",
        answer_hint: "Transportation is the movement of people or goods from one place to another.",
      },
      {
        question: "Name the three main types of transportation.",
        difficulty: "easy",
        answer_hint: "Land, water, and air transportation.",
      },
      {
        question: "Give two reasons why transportation is important in the community.",
        difficulty: "medium",
        answer_hint: "It helps people travel, trade, go to school, visit the hospital, and move goods.",
      },
      {
        question: "Why should people obey transport and road safety rules?",
        difficulty: "hard",
        answer_hint: "Safety rules help prevent accidents and protect lives.",
      },
    ];
  }

  if (subject === "English Language" && topic.toLowerCase() === "parts of speech") {
    practiceQuestions = [
      {
        question: "What are parts of speech?",
        difficulty: "easy",
        answer_hint: "They are the different jobs words do in a sentence.",
      },
      {
        question: "Write one example each of a noun and a verb.",
        difficulty: "easy",
        answer_hint: "A noun names a person, place, animal, or thing, while a verb shows action or state.",
      },
      {
        question: "Why are parts of speech important in speaking and writing?",
        difficulty: "medium",
        answer_hint: "They help us form correct and meaningful sentences.",
      },
      {
        question: "Can one word do different jobs in different sentences? Explain with an example.",
        difficulty: "hard",
        answer_hint: "Yes. The same word can change function depending on how it is used in a sentence.",
      },
    ];
  }

  const learningChecks = [
    `Can the learner explain ${topic} in their own words?`,
    `Can the learner give at least one correct example of ${topic}?`,
    `Can the learner say why ${topic} is important in daily life?`,
  ];

  return {
    title: `${subject}: ${topic}`,
    lesson_summary: summary,
    explanation,
    key_points: keyPoints,
    worked_examples: workedExamples,
    real_world_examples: realWorldExamples,
    practice_questions: practiceQuestions,
    learning_checks: learningChecks,
    instructional_materials: buildInstructionalMaterials(subject, topic, input.grade),
  };
}

export function buildLocalLessonPlan(input: GenerateEdvouraInput) {
  const subject = normalizeSubjectName(input.subject);
  const topic = input.topic.trim();
  const lessonNote = buildLocalLessonNote(input);

  return {
    title: `${subject}: ${topic} Lesson Plan`,
    lesson_objectives: [
      `By the end of the lesson, learners should be able to define ${topic}.`,
      `By the end of the lesson, learners should be able to give correct examples related to ${topic}.`,
      `By the end of the lesson, learners should be able to explain why ${topic} is important.`,
    ],
    prior_knowledge: `Learners should already have simple everyday experiences connected to ${topic}.`,
    teacher_preparation: `Review the topic carefully, prepare pictures or charts about ${topic}, and select familiar examples the learners can understand.`,
    instructional_materials: lessonNote.instructional_materials,
    lesson_stages: [
      {
        stage_title: "Introduction / Set Induction",
        duration_minutes: 5,
        teacher_activity: `Ask simple opening questions to connect ${topic} to learners' daily life.`,
        student_activity: "Answer opening questions and share what they already know.",
        assessment_check: `Ask two pupils to say what they think ${topic} means.`,
      },
      {
        stage_title: "Presentation",
        duration_minutes: 10,
        teacher_activity: "Explain the topic clearly using charts, pictures, and direct examples.",
        student_activity: "Listen carefully, observe materials, and respond to guided questions.",
        assessment_check: "Check whether learners can repeat the main idea correctly.",
      },
      {
        stage_title: "Guided Practice",
        duration_minutes: 10,
        teacher_activity: "Lead pupils through two worked examples step by step.",
        student_activity: "Take part in guided examples and answer short oral questions.",
        assessment_check: "Observe whether learners can identify correct examples.",
      },
      {
        stage_title: "Independent Practice / Evaluation",
        duration_minutes: 10,
        teacher_activity: "Give short written or oral practice questions and guide correction.",
        student_activity: "Answer questions independently or in pairs.",
        assessment_check: "Use the evaluation questions to confirm understanding.",
      },
    ],
    evaluation_questions: lessonNote.practice_questions.map((item) => item.question).slice(0, 4),
    assignment: `Write short answers to two questions about ${topic} and give one real-life example.`,
    differentiation_strategies: [
      "Support slower learners with pictures, repetition, and oral prompts.",
      "Challenge faster learners to explain the topic in full sentences or compare two examples.",
    ],
    teacher_notes: "Keep the lesson practical, interactive, and closely connected to real life.",
  };
}
