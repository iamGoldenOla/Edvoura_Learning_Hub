import { NextRequest, NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { z } from 'zod';
import { extractJsonPayload } from '@/lib/ai/orchestrator';

export const maxDuration = 30;

const PartSchema = z.object({
  name: z.string().default('Part'),
  geometry: z.enum([
    'box',
    'sphere',
    'cylinder',
    'cone',
    'torus',
    'octahedron',
    'dodecahedron',
    'ring',
    'plane',
  ]),
  args: z.array(z.number()).min(1).max(6),
  position: z.tuple([z.number(), z.number(), z.number()]).default([0, 0, 0]),
  rotation: z.tuple([z.number(), z.number(), z.number()]).default([0, 0, 0]),
  scale: z.tuple([z.number(), z.number(), z.number()]).optional(),
  color: z.string().default('#3b82f6'),
  emissive: z.string().optional(),
  opacity: z.number().min(0.1).max(1).optional(),
  roughness: z.number().min(0).max(1).optional(),
  metalness: z.number().min(0).max(1).optional(),
  wireframeEdges: z.boolean().optional(),
  animate: z.enum(['none', 'spinY', 'spinZ', 'spinX', 'bob', 'pulse']).optional(),
});

const StationSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  example: z.string().default(''),
  narration: z.string().default(''),
  color: z.string().default('#facc15'),
  position: z.tuple([z.number(), z.number(), z.number()]).optional(),
});

const BlueprintSchema = z.object({
  title: z.string(),
  category: z.string().default('AI 3D Model'),
  sceneType: z.enum(['object', 'concept-gallery']).default('object'),
  description: z.string(),
  narration: z.string(),
  facts: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
      }),
    )
    .min(1)
    .max(6),
  parts: z.array(PartSchema).min(1).max(40),
  stations: z.array(StationSchema).max(10).optional(),
});

export type AI3DBlueprint = z.infer<typeof BlueprintSchema>;

function getGeminiKeys(): string[] {
  const numbered = Object.entries(process.env)
    .filter(([k, v]) => /^GEMINI_API_KEY_\d+$/.test(k) && typeof v === 'string' && v.trim())
    .sort(([a], [b]) => Number(a.replace('GEMINI_API_KEY_', '')) - Number(b.replace('GEMINI_API_KEY_', '')))
    .map(([, v]) => v!.trim());
  const primary = [
    process.env.GEMINI_API_KEY,
    process.env.GOOGLE_AI_API_KEY,
    process.env.GOOGLE_API_KEY,
    process.env.VERTEX_API_KEY,
  ]
    .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
    .map((v) => v.trim());
  return [...new Set([...primary, ...numbered])];
}

function getOpenRouterKeys(): string[] {
  const numbered = Object.entries(process.env)
    .filter(([k, v]) => /^OPENROUTER_KEY_\d+$/.test(k) && typeof v === 'string' && v.trim())
    .sort(([a], [b]) => Number(a.replace('OPENROUTER_KEY_', '')) - Number(b.replace('OPENROUTER_KEY_', '')))
    .map(([, v]) => v!.trim());
  const primary = [process.env.OPENROUTER_API_KEY, process.env.OPENAI_API_KEY]
    .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
    .map((v) => v.trim());
  return [...new Set([...primary, ...numbered])];
}

function build3DPrompt(topic: string, gradeLevel: string): string {
  return `You are an expert Three.js 3D VR designer and K-12 educator for Edvoura Learning Hub.
Create an interactive 3D Virtual Reality learning experience for the topic: "${topic}" (level: ${gradeLevel}).

DECIDE THE BEST VR EXPERIENCE TYPE:
- If "${topic}" is a CONCEPTUAL, LANGUAGE, GRAMMAR, MATH RULE, HISTORY, SOCIAL STUDIES, OR PROCESS topic (examples: "Parts of Speech", "English Tenses", "Punctuation", "Fractions", "Photosynthesis", "Water Cycle", "Food Chain", "States of Matter", "Continents", "Multiplication Tables", "Human Rights", "Electricity"):
  Set "sceneType": "concept-gallery".
  Design a themed 3D centerpiece in "parts" AND create 5 to 8 rich interactive 3D learning cards in "stations" that will float in a 360° VR ring around the centerpiece! Each station MUST contain real educational content (clear title, kid-friendly definition in "subtitle", concrete example in "example", and a 2-sentence teacher audio script in "narration").
- If "${topic}" is a PHYSICAL OBJECT, SHAPE, ANIMAL, ORGAN, MACHINE, BUILDING, OR MOLECULE (examples: "Rectangle", "Car", "Elephant", "Human Brain", "Flower", "Windmill", "Microscope", "Traffic Light", "Bridge", "Guitar"):
  Set "sceneType": "object".
  Assemble a genuinely recognizable 3D model using 6 to 24 well-proportioned connected Three.js "parts" centered around [0, 0, 0] within -4 to +4 units, AND include 3 to 5 labeled "stations" explaining its main components!

Return ONLY raw valid JSON matching this exact schema (no markdown fences, no commentary):
{
  "title": "Short clear title",
  "category": "Subject area (e.g. English Grammar, Mathematics, Biology, Engineering, History)",
  "sceneType": "object | concept-gallery",
  "description": "2 concise kid-friendly sentences introducing the VR lesson.",
  "narration": "3-4 warm spoken teacher sentences introducing ${topic} for the pupil.",
  "facts": [
    { "label": "Key Concept", "value": "Short crisp answer" },
    { "label": "Key Concept 2", "value": "Short crisp answer" },
    { "label": "Key Concept 3", "value": "Short crisp answer" },
    { "label": "Key Concept 4", "value": "Short crisp answer" }
  ],
  "parts": [
    {
      "name": "Part name",
      "geometry": "box | sphere | cylinder | cone | torus | octahedron | dodecahedron | ring | plane",
      "args": [numbers matching Three.js constructor],
      "position": [x, y, z],
      "rotation": [rx, ry, rz],
      "scale": [sx, sy, sz],
      "color": "#hexcolor",
      "emissive": "#hexcolor (optional)",
      "opacity": 1,
      "roughness": 0.4,
      "metalness": 0.15,
      "wireframeEdges": false,
      "animate": "none | spinY | spinZ | spinX | bob | pulse"
    }
  ],
  "stations": [
    {
      "title": "Short Station Name (e.g. NOUN)",
      "subtitle": "Crisp definition (max 60 chars)",
      "example": "e.g. teacher, apple, Lagos",
      "narration": "2 engaging spoken sentences teaching this specific part with an example.",
      "color": "#hexcolor"
    }
  ]
}

THREE.JS GEOMETRY ARGS:
- "box": [width, height, depth]
- "sphere": [radius, 24, 24]
- "cylinder": [radiusTop, radiusBottom, height, 20]
- "cone": [radius, height, 20]
- "torus": [radius, tube, 16, 32]
- "octahedron": [radius, 0]
- "dodecahedron": [radius, 0]
- "ring": [innerRadius, outerRadius, 24]
- "plane": [width, height]

Output ONLY the JSON object.`;
}

function buildSmartFallback(topic: string): AI3DBlueprint {
  const q = topic.toLowerCase().trim();

  if (q.includes('part') && q.includes('speech') || q.includes('grammar') || q.includes('noun') || q.includes('verb')) {
    return {
      title: '3D Parts of Speech VR Gallery',
      category: 'English Language & Grammar',
      sceneType: 'concept-gallery',
      description: 'Explore all 8 Parts of Speech floating in a 360° Virtual Reality gallery! Click any glowing 3D station card to hear its rule and examples.',
      narration: 'Welcome to the 3D Parts of Speech Virtual Gallery! Every English word belongs to one of eight families: Nouns, Pronouns, Verbs, Adjectives, Adverbs, Prepositions, Conjunctions, and Interjections. Click any floating card around you to hear how it works!',
      facts: [
        { label: 'Total Families', value: '8 Parts of Speech' },
        { label: 'Naming Words', value: 'Nouns & Pronouns' },
        { label: 'Action Words', value: 'Verbs' },
        { label: 'Describing Words', value: 'Adjectives & Adverbs' },
      ],
      parts: [
        { name: 'Grammar Hub', geometry: 'sphere', args: [1.3, 28, 28], position: [0, 0, 0], rotation: [0, 0, 0], color: '#6366f1', emissive: '#4338ca', animate: 'pulse' },
        { name: 'Orbit Ring', geometry: 'torus', args: [2.2, 0.08, 16, 48], position: [0, 0, 0], rotation: [1.3, 0.2, 0], color: '#facc15', animate: 'spinY' },
      ],
      stations: [
        { title: 'NOUN', subtitle: 'Names a person, place, animal, or thing', example: 'Ex: teacher, Lagos, dog, book', narration: 'A Noun is a naming word for a person, place, animal, thing, or idea. For example: teacher, Lagos, puppy, and happiness!', color: '#3b82f6' },
        { title: 'VERB', subtitle: 'Shows an action or state of being', example: 'Ex: run, jump, write, sing, is', narration: 'A Verb is an action word that tells what the subject does! For example: The pupil runs, writes, and solves the puzzle.', color: '#ef4444' },
        { title: 'ADJECTIVE', subtitle: 'Describes or modifies a noun', example: 'Ex: bright, tall, blue, clever', narration: 'An Adjective describes a noun to make sentences colorful! For example: a bright star, a clever pupil, or a blue sky.', color: '#f59e0b' },
        { title: 'ADVERB', subtitle: 'Describes how, when, or where a verb happens', example: 'Ex: quickly, softly, yesterday', narration: 'An Adverb describes a verb, often ending in L-Y. For example: She read the story clearly and quickly.', color: '#10b981' },
        { title: 'PRONOUN', subtitle: 'Replaces a noun to avoid repetition', example: 'Ex: he, she, it, they, we', narration: 'A Pronoun takes the place of a noun so we do not repeat names. For example: Instead of saying Titomi smiled, we can say She smiled.', color: '#8b5cf6' },
        { title: 'PREPOSITION', subtitle: 'Shows position, direction, or time', example: 'Ex: on, under, inside, before', narration: 'A Preposition shows where or when something is! For example: The book is on the desk, and the cat is under the chair.', color: '#06b6d4' },
        { title: 'CONJUNCTION', subtitle: 'Joins words, phrases, or sentences', example: 'Ex: and, but, because, or', narration: 'A Conjunction is a bridge word that joins ideas together, like and, but, or, and because!', color: '#ec4899' },
        { title: 'INTERJECTION', subtitle: 'Expresses sudden strong emotion', example: 'Ex: Wow! Hooray! Ouch!', narration: 'An Interjection expresses sudden excitement or feeling, usually with an exclamation mark! Like Wow! or Hooray!', color: '#facc15' },
      ],
    };
  }

  if (q.includes('water cycle') || q.includes('evaporation') || q.includes('precipitation')) {
    return {
      title: '3D Water Cycle VR World',
      category: 'Earth Science & Geography',
      sceneType: 'concept-gallery',
      description: 'Journey through Evaporation, Condensation, Precipitation, and Collection in an interactive 3D VR water cycle!',
      narration: 'Welcome to the 3D Water Cycle! Powered by heat from the Sun, Earth constantly recycles water from oceans to clouds, back down as rain, and into rivers again.',
      facts: [
        { label: 'Energy Source', value: 'The Sun' },
        { label: 'Stage 1', value: 'Evaporation' },
        { label: 'Stage 2', value: 'Condensation' },
        { label: 'Stage 3', value: 'Precipitation' },
      ],
      parts: [
        { name: 'Sun', geometry: 'sphere', args: [1.1, 24, 24], position: [-2.2, 2.2, 0], rotation: [0, 0, 0], color: '#facc15', emissive: '#f59e0b', animate: 'pulse' },
        { name: 'Ocean Base', geometry: 'cylinder', args: [3.2, 3.2, 0.5, 32], position: [0, -1.8, 0], rotation: [0, 0, 0], color: '#0284c7' },
        { name: 'Mountain', geometry: 'cone', args: [1.5, 2.6, 6], position: [1.4, -0.3, -0.4], rotation: [0, 0, 0], color: '#78716c' },
        { name: 'Cloud 1', geometry: 'sphere', args: [0.9, 20, 20], position: [0.8, 2.0, 0], rotation: [0, 0, 0], color: '#e2e8f0', animate: 'bob' },
        { name: 'Cloud 2', geometry: 'sphere', args: [0.7, 20, 20], position: [1.6, 1.9, 0.2], rotation: [0, 0, 0], color: '#cbd5e1', animate: 'bob' },
      ],
      stations: [
        { title: '1. EVAPORATION', subtitle: 'Sun heats water into invisible vapor', example: 'Oceans & lakes rise into the sky', narration: 'Evaporation happens when the warm Sun heats liquid water in rivers and oceans, turning it into invisible water vapor that rises into the air.', color: '#f59e0b' },
        { title: '2. CONDENSATION', subtitle: 'Vapor cools high up to form clouds', example: 'Millions of tiny water droplets', narration: 'As water vapor climbs high into the cool sky, it cools down and condenses into tiny liquid droplets that cluster together to form clouds!', color: '#38bdf8' },
        { title: '3. PRECIPITATION', subtitle: 'Heavy clouds release rain or snow', example: 'Rain, hail, sleet, or snow', narration: 'When cloud droplets grow too heavy to float, gravity pulls them back down to Earth as precipitation—rain, snow, or hail.', color: '#6366f1' },
        { title: '4. COLLECTION', subtitle: 'Water flows back to rivers & oceans', example: 'Rivers, lakes, groundwater', narration: 'Finally, rainfall flows down hills and mountains into streams, rivers, and oceans, ready for the water cycle to begin all over again!', color: '#10b981' },
      ],
    };
  }

  if (q.includes('fraction')) {
    return {
      title: '3D Fractions & Equal Parts Lab',
      category: 'Mathematics',
      sceneType: 'concept-gallery',
      description: 'See how a whole divides into halves, quarters, and three-quarters using interactive 3D visual cards and models.',
      narration: 'Welcome to the 3D Fractions Lab! A fraction represents equal parts of a whole. The top number is the numerator, and the bottom number is the denominator.',
      facts: [
        { label: 'Top Number', value: 'Numerator (Parts)' },
        { label: 'Bottom Number', value: 'Denominator (Total)' },
        { label: 'Half', value: '1/2 = 50%' },
        { label: 'Quarter', value: '1/4 = 25%' },
      ],
      parts: [
        { name: 'Whole Pie Base', geometry: 'cylinder', args: [2.0, 2.0, 0.45, 32], position: [0, 0, 0], rotation: [0, 0, 0], color: '#f59e0b' },
        { name: 'Divider 1', geometry: 'box', args: [4.1, 0.52, 0.08], position: [0, 0, 0], rotation: [0, 0, 0], color: '#060e1c' },
        { name: 'Divider 2', geometry: 'box', args: [0.08, 0.52, 4.1], position: [0, 0, 0], rotation: [0, 0, 0], color: '#060e1c' },
      ],
      stations: [
        { title: '1 WHOLE (1/1)', subtitle: 'All equal parts put together', example: '4/4 = 2/2 = 1 Whole', narration: 'One whole means every single equal piece is present. Four quarters make one complete whole!', color: '#f59e0b' },
        { title: 'ONE HALF (1/2)', subtitle: '1 out of 2 equal parts', example: '1/2 = 2/4 = 0.50', narration: 'One half means dividing a whole into two equal parts and taking one part. Half is equal to two quarters!', color: '#3b82f6' },
        { title: 'ONE QUARTER (1/4)', subtitle: '1 out of 4 equal parts', example: '1/4 = 25% = 0.25', narration: 'One quarter means cutting a whole into four identical pieces and picking one piece.', color: '#10b981' },
        { title: 'THREE QUARTERS (3/4)', subtitle: '3 out of 4 equal parts', example: '3/4 = 75% = 0.75', narration: 'Three quarters means taking three out of four equal slices—leaving just one quarter behind!', color: '#ec4899' },
      ],
    };
  }

  if (q.includes('rectang') || q.includes('cuboid') || q.includes('brick')) {
    return {
      title: '3D Rectangular Prism (Cuboid)',
      category: 'Mathematics & Geometry',
      sceneType: 'object',
      description: 'A 3D rectangular solid with 6 rectangular faces, 12 edges, and 8 right-angle vertices.',
      narration: 'Here is a 3D Rectangular Prism, also called a Cuboid! Notice its length is longer than its width and height. To find its volume, multiply length times width times height.',
      facts: [
        { label: 'Faces', value: '6 Rectangles' },
        { label: 'Edges / Vertices', value: '12 / 8' },
        { label: 'Volume', value: 'V = l × w × h' },
        { label: 'Surface Area', value: '2(lw + lh + wh)' },
      ],
      parts: [
        { name: 'Rectangular Solid', geometry: 'box', args: [4.6, 2.2, 2.8], position: [0, 0, 0], rotation: [0, 0, 0], color: '#0ea5e9', opacity: 0.9, wireframeEdges: true },
      ],
      stations: [
        { title: 'VOLUME', subtitle: 'Length × Width × Height', example: 'Ex: 5 × 3 × 2 = 30 cm³', narration: 'To calculate the volume of a rectangular prism, multiply its length times its width times its height!', color: '#facc15' },
        { title: '6 FACES', subtitle: '3 pairs of opposite identical rectangles', example: 'Top/Bottom, Front/Back, Left/Right', narration: 'A cuboid has 6 flat rectangular faces arranged in three matching opposite pairs.', color: '#38bdf8' },
      ],
    };
  }

  if (q.includes('car') || q.includes('bus') || q.includes('truck') || q.includes('vehicle')) {
    return {
      title: `3D ${topic.trim()}`,
      category: 'Engineering & Transport',
      sceneType: 'object',
      description: 'A four-wheeled motor vehicle with lower chassis, passenger cabin, headlights, and spinning rubber tires.',
      narration: `Here is your 3D ${topic}! Notice how the four cylindrical wheels support the main chassis while the aerodynamic cabin protects passengers inside.`,
      facts: [
        { label: 'Propulsion', value: 'Wheel & Axle' },
        { label: 'Wheels', value: '4 Rotating Tires' },
        { label: 'Key Force', value: 'Friction & Thrust' },
        { label: 'Structure', value: 'Chassis + Cabin' },
      ],
      parts: [
        { name: 'Chassis', geometry: 'box', args: [4.8, 1.1, 2.2], position: [0, 0, 0], rotation: [0, 0, 0], color: '#ef4444' },
        { name: 'Cabin', geometry: 'box', args: [2.5, 1.0, 1.9], position: [-0.2, 1.0, 0], rotation: [0, 0, 0], color: '#38bdf8', opacity: 0.85 },
        { name: 'Front Left Wheel', geometry: 'cylinder', args: [0.6, 0.6, 0.45, 20], position: [1.5, -0.55, 1.15], rotation: [1.57, 0, 0], color: '#1e293b', animate: 'spinZ' },
        { name: 'Front Right Wheel', geometry: 'cylinder', args: [0.6, 0.6, 0.45, 20], position: [1.5, -0.55, -1.15], rotation: [1.57, 0, 0], color: '#1e293b', animate: 'spinZ' },
        { name: 'Rear Left Wheel', geometry: 'cylinder', args: [0.6, 0.6, 0.45, 20], position: [-1.5, -0.55, 1.15], rotation: [1.57, 0, 0], color: '#1e293b', animate: 'spinZ' },
        { name: 'Rear Right Wheel', geometry: 'cylinder', args: [0.6, 0.6, 0.45, 20], position: [-1.5, -0.55, -1.15], rotation: [1.57, 0, 0], color: '#1e293b', animate: 'spinZ' },
        { name: 'Left Headlight', geometry: 'sphere', args: [0.22, 16, 16], position: [2.4, 0.1, 0.7], rotation: [0, 0, 0], color: '#fef08a', emissive: '#facc15', animate: 'pulse' },
        { name: 'Right Headlight', geometry: 'sphere', args: [0.22, 16, 16], position: [2.4, 0.1, -0.7], rotation: [0, 0, 0], color: '#fef08a', emissive: '#facc15', animate: 'pulse' },
      ],
      stations: [
        { title: 'WHEEL & AXLE', subtitle: 'Reduces friction so vehicle rolls smoothly', example: 'Simple machine for motion', narration: 'Wheels and axles reduce friction with the road so the engine can move the car smoothly.', color: '#facc15' },
        { title: 'CABIN & CHASSIS', subtitle: 'Protects passengers and holds the engine', example: 'Strong steel frame', narration: 'The chassis supports the entire vehicle weight while the cabin keeps passengers safe.', color: '#38bdf8' },
      ],
    };
  }

  return {
    title: `3D VR Lesson: ${topic.trim()}`,
    category: 'Edvoura AI 3D Studio',
    sceneType: 'concept-gallery',
    description: `Interactive 3D Virtual Reality learning space for "${topic.trim()}". Click the floating 3D concept stations or drag to explore in 360°.`,
    narration: `Welcome to your 3D Virtual Reality lesson on ${topic.trim()}! Explore the interactive stations floating around the centerpiece to learn key concepts, examples, and facts.`,
    facts: [
      { label: 'Topic', value: topic.trim().slice(0, 28) },
      { label: 'VR Mode', value: '360° Interactive World' },
      { label: 'Dissection', value: 'Slice Plane Ready' },
      { label: 'Audio', value: 'Spoken Guide Active' },
    ],
    parts: [
      { name: 'Central Learning Core', geometry: 'dodecahedron', args: [1.4, 0], position: [0, 0, 0], rotation: [0, 0, 0], color: '#6366f1', wireframeEdges: true, animate: 'spinY' },
      { name: 'Orbit Ring', geometry: 'torus', args: [2.3, 0.1, 16, 48], position: [0, 0, 0], rotation: [1.2, 0.3, 0], color: '#38bdf8', animate: 'spinZ' },
    ],
    stations: [
      { title: 'DEFINITION', subtitle: `Core meaning of ${topic.trim()}`, example: 'Tap Listen to hear overview', narration: `${topic.trim()} is an important curriculum topic. Observe how each key idea connects together in this 3D space.`, color: '#3b82f6' },
      { title: 'KEY PARTS', subtitle: `Main elements inside ${topic.trim()}`, example: 'Explore every angle in 360°', narration: `Breaking ${topic.trim()} into smaller parts makes it easy to understand and remember for exams!`, color: '#10b981' },
      { title: 'REAL EXAMPLES', subtitle: `How ${topic.trim()} appears in daily life`, example: 'Connect learning to the real world', narration: `Think about where you see ${topic.trim()} around you every day at school and at home.`, color: '#f59e0b' },
      { title: 'QUICK CHECK', subtitle: 'Explain it in your own words!', example: 'Discuss with your tutor live', narration: `Now try explaining ${topic.trim()} back to your tutor in one clear sentence!`, color: '#ec4899' },
    ],
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const topic = typeof body?.prompt === 'string' ? body.prompt.trim() : '';
    const gradeLevel = typeof body?.gradeLevel === 'string' ? body.gradeLevel : 'Primary & Secondary (Grades 1-12)';

    if (!topic) {
      return NextResponse.json({ error: 'Please enter a topic to generate in 3D.' }, { status: 400 });
    }

    const promptText = build3DPrompt(topic, gradeLevel);

    // 1. Try Gemini REST v1beta directly (supports BOTH AQ.* and AIza* Google AI keys + live active models)
    const geminiKeys = getGeminiKeys();
    const geminiModels = [
      process.env.GEMINI_MODEL,
      'gemini-flash-latest',
      'gemini-3.1-flash-lite',
      'gemini-flash-lite-latest',
      'gemini-3-flash-preview',
      'gemini-2.5-flash-lite',
      'gemini-2.5-flash',
    ].filter((m): m is string => typeof m === 'string' && m.trim().length > 0);

    for (const key of geminiKeys) {
      for (const modelName of [...new Set(geminiModels)]) {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 14000);
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
            modelName,
          )}:generateContent?key=${encodeURIComponent(key)}`;
          const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: promptText }] }],
              generationConfig: {
                temperature: 0.4,
                responseMimeType: 'application/json',
              },
            }),
          });
          clearTimeout(timer);

          if (!resp.ok) {
            const errTxt = await resp.text().catch(() => '');
            console.warn(`3D Gen Gemini (${modelName}) HTTP ${resp.status}:`, errTxt.slice(0, 180));
            continue;
          }

          const payload = await resp.json();
          const raw =
            payload?.candidates?.[0]?.content?.parts
              ?.map((p: any) => p?.text || '')
              .join('') || '';
          if (!raw) continue;

          const parsed = extractJsonPayload(raw);
          const validated = BlueprintSchema.parse(parsed);
          return NextResponse.json({ blueprint: validated, provider: `gemini:${modelName}` });
        } catch (err) {
          console.warn(`3D Gen Gemini (${modelName}) attempt failed:`, err instanceof Error ? err.message : err);
        }
      }
    }

    // 2. Fallback to OpenRouter keys
    const openRouterKeys = getOpenRouterKeys();
    const openRouterModels = [
      process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-001',
      'meta-llama/llama-3.1-70b-instruct',
      'openai/gpt-4o-mini',
    ];

    for (const key of openRouterKeys) {
      const client = createOpenAI({ baseURL: 'https://openrouter.ai/api/v1', apiKey: key });
      for (const modelName of [...new Set(openRouterModels)]) {
        try {
          const { text } = await generateText({
            model: client(modelName),
            prompt: promptText,
            temperature: 0.4,
          });
          const parsed = extractJsonPayload(text);
          const validated = BlueprintSchema.parse(parsed);
          return NextResponse.json({ blueprint: validated, provider: `openrouter:${modelName}` });
        } catch (err) {
          console.warn(`3D Gen OpenRouter (${modelName}) attempt failed:`, err instanceof Error ? err.message : err);
        }
      }
    }

    // 3. Rich smart fallback (covers Parts of Speech, Water Cycle, Fractions, Cars, Rectangles, & concept gallery!)
    return NextResponse.json({
      blueprint: buildSmartFallback(topic),
      provider: 'local-fallback',
    });
  } catch (err) {
    console.error('AI 3D generator error:', err);
    return NextResponse.json({ error: 'Failed to synthesize 3D model.' }, { status: 500 });
  }
}
