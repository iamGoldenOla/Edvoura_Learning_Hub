import { NextRequest, NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { z } from 'zod';
import { extractJsonPayload } from '@/lib/ai/orchestrator';

export const maxDuration = 60;

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

const VisualItemSchema = z.object({
  icon: z.string().default('✨'),
  label: z.string(),
  category: z.string().optional(),
  bgColor: z.string().optional(),
});

const StationTypeSchema = z.object({
  name: z.string(),
  detail: z.string(),
});

const MiniQuizSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).min(2).max(4),
  correctIndex: z.number().int().min(0).max(3).default(0),
  explanation: z.string().default('Great job!'),
  hint: z.string().optional(),
  workedSolution: z.string().optional(),
});

const WorkedStepSchema = z.object({
  label: z.string(),
  work: z.string(),
  speak: z.string(),
});

const WorkedExampleSchema = z.object({
  problem: z.string(),
  steps: z.array(WorkedStepSchema).min(2).max(5),
  finalAnswer: z.string(),
});

const StationSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  definition: z.string().optional(),
  formulaOrRule: z.string().optional(),
  timelineYear: z.string().optional(),
  imageQuery: z.string().optional(),
  imageUrl: z.string().optional(),
  types: z.array(StationTypeSchema).max(6).optional(),
  workedExample: WorkedExampleSchema.optional(),
  examples: z.array(z.string()).max(6).optional(),
  example: z.string().default(''),
  visuals: z.array(VisualItemSchema).max(6).optional(),
  propKind: z
    .enum(['coins', 'scale', 'book', 'globe', 'beaker', 'cube', 'pie', 'chart', 'sun', 'leaf', 'trophy'])
    .optional(),
  teacherScript: z.string().optional(),
  narration: z.string().default(''),
  quiz: MiniQuizSchema.optional(),
  color: z.string().default('#facc15'),
  position: z.tuple([z.number(), z.number(), z.number()]).optional(),
});

const BlueprintSchema = z.object({
  title: z.string(),
  category: z.string().default('AI VR Classroom'),
  gradeLevel: z.string().optional(),
  sceneType: z.enum(['object', 'concept-gallery']).default('concept-gallery'),
  description: z.string(),
  teacherIntro: z.string().optional(),
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
  return `You are a Legendary Master K-12 Classroom Teacher & Curriculum Creator with over 100 years of educational mastery AND an Interactive 3D Virtual Reality Lesson Designer for Edvoura Learning Hub.
Design an EXTRAORDINARY, deeply resourceful, explanation-video-quality Interactive 3D VR Lesson on ANY topic, person, event, or subject: "${topic}" tailored strictly for class/grade level: "${gradeLevel}".

100-YEAR MASTER TEACHER & UNIVERSAL ENCYCLOPEDIA RULES:
1. UNIVERSAL AUTOMATIC COVERAGE: You can teach ANYTHING AND ANYONE—Mathematics (Profit & Loss, Algebra, Geometry), Geography (Volcanoes, Eruptions, Earth Structure, Tectonic Plates, Rivers, Continents), Current Affairs & World Leaders (Presidents of Nigeria, USA, Africa, Europe, UN, Global News), Dinosaurs & Prehistory (T-Rex, Triceratops, Fossils, Extinction), Past & Present History (Ancient Kingdoms, World Wars, Inventions, Independence Heroes), Science, Literature, Arts, Civic Education, and Technology!
2. TAILOR EVERYTHING STRICTLY TO "${gradeLevel}":
   - Nursery / KG / Grade 1-3: Warm simple words, concrete real-life stories, friendly numbers, playful tone.
   - Grade 4-6 (Upper Primary): Rich definitions, key rules/formulas/dates, step-by-step worked problems/case studies, engaging facts.
   - Grade 7-9 (JSS 1-3): Rigorous formulas, historical context, sub-types, multi-step worked solutions, exam-ready depth.
   - Grade 10-12 (SSS 1-3 / High School): Deep analytical mastery, derivations, primary facts/dates/policies, multi-step exam worked solutions.
3. REAL PHOTOGRAPH LOOKUP ("imageQuery"):
   - For EVERY station, include "imageQuery" with the EXACT, clean English Wikipedia article title for a real high-res photograph of that person, dinosaur, volcano, landmark, historical event, or scientific subject (e.g. "Bola Tinubu", "Donald Trump", "Nelson Mandela", "Tyrannosaurus", "Triceratops", "Mount Vesuvius", "Mount Kilimanjaro", "Stratovolcano", "Structure of Earth", "Photosynthesis", "Nnamdi Azikiwe").
   - Also include "timelineYear" when relevant (e.g. "2023–Present", "68–66 Million Years Ago", "79 AD", "1960").
4. DECIDE THE SCENE TYPE:
   - Use "sceneType": "concept-gallery" for multi-part lessons, Geography, Current Affairs/Presidents, Dinosaurs, History, Math topics, Grammar, and Science processes (4 to 6 rich stations). Keep "parts" minimal (2 sleek glowing pedestal rings) — NEVER build random robots!
   - Use "sceneType": "object" ONLY for a specific physical 3D object/shape/organ/machine (6 to 22 Three.js "parts" + 3 to 5 rich stations).
5. EVERY SINGLE STATION MUST BE A COMPLETE EXPLANATION-VIDEO CHAPTER WITH:
   - "title": Clear concept/person/event name
   - "subtitle": 1 crisp summary line (under 65 chars)
   - "timelineYear": Optional date/era badge (e.g. "2023–Present", "Cretaceous Period", "1960")
   - "imageQuery": Exact Wikipedia page title to fetch a real verified photograph!
   - "definition": Rich 2-3 sentence master-teacher explanation covering WHAT/WHO it is, key facts, and WHY it matters.
   - "formulaOrRule": Key formula, golden rule, capital/office, or landmark takeaway!
   - "types": 2 to 4 real sub-types, achievements, geological layers, anatomical traits, or key facts with "name" and clear "detail".
   - "workedExample": A REAL STEP-BY-STEP WORKED CLASSROOM PROBLEM OR GUIDED CASE-STUDY ANALYSIS ("problem", 3-4 sequential "steps" with "label", "work", "speak", and "finalAnswer")!
   - "examples": 2-3 vivid real-world facts/sentences with KEY TERMS in UPPERCASE.
   - "example": 1 short punchy footer summary (MAX 52 chars).
   - "visuals": EXACTLY 4 DIFFERENT concrete visual tiles ("icon", "label", "category", "bgColor").
   - "propKind": One of "coins", "scale", "book", "globe", "beaker", "cube", "pie", "chart", "sun", "leaf", "trophy".
   - "teacherScript": Warm 3-sentence teacher voice introduction.
   - "narration": Same as teacherScript.
   - "quiz": Active practice question ("question", 3 "options", "correctIndex", "hint", "workedSolution", "explanation").
   - "color": Distinct vibrant hex color.

Return ONLY raw valid JSON matching this exact structure (no markdown fences, no commentary):
{
  "title": "Clear Lesson Title",
  "category": "Subject Area",
  "gradeLevel": "${gradeLevel}",
  "sceneType": "concept-gallery | object",
  "description": "2 welcoming sentences introducing what pupils will master in this VR lesson.",
  "teacherIntro": "3 warm spoken master-teacher sentences welcoming the ${gradeLevel} class to ${topic}.",
  "narration": "Same warm teacher intro.",
  "facts": [
    { "label": "Class Level", "value": "${gradeLevel}" },
    { "label": "Key Fact", "value": "Short crisp fact" },
    { "label": "Key Rule", "value": "Short crisp fact" },
    { "label": "Real World", "value": "Short crisp fact" }
  ],
  "parts": [
    {
      "name": "Stage Pedestal",
      "geometry": "cylinder | torus | box | sphere | cone | octahedron | dodecahedron | ring | plane",
      "args": [numbers],
      "position": [x, y, z],
      "rotation": [rx, ry, rz],
      "color": "#hexcolor",
      "emissive": "#hexcolor",
      "opacity": 1,
      "animate": "none | spinY | spinZ | spinX | bob | pulse"
    }
  ],
  "stations": [
    {
      "title": "CONCEPT / LEADER / EVENT NAME",
      "subtitle": "Crisp 1-line summary",
      "timelineYear": "Optional Era / Year",
      "imageQuery": "Exact Wikipedia Page Title",
      "definition": "Rich 2-3 sentence teacher explanation.",
      "formulaOrRule": "Key formula, office, or golden takeaway",
      "propKind": "coins | scale | book | globe | beaker | cube | pie | chart | sun | leaf | trophy",
      "types": [
        { "name": "Key Fact / Type 1", "detail": "Clear explanation + detail" },
        { "name": "Key Fact / Type 2", "detail": "Clear explanation + detail" }
      ],
      "workedExample": {
        "problem": "Concrete worked problem or guided analysis for ${gradeLevel}.",
        "steps": [
          { "label": "Step 1: Observe & Identify", "work": "Key evidence/values...", "speak": "First, let us observe..." },
          { "label": "Step 2: Connect & Analyze", "work": "Apply rule/context...", "speak": "Next, let us connect this..." },
          { "label": "Step 3: Conclude", "work": "Result = ...", "speak": "Putting it together gives our clear answer!" }
        ],
        "finalAnswer": "Clear boxed conclusion/answer"
      },
      "examples": [
        "Real-world fact/example 1 with KEY TERM in uppercase.",
        "Real-world fact/example 2 with KEY TERM in uppercase."
      ],
      "example": "Short footer summary under 52 chars",
      "visuals": [
        { "icon": "🌍", "label": "Caption 1", "category": "Tag", "bgColor": "#3b82f6" },
        { "icon": "🏛️", "label": "Caption 2", "category": "Tag", "bgColor": "#10b981" },
        { "icon": "📜", "label": "Caption 3", "category": "Tag", "bgColor": "#f59e0b" },
        { "icon": "⭐", "label": "Caption 4", "category": "Tag", "bgColor": "#8b5cf6" }
      ],
      "teacherScript": "Warm 3-sentence teacher voice explanation.",
      "narration": "Same warm teacher voice explanation.",
      "quiz": {
        "question": "Active practice question for the pupil?",
        "options": ["Option A", "Option B", "Option C"],
        "correctIndex": 0,
        "hint": "Helpful teacher hint.",
        "workedSolution": "Step 1... Step 2... Therefore the answer is Option A!",
        "explanation": "Well done! Encouraging explanation."
      },
      "color": "#3b82f6"
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

function buildSmartFallback(topic: string, gradeLevel = 'Grade 4–6 (Upper Primary)'): AI3DBlueprint {
  const q = topic.toLowerCase().trim();

  if (q.includes('president') || q.includes('current affair') || q.includes('leader') || q.includes('tinubu') || q.includes('trump') || q.includes('mandela') || q.includes('united nations')) {
    return {
      title: `World Leaders & Current Affairs (${gradeLevel})`,
      category: 'Current Affairs & Civic Education',
      gradeLevel,
      sceneType: 'concept-gallery',
      description:
        'Explore real portraits, roles, history, and global impact of Nigerian & World Presidents and international organizations in interactive 3D VR!',
      teacherIntro: `Welcome ${gradeLevel} global citizens! Understanding current affairs and world leadership helps you know how nations work together, make laws, and solve global challenges. Let us meet key leaders and institutions!`,
      narration: `Welcome to the Current Affairs and World Leaders VR Gallery for ${gradeLevel}! Tap any leader card or play the full VR lesson to see real portraits, key responsibilities, and quiz challenges.`,
      facts: [
        { label: 'Class Level', value: gradeLevel },
        { label: 'Nigeria Capital', value: 'Abuja (FCT)' },
        { label: 'Global Body', value: 'United Nations (193 Nations)' },
        { label: 'Focus', value: 'Leadership & Governance' },
      ],
      parts: [
        { name: 'Stage Base', geometry: 'cylinder', args: [2.4, 2.6, 0.2, 32], position: [0, -2.0, 0], rotation: [0, 0, 0], color: '#1e293b', emissive: '#10b981' },
        { name: 'Orbit Ring', geometry: 'torus', args: [2.7, 0.06, 16, 48], position: [0, -1.8, 0], rotation: [1.57, 0, 0], color: '#facc15', animate: 'spinZ' },
      ],
      stations: [
        {
          title: 'BOLA AHMED TINUBU (NIGERIA)',
          subtitle: '16th President of the Federal Republic of Nigeria',
          timelineYear: '2023 – Present',
          imageQuery: 'Bola Tinubu',
          definition:
            'Bola Ahmed Tinubu became the 16th President of Nigeria on May 29, 2023. Previously Governor of Lagos State (1999–2007), he leads the Executive Branch from Aso Rock Presidential Villa in Abuja.',
          formulaOrRule: 'Office: President of Nigeria  |  Seat: Abuja  |  Branch: Executive',
          propKind: 'globe',
          types: [
            { name: 'Executive Duties', detail: 'Signs bills into law, commands the Armed Forces, and directs national policy' },
            { name: 'ECOWAS Leadership', detail: 'Chaired the Economic Community of West African States promoting regional trade & peace' },
          ],
          workedExample: {
            problem: 'How does a Nigerian President get elected under the 1999 Constitution?',
            steps: [
              { label: 'Step 1: Popular Vote', work: 'Candidate must win the highest total votes nationwide', speak: 'First, a presidential candidate must win the highest number of votes cast across Nigeria.' },
              { label: 'Step 2: National Spread', work: 'At least 25% of votes in two-thirds of the 36 states', speak: 'Second, to promote national unity, the winner must also score at least 25 percent in two-thirds of all 36 states!' },
              { label: 'Step 3: Term Length', work: '4-Year Term (Maximum of 2 Terms)', speak: 'Once sworn in, a President serves a four-year term and may serve at most two terms.' },
            ],
            finalAnswer: 'Highest votes + 25% spread across 24 states (4-year term)',
          },
          examples: [
            'Nigeria operates a FEDERAL REPUBLIC with 36 states and the Federal Capital Territory, ABUJA.',
            'Nigeria gained independence on OCTOBER 1, 1960, with Nnamdi Azikiwe becoming its first President in 1963.',
          ],
          example: '16th President of Nigeria • Sworn in May 29, 2023',
          visuals: [
            { icon: '🇳🇬', label: 'Nigeria', category: 'West Africa', bgColor: '#16a34a' },
            { icon: '🏛️', label: 'Aso Villa', category: 'Abuja', bgColor: '#3b82f6' },
            { icon: '🗳️', label: 'Democracy', category: '4-Year Term', bgColor: '#f59e0b' },
            { icon: '🤝', label: 'ECOWAS', category: 'Regional Unity', bgColor: '#10b981' },
          ],
          teacherScript: 'Meet Bola Ahmed Tinubu, the 16th President of the Federal Republic of Nigeria, sworn in on May 29, 2023.',
          narration: 'Bola Ahmed Tinubu is the 16th President of Nigeria, leading the executive branch from Abuja.',
          quiz: {
            question: 'In which city is the official residence of the President of Nigeria located?',
            options: ['Lagos', 'Abuja', 'Kano'],
            correctIndex: 1,
            hint: 'Think of Nigeria’s Federal Capital Territory (FCT)!',
            workedSolution: 'Abuja became Nigeria’s Federal Capital Territory in 1991, and Aso Rock Presidential Villa is located in Abuja!',
            explanation: 'Correct! Abuja is Nigeria’s capital city and home to the Presidential Villa!',
          },
          color: '#16a34a',
        },
        {
          title: 'DONALD TRUMP (UNITED STATES)',
          subtitle: 'President of the United States of America',
          timelineYear: '45th & 47th President',
          imageQuery: 'Donald Trump',
          definition:
            'Donald Trump serves as the 47th President of the United States (having also served as the 45th President from 2017 to 2021). The U.S. President works from the White House in Washington, D.C.',
          formulaOrRule: 'Office: U.S. President  |  Seat: White House, Washington, D.C.',
          propKind: 'trophy',
          types: [
            { name: 'Checks & Balances', detail: 'Works alongside the U.S. Congress (Legislature) and Supreme Court (Judiciary)' },
            { name: 'Global Diplomacy', detail: 'Represents the United States in international trade, G7, and UN summits' },
          ],
          workedExample: {
            problem: 'How are powers shared in a Presidential Democracy like the USA and Nigeria?',
            steps: [
              { label: 'Step 1: Executive Branch', work: 'President & Cabinet enforce laws', speak: 'First, the Executive branch led by the President carries out and enforces the laws.' },
              { label: 'Step 2: Legislative Branch', work: 'Congress / National Assembly writes laws', speak: 'Second, the Legislative branch debates and passes new laws and national budgets.' },
              { label: 'Step 3: Judicial Branch', work: 'Supreme Court interprets the Constitution', speak: 'Third, the Judicial branch protects the Constitution and ensures justice for all citizens!' },
            ],
            finalAnswer: '3 Independent Branches: Executive, Legislative & Judicial',
          },
          examples: [
            'The WHITE HOUSE in WASHINGTON, D.C. is the official workplace of the U.S. President.',
            'George Washington was the FIRST President of the United States in 1789.',
          ],
          example: '45th & 47th U.S. President • White House',
          visuals: [
            { icon: '🇺🇸', label: 'United States', category: 'North America', bgColor: '#2563eb' },
            { icon: '🏛️', label: 'White House', category: 'Washington DC', bgColor: '#64748b' },
            { icon: '⚖️', label: '3 Branches', category: 'Checks & Balances', bgColor: '#f59e0b' },
            { icon: '🌍', label: 'Diplomacy', category: 'Global Trade', bgColor: '#ef4444' },
          ],
          teacherScript: 'Next is the Presidency of the United States, where Donald Trump serves as the 47th President working from the White House in Washington, D.C.',
          narration: 'Donald Trump serves as the 47th President of the United States, working from the White House in Washington, D.C.',
          quiz: {
            question: 'Which branch of government makes and passes laws in a presidential democracy?',
            options: ['Legislative Branch', 'Executive Branch', 'Postal Service'],
            correctIndex: 0,
            hint: 'Think of Senators and Representatives voting on bills!',
            workedSolution: 'The Legislative Branch (National Assembly or Congress) writes and passes bills, the Executive enforces them, and the Judiciary interprets them!',
            explanation: 'Spot on! The Legislative Branch makes and passes laws!',
          },
          color: '#2563eb',
        },
        {
          title: 'NELSON MANDELA (HISTORIC ICON)',
          subtitle: 'First Black President of South Africa & Global Peace Symbol',
          timelineYear: '1994 – 1999',
          imageQuery: 'Nelson Mandela',
          definition:
            'Nelson Mandela (1918–2013) led the peaceful struggle against apartheid in South Africa, spent 27 years in prison, won the Nobel Peace Prize, and became South Africa’s first democratically elected Black President in 1994.',
          formulaOrRule: 'Legacy: Forgiveness, Equality, Human Rights & Democracy',
          propKind: 'book',
          types: [
            { name: 'Anti-Apartheid Hero', detail: 'Fought for equal rights for every citizen regardless of race' },
            { name: 'Nobel Peace Laureate', detail: 'Awarded the 1993 Nobel Peace Prize for peaceful democratic transition' },
          ],
          workedExample: {
            problem: 'Why is Nelson Mandela remembered across the entire world today?',
            steps: [
              { label: 'Step 1: Courage Under Injustice', work: 'Stood firm for equality through 27 years of imprisonment', speak: 'First, Mandela refused to abandon justice even during 27 years in prison.' },
              { label: 'Step 2: Chose Reconciliation', work: 'United a divided nation through forgiveness instead of revenge', speak: 'Second, upon his release, he chose peace and unity instead of anger.' },
              { label: 'Step 3: Inspired World Leaders', work: 'Nelson Mandela International Day is celebrated every July 18', speak: 'Third, his example inspired generations of leaders worldwide to champion human rights!' },
            ],
            finalAnswer: 'Global symbol of peaceful leadership & equality',
          },
          examples: [
            'MANDELA said: "EDUCATION is the most powerful weapon which you can use to change the world."',
            'Every JULY 18 is celebrated worldwide as Nelson Mandela International Day.',
          ],
          example: '1993 Nobel Peace Prize • President of South Africa',
          visuals: [
            { icon: '🇿🇦', label: 'South Africa', category: 'Rainbow Nation', bgColor: '#f59e0b' },
            { icon: '🕊️', label: 'Peace Prize', category: '1993 Nobel', bgColor: '#38bdf8' },
            { icon: '📚', label: 'Education', category: 'Power to Change', bgColor: '#8b5cf6' },
            { icon: '❤️', label: 'Unity', category: 'Human Rights', bgColor: '#ef4444' },
          ],
          teacherScript: 'Now let us honor Nelson Mandela, South Africa’s first Black President and Nobel Peace Prize winner who showed the world the power of forgiveness and education!',
          narration: 'Nelson Mandela became South Africa’s first democratically elected Black President in 1994 and inspired the world with peaceful leadership.',
          quiz: {
            question: 'In what year did Nelson Mandela become President of South Africa?',
            options: ['1960', '1994', '2010'],
            correctIndex: 1,
            hint: 'It was one year after he received the 1993 Nobel Peace Prize!',
            workedSolution: 'South Africa held its first fully democratic election in 1994, electing Nelson Mandela as President!',
            explanation: 'Bravo! 1994 marked South Africa’s historic democratic election!',
          },
          color: '#f59e0b',
        },
        {
          title: 'UNITED NATIONS & GLOBAL AFFAIRS',
          subtitle: '193 Countries Working Together for Peace, Climate & Education',
          timelineYear: 'Founded 1945 – Present',
          imageQuery: 'United Nations',
          definition:
            'The United Nations (UN) is the world’s largest international organization, founded in 1945 after World War II. Today 193 member nations collaborate on peacekeeping, children’s education (UNICEF), clean climate energy, and global health (WHO).',
          formulaOrRule: 'UN Headquarters: New York  |  Members: 193 Countries  |  17 SDGs',
          propKind: 'scale',
          types: [
            { name: 'UNICEF & UNESCO', detail: 'Protect children’s rights, schools, science, and world heritage sites' },
            { name: 'Sustainable Development Goals', detail: '17 global targets to end poverty, expand clean energy, and ensure quality education' },
          ],
          workedExample: {
            problem: 'How do nations solve global problems like climate change or disease outbreaks?',
            steps: [
              { label: 'Step 1: Global Summits', work: 'Presidents & delegates meet at the UN General Assembly', speak: 'First, leaders from 193 countries meet together at the United Nations General Assembly.' },
              { label: 'Step 2: Shared Science & Aid', work: 'WHO, UNICEF & scientists pool data and vaccines', speak: 'Second, agencies like UNICEF and the World Health Organization share research and help countries in need.' },
              { label: 'Step 3: International Treaties', work: 'Countries sign agreements like the Paris Climate Accord', speak: 'Third, nations sign peaceful agreements to protect our shared planet for future generations!' },
            ],
            finalAnswer: 'Global cooperation keeps the planet peaceful & healthy',
          },
          examples: [
            'UN agencies like UNICEF support millions of school children worldwide.',
            'The AFRICAN UNION (AU) unites all 55 African nations from its headquarters in Addis Ababa.',
          ],
          example: '193 Nations • Peace, Climate & Education',
          visuals: [
            { icon: '🇺🇳', label: 'United Nations', category: '193 Members', bgColor: '#0284c7' },
            { icon: '🌍', label: 'African Union', category: '55 Nations', bgColor: '#16a34a' },
            { icon: '🏫', label: 'UNICEF', category: 'Child Education', bgColor: '#38bdf8' },
            { icon: '🌱', label: 'Clean Climate', category: 'Global Goal', bgColor: '#10b981' },
          ],
          teacherScript: 'Finally, explore the United Nations and African Union—where world leaders cooperate for peace, quality education, and a healthy planet!',
          narration: 'The United Nations brings 193 countries together for world peace, education, health, and climate action.',
          quiz: {
            question: 'Which UN agency focuses specifically on children’s rights and education?',
            options: ['UNICEF', 'FIFA', 'NASA'],
            correctIndex: 0,
            hint: 'It stands for United Nations International Children’s Emergency Fund!',
            workedSolution: 'UNICEF is the United Nations agency dedicated to protecting children’s health, rights, and education worldwide!',
            explanation: 'Awesome! UNICEF supports children and schools across the globe!',
          },
          color: '#0284c7',
        },
      ],
    };
  }

  if (q.includes('dinosaur') || q.includes('t-rex') || q.includes('jurassic') || q.includes('cretaceous') || q.includes('fossil')) {
    return {
      title: `Age of Dinosaurs — 3D Prehistoric Museum (${gradeLevel})`,
      category: 'Paleontology & Prehistoric Science',
      gradeLevel,
      sceneType: 'concept-gallery',
      description:
        'Travel back 66–230 million years to meet Tyrannosaurus Rex, Triceratops, Brachiosaurus, and discover how fossils reveal Earth’s prehistoric past!',
      teacherIntro: `Welcome ${gradeLevel} paleontologists! For over 165 million years, incredible reptiles called Dinosaurs ruled planet Earth! Let us explore the fiercest predators, gentle giants, armored herbivores, and the giant asteroid that changed Earth forever!`,
      narration: `Welcome to the 3D Dinosaur Museum for ${gradeLevel}! Step through real prehistoric reconstructions, fossil facts, size comparisons, and fun quizzes!`,
      facts: [
        { label: 'Era', value: 'Mesozoic (230–66 MYA)' },
        { label: '3 Periods', value: 'Triassic • Jurassic • Cretaceous' },
        { label: 'Living Relatives', value: 'Modern Birds!' },
        { label: 'Fossil Science', value: 'Paleontology' },
      ],
      parts: [
        { name: 'Museum Base', geometry: 'cylinder', args: [2.4, 2.6, 0.2, 32], position: [0, -2.0, 0], rotation: [0, 0, 0], color: '#1e293b', emissive: '#f59e0b' },
        { name: 'Orbit Ring', geometry: 'torus', args: [2.7, 0.06, 16, 48], position: [0, -1.8, 0], rotation: [1.57, 0, 0], color: '#facc15', animate: 'spinZ' },
      ],
      stations: [
        {
          title: 'TYRANNOSAURUS REX',
          subtitle: 'The "Tyrant Lizard King" with the strongest bite on land',
          timelineYear: '68 – 66 Million Years Ago',
          imageQuery: 'Tyrannosaurus',
          definition:
            'Tyrannosaurus Rex (T-Rex) was one of the largest land carnivores ever to walk Earth! Stretching 12 meters long with 60 banana-sized serrated teeth, its jaw could crush solid bone.',
          formulaOrRule: 'Diet: Carnivore (Meat-Eater)  |  Length: 12 m  |  Period: Late Cretaceous',
          propKind: 'trophy',
          types: [
            { name: 'Super Senses', detail: 'Binocular vision sharper than an eagle and a huge smell center in its brain' },
            { name: 'Bipedal Hunter', detail: 'Walked on two muscular hind legs balanced by a heavy stiff tail' },
          ],
          workedExample: {
            problem: 'If a T-Rex is 12 meters long and a school pupil is 1.5 meters tall, how many pupils laid head-to-toe equal ONE T-Rex?',
            steps: [
              { label: 'Step 1: List Lengths', work: 'T-Rex = 12 m  |  1 Pupil = 1.5 m', speak: 'First, write down the T-Rex length of 12 meters and one pupil height of 1.5 meters.' },
              { label: 'Step 2: Divide Total by 1.5', work: '12 ÷ 1.5 = 8 pupils', speak: 'Divide 12 by 1.5! Since two pupils make 3 meters, four make 6 meters, and eight make 12 meters!' },
              { label: 'Step 3: Imagine the Scale!', work: '1 T-Rex = 8 pupils long (as long as a school bus!)', speak: 'One T-Rex stretched as long as 8 pupils standing head-to-toe—the length of a whole school bus!' },
            ],
            finalAnswer: '8 pupils long (12 meters!)',
          },
          examples: [
            'A single T-REX tooth could grow up to 30 CENTIMETERS long including its root!',
            'Despite tiny arms, each T-Rex arm could still lift nearly 200 KILOGRAMS.',
          ],
          example: '12m Carnivore • 60 Teeth • Late Cretaceous',
          visuals: [
            { icon: '🦖', label: 'T-Rex', category: 'Apex Predator', bgColor: '#ef4444' },
            { icon: '🦷', label: '60 Giant Teeth', category: 'Bone Crusher', bgColor: '#f59e0b' },
            { icon: '🚌', label: 'Bus-Sized', category: '12m Long', bgColor: '#3b82f6' },
            { icon: '🦴', label: 'Fossils', category: 'North America', bgColor: '#8b5cf6' },
          ],
          teacherScript: 'Meet Tyrannosaurus Rex, the Tyrant Lizard King! Stretching 12 meters long with the strongest bite of any land animal, T-Rex ruled the Late Cretaceous period!',
          narration: 'Tyrannosaurus Rex was a massive 12-meter carnivore from the Late Cretaceous with 60 bone-crushing teeth.',
          quiz: {
            question: 'What kind of eater was Tyrannosaurus Rex?',
            options: ['Herbivore (Plant-eater)', 'Carnivore (Meat-eater)', 'Photosynthesizer'],
            correctIndex: 1,
            hint: 'Look at its 60 sharp serrated teeth designed for biting!',
            workedSolution: 'Sharp, serrated teeth are the hallmark of a Carnivore (meat-eater), whereas flat grinding teeth belong to herbivores!',
            explanation: 'Roar-some! T-Rex was a fierce Carnivore!',
          },
          color: '#ef4444',
        },
        {
          title: 'TRICERATOPS',
          subtitle: 'Three-horned armored herbivore with a massive bony frill',
          timelineYear: '68 – 66 Million Years Ago',
          imageQuery: 'Triceratops',
          definition:
            'Triceratops means "Three-Horned Face"! This gentle plant-eating dinosaur weighed as much as two African elephants and defended itself against T-Rex using three long facial horns and a thick armored neck shield.',
          formulaOrRule: 'Diet: Herbivore (Plants)  |  Horns: 3  |  Weight: ~9 Tonnes',
          propKind: 'leaf',
          types: [
            { name: 'Bony Frill Shield', detail: '2-meter-wide collar protecting its neck and regulating body temperature' },
            { name: 'Beak & 800 Teeth', detail: 'Parrot-like beak snipped tough ferns and palms, ground by hundreds of teeth' },
          ],
          workedExample: {
            problem: 'How can paleontologists tell from a skull fossil whether a dinosaur ate plants or meat?',
            steps: [
              { label: 'Step 1: Inspect the Teeth', work: 'Flat batteries of teeth = Plant grinding', speak: 'First, scientists check the teeth: Triceratops had hundreds of slicing and grinding teeth for tough leaves.' },
              { label: 'Step 2: Inspect the Mouth', work: 'Curved toothless beak = Snipping stems & ferns', speak: 'Second, its parrot-like beak was perfect for clipping low shrubs and palms.' },
              { label: 'Step 3: Check Defensive Armor', work: '3 Horns + Neck Shield = Defense against predators', speak: 'Third, its heavy horns and shield protected it from carnivores like T-Rex!' },
            ],
            finalAnswer: 'Beak + grinding teeth = Armored Herbivore!',
          },
          examples: [
            'TRICERATOPS lived at the exact same time and place as T-REX!',
            'Its massive SKULL alone measured nearly 2.5 METERS long—one of the largest of any land animal.',
          ],
          example: '3 Horns • Bony Frill • Peaceful Herbivore',
          visuals: [
            { icon: '🦕', label: 'Herbivore', category: 'Plant Eater', bgColor: '#10b981' },
            { icon: '🛡️', label: 'Neck Frill', category: 'Armor Shield', bgColor: '#3b82f6' },
            { icon: '🌿', label: 'Ferns & Palms', category: 'Diet', bgColor: '#22c55e' },
            { icon: '🐘', label: '9 Tonnes', category: 'Heavyweight', bgColor: '#f59e0b' },
          ],
          teacherScript: 'Meet Triceratops, the Three-Horned Face! This armored plant-eater defended itself with three huge horns and a bony shield!',
          narration: 'Triceratops was a heavily armored three-horned plant-eating dinosaur that lived alongside T-Rex.',
          quiz: {
            question: 'What does the name "Tri-ceratops" literally mean?',
            options: ['Fast runner', 'Three-horned face', 'Long neck'],
            correctIndex: 1,
            hint: '"Tri" means three—just like a triangle or tricycle!',
            workedSolution: 'Tri means three, ceras means horn, and ops means face—so Triceratops literally means Three-Horned Face!',
            explanation: 'Spot on! Triceratops means Three-Horned Face!',
          },
          color: '#10b981',
        },
        {
          title: 'BRACHIOSAURUS & SAUROPODS',
          subtitle: 'Skyscraper-tall gentle giants of the Jurassic Period',
          timelineYear: '155 – 145 Million Years Ago',
          imageQuery: 'Brachiosaurus',
          definition:
            'Brachiosaurus was a towering long-necked herbivore (Sauropod) whose front legs were LONGER than its back legs—giving it a giraffe-like posture to nibble treetops over 12 meters high!',
          formulaOrRule: 'Height: 12–13 m (4-Story Building!)  |  Era: Late Jurassic',
          propKind: 'globe',
          types: [
            { name: 'High-Browser Neck', detail: 'Reached conifer leaves no other dinosaur could reach' },
            { name: 'Air-Sac Bones', detail: 'Hollow bird-like air sacs kept its gigantic neck surprisingly light' },
          ],
          workedExample: {
            problem: 'If a Brachiosaurus ate 200 kg of leaves every day, how many kilograms of leaves did it eat in 1 week (7 days)?',
            steps: [
              { label: 'Step 1: Daily Food', work: '1 day = 200 kg of leaves', speak: 'First, write down its daily diet: 200 kilograms of leaves every single day.' },
              { label: 'Step 2: Multiply by 7 Days', work: '200 kg × 7 = 1,400 kg', speak: 'Multiply 200 by 7 days in a week! 2 times 7 is 14, so 200 times 7 is 1,400 kilograms!' },
              { label: 'Step 3: Compare Weight', work: '1,400 kg ≈ weight of a whole family car!', speak: 'In just one week, a single Brachiosaurus ate the weight of an entire car in green leaves!' },
            ],
            finalAnswer: '1,400 kg of leaves per week!',
          },
          examples: [
            'BRACHIOSAURUS means "Arm Lizard" because its front legs were taller than its hind legs.',
            'It lived during the JURASSIC PERIOD—80 million years BEFORE T-Rex even existed!',
          ],
          example: '4-Story Tall • Jurassic Gentle Giant',
          visuals: [
            { icon: '🦕', label: 'Long Neck', category: '13m Tall', bgColor: '#8b5cf6' },
            { icon: '🌲', label: 'Treetops', category: 'High Browser', bgColor: '#16a34a' },
            { icon: '🏢', label: '4 Stories', category: 'Towering Size', bgColor: '#3b82f6' },
            { icon: '⏳', label: 'Jurassic', category: '150 MYA', bgColor: '#f59e0b' },
          ],
          teacherScript: 'Look up high at Brachiosaurus! Standing as tall as a four-story building in the Jurassic Period, this gentle giant munched treetops 12 meters in the air!',
          narration: 'Brachiosaurus was a towering 13-meter-tall Jurassic herbivore with giraffe-like front legs.',
          quiz: {
            question: 'Why were Brachiosaurus’s front legs longer than its back legs?',
            options: ['To swim underwater', 'To angle its neck upward to reach high treetops', 'To dig tunnels'],
            correctIndex: 1,
            hint: 'Think of how a modern giraffe eats leaves high in trees!',
            workedSolution: 'Long front legs tilted Brachiosaurus’s spine upward like a giraffe so it could effortlessly reach leaves 12 meters high!',
            explanation: 'Brilliant! Just like a giraffe, it reached the highest treetops!',
          },
          color: '#8b5cf6',
        },
        {
          title: 'ASTEROID EXTINCTION & BIRDS',
          subtitle: 'The Chicxulub impact 66 million years ago—and the dinosaurs still alive!',
          timelineYear: '66 Million Years Ago',
          imageQuery: 'Chicxulub crater',
          definition:
            '66 million years ago, a 10-kilometer-wide asteroid slammed into Mexico (Chicxulub Crater), sending dust across the sky that blocked sunlight and cooled Earth. Non-avian dinosaurs went extinct—yet small feathered theropods survived and evolved into today’s BIRDS!',
          formulaOrRule: 'Impact: 66 MYA (Chicxulub)  |  Living Dinosaurs Today: Birds!',
          propKind: 'sun',
          types: [
            { name: 'Impact Winter', detail: 'Blocked sunlight stopped photosynthesis, collapsing giant food chains' },
            { name: 'Feathered Survivors', detail: 'Small feathered dinosaurs survived and gave rise to eagles, chickens, and sparrows!' },
          ],
          workedExample: {
            problem: 'Trace the chain reaction after the Chicxulub asteroid struck Earth 66 million years ago:',
            steps: [
              { label: 'Step 1: Dust Blocks Sunlight', work: 'Asteroid dust cloud blankets Earth’s atmosphere', speak: 'First, the massive impact threw dust high into the sky, blocking warm sunlight.' },
              { label: 'Step 2: Plants Stop Growing', work: 'No Sunlight → No Photosynthesis → Plant food drops', speak: 'Second, without sunlight, green plants could not perform photosynthesis, so giant herbivores ran out of food.' },
              { label: 'Step 3: Small Survivors Thrive', work: 'Small mammals & feathered birds survive and diversify!', speak: 'Third, small warm-blooded mammals and feathered birds survived—opening the Age of Mammals and modern birds!' },
            ],
            finalAnswer: 'Impact Winter ended giant dinosaurs; birds & mammals survived!',
          },
          examples: [
            'Scientists discovered a thin worldwide layer of IRIDIUM rock dust proving the asteroid impact!',
            'Every BIRD flying outside your window today is scientifically a living feathered dinosaur!',
          ],
          example: '66 MYA Asteroid Impact • Birds Are Living Dinosaurs!',
          visuals: [
            { icon: '☄️', label: 'Asteroid', category: '10km Wide', bgColor: '#f97316' },
            { icon: '🌋', label: 'Dust Cloud', category: 'Blocked Sun', bgColor: '#ef4444' },
            { icon: '🦅', label: 'Modern Birds', category: 'Survivors!', bgColor: '#38bdf8' },
            { icon: '🪨', label: 'Fossil Layer', category: 'Iridium Clue', bgColor: '#64748b' },
          ],
          teacherScript: '66 million years ago a giant asteroid struck Earth, ending the reign of T-Rex and Triceratops—yet small feathered dinosaurs survived to become today’s birds!',
          narration: 'A 10-kilometer asteroid struck Earth 66 million years ago, ending giant dinosaurs while feathered birds survived.',
          quiz: {
            question: 'Which modern animals are the direct living descendants of feathered dinosaurs?',
            options: ['Birds', 'Frogs', 'Sharks'],
            correctIndex: 0,
            hint: 'Think of hollow bones, feathers, and laying hard-shelled eggs!',
            workedSolution: 'Birds share hollow bones, wishbones, feathers, and nesting behavior with small theropod dinosaurs—making birds living dinosaurs!',
            explanation: 'Amazing! Birds are the living descendants of dinosaurs!',
          },
          color: '#f97316',
        },
      ],
    };
  }

  if (q.includes('volcano') || q.includes('eruption') || q.includes('geography') || q.includes('tectonic') || q.includes('earth structure') || q.includes('earthquake')) {
    return {
      title: `Geography: Volcanoes, Eruptions & Earth's Structure (${gradeLevel})`,
      category: 'Physical Geography & Geology',
      gradeLevel,
      sceneType: 'concept-gallery',
      description:
        'Explore the fiery forces shaping planet Earth: Earth’s 4 internal layers, moving Tectonic Plates, Volcanic Eruptions, Types of Volcanoes, and the Ring of Fire!',
      teacherIntro: `Welcome ${gradeLevel} geographers! Beneath our feet lies a restless, fiery engine that builds mountains, moves continents, and powers volcanic eruptions! Let us journey inside Earth and explore volcanoes step by step!`,
      narration: `Welcome to the Geography and Volcanoes VR World for ${gradeLevel}! Discover Earth’s layers, tectonic plates, volcanic eruptions, and real geography photographs!`,
      facts: [
        { label: 'Earth’s 4 Layers', value: 'Crust • Mantle • Outer & Inner Core' },
        { label: 'Magma vs Lava', value: 'Underground vs Surface' },
        { label: 'Active Belt', value: 'Pacific Ring of Fire (75%)' },
        { label: 'Tallest in Africa', value: 'Mt. Kilimanjaro (Dormant)' },
      ],
      parts: [
        { name: 'Stage Base', geometry: 'cylinder', args: [2.4, 2.6, 0.2, 32], position: [0, -2.0, 0], rotation: [0, 0, 0], color: '#7c2d12', emissive: '#ef4444' },
        { name: 'Orbit Ring', geometry: 'torus', args: [2.7, 0.06, 16, 48], position: [0, -1.8, 0], rotation: [1.57, 0, 0], color: '#f97316', animate: 'spinZ' },
      ],
      stations: [
        {
          title: 'EARTH’S 4 INTERNAL LAYERS',
          subtitle: 'Crust, Mantle, Liquid Outer Core, and Solid Inner Core',
          timelineYear: 'Radius: 6,371 km',
          imageQuery: 'Structure of Earth',
          definition:
            'Planet Earth is structured like a giant peach with four main layers! We live on the thin rocky Crust, floating above the churning hot Mantle (84% of Earth’s volume), surrounding a liquid iron Outer Core and a 6,000°C solid iron-nickel Inner Core.',
          formulaOrRule: 'Outside → Inside: Crust → Mantle → Outer Core (Liquid) → Inner Core (Solid)',
          propKind: 'globe',
          types: [
            { name: 'Crust (5–70 km)', detail: 'Thin solid rock shell forming all continents and ocean floors' },
            { name: 'Mantle (2,900 km)', detail: 'Hot semi-molten rock moving in slow convection currents that drive plates' },
            { name: 'Outer & Inner Core', detail: 'Liquid outer iron creates Earth’s magnetic shield; solid inner core reaches 6,000°C!' },
          ],
          workedExample: {
            problem: 'Compare Earth’s Crust thickness (35 km average) to Earth’s full radius (6,371 km). Why is the crust compared to an apple’s skin?',
            steps: [
              { label: 'Step 1: Compare Numbers', work: 'Crust ≈ 35 km  |  Earth Radius ≈ 6,371 km', speak: 'First, compare the crust’s 35 kilometer thickness with Earth’s 6,371 kilometer radius.' },
              { label: 'Step 2: Calculate Percentage', work: '(35 ÷ 6,371) × 100 ≈ 0.55% (Less than 1%!)', speak: 'Divide 35 by 6,371 and multiply by 100—the crust is barely half of one percent of Earth’s radius!' },
              { label: 'Step 3: Geographic Insight', work: 'Because the crust is so thin, Mantle heat can crack it and form volcanoes!', speak: 'Because the rocky crust is paper-thin compared to the Mantle, hot magma easily pushes through cracks to build volcanoes!' },
            ],
            finalAnswer: 'Crust is < 1% of Earth’s depth — just like an apple skin!',
          },
          examples: [
            'The MANTLE makes up 84% of Earth’s total volume and drives continental drift.',
            'The LIQUID OUTER CORE spins to generate Earth’s protective MAGNETIC FIELD.',
          ],
          example: 'Crust → Mantle → Outer Core → Inner Core',
          visuals: [
            { icon: '🌍', label: 'Rocky Crust', category: 'Surface Shell', bgColor: '#22c55e' },
            { icon: '🔥', label: 'Hot Mantle', category: '84% Volume', bgColor: '#f97316' },
            { icon: '🧲', label: 'Outer Core', category: 'Magnetic Field', bgColor: '#ef4444' },
            { icon: '☀️', label: 'Inner Core', category: '6,000°C Solid', bgColor: '#facc15' },
          ],
          teacherScript: 'Lesson 1 is Earth’s Structure! From the thin rocky crust we walk on, down through the churning Mantle, to the 6,000-degree iron core!',
          narration: 'Earth has four layers: the thin rocky Crust, thick churning Mantle, liquid iron Outer Core, and blazing solid Inner Core.',
          quiz: {
            question: 'Which layer of Earth makes up 84% of our planet’s volume and moves tectonic plates?',
            options: ['The Crust', 'The Mantle', 'The Clouds'],
            correctIndex: 1,
            hint: 'It sits directly beneath the thin rocky crust!',
            workedSolution: 'The Mantle lies right below the crust, spans 2,900 km deep, and makes up 84% of Earth’s volume!',
            explanation: 'Awesome! The Mantle makes up 84% of Earth’s volume!',
          },
          color: '#f59e0b',
        },
        {
          title: 'HOW VOLCANOES ERUPT',
          subtitle: 'Magma rises from deep chambers and erupts onto Earth’s surface as Lava!',
          timelineYear: 'Lava Temp: 700°C – 1,200°C',
          imageQuery: 'Volcanic eruption',
          definition:
            'A volcano is an opening (vent) in Earth’s crust where superheated molten rock, volcanic ash, and trapped gases escape from deep magma chambers! Underground molten rock is called MAGMA; once it pours onto the surface, it is called LAVA.',
          formulaOrRule: 'Underground = MAGMA   |   On the Surface = LAVA  (700°C–1,200°C)',
          propKind: 'sun',
          types: [
            { name: 'Active Volcano', detail: 'Has erupted recently and is expected to erupt again (e.g., Mt. Etna, Mt. Nyiragongo)' },
            { name: 'Dormant Volcano', detail: 'Sleeping—has not erupted recently but could wake up (e.g., Mt. Kilimanjaro)' },
            { name: 'Extinct Volcano', detail: 'Cut off from magma supply and will never erupt again' },
          ],
          workedExample: {
            problem: 'Trace the 3 steps that cause a dramatic volcanic eruption:',
            steps: [
              { label: 'Step 1: Magma Chamber Builds Pressure', work: 'Hot magma + trapped gases rise because hot rock is less dense', speak: 'First, superheated magma and dissolved gases collect inside an underground magma chamber, building huge pressure.' },
              { label: 'Step 2: Magma Climbs the Main Vent', work: 'Pressure cracks the rock like shaking a warm soda bottle!', speak: 'Second, just like opening a shaken fizzy drink bottle, trapped gas bubbles expand rapidly and push magma up the main vent.' },
              { label: 'Step 3: Surface Eruption', work: 'Lava flows + Ash Plume erupt through the Crater and cool into new rock!', speak: 'Third, molten lava and volcanic ash burst out of the crater, later cooling into fertile volcanic soil and new mountains!' },
            ],
            finalAnswer: 'Gas Pressure → Magma Rises → Lava & Ash Eruption!',
          },
          examples: [
            'MOUNT NYIRAGONGO in DR Congo is one of Africa’s most active volcanoes with a glowing lava lake!',
            'Cooled volcanic ash creates incredibly FERTILE SOIL for farming coffee and bananas.',
          ],
          example: 'Magma (Inside) → Erupts → Lava (Surface)',
          visuals: [
            { icon: '🌋', label: 'Crater Vent', category: 'Eruption', bgColor: '#ef4444' },
            { icon: '🔥', label: 'Molten Lava', category: '1,100°C', bgColor: '#f97316' },
            { icon: '💨', label: 'Ash Cloud', category: 'Gas & Dust', bgColor: '#64748b' },
            { icon: '🌱', label: 'Fertile Soil', category: 'Mineral Rich', bgColor: '#22c55e' },
          ],
          teacherScript: 'Lesson 2 is Volcanic Eruptions! Remember the key geography vocabulary: molten rock underground is Magma, and once it erupts onto the surface it becomes Lava!',
          narration: 'Volcanoes erupt when trapped gases force hot magma upward through a vent onto the surface as glowing lava and ash.',
          quiz: {
            question: 'What is molten rock called BEFORE it erupts out onto Earth’s surface?',
            options: ['Lava', 'Magma', 'Granite'],
            correctIndex: 1,
            hint: 'Remember: M for Magma = underground in the Mantle/chamber!',
            workedSolution: 'Underground molten rock is called Magma; once it reaches the surface during an eruption, it is called Lava!',
            explanation: 'Spot on! Underground it is Magma; on the surface it becomes Lava!',
          },
          color: '#ef4444',
        },
        {
          title: 'TECTONIC PLATES & RING OF FIRE',
          subtitle: 'Giant jigsaw slabs of Earth’s crust colliding to trigger quakes & volcanoes',
          timelineYear: 'Moves 2 – 10 cm / Year',
          imageQuery: 'Ring of Fire',
          definition:
            'Earth’s outer crust is broken into giant moving puzzle pieces called Tectonic Plates! Where plates collide, pull apart, or slide past each other, we get Earthquakes, towering Mountain Ranges (like the Himalayas), and the Pacific Ring of Fire—home to 75% of Earth’s volcanoes!',
          formulaOrRule: '3 Boundaries: Convergent (Collide) • Divergent (Pull Apart) • Transform (Slide)',
          propKind: 'scale',
          types: [
            { name: 'Convergent Boundary', detail: 'Plates collide → forms explosive stratovolcanoes & tall fold mountains' },
            { name: 'Divergent Boundary', detail: 'Plates pull apart → East African Rift Valley & Mid-Atlantic Ridge!' },
            { name: 'Transform Boundary', detail: 'Plates grind sideways → triggers powerful earthquakes (e.g., San Andreas Fault)' },
          ],
          workedExample: {
            problem: 'If a tectonic plate drifts at 5 centimeters per year, how far does it move in 100 years?',
            steps: [
              { label: 'Step 1: Annual Speed', work: 'Speed = 5 cm per year (about as fast as fingernails grow!)', speak: 'First, note that tectonic plates move about 5 centimeters each year—about the speed your fingernails grow.' },
              { label: 'Step 2: Multiply by 100 Years', work: '5 cm × 100 = 500 cm', speak: 'Multiply 5 centimeters by 100 years to get 500 centimeters.' },
              { label: 'Step 3: Convert to Meters', work: '500 cm ÷ 100 = 5 meters!', speak: 'Divide by 100 centimeters per meter: in one century, the continent moves 5 full meters—and over millions of years, oceans open up!' },
            ],
            finalAnswer: '5 meters per century (500 cm)!',
          },
          examples: [
            'The EAST AFRICAN RIFT VALLEY is a giant divergent zone slowly splitting eastern Africa!',
            'About 75% of all active volcanoes on Earth sit along the PACIFIC RING OF FIRE.',
          ],
          example: '75% of Volcanoes = Pacific Ring of Fire',
          visuals: [
            { icon: '🧩', label: 'Crust Plates', category: 'Moving Slabs', bgColor: '#3b82f6' },
            { icon: '🔥', label: 'Ring of Fire', category: '75% Volcanoes', bgColor: '#ef4444' },
            { icon: '⛰️', label: 'Fold Mountains', category: 'Collision', bgColor: '#78716c' },
            { icon: '🌊', label: 'Rift Valleys', category: 'Pulling Apart', bgColor: '#06b6d4' },
          ],
          teacherScript: 'Lesson 3 is Tectonic Plates and the Ring of Fire! Earth’s crust moves like giant puzzle slabs, building mountains, rift valleys, earthquakes, and 75% of volcanoes around the Pacific!',
          narration: 'Earth’s crust consists of moving Tectonic Plates whose boundaries create mountains, earthquakes, and the Pacific Ring of Fire.',
          quiz: {
            question: 'What happens at a DIVERGENT plate boundary like the East African Rift Valley?',
            options: ['Plates pull apart', 'Plates freeze solid', 'Oceans vanish'],
            correctIndex: 0,
            hint: '"Diverge" means to move apart in opposite directions!',
            workedSolution: 'Divergent means separating—when two plates pull apart, magma rises to fill the gap, creating rift valleys and new ocean crust!',
            explanation: 'Fantastic! At divergent boundaries, tectonic plates pull apart!',
          },
          color: '#3b82f6',
        },
        {
          title: 'TYPES OF VOLCANOES & LANDMARKS',
          subtitle: 'Shield Volcanoes, Stratovolcanoes & Famous Peaks like Mt. Kilimanjaro',
          timelineYear: 'Kilimanjaro: 5,895 m',
          imageQuery: 'Mount Kilimanjaro',
          definition:
            'Not all volcanoes look the same! Tall steep cones like Mount Vesuvius, Mount Fuji, and Mount Kilimanjaro are Stratovolcanoes built from alternating lava and ash, while broad gentle domes like Hawaii’s Mauna Loa are Shield Volcanoes formed by runny basalt lava.',
          formulaOrRule: 'Steep Explosive Cone = Stratovolcano  |  Wide Gentle Slope = Shield Volcano',
          propKind: 'chart',
          types: [
            { name: 'Stratovolcano (Composite)', detail: 'Tall steep symmetrical cone with explosive eruptions (Mt. Fuji, Mt. Vesuvius, Mt. Kilimanjaro)' },
            { name: 'Shield Volcano', detail: 'Wide gently sloping dome with steady flowing rivers of lava (Mauna Loa, Hawaii)' },
            { name: 'Cinder Cone', detail: 'Smaller steep cone built quickly from glowing volcanic cinders and ash' },
          ],
          workedExample: {
            problem: 'Why does Mount Kilimanjaro in Tanzania have snow at its peak even though it sits near the hot Equator?',
            steps: [
              { label: 'Step 1: Check Peak Altitude', work: 'Mount Kilimanjaro rises 5,895 meters above sea level', speak: 'First, Mount Kilimanjaro is Africa’s tallest mountain, towering 5,895 meters into the sky!' },
              { label: 'Step 2: Apply Altitude Cooling Rule', work: 'Air cools ~6.5°C for every 1,000 meters climbed', speak: 'Second, in geography, air temperature drops about 6.5 degrees Celsius for every 1,000 meters higher you climb.' },
              { label: 'Step 3: Freezing Summit!', work: '5.9 × 6.5°C ≈ 38°C colder at the summit → Snow & Glaciers!', speak: 'Climbing nearly 6 kilometers makes the summit almost 38 degrees colder than the base—cold enough for snow right near the Equator!' },
            ],
            finalAnswer: 'High altitude (5,895m) drops summit temps below freezing!',
          },
          examples: [
            'MOUNT VESUVIUS famously erupted in 79 AD, preserving the Roman city of POMPEII in ash.',
            'MOUNT KILIMANJARO in Tanzania is Africa’s highest peak and a dormant stratovolcano.',
          ],
          example: 'Stratovolcano • Shield Volcano • Cinder Cone',
          visuals: [
            { icon: '🏔️', label: 'Kilimanjaro', category: 'Africa’s Highest', bgColor: '#38bdf8' },
            { icon: '🌋', label: 'Stratovolcano', category: 'Steep Cone', bgColor: '#ef4444' },
            { icon: '🛡️', label: 'Shield Dome', category: 'Wide Lava Flow', bgColor: '#f59e0b' },
            { icon: '🏛️', label: 'Pompeii 79 AD', category: 'Mt. Vesuvius', bgColor: '#8b5cf6' },
          ],
          teacherScript: 'Lesson 4 explores Types of Volcanoes and famous landmarks like Mount Kilimanjaro, Mount Fuji, Mount Vesuvius, and Hawaii’s giant Shield Volcanoes!',
          narration: 'Volcanoes come in distinct shapes including steep Stratovolcanoes like Kilimanjaro and Vesuvius, wide Shield Volcanoes, and Cinder Cones.',
          quiz: {
            question: 'Which famous African dormant volcano is the tallest mountain on the African continent?',
            options: ['Mount Everest', 'Mount Kilimanjaro', 'Mount Fuji'],
            correctIndex: 1,
            hint: 'It stands 5,895 meters tall in Tanzania!',
            workedSolution: 'Mount Kilimanjaro in Tanzania stands 5,895 meters high, making it the tallest mountain in Africa and a giant dormant stratovolcano!',
            explanation: 'Champion geographer! Mount Kilimanjaro is Africa’s tallest peak!',
          },
          color: '#10b981',
        },
      ],
    };
  }

  if (q.includes('profit') || q.includes('loss') || q.includes('cost price') || q.includes('selling price')) {
    return {
      title: `Mastering Profit & Loss (${gradeLevel})`,
      category: 'Mathematics & Commercial Arithmetic',
      gradeLevel,
      sceneType: 'concept-gallery',
      description:
        'Master Cost Price, Selling Price, Profit, Loss, and Percentage Profit/Loss through animated step-by-step worked examples, 3D visual props, and interactive market activities!',
      teacherIntro: `Welcome ${gradeLevel} scholars! Today we are mastering Profit and Loss—the exact math shopkeepers, bakers, and entrepreneurs use every single day! Let us work through every definition, formula, step-by-step calculation, and activity together!`,
      narration: `Welcome to the Profit and Loss Virtual Classroom for ${gradeLevel}! Click Play Full VR Video Lesson to walk through Cost Price, Selling Price, Profit, Loss, and worked calculations step by step!`,
      facts: [
        { label: 'Class Level', value: gradeLevel },
        { label: 'Profit Rule', value: 'Profit = SP − CP (SP > CP)' },
        { label: 'Loss Rule', value: 'Loss = CP − SP (CP > SP)' },
        { label: 'Percentage', value: '(Profit or Loss ÷ CP) × 100' },
      ],
      parts: [
        { name: 'Stage Base', geometry: 'cylinder', args: [2.4, 2.6, 0.2, 32], position: [0, -2.0, 0], rotation: [0, 0, 0], color: '#1e293b', emissive: '#3b82f6' },
        { name: 'Orbit Ring', geometry: 'torus', args: [2.7, 0.06, 16, 48], position: [0, -1.8, 0], rotation: [1.57, 0, 0], color: '#facc15', animate: 'spinZ' },
      ],
      stations: [
        {
          title: 'COST PRICE (CP)',
          subtitle: 'The total amount paid to buy or make an item before selling',
          definition:
            'Cost Price (CP) is the exact amount of money a trader pays to buy goods from a wholesaler or manufacture them in a factory—including extra expenses like transport or repair (overhead costs).',
          formulaOrRule: 'Total Cost Price (CP) = Buying Price + Overhead Expenses (Transport / Repairs)',
          propKind: 'coins',
          types: [
            { name: 'Purchase Cost', detail: 'Amount paid to a supplier for ready-made items (e.g., buying a bag for $20)' },
            { name: 'Production & Overhead Cost', detail: 'Raw materials plus transport or repair costs added before selling' },
          ],
          workedExample: {
            problem: 'A shopkeeper buys a used bicycle for $60 and spends $15 repairing the brakes. What is the Total Cost Price (CP)?',
            steps: [
              { label: 'Step 1: List Buying Price', work: 'Buying Price = $60', speak: 'First, write down the initial buying price of the bicycle, which is 60 dollars.' },
              { label: 'Step 2: List Overhead Expense', work: 'Repair Expense = $15', speak: 'Next, notice the shopkeeper spent 15 dollars repairing the brakes. That is an overhead cost.' },
              { label: 'Step 3: Add Together for Total CP', work: 'Total CP = $60 + $15 = $75', speak: 'Add 60 dollars plus 15 dollars! That gives a Total Cost Price of 75 dollars!' },
            ],
            finalAnswer: 'Total Cost Price (CP) = $75',
          },
          examples: [
            'A baker spends $18 on flour and sugar — her COST PRICE is $18.',
            'Buying a crate of drinks for $12 plus $2 bus fare makes the TOTAL COST PRICE $14.',
          ],
          example: 'Total CP = Buying Price + Overhead Costs',
          visuals: [
            { icon: '📦', label: 'Wholesale Box', category: 'Supply', bgColor: '#3b82f6' },
            { icon: '🧾', label: 'Receipt', category: 'Purchase Record', bgColor: '#10b981' },
            { icon: '🚚', label: 'Delivery Fee', category: 'Overhead', bgColor: '#f59e0b' },
            { icon: '💰', label: 'Capital Spent', category: 'Total CP', bgColor: '#8b5cf6' },
          ],
          teacherScript:
            'Lesson 1 is Cost Price! Remember, Cost Price is everything the seller spends to buy or prepare an item for sale, including transport or repair expenses.',
          narration:
            'Lesson 1 is Cost Price! Cost Price is the total amount spent to buy or make an item, including any transport or repair expenses.',
          quiz: {
            question: 'Ada buys a box of notebooks for $25 and pays $5 for delivery. What is her Total Cost Price (CP)?',
            options: ['$20', '$30', '$25'],
            correctIndex: 1,
            hint: 'Remember to ADD the delivery overhead expense to the buying price!',
            workedSolution: 'Step 1: Buying price is $25. Step 2: Delivery overhead is $5. Step 3: Total Cost Price equals 25 plus 5, which is 30 dollars!',
            explanation: 'Spot on! $25 buying price + $5 delivery = $30 Total Cost Price!',
          },
          color: '#3b82f6',
        },
        {
          title: 'SELLING PRICE (SP)',
          subtitle: 'The price a customer pays to buy the item from the seller',
          definition:
            'Selling Price (SP) is the final amount of money a shopkeeper receives from a customer when an item is sold. Comparing Selling Price against Cost Price immediately tells us whether the business made a Profit or suffered a Loss!',
          formulaOrRule: 'If SP > CP → PROFIT!  |  If SP < CP → LOSS!  |  If SP = CP → BREAK-EVEN',
          propKind: 'scale',
          types: [
            { name: 'Marked / Tag Price', detail: 'The original price printed on the shop price tag before any discount' },
            { name: 'Net Selling Price', detail: 'Final amount paid after subtracting any discount (SP = Marked Price − Discount)' },
          ],
          workedExample: {
            problem: 'A jacket has a price tag of $50. The store offers a $8 holiday discount. What is the Selling Price (SP)?',
            steps: [
              { label: 'Step 1: Write Marked Price & Discount', work: 'Marked Price = $50, Discount = $8', speak: 'First, identify the tag price of 50 dollars and the holiday discount of 8 dollars.' },
              { label: 'Step 2: Subtract Discount', work: 'SP = $50 − $8', speak: 'A discount reduces the price for the buyer, so subtract 8 from 50.' },
              { label: 'Step 3: Solve Final SP', work: 'Selling Price (SP) = $42', speak: '50 minus 8 equals 42 dollars! So the customer pays a Selling Price of 42 dollars.' },
            ],
            finalAnswer: 'Selling Price (SP) = $42',
          },
          examples: [
            'The customer paid $35 at the counter — the SELLING PRICE is $35.',
            'If a book costs $10 (CP) and sells for $10 (SP), the trader BREAKS EVEN.',
          ],
          example: 'SP = Money received from customer',
          visuals: [
            { icon: '🏷️', label: 'Price Tag', category: 'Marked Price', bgColor: '#10b981' },
            { icon: '🛍️', label: 'Customer Buys', category: 'Sale Made', bgColor: '#06b6d4' },
            { icon: '💳', label: 'Checkout Pay', category: 'Revenue', bgColor: '#6366f1' },
            { icon: '🎁', label: 'Discount Off', category: 'Net SP', bgColor: '#f59e0b' },
          ],
          teacherScript:
            'Lesson 2 is Selling Price! Selling Price is what the customer pays at checkout. Always compare Selling Price with Cost Price to see if you gained or lost money.',
          narration:
            'Lesson 2 is Selling Price! Selling Price is the money a seller receives from a customer after any discount.',
          quiz: {
            question: 'A pair of sneakers is marked $40, and the store gives a $6 discount. What is the Selling Price (SP)?',
            options: ['$46', '$34', '$40'],
            correctIndex: 1,
            hint: 'A discount takes money OFF the marked price, so subtract $6 from $40.',
            workedSolution: 'Step 1: Marked price is $40. Step 2: Subtract the $6 discount: 40 minus 6 equals 34 dollars!',
            explanation: 'Brilliant! $40 − $6 discount = $34 Selling Price!',
          },
          color: '#10b981',
        },
        {
          title: 'PROFIT & PROFIT %',
          subtitle: 'Extra money GAINED when Selling Price is greater than Cost Price',
          definition:
            'A Profit (or Gain) happens whenever a trader sells an item for MORE than its Cost Price (SP > CP). To measure how strong that gain is, we calculate Profit Percentage by comparing Profit to the original Cost Price!',
          formulaOrRule: 'Profit = SP − CP   |   Profit % = (Profit ÷ CP) × 100%',
          propKind: 'chart',
          types: [
            { name: 'Profit Amount', detail: 'Exact cash gained: Profit = Selling Price − Cost Price' },
            { name: 'Percentage Profit (Profit %)', detail: 'Always divided by COST PRICE: (Profit ÷ CP) × 100%' },
          ],
          workedExample: {
            problem: 'A trader buys a backpack for $20 (CP) and sells it for $25 (SP). Find both the Profit and the Profit Percentage.',
            steps: [
              { label: 'Step 1: Compare SP and CP', work: 'CP = $20, SP = $25 → Since SP > CP, it is a PROFIT!', speak: 'First, compare 25 dollars and 20 dollars. Selling Price is bigger than Cost Price, so we have a profit!' },
              { label: 'Step 2: Calculate Profit Amount', work: 'Profit = SP − CP = $25 − $20 = $5', speak: 'Subtract Cost Price from Selling Price: 25 minus 20 gives a profit of 5 dollars.' },
              { label: 'Step 3: Apply Profit % Formula', work: 'Profit % = ($5 ÷ $20) × 100', speak: 'Now divide the 5 dollar profit by the original Cost Price of 20 dollars, then multiply by 100.' },
              { label: 'Step 4: Simplify to Final %', work: '5 ÷ 20 = 0.25 → 0.25 × 100 = 25%', speak: '5 divided by 20 is one quarter, and one quarter of 100 is 25 percent profit!' },
            ],
            finalAnswer: 'Profit = $5  |  Profit % = 25%',
          },
          examples: [
            'Buying a watch for $40 and selling it for $50 earns a $10 PROFIT (25% gain).',
            'PROFIT PERCENTAGE is ALWAYS calculated using Cost Price on the bottom!',
          ],
          example: 'Profit = SP − CP | Profit % = (Profit÷CP)×100',
          visuals: [
            { icon: '📈', label: 'Rising Gain', category: 'SP > CP', bgColor: '#22c55e' },
            { icon: '💵', label: 'Extra Cash', category: 'SP − CP', bgColor: '#10b981' },
            { icon: '💯', label: 'Profit %', category: '(P ÷ CP) × 100', bgColor: '#eab308' },
            { icon: '🏆', label: 'Smart Trade', category: 'Success', bgColor: '#3b82f6' },
          ],
          teacherScript:
            'Lesson 3 is Profit and Profit Percentage! Whenever Selling Price beats Cost Price, you earn a profit. Remember the golden rule: Profit equals SP minus CP, and Profit Percentage always divides by Cost Price!',
          narration:
            'Lesson 3 is Profit and Profit Percentage! Profit equals Selling Price minus Cost Price, and Profit Percentage equals Profit divided by Cost Price times 100.',
          quiz: {
            question: 'A fruit seller buys mangoes for $40 (CP) and sells them all for $50 (SP). What is the Profit Percentage?',
            options: ['10%', '20%', '25%'],
            correctIndex: 2,
            hint: 'First find Profit = $50 − $40 = $10. Then divide $10 by Cost Price ($40) and multiply by 100!',
            workedSolution: 'Step 1: Profit = 50 minus 40 = 10 dollars. Step 2: Profit percent = (10 divided by 40) times 100. Since 10 over 40 is 1/4, one quarter of 100 is 25 percent!',
            explanation: 'Superstar! Profit = $10, and ($10 ÷ $40) × 100 = 25% Profit!',
          },
          color: '#22c55e',
        },
        {
          title: 'LOSS & LOSS %',
          subtitle: 'Money LOST when Selling Price is lower than Cost Price',
          definition:
            'A Loss occurs when a seller has to sell an item for LESS than what they paid for it (SP < CP)—for instance during clearance sales or if goods get damaged. Just like profit, Loss Percentage is ALWAYS calculated over Cost Price!',
          formulaOrRule: 'Loss = CP − SP   |   Loss % = (Loss ÷ CP) × 100%',
          propKind: 'trophy',
          types: [
            { name: 'Loss Amount', detail: 'Cash lost on the sale: Loss = Cost Price − Selling Price' },
            { name: 'Percentage Loss (Loss %)', detail: 'Always divided by COST PRICE: (Loss ÷ CP) × 100%' },
          ],
          workedExample: {
            problem: 'A phone shop buys a headset for $50 (CP) but sells it on clearance for $40 (SP). Find the Loss and Loss Percentage.',
            steps: [
              { label: 'Step 1: Compare CP and SP', work: 'CP = $50, SP = $40 → Since CP > SP, it is a LOSS!', speak: 'First, compare Cost Price 50 dollars with Selling Price 40 dollars. Because Cost Price is higher, the shop made a loss.' },
              { label: 'Step 2: Calculate Loss Amount', work: 'Loss = CP − SP = $50 − $40 = $10', speak: 'Subtract Selling Price from Cost Price: 50 minus 40 equals a 10 dollar loss.' },
              { label: 'Step 3: Apply Loss % Formula', work: 'Loss % = ($10 ÷ $50) × 100', speak: 'Divide the 10 dollar loss by the original Cost Price of 50 dollars, and multiply by 100.' },
              { label: 'Step 4: Solve Final Loss %', work: '10 ÷ 50 = 0.20 → 0.20 × 100 = 20%', speak: '10 divided by 50 is one fifth, and one fifth of 100 equals a 20 percent loss!' },
            ],
            finalAnswer: 'Loss = $10  |  Loss % = 20%',
          },
          examples: [
            'Buying a lamp for $30 and selling it for $24 causes a $6 LOSS (20% loss).',
            'Always divide Loss by the ORIGINAL COST PRICE—never by Selling Price!',
          ],
          example: 'Loss = CP − SP | Loss % = (Loss÷CP)×100',
          visuals: [
            { icon: '📉', label: 'Price Drop', category: 'SP < CP', bgColor: '#ef4444' },
            { icon: '💸', label: 'Cash Lost', category: 'CP − SP', bgColor: '#f97316' },
            { icon: '🏷️', label: 'Clearance', category: 'Below Cost', bgColor: '#ec4899' },
            { icon: '🧮', label: 'Loss %', category: '(L ÷ CP) × 100', bgColor: '#a855f7' },
          ],
          teacherScript:
            'Lesson 4 is Loss and Loss Percentage! When Selling Price drops below Cost Price, subtract SP from CP to find the Loss, then divide by Cost Price and multiply by 100!',
          narration:
            'Lesson 4 is Loss and Loss Percentage! Loss equals Cost Price minus Selling Price, and Loss Percentage equals Loss divided by Cost Price times 100.',
          quiz: {
            question: 'Sam buys a skateboard for $80 (CP) and sells it later for $60 (SP). What is his Loss Percentage?',
            options: ['20%', '25%', '15%'],
            correctIndex: 1,
            hint: 'Find Loss = $80 − $60 = $20. Then compute ($20 ÷ $80) × 100!',
            workedSolution: 'Step 1: Loss = 80 minus 60 = 20 dollars. Step 2: Loss percent = (20 divided by 80) times 100. Since 20 over 80 equals one quarter, one quarter of 100 is 25 percent loss!',
            explanation: 'Champion! Loss = $20, and ($20 ÷ $80) × 100 = 25% Loss!',
          },
          color: '#ef4444',
        },
      ],
    };
  }

  if (
    (q.includes('part') && q.includes('speech')) ||
    q.includes('grammar') ||
    q.includes('noun') ||
    q.includes('verb') ||
    q.includes('adjective') ||
    q.includes('adverb')
  ) {
    return {
      title: 'Parts of Speech — Interactive VR Lesson',
      category: 'English Language & Grammar',
      sceneType: 'concept-gallery',
      description:
        'Step inside the Edvoura VR Grammar Classroom! Explore all 8 Parts of Speech with clear definitions, types, illustrated picture cards, real sentences, and quick quizzes.',
      teacherIntro:
        'Hello class! Every single word we speak or write has a special job in a sentence. We group all English words into 8 families called the Parts of Speech. Let us explore each one together!',
      narration:
        'Welcome to your Parts of Speech Virtual Classroom! Every English word belongs to one of 8 families: Nouns, Pronouns, Verbs, Adjectives, Adverbs, Prepositions, Conjunctions, and Interjections. Click Start Teacher Tour or tap any illustrated poster board to learn its definition, types, pictures, and examples!',
      facts: [
        { label: 'Total Families', value: '8 Parts of Speech' },
        { label: 'Naming Words', value: 'Nouns & Pronouns' },
        { label: 'Action Words', value: 'Verbs' },
        { label: 'Describing Words', value: 'Adjectives & Adverbs' },
      ],
      parts: [
        {
          name: 'Classroom Stage Base',
          geometry: 'cylinder',
          args: [2.4, 2.6, 0.2, 32],
          position: [0, -2.0, 0],
          rotation: [0, 0, 0],
          color: '#1e293b',
          emissive: '#3b82f6',
        },
        {
          name: 'Hologram Orbit Ring',
          geometry: 'torus',
          args: [2.7, 0.06, 16, 48],
          position: [0, -1.8, 0],
          rotation: [1.57, 0, 0],
          color: '#facc15',
          animate: 'spinZ',
        },
      ],
      stations: [
        {
          title: 'NOUN',
          subtitle: 'A naming word for a person, place, animal, thing, or idea',
          definition:
            'A Noun is a naming word! Whenever you name a person, a place, an animal, an object, or even a feeling/idea, you are using a noun.',
          types: [
            { name: 'Proper Noun', detail: 'Special names with capital letters (e.g., Lagos, Ada, Monday)' },
            { name: 'Common Noun', detail: 'Everyday general names (e.g., teacher, city, dog, desk)' },
            { name: 'Collective Noun', detail: 'Names a group as one (e.g., a flock of birds, a class of pupils)' },
            { name: 'Abstract Noun', detail: 'Feelings or ideas you cannot touch (e.g., honesty, joy, courage)' },
          ],
          examples: [
            'The TEACHER wrote a story in her BOOK.',
            'My PUPPY loves running in the PARK in LAGOS.',
            'KINDNESS and HONESTY make a great friend.',
          ],
          example: 'Ex: teacher, Lagos, puppy, book, joy',
          visuals: [
            { icon: '👩‍🏫', label: 'Teacher', category: 'Person', bgColor: '#3b82f6' },
            { icon: '🏫', label: 'School', category: 'Place', bgColor: '#10b981' },
            { icon: '🐕', label: 'Puppy', category: 'Animal', bgColor: '#f59e0b' },
            { icon: '📚', label: 'Book', category: 'Thing', bgColor: '#8b5cf6' },
          ],
          teacherScript:
            'Lesson 1 is Noun! A noun is a naming word for a person like a teacher, a place like a school, an animal like a puppy, or a thing like a book. Nouns come in types such as Proper Nouns, Common Nouns, Collective Nouns, and Abstract Nouns!',
          narration:
            'Lesson 1 is Noun! A noun is a naming word for a person like a teacher, a place like a school, an animal like a puppy, or a thing like a book. Nouns come in types such as Proper Nouns, Common Nouns, Collective Nouns, and Abstract Nouns!',
          quiz: {
            question: 'Which word in this sentence is a NOUN? "The clever boy kicked the ball."',
            options: ['kicked', 'clever', 'ball'],
            correctIndex: 2,
            explanation: 'Correct! "Ball" is a thing (and "boy" is a person), so it is a Noun!',
          },
          color: '#3b82f6',
        },
        {
          title: 'PRONOUN',
          subtitle: 'Takes the place of a noun so we do not repeat names',
          definition:
            'A Pronoun is a stand-in word that replaces a noun! Instead of repeating a person’s name over and over, we use smooth pronouns like he, she, it, we, and they.',
          types: [
            { name: 'Personal Pronoun', detail: 'Refers to people or things (I, you, he, she, it, we, they)' },
            { name: 'Possessive Pronoun', detail: 'Shows ownership (mine, yours, hers, theirs, ours)' },
            { name: 'Demonstrative Pronoun', detail: 'Points out specific things (this, that, these, those)' },
            { name: 'Interrogative Pronoun', detail: 'Asks questions (who, whom, whose, which, what)' },
          ],
          examples: [
            'Amara won the prize because SHE studied hard.',
            'The pupils cheered when THEY solved the puzzle.',
            'That yellow backpack is MINE, not YOURS.',
          ],
          example: 'Ex: he, she, they, we, it, mine',
          visuals: [
            { icon: '👧', label: 'She / Her', category: 'Girl', bgColor: '#8b5cf6' },
            { icon: '👦', label: 'He / Him', category: 'Boy', bgColor: '#06b6d4' },
            { icon: '👨‍👩‍👧‍👦', label: 'They / We', category: 'Group', bgColor: '#ec4899' },
            { icon: '🎁', label: 'It / This', category: 'Object', bgColor: '#f59e0b' },
          ],
          teacherScript:
            'Lesson 2 is Pronoun! A pronoun replaces a noun so our sentences sound smooth instead of repetitive. Instead of saying "Amara opened Amara’s bag", we say "Amara opened her bag". Types include Personal, Possessive, and Demonstrative pronouns!',
          narration:
            'Lesson 2 is Pronoun! A pronoun replaces a noun so our sentences sound smooth instead of repetitive. Instead of saying "Amara opened Amara’s bag", we say "Amara opened her bag".',
          quiz: {
            question: 'Which pronoun replaces "David and I"?',
            options: ['We', 'She', 'It'],
            correctIndex: 0,
            explanation: 'Spot on! "David and I" is replaced by the pronoun "We"!',
          },
          color: '#8b5cf6',
        },
        {
          title: 'VERB',
          subtitle: 'An action word or state of being — the engine of every sentence',
          definition:
            'A Verb tells what the subject DOES or IS! Every complete sentence must have at least one verb, whether it is a physical action like jumping or a state of being like is and am.',
          types: [
            { name: 'Action Verb', detail: 'Shows physical or mental action (run, write, sing, think)' },
            { name: 'Linking Verb', detail: 'Connects subject to description (am, is, are, was, seem)' },
            { name: 'Helping (Auxiliary) Verb', detail: 'Helps the main verb show tense (have, will, can, must)' },
          ],
          examples: [
            'The athlete RUNS fast and JUMPS over the hurdle.',
            'Our teacher EXPLAINS the science experiment clearly.',
            'The pupils ARE excited and WILL VISIT the museum.',
          ],
          example: 'Ex: run, write, sing, think, is, are',
          visuals: [
            { icon: '🏃', label: 'Run', category: 'Physical Action', bgColor: '#ef4444' },
            { icon: '✍️', label: 'Write', category: 'Study Action', bgColor: '#f97316' },
            { icon: '🎤', label: 'Sing', category: 'Creative Action', bgColor: '#ec4899' },
            { icon: '🧠', label: 'Think', category: 'Mental Action', bgColor: '#6366f1' },
          ],
          teacherScript:
            'Lesson 3 is Verb! A verb is the engine of every sentence—it shows an action like run, write, sing, and think, or a state of being like is and are. Remember the 3 main types: Action Verbs, Linking Verbs, and Helping Verbs!',
          narration:
            'Lesson 3 is Verb! A verb is the engine of every sentence—it shows an action like run, write, sing, and think, or a state of being like is and are.',
          quiz: {
            question: 'Spot the ACTION VERB in: "The hungry monkey climbed the tall tree."',
            options: ['hungry', 'climbed', 'tall'],
            correctIndex: 1,
            explanation: 'Bravo! "Climbed" is the action the monkey performed, so it is the Verb!',
          },
          color: '#ef4444',
        },
        {
          title: 'ADJECTIVE',
          subtitle: 'Describes a noun by telling its color, size, shape, or number',
          definition:
            'An Adjective is a describing word that paints a picture of a noun! It answers questions like What kind?, Which one?, or How many? to make your writing vivid and colorful.',
          types: [
            { name: 'Descriptive Adjective', detail: 'Shows quality, color, or size (bright, tall, red, clever)' },
            { name: 'Quantitative Adjective', detail: 'Shows amount or number (three, many, few, several)' },
            { name: 'Comparative & Superlative', detail: 'Compares nouns (bigger, biggest; more/most joyful)' },
          ],
          examples: [
            'A BRIGHT, GOLDEN sun rose over the CALM blue sea.',
            'She adopted THREE FLUFFY kittens yesterday.',
            'The CLEVER pupil built a TALL tower.',
          ],
          example: 'Ex: bright, huge, red, three, clever',
          visuals: [
            { icon: '🌟', label: 'Bright Star', category: 'Quality', bgColor: '#f59e0b' },
            { icon: '🐘', label: 'Huge Elephant', category: 'Size', bgColor: '#64748b' },
            { icon: '🍎', label: 'Red Apple', category: 'Color', bgColor: '#ef4444' },
            { icon: '🧊', label: 'Cold Ice', category: 'Texture/Temp', bgColor: '#0ea5e9' },
          ],
          teacherScript:
            'Lesson 4 is Adjective! An adjective describes a noun to make your sentences paint a vivid picture—like a bright star, a huge elephant, a red apple, or cold ice! Adjectives can describe quality, size, color, or numbers.',
          narration:
            'Lesson 4 is Adjective! An adjective describes a noun to make your sentences paint a vivid picture—like a bright star, a huge elephant, a red apple, or cold ice!',
          quiz: {
            question: 'Which word is the ADJECTIVE describing the cake? "Mum baked a delicious cake."',
            options: ['baked', 'delicious', 'Mum'],
            correctIndex: 1,
            explanation: 'Awesome! "Delicious" describes the noun "cake", making it an Adjective!',
          },
          color: '#f59e0b',
        },
        {
          title: 'ADVERB',
          subtitle: 'Describes a verb by telling HOW, WHEN, or WHERE it happens',
          definition:
            'An Adverb adds extra detail to a verb, an adjective, or another adverb! Many adverbs end in "-ly" and tell us HOW (quickly), WHEN (yesterday), WHERE (outside), or HOW OFTEN (always) an action happens.',
          types: [
            { name: 'Adverb of Manner (How?)', detail: 'Tells how something happens (quickly, gently, loudly)' },
            { name: 'Adverb of Time (When?)', detail: 'Tells when it happens (today, yesterday, soon, now)' },
            { name: 'Adverb of Place (Where?)', detail: 'Tells where it happens (here, outside, upstairs)' },
            { name: 'Adverb of Frequency', detail: 'Tells how often (always, often, sometimes, never)' },
          ],
          examples: [
            'The cheetah sprinted QUICKLY across the grass.',
            'Please speak SOFTLY inside the library.',
            'We ALWAYS practice math TOGETHER YESTERDAY and TODAY.',
          ],
          example: 'Ex: quickly, softly, yesterday, always',
          visuals: [
            { icon: '⚡', label: 'Quickly', category: 'Manner (How)', bgColor: '#10b981' },
            { icon: '🐢', label: 'Slowly', category: 'Manner (How)', bgColor: '#14b8a6' },
            { icon: '⏰', label: 'Early / Soon', category: 'Time (When)', bgColor: '#3b82f6' },
            { icon: '📍', label: 'Outside', category: 'Place (Where)', bgColor: '#8b5cf6' },
          ],
          teacherScript:
            'Lesson 5 is Adverb! While an adjective describes a noun, an adverb describes a verb—telling us how, when, where, or how often an action happens, such as running quickly, moving slowly, arriving early, or playing outside!',
          narration:
            'Lesson 5 is Adverb! An adverb describes a verb—telling us how, when, where, or how often an action happens, like quickly, slowly, early, or outside!',
          quiz: {
            question: 'Find the ADVERB of manner: "The little bird sang sweetly in the morning."',
            options: ['little', 'sweetly', 'morning'],
            correctIndex: 1,
            explanation: 'Yes! "Sweetly" tells us HOW the bird sang, so it is an Adverb!',
          },
          color: '#10b981',
        },
        {
          title: 'PREPOSITION',
          subtitle: 'Shows position, direction, or time between words',
          definition:
            'A Preposition is a position or relationship word! It sits before a noun or pronoun to show WHERE something is (on, under, inside), WHERE it is going (into, toward), or WHEN it happens (before, after).',
          types: [
            { name: 'Preposition of Place', detail: 'Shows exact location (on, under, beside, between, inside)' },
            { name: 'Preposition of Time', detail: 'Shows timing (at 8am, on Monday, in July, before lunch)' },
            { name: 'Preposition of Direction', detail: 'Shows movement (into, through, across, toward)' },
          ],
          examples: [
            'The notebook is ON the desk and the shoes are UNDER the bed.',
            'The cat jumped THROUGH the open window.',
            'We wash our hands BEFORE eating dinner.',
          ],
          example: 'Ex: on, under, inside, between, before',
          visuals: [
            { icon: '📦', label: 'Inside Box', category: 'Place', bgColor: '#06b6d4' },
            { icon: '🌉', label: 'Over Bridge', category: 'Direction', bgColor: '#0284c7' },
            { icon: '🪑', label: 'Under Chair', category: 'Position', bgColor: '#6366f1' },
            { icon: '🗓️', label: 'On Monday', category: 'Time', bgColor: '#10b981' },
          ],
          teacherScript:
            'Lesson 6 is Preposition! Think of the word "position" hidden inside preposition. Words like inside, over, under, between, and before tell us where or when something happens in relation to something else!',
          narration:
            'Lesson 6 is Preposition! Words like inside, over, under, between, and before show position, direction, or time!',
          quiz: {
            question: 'Which word is the PREPOSITION? "The puppy hid under the wooden table."',
            options: ['wooden', 'hid', 'under'],
            correctIndex: 2,
            explanation: 'Well done! "Under" shows the puppy’s exact position relative to the table!',
          },
          color: '#06b6d4',
        },
        {
          title: 'CONJUNCTION',
          subtitle: 'A bridge word that joins words, phrases, or sentences together',
          definition:
            'A Conjunction acts like glue or a bridge that connects words, phrases, or two complete thoughts into one smooth sentence! Remember FANBOYS: For, And, Nor, But, Or, Yet, So.',
          types: [
            { name: 'Coordinating (FANBOYS)', detail: 'Joins equal ideas (for, and, nor, but, or, yet, so)' },
            { name: 'Subordinating Conjunction', detail: 'Shows cause or condition (because, although, if, when)' },
            { name: 'Correlative Conjunction', detail: 'Works in pairs (either...or, neither...nor, both...and)' },
          ],
          examples: [
            'I packed apples AND bananas for lunch.',
            'She wanted to play outside, BUT it started raining.',
            'He smiled BECAUSE he aced his science quiz!',
          ],
          example: 'Ex: and, but, or, because, so, although',
          visuals: [
            { icon: '🔗', label: 'And (Joins)', category: 'Addition', bgColor: '#ec4899' },
            { icon: '⚖️', label: 'But (Contrast)', category: 'Opposite', bgColor: '#f43f5e' },
            { icon: '🔀', label: 'Or (Choice)', category: 'Option', bgColor: '#8b5cf6' },
            { icon: '💡', label: 'Because', category: 'Reason', bgColor: '#f59e0b' },
          ],
          teacherScript:
            'Lesson 7 is Conjunction! Think of a conjunction as a bridge that connects words and sentences together—like AND to add ideas, BUT to show contrast, OR for a choice, and BECAUSE to explain a reason!',
          narration:
            'Lesson 7 is Conjunction! A conjunction is a bridge word like and, but, or, and because that joins ideas together smoothly!',
          quiz: {
            question: 'Choose the best CONJUNCTION: "I carried an umbrella ___ the clouds looked dark."',
            options: ['because', 'or', 'under'],
            correctIndex: 0,
            explanation: 'Brilliant! "Because" connects the action to the reason why!',
          },
          color: '#ec4899',
        },
        {
          title: 'INTERJECTION',
          subtitle: 'A burst of sudden strong emotion or excitement!',
          definition:
            'An Interjection is a short exclamation word that expresses sudden emotion—like joy, surprise, pain, or excitement! It usually stands at the start of a sentence followed by an exclamation mark (!).',
          types: [
            { name: 'Joy & Celebration', detail: 'Shows happiness (Hooray!, Yay!, Bravo!)' },
            { name: 'Surprise & Wonder', detail: 'Shows amazement (Wow!, Oh!, Whoa!)' },
            { name: 'Pain or Mistake', detail: 'Shows sudden reaction (Ouch!, Oops!, Uh-oh!)' },
          ],
          examples: [
            'HOORAY! Our class won the robotics trophy!',
            'WOW! Look at that glowing rainbow in the sky!',
            'OUCH! I accidentally bumped my toe on the chair.',
          ],
          example: 'Ex: Wow! Hooray! Ouch! Oops! Bravo!',
          visuals: [
            { icon: '🎉', label: 'Hooray!', category: 'Joy', bgColor: '#facc15' },
            { icon: '😲', label: 'Wow!', category: 'Surprise', bgColor: '#38bdf8' },
            { icon: '🤕', label: 'Ouch!', category: 'Pain', bgColor: '#ef4444' },
            { icon: '🤭', label: 'Oops!', category: 'Mistake', bgColor: '#a855f7' },
          ],
          teacherScript:
            'Lesson 8 is Interjection! An interjection is a burst of sudden feeling—like Hooray when you win, Wow when you see something amazing, Ouch when you stub your toe, or Oops when you drop your pencil!',
          narration:
            'Lesson 8 is Interjection! An interjection expresses sudden emotion like Hooray, Wow, Ouch, or Oops—usually with an exclamation mark!',
          quiz: {
            question: 'Which word is an INTERJECTION expressing excitement?',
            options: ['Quickly', 'Hooray!', 'Between'],
            correctIndex: 1,
            explanation: 'Hooray! You mastered all 8 Parts of Speech like a superstar!',
          },
          color: '#facc15',
        },
      ],
    };
  }

  if (q.includes('water cycle') || q.includes('evaporation') || q.includes('precipitation')) {
    return {
      title: 'The Water Cycle — Interactive VR Lesson',
      category: 'Earth Science & Geography',
      sceneType: 'concept-gallery',
      description:
        'Follow a drop of water around planet Earth through Evaporation, Condensation, Precipitation, and Collection with illustrated visual cards and quizzes!',
      teacherIntro:
        'Welcome young scientists! Earth has been recycling the exact same water for billions of years using heat from the Sun. Let us walk through all 4 stages of the Water Cycle!',
      narration:
        'Welcome to the 3D Water Cycle VR Classroom! Powered by heat from the Sun, Earth recycles water continuously through Evaporation, Condensation, Precipitation, and Collection.',
      facts: [
        { label: 'Energy Engine', value: 'Heat from the Sun' },
        { label: '4 Main Stages', value: 'Evap → Cond → Precip → Collect' },
        { label: 'Water Cover', value: '71% of Earth' },
        { label: 'Cycle Type', value: 'Continuous Loop' },
      ],
      parts: [
        { name: 'Stage Base', geometry: 'cylinder', args: [2.4, 2.6, 0.2, 32], position: [0, -2.0, 0], rotation: [0, 0, 0], color: '#0284c7' },
        { name: 'Cycle Ring', geometry: 'torus', args: [2.7, 0.06, 16, 48], position: [0, -1.8, 0], rotation: [1.57, 0, 0], color: '#38bdf8', animate: 'spinZ' },
      ],
      stations: [
        {
          title: '1. EVAPORATION',
          subtitle: 'The Sun heats liquid water and turns it into rising water vapor',
          definition:
            'Evaporation happens when heat energy from the Sun warms up liquid water in oceans, lakes, and rivers, turning it into an invisible gas called water vapor that floats up into the sky.',
          types: [
            { name: 'Surface Evaporation', detail: 'Water rising from oceans, rivers, puddles, and lakes' },
            { name: 'Transpiration', detail: 'Water vapor released into the air through plant leaves' },
          ],
          examples: [
            'A rain PUDDLE disappears on a sunny afternoon because of EVAPORATION.',
            'Wet clothes dry on a clothesline as water EVAPORATES into the air.',
            'Warm ocean water rises invisibly toward the sky.',
          ],
          example: 'Liquid water + Sun heat → Rising vapor',
          visuals: [
            { icon: '☀️', label: 'Sun Heat', category: 'Energy', bgColor: '#f59e0b' },
            { icon: '🌊', label: 'Oceans', category: 'Source', bgColor: '#0284c7' },
            { icon: '♨️', label: 'Water Vapor', category: 'Gas State', bgColor: '#38bdf8' },
            { icon: '🌿', label: 'Plant Leaves', category: 'Transpiration', bgColor: '#10b981' },
          ],
          teacherScript:
            'Stage 1 is Evaporation! When the bright Sun heats oceans, rivers, and puddles, liquid water turns into invisible water vapor gas and rises up into the sky. Plants also release vapor through their leaves—called transpiration!',
          narration:
            'Stage 1 is Evaporation! The Sun heats liquid water in oceans and lakes, turning it into invisible water vapor that rises into the air.',
          quiz: {
            question: 'What provides the heat energy that drives Evaporation?',
            options: ['The Moon', 'The Sun', 'Windmills'],
            correctIndex: 1,
            explanation: 'Correct! Heat energy from the Sun warms liquid water into rising vapor!',
          },
          color: '#f59e0b',
        },
        {
          title: '2. CONDENSATION',
          subtitle: 'Cool air turns invisible vapor back into tiny cloud droplets',
          definition:
            'Condensation happens when rising water vapor cools down high in the atmosphere and changes back into millions of tiny liquid water droplets or ice crystals that group together to form clouds!',
          types: [
            { name: 'Cloud Formation', detail: 'Cool vapor clustering around dust particles high in the sky' },
            { name: 'Morning Dew & Fog', detail: 'Vapor cooling on grass blades or near cool ground' },
          ],
          examples: [
            'White fluffy CLOUDS form when rising vapor CONDENSES high in the cool sky.',
            'Water droplets appear on the outside of a COLD juice glass through CONDENSATION.',
            'Morning DEW sparkles on grass after a cool night.',
          ],
          example: 'Warm vapor + Cool air → Clouds & Dew',
          visuals: [
            { icon: '☁️', label: 'Clouds', category: 'High Sky', bgColor: '#38bdf8' },
            { icon: '❄️', label: 'Cool Air', category: 'Cooling', bgColor: '#6366f1' },
            { icon: '💧', label: 'Tiny Droplets', category: 'Liquid', bgColor: '#0ea5e9' },
            { icon: '🌫️', label: 'Fog & Dew', category: 'Near Ground', bgColor: '#64748b' },
          ],
          teacherScript:
            'Stage 2 is Condensation! High up in the sky, the air gets chilly. That cool temperature turns invisible vapor back into millions of tiny water droplets, building the clouds we see floating overhead!',
          narration:
            'Stage 2 is Condensation! Rising water vapor cools high in the sky and turns back into millions of tiny droplets to form clouds.',
          quiz: {
            question: 'What happens to water vapor during Condensation?',
            options: ['It cools into liquid droplets/clouds', 'It disappears forever', 'It turns into rock'],
            correctIndex: 0,
            explanation: 'Spot on! Cooling turns invisible vapor gas back into liquid cloud droplets!',
          },
          color: '#38bdf8',
        },
        {
          title: '3. PRECIPITATION',
          subtitle: 'Heavy cloud droplets fall back to Earth as rain, snow, or hail',
          definition:
            'Precipitation happens when water droplets inside clouds bump together, grow heavy, and gravity pulls them back down to Earth! Depending on air temperature, it falls as rain, snow, sleet, or hail.',
          types: [
            { name: 'Rain', detail: 'Liquid water drops falling in warm weather' },
            { name: 'Snow', detail: 'Frozen crystal flakes when air is below 0°C' },
            { name: 'Hail', detail: 'Balls of ice formed inside strong thunderstorm clouds' },
          ],
          examples: [
            'Heavy dark clouds release RAIN over farmlands and cities.',
            'In freezing winter temperatures, precipitation falls as soft SNOW.',
            'GRAVITY pulls heavy droplets from clouds back to Earth.',
          ],
          example: 'Rain, Snow, Sleet, or Hail falling down',
          visuals: [
            { icon: '🌧️', label: 'Rain', category: 'Liquid', bgColor: '#3b82f6' },
            { icon: '🌨️', label: 'Snow', category: 'Frozen Flakes', bgColor: '#38bdf8' },
            { icon: '⛈️', label: 'Storm Hail', category: 'Ice Pellets', bgColor: '#6366f1' },
            { icon: '☂️', label: 'Umbrella', category: 'Rainy Day', bgColor: '#8b5cf6' },
          ],
          teacherScript:
            'Stage 3 is Precipitation! Once cloud droplets become too heavy to float in the air, gravity pulls them down as rain, snow, sleet, or hail to water plants and refill rivers!',
          narration:
            'Stage 3 is Precipitation! Heavy droplets inside clouds fall back down to Earth as rain, snow, sleet, or hail.',
          quiz: {
            question: 'Which of these is NOT a form of precipitation?',
            options: ['Rain', 'Hail', 'Sunlight'],
            correctIndex: 2,
            explanation: 'Awesome! Rain, snow, sleet, and hail are precipitation—sunlight is light energy!',
          },
          color: '#6366f1',
        },
        {
          title: '4. COLLECTION',
          subtitle: 'Fallen water gathers in rivers, lakes, underground, and oceans',
          definition:
            'Collection (also called Accumulation) happens when rainwater flows down hills as runoff into streams, rivers, lakes, and oceans—or soaks deep into soil as groundwater, ready for the cycle to start again!',
          types: [
            { name: 'Surface Runoff', detail: 'Rain flowing downhill into streams, rivers, and oceans' },
            { name: 'Groundwater / Infiltration', detail: 'Water soaking underground into soil and aquifers' },
          ],
          examples: [
            'Mountain streams flow into mighty RIVERS that empty into the OCEAN.',
            'Rain soaks into the soil to feed tree ROOTS and wells.',
            'Once collected, the Sun heats the water and the cycle repeats!',
          ],
          example: 'Rivers, lakes, groundwater & oceans',
          visuals: [
            { icon: '🏞️', label: 'Rivers', category: 'Runoff', bgColor: '#10b981' },
            { icon: '🌊', label: 'Oceans', category: 'Main Storage', bgColor: '#0284c7' },
            { icon: '⛰️', label: 'Mountains', category: 'Downhill Flow', bgColor: '#78716c' },
            { icon: '🌱', label: 'Groundwater', category: 'Soil Soak', bgColor: '#22c55e' },
          ],
          teacherScript:
            'Stage 4 is Collection! Fallen rain flows down mountains into streams, rivers, and oceans, while some soaks underground to nourish plants and wells—ready to evaporate all over again!',
          narration:
            'Stage 4 is Collection! Fallen water gathers in rivers, lakes, underground aquifers, and oceans, completing the water cycle.',
          quiz: {
            question: 'Where does most collected surface water eventually flow?',
            options: ['Back to rivers, lakes, and oceans', 'Into outer space', 'Inside volcanoes'],
            correctIndex: 0,
            explanation: 'You got it! Rivers carry water right back into lakes and oceans!',
          },
          color: '#10b981',
        },
      ],
    };
  }

  if (q.includes('fraction')) {
    return {
      title: 'Fractions — Interactive VR Math Lesson',
      category: 'Mathematics',
      sceneType: 'concept-gallery',
      description:
        'Master Fractions visually! Learn Numerators, Denominators, Types of Fractions (Proper, Improper, Mixed), and Equivalent Fractions with illustrated cards and quizzes.',
      teacherIntro:
        'Welcome to the Math VR Studio! Whenever you slice a pizza, cake, or chocolate bar into equal parts, you are using Fractions. Let us learn how fractions work step by step!',
      narration:
        'Welcome to your 3D Fractions VR Lesson! A fraction represents equal parts of a whole. Explore each station to learn numerators, denominators, types of fractions, and visual examples!',
      facts: [
        { label: 'Top Number', value: 'Numerator (Parts Taken)' },
        { label: 'Bottom Number', value: 'Denominator (Total Parts)' },
        { label: 'Half', value: '1/2 = 2/4 = 50%' },
        { label: 'Quarter', value: '1/4 = 25%' },
      ],
      parts: [
        { name: 'Whole Pie Base', geometry: 'cylinder', args: [2.2, 2.2, 0.35, 32], position: [0, -1.9, 0], rotation: [0, 0, 0], color: '#f59e0b' },
        { name: 'Orbit Ring', geometry: 'torus', args: [2.6, 0.06, 16, 48], position: [0, -1.7, 0], rotation: [1.57, 0, 0], color: '#38bdf8', animate: 'spinZ' },
      ],
      stations: [
        {
          title: 'WHAT IS A FRACTION?',
          subtitle: 'Equal parts of a whole written as Numerator over Denominator',
          definition:
            'A Fraction shows how many EQUAL parts of a whole you have. The top number (Numerator) counts the parts you pick, and the bottom number (Denominator) counts the total equal parts in the whole.',
          types: [
            { name: 'Numerator (Top)', detail: 'Counts the shaded or selected pieces (e.g., 3 in 3/4)' },
            { name: 'Denominator (Bottom)', detail: 'Total equal slices in one whole (e.g., 4 in 3/4)' },
          ],
          examples: [
            'If a pizza has 4 equal slices and you eat 1, you ate 1/4.',
            'In 3/8, the NUMERATOR is 3 and the DENOMINATOR is 8.',
            'All parts MUST be the exact same size to be a true fraction!',
          ],
          example: 'Numerator (Top) ÷ Denominator (Bottom)',
          visuals: [
            { icon: '🍕', label: 'Pizza Slices', category: 'Equal Parts', bgColor: '#f59e0b' },
            { icon: '🎂', label: 'Cake Pieces', category: 'Whole ÷ Parts', bgColor: '#ec4899' },
            { icon: '🍫', label: 'Chocolate Bar', category: 'Grid Parts', bgColor: '#8b5cf6' },
            { icon: '🥧', label: 'Pie Halves', category: '1/2 + 1/2 = 1', bgColor: '#10b981' },
          ],
          teacherScript:
            'Lesson 1: What is a Fraction? A fraction represents equal parts of a whole! Remember: Numerator is up North at the top, and Denominator is Down at the bottom showing total equal slices.',
          narration:
            'A fraction represents equal parts of a whole! The numerator is on top and the denominator is on the bottom.',
          quiz: {
            question: 'In the fraction 3/5, which number is the DENOMINATOR (total equal parts)?',
            options: ['3', '5', '8'],
            correctIndex: 1,
            explanation: 'Correct! 5 is on the bottom—it is the Denominator showing 5 total equal parts!',
          },
          color: '#f59e0b',
        },
        {
          title: 'PROPER FRACTIONS',
          subtitle: 'Top number is SMALLER than the bottom number (less than 1 whole)',
          definition:
            'A Proper Fraction has a numerator smaller than its denominator. That means its value is always less than one full whole—like 1/2, 2/3, or 3/4!',
          types: [
            { name: 'Unit Fraction', detail: 'Has 1 as the numerator (1/2, 1/3, 1/4, 1/8)' },
            { name: 'Common Proper Fraction', detail: 'Numerator < Denominator (2/3, 3/4, 5/6)' },
          ],
          examples: [
            '1/2 of an orange is a PROPER fraction (1 < 2).',
            '3/4 of a glass of water is a PROPER fraction (3 < 4).',
            '5/8 of the class chose soccer (5 < 8).',
          ],
          example: 'Ex: 1/2, 2/3, 3/4, 5/8 (Less than 1)',
          visuals: [
            { icon: '🌓', label: 'Half (1/2)', category: '50%', bgColor: '#3b82f6' },
            { icon: '🍊', label: 'Quarter (1/4)', category: '25%', bgColor: '#f97316' },
            { icon: '🥛', label: 'Three-Quarters', category: '3/4 = 75%', bgColor: '#06b6d4' },
            { icon: '📏', label: 'Less Than 1', category: 'Top < Bottom', bgColor: '#10b981' },
          ],
          teacherScript:
            'Lesson 2: Proper Fractions! A proper fraction has a smaller number on top than on the bottom—like one-half or three-quarters—so it is always less than one whole!',
          narration:
            'A proper fraction has a numerator smaller than its denominator, so it is always less than one whole.',
          quiz: {
            question: 'Which of these is a PROPER fraction?',
            options: ['7/4', '3/5', '9/2'],
            correctIndex: 1,
            explanation: 'Awesome! In 3/5, the top (3) is smaller than the bottom (5), making it Proper!',
          },
          color: '#3b82f6',
        },
        {
          title: 'IMPROPER & MIXED',
          subtitle: 'Fractions equal to or GREATER than 1 whole!',
          definition:
            'An Improper Fraction has a top number bigger than or equal to the bottom (like 5/4). A Mixed Number writes that same amount as a whole number plus a proper fraction (like 1 ¼)!',
          types: [
            { name: 'Improper Fraction', detail: 'Top ≥ Bottom (e.g., 5/4, 7/3, 4/4)' },
            { name: 'Mixed Number', detail: 'Whole number + fraction (e.g., 1 ¼, 2 ⅓)' },
          ],
          examples: [
            '5 quarter-slices of pizza = 5/4 (Improper) = 1 ¼ pizzas (Mixed)!',
            '7/2 halves is equal to 3 ½ wholes.',
            '4/4 equals exactly 1 WHOLE.',
          ],
          example: 'Ex: 5/4 = 1 ¼  |  7/2 = 3 ½',
          visuals: [
            { icon: '🍕', label: '1 Whole + 1/4', category: 'Mixed: 1 ¼', bgColor: '#ec4899' },
            { icon: '⚖️', label: '5/4 = 1 ¼', category: 'Same Value!', bgColor: '#8b5cf6' },
            { icon: '🍎', label: 'Two Halves', category: '2/2 = 1 Whole', bgColor: '#ef4444' },
            { icon: '🧁', label: 'More Than 1', category: 'Top ≥ Bottom', bgColor: '#f59e0b' },
          ],
          teacherScript:
            'Lesson 3: Improper Fractions and Mixed Numbers! If you have 5 quarter-slices of pizza, that is 5/4—an improper fraction—which equals 1 whole pizza plus 1/4, written as the mixed number 1 and one-quarter!',
          narration:
            'An improper fraction like 5/4 has a top bigger than its bottom, and can be written as a mixed number like 1 and one-quarter!',
          quiz: {
            question: 'What is the improper fraction 5/4 written as a Mixed Number?',
            options: ['1 ¼', '2 ½', '4/5'],
            correctIndex: 0,
            explanation: 'Super! 4 quarters make 1 whole, leaving 1 quarter over—so 5/4 = 1 ¼!',
          },
          color: '#ec4899',
        },
        {
          title: 'EQUIVALENT FRACTIONS',
          subtitle: 'Different numbers that represent the EXACT same amount!',
          definition:
            'Equivalent Fractions look different on paper, but cover the exact same portion of the whole! Multiply or divide BOTH top and bottom by the same number to create an equivalent fraction.',
          types: [
            { name: 'Scaling Up', detail: 'Multiply top & bottom by the same number (1/2 × 2/2 = 2/4)' },
            { name: 'Simplifying', detail: 'Divide top & bottom to lowest terms (4/8 ÷ 4/4 = 1/2)' },
          ],
          examples: [
            '1/2 = 2/4 = 3/6 = 4/8 — they all equal HALF!',
            '2/3 is equivalent to 4/6 (multiply both by 2).',
            '6/8 simplifies to 3/4 when you divide both by 2.',
          ],
          example: 'Ex: 1/2 = 2/4 = 4/8 = 50%',
          visuals: [
            { icon: '🟰', label: '1/2 = 2/4', category: 'Equal Value', bgColor: '#10b981' },
            { icon: '✖️', label: 'Multiply Both', category: 'Scale Up', bgColor: '#3b82f6' },
            { icon: '➗', label: 'Divide Both', category: 'Simplify', bgColor: '#f59e0b' },
            { icon: '💯', label: '50% = 1/2', category: 'Percent Link', bgColor: '#8b5cf6' },
          ],
          teacherScript:
            'Lesson 4: Equivalent Fractions! Half a pizza cut into 2 slices is 1/2, and the exact same half cut into 4 slices is 2/4. Different numbers, exact same delicious amount!',
          narration:
            'Equivalent fractions like 1/2, 2/4, and 4/8 use different numbers to show the exact same amount!',
          quiz: {
            question: 'Which fraction is EQUIVALENT to 1/2?',
            options: ['3/6', '2/5', '1/4'],
            correctIndex: 0,
            explanation: 'Spot on! 3 is half of 6, so 3/6 equals 1/2!',
          },
          color: '#10b981',
        },
      ],
    };
  }

  if (q.includes('photosynthesis')) {
    return {
      title: 'Photosynthesis — Interactive VR Science Lesson',
      category: 'Biology & Plant Science',
      sceneType: 'concept-gallery',
      description:
        'Discover how green plants make their own food using Sunlight, Water, and Carbon Dioxide—and release fresh Oxygen for us to breathe!',
      teacherIntro:
        'Welcome biologists! Unlike animals, green plants cook their own food right inside their leaves using sunlight. This amazing process is called Photosynthesis!',
      narration:
        'Welcome to the Photosynthesis VR Lab! Explore how plants combine sunlight, water, and carbon dioxide inside green chloroplasts to produce glucose food and oxygen!',
      facts: [
        { label: 'Photo = Light', value: 'Synthesis = Making' },
        { label: 'Green Pigment', value: 'Chlorophyll' },
        { label: 'Food Made', value: 'Glucose (Sugar)' },
        { label: 'Gas Released', value: 'Fresh Oxygen (O₂)' },
      ],
      parts: [
        { name: 'Stage Base', geometry: 'cylinder', args: [2.4, 2.6, 0.2, 32], position: [0, -2.0, 0], rotation: [0, 0, 0], color: '#15803d' },
        { name: 'Bio Ring', geometry: 'torus', args: [2.7, 0.06, 16, 48], position: [0, -1.8, 0], rotation: [1.57, 0, 0], color: '#4ade80', animate: 'spinZ' },
      ],
      stations: [
        {
          title: '1. SUNLIGHT & CHLOROPHYLL',
          subtitle: 'Green leaves trap sunlight energy like tiny solar panels',
          definition:
            'Inside plant leaves are tiny green kitchens called chloroplasts filled with chlorophyll. Chlorophyll gives leaves their green color and absorbs energy straight from sunlight!',
          types: [
            { name: 'Chloroplast', detail: 'The tiny cell structure where photosynthesis happens' },
            { name: 'Chlorophyll', detail: 'The green pigment that captures sunlight energy' },
          ],
          examples: [
            'Green leaves turn toward SUNLIGHT to capture maximum energy.',
            'CHLOROPHYLL makes healthy leaves look bright green.',
          ],
          example: 'Sunlight + Chlorophyll = Plant Power',
          visuals: [
            { icon: '☀️', label: 'Sunlight', category: 'Energy Source', bgColor: '#f59e0b' },
            { icon: '🌿', label: 'Green Leaf', category: 'Solar Panel', bgColor: '#22c55e' },
            { icon: '🔬', label: 'Chloroplast', category: 'Food Kitchen', bgColor: '#10b981' },
            { icon: '⚡', label: 'Light Energy', category: 'Powers Process', bgColor: '#eab308' },
          ],
          teacherScript:
            'Step 1: Sunlight and Chlorophyll! Green leaves work like natural solar panels. Their green pigment chlorophyll traps sunlight to power food-making!',
          narration: 'Green leaves use chlorophyll to trap sunlight energy like natural solar panels.',
          quiz: {
            question: 'What gives plant leaves their green color and traps sunlight?',
            options: ['Chlorophyll', 'Sand', 'Oxygen'],
            correctIndex: 0,
            explanation: 'Correct! Chlorophyll is the green pigment that captures sunlight!',
          },
          color: '#22c55e',
        },
        {
          title: '2. WATER & CARBON DIOXIDE',
          subtitle: 'Roots drink water while tiny leaf pores breathe in CO₂',
          definition:
            'To cook food, plants need two raw ingredients: Water absorbed from soil through roots (traveling up xylem tubes), and Carbon Dioxide (CO₂) breathed in from the air through microscopic leaf pores called stomata!',
          types: [
            { name: 'Roots & Xylem', detail: 'Pull water & minerals up from soil to leaves' },
            { name: 'Stomata Pores', detail: 'Tiny openings under leaves that let CO₂ enter' },
          ],
          examples: [
            'Plant ROOTS drink rainwater deep inside the soil.',
            'Leaves absorb CARBON DIOXIDE from the surrounding air.',
          ],
          example: 'Ingredients: Water (H₂O) + CO₂',
          visuals: [
            { icon: '💧', label: 'Water (H₂O)', category: 'From Roots', bgColor: '#0ea5e9' },
            { icon: '🌱', label: 'Roots', category: 'Absorb Water', bgColor: '#84cc16' },
            { icon: '💨', label: 'Carbon Dioxide', category: 'From Air', bgColor: '#64748b' },
            { icon: '🍃', label: 'Stomata', category: 'Leaf Pores', bgColor: '#10b981' },
          ],
          teacherScript:
            'Step 2: Raw Ingredients! Plant roots drink water from the soil while tiny leaf pores called stomata breathe in carbon dioxide from the air.',
          narration: 'Roots absorb water from soil and stomata pores breathe in carbon dioxide from the air.',
          quiz: {
            question: 'Which part of the plant drinks water from the soil?',
            options: ['Petals', 'Roots', 'Seeds'],
            correctIndex: 1,
            explanation: 'Yes! Roots pull water and minerals right out of the soil!',
          },
          color: '#0ea5e9',
        },
        {
          title: '3. GLUCOSE & OXYGEN',
          subtitle: 'Plants make sugar food for growth and release fresh Oxygen!',
          definition:
            'Using sunlight energy, leaves turn water and carbon dioxide into Glucose (a sugar that feeds the plant) and release pure Oxygen gas back into the air—keeping humans and animals alive!',
          types: [
            { name: 'Glucose (C₆H₁₂O₆)', detail: 'Energy-rich sugar food stored as starch in roots & fruits' },
            { name: 'Oxygen (O₂)', detail: 'Life-giving gas released into Earth’s atmosphere' },
          ],
          examples: [
            'Sweet FRUITS like mangoes store energy made during photosynthesis.',
            'Forests release OXYGEN that humans and animals breathe every second!',
          ],
          example: 'Outputs: Glucose Food + Fresh Oxygen (O₂)',
          visuals: [
            { icon: '🍎', label: 'Glucose Food', category: 'Plant Energy', bgColor: '#ef4444' },
            { icon: '🌬️', label: 'Oxygen (O₂)', category: 'Air We Breathe', bgColor: '#38bdf8' },
            { icon: '🌳', label: 'Tall Growth', category: 'Healthy Trees', bgColor: '#16a34a' },
            { icon: '🌍', label: 'Life on Earth', category: 'Balanced Air', bgColor: '#6366f1' },
          ],
          teacherScript:
            'Step 3: Amazing Results! Photosynthesis produces glucose sugar to help the plant grow sweet fruits and tall branches, while releasing fresh oxygen for every living creature to breathe!',
          narration: 'Photosynthesis produces glucose food for the plant and releases fresh oxygen for us to breathe!',
          quiz: {
            question: 'What gas do plants release into the air during photosynthesis?',
            options: ['Oxygen', 'Smoke', 'Helium'],
            correctIndex: 0,
            explanation: 'Bravo! Plants release fresh Oxygen gas for humans and animals to breathe!',
          },
          color: '#f59e0b',
        },
      ],
    };
  }

  if (q.includes('rectang') || q.includes('cuboid') || q.includes('brick')) {
    return {
      title: '3D Rectangular Prism (Cuboid)',
      category: 'Mathematics & Geometry',
      sceneType: 'object',
      description:
        'A 3D rectangular solid with 6 rectangular faces, 12 edges, and 8 right-angle vertices. Rotate 360° and explore its formulas!',
      teacherIntro:
        'Hello mathematicians! Meet the 3D Rectangular Prism, also called a Cuboid—just like a cereal box, brick, or classroom book!',
      narration:
        'Here is a 3D Rectangular Prism, also called a Cuboid! Notice its length is longer than its width and height. To find its volume, multiply length times width times height.',
      facts: [
        { label: 'Faces', value: '6 Rectangles' },
        { label: 'Edges / Vertices', value: '12 / 8' },
        { label: 'Volume', value: 'V = l × w × h' },
        { label: 'Surface Area', value: '2(lw + lh + wh)' },
      ],
      parts: [
        {
          name: 'Rectangular Solid',
          geometry: 'box',
          args: [4.6, 2.2, 2.8],
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          color: '#0ea5e9',
          opacity: 0.9,
          wireframeEdges: true,
        },
      ],
      stations: [
        {
          title: '6 FACES, 12 EDGES, 8 VERTICES',
          subtitle: '3 matching pairs of opposite rectangular faces',
          definition:
            'A Rectangular Prism (Cuboid) is a 3D solid made of 6 flat rectangular faces, 12 straight edges, and 8 sharp right-angle corners called vertices.',
          types: [
            { name: 'Faces (6)', detail: 'Top & Bottom, Front & Back, Left & Right rectangles' },
            { name: 'Edges (12)', detail: 'Straight lines where two faces meet' },
            { name: 'Vertices (8)', detail: 'Corner points where three edges meet at 90°' },
          ],
          examples: [
            'A SHOEBOX is a real-world rectangular prism.',
            'A building BRICK and a TEXTBOOK are both cuboids!',
          ],
          example: 'Real objects: Brick, Book, Shoebox, Fridge',
          visuals: [
            { icon: '🧱', label: 'Brick', category: 'Building', bgColor: '#ef4444' },
            { icon: '📦', label: 'Cardboard Box', category: 'Packaging', bgColor: '#f59e0b' },
            { icon: '📘', label: 'Textbook', category: 'School', bgColor: '#3b82f6' },
            { icon: '🧊', label: '90° Corners', category: '8 Vertices', bgColor: '#06b6d4' },
          ],
          teacherScript:
            'Look at our 3D Rectangular Prism! Count its 6 flat rectangular faces arranged in 3 matching pairs, 12 straight edges, and 8 corners—just like a brick or textbook!',
          narration: 'A cuboid has 6 flat rectangular faces arranged in three matching opposite pairs, 12 edges, and 8 corners.',
          quiz: {
            question: 'How many flat rectangular faces does a Cuboid have?',
            options: ['4', '6', '8'],
            correctIndex: 1,
            explanation: 'Correct! Every rectangular prism has 6 faces—top, bottom, front, back, left, and right!',
          },
          color: '#38bdf8',
        },
        {
          title: 'VOLUME FORMULA',
          subtitle: 'Volume = Length × Width × Height',
          definition:
            'Volume measures how much space fits INSIDE the 3D rectangular prism! Simply multiply its Length × Width × Height and write your answer in cubic units (like cm³).',
          types: [
            { name: 'Length (l)', detail: 'The longest side running left to right' },
            { name: 'Width (w)', detail: 'How deep it goes from front to back' },
            { name: 'Height (h)', detail: 'How tall it stands from bottom to top' },
          ],
          examples: [
            'If l = 5 cm, w = 3 cm, h = 2 cm → Volume = 5 × 3 × 2 = 30 cm³!',
            'If a tank is 4m × 2m × 2m → Volume = 16 m³.',
          ],
          example: 'V = l × w × h  (5 × 3 × 2 = 30 cm³)',
          visuals: [
            { icon: '📏', label: 'Length (l)', category: 'Horizontal', bgColor: '#facc15' },
            { icon: '📐', label: 'Width (w)', category: 'Depth', bgColor: '#10b981' },
            { icon: '⬆️', label: 'Height (h)', category: 'Vertical', bgColor: '#8b5cf6' },
            { icon: '🧮', label: 'l × w × h', category: 'Cubic Units', bgColor: '#3b82f6' },
          ],
          teacherScript:
            'To find the volume of a rectangular prism, multiply length times width times height! For example, 5 times 3 times 2 equals 30 cubic centimeters!',
          narration: 'To calculate the volume of a rectangular prism, multiply length times width times height!',
          quiz: {
            question: 'What is the volume of a box with Length 4, Width 3, and Height 2?',
            options: ['9', '24', '14'],
            correctIndex: 1,
            explanation: 'Spot on! 4 × 3 × 2 = 24 cubic units!',
          },
          color: '#facc15',
        },
      ],
    };
  }

  if (q.includes('car') || q.includes('bus') || q.includes('truck') || q.includes('vehicle')) {
    return {
      title: `3D ${topic.trim()} — Engineering Lab`,
      category: 'Engineering & Transport',
      sceneType: 'object',
      description:
        'Explore a 3D four-wheeled vehicle with chassis, cabin, headlights, and spinning wheel-and-axle simple machines!',
      teacherIntro: `Welcome engineers! Let us inspect how a ${topic.trim()} uses simple machines like wheels and axles to move smoothly across the road!`,
      narration: `Here is your 3D ${topic}! Notice how the four cylindrical wheels support the main chassis while the cabin protects passengers inside.`,
      facts: [
        { label: 'Simple Machine', value: 'Wheel & Axle' },
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
        {
          title: 'WHEEL & AXLE',
          subtitle: 'Reduces friction so heavy vehicles roll smoothly',
          definition:
            'The Wheel and Axle is one of the 6 classic Simple Machines! Rolling round tires drastically reduces sliding friction against the road so the engine can move heavy loads effortlessly.',
          types: [
            { name: 'Rubber Tires', detail: 'Grip the road safely while rolling smoothly' },
            { name: 'Axle Shaft', detail: 'Transfers spinning power from the engine to the wheels' },
          ],
          examples: ['Cars, bicycles, and school buses all use WHEEL AND AXLE machines.'],
          example: 'Simple machine that cuts friction',
          visuals: [
            { icon: '🛞', label: 'Rubber Tire', category: 'Grip & Roll', bgColor: '#334155' },
            { icon: '⚙️', label: 'Engine Gears', category: 'Power', bgColor: '#f59e0b' },
            { icon: '🚗', label: 'Body Frame', category: 'Chassis', bgColor: '#ef4444' },
            { icon: '💡', label: 'Headlights', category: 'Night Safety', bgColor: '#facc15' },
          ],
          teacherScript:
            'Look at those spinning wheels! The wheel and axle is a simple machine that reduces friction so the engine can push the vehicle forward smoothly and safely.',
          narration: 'Wheels and axles reduce friction with the road so the engine can move the vehicle smoothly.',
          quiz: {
            question: 'Which simple machine helps a car roll smoothly over a road?',
            options: ['Wheel and Axle', 'Scissors', 'Magnet'],
            correctIndex: 0,
            explanation: 'Yes! The Wheel and Axle reduces friction so vehicles move easily!',
          },
          color: '#facc15',
        },
      ],
    };
  }

  return {
    title: `${topic.trim()} — Interactive VR Lesson`,
    category: 'Edvoura AI VR Classroom',
    sceneType: 'concept-gallery',
    description: `Step inside your Interactive 3D VR Classroom for "${topic.trim()}". Explore definitions, types, visual cards, real-world examples, and a quick check!`,
    teacherIntro: `Welcome to class! Today we are learning all about ${topic.trim()}. Let us explore its meaning, types, visual examples, and a fun quick check together!`,
    narration: `Welcome to your 3D Virtual Reality lesson on ${topic.trim()}! Step through each illuminated classroom poster board to learn its definition, key types, real-world examples, and test your understanding.`,
    facts: [
      { label: 'Lesson Topic', value: topic.trim().slice(0, 28) },
      { label: 'VR Mode', value: '360° Guided Classroom' },
      { label: 'Teacher Voice', value: 'Active Narration' },
      { label: 'Practice', value: 'Quick Check Included' },
    ],
    parts: [
      { name: 'Classroom Stage Base', geometry: 'cylinder', args: [2.4, 2.6, 0.2, 32], position: [0, -2.0, 0], rotation: [0, 0, 0], color: '#1e293b', emissive: '#4f46e5' },
      { name: 'Hologram Ring', geometry: 'torus', args: [2.7, 0.06, 16, 48], position: [0, -1.8, 0], rotation: [1.57, 0, 0], color: '#38bdf8', animate: 'spinZ' },
    ],
    stations: [
      {
        title: '1. DEFINITION',
        subtitle: `What is ${topic.trim()} and why does it matter?`,
        definition: `${topic.trim()} is an essential concept in our curriculum. Understanding its core meaning helps you connect big ideas clearly in school exams and real life!`,
        types: [
          { name: 'Core Meaning', detail: `The main rule or purpose behind ${topic.trim()}` },
          { name: 'Key Vocabulary', detail: 'Important terms used when explaining this topic' },
        ],
        examples: [
          `Start by asking: What problem or question does ${topic.trim()} explain?`,
          `Try summarizing ${topic.trim()} in one simple kid-friendly sentence.`,
        ],
        example: `Core meaning of ${topic.trim()}`,
        visuals: [
          { icon: '📖', label: 'Definition', category: 'Core Idea', bgColor: '#3b82f6' },
          { icon: '💡', label: 'Key Insight', category: 'Understand', bgColor: '#f59e0b' },
          { icon: '🎯', label: 'Main Goal', category: 'Focus', bgColor: '#10b981' },
          { icon: '🧠', label: 'Remember', category: 'Mastery', bgColor: '#8b5cf6' },
        ],
        teacherScript: `Step 1 is Definition! Let us understand clearly what ${topic.trim()} means and why it is so useful in your studies.`,
        narration: `${topic.trim()} is an important curriculum topic. Let us explore its core meaning together!`,
        color: '#3b82f6',
      },
      {
        title: '2. TYPES & PARTS',
        subtitle: `Breaking ${topic.trim()} into easy-to-learn parts`,
        definition: `Almost every big topic can be broken down into smaller types, categories, or steps. Grouping ${topic.trim()} into clear parts makes remembering it effortless!`,
        types: [
          { name: 'Main Categories', detail: `How ${topic.trim()} splits into distinct groups` },
          { name: 'How They Connect', detail: 'How each part works together as a system' },
        ],
        examples: [
          `Compare two different types or stages inside ${topic.trim()}.`,
          `Notice what makes each type unique and easy to spot!`,
        ],
        example: `Main categories inside ${topic.trim()}`,
        visuals: [
          { icon: '🧩', label: 'Key Parts', category: 'Structure', bgColor: '#10b981' },
          { icon: '🏷️', label: 'Types', category: 'Categories', bgColor: '#06b6d4' },
          { icon: '🔄', label: 'Connections', category: 'How It Works', bgColor: '#6366f1' },
          { icon: '📊', label: 'Compare', category: 'Differences', bgColor: '#ec4899' },
        ],
        teacherScript: `Step 2 is Types and Parts! Breaking ${topic.trim()} into smaller categories makes it super easy to understand and remember!`,
        narration: `Breaking ${topic.trim()} into smaller types and parts makes it easy to master!`,
        color: '#10b981',
      },
      {
        title: '3. REAL EXAMPLES',
        subtitle: `Where we see ${topic.trim()} in everyday life`,
        definition: `The best way to master ${topic.trim()} is to connect it to things you already see at home, in nature, or in the classroom!`,
        types: [
          { name: 'Classroom Examples', detail: 'Exercises and demonstrations with your tutor' },
          { name: 'Everyday Life', detail: `Spotting ${topic.trim()} outside the textbook` },
        ],
        examples: [
          `Think of one real-life example of ${topic.trim()} you saw this week.`,
          `Share your favorite example aloud with your tutor right now!`,
        ],
        example: `Real-world uses of ${topic.trim()}`,
        visuals: [
          { icon: '🌍', label: 'Real World', category: 'Every Day', bgColor: '#f59e0b' },
          { icon: '🏫', label: 'At School', category: 'Classroom', bgColor: '#3b82f6' },
          { icon: '🏠', label: 'At Home', category: 'Daily Life', bgColor: '#22c55e' },
          { icon: '🔬', label: 'Observe', category: 'Discover', bgColor: '#8b5cf6' },
        ],
        teacherScript: `Step 3 is Real Examples! Think about where you encounter ${topic.trim()} in everyday life at school and at home.`,
        narration: `Look for real-world examples of ${topic.trim()} around you every day!`,
        color: '#f59e0b',
      },
      {
        title: '4. QUICK CHECK',
        subtitle: 'Explain it back in your own words!',
        definition: `Teaching a concept back to someone else is the fastest way to lock it into long-term memory. Try explaining ${topic.trim()} in your own words!`,
        types: [
          { name: 'Explain It', detail: 'Say the definition in 1 clear sentence' },
          { name: 'Give 1 Example', detail: 'Name a real example without peeking' },
        ],
        examples: [
          `Can you name two key facts about ${topic.trim()}?`,
          `Ask your tutor to test you with one bonus challenge!`,
        ],
        example: 'Discuss & practice live with your tutor!',
        visuals: [
          { icon: '🎯', label: 'Check Skill', category: 'Practice', bgColor: '#ec4899' },
          { icon: '🗣️', label: 'Explain It', category: 'Speak Out', bgColor: '#06b6d4' },
          { icon: '⭐', label: 'Mastery', category: 'Well Done', bgColor: '#facc15' },
          { icon: '🏆', label: 'Star Pupil', category: 'Achievement', bgColor: '#f59e0b' },
        ],
        teacherScript: `Final step—Quick Check! Tell your tutor one definition and one example of ${topic.trim()} in your own words!`,
        narration: `Now try explaining ${topic.trim()} back to your tutor in one clear sentence!`,
        color: '#ec4899',
      },
    ],
  };
}

async function fetchWikipediaImage(query: string): Promise<string | null> {
  const clean = query.trim();
  if (!clean) return null;

  const trySummary = async (title: string): Promise<string | null> => {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 2400);
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        title.replace(/\s+/g, '_'),
      )}`;
      const res = await fetch(url, {
        signal: ctrl.signal,
        headers: { 'User-Agent': 'EdvouraLearningHub/1.0 (https://www.edvouralearninghub.com)' },
      });
      clearTimeout(t);
      if (!res.ok) return null;
      const json = await res.json();
      const img = json?.thumbnail?.source || json?.originalimage?.source || null;
      return typeof img === 'string' && img.startsWith('http') ? img : null;
    } catch {
      return null;
    }
  };

  const direct = await trySummary(clean);
  if (direct) return direct;

  // Search Wikipedia for best matching article title if exact title missed
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2200);
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      clean,
    )}&srlimit=1&format=json`;
    const res = await fetch(searchUrl, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'EdvouraLearningHub/1.0 (https://www.edvouralearninghub.com)' },
    });
    clearTimeout(t);
    if (!res.ok) return null;
    const json = await res.json();
    const topTitle = json?.query?.search?.[0]?.title;
    if (typeof topTitle === 'string' && topTitle) {
      return await trySummary(topTitle);
    }
  } catch {
    // Ignore image fetch failure gracefully
  }
  return null;
}

async function enrichBlueprintWithRealImages(blueprint: AI3DBlueprint): Promise<AI3DBlueprint> {
  if (!Array.isArray(blueprint.stations) || blueprint.stations.length === 0) return blueprint;
  const work = Promise.all(
    blueprint.stations.map(async (st) => {
      if (st.imageUrl) return st;
      const q = st.imageQuery || st.title;
      const img = await fetchWikipediaImage(q);
      return img ? { ...st, imageUrl: img } : st;
    }),
  ).then((enrichedStations) => ({ ...blueprint, stations: enrichedStations }));

  // Never let image lookup push a Vercel function near timeout
  return await Promise.race([
    work,
    new Promise<AI3DBlueprint>((resolve) => setTimeout(() => resolve(blueprint), 3000)),
  ]);
}

export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  const AI_BUDGET_MS = 21000;
  try {
    const body = await request.json().catch(() => null);
    const topic = typeof body?.prompt === 'string' ? body.prompt.trim() : '';
    const gradeLevel =
      typeof body?.gradeLevel === 'string' ? body.gradeLevel : 'Primary & Secondary (Grades 1-12)';

    if (!topic) {
      return NextResponse.json({ error: 'Please enter a topic to generate in 3D.' }, { status: 400 });
    }

    const promptText = build3DPrompt(topic, gradeLevel);

    // 1. Try Gemini REST v1beta directly (supports BOTH AQ.* and AIza* Google AI keys + live active models)
    const geminiKeys = getGeminiKeys();
    const geminiModels = [
      process.env.GEMINI_MODEL,
      'gemini-3.1-flash-lite',
      'gemini-flash-lite-latest',
      'gemini-2.5-flash-lite',
      'gemini-flash-latest',
      'gemini-3-flash-preview',
    ].filter((m): m is string => typeof m === 'string' && m.trim().length > 0);

    for (const key of geminiKeys) {
      for (const modelName of [...new Set(geminiModels)]) {
        const remaining = AI_BUDGET_MS - (Date.now() - startedAt);
        if (remaining < 3500) break;
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), Math.min(11500, remaining));
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
                temperature: 0.35,
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
            payload?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text || '').join('') || '';
          if (!raw) continue;

          const parsed = extractJsonPayload(raw);
          const validated = BlueprintSchema.parse(parsed);
          const enriched = await enrichBlueprintWithRealImages(validated);
          return NextResponse.json({ blueprint: enriched, provider: `gemini:${modelName}` });
        } catch (err) {
          console.warn(
            `3D Gen Gemini (${modelName}) attempt failed:`,
            err instanceof Error ? err.message : err,
          );
        }
      }
      if (AI_BUDGET_MS - (Date.now() - startedAt) < 3500) break;
    }

    // 2. Fallback to OpenRouter keys (only if budget remains)
    const openRouterKeys = getOpenRouterKeys();
    const openRouterModels = [
      process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-001',
      'meta-llama/llama-3.1-70b-instruct',
      'openai/gpt-4o-mini',
    ];

    for (const key of openRouterKeys) {
      if (AI_BUDGET_MS - (Date.now() - startedAt) < 4000) break;
      const client = createOpenAI({ baseURL: 'https://openrouter.ai/api/v1', apiKey: key });
      for (const modelName of [...new Set(openRouterModels)]) {
        if (AI_BUDGET_MS - (Date.now() - startedAt) < 4000) break;
        try {
          const { text } = await generateText({
            model: client(modelName),
            prompt: promptText,
            temperature: 0.35,
          });
          const parsed = extractJsonPayload(text);
          const validated = BlueprintSchema.parse(parsed);
          const enriched = await enrichBlueprintWithRealImages(validated);
          return NextResponse.json({ blueprint: enriched, provider: `openrouter:${modelName}` });
        } catch (err) {
          console.warn(
            `3D Gen OpenRouter (${modelName}) attempt failed:`,
            err instanceof Error ? err.message : err,
          );
        }
      }
    }

    // 3. Rich Teacher-Grade Smart Fallback (enriched with real Wikipedia photographs!)
    const fallbackBp = await enrichBlueprintWithRealImages(buildSmartFallback(topic, gradeLevel));
    return NextResponse.json({
      blueprint: fallbackBp,
      provider: 'local-fallback',
    });
  } catch (err) {
    console.error('AI 3D generator error:', err);
    return NextResponse.json({ error: 'Failed to synthesize 3D model.' }, { status: 500 });
  }
}
