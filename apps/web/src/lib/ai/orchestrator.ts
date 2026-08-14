/**
 * EDVOURA AI ENGINE - LLM Orchestrator
 *
 * This is the brain. It:
 * 1. Accepts a generation request (type + curriculum context)
 * 2. Assembles the prompt from the prompt templates
 * 3. Calls the LLM via OpenRouter first, then Gemini fallback
 * 4. Validates the response with the Zod schema
 * 5. Retries if validation fails (up to MAX_RETRIES)
 * 6. Returns clean, validated data or throws a structured error
 */

import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

import {
  type ContentType,
  getSchemaForType,
  StudentAnalysisSchema,
  ParentReportSchema,
  LessonExplainerSchema,
} from './schemas';
import {
  SYSTEM_IDENTITY,
  buildGenerationPrompt,
  buildStudentAnalysisPrompt,
  buildParentReportPrompt,
  buildLessonExplainerPrompt,
} from './prompts';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL ?? 'meta-llama/llama-3.1-70b-instruct';
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';
const MAX_RETRIES = 3;
const OPENROUTER_MODEL_CANDIDATES = [
  DEFAULT_MODEL,
  'meta-llama/llama-3.1-70b-instruct',
  'mistralai/mistral-large',
  'anthropic/claude-3.5-sonnet',
];
const blockedOpenRouterKeys = new Set<string>();

const isOpenRouterAuthError = (message: string) =>
  /user not found|invalid api key|unauthorized|401|403/i.test(message);

function createOpenRouterClient(apiKey: string) {
  return createOpenAI({
    baseURL: OPENROUTER_BASE_URL,
    apiKey,
  });
}

function getOpenRouterKeys() {
  const numberedKeys = Object.entries(process.env)
    .filter(([name, value]) => /^OPENROUTER_KEY_\d+$/.test(name) && typeof value === 'string' && value.trim())
    .sort(([left], [right]) => {
      const leftNumber = Number.parseInt(left.replace('OPENROUTER_KEY_', ''), 10);
      const rightNumber = Number.parseInt(right.replace('OPENROUTER_KEY_', ''), 10);
      return leftNumber - rightNumber;
    })
    .map(([, value]) => value!.trim());

  const primaryKeys = [process.env.OPENROUTER_API_KEY, process.env.OPENAI_API_KEY]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .map((value) => value.trim());

  return [...new Set([...primaryKeys, ...numberedKeys])].filter((key) => !blockedOpenRouterKeys.has(key));
}

function getOpenRouterModels() {
  const envModels = [process.env.OPENROUTER_MODEL_FALLBACKS]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .flatMap((value) => value.split(',').map((entry) => entry.trim()).filter(Boolean));

  return [...new Set([...OPENROUTER_MODEL_CANDIDATES, ...envModels])];
}

function getGeminiKeys() {
  const numberedKeys = Object.entries(process.env)
    .filter(([name, value]) => /^GEMINI_API_KEY_\d+$/.test(name) && typeof value === 'string' && value.trim())
    .sort(([left], [right]) => {
      const leftNumber = Number.parseInt(left.replace('GEMINI_API_KEY_', ''), 10);
      const rightNumber = Number.parseInt(right.replace('GEMINI_API_KEY_', ''), 10);
      return leftNumber - rightNumber;
    })
    .map(([, value]) => value!.trim());

  const primaryKeys = [process.env.GEMINI_API_KEY]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .map((value) => value.trim());

  return [...new Set([...primaryKeys, ...numberedKeys])];
}

/**
 * Strips markdown fences and extracts the first valid JSON object/array.
 */
export function extractJsonPayload(text: string) {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const firstObject = cleaned.indexOf('{');
    const lastObject = cleaned.lastIndexOf('}');

    if (firstObject >= 0 && lastObject > firstObject) {
      return JSON.parse(cleaned.slice(firstObject, lastObject + 1));
    }

    const firstArray = cleaned.indexOf('[');
    const lastArray = cleaned.lastIndexOf(']');

    if (firstArray >= 0 && lastArray > firstArray) {
      return JSON.parse(cleaned.slice(firstArray, lastArray + 1));
    }

    throw new Error('Model returned invalid JSON');
  }
}

function cleanAndParse(text: string, schema: z.ZodTypeAny) {
  const parsed = extractJsonPayload(text);
  return schema.parse(parsed);
}

async function tryOpenRouterText(prompt: string, temperature: number) {
  const keys = getOpenRouterKeys();
  const models = getOpenRouterModels();
  const failures: string[] = [];

  for (const [index, key] of keys.entries()) {
    let authFailureCountForKey = 0;
    for (const modelName of models) {
      try {
        const openrouter = createOpenRouterClient(key);
        const { text } = await generateText({
          model: openrouter(modelName),
          system: SYSTEM_IDENTITY,
          prompt,
          temperature,
        });

        return { text, provider: `openrouter:${index + 1}:${modelName}` };
      } catch (error: unknown) {
        const failure = error instanceof Error ? error.message : String(error);
        failures.push(`key_${index + 1}/${modelName}: ${failure}`);
        if (isOpenRouterAuthError(failure)) {
          authFailureCountForKey += 1;
        }
        console.warn(`[AI Orchestrator] OpenRouter key ${index + 1} model ${modelName} failed.`, failure);
      }
    }

    if (authFailureCountForKey >= models.length) {
      blockedOpenRouterKeys.add(key);
    }
  }

  if (failures.length > 0) {
    throw new Error(`OpenRouter failed across all keys/models: ${failures.slice(0, 6).join(' | ')}`);
  }

  throw new Error('No valid OpenRouter keys configured');
}

function buildEmergencyEducationalContent(params: {
  contentType: ContentType;
  topic: string;
  subject: string;
  gradeLevel: string;
}) {
  const baseTopic = params.topic.trim() || 'Core Concept';
  const subject = params.subject.trim() || 'General Science';
  const grade = params.gradeLevel.trim() || 'Grade 3';
  const topicLower = baseTopic.toLowerCase();
  const subjectLower = subject.toLowerCase();

  if (params.contentType === 'story') {
    // 1. Lion / Wildlife / Fable topics (e.g. The Great Lion)
    if (topicLower.includes('lion') || topicLower.includes('animal') || topicLower.includes('king') || topicLower.includes('beast') || topicLower.includes('forest') || topicLower.includes('savanna')) {
      return {
        title: `${baseTopic}: Sovereign of the Savanna`,
        moralLesson: 'True leadership and strength come from wisdom, fairness, and protecting others.',
        ageSuitability: '7-14',
        content: `High above the sun-drenched golden plains of the Serengeti, Kibo the Great Lion stood atop Pride Rock. His mane shone like spun amber under the tropical sun, and his deep roar echoed across the valley, reminding every creature that peace reigned in his realm.\n\nUnlike fierce hunters who relied only on sharp claws, Kibo was known for his wisdom. When a terrible drought dried up the riverbed, the smaller animals gathered at his feet in fear. "Great Lion," chirped Maya the weaver bird, "the waterhole is gone! Where shall we drink?"\n\nKibo lowered his massive head gently. Instead of hoarding the last shaded spring for himself, he led the elephant herds, gazelles, and birds across the rocky ridge to a secret underground oasis hidden beneath ancient baobab trees. He waited until the smallest cub had drunk its fill before taking a single lap of water himself.\n\nThrough patience and selflessness, Kibo proved that a true king does not rule by fear, but by protecting those in his care. From that day on, animals across the world remembered Kibo not just as the strongest lion on Earth, but as the wisest ruler the savanna had ever known.`,
        vocabulary: [
          { word: 'Sovereign', meaning: 'A supreme ruler or king with royal authority.' },
          { word: 'Baobab', meaning: 'A large ancient tree with a thick trunk that stores water.' },
          { word: 'Oasis', meaning: 'A fertile spot in a dry region where water is found.' },
          { word: 'Selflessness', meaning: 'Putting the needs and safety of others before your own.' },
        ],
      };
    }

    // 2. Science / Nature / Air / Environmental topics
    if (subjectLower.includes('science') || topicLower.includes('air') || topicLower.includes('wind') || topicLower.includes('water') || topicLower.includes('sun') || topicLower.includes('earth')) {
      return {
        title: `The Journey of the Invisible Wind: A Tale of ${baseTopic}`,
        moralLesson: 'Even unseen forces carry immense power and sustain all living things.',
        ageSuitability: '7-14',
        content: `Once upon a time, high in the atmosphere, Zephyr the Wind looked down at the bustling blue planet below. Though no human eyes could see him, Zephyr moved with extraordinary grace and power. He swirled around tall mountain peaks, filled the sails of ships on the ocean, and rustled the canopy of green rainforests.\n\nOne warm afternoon, the Sun smiled down and teased, "Little Wind, you are invisible! How do the children even know you exist?" Zephyr chuckled gently. He swept down into a green meadow where young Maya was holding a colorful kite. With a firm puff, Zephyr lifted the kite high into the clouds, spinning it in joyful circles.\n\nThen, Zephyr blew past giant wind turbines, spinning their blades to generate clean electricity that lit up cities across the world. He swept across hot valleys, bringing fresh oxygen to resting animals. "You see," Zephyr called up to the Sun, "I do not need to be seen to make a difference. Life thrives because I carry breath, energy, and freshness to every corner of Earth."`,
        vocabulary: [
          { word: 'Atmosphere', meaning: 'The envelope of gases surrounding the Earth.' },
          { word: 'Turbine', meaning: 'A machine with revolving blades driven by air or fluid to produce energy.' },
          { word: 'Invisible', meaning: 'Impossible to see with the human eye.' },
          { word: 'Respiration', meaning: 'The process of living organisms taking in oxygen to release energy.' },
        ],
      };
    }

    // 3. Global Universal Fable Fallback
    return {
      title: `${baseTopic}: An International Educational Fable`,
      moralLesson: 'Curiosity, perseverance, and teamwork unlock extraordinary achievements.',
      ageSuitability: '7-14',
      content: `Deep within the valley of Harmony, young Zuri embarked on a quest to discover the secret of ${baseTopic}. Accompanied by her clever owl companion, Barnaby, she traversed mountain trails, crossed rushing rivers, and examined ancient tablets.\n\nWhenever obstacles seemed insurmountable, Zuri stopped to observe, ask thoughtful questions, and test new methods. By breaking big challenges into smaller discoveries, she transformed confusion into mastery.\n\nWhen Zuri finally reached the summit, she realized that the knowledge of ${baseTopic} was a gift meant to be shared with learners across the globe.`,
      vocabulary: [
        { word: 'Perseverance', meaning: 'Continued effort to achieve something despite difficulties.' },
        { word: 'Insurmountable', meaning: 'Too great to be overcome.' },
        { word: 'Traverse', meaning: 'To travel across or through a region.' },
      ],
    };
  }

  if (params.contentType === 'lesson_note') {
    if (topicLower.includes('air') || subjectLower.includes('science')) {
      return {
        topic: baseTopic,
        objectives: [
          `Define Air and explain its chemical composition (Nitrogen 78%, Oxygen 21%, Carbon Dioxide 0.04%, Noble Gases).`,
          `Identify key physical properties of Air (occupies space, has mass/weight, exerts pressure, supports combustion).`,
          `Demonstrate simple experiments showing atmospheric pressure and combustion requirements.`,
        ],
        explanation: `Air is a mixture of invisible gases surrounding the Earth, forming our atmosphere.\n\n1. Composition of Air:\n- Nitrogen (~78%): The most abundant gas, essential for plant growth and soil fertility.\n- Oxygen (~21%): Vital for respiration in humans and animals, and necessary for burning (combustion).\n- Carbon Dioxide (~0.04%): Used by green plants during photosynthesis to prepare food.\n- Water Vapor & Noble Gases: Maintain atmospheric humidity and global weather patterns.\n\n2. Key Physical Properties of Air:\n- Air Occupies Space: Blowing air into a balloon causes it to expand because air molecules fill the interior volume.\n- Air Has Weight/Mass: An inflated ball weighs slightly more than a deflated ball.\n- Air Exerts Pressure: Air presses down on objects in all directions. Atmospheric pressure allows liquids to move up straws when sucked.\n- Air Supports Combustion: Fire requires oxygen from the air to burn.\n\n3. Practical Classroom Experiment:\nInvert a glass over a lit candle inside a water dish. As oxygen is consumed by the flame, the candle goes out and water rises inside the glass to replace the consumed gas!`,
        examples: [
          {
            context: 'Demonstrating atmospheric pressure using a drinking straw.',
            solution: 'Sucking air out of a straw lowers internal pressure; atmospheric pressure outside pushes liquid up into your mouth.',
          },
          {
            context: 'Combustion check: Why covering a burning candle with a jar extinguishes the flame.',
            solution: 'The flame consumes oxygen trapped inside the jar. Once oxygen drops below the combustion threshold, the fire extinguishes.',
          },
        ],
        practiceQuestions: [
          { question: 'What is the most abundant gas in Earth atmosphere?', answer: 'Nitrogen (approximately 78%).', difficulty: 'easy' as const },
          { question: 'Which gas in the air is essential for respiration and burning?', answer: 'Oxygen (approximately 21%).', difficulty: 'easy' as const },
          { question: 'Explain how blowing up a balloon proves that air occupies space.', answer: 'Air molecules pushed inside force the elastic rubber to stretch and expand.', difficulty: 'medium' as const },
          { question: 'Why does a candle flame extinguish when covered with a sealed glass jar?', answer: 'Combustion requires oxygen. Once trapped oxygen is consumed, burning stops.', difficulty: 'hard' as const },
        ],
        teacherNotes: 'Bring balloons, straws, glass jars, and candles for hands-on interactive demonstrations.',
      };
    }
  }

  if (params.contentType === 'spelling_bee') {
    return {
      title: `${subject} ${grade}: ${baseTopic} International Spelling Bee`,
      instructions: 'Spell each word accurately, state its definition, and use it in a complete sentence.',
      theme: baseTopic,
      words: [
        { word: 'atmosphere', pronunciation: 'AT-muh-sfeer', syllables: 3, definition: 'The envelope of gases surrounding Earth.', exampleSentence: 'The atmosphere protects Earth from solar radiation.', hint: 'Starts with atmo', difficulty: 'easy' as const },
        { word: 'oxygen', pronunciation: 'OK-suh-jun', syllables: 3, definition: 'A gas essential for respiration and burning.', exampleSentence: 'Plants release oxygen into the air during photosynthesis.', hint: 'Contains x-y-g', difficulty: 'easy' as const },
        { word: 'nitrogen', pronunciation: 'NY-truh-jun', syllables: 3, definition: 'The most abundant gas in Earth atmosphere.', exampleSentence: 'Nitrogen makes up nearly 78 percent of the air we breathe.', hint: 'Starts with nitro', difficulty: 'medium' as const },
        { word: 'pressure', pronunciation: 'PRESH-er', syllables: 2, definition: 'The continuous force exerted on a surface.', exampleSentence: 'Air pressure decreases as you climb high mountains.', hint: 'Double s in middle', difficulty: 'medium' as const },
        { word: 'combustion', pronunciation: 'kum-BUS-chun', syllables: 3, definition: 'The process of burning something in oxygen.', exampleSentence: 'Combustion requires oxygen, heat, and fuel.', hint: 'Ends with tion', difficulty: 'hard' as const },
      ],
    };
  }

  if (topicLower.includes('subtraction') || topicLower.includes('math') || subjectLower.includes('math')) {
    const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    const makeChoices = (correct: number) => {
      const set = new Set<number>([correct]);
      while (set.size < 4) {
        const offset = rand(-6, 8);
        const val = correct + offset;
        if (val >= 0 && val !== correct) set.add(val);
      }
      return Array.from(set).sort(() => Math.random() - 0.5).map(String);
    };

    const a1 = rand(15, 45), b1 = rand(4, a1 - 2), ans1 = a1 - b1;
    const a2 = rand(40, 99), b2 = rand(12, a2 - 6), ans2 = a2 - b2;
    const a3 = rand(60, 150), b3 = rand(15, a3 - 10), ans3 = a3 - b3;
    const a4 = rand(22, 75), b4 = rand(6, a4 - 5), ans4 = a4 - b4;

    const studentNames = ['Zuri', 'Kai', 'Amara', 'Titomi', 'Leo', 'Ethan', 'Maya', 'Kibo', 'Nia', 'Liam'];
    const name1 = studentNames[rand(0, studentNames.length - 1)];
    const name2 = studentNames[(rand(0, studentNames.length - 1) + 1) % studentNames.length];

    return {
      title: `${subject} ${grade}: ${baseTopic} Dynamic Practice Quiz`,
      instructions: 'Solve each math problem carefully. Calculate your answer and choose or write the correct response.',
      questions: [
        {
          questionText: `What is the result of ${a1} - ${b1}?`,
          questionType: 'multiple_choice' as const,
          options: makeChoices(ans1),
          correctAnswer: String(ans1),
          explanation: `Subtract ${b1} from ${a1}: ${a1} - ${b1} = ${ans1}.`,
          difficulty: 'easy' as const,
        },
        {
          questionText: `In the subtraction equation ${a2} - ${b2} = ${ans2}, what is the starting number ${a2} called?`,
          questionType: 'multiple_choice' as const,
          options: ['Minuend', 'Subtrahend', 'Difference', 'Product'],
          correctAnswer: 'Minuend',
          explanation: `In subtraction (${a2} - ${b2} = ${ans2}), the starting number (${a2}) is called the minuend.`,
          difficulty: 'easy' as const,
        },
        {
          questionText: `What is the difference between ${a3} and ${b3}?`,
          questionType: 'multiple_choice' as const,
          options: makeChoices(ans3),
          correctAnswer: String(ans3),
          explanation: `Subtract ${b3} from ${a3}: ${a3} - ${b3} = ${ans3}.`,
          difficulty: 'easy' as const,
        },
        {
          questionText: `If ${name1} has ${a4} pencils and gives ${b4} pencils to ${name2}, how many pencils does ${name1} have remaining?`,
          questionType: 'multiple_choice' as const,
          options: makeChoices(ans4),
          correctAnswer: String(ans4),
          explanation: `${a4} - ${b4} = ${ans4} pencils remaining.`,
          difficulty: 'medium' as const,
        },
        {
          questionText: `Complete the missing number: ${a1 + 25} - ___ = ${a1 + 25 - b1}.`,
          questionType: 'fill_in_blank' as const,
          correctAnswer: String(b1),
          explanation: `Subtract ${a1 + 25 - b1} from ${a1 + 25}: ${a1 + 25} - ${a1 + 25 - b1} = ${b1}.`,
          difficulty: 'medium' as const,
        },
        {
          questionText: 'True or False: Subtraction is commutative, meaning a - b is always equal to b - a.',
          questionType: 'true_false' as const,
          correctAnswer: 'False',
          explanation: 'Subtraction is not commutative. Changing the order changes the result.',
          difficulty: 'medium' as const,
        },
        {
          questionText: 'What term describes the result obtained after subtracting one number from another?',
          questionType: 'short_answer' as const,
          correctAnswer: 'Difference',
          explanation: 'The answer to a subtraction problem is called the difference.',
          difficulty: 'medium' as const,
        },
        {
          questionText: `Solve: ${a3 + 12} - ${b3 + 7}.`,
          questionType: 'multiple_choice' as const,
          options: makeChoices((a3 + 12) - (b3 + 7)),
          correctAnswer: String((a3 + 12) - (b3 + 7)),
          explanation: `${a3 + 12} - ${b3 + 7} = ${(a3 + 12) - (b3 + 7)}.`,
          difficulty: 'hard' as const,
        },
        {
          questionText: `What is the value of any number n minus 0 (n - 0)?`,
          questionType: 'short_answer' as const,
          correctAnswer: 'n',
          explanation: 'Subtracting zero from any number leaves the number unchanged.',
          difficulty: 'hard' as const,
        },
        {
          questionText: `Solve: ${a2 + 20} - ${b2 + 10}.`,
          questionType: 'multiple_choice' as const,
          options: makeChoices((a2 + 20) - (b2 + 10)),
          correctAnswer: String((a2 + 20) - (b2 + 10)),
          explanation: `${a2 + 20} - ${b2 + 10} = ${(a2 + 20) - (b2 + 10)}.`,
          difficulty: 'hard' as const,
        },
      ],
    };
  }

  if (subjectLower.includes('science') || topicLower.includes('air') || topicLower.includes('biology') || topicLower.includes('physics') || topicLower.includes('chemistry')) {
    return {
      title: `${subject} ${grade}: ${baseTopic} Science Challenge Quiz`,
      instructions: 'Answer each scientific question carefully. Select or write the correct option.',
      questions: [
        {
          questionText: 'What is the approximate percentage of Oxygen in Earth\'s atmosphere?',
          questionType: 'multiple_choice' as const,
          options: ['78%', '21%', '0.04%', '1%'],
          correctAnswer: '21%',
          explanation: 'Oxygen makes up approximately 21% of atmospheric gas composition.',
          difficulty: 'easy' as const,
        },
        {
          questionText: 'Which gas is the most abundant in Earth\'s atmosphere?',
          questionType: 'multiple_choice' as const,
          options: ['Nitrogen', 'Oxygen', 'Carbon Dioxide', 'Hydrogen'],
          correctAnswer: 'Nitrogen',
          explanation: 'Nitrogen accounts for nearly 78% of the air surrounding Earth.',
          difficulty: 'easy' as const,
        },
        {
          questionText: 'What property of air is proven when blowing air into a rubber balloon makes it expand?',
          questionType: 'multiple_choice' as const,
          options: ['Air has weight', 'Air occupies space', 'Air is cold', 'Air is invisible'],
          correctAnswer: 'Air occupies space',
          explanation: 'Air molecules take up interior space, pushing out the balloon walls.',
          difficulty: 'easy' as const,
        },
        {
          questionText: 'True or False: Combustion (burning) requires oxygen gas from the air.',
          questionType: 'true_false' as const,
          correctAnswer: 'True',
          explanation: 'Fire cannot burn without oxygen gas.',
          difficulty: 'easy' as const,
        },
        {
          questionText: 'Which gas do green plants absorb from the air during photosynthesis?',
          questionType: 'multiple_choice' as const,
          options: ['Carbon Dioxide', 'Oxygen', 'Helium', 'Argon'],
          correctAnswer: 'Carbon Dioxide',
          explanation: 'Plants combine carbon dioxide and sunlight to manufacture food.',
          difficulty: 'medium' as const,
        },
        {
          questionText: 'What scientific instrument is used to measure atmospheric air pressure?',
          questionType: 'multiple_choice' as const,
          options: ['Barometer', 'Thermometer', 'Anemometer', 'Hygrometer'],
          correctAnswer: 'Barometer',
          explanation: 'A barometer measures atmospheric pressure.',
          difficulty: 'medium' as const,
        },
        {
          questionText: 'What biological process describes living organisms taking in oxygen to break down food and release energy?',
          questionType: 'short_answer' as const,
          correctAnswer: 'Respiration',
          explanation: 'Respiration is the cellular process of releasing energy using oxygen.',
          difficulty: 'medium' as const,
        },
        {
          questionText: 'True or False: Air exerts pressure equally in all directions.',
          questionType: 'true_false' as const,
          correctAnswer: 'True',
          explanation: 'Atmospheric pressure pushes on surfaces in all directions.',
          difficulty: 'hard' as const,
        },
        {
          questionText: 'Which component of air is responsible for forming clouds and precipitation?',
          questionType: 'multiple_choice' as const,
          options: ['Water Vapor', 'Nitrogen', 'Methane', 'Neon'],
          correctAnswer: 'Water Vapor',
          explanation: 'Water vapor condenses in the upper atmosphere to form clouds.',
          difficulty: 'hard' as const,
        },
        {
          questionText: 'Explain why covering a burning candle with a sealed glass jar puts out the flame.',
          questionType: 'short_answer' as const,
          correctAnswer: 'The flame consumes trapped oxygen. Once oxygen is exhausted, combustion stops.',
          explanation: 'Fire requires continuous oxygen supply to sustain burning.',
          difficulty: 'hard' as const,
        },
      ],
    };
  }

  if (subjectLower.includes('english') || subjectLower.includes('language') || subjectLower.includes('literacy') || subjectLower.includes('reading')) {
    return {
      title: `${subject} ${grade}: ${baseTopic} English Language Quiz`,
      instructions: 'Read each grammar and vocabulary question carefully. Choose the correct answer.',
      questions: [
        {
          questionText: 'What part of speech describes or modifies a noun (e.g., "majestic lion")?',
          questionType: 'multiple_choice' as const,
          options: ['Adjective', 'Verb', 'Adverb', 'Conjunction'],
          correctAnswer: 'Adjective',
          explanation: 'An adjective describes or gives more information about a noun.',
          difficulty: 'easy' as const,
        },
        {
          questionText: 'Identify the verb in the sentence: "The students completed the quiz enthusiastically."',
          questionType: 'multiple_choice' as const,
          options: ['students', 'completed', 'quiz', 'enthusiastically'],
          correctAnswer: 'completed',
          explanation: '"Completed" is the action verb performed by the subject.',
          difficulty: 'easy' as const,
        },
        {
          questionText: 'What figure of speech compares two different things using "like" or "as"?',
          questionType: 'multiple_choice' as const,
          options: ['Simile', 'Metaphor', 'Personification', 'Alliteration'],
          correctAnswer: 'Simile',
          explanation: 'A simile compares two things using "like" or "as" (e.g., "brave as a lion").',
          difficulty: 'easy' as const,
        },
        {
          questionText: 'True or False: A synonym is a word that means the exact opposite of another word.',
          questionType: 'true_false' as const,
          correctAnswer: 'False',
          explanation: 'An antonym means the opposite; a synonym has a similar or identical meaning.',
          difficulty: 'medium' as const,
        },
        {
          questionText: 'What is the antonym of the word "courageous"?',
          questionType: 'multiple_choice' as const,
          options: ['Brave', 'Fearful', 'Strong', 'Wise'],
          correctAnswer: 'Fearful',
          explanation: '"Fearful" or "cowardly" is the opposite of "courageous".',
          difficulty: 'medium' as const,
        },
        {
          questionText: 'Which word is spelled correctly?',
          questionType: 'multiple_choice' as const,
          options: ['Receive', 'Recieve', 'Receeve', 'Recive'],
          correctAnswer: 'Receive',
          explanation: 'Remember the rule: "i before e except after c" — Receive.',
          difficulty: 'medium' as const,
        },
        {
          questionText: 'What is the plural form of the noun "child"?',
          questionType: 'short_answer' as const,
          correctAnswer: 'Children',
          explanation: 'The irregular plural of child is children.',
          difficulty: 'medium' as const,
        },
        {
          questionText: 'True or False: A proper noun must always begin with a capital letter.',
          questionType: 'true_false' as const,
          correctAnswer: 'True',
          explanation: 'Names of specific people, places, and organizations are proper nouns and must be capitalized.',
          difficulty: 'hard' as const,
        },
        {
          questionText: 'What punctuation mark belongs at the end of an interrogative sentence?',
          questionType: 'multiple_choice' as const,
          options: ['Question Mark (?)', 'Period (.)', 'Exclamation Point (!)', 'Comma (,)'],
          correctAnswer: 'Question Mark (?)',
          explanation: 'An interrogative sentence asks a question and ends with a question mark.',
          difficulty: 'hard' as const,
        },
        {
          questionText: 'Complete the sentence with the correct pronoun: "Zuri and ___ walked to the library."',
          questionType: 'multiple_choice' as const,
          options: ['I', 'me', 'him', 'us'],
          correctAnswer: 'I',
          explanation: '"Zuri and I" is the compound subject of the verb "walked".',
          difficulty: 'hard' as const,
        },
      ],
    };
  }

  return {
    title: `${subject} ${grade}: ${baseTopic} Global Master Quiz`,
    instructions: 'Answer each question carefully. Select or write the correct option.',
    questions: [
      {
        questionText: `Define ${baseTopic} and state its core scientific or mathematical principles.`,
        questionType: 'short_answer' as const,
        correctAnswer: `A fundamental concept in ${subject} dealing with core principles.`,
        explanation: 'State exact definitions and properties clearly.',
        difficulty: 'easy' as const,
      },
      {
        questionText: `Which of the following best describes ${baseTopic}?`,
        questionType: 'multiple_choice' as const,
        options: [`Core concept in ${subject}`, 'Unrelated phenomenon', 'Irrelevant theory', 'Temporary placeholder'],
        correctAnswer: `Core concept in ${subject}`,
        explanation: 'The topic forms part of the core global curriculum.',
        difficulty: 'easy' as const,
      },
      {
        questionText: `True or False: ${baseTopic} has real-world applications across daily life and technology.`,
        questionType: 'true_false' as const,
        correctAnswer: 'True',
        explanation: 'Curriculum topics directly connect to observable real-world phenomena.',
        difficulty: 'easy' as const,
      },
      {
        questionText: `What is a key step when solving problems on ${baseTopic}?`,
        questionType: 'multiple_choice' as const,
        options: ['Break the problem into smaller steps', 'Guess the answer immediately', 'Skip intermediate calculations', 'Ignore definitions'],
        correctAnswer: 'Break the problem into smaller steps',
        explanation: 'Structured step-by-step problem solving leads to accurate results.',
        difficulty: 'medium' as const,
      },
      {
        questionText: `Complete: Learning ${baseTopic} helps students build ____ skills.`,
        questionType: 'fill_in_blank' as const,
        correctAnswer: 'critical thinking',
        explanation: 'Mastering core topics develops analytical and problem-solving abilities.',
        difficulty: 'medium' as const,
      },
      {
        questionText: `How can a student verify their answer when working on ${baseTopic}?`,
        questionType: 'short_answer' as const,
        correctAnswer: 'Re-check each step and substitute values back into the equation.',
        explanation: 'Verification confirms solution accuracy.',
        difficulty: 'medium' as const,
      },
      {
        questionText: `Which action should be taken if a common mistake occurs in ${baseTopic}?`,
        questionType: 'multiple_choice' as const,
        options: ['Identify the root cause and practice similar examples', 'Hide the mistake', 'Give up on the topic', 'Memorize without understanding'],
        correctAnswer: 'Identify the root cause and practice similar examples',
        explanation: 'Targeted practice corrects errors effectively.',
        difficulty: 'hard' as const,
      },
      {
        questionText: `True or False: ${baseTopic} requires active practice to achieve mastery.`,
        questionType: 'true_false' as const,
        correctAnswer: 'True',
        explanation: 'Consistent effort and practice lead to long-term mastery.',
        difficulty: 'hard' as const,
      },
    ],
  };
}

async function tryGeminiText(prompt: string) {
  const keys = getGeminiKeys();
  if (keys.length === 0) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const failures: string[] = [];

  for (const [index, key] of keys.entries()) {
    try {
      const genAI = new GoogleGenerativeAI(key);
      const geminiModel = genAI.getGenerativeModel({ model: GEMINI_MODEL });
      const result = await geminiModel.generateContent(`${SYSTEM_IDENTITY}\n\n${prompt}`);
      return { text: result.response.text(), provider: `gemini:${index + 1}:${GEMINI_MODEL}` };
    } catch (error: unknown) {
      const failure = error instanceof Error ? error.message : String(error);
      failures.push(`key_${index + 1}: ${failure}`);
      console.warn(`[AI Orchestrator] Gemini key ${index + 1} failed.`, failure);
    }
  }

  throw new Error(`Gemini failed across all configured keys: ${failures.slice(0, 6).join(' | ')}`);
}

async function generateValidatedWithFallback<TSchema extends z.ZodTypeAny>(options: {
  prompt: string;
  schema: TSchema;
  temperature: number;
  maxRetries?: number;
}) {
  const maxRetries = options.maxRetries ?? 1;
  const hasGeminiFallback = getGeminiKeys().length > 0;
  let lastError: Error | null = null;
  let lastOpenRouterError: string | null = null;
  let lastGeminiError: string | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const retryHint =
      attempt > 0
        ? `\n\nYour previous response was rejected. Return only valid JSON that matches the requested schema exactly. Attempt ${attempt + 1}/${maxRetries + 1}.`
        : '';
    const promptWithRetry = options.prompt + retryHint;

    try {
      const openRouterResult = await tryOpenRouterText(promptWithRetry, options.temperature);
      return {
        success: true as const,
        data: cleanAndParse(openRouterResult.text, options.schema),
        provider: openRouterResult.provider,
        attempts: attempt + 1,
      };
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error));
      lastOpenRouterError = lastError.message;
      console.warn('[AI Orchestrator] OpenRouter failed, trying Gemini...', lastError.message);
    }

    if (hasGeminiFallback) {
      try {
        const geminiResult = await tryGeminiText(promptWithRetry);
        return {
          success: true as const,
          data: cleanAndParse(geminiResult.text, options.schema),
          provider: geminiResult.provider,
          attempts: attempt + 1,
        };
      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error(String(error));
        lastGeminiError = lastError.message;
        console.error(`[AI Orchestrator] Attempt ${attempt + 1} failed:`, lastError.message);
      }
    } else {
      console.warn('[AI Orchestrator] Gemini fallback is disabled (no GEMINI_API_KEY configured).');
    }
  }

  const combinedError = [lastOpenRouterError ? `OpenRouter: ${lastOpenRouterError}` : null, lastGeminiError ? `Gemini: ${lastGeminiError}` : null]
    .filter(Boolean)
    .join(' | ');

  return {
    success: false as const,
    error:
      combinedError ||
      (lastError?.message ??
        'No valid OpenRouter provider keys found. Set OPENROUTER_API_KEY or OPENROUTER_KEY_* env vars.'),
    attempts: maxRetries + 1,
  };
}

export async function generateEducationalContent(params: {
  contentType: ContentType;
  topic: string;
  subject: string;
  gradeLevel: string;
  curriculumSystem: string;
  objectives?: string[];
  difficulty?: number;
  studentContext?: string;
}) {
  const schema = getSchemaForType(params.contentType);
  const userPrompt = buildGenerationPrompt(params);

  const result = await generateValidatedWithFallback({
    prompt: userPrompt,
    schema,
    temperature: 0.7,
    maxRetries: MAX_RETRIES,
  });

  if (!result.success) {
    const emergencyContent = buildEmergencyEducationalContent(params);
    const emergencyValidation = schema.safeParse(emergencyContent);

    if (emergencyValidation.success) {
      return {
        success: true as const,
        data: emergencyValidation.data,
        contentType: params.contentType,
        attempts: result.attempts,
        provider: 'fallback:local-template',
      };
    }

    return {
      success: false as const,
      error: result.error,
      contentType: params.contentType,
      attempts: result.attempts,
    };
  }

  return {
    success: true as const,
    data: result.data,
    contentType: params.contentType,
    attempts: result.attempts,
    provider: result.provider,
  };
}

export async function analyzeStudentPerformance(params: {
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
  const result = await generateValidatedWithFallback({
    prompt: buildStudentAnalysisPrompt(params),
    schema: StudentAnalysisSchema,
    temperature: 0.5,
  });

  if (!result.success) {
    return { success: false as const, error: result.error, attempts: result.attempts };
  }

  return { success: true as const, data: result.data, attempts: result.attempts, provider: result.provider };
}

export async function generateParentReport(params: {
  childName: string;
  reportPeriod: string;
  performanceSummary: string;
  highlights: string[];
  concerns: string[];
}) {
  const result = await generateValidatedWithFallback({
    prompt: buildParentReportPrompt(params),
    schema: ParentReportSchema,
    temperature: 0.6,
  });

  if (!result.success) {
    return { success: false as const, error: result.error, attempts: result.attempts };
  }

  return { success: true as const, data: result.data, attempts: result.attempts, provider: result.provider };
}

export async function explainLessonContent(params: {
  mode: 'simple' | 'harder_examples' | 'checks_for_understanding' | 'revision_notes';
  topic: string;
  subject: string;
  gradeLevel: string;
  lessonText: string;
}) {
  const result = await generateValidatedWithFallback({
    prompt: buildLessonExplainerPrompt(params),
    schema: LessonExplainerSchema,
    temperature: 0.55,
  });

  if (!result.success) {
    return { success: false as const, error: result.error, attempts: result.attempts };
  }

  return { success: true as const, data: result.data, attempts: result.attempts, provider: result.provider };
}

export async function generateFlashcards(params: {
  subject: string;
  topic: string;
  gradeLevel: string;
}) {
  const flashcardSchema = z.array(
    z.object({
      front: z.string().min(3),
      back: z.string().min(3),
    }),
  ).min(6);

  const prompt = `Generate 10 in-depth, highly practical educational flashcards for a ${params.gradeLevel} student.
Subject: ${params.subject}
Topic: ${params.topic}

CRITICAL RULES FOR FLASHCARDS (EVERY CARD MUST BE COMPREHENSIVE):
1. "front": A clear question, problem, formula challenge, or key term.
2. "back": MUST contain 3 distinct sections:
   📖 Definition: Precise academic definition.
   ✏️ Worked Example: A concrete step-by-step worked example, formula calculation, or real-world Nigerian application.
   💡 Memory Tip: Key trick or exam tip for tests/WAEC/BECE.

NEVER give plain 1-line definitions without worked examples!

Return ONLY a JSON array of objects with "front" and "back" keys.`;

  const result = await generateValidatedWithFallback({
    prompt,
    schema: flashcardSchema,
    temperature: 0.5,
  });

  if (!result.success) {
    return { success: false as const, error: result.error, attempts: result.attempts };
  }

  return { success: true as const, data: result.data, attempts: result.attempts, provider: result.provider };
}

export async function generateDirectTextWithFallback(options: {
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
}) {
  const systemPrompt = options.systemPrompt || SYSTEM_IDENTITY;
  const temperature = options.temperature ?? 0.7;

  // 1. Try OpenRouter
  try {
    const keys = getOpenRouterKeys();
    if (keys.length > 0) {
      const openRouterResult = await tryOpenRouterText(`${systemPrompt}\n\n${options.userPrompt}`, temperature);
      if (openRouterResult.text?.trim()) {
        return { success: true as const, text: openRouterResult.text.trim(), provider: openRouterResult.provider };
      }
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[AI Orchestrator] Direct text OpenRouter failed, trying Gemini...', msg);
  }

  // 2. Try Gemini
  try {
    const keys = getGeminiKeys();
    if (keys.length > 0) {
      const geminiResult = await tryGeminiText(`${systemPrompt}\n\n${options.userPrompt}`);
      if (geminiResult.text?.trim()) {
        return { success: true as const, text: geminiResult.text.trim(), provider: geminiResult.provider };
      }
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[AI Orchestrator] Direct text Gemini failed:', msg);
  }

  return { success: false as const, error: 'AI providers unavailable' };
}
