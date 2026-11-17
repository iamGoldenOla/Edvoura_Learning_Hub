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

const BlueprintSchema = z.object({
  title: z.string(),
  category: z.string().default('AI 3D Model'),
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
  return `You are an expert Three.js 3D artist and K-12 STEM educator for Edvoura Learning Hub.
Design a recognizable, colorful, anatomically/structurally accurate 3D model blueprint for the topic: "${topic}" (target level: ${gradeLevel}).

Return ONLY raw valid JSON matching this exact schema (no markdown fences, no commentary):
{
  "title": "Short clear title of the 3D model",
  "category": "Subject area (e.g. Geometry, Biology, Physics, Engineering, History, Nature)",
  "description": "2 concise kid-friendly educational sentences explaining what the model shows.",
  "narration": "3-4 engaging spoken sentences for a teacher audio tour explaining the parts and science/math behind ${topic}.",
  "facts": [
    { "label": "Fact Label", "value": "Short Fact Value" },
    { "label": "Fact Label 2", "value": "Short Fact Value 2" },
    { "label": "Fact Label 3", "value": "Short Fact Value 3" },
    { "label": "Fact Label 4", "value": "Short Fact Value 4" }
  ],
  "parts": [
    {
      "name": "Part name",
      "geometry": "box | sphere | cylinder | cone | torus | octahedron | dodecahedron | ring | plane",
      "args": [numbers matching Three.js constructor],
      "position": [x, y, z],
      "rotation": [rx, ry, rz in radians],
      "scale": [sx, sy, sz],
      "color": "#hexcolor",
      "emissive": "#hexcolor (optional, only for glowing parts like lights/sun/energy)",
      "opacity": 1,
      "roughness": 0.4,
      "metalness": 0.15,
      "wireframeEdges": false,
      "animate": "none | spinY | spinZ | spinX | bob | pulse"
    }
  ]
}

THREE.JS GEOMETRY ARGS REFERENCE (MUST BE EXACT VALID NUMBERS):
- "box": [width, height, depth]
- "sphere": [radius, 24, 24]
- "cylinder": [radiusTop, radiusBottom, height, 20]
- "cone": [radius, height, 20]
- "torus": [radius, tube, 16, 32]
- "octahedron": [radius, 0]
- "dodecahedron": [radius, 0]
- "ring": [innerRadius, outerRadius, 24]
- "plane": [width, height]

DESIGN RULES:
1. Build a genuinely recognizable 3D model using 6 to 24 well-proportioned, properly connected parts centered around [0, 0, 0] within roughly -4 to +4 units.
2. For simple geometric shapes (e.g. "rectangle", "cuboid", "parallelogram", "hexagon", "prism", "trapezoid", "cone"), make the primary shape bold and crystal-clear with "wireframeEdges": true and bright contrasting colors, and include exact math formulas in "facts".
3. For real-world objects, animals, anatomy, machines, buildings, molecules, or vehicles (e.g. "car", "elephant", "human brain", "bicycle", "flower", "airplane", "windmill", "traffic light", "bridge", "butterfly", "guitar", "microscope"), assemble distinct recognizable sub-parts (body, wheels, wings, petals, limbs, tower, blades, lenses, etc.) at accurate relative coordinates so it truly looks like "${topic}"!
4. Add subtle motion ("spinZ" for windmill blades/propellers, "spinY" for planets/radar, "pulse" for lights/hearts, "bob" for floating elements) where appropriate.
5. Output ONLY the JSON object.`;
}

function buildSmartFallback(topic: string): AI3DBlueprint {
  const q = topic.toLowerCase().trim();

  if (q.includes('rectang') || q.includes('cuboid') || q.includes('brick')) {
    return {
      title: '3D Rectangular Prism (Cuboid)',
      category: 'Mathematics & Geometry',
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
    };
  }

  if (q.includes('car') || q.includes('bus') || q.includes('truck') || q.includes('vehicle')) {
    return {
      title: `3D ${topic.trim()}`,
      category: 'Engineering & Transport',
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
    };
  }

  if (q.includes('house') || q.includes('home') || q.includes('building') || q.includes('school')) {
    return {
      title: `3D ${topic.trim()}`,
      category: 'Architecture & Design',
      description: 'A structured architectural model with walls, pitched roof, doorway, windows, and chimney.',
      narration: `Explore this 3D ${topic}! The rectangular walls support the pitched roof designed to shed rain, while windows let natural daylight inside.`,
      facts: [
        { label: 'Base Shape', value: 'Rectangular Prism' },
        { label: 'Roof Shape', value: 'Pyramid / Gable' },
        { label: 'Materials', value: 'Walls, Roof, Glass' },
        { label: 'Feature', value: 'Sliceable Interior' },
      ],
      parts: [
        { name: 'Base Ground', geometry: 'box', args: [6.4, 0.3, 5.4], position: [0, -1.8, 0], rotation: [0, 0, 0], color: '#22c55e' },
        { name: 'Walls', geometry: 'box', args: [4.2, 2.8, 3.4], position: [0, -0.25, 0], rotation: [0, 0, 0], color: '#fef3c7' },
        { name: 'Roof', geometry: 'cone', args: [3.3, 2.0, 4], position: [0, 2.15, 0], rotation: [0, 0.785, 0], color: '#dc2626' },
        { name: 'Door', geometry: 'box', args: [0.9, 1.6, 0.15], position: [0, -0.85, 1.72], rotation: [0, 0, 0], color: '#78350f' },
        { name: 'Window Left', geometry: 'box', args: [0.85, 0.85, 0.15], position: [-1.25, 0.1, 1.72], rotation: [0, 0, 0], color: '#38bdf8' },
        { name: 'Window Right', geometry: 'box', args: [0.85, 0.85, 0.15], position: [1.25, 0.1, 1.72], rotation: [0, 0, 0], color: '#38bdf8' },
        { name: 'Chimney', geometry: 'box', args: [0.55, 1.4, 0.55], position: [1.1, 2.2, -0.6], rotation: [0, 0, 0], color: '#94a3b8' },
      ],
    };
  }

  if (q.includes('flower') || q.includes('rose') || q.includes('sunflower') || q.includes('bloom')) {
    const petalParts: AI3DBlueprint['parts'] = [
      { name: 'Stem', geometry: 'cylinder', args: [0.16, 0.22, 4.0, 16], position: [0, -1.6, 0], rotation: [0, 0, 0], color: '#16a34a' },
      { name: 'Leaf Left', geometry: 'sphere', args: [0.75, 16, 16], position: [-0.85, -1.6, 0], rotation: [0, 0, 0.5], scale: [1.4, 0.3, 0.7], color: '#22c55e' },
      { name: 'Leaf Right', geometry: 'sphere', args: [0.75, 16, 16], position: [0.85, -1.2, 0], rotation: [0, 0, -0.5], scale: [1.4, 0.3, 0.7], color: '#22c55e' },
      { name: 'Pollen Center', geometry: 'sphere', args: [0.85, 24, 24], position: [0, 0.8, 0], rotation: [0, 0, 0], color: '#facc15', emissive: '#ca8a04' },
    ];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      petalParts.push({
        name: `Petal ${i + 1}`,
        geometry: 'sphere',
        args: [0.65, 16, 16],
        position: [Math.cos(a) * 1.45, 0.8 + Math.sin(a) * 1.45, 0.1],
        rotation: [0, 0, a],
        scale: [1.2, 0.65, 0.35],
        color: '#ec4899',
      });
    }
    return {
      title: `3D Flowering Plant (${topic.trim()})`,
      category: 'Botany & Life Science',
      description: 'An interactive botanical model highlighting the stem, leaves for photosynthesis, bright petals, and pollen-rich center.',
      narration: 'Here is a 3D flower! Bright colorful petals attract pollinating bees and butterflies, while green leaves capture sunlight to make food for the plant.',
      facts: [
        { label: 'Petals', value: 'Attract Pollinators' },
        { label: 'Leaves', value: 'Photosynthesis' },
        { label: 'Stem', value: 'Water Transport' },
        { label: 'Center', value: 'Pollen & Seeds' },
      ],
      parts: petalParts,
    };
  }

  return {
    title: `3D Interactive Model: ${topic.trim()}`,
    category: 'Edvoura AI 3D Studio',
    description: `Interactive 3D structural visualization created for "${topic.trim()}". Drag to orbit 360° or use the Slice Plane to inspect the cross-section.`,
    narration: `Exploring ${topic.trim()} in 3D! Rotate the model in all directions to inspect its structure, symmetry, and geometry.`,
    facts: [
      { label: 'Topic', value: topic.trim().slice(0, 28) },
      { label: 'Mode', value: '360° Interactive 3D' },
      { label: 'Dissection', value: 'Slice Plane Ready' },
      { label: 'VR Support', value: 'Desktop, Gyro & Stereo' },
    ],
    parts: [
      { name: 'Core Structure', geometry: 'dodecahedron', args: [2.0, 0], position: [0, 0, 0], rotation: [0, 0, 0], color: '#6366f1', wireframeEdges: true },
      { name: 'Orbital Ring 1', geometry: 'torus', args: [3.1, 0.14, 16, 48], position: [0, 0, 0], rotation: [1.1, 0.3, 0], color: '#38bdf8', animate: 'spinY' },
      { name: 'Orbital Ring 2', geometry: 'torus', args: [3.1, 0.14, 16, 48], position: [0, 0, 0], rotation: [-1.1, -0.3, 0], color: '#facc15', animate: 'spinZ' },
      { name: 'Energy Core', geometry: 'sphere', args: [0.9, 24, 24], position: [0, 0, 0], rotation: [0, 0, 0], color: '#ec4899', emissive: '#db2777', animate: 'pulse' },
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

    // 1. Try Gemini REST v1beta directly (supports BOTH AQ.* and AIza* Google AI keys + latest models)
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
          const timer = setTimeout(() => controller.abort(), 12000);
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

    // 3. Always return a clean smart local blueprint if keys are exhausted
    return NextResponse.json({
      blueprint: buildSmartFallback(topic),
      provider: 'local-fallback',
    });
  } catch (err) {
    console.error('AI 3D generator error:', err);
    return NextResponse.json({ error: 'Failed to synthesize 3D model.' }, { status: 500 });
  }
}
