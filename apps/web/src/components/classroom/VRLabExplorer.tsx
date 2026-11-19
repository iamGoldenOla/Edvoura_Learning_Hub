'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
  Globe,
  Heart,
  Box,
  Flame,
  RotateCcw,
  Maximize2,
  Minimize2,
  Glasses,
  Smartphone,
  Compass,
  Play,
  Pause,
  X,
  Sparkles,
  Volume2,
  VolumeX,
  Sliders,
  FastForward,
  Scissors,
  Crosshair,
  WandSparkles,
  BookOpen,
  Atom,
  Dna,
  Layers,
  Send,
  Loader,
  ChevronLeft,
  ChevronRight,
  Plus,
  Info,
  CheckCircle2,
  GraduationCap,
  HelpCircle,
} from 'lucide-react';
import {
  GEOMETRY_SHAPES,
  AUTO_CURRICULUM_SUBJECTS,
  type GeometryShapeId,
  type GeoHighlightPart,
} from './geometryCatalog';

export type { GeometryShapeId, GeoHighlightPart };

export type VRModuleId =
  | 'solar-system'
  | 'human-heart'
  | 'geometry-volume'
  | 'earth-volcano'
  | 'dna-helix'
  | 'plant-cell'
  | 'bohr-atom'
  | 'ancient-pyramid'
  | 'ai-custom';

export type CustomAiSceneKind = 'rocket' | 'castle' | 'water-molecule' | 'tree' | 'crystal';

export interface AI3DPartSpec {
  name: string;
  geometry:
    | 'box'
    | 'sphere'
    | 'cylinder'
    | 'cone'
    | 'torus'
    | 'octahedron'
    | 'dodecahedron'
    | 'ring'
    | 'plane';
  args: number[];
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: [number, number, number];
  color: string;
  emissive?: string;
  opacity?: number;
  roughness?: number;
  metalness?: number;
  wireframeEdges?: boolean;
  animate?: 'none' | 'spinY' | 'spinZ' | 'spinX' | 'bob' | 'pulse';
}

export interface AI3DVisualSpec {
  icon: string;
  label: string;
  category?: string;
  bgColor?: string;
}

export interface AI3DStationTypeSpec {
  name: string;
  detail: string;
}

export interface AI3DQuizSpec {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  hint?: string;
  workedSolution?: string;
}

export interface AI3DWorkedStepSpec {
  label: string;
  work: string;
  speak: string;
}

export interface AI3DWorkedExampleSpec {
  problem: string;
  steps: AI3DWorkedStepSpec[];
  finalAnswer: string;
}

export interface AI3DStationSpec {
  title: string;
  subtitle: string;
  definition?: string;
  formulaOrRule?: string;
  timelineYear?: string;
  imageQuery?: string;
  imageUrl?: string;
  types?: AI3DStationTypeSpec[];
  workedExample?: AI3DWorkedExampleSpec;
  examples?: string[];
  example?: string;
  visuals?: AI3DVisualSpec[];
  propKind?: 'coins' | 'scale' | 'book' | 'globe' | 'beaker' | 'cube' | 'pie' | 'chart' | 'sun' | 'leaf' | 'trophy';
  teacherScript?: string;
  narration?: string;
  quiz?: AI3DQuizSpec;
  color?: string;
  position?: [number, number, number];
}

export interface AI3DBlueprintSpec {
  title: string;
  category: string;
  gradeLevel?: string;
  sceneType?: 'object' | 'concept-gallery';
  description: string;
  teacherIntro?: string;
  narration: string;
  facts: { label: string; value: string }[];
  parts: AI3DPartSpec[];
  stations?: AI3DStationSpec[];
}

export type VRDisplayMode = 'desktop' | 'gyro' | 'split-vr';

export interface VRLabExplorerProps {
  lessonId?: string;
  role?: 'tutor' | 'student';
  initialModule?: VRModuleId;
  onSyncState?: (data: any) => void;
  syncPayload?: any;
}

interface PlanetData {
  name: string;
  color: number;
  size: number;
  distance: number;
  speed: number;
  rotationSpeed: number;
  description: string;
  speechText: string;
  facts: { label: string; value: string }[];
  hasRings?: boolean;
}

const PLANETS: PlanetData[] = [
  {
    name: 'Sun',
    color: 0xffaa00,
    size: 2.8,
    distance: 0,
    speed: 0,
    rotationSpeed: 0.002,
    description: 'The glowing yellow star at the center of our Solar System. It provides light, warmth, and gravity for all eight planets.',
    speechText: 'The Sun is the brilliant star at the center of our solar system. It is a giant sphere of hot, glowing gas, producing the light and warmth that makes life on Earth possible. Over one million Earths could fit inside the Sun!',
    facts: [
      { label: 'Surface Temp', value: '5,500°C' },
      { label: 'Core Temp', value: '15,000,000°C' },
      { label: 'Mass', value: '99.8% of Solar System' },
    ],
  },
  {
    name: 'Mercury',
    color: 0x9ca3af,
    size: 0.6,
    distance: 5.5,
    speed: 0.04,
    rotationSpeed: 0.004,
    description: 'The smallest planet and closest to the Sun. It experiences extreme temperature swings between scorching day and freezing night.',
    speechText: 'Mercury is the closest planet to the Sun and the smallest of the eight planets. It zips around the Sun in just 88 Earth days. Because it has almost no atmosphere, its sunlit side scorches at 430 degrees Celsius while its dark side drops to minus 180 degrees!',
    facts: [
      { label: 'Moons', value: '0' },
      { label: 'Orbit Period', value: '88 Earth Days' },
      { label: 'Day Temp', value: '430°C' },
    ],
  },
  {
    name: 'Venus',
    color: 0xf59e0b,
    size: 0.9,
    distance: 8.5,
    speed: 0.025,
    rotationSpeed: -0.002,
    description: 'The hottest planet in the Solar System, blanketed by a thick greenhouse atmosphere of carbon dioxide.',
    speechText: 'Venus is the hottest planet in the solar system, with a surface temperature of 465 degrees Celsius. Its thick clouds trap heat in a runaway greenhouse effect. Amazingly, Venus rotates backwards compared to most other planets!',
    facts: [
      { label: 'Surface Temp', value: '465°C' },
      { label: 'Rotation', value: 'Spins Backwards' },
      { label: 'Atmosphere', value: '96% Carbon Dioxide' },
    ],
  },
  {
    name: 'Earth',
    color: 0x3b82f6,
    size: 1.0,
    distance: 12.0,
    speed: 0.018,
    rotationSpeed: 0.015,
    description: 'Our home world! The only known planet in the universe with liquid oceans, breathable air, and thriving life.',
    speechText: 'Welcome to Earth, our home planet! Earth is the only world known to harbor life, with liquid oceans covering over 70 percent of its surface. Protected by a breathable atmosphere of nitrogen and oxygen, Earth is accompanied by our Moon.',
    facts: [
      { label: 'Water Cover', value: '71%' },
      { label: 'Moons', value: '1 (The Moon)' },
      { label: 'Orbit Period', value: '365.25 Days' },
    ],
  },
  {
    name: 'Mars',
    color: 0xef4444,
    size: 0.7,
    distance: 16.0,
    speed: 0.014,
    rotationSpeed: 0.014,
    description: 'The famous Red Planet, colored by iron oxide rust. Home to giant dormant volcanoes and deep canyon systems.',
    speechText: 'This is Mars, the red planet! Its reddish color comes from iron oxide rust covering its rocky surface. Mars is home to Olympus Mons, the largest volcano in the entire solar system, which stands three times taller than Mount Everest!',
    facts: [
      { label: 'Moons', value: '2 (Phobos & Deimos)' },
      { label: 'Day Length', value: '24 hrs 37 mins' },
      { label: 'Volcano', value: 'Olympus Mons' },
    ],
  },
  {
    name: 'Jupiter',
    color: 0xd97706,
    size: 2.1,
    distance: 22.0,
    speed: 0.009,
    rotationSpeed: 0.025,
    description: 'The giant king of planets! More than 1,300 Earths could fit inside Jupiter, famous for its Great Red Spot storm.',
    speechText: 'Jupiter is the giant king of the planets! It is a massive gas giant with swirling atmospheric bands and the famous Great Red Spot, a storm larger than Earth that has raged for centuries. Jupiter has at least 95 known moons!',
    facts: [
      { label: 'Moons', value: '95 Known Moons' },
      { label: 'Type', value: 'Gas Giant' },
      { label: 'Storm', value: 'Great Red Spot' },
    ],
  },
  {
    name: 'Saturn',
    color: 0xfde047,
    size: 1.8,
    distance: 28.0,
    speed: 0.007,
    rotationSpeed: 0.022,
    description: 'Famous for its breathtaking rings made of billions of chunks of ice, rock, and cosmic dust.',
    speechText: 'Saturn is world-renowned for its magnificent glowing rings, made of billions of pieces of ice, rock, and dust. Even though Saturn is enormous, it is made mostly of light hydrogen and helium gas, meaning it is light enough to float on water!',
    facts: [
      { label: 'Rings Span', value: '282,000 km' },
      { label: 'Moons', value: '146 Known Moons' },
      { label: 'Density', value: 'Floats on Water' },
    ],
    hasRings: true,
  },
  {
    name: 'Uranus',
    color: 0x38bdf8,
    size: 1.3,
    distance: 34.0,
    speed: 0.005,
    rotationSpeed: 0.012,
    description: 'An ice giant planet colored cyan blue by methane. It rolls around the Sun on its side like a bowling ball.',
    speechText: 'Uranus is a unique ice giant planet colored cyan blue by methane gas in its atmosphere. Amazingly, Uranus is tilted by 98 degrees and rotates on its side, rolling like a giant cosmic bowling ball around the Sun!',
    facts: [
      { label: 'Tilt', value: '98 Degrees' },
      { label: 'Moons', value: '28 Moons' },
      { label: 'Type', value: 'Ice Giant' },
    ],
  },
  {
    name: 'Neptune',
    color: 0x2563eb,
    size: 1.3,
    distance: 40.0,
    speed: 0.004,
    rotationSpeed: 0.013,
    description: 'The outermost major planet, deep dark blue with the fastest supersonic winds in the entire solar system.',
    speechText: 'Neptune is the outermost major planet from the Sun. It is a deep dark blue ice giant with supersonic winds that roar at over 2,100 kilometers per hour, the fastest recorded winds anywhere in our solar system!',
    facts: [
      { label: 'Wind Speed', value: '2,100 km/h' },
      { label: 'Moons', value: '16 Moons' },
      { label: 'Year Length', value: '165 Earth Years' },
    ],
  },
];

export function VRLabExplorer({
  lessonId,
  role = 'tutor',
  initialModule = 'solar-system',
  onSyncState,
  syncPayload,
}: VRLabExplorerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const pointerDownPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const gazeCooldownRef = useRef<number>(0);
  const vrChannelRef = useRef<any>(null);

  // Simulation State
  const [activeModule, setActiveModule] = useState<VRModuleId>(initialModule);
  const [displayMode, setDisplayMode] = useState<VRDisplayMode>('desktop');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const [selectedPin, setSelectedPin] = useState<string | null>('Earth');
  const [showInfoCard, setShowInfoCard] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [gyroActive, setGyroActive] = useState<boolean>(false);
  const [threeLoaded, setThreeLoaded] = useState<boolean>(false);
  const [threeError, setThreeError] = useState<string | null>(null);

  // Kainmueller-Lab/vr-viewer: Slicing Plane Feature
  const [sliceHeight, setSliceHeight] = useState<number>(1.0); // 1 = fully intact, 0 = sliced halfway, -1 = full cut
  const [isSlicingActive, setIsSlicingActive] = useState<boolean>(false);

  // aframevr: Gaze Reticle Cursor for Headset/Cardboard
  const [gazeReticleEnabled, setGazeReticleEnabled] = useState<boolean>(false);
  const [gazeProgress, setGazeProgress] = useState<number>(0); // 0 to 100%
  const gazeTargetRef = useRef<string | null>(null);
  const gazeTimerRef = useRef<number>(0);

  // oculus-samples: Native WebXR Session State + Laptop Browser VR Fallback Banner
  const [webXRSupported, setWebXRSupported] = useState<boolean>(false);
  const [isWebXRPresenting, setIsWebXRPresenting] = useState<boolean>(false);
  const [vrStatusBanner, setVrStatusBanner] = useState<string | null>(null);

  // ruslanmv/GenAI-3D: Generative AI 3D Prompting & Master VR Teacher Engine
  const [aiPromptOpen, setAiPromptOpen] = useState<boolean>(false);
  const [aiPromptText, setAiPromptText] = useState<string>('');
  const [aiGradeLevel, setAiGradeLevel] = useState<string>('Grade 4–6 (Upper Primary)');
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [customAiModelTitle, setCustomAiModelTitle] = useState<string>('');
  const [customAiKind, setCustomAiKind] = useState<CustomAiSceneKind>('rocket');
  const [customAiDescription, setCustomAiDescription] = useState<string>('');
  const [aiBlueprint, setAiBlueprint] = useState<AI3DBlueprintSpec | null>(null);
  const aiBlueprintRef = useRef<AI3DBlueprintSpec | null>(null);
  aiBlueprintRef.current = aiBlueprint;
  const [activeStationIdx, setActiveStationIdx] = useState<number>(0);
  const [aiGenError, setAiGenError] = useState<string | null>(null);
  const [isTeacherTourActive, setIsTeacherTourActive] = useState<boolean>(false);
  const [activeTeachPhase, setActiveTeachPhase] = useState<
    'idle' | 'definition' | 'visuals' | 'types' | 'worked' | 'examples' | 'quiz'
  >('idle');
  const [revealedWorkedStep, setRevealedWorkedStep] = useState<number>(99);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showQuizHint, setShowQuizHint] = useState<Record<number, boolean>>({});
  const [showQuizWork, setShowQuizWork] = useState<Record<number, boolean>>({});
  const [aiBoardView, setAiBoardView] = useState<'sidebar' | 'wide'>('wide');
  const teacherTourTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const teacherTourActiveRef = useRef<boolean>(false);
  const teachSequenceIdRef = useRef<number>(0);
  const teacherBodyRef = useRef<HTMLDivElement | null>(null);
  teacherTourActiveRef.current = isTeacherTourActive;

  // Manim Motion Controls
  const [netUnfoldAmount, setNetUnfoldAmount] = useState<number>(0); // 0 = 3D folded, 1 = 2D flat net
  const [explodeAmount, setExplodeAmount] = useState<number>(0); // 0 = intact, 1 = exploded layers

  // Module Specific Sub-selections
  const [selectedHeartPart, setSelectedHeartPart] = useState<string>('Left Ventricle');
  const [selectedShape, setSelectedShape] = useState<GeometryShapeId>('cube');
  const [geoDimensionTab, setGeoDimensionTab] = useState<'2D' | '3D'>('3D');
  const [geoHighlightPart, setGeoHighlightPart] = useState<GeoHighlightPart>('vertices');
  const [activeCurriculumSubject, setActiveCurriculumSubject] = useState<string>('geography');
  const [selectedLayer, setSelectedLayer] = useState<string>('Inner Core');
  const [selectedCellOrganelle, setSelectedCellOrganelle] = useState<string>('Chloroplast');

  // Voice Narration & Audio
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [autoNarrate, setAutoNarrate] = useState<boolean>(true);
  const [speechSpeed, setSpeechSpeed] = useState<number>(1.0);
  const [audioFeedbackText, setAudioFeedbackText] = useState<string>('');
  const audioContextRef = useRef<any>(null);

  // Sync external initialModule prop changes (e.g. from Student/Tutor 3D Lab page switcher)
  useEffect(() => {
    setActiveModule(initialModule);
  }, [initialModule]);

  // Client-side Wikipedia real-photo backup (ensures President portraits, Dinosaurs & Volcano photos ALWAYS load even if edge IP is rate-limited!)
  const enrichedBpKeyRef = useRef<string>('');
  useEffect(() => {
    if (!aiBlueprint?.stations || aiBlueprint.stations.length === 0) return;
    const bpKey = `${aiBlueprint.title}:${aiBlueprint.stations.length}`;
    if (enrichedBpKeyRef.current === bpKey) return;
    const missingAny = aiBlueprint.stations.some((s) => !s.imageUrl && (s.imageQuery || s.title));
    if (!missingAny) {
      enrichedBpKeyRef.current = bpKey;
      return;
    }
    enrichedBpKeyRef.current = bpKey;
    let cancelled = false;

    const fetchWikiClient = async (query: string): Promise<string | null> => {
      const clean = query.replace(/^\d+\.\s*/, '').trim();
      if (!clean) return null;
      try {
        const direct = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(clean.replace(/\s+/g, '_'))}`
        );
        if (direct.ok) {
          const j = await direct.json();
          const img = j?.thumbnail?.source || j?.originalimage?.source;
          if (typeof img === 'string' && img.startsWith('http')) return img;
        }
        const search = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(clean)}&srlimit=1&format=json&origin=*`
        );
        if (search.ok) {
          const sj = await search.json();
          const top = sj?.query?.search?.[0]?.title;
          if (top) {
            const s2 = await fetch(
              `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(top.replace(/\s+/g, '_'))}`
            );
            if (s2.ok) {
              const j2 = await s2.json();
              const img2 = j2?.thumbnail?.source || j2?.originalimage?.source;
              if (typeof img2 === 'string' && img2.startsWith('http')) return img2;
            }
          }
        }
      } catch (_) {}
      return null;
    };

    Promise.all(
      aiBlueprint.stations.map(async (st) => {
        if (st.imageUrl) return st;
        const found = await fetchWikiClient(st.imageQuery || st.title);
        return found ? { ...st, imageUrl: found } : st;
      })
    ).then((updatedStations) => {
      if (cancelled) return;
      const changed = updatedStations.some((s, i) => s.imageUrl !== aiBlueprint.stations?.[i]?.imageUrl);
      if (changed) {
        setAiBlueprint((prev) => (prev ? { ...prev, stations: updatedStations } : prev));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [aiBlueprint]);

  // Live reactive ref so Three.js 60FPS loop NEVER reads stale React closures
  const liveParamsRef = useRef({
    activeModule,
    displayMode,
    isPlaying,
    speedMultiplier,
    selectedShape,
    netUnfoldAmount,
    explodeAmount,
    gazeReticleEnabled,
    isWebXRPresenting,
    activeStationIdx,
  });
  liveParamsRef.current = {
    activeModule,
    displayMode,
    isPlaying,
    speedMultiplier,
    selectedShape,
    netUnfoldAmount,
    explodeAmount,
    gazeReticleEnabled,
    isWebXRPresenting,
    activeStationIdx,
  };

  // Three.js References
  const threeStateRef = useRef<{
    THREE: any;
    scene: any;
    camera: any;
    renderer: any;
    clippingPlane: any;
    controls: {
      isDragging: boolean;
      prevX: number;
      prevY: number;
      rotX: number;
      rotY: number;
      zoom: number;
      targetRotX?: number | null;
      targetRotY?: number | null;
      targetZoom?: number | null;
    };
    orbitMeshes: any[];
    heartMesh: any;
    bloodParticles: any;
    geometryMesh: any;
    shapeFaces: any[];
    cubeHinges: { front: any; back: any; left: any; right: any; top: any } | null;
    earthLayers: any[];
    lavaParticles: any;
    vaultMesh: any;
    atomElectrons: { mesh: any; radius: number; angle: number; speed: number; tiltX: number; tiltZ: number }[];
    raycaster: any;
    clock: any;
  } | null>(null);

  // Supabase Realtime sync for Live Classroom Tutor -> Student 3D/VR synchronization
  const broadcastVRState = useCallback(
    (payload: Record<string, any>) => {
      if (onSyncState) onSyncState(payload);
      if (vrChannelRef.current && role === 'tutor') {
        vrChannelRef.current.send({
          type: 'broadcast',
          event: 'vr-sync',
          payload,
        });
      }
    },
    [onSyncState, role]
  );

  useEffect(() => {
    if (!lessonId) return;
    const supabase = createClient();
    const channel = supabase.channel(`vrlab:${lessonId}`, {
      config: { broadcast: { self: false } },
    });

    channel
      .on('broadcast', { event: 'vr-sync' }, ({ payload }) => {
        if (!payload) return;
        if (payload.activeModule) setActiveModule(payload.activeModule);
        if (payload.selectedPin !== undefined) setSelectedPin(payload.selectedPin);
        if (payload.selectedShape) setSelectedShape(payload.selectedShape);
        if (payload.netUnfoldAmount !== undefined) setNetUnfoldAmount(payload.netUnfoldAmount);
        if (payload.explodeAmount !== undefined) setExplodeAmount(payload.explodeAmount);
        if (payload.isSlicingActive !== undefined) setIsSlicingActive(payload.isSlicingActive);
        if (payload.sliceHeight !== undefined) setSliceHeight(payload.sliceHeight);
        if (payload.isPlaying !== undefined) setIsPlaying(payload.isPlaying);
        if (payload.speedMultiplier !== undefined) setSpeedMultiplier(payload.speedMultiplier);
        if (payload.aiBlueprint) {
          setAiBlueprint(payload.aiBlueprint);
          setCustomAiModelTitle(payload.aiBlueprint.title || 'AI 3D Model');
          setCustomAiDescription(payload.aiBlueprint.description || '');
          setQuizAnswers({});
        }
        if (typeof payload.activeStationIdx === 'number') {
          setActiveStationIdx(payload.activeStationIdx);
        }
        if (payload.camera && threeStateRef.current?.controls) {
          const c = threeStateRef.current.controls;
          if (typeof payload.camera.rotX === 'number') c.rotX = payload.camera.rotX;
          if (typeof payload.camera.rotY === 'number') c.rotY = payload.camera.rotY;
          if (typeof payload.camera.zoom === 'number') c.zoom = payload.camera.zoom;
        }
      })
      .on('broadcast', { event: 'vr-request-sync' }, () => {
        if (role === 'tutor' && channel) {
          const st = threeStateRef.current;
          channel.send({
            type: 'broadcast',
            event: 'vr-sync',
            payload: {
              activeModule: liveParamsRef.current.activeModule,
              selectedPin,
              selectedShape,
              netUnfoldAmount,
              explodeAmount,
              isSlicingActive,
              sliceHeight,
              isPlaying,
              speedMultiplier,
              aiBlueprint,
              activeStationIdx,
              camera: st?.controls
                ? { rotX: st.controls.rotX, rotY: st.controls.rotY, zoom: st.controls.zoom }
                : undefined,
            },
          });
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED' && role === 'student') {
          channel.send({
            type: 'broadcast',
            event: 'vr-request-sync',
            payload: {},
          });
        }
      });

    vrChannelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      vrChannelRef.current = null;
    };
  }, [lessonId]);

  // Check WebXR hardware support (Meta Quest Browser / Vision Pro)
  useEffect(() => {
    if (typeof navigator !== 'undefined' && (navigator as any).xr) {
      (navigator as any).xr
        .isSessionSupported('immersive-vr')
        .then((supported: boolean) => setWebXRSupported(supported))
        .catch(() => setWebXRSupported(false));
    }
  }, []);

  // Procedural Web Audio Synthesizer
  const playSynthesizedSound = useCallback((type: 'heartbeat' | 'space' | 'chime' | 'volcano' | 'laser') => {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (type === 'heartbeat') {
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(65, ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.12);
        gain1.gain.setValueAtTime(0.4, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.16);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(80, ctx.currentTime + 0.22);
        osc2.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.35);
        gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.22);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.38);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(ctx.currentTime + 0.22);
        osc2.stop(ctx.currentTime + 0.4);
      } else if (type === 'space') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
      } else if (type === 'chime') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.42);
      } else if (type === 'volcano') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(55, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.65);
      } else if (type === 'laser') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch (_) {}
  }, []);

  // Web Speech Synthesis (supports optional onComplete for Guided Teacher Tour)
  const speakNarration = useCallback(
    (text: string, onComplete?: () => void) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        if (onComplete) setTimeout(onComplete, 4500);
        return;
      }

      window.speechSynthesis.cancel();
      setAudioFeedbackText(text);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speechSpeed;
      utterance.pitch = 1.06;

      const voices = window.speechSynthesis.getVoices();
      const naturalVoice =
        voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (/natural|google|samantha|libby|karen|female|victoria/i.test(v.name) || v.localService)
        ) || voices.find((v) => v.lang.startsWith('en'));

      if (naturalVoice) utterance.voice = naturalVoice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        if (onComplete) onComplete();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    },
    [speechSpeed]
  );

  const stopTeacherTour = useCallback(() => {
    teachSequenceIdRef.current += 1;
    setIsTeacherTourActive(false);
    setActiveTeachPhase('idle');
    setRevealedWorkedStep(99);
    teacherTourActiveRef.current = false;
    if (teacherTourTimerRef.current) {
      clearTimeout(teacherTourTimerRef.current);
      teacherTourTimerRef.current = null;
    }
  }, []);

  const stopNarration = useCallback(() => {
    stopTeacherTour();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, [stopTeacherTour]);

  const scrollTeacherSection = useCallback((sectionId: string) => {
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 80);
  }, []);

  // Run an ordered list of synchronized voice + visual highlight segments (Explanation-Video Engine!)
  const runSpeechQueue = useCallback(
    (
      segments: {
        phase: 'definition' | 'visuals' | 'types' | 'worked' | 'examples' | 'quiz';
        sectionId?: string;
        workedStep?: number;
        text: string;
        chime?: boolean;
      }[],
      onAllDone?: () => void
    ) => {
      const seqId = ++teachSequenceIdRef.current;

      const playIdx = (i: number) => {
        if (teachSequenceIdRef.current !== seqId) return;
        if (i >= segments.length) {
          setActiveTeachPhase('idle');
          setRevealedWorkedStep(99);
          if (onAllDone) onAllDone();
          return;
        }
        const seg = segments[i];
        setActiveTeachPhase(seg.phase);
        if (typeof seg.workedStep === 'number') {
          setRevealedWorkedStep(seg.workedStep);
        }
        if (seg.sectionId) scrollTeacherSection(seg.sectionId);
        if (seg.chime) playSynthesizedSound('chime');

        speakNarration(seg.text, () => {
          if (teachSequenceIdRef.current !== seqId) return;
          teacherTourTimerRef.current = setTimeout(() => {
            playIdx(i + 1);
          }, 550);
        });
      };

      playIdx(0);
    },
    [playSynthesizedSound, scrollTeacherSection, speakNarration]
  );

  // Build the FULL explanation-video script queue for a single station (reads EVERY section & works the example!)
  const buildStationFullSegments = useCallback((st: AI3DStationSpec, index: number) => {
    const segs: {
      phase: 'definition' | 'visuals' | 'types' | 'worked' | 'examples' | 'quiz';
      sectionId?: string;
      workedStep?: number;
      text: string;
      chime?: boolean;
    }[] = [];

    // 1. Definition + Formula / Key Rule
    const defSpeech = [
      `Lesson ${index + 1}: ${st.title}.`,
      st.definition || st.subtitle || '',
      st.formulaOrRule ? `Remember our key rule: ${st.formulaOrRule.replace(/÷/g, ' divided by ').replace(/×/g, ' times ').replace(/−/g, ' minus ')}.` : '',
    ]
      .filter(Boolean)
      .join(' ');
    segs.push({ phase: 'definition', sectionId: 'vr-sec-definition', text: defSpeech });

    // 2. Picture Visuals on the Card
    if (Array.isArray(st.visuals) && st.visuals.length > 0) {
      const visList = st.visuals
        .map((v) => `${v.label}${v.category ? ` (${v.category})` : ''}`)
        .join(', ');
      segs.push({
        phase: 'visuals',
        sectionId: 'vr-sec-visuals',
        text: `Look at the picture examples on the board: ${visList}.`,
      });
    }

    // 3. Types & Kinds
    if (Array.isArray(st.types) && st.types.length > 0) {
      const typeLines = st.types.map((t) => `${t.name}: ${t.detail}`).join('. ');
      segs.push({
        phase: 'types',
        sectionId: 'vr-sec-types',
        text: `Now let us examine the types of ${st.title}. ${typeLines}`,
      });
    }

    // 4. Step-by-Step Worked Example (Animates Step 1 → Step 2 → Step 3 → Final Answer like a live blackboard video!)
    if (st.workedExample && Array.isArray(st.workedExample.steps) && st.workedExample.steps.length > 0) {
      segs.push({
        phase: 'worked',
        sectionId: 'vr-sec-worked',
        workedStep: 0,
        chime: true,
        text: `Let us work out a real example step by step! Here is the problem: ${st.workedExample.problem}`,
      });
      st.workedExample.steps.forEach((step, si) => {
        segs.push({
          phase: 'worked',
          sectionId: 'vr-sec-worked',
          workedStep: si + 1,
          text: `${step.label}. ${step.speak || step.work}`,
        });
      });
      segs.push({
        phase: 'worked',
        sectionId: 'vr-sec-worked',
        workedStep: st.workedExample.steps.length + 1,
        chime: true,
        text: `So our final answer is: ${st.workedExample.finalAnswer}!`,
      });
    }

    // 5. Real-World Examples
    if (Array.isArray(st.examples) && st.examples.length > 0) {
      segs.push({
        phase: 'examples',
        sectionId: 'vr-sec-examples',
        text: `Here are real-life examples: ${st.examples.slice(0, 2).join(' Next example: ')}`,
      });
    }

    // 6. Interactive Activity Question + Options A, B, C read aloud!
    if (st.quiz && Array.isArray(st.quiz.options) && st.quiz.options.length > 0) {
      const optSpoken = st.quiz.options
        .map((o, oi) => `Option ${String.fromCharCode(65 + oi)}: ${o}`)
        .join('. ');
      segs.push({
        phase: 'quiz',
        sectionId: 'vr-sec-quiz',
        chime: true,
        text: `Now it is your turn for a quick classroom activity! ${st.quiz.question} ${optSpoken}. Tap your answer on the board, or click Work It Out so we can solve it together!`,
      });
    }

    return segs;
  }, []);

  // Animate & narrate ONLY the Step-by-Step Worked Example on demand
  const playWorkedExampleAloud = useCallback(
    (st: AI3DStationSpec) => {
      if (!st.workedExample || !st.workedExample.steps?.length) return;
      const segs: {
        phase: 'worked';
        sectionId: string;
        workedStep: number;
        text: string;
        chime?: boolean;
      }[] = [
        {
          phase: 'worked',
          sectionId: 'vr-sec-worked',
          workedStep: 0,
          chime: true,
          text: `Let us work this problem together step by step! ${st.workedExample.problem}`,
        },
        ...st.workedExample.steps.map((step, si) => ({
          phase: 'worked' as const,
          sectionId: 'vr-sec-worked',
          workedStep: si + 1,
          text: `${step.label}. ${step.speak || step.work}`,
        })),
        {
          phase: 'worked',
          sectionId: 'vr-sec-worked',
          workedStep: st.workedExample.steps.length + 1,
          chime: true,
          text: `Final answer: ${st.workedExample.finalAnswer}!`,
        },
      ];
      runSpeechQueue(segs);
    },
    [runSpeechQueue]
  );

  // Smoothly swing 3D VR camera right in front of a specific AI Learning Poster Station
  const focusAIStation = useCallback(
    (
      idx: number,
      opts?: {
        speak?: boolean;
        fullCard?: boolean;
        broadcast?: boolean;
        onDone?: () => void;
        overrideBlueprint?: AI3DBlueprintSpec;
      }
    ) => {
      const activeBp = opts?.overrideBlueprint || aiBlueprintRef.current || aiBlueprint;
      const stations = activeBp?.stations;
      if (!stations || stations.length === 0) return;
      const safeIdx = ((idx % stations.length) + stations.length) % stations.length;
      const st = stations[safeIdx];
      setActiveStationIdx(safeIdx);
      setShowInfoCard(true);
      setRevealedWorkedStep(99);
      setActiveTeachPhase('idle');

      const state = threeStateRef.current;
      if (state) {
        const isGallery =
          activeBp?.sceneType === 'concept-gallery' || stations.length >= 3;
        const targetAngle = (safeIdx / stations.length) * Math.PI * 2;
        state.controls.targetRotY = targetAngle;
        state.controls.targetRotX = isGallery ? 0.08 : 0.16;
        state.controls.targetZoom = isGallery ? 14.6 : 13.8;
      }

      if (opts?.broadcast !== false) {
        broadcastVRState({ activeStationIdx: safeIdx });
      }

      if (opts?.speak !== false && st) {
        if (opts?.fullCard !== false) {
          const segments = buildStationFullSegments(st, safeIdx);
          runSpeechQueue(segments, opts?.onDone);
        } else {
          const script =
            st.teacherScript ||
            st.narration ||
            `${st.title}. ${st.definition || st.subtitle}. ${st.examples?.[0] || st.example || ''}`;
          speakNarration(script, opts?.onDone);
        }
      }
    },
    [aiBlueprint, broadcastVRState, buildStationFullSegments, runSpeechQueue, speakNarration]
  );

  // Automated Full Explanation-Video VR Teacher Tour: reads EVERY card, works every problem, reads every activity!
  const startTeacherTour = useCallback(
    (startIndex = 0, overrideBlueprint?: AI3DBlueprintSpec) => {
      const activeBp = overrideBlueprint || aiBlueprintRef.current || aiBlueprint;
      const stations = activeBp?.stations;
      if (!stations || stations.length === 0) return;
      stopTeacherTour();
      setIsTeacherTourActive(true);
      teacherTourActiveRef.current = true;
      playSynthesizedSound('chime');

      const teachStep = (stepIdx: number) => {
        if (!teacherTourActiveRef.current) return;
        if (stepIdx >= stations.length) {
          stopTeacherTour();
          speakNarration(
            `Fantastic job! You completed the full ${activeBp?.title || 'VR'} video lesson! You can revisit any station or practice the quizzes anytime.`
          );
          return;
        }
        focusAIStation(stepIdx, {
          speak: true,
          fullCard: true,
          broadcast: true,
          overrideBlueprint: activeBp,
          onDone: () => {
            if (!teacherTourActiveRef.current) return;
            // Give pupil a comfortable pause at the end of each station's activity before gliding to next board
            teacherTourTimerRef.current = setTimeout(() => {
              teachStep(stepIdx + 1);
            }, 3500);
          },
        });
      };

      teachStep(startIndex);
    },
    [aiBlueprint, focusAIStation, playSynthesizedSound, speakNarration, stopTeacherTour]
  );

  // Launch Native WebXR Session on VR Headsets, OR seamlessly enter Browser Immersive VR Mode on Laptops/Tablets
  const launchNativeWebXR = async () => {
    const state = threeStateRef.current;

    const activateBrowserImmersiveVR = () => {
      const turningOn = displayMode !== 'split-vr';
      if (turningOn) {
        setDisplayMode('split-vr');
        setGazeReticleEnabled(true);
        setIsFullscreen(true);
        setVrStatusBanner(
          'Browser Immersive VR Mode active (360° Stereoscopic + Gaze). Connect a Meta Quest or Apple Vision Pro for native headset tracking.'
        );
        playSynthesizedSound('laser');
      } else {
        setDisplayMode('desktop');
        setGazeReticleEnabled(false);
        setIsFullscreen(false);
        setVrStatusBanner(null);
      }
    };

    if (!state || typeof navigator === 'undefined' || !(navigator as any).xr) {
      activateBrowserImmersiveVR();
      return;
    }

    try {
      const supported = await (navigator as any).xr
        .isSessionSupported('immersive-vr')
        .catch(() => false);

      if (!supported) {
        activateBrowserImmersiveVR();
        return;
      }

      const session = await (navigator as any).xr.requestSession('immersive-vr', {
        optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking'],
      });

      state.renderer.xr.enabled = true;
      await state.renderer.xr.setSession(session);
      setIsWebXRPresenting(true);
      setVrStatusBanner('Native WebXR Headset Session Active');
      playSynthesizedSound('laser');

      session.addEventListener('end', () => {
        setIsWebXRPresenting(false);
        setVrStatusBanner(null);
        state.renderer.xr.enabled = false;
      });
    } catch (_) {
      // No physical VR headset connected to this computer — gracefully switch to Browser Immersive VR Mode
      activateBrowserImmersiveVR();
    }
  };

  // Load Three.js dynamically
  useEffect(() => {
    let isCancelled = false;

    const loadThreeScript = () => {
      if ((window as any).THREE) {
        initThreeEngine();
        return;
      }
      const existingScript = document.getElementById('three-cdn-script');
      if (existingScript) {
        existingScript.addEventListener('load', () => {
          if (!isCancelled) initThreeEngine();
        });
        return;
      }

      const script = document.createElement('script');
      script.id = 'three-cdn-script';
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      script.async = true;
      script.onload = () => {
        if (!isCancelled) initThreeEngine();
      };
      script.onerror = () => {
        if (!isCancelled) setThreeError('Could not load 3D graphics engine. Check your internet connection and reload.');
      };
      document.body.appendChild(script);
    };

    const initThreeEngine = () => {
      const THREE = (window as any).THREE;
      const stageEl = stageRef.current || containerRef.current;
      if (!THREE || !canvasRef.current || !stageEl) return;

      const width = Math.max(stageEl.clientWidth || 800, 300);
      const height = Math.max(stageEl.clientHeight || 500, 300);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x060e1c);

      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.set(0, 18, 38);
      camera.lookAt(0, 0, 0);

      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Kainmueller-Lab/vr-viewer: Enable local slicing clipping planes
      renderer.localClippingEnabled = true;
      const clippingPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 50);

      // Lighting (Warm Solar Core PointLight + Deep 3D Rim & Hemisphere Depth)
      const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.38);
      scene.add(ambientLight);

      const hemiLight = new THREE.HemisphereLight(0xfef3c7, 0x0f172a, 0.35);
      scene.add(hemiLight);

      const sunLight = new THREE.PointLight(0xffefc2, 3.4, 220, 1.1);
      sunLight.position.set(0, 0, 0);
      scene.add(sunLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 0.75);
      dirLight.position.set(22, 32, 20);
      scene.add(dirLight);

      const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.45);
      rimLight.position.set(-22, -12, -20);
      scene.add(rimLight);

      // Cosmic Starfield
      const starGeometry = new THREE.BufferGeometry();
      const starCount = 1400;
      const starPositions = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount * 3; i += 3) {
        starPositions[i] = (Math.random() - 0.5) * 220;
        starPositions[i + 1] = (Math.random() - 0.5) * 220;
        starPositions[i + 2] = (Math.random() - 0.5) * 220;
      }
      starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.75, transparent: true, opacity: 0.85 });
      const starField = new THREE.Points(starGeometry, starMaterial);
      scene.add(starField);

      threeStateRef.current = {
        THREE,
        scene,
        camera,
        renderer,
        clippingPlane,
        controls: {
          isDragging: false,
          prevX: 0,
          prevY: 0,
          rotX: 0.35,
          rotY: 0,
          zoom: 38,
        },
        orbitMeshes: [],
        heartMesh: null,
        bloodParticles: null,
        geometryMesh: null,
        shapeFaces: [],
        cubeHinges: null,
        earthLayers: [],
        lavaParticles: null,
        vaultMesh: null,
        atomElectrons: [],
        raycaster: new THREE.Raycaster(),
        clock: new THREE.Clock(),
      };

      setThreeLoaded(true);
      setThreeError(null);
      buildActiveScene();
      startAnimationLoop();
    };

    loadThreeScript();

    return () => {
      isCancelled = true;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      if (threeStateRef.current?.renderer) {
        try {
          threeStateRef.current.renderer.setAnimationLoop(null);
          threeStateRef.current.renderer.dispose();
        } catch (_) {}
      }
      threeStateRef.current = null;
      stopNarration();
    };
  }, []);

  // Update Three.js clipping plane height
  useEffect(() => {
    const state = threeStateRef.current;
    if (!state || !state.clippingPlane) return;
    if (isSlicingActive) {
      // Scale sliceHeight between -4 and +4
      state.clippingPlane.constant = sliceHeight * 4.0;
    } else {
      state.clippingPlane.constant = 50; // no clipping
    }
  }, [sliceHeight, isSlicingActive]);

  // Build Scene based on activeModule
  const buildActiveScene = useCallback(() => {
    const state = threeStateRef.current;
    if (!state) return;
    const { THREE, scene, camera, clippingPlane } = state;

    // Clean previous objects
    state.orbitMeshes.forEach((item) => {
      scene.remove(item.mesh);
      if (item.orbitLine) scene.remove(item.orbitLine);
    });
    state.orbitMeshes = [];

    if (state.heartMesh) {
      scene.remove(state.heartMesh);
      state.heartMesh = null;
    }
    if (state.bloodParticles) {
      scene.remove(state.bloodParticles);
      state.bloodParticles = null;
    }
    if (state.geometryMesh) {
      scene.remove(state.geometryMesh);
      state.geometryMesh = null;
    }
    state.shapeFaces = [];
    state.cubeHinges = null;

    state.earthLayers.forEach((l) => scene.remove(l));
    state.earthLayers = [];

    if (state.lavaParticles) {
      scene.remove(state.lavaParticles);
      state.lavaParticles = null;
    }
    if (state.vaultMesh) {
      scene.remove(state.vaultMesh);
      state.vaultMesh = null;
    }
    state.atomElectrons = [];

    // Reset optimal camera framing per module so every 3D subject fills the stage clearly
    const moduleZoomMap: Record<VRModuleId, { zoom: number; rotX: number; rotY: number }> = {
      'solar-system': { zoom: 42, rotX: 0.45, rotY: 0 },
      'human-heart': { zoom: 10.5, rotX: 0.15, rotY: 0.2 },
      'geometry-volume': { zoom: 10.0, rotX: 0.35, rotY: 0.45 },
      'earth-volcano': { zoom: 12.5, rotX: 0.25, rotY: 0.4 },
      'dna-helix': { zoom: 15.5, rotX: 0.1, rotY: 0 },
      'plant-cell': { zoom: 12.5, rotX: 0.28, rotY: 0.35 },
      'bohr-atom': { zoom: 15.5, rotX: 0.32, rotY: 0.2 },
      'ancient-pyramid': { zoom: 16.5, rotX: 0.38, rotY: 0.5 },
      'ai-custom': { zoom: 13.5, rotX: 0.28, rotY: 0.35 },
    };
    const camPreset = moduleZoomMap[activeModule] || { zoom: 15, rotX: 0.3, rotY: 0 };
    state.controls.zoom = camPreset.zoom;
    state.controls.rotX = camPreset.rotX;
    state.controls.rotY = camPreset.rotY;

    // 1. SOLAR SYSTEM MODULE (True 3D Textured Spheres + Volumetric Glowing Sun Corona!)
    if (activeModule === 'solar-system') {
      camera.position.set(0, 22, 42);
      camera.lookAt(0, 0, 0);

      // Procedural 3D Solar Plasma & Granulation Texture
      const makeSunSurfaceTexture = () => {
        const cnv = document.createElement('canvas');
        cnv.width = 512;
        cnv.height = 256;
        const ctx = cnv.getContext('2d');
        if (!ctx) return null;

        const baseGrad = ctx.createLinearGradient(0, 0, 0, 256);
        baseGrad.addColorStop(0, '#ff8c00');
        baseGrad.addColorStop(0.25, '#ffb703');
        baseGrad.addColorStop(0.5, '#ffe066');
        baseGrad.addColorStop(0.75, '#ff9f1c');
        baseGrad.addColorStop(1, '#e85d04');
        ctx.fillStyle = baseGrad;
        ctx.fillRect(0, 0, 512, 256);

        // Swirling plasma granulation cells & fiery eddies
        for (let i = 0; i < 240; i++) {
          const x = (i * 73) % 512;
          const y = ((i * 41) % 236) + 10;
          const r = 6 + (i % 18);
          const g = ctx.createRadialGradient(x, y, 1, x, y, r);
          if (i % 3 === 0) {
            g.addColorStop(0, 'rgba(255, 255, 225, 0.72)');
            g.addColorStop(1, 'rgba(255, 190, 20, 0)');
          } else if (i % 3 === 1) {
            g.addColorStop(0, 'rgba(255, 95, 0, 0.55)');
            g.addColorStop(1, 'rgba(255, 120, 0, 0)');
          } else {
            g.addColorStop(0, 'rgba(185, 45, 0, 0.42)');
            g.addColorStop(1, 'rgba(255, 140, 0, 0)');
          }
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }

        // Subtle solar flare filaments
        ctx.strokeStyle = 'rgba(255, 250, 205, 0.4)';
        ctx.lineWidth = 2.5;
        for (let f = 0; f < 16; f++) {
          ctx.beginPath();
          const y0 = 25 + f * 13;
          ctx.moveTo(0, y0);
          ctx.bezierCurveTo(170, y0 + ((f % 2 === 0 ? 1 : -1) * 14), 340, y0 - ((f % 2 === 0 ? 1 : -1) * 14), 512, y0);
          ctx.stroke();
        }

        const tex = new THREE.CanvasTexture(cnv);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.needsUpdate = true;
        return tex;
      };

      // Radiant Glowing Circular Corona Halo Sprite Texture (360° camera-facing volumetric glow)
      const makeSunGlowTexture = (withRays: boolean) => {
        const cnv = document.createElement('canvas');
        cnv.width = 512;
        cnv.height = 512;
        const ctx = cnv.getContext('2d');
        if (!ctx) return null;

        const cx = 256;
        const cy = 256;

        // Smooth multi-stop volumetric radial glow
        const grad = ctx.createRadialGradient(cx, cy, 42, cx, cy, 250);
        if (!withRays) {
          grad.addColorStop(0, 'rgba(255, 255, 235, 1.0)');
          grad.addColorStop(0.24, 'rgba(255, 230, 120, 0.92)');
          grad.addColorStop(0.42, 'rgba(255, 175, 30, 0.58)');
          grad.addColorStop(0.62, 'rgba(255, 115, 0, 0.28)');
          grad.addColorStop(0.82, 'rgba(255, 75, 0, 0.08)');
          grad.addColorStop(1, 'rgba(255, 50, 0, 0)');
        } else {
          grad.addColorStop(0, 'rgba(255, 240, 160, 0.45)');
          grad.addColorStop(0.35, 'rgba(255, 180, 40, 0.25)');
          grad.addColorStop(0.7, 'rgba(255, 110, 0, 0.08)');
          grad.addColorStop(1, 'rgba(255, 60, 0, 0)');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);

        if (!withRays) {
          // Crisp luminous glowing circular ring around the Sun's chromosphere
          ctx.strokeStyle = 'rgba(255, 238, 150, 0.52)';
          ctx.lineWidth = 10;
          ctx.beginPath();
          ctx.arc(cx, cy, 122, 0, Math.PI * 2);
          ctx.stroke();

          ctx.strokeStyle = 'rgba(255, 165, 20, 0.28)';
          ctx.lineWidth = 18;
          ctx.beginPath();
          ctx.arc(cx, cy, 146, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          // Delicate golden corona sunbeams radiating outward
          ctx.save();
          ctx.translate(cx, cy);
          for (let r = 0; r < 24; r++) {
            ctx.rotate((Math.PI * 2) / 24);
            const rayGrad = ctx.createLinearGradient(95, 0, 245, 0);
            rayGrad.addColorStop(0, 'rgba(255, 225, 110, 0.34)');
            rayGrad.addColorStop(0.6, 'rgba(255, 150, 20, 0.12)');
            rayGrad.addColorStop(1, 'rgba(255, 100, 0, 0)');
            ctx.fillStyle = rayGrad;
            ctx.beginPath();
            ctx.moveTo(95, -5);
            ctx.lineTo(245, 0);
            ctx.lineTo(95, 5);
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();
        }

        const tex = new THREE.CanvasTexture(cnv);
        tex.needsUpdate = true;
        return tex;
      };

      // Procedural 3D Planet Surface Textures for genuine 3D realism
      const makePlanetTexture = (name: string) => {
        const cnv = document.createElement('canvas');
        cnv.width = 512;
        cnv.height = 256;
        const ctx = cnv.getContext('2d');
        if (!ctx) return null;

        if (name === 'Earth') {
          const ocean = ctx.createLinearGradient(0, 0, 0, 256);
          ocean.addColorStop(0, '#60a5fa');
          ocean.addColorStop(0.15, '#1d4ed8');
          ocean.addColorStop(0.5, '#1e40af');
          ocean.addColorStop(0.85, '#1d4ed8');
          ocean.addColorStop(1, '#60a5fa');
          ctx.fillStyle = ocean;
          ctx.fillRect(0, 0, 512, 256);

          // Continents
          ctx.fillStyle = '#22c55e';
          const blobs = [
            [95, 95, 48, 34], [140, 145, 30, 42], [245, 85, 58, 32],
            [275, 142, 34, 44], [385, 98, 62, 38], [415, 178, 32, 22],
          ];
          blobs.forEach(([x, y, rx, ry]) => {
            ctx.beginPath();
            ctx.ellipse(x, y, rx, ry, 0.3, 0, Math.PI * 2);
            ctx.fill();
          });

          // Polar ice caps
          ctx.fillStyle = 'rgba(248, 250, 252, 0.9)';
          ctx.fillRect(0, 0, 512, 18);
          ctx.fillRect(0, 238, 512, 18);

          // Swirling white clouds
          ctx.fillStyle = 'rgba(255, 255, 255, 0.38)';
          for (let c = 0; c < 22; c++) {
            ctx.beginPath();
            ctx.ellipse((c * 67) % 512, 32 + ((c * 37) % 190), 34 + (c % 25), 7 + (c % 6), 0.1, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (name === 'Jupiter') {
          const bands = ['#d97706', '#fde68a', '#b45309', '#f59e0b', '#fef3c7', '#c2410c', '#fbbf24', '#9a3412', '#fde68a', '#d97706'];
          bands.forEach((col, bi) => {
            ctx.fillStyle = col;
            ctx.fillRect(0, (bi * 256) / bands.length, 512, 256 / bands.length + 2);
          });
          // Great Red Spot
          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.ellipse(310, 152, 34, 18, -0.1, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#fef3c7';
          ctx.lineWidth = 3;
          ctx.stroke();
        } else if (name === 'Saturn') {
          const bands = ['#ca8a04', '#fef08a', '#eab308', '#fde047', '#fef9c3', '#d97706', '#fde047', '#ca8a04'];
          bands.forEach((col, bi) => {
            ctx.fillStyle = col;
            ctx.fillRect(0, (bi * 256) / bands.length, 512, 256 / bands.length + 2);
          });
        } else if (name === 'Mars') {
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(0, 0, 512, 256);
          for (let i = 0; i < 65; i++) {
            ctx.fillStyle = i % 2 === 0 ? 'rgba(127, 29, 29, 0.42)' : 'rgba(251, 146, 60, 0.35)';
            ctx.beginPath();
            ctx.arc((i * 89) % 512, 24 + ((i * 47) % 208), 8 + (i % 24), 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillRect(0, 0, 512, 12);
          ctx.fillRect(0, 244, 512, 12);
        } else if (name === 'Venus') {
          const g = ctx.createLinearGradient(0, 0, 0, 256);
          g.addColorStop(0, '#fde68a');
          g.addColorStop(0.5, '#f59e0b');
          g.addColorStop(1, '#d97706');
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, 512, 256);
          ctx.fillStyle = 'rgba(255, 251, 235, 0.28)';
          for (let i = 0; i < 18; i++) {
            ctx.fillRect(0, i * 14, 512, 6);
          }
        } else if (name === 'Uranus' || name === 'Neptune') {
          const isNep = name === 'Neptune';
          const g = ctx.createLinearGradient(0, 0, 0, 256);
          g.addColorStop(0, isNep ? '#1d4ed8' : '#06b6d4');
          g.addColorStop(0.5, isNep ? '#2563eb' : '#38bdf8');
          g.addColorStop(1, isNep ? '#1e3a8a' : '#0284c7');
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, 512, 256);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
          for (let i = 0; i < 12; i++) {
            ctx.fillRect(0, 12 + i * 21, 512, 5);
          }
        } else {
          // Mercury cratered slate
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(0, 0, 512, 256);
          for (let i = 0; i < 80; i++) {
            ctx.fillStyle = i % 2 === 0 ? 'rgba(51, 65, 85, 0.42)' : 'rgba(226, 232, 240, 0.3)';
            ctx.beginPath();
            ctx.arc((i * 71) % 512, (i * 53) % 256, 4 + (i % 14), 0, Math.PI * 2);
            ctx.fill();
          }
        }

        const tex = new THREE.CanvasTexture(cnv);
        tex.needsUpdate = true;
        return tex;
      };

      const makeSaturnRingTexture = () => {
        const cnv = document.createElement('canvas');
        cnv.width = 512;
        cnv.height = 64;
        const ctx = cnv.getContext('2d');
        if (!ctx) return null;
        const grad = ctx.createLinearGradient(0, 0, 512, 0);
        grad.addColorStop(0, 'rgba(253, 224, 71, 0)');
        grad.addColorStop(0.15, 'rgba(217, 178, 102, 0.55)');
        grad.addColorStop(0.4, 'rgba(254, 240, 138, 0.92)');
        grad.addColorStop(0.58, 'rgba(250, 204, 21, 0.78)');
        grad.addColorStop(0.65, 'rgba(15, 23, 42, 0.12)'); // Cassini Division gap
        grad.addColorStop(0.72, 'rgba(253, 224, 71, 0.72)');
        grad.addColorStop(0.92, 'rgba(217, 178, 102, 0.38)');
        grad.addColorStop(1, 'rgba(253, 224, 71, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 64);
        const tex = new THREE.CanvasTexture(cnv);
        tex.needsUpdate = true;
        return tex;
      };

      PLANETS.forEach((p) => {
        const geo = new THREE.SphereGeometry(p.size, 56, 56);
        let mat;
        if (p.name === 'Sun') {
          const sunTex = makeSunSurfaceTexture();
          mat = new THREE.MeshStandardMaterial({
            map: sunTex || undefined,
            emissiveMap: sunTex || undefined,
            color: 0xffd166,
            emissive: new THREE.Color(0xff9900),
            emissiveIntensity: 1.45,
            roughness: 0.35,
            metalness: 0.0,
            clippingPlanes: [clippingPlane],
          });
        } else {
          const planetTex = makePlanetTexture(p.name);
          mat = new THREE.MeshStandardMaterial({
            map: planetTex || undefined,
            color: planetTex ? 0xffffff : p.color,
            roughness: p.name === 'Earth' ? 0.52 : 0.72,
            metalness: p.name === 'Earth' ? 0.12 : 0.06,
            clippingPlanes: [clippingPlane],
            clipShadows: true,
          });
        }

        const mesh = new THREE.Mesh(geo, mat);
        mesh.name = p.name;
        mesh.userData = { planetData: p };
        const initialAngle = Math.random() * Math.PI * 2;
        if (p.distance > 0) {
          mesh.position.set(Math.cos(initialAngle) * p.distance, 0, Math.sin(initialAngle) * p.distance);
        }

        if (p.name === 'Sun') {
          // 1. 3D Volumetric Translucent Photosphere Aura Shell
          const auraShell = new THREE.Mesh(
            new THREE.SphereGeometry(p.size * 1.15, 48, 48),
            new THREE.MeshBasicMaterial({
              color: 0xffb703,
              transparent: true,
              opacity: 0.24,
              blending: THREE.AdditiveBlending,
              depthWrite: false,
              side: THREE.BackSide,
            })
          );
          auraShell.name = 'sunAuraShell';
          mesh.add(auraShell);

          // 2. Radiant Circular Glowing Corona Halo (Sprite always faces camera in 360°!)
          const glowTex = makeSunGlowTexture(false);
          if (glowTex) {
            const coronaSprite = new THREE.Sprite(
              new THREE.SpriteMaterial({
                map: glowTex,
                color: 0xffd166,
                transparent: true,
                opacity: 0.96,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
              })
            );
            coronaSprite.scale.set(11.8, 11.8, 1);
            coronaSprite.name = 'sunCorona';
            mesh.add(coronaSprite);
          }

          // 3. Outer Shimmering Golden Solar Flare Rays Halo
          const raysTex = makeSunGlowTexture(true);
          if (raysTex) {
            const raysSprite = new THREE.Sprite(
              new THREE.SpriteMaterial({
                map: raysTex,
                color: 0xffaa00,
                transparent: true,
                opacity: 0.72,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
              })
            );
            raysSprite.scale.set(15.4, 15.4, 1);
            raysSprite.name = 'sunOuterRays';
            mesh.add(raysSprite);
          }
        }

        // Earth 3D Glowing Sky-Blue Atmosphere Rim + Orbiting 3D Moon
        if (p.name === 'Earth') {
          const atmoMesh = new THREE.Mesh(
            new THREE.SphereGeometry(p.size * 1.09, 32, 32),
            new THREE.MeshBasicMaterial({
              color: 0x38bdf8,
              transparent: true,
              opacity: 0.22,
              blending: THREE.AdditiveBlending,
              depthWrite: false,
              side: THREE.BackSide,
            })
          );
          mesh.add(atmoMesh);

          const moonPivot = new THREE.Group();
          moonPivot.name = 'earthMoonPivot';
          const moonMesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.28, 24, 24),
            new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.88 })
          );
          moonMesh.position.set(1.9, 0.22, 0);
          moonPivot.add(moonMesh);
          mesh.add(moonPivot);
        }

        let orbitLine = null;
        if (p.distance > 0) {
          const orbitGeo = new THREE.BufferGeometry();
          const points = [];
          for (let a = 0; a <= Math.PI * 2; a += 0.04) {
            points.push(new THREE.Vector3(Math.cos(a) * p.distance, 0, Math.sin(a) * p.distance));
          }
          orbitGeo.setFromPoints(points);
          const orbitMat = new THREE.LineBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.25,
          });
          orbitLine = new THREE.Line(orbitGeo, orbitMat);
          scene.add(orbitLine);
        }

        if (p.hasRings) {
          const ringGeo = new THREE.RingGeometry(2.35, 4.4, 64);
          // Map radial UV coordinates so concentric Saturn ring bands render cleanly
          const posAttr = ringGeo.attributes.position;
          const uvAttr = ringGeo.attributes.uv;
          for (let vi = 0; vi < posAttr.count; vi++) {
            const x = posAttr.getX(vi);
            const y = posAttr.getY(vi);
            const r = Math.sqrt(x * x + y * y);
            const u = (r - 2.35) / (4.4 - 2.35);
            uvAttr.setXY(vi, Math.max(0, Math.min(1, u)), 0.5);
          }
          const ringTex = makeSaturnRingTexture();
          const ringMat = new THREE.MeshStandardMaterial({
            map: ringTex || undefined,
            color: 0xfef08a,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9,
            roughness: 0.65,
            depthWrite: false,
          });
          const ringMesh = new THREE.Mesh(ringGeo, ringMat);
          ringMesh.rotation.x = Math.PI / 2.25;
          mesh.add(ringMesh);
        }

        scene.add(mesh);
        state.orbitMeshes.push({
          mesh,
          orbitLine,
          data: p,
          angle: initialAngle,
        });
      });
    }

    // Shared helper: build a glowing 3D pointer arrow + floating callout badge pointing right at a 3D coordinate!
    const create3DPointerCallout = (
      targetPos: [number, number, number],
      labelText: string,
      accentHex = '#facc15'
    ) => {
      const ptrGroup = new THREE.Group();
      ptrGroup.name = 'vrPointerCallout';
      const tx = targetPos[0];
      const ty = targetPos[1];
      const tz = targetPos[2];
      const dir = new THREE.Vector3(tx, ty, tz);
      if (dir.lengthSq() < 0.01) dir.set(0.7, 0.8, 1.0);
      else dir.normalize();

      // Glowing target dot right on the vertex/edge/face
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 20, 20),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(accentHex) })
      );
      dot.position.set(tx, ty, tz);
      ptrGroup.add(dot);

      // Pulsing 3D Arrow Cone + Shaft pointing straight into targetPos
      const tipPos = new THREE.Vector3(tx, ty, tz).addScaledVector(dir, 0.36);
      const tailPos = new THREE.Vector3(tx, ty, tz).addScaledVector(dir, 1.85);
      const arrowMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(accentHex),
        emissive: new THREE.Color(accentHex),
        emissiveIntensity: 0.65,
        roughness: 0.25,
      });

      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.56, 20), arrowMat);
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.0, 16), arrowMat);

      const arrowPivot = new THREE.Group();
      arrowPivot.name = 'vrPointerArrow';
      cone.position.y = -0.28;
      cone.rotation.x = Math.PI;
      shaft.position.y = 0.5;
      arrowPivot.add(cone);
      arrowPivot.add(shaft);
      arrowPivot.position.copy(tipPos);
      // Orient arrowPivot local +Y along outward `dir` so cone points INWARD to targetPos!
      arrowPivot.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      ptrGroup.add(arrowPivot);

      // Crisp floating 3D callout label sprite at the tail of the pointer arrow
      const cnv = document.createElement('canvas');
      cnv.width = 512;
      cnv.height = 112;
      const ctx = cnv.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#060e1c';
        ctx.beginPath();
        ctx.roundRect(8, 8, 496, 96, 24);
        ctx.fill();
        ctx.strokeStyle = accentHex;
        ctx.lineWidth = 8;
        ctx.stroke();

        ctx.fillStyle = accentHex;
        ctx.font = '900 34px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`👆 ${labelText.slice(0, 24)}`, 256, 56);

        const tex = new THREE.CanvasTexture(cnv);
        tex.needsUpdate = true;
        const badge = new THREE.Sprite(
          new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false })
        );
        badge.scale.set(3.2, 0.72, 1);
        badge.position.copy(tailPos).addScaledVector(dir, 0.55);
        badge.renderOrder = 999;
        ptrGroup.add(badge);
      }

      return ptrGroup;
    };

    // 2. TRULY ANATOMICAL 3D HUMAN HEART (Sculpted Myocardium, Coronary Arteries, Aortic Arch w/ 3 Branches, Vena Cava & Pulmonary Bifurcation!)
    if (activeModule === 'human-heart') {
      camera.position.set(0, 1.5, 11.5);
      camera.lookAt(0, 0, 0);

      const heartGroup = new THREE.Group();

      // Procedural organic striated cardiac muscle + coronary artery/vein texture
      const makeHeartMuscleTexture = () => {
        const cnv = document.createElement('canvas');
        cnv.width = 512;
        cnv.height = 512;
        const ctx = cnv.getContext('2d');
        if (!ctx) return null;

        const g = ctx.createLinearGradient(0, 0, 0, 512);
        g.addColorStop(0, '#9f1239');
        g.addColorStop(0.45, '#be123c');
        g.addColorStop(0.8, '#881337');
        g.addColorStop(1, '#6b0f2a');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 512, 512);

        // Organic diagonal myocardial muscle fibers
        ctx.strokeStyle = 'rgba(255, 180, 195, 0.14)';
        ctx.lineWidth = 2;
        for (let i = -256; i < 768; i += 9) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.bezierCurveTo(i + 80, 170, i - 60, 340, i + 90, 512);
          ctx.stroke();
        }

        // Yellowish epicardial fat band along the coronary sulcus
        ctx.strokeStyle = 'rgba(253, 224, 71, 0.32)';
        ctx.lineWidth = 18;
        ctx.beginPath();
        ctx.moveTo(0, 165);
        ctx.bezierCurveTo(180, 190, 340, 150, 512, 175);
        ctx.stroke();

        // Branching crimson coronary arteries & blue cardiac veins
        const drawBranch = (x0: number, y0: number, col: string) => {
          ctx.strokeStyle = col;
          ctx.lineWidth = 4.5;
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.bezierCurveTo(x0 + 18, y0 + 90, x0 - 22, y0 + 180, x0 + 12, y0 + 290);
          ctx.stroke();
          ctx.lineWidth = 2.2;
          for (let b = 1; b <= 4; b++) {
            const by = y0 + b * 62;
            ctx.beginPath();
            ctx.moveTo(x0, by);
            ctx.lineTo(x0 + (b % 2 === 0 ? 48 : -44), by + 36);
            ctx.stroke();
          }
        };
        drawBranch(256, 155, 'rgba(244, 63, 94, 0.85)');
        drawBranch(266, 160, 'rgba(59, 130, 246, 0.72)');
        drawBranch(110, 175, 'rgba(244, 63, 94, 0.65)');
        drawBranch(405, 175, 'rgba(59, 130, 246, 0.62)');

        const tex = new THREE.CanvasTexture(cnv);
        tex.needsUpdate = true;
        return tex;
      };

      const muscleTex = makeHeartMuscleTexture();
      const myocardiumMat = new THREE.MeshStandardMaterial({
        map: muscleTex || undefined,
        color: 0xe11d48,
        roughness: 0.34,
        metalness: 0.08,
        clippingPlanes: [clippingPlane],
        side: THREE.DoubleSide,
      });
      const atriumMat = new THREE.MeshStandardMaterial({
        color: 0x9f1239,
        roughness: 0.42,
        metalness: 0.06,
        clippingPlanes: [clippingPlane],
      });
      const aortaMat = new THREE.MeshStandardMaterial({
        color: 0xf43f5e,
        emissive: 0x4c0519,
        emissiveIntensity: 0.2,
        roughness: 0.28,
        metalness: 0.1,
        clippingPlanes: [clippingPlane],
      });
      const venousMat = new THREE.MeshStandardMaterial({
        color: 0x2563eb,
        emissive: 0x172554,
        emissiveIntensity: 0.22,
        roughness: 0.32,
        metalness: 0.12,
        clippingPlanes: [clippingPlane],
      });
      const pulmonaryMat = new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        roughness: 0.32,
        metalness: 0.12,
        clippingPlanes: [clippingPlane],
      });

      // 1. Sculpted Asymmetrical Ventricular Myocardium (distinct tapered left-tilted apex & interventricular groove!)
      const ventGeo = new THREE.SphereGeometry(2.05, 56, 48);
      const posAttr = ventGeo.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        let x = posAttr.getX(i);
        let y = posAttr.getY(i);
        let z = posAttr.getZ(i);

        // Stretch vertically slightly and flatten front-to-back slightly like a real human heart
        y *= 1.28;
        z *= 0.86;

        // Taper bottom smoothly into the iconic leftward-pointing cardiac APEX!
        if (y < 0) {
          const t = Math.min(1, Math.abs(y) / 2.65);
          const taper = 1 - t * 0.56;
          x = x * taper + t * t * 0.72; // Apex tilts toward viewer's right (anatomical left!)
          z *= taper;
        } else {
          // Broaden upper base slightly where the ventricles meet the atria
          const u = Math.min(1, y / 2.65);
          x *= 1 + u * 0.08;
        }

        // Subtle anterior interventricular sulcus groove separating right & left ventricles
        if (z > 0.2 && Math.abs(x - (0.15 - y * 0.16)) < 0.45) {
          const groove = Math.cos(((x - (0.15 - y * 0.16)) / 0.45) * (Math.PI / 2));
          z -= groove * 0.22;
        }

        posAttr.setXYZ(i, x, y - 0.35, z);
      }
      ventGeo.computeVertexNormals();
      const ventMesh = new THREE.Mesh(ventGeo, myocardiumMat);
      ventMesh.name = 'Left Ventricle';
      heartGroup.add(ventMesh);

      // 2. Right Atrium & Scalloped Right Auricle (anatomical right = viewer's left)
      const rightAtrium = new THREE.Mesh(new THREE.SphereGeometry(1.08, 32, 28), atriumMat);
      rightAtrium.scale.set(1.05, 0.95, 0.92);
      rightAtrium.position.set(-1.28, 1.35, 0.18);
      heartGroup.add(rightAtrium);

      // 3. Left Atrium & Left Auricle (upper-right posterior)
      const leftAtrium = new THREE.Mesh(new THREE.SphereGeometry(0.98, 32, 28), atriumMat);
      leftAtrium.scale.set(1.08, 0.9, 0.88);
      leftAtrium.position.set(1.05, 1.48, -0.22);
      heartGroup.add(leftAtrium);

      // 4. Sweeping Aortic Arch (TubeGeometry curving over the top + Descending Aorta!)
      const aortaCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.15, 0.95, 0.15),
        new THREE.Vector3(-0.18, 2.25, 0.12),
        new THREE.Vector3(0.32, 3.12, -0.05),
        new THREE.Vector3(0.92, 2.55, -0.58),
        new THREE.Vector3(0.75, 0.4, -1.05),
        new THREE.Vector3(0.55, -2.1, -1.15),
      ]);
      const aortaMesh = new THREE.Mesh(new THREE.TubeGeometry(aortaCurve, 44, 0.44, 20, false), aortaMat);
      aortaMesh.name = 'Aorta Arch';
      heartGroup.add(aortaMesh);

      // 3 Iconic Superior Aortic Arch Branches (Brachiocephalic, Left Common Carotid, Left Subclavian)
      const archBranches: [number, number, number, number][] = [
        [-0.08, 3.25, 0.04, 0.14],
        [0.3, 3.45, -0.08, -0.04],
        [0.66, 3.22, -0.26, -0.22],
      ];
      archBranches.forEach(([bx, by, bz, rz]) => {
        const br = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.17, 1.05, 16), aortaMat);
        br.position.set(bx, by, bz);
        br.rotation.z = rz;
        heartGroup.add(br);
      });

      // 5. Superior & Inferior Vena Cava (venous blue trunks entering Right Atrium)
      const svcCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1.32, 3.45, -0.08),
        new THREE.Vector3(-1.35, 2.4, 0.05),
        new THREE.Vector3(-1.25, 1.4, 0.12),
      ]);
      const svcMesh = new THREE.Mesh(new THREE.TubeGeometry(svcCurve, 20, 0.36, 18, false), venousMat);
      svcMesh.name = 'Vena Cava';
      heartGroup.add(svcMesh);

      const ivcMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.38, 1.65, 18), venousMat);
      ivcMesh.position.set(-1.22, -1.65, -0.32);
      heartGroup.add(ivcMesh);

      // 6. Pulmonary Artery Trunk + Left & Right Bifurcation sweeping across front of Aorta!
      const pulmMain = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.28, 0.72, 0.82),
        new THREE.Vector3(0.05, 1.82, 0.78),
        new THREE.Vector3(0.32, 2.32, 0.38),
      ]);
      const pulmMesh = new THREE.Mesh(new THREE.TubeGeometry(pulmMain, 24, 0.36, 18, false), pulmonaryMat);
      pulmMesh.name = 'Pulmonary Artery';
      heartGroup.add(pulmMesh);

      const pulmLeftBranch = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.3, 2.3, 0.38),
        new THREE.Vector3(1.15, 2.28, 0.15),
        new THREE.Vector3(1.95, 2.08, -0.15),
      ]);
      heartGroup.add(new THREE.Mesh(new THREE.TubeGeometry(pulmLeftBranch, 16, 0.25, 14, false), pulmonaryMat));

      const pulmRightBranch = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.28, 2.28, 0.34),
        new THREE.Vector3(-0.65, 2.15, -0.2),
        new THREE.Vector3(-1.75, 2.02, -0.42),
      ]);
      heartGroup.add(new THREE.Mesh(new THREE.TubeGeometry(pulmRightBranch, 16, 0.24, 14, false), pulmonaryMat));

      // 7. 4 Arterial Red Pulmonary Veins entering Left Atrium
      [
        [1.75, 1.65, -0.35, 0.2],
        [1.75, 1.15, -0.45, -0.15],
        [-0.35, 1.32, -1.02, 0.25],
        [-0.2, 0.92, -1.05, -0.2],
      ].forEach(([vx, vy, vz, rz]) => {
        const pv = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.85, 14), aortaMat);
        pv.position.set(vx, vy, vz);
        pv.rotation.z = Math.PI / 2 + rz;
        heartGroup.add(pv);
      });

      // 8. Raised Anterior Interventricular Coronary Artery hugging the heart front!
      const corCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.08, 1.0, 1.48),
        new THREE.Vector3(0.26, 0.1, 1.68),
        new THREE.Vector3(0.45, -0.95, 1.48),
        new THREE.Vector3(0.65, -2.05, 0.92),
      ]);
      heartGroup.add(
        new THREE.Mesh(
          new THREE.TubeGeometry(corCurve, 24, 0.085, 10, false),
          new THREE.MeshStandardMaterial({ color: 0xfb7185, emissive: 0xbe123c, emissiveIntensity: 0.35, roughness: 0.25 })
        )
      );

      // Interactive 3D Pointer Callout for the selected anatomical heart region!
      const heartAnchorMap: Record<string, { pos: [number, number, number]; color: string }> = {
        'Left Ventricle': { pos: [0.95, -1.2, 1.35], color: '#facc15' },
        'Aorta Arch': { pos: [0.32, 3.15, 0.1], color: '#fb7185' },
        'Vena Cava': { pos: [-1.35, 2.75, 0.12], color: '#38bdf8' },
        'Pulmonary Artery': { pos: [0.22, 2.25, 0.65], color: '#60a5fa' },
      };
      const heartTarget = heartAnchorMap[selectedHeartPart];
      if (heartTarget) {
        heartGroup.add(create3DPointerCallout(heartTarget.pos, selectedHeartPart.toUpperCase(), heartTarget.color));
      }

      scene.add(heartGroup);
      state.heartMesh = heartGroup;

      // Flowing Oxygenated (Red) & Deoxygenated (Blue) Blood Corpuscles
      const particleCount = 120;
      const bloodGeo = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const particleData: { speed: number; phase: number; isArterial: boolean }[] = [];

      for (let i = 0; i < particleCount; i++) {
        const isArterial = i < particleCount / 2;
        particleData.push({
          speed: 0.02 + Math.random() * 0.03,
          phase: Math.random() * Math.PI * 2,
          isArterial,
        });

        colors[i * 3] = isArterial ? 1.0 : 0.2;
        colors[i * 3 + 1] = isArterial ? 0.15 : 0.55;
        colors[i * 3 + 2] = isArterial ? 0.25 : 1.0;
      }

      bloodGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      bloodGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const bloodMat = new THREE.PointsMaterial({
        size: 0.22,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
      });

      const bloodParticles = new THREE.Points(bloodGeo, bloodMat);
      bloodParticles.userData = { particleData };
      scene.add(bloodParticles);
      state.bloodParticles = bloodParticles;
    }

    // 3. 2D & 3D GEOMETRY STUDIO WITH LIVE ANIMATED 3D POINTERS (VERTICES, EDGES, FACES, RADIUS, APEX!)
    else if (activeModule === 'geometry-volume') {
      const shapeMeta = GEOMETRY_SHAPES.find((g) => g.id === selectedShape) || GEOMETRY_SHAPES[12];
      const is2D = shapeMeta.dimension === '2D';
      camera.position.set(0, is2D ? 0.5 : 3.8, is2D ? 10.5 : 11.5);
      camera.lookAt(0, 0, 0);
      if (is2D) {
        state.controls.rotX = 0.08;
        state.controls.rotY = 0;
        state.controls.zoom = 10.2;
      }

      const group = new THREE.Group();
      group.userData = { is2DShape: is2D };

      const edgeHighlightColor = geoHighlightPart === 'edges' ? 0x22d3ee : 0xfacc15;
      const faceEmissiveHex = geoHighlightPart === 'faces' ? shapeMeta.colorHex : 0x000000;
      const faceEmissiveIntensity = geoHighlightPart === 'faces' ? 0.42 : 0;

      if (selectedShape === 'cube') {
        const s = 2.4;
        const h = s / 2;
        const faceGeo = new THREE.PlaneGeometry(s, s);
        const makeFace = (colorHex: number) => {
          const mat = new THREE.MeshStandardMaterial({
            color: colorHex,
            emissive: new THREE.Color(faceEmissiveHex),
            emissiveIntensity: faceEmissiveIntensity,
            side: THREE.DoubleSide,
            roughness: 0.28,
            metalness: 0.12,
            transparent: true,
            opacity: 0.9,
            clippingPlanes: [clippingPlane],
          });
          const mesh = new THREE.Mesh(faceGeo, mat);
          const edges = new THREE.EdgesGeometry(faceGeo);
          const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: edgeHighlightColor }));
          mesh.add(line);
          return mesh;
        };

        const bottom = makeFace(0x2563eb);
        bottom.rotation.x = -Math.PI / 2;
        bottom.position.set(0, -h, 0);
        group.add(bottom);

        const frontHinge = new THREE.Group();
        frontHinge.position.set(0, -h, h);
        const frontFace = makeFace(0x3b82f6);
        frontFace.position.set(0, h, 0);
        frontHinge.add(frontFace);
        group.add(frontHinge);

        const backHinge = new THREE.Group();
        backHinge.position.set(0, -h, -h);
        const backFace = makeFace(0x1d4ed8);
        backFace.position.set(0, h, 0);
        backHinge.add(backFace);

        const topHinge = new THREE.Group();
        topHinge.position.set(0, s, 0);
        const topFace = makeFace(0x60a5fa);
        topFace.rotation.x = -Math.PI / 2;
        topFace.position.set(0, 0, h);
        topHinge.add(topFace);
        backHinge.add(topHinge);
        group.add(backHinge);

        const leftHinge = new THREE.Group();
        leftHinge.position.set(-h, -h, 0);
        const leftFace = makeFace(0x0ea5e9);
        leftFace.rotation.y = Math.PI / 2;
        leftFace.position.set(0, h, 0);
        leftHinge.add(leftFace);
        group.add(leftHinge);

        const rightHinge = new THREE.Group();
        rightHinge.position.set(h, -h, 0);
        const rightFace = makeFace(0x38bdf8);
        rightFace.rotation.y = Math.PI / 2;
        rightFace.position.set(0, h, 0);
        rightHinge.add(rightFace);
        group.add(rightHinge);

        state.cubeHinges = {
          front: frontHinge,
          back: backHinge,
          left: leftHinge,
          right: rightHinge,
          top: topHinge,
        };
      } else {
        let geo: any;
        const extrudeFlat2D = (shape2D: any) =>
          new THREE.ExtrudeGeometry(shape2D, { depth: 0.14, bevelEnabled: false });

        if (is2D) {
          const sh = new THREE.Shape();
          if (selectedShape === 'circle') {
            sh.absarc(0, 0, 2.2, 0, Math.PI * 2, false);
            geo = extrudeFlat2D(sh);
            // Add crisp glowing Radius line inside Circle!
            const radLine = new THREE.Line(
              new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, 0, 0.17),
                new THREE.Vector3(2.2, 0, 0.17),
              ]),
              new THREE.LineBasicMaterial({ color: 0xfacc15 })
            );
            group.add(radLine);
          } else if (selectedShape === 'oval') {
            sh.absellipse(0, 0, 2.6, 1.55, 0, Math.PI * 2, false, 0);
            geo = extrudeFlat2D(sh);
            const axisLine = new THREE.Line(
              new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(-2.6, 0, 0.17),
                new THREE.Vector3(2.6, 0, 0.17),
              ]),
              new THREE.LineBasicMaterial({ color: 0xfacc15 })
            );
            group.add(axisLine);
          } else {
            const pts = shapeMeta.vertexPoints;
            if (pts.length >= 3) {
              sh.moveTo(pts[0][0], pts[0][1]);
              for (let pi = 1; pi < pts.length; pi++) sh.lineTo(pts[pi][0], pts[pi][1]);
              sh.closePath();
              geo = extrudeFlat2D(sh);
            } else {
              geo = new THREE.BoxGeometry(3.6, 3.6, 0.14);
            }
          }
          // Center thin 2D plate on Z = 0
          geo.translate(0, 0, -0.07);
        } else if (selectedShape === 'cuboid') {
          geo = new THREE.BoxGeometry(4.4, 2.2, 2.8);
        } else if (selectedShape === 'cylinder') {
          geo = new THREE.CylinderGeometry(1.7, 1.7, 3.6, 36);
        } else if (selectedShape === 'pyramid') {
          geo = new THREE.ConeGeometry(2.4, 3.6, 4);
          geo.rotateY(Math.PI / 4);
        } else if (selectedShape === 'triangular-pyramid') {
          geo = new THREE.ConeGeometry(2.2, 3.7, 3);
        } else if (selectedShape === 'cone') {
          geo = new THREE.ConeGeometry(2.0, 3.8, 36);
        } else if (selectedShape === 'prism') {
          geo = new THREE.CylinderGeometry(2.0, 2.0, 4.0, 3);
        } else if (selectedShape === 'hex-prism') {
          geo = new THREE.CylinderGeometry(1.9, 1.9, 3.6, 6);
        } else if (selectedShape === 'hemisphere') {
          geo = new THREE.SphereGeometry(2.2, 36, 24, 0, Math.PI * 2, 0, Math.PI / 2);
          const cap = new THREE.Mesh(
            new THREE.CircleGeometry(2.2, 36),
            new THREE.MeshStandardMaterial({
              color: shapeMeta.colorHex,
              roughness: 0.3,
              side: THREE.DoubleSide,
              clippingPlanes: [clippingPlane],
            })
          );
          cap.rotation.x = Math.PI / 2;
          group.add(cap);
        } else if (selectedShape === 'torus') {
          geo = new THREE.TorusGeometry(2.0, 0.72, 24, 48);
        } else if (selectedShape === 'octahedron') {
          geo = new THREE.OctahedronGeometry(2.2, 0);
        } else {
          geo = new THREE.SphereGeometry(2.2, 36, 36);
        }

        const mat = new THREE.MeshStandardMaterial({
          color: shapeMeta.colorHex,
          emissive: new THREE.Color(faceEmissiveHex),
          emissiveIntensity: faceEmissiveIntensity,
          roughness: 0.25,
          metalness: 0.18,
          transparent: true,
          opacity: 0.88,
          side: THREE.DoubleSide,
          clippingPlanes: [clippingPlane],
        });

        const mesh = new THREE.Mesh(geo, mat);
        const edges = new THREE.EdgesGeometry(geo);
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: edgeHighlightColor }));
        mesh.add(line);
        group.add(mesh);
      }

      // Light up glowing 3D Vertex Spheres on EVERY corner when Vertices pointer is active!
      if (geoHighlightPart === 'vertices' && shapeMeta.vertexPoints.length > 0) {
        const vSphereGeo = new THREE.SphereGeometry(0.19, 18, 18);
        const vSphereMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
        shapeMeta.vertexPoints.forEach(([vx, vy, vz]) => {
          const vs = new THREE.Mesh(vSphereGeo, vSphereMat);
          vs.position.set(vx, vy, vz);
          group.add(vs);
        });
      }

      // Attach live animated 3D Pointer Arrow + Floating Badge showing exact Vertex / Edge / Face!
      if (geoHighlightPart !== 'none') {
        const ptrPos =
          geoHighlightPart === 'vertices'
            ? shapeMeta.pointers.vertex
            : geoHighlightPart === 'edges'
              ? shapeMeta.pointers.edge
              : shapeMeta.pointers.face;
        const ptrLabel =
          geoHighlightPart === 'vertices'
            ? shapeMeta.pointers.vertexLabel || 'VERTEX (CORNER)'
            : geoHighlightPart === 'edges'
              ? shapeMeta.pointers.edgeLabel || 'EDGE (SIDE)'
              : shapeMeta.pointers.faceLabel || 'FACE (SURFACE)';
        const ptrColor =
          geoHighlightPart === 'vertices'
            ? '#facc15'
            : geoHighlightPart === 'edges'
              ? '#22d3ee'
              : '#34d399';
        group.add(create3DPointerCallout(ptrPos, ptrLabel, ptrColor));
      }

      scene.add(group);
      state.geometryMesh = group;
    }

    // 4. EARTH LAYERS & VOLCANO
    else if (activeModule === 'earth-volcano') {
      camera.position.set(0, 4, 15);
      camera.lookAt(0, 0, 0);

      const earthGroup = new THREE.Group();

      const layerConfigs = [
        { name: 'Crust', color: 0x0284c7, radius: 3.6, explodeOffset: 4.5 },
        { name: 'Mantle', color: 0xea580c, radius: 2.8, explodeOffset: 2.2 },
        { name: 'Outer Core', color: 0xf59e0b, radius: 1.9, explodeOffset: 0.8 },
        { name: 'Inner Core', color: 0xfef08a, radius: 1.1, explodeOffset: 0.0 },
      ];

      layerConfigs.forEach((lc) => {
        const geo = new THREE.SphereGeometry(lc.radius, 32, 32, 0, Math.PI * 1.5);
        const mat =
          lc.name === 'Inner Core'
            ? new THREE.MeshBasicMaterial({ color: lc.color })
            : new THREE.MeshStandardMaterial({
                color: lc.color,
                roughness: 0.45,
                clippingPlanes: [clippingPlane],
                side: THREE.DoubleSide,
              });

        const mesh = new THREE.Mesh(geo, mat);
        mesh.userData = { config: lc };
        earthGroup.add(mesh);
        state.earthLayers.push(mesh);
      });

      // Volcano Lava Eruption
      const lavaCount = 100;
      const lavaGeo = new THREE.BufferGeometry();
      const lavaPos = new Float32Array(lavaCount * 3);
      const lavaColors = new Float32Array(lavaCount * 3);
      const lavaVelocities: { x: number; y: number; z: number; life: number }[] = [];

      for (let i = 0; i < lavaCount; i++) {
        lavaPos[i * 3] = 0;
        lavaPos[i * 3 + 1] = 3.6;
        lavaPos[i * 3 + 2] = 0;

        lavaColors[i * 3] = 1.0;
        lavaColors[i * 3 + 1] = Math.random() * 0.6;
        lavaColors[i * 3 + 2] = 0.0;

        lavaVelocities.push({
          x: (Math.random() - 0.5) * 0.06,
          y: 0.08 + Math.random() * 0.08,
          z: (Math.random() - 0.5) * 0.06,
          life: Math.random(),
        });
      }

      lavaGeo.setAttribute('position', new THREE.BufferAttribute(lavaPos, 3));
      lavaGeo.setAttribute('color', new THREE.BufferAttribute(lavaColors, 3));

      const lavaMat = new THREE.PointsMaterial({
        size: 0.28,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
      });

      const lavaParticles = new THREE.Points(lavaGeo, lavaMat);
      lavaParticles.userData = { lavaVelocities };
      earthGroup.add(lavaParticles);
      state.lavaParticles = lavaParticles;

      scene.add(earthGroup);
      state.geometryMesh = earthGroup;
    }

    // 5. project-SIMPLE: 3D ASSET VAULT - DNA DOUBLE HELIX
    else if (activeModule === 'dna-helix') {
      camera.position.set(0, 0, 16);
      camera.lookAt(0, 0, 0);

      const dnaGroup = new THREE.Group();
      const rungCount = 36;
      const helixRadius = 2.4;
      const helixHeight = 12.0;

      for (let i = 0; i < rungCount; i++) {
        const t = (i / rungCount) * Math.PI * 4; // Two complete twists
        const y = (i / rungCount - 0.5) * helixHeight;
        const x1 = Math.cos(t) * helixRadius;
        const z1 = Math.sin(t) * helixRadius;
        const x2 = -x1;
        const z2 = -z1;

        // Backbone sphere strand 1 (Cyan)
        const s1Geo = new THREE.SphereGeometry(0.3, 16, 16);
        const s1Mat = new THREE.MeshStandardMaterial({
          color: 0x06b6d4,
          roughness: 0.3,
          clippingPlanes: [clippingPlane],
        });
        const s1 = new THREE.Mesh(s1Geo, s1Mat);
        s1.position.set(x1, y, z1);
        dnaGroup.add(s1);

        // Backbone sphere strand 2 (Magenta)
        const s2Mat = new THREE.MeshStandardMaterial({
          color: 0xec4899,
          roughness: 0.3,
          clippingPlanes: [clippingPlane],
        });
        const s2 = new THREE.Mesh(s1Geo, s2Mat);
        s2.position.set(x2, y, z2);
        dnaGroup.add(s2);

        // Nitrogenous base rung (Yellow/Green)
        const rungGeo = new THREE.CylinderGeometry(0.12, 0.12, helixRadius * 2, 8);
        const rungMat = new THREE.MeshStandardMaterial({
          color: i % 2 === 0 ? 0xfacc15 : 0x10b981,
          roughness: 0.4,
          clippingPlanes: [clippingPlane],
        });
        const rung = new THREE.Mesh(rungGeo, rungMat);
        rung.position.set(0, y, 0);
        rung.rotation.z = Math.PI / 2;
        rung.rotation.y = t;
        dnaGroup.add(rung);
      }

      scene.add(dnaGroup);
      state.vaultMesh = dnaGroup;
    }

    // 6. project-SIMPLE: PLANT CELL ANATOMY
    else if (activeModule === 'plant-cell') {
      camera.position.set(0, 3, 14);
      camera.lookAt(0, 0, 0);

      const cellGroup = new THREE.Group();

      // Outer Rigid Cell Wall (Emerald Green Box)
      const wallGeo = new THREE.BoxGeometry(7, 5, 4);
      const wallMat = new THREE.MeshStandardMaterial({
        color: 0x059669,
        transparent: true,
        opacity: 0.35,
        wireframe: false,
        clippingPlanes: [clippingPlane],
        side: THREE.DoubleSide,
      });
      const wallMesh = new THREE.Mesh(wallGeo, wallMat);
      cellGroup.add(wallMesh);

      // Large Central Vacuole (Sky Blue Jelly)
      const vacGeo = new THREE.SphereGeometry(1.6, 24, 24);
      vacGeo.scale(1.4, 0.9, 1.1);
      const vacMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.65,
        clippingPlanes: [clippingPlane],
      });
      const vacuole = new THREE.Mesh(vacGeo, vacMat);
      vacuole.position.set(-1.0, 0, 0);
      cellGroup.add(vacuole);

      // Cell Nucleus (Purple sphere with yellow nucleolus)
      const nucGeo = new THREE.SphereGeometry(1.1, 24, 24);
      const nucMat = new THREE.MeshStandardMaterial({
        color: 0x9333ea,
        roughness: 0.3,
        clippingPlanes: [clippingPlane],
      });
      const nucleus = new THREE.Mesh(nucGeo, nucMat);
      nucleus.position.set(1.8, 0.8, 0.4);
      cellGroup.add(nucleus);

      // Chloroplasts (Bright Green discs)
      for (let i = 0; i < 6; i++) {
        const chGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 16);
        const chMat = new THREE.MeshStandardMaterial({
          color: 0x22c55e,
          roughness: 0.2,
          clippingPlanes: [clippingPlane],
        });
        const ch = new THREE.Mesh(chGeo, chMat);
        ch.position.set(
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 2.5
        );
        ch.rotation.x = Math.random() * Math.PI;
        cellGroup.add(ch);
      }

      scene.add(cellGroup);
      state.vaultMesh = cellGroup;
    }

    // 7. project-SIMPLE: BOHR ATOM & QUANTUM SHELLS
    else if (activeModule === 'bohr-atom') {
      camera.position.set(0, 4, 15);
      camera.lookAt(0, 0, 0);

      const atomGroup = new THREE.Group();

      // Nucleus Cluster (Protons Red, Neutrons Gold)
      for (let i = 0; i < 8; i++) {
        const nGeo = new THREE.SphereGeometry(0.4, 16, 16);
        const nMat = new THREE.MeshStandardMaterial({
          color: i % 2 === 0 ? 0xef4444 : 0xfacc15,
          roughness: 0.2,
          clippingPlanes: [clippingPlane],
        });
        const nMesh = new THREE.Mesh(nGeo, nMat);
        nMesh.position.set(
          (Math.random() - 0.5) * 0.9,
          (Math.random() - 0.5) * 0.9,
          (Math.random() - 0.5) * 0.9
        );
        atomGroup.add(nMesh);
      }

      // Orbital Rings (K, L, M quantum shells) + Glowing Orbiting Electrons!
      const shells = [
        { r: 2.8, count: 2, speed: 0.04, tiltX: 0, tiltZ: 0 },
        { r: 4.6, count: 4, speed: 0.028, tiltX: Math.PI / 3, tiltZ: 0.3 },
        { r: 6.4, count: 6, speed: 0.018, tiltX: -Math.PI / 3, tiltZ: -0.3 },
      ];
      shells.forEach((sh) => {
        const shellGroup = new THREE.Group();
        shellGroup.rotation.x = sh.tiltX;
        shellGroup.rotation.z = sh.tiltZ;

        const ringGeo = new THREE.BufferGeometry();
        const pts = [];
        for (let a = 0; a <= Math.PI * 2 + 0.05; a += 0.05) {
          pts.push(new THREE.Vector3(Math.cos(a) * sh.r, 0, Math.sin(a) * sh.r));
        }
        ringGeo.setFromPoints(pts);
        const ringMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45 });
        shellGroup.add(new THREE.Line(ringGeo, ringMat));

        for (let e = 0; e < sh.count; e++) {
          const eGeo = new THREE.SphereGeometry(0.26, 16, 16);
          const eMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
          const eMesh = new THREE.Mesh(eGeo, eMat);
          const startAngle = (e / sh.count) * Math.PI * 2;
          eMesh.position.set(Math.cos(startAngle) * sh.r, 0, Math.sin(startAngle) * sh.r);
          shellGroup.add(eMesh);
          state.atomElectrons.push({
            mesh: eMesh,
            radius: sh.r,
            angle: startAngle,
            speed: sh.speed,
            tiltX: sh.tiltX,
            tiltZ: sh.tiltZ,
          });
        }
        atomGroup.add(shellGroup);
      });

      scene.add(atomGroup);
      state.vaultMesh = atomGroup;
    }

    // 8. project-SIMPLE: ANCIENT PYRAMID & ARCHAEOLOGY
    else if (activeModule === 'ancient-pyramid') {
      camera.position.set(0, 6, 18);
      camera.lookAt(0, 0, 0);

      const pyrGroup = new THREE.Group();

      // Stepped Egyptian Pyramid centered vertically around y=0
      const steps = 6;
      for (let s = 0; s < steps; s++) {
        const w = (steps - s) * 2.2;
        const boxGeo = new THREE.BoxGeometry(w, 0.9, w);
        const boxMat = new THREE.MeshStandardMaterial({
          color: s === steps - 1 ? 0xfacc15 : 0xd97706,
          roughness: 0.65,
          clippingPlanes: [clippingPlane],
        });
        const b = new THREE.Mesh(boxGeo, boxMat);
        b.position.y = s * 0.9 - 2.25;
        pyrGroup.add(b);
      }

      scene.add(pyrGroup);
      state.vaultMesh = pyrGroup;
    }

    // 9. UNIVERSAL AI VR CLASSROOM & 3D BLUEPRINT COMPOSER
    else if (activeModule === 'ai-custom') {
      camera.position.set(0, 1.5, 14.2);
      camera.lookAt(0, 0, 0);

      const customGroup = new THREE.Group();
      const std = (color: number, roughness = 0.35) =>
        new THREE.MeshStandardMaterial({ color, roughness, clippingPlanes: [clippingPlane] });

      if (aiBlueprint) {
        const stations = Array.isArray(aiBlueprint.stations) ? aiBlueprint.stations : [];
        const isGallery =
          aiBlueprint.sceneType === 'concept-gallery' ||
          stations.length > 0 ||
          aiBlueprint.sceneType !== 'object';
        customGroup.userData = { isConceptGallery: isGallery };

        if (isGallery) {
          // Sleek Edvoura Holographic VR Classroom Floor Stage (NEVER blocky robots!)
          const stageBase = new THREE.Mesh(
            new THREE.CylinderGeometry(3.2, 3.6, 0.22, 48),
            new THREE.MeshStandardMaterial({
              color: 0x0f172a,
              emissive: 0x1e3a8a,
              emissiveIntensity: 0.45,
              roughness: 0.25,
              metalness: 0.6,
              clippingPlanes: [clippingPlane],
            })
          );
          stageBase.position.set(0, -2.55, 0);
          customGroup.add(stageBase);

          const outerGlowRing = new THREE.Mesh(
            new THREE.TorusGeometry(3.7, 0.07, 16, 64),
            new THREE.MeshBasicMaterial({ color: 0xfacc15, clippingPlanes: [clippingPlane] })
          );
          outerGlowRing.position.set(0, -2.4, 0);
          outerGlowRing.rotation.x = Math.PI / 2;
          outerGlowRing.userData = { aiAnimate: 'spinZ' };
          customGroup.add(outerGlowRing);

          const innerGlowRing = new THREE.Mesh(
            new THREE.TorusGeometry(2.3, 0.05, 16, 48),
            new THREE.MeshBasicMaterial({ color: 0x38bdf8, clippingPlanes: [clippingPlane] })
          );
          innerGlowRing.position.set(0, -2.35, 0);
          innerGlowRing.rotation.x = Math.PI / 2;
          innerGlowRing.userData = { aiAnimate: 'spinZ' };
          customGroup.add(innerGlowRing);
        } else if (Array.isArray(aiBlueprint.parts) && aiBlueprint.parts.length > 0) {
          const makeGeo = (part: AI3DPartSpec) => {
            const a = Array.isArray(part.args) ? part.args.map((n) => (Number.isFinite(n) ? n : 1)) : [1, 1, 1];
            switch (part.geometry) {
              case 'box':
                return new THREE.BoxGeometry(a[0] || 1, a[1] || 1, a[2] || 1);
              case 'sphere':
                return new THREE.SphereGeometry(Math.max(0.05, a[0] || 1), Math.min(32, a[1] || 24), Math.min(32, a[2] || 24));
              case 'cylinder':
                return new THREE.CylinderGeometry(
                  Math.max(0, a[0] ?? 0.5),
                  Math.max(0, a[1] ?? 0.5),
                  Math.max(0.05, a[2] || 1),
                  Math.min(32, a[3] || 20)
                );
              case 'cone':
                return new THREE.ConeGeometry(Math.max(0.05, a[0] || 1), Math.max(0.05, a[1] || 2), Math.min(32, a[2] || 20));
              case 'torus':
                return new THREE.TorusGeometry(
                  Math.max(0.1, a[0] || 1.5),
                  Math.max(0.03, a[1] || 0.3),
                  Math.min(24, a[2] || 16),
                  Math.min(48, a[3] || 32)
                );
              case 'octahedron':
                return new THREE.OctahedronGeometry(Math.max(0.1, a[0] || 1.5), 0);
              case 'dodecahedron':
                return new THREE.DodecahedronGeometry(Math.max(0.1, a[0] || 1.5), 0);
              case 'ring':
                return new THREE.RingGeometry(Math.max(0.05, a[0] || 0.8), Math.max(0.2, a[1] || 1.5), 24);
              case 'plane':
                return new THREE.PlaneGeometry(Math.max(0.1, a[0] || 2), Math.max(0.1, a[1] || 2));
              default:
                return new THREE.BoxGeometry(1, 1, 1);
            }
          };

          aiBlueprint.parts.forEach((part) => {
            try {
              const geo = makeGeo(part);
              const opacity = typeof part.opacity === 'number' ? Math.max(0.15, Math.min(1, part.opacity)) : 1;
              const mat = new THREE.MeshStandardMaterial({
                color: new THREE.Color(part.color || '#3b82f6'),
                emissive: part.emissive ? new THREE.Color(part.emissive) : new THREE.Color(0x000000),
                emissiveIntensity: part.emissive ? 0.45 : 0,
                roughness: typeof part.roughness === 'number' ? part.roughness : 0.4,
                metalness: typeof part.metalness === 'number' ? part.metalness : 0.15,
                transparent: opacity < 0.99,
                opacity,
                side: THREE.DoubleSide,
                clippingPlanes: [clippingPlane],
              });
              const mesh = new THREE.Mesh(geo, mat);
              mesh.name = part.name || 'AI Part';
              const pos = Array.isArray(part.position) ? part.position : [0, 0, 0];
              const rot = Array.isArray(part.rotation) ? part.rotation : [0, 0, 0];
              mesh.position.set(pos[0] || 0, pos[1] || 0, pos[2] || 0);
              mesh.rotation.set(rot[0] || 0, rot[1] || 0, rot[2] || 0);
              if (Array.isArray(part.scale)) {
                mesh.scale.set(part.scale[0] || 1, part.scale[1] || 1, part.scale[2] || 1);
              }
              if (part.wireframeEdges) {
                const edges = new THREE.EdgesGeometry(geo);
                mesh.add(new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xfacc15 })));
              }
              mesh.userData = {
                aiAnimate: part.animate || 'none',
                baseY: pos[1] || 0,
                baseScale: mesh.scale.clone(),
              };
              customGroup.add(mesh);
            } catch (_) {}
          });

          // Auto-center and normalize physical object bounding box
          const bbox = new THREE.Box3().setFromObject(customGroup);
          if (!bbox.isEmpty()) {
            const center = bbox.getCenter(new THREE.Vector3());
            const size = bbox.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z, 1);
            const normScale = 5.8 / maxDim;
            customGroup.children.forEach((ch: any) => {
              ch.position.sub(center);
              ch.position.multiplyScalar(normScale);
              ch.scale.multiplyScalar(normScale);
              if (ch.userData) {
                ch.userData.baseY = ch.position.y;
                ch.userData.baseScale = ch.scale.clone();
              }
            });
          }
        }

        // Render GIANT 1024x640 HD Illustrated VR Classroom Poster Boards (with pictures, definition, types, examples!)
        if (stations.length > 0) {
          const ringRadius = isGallery ? (stations.length >= 6 ? 8.2 : 6.4) : 6.2;
          state.controls.zoom = isGallery ? 14.4 : 13.8;
          state.controls.rotX = isGallery ? 0.08 : 0.2;
          state.controls.rotY = 0;
          state.controls.targetRotY = 0;
          state.controls.targetRotX = isGallery ? 0.08 : 0.2;
          state.controls.targetZoom = isGallery ? 14.4 : 13.8;

          const drawRoundedRect = (
            ctx: CanvasRenderingContext2D,
            x: number,
            y: number,
            w: number,
            h: number,
            r: number
          ) => {
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.arcTo(x + w, y, x + w, y + h, r);
            ctx.arcTo(x + w, y + h, x, y + h, r);
            ctx.arcTo(x, y + h, x, y, r);
            ctx.arcTo(x, y, x + w, y, r);
            ctx.closePath();
          };

          const makeIllustratedPosterTexture = (st: AI3DStationSpec, index: number) => {
            const cnv = document.createElement('canvas');
            cnv.width = 1024;
            cnv.height = 640;
            const ctx = cnv.getContext('2d');
            if (!ctx) return null;

            const accent = st.color || '#facc15';

            // Rich chalkboard-slate backdrop
            const bgGrad = ctx.createLinearGradient(0, 0, 0, 640);
            bgGrad.addColorStop(0, '#0f172a');
            bgGrad.addColorStop(1, '#060e1c');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, 1024, 640);

            // Outer neon border
            ctx.strokeStyle = accent;
            ctx.lineWidth = 14;
            drawRoundedRect(ctx, 10, 10, 1004, 620, 28);
            ctx.stroke();

            // Top vibrant header bar
            ctx.fillStyle = accent;
            drawRoundedRect(ctx, 22, 22, 980, 82, 18);
            ctx.fill();

            ctx.fillStyle = '#060e1c';
            ctx.font = '900 38px sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(
              `${index + 1}. ${(st.title || 'CONCEPT').toUpperCase().slice(0, 26)}`,
              48,
              63
            );

            ctx.font = '800 22px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(`LESSON ${index + 1} OF ${stations.length}`, 976, 63);

            // 4 Distinct Illustrated Visual Picture Cards across upper section!
            const visuals =
              Array.isArray(st.visuals) && st.visuals.length > 0
                ? st.visuals.slice(0, 4)
                : [
                    { icon: '📖', label: st.title, category: 'Concept', bgColor: accent },
                    { icon: '💡', label: 'Key Rule', category: 'Learn', bgColor: '#f59e0b' },
                    { icon: '🌟', label: 'Example', category: 'Practice', bgColor: '#10b981' },
                  ];

            const tileGap = 18;
            const totalW = 948;
            const tileW = (totalW - tileGap * (visuals.length - 1)) / visuals.length;
            const tileY = 122;
            const tileH = 182;

            visuals.forEach((v, vi) => {
              const tx = 38 + vi * (tileW + tileGap);
              const tileColor = v.bgColor || accent;

              // Colorful tinted card surface
              ctx.fillStyle = 'rgba(255,255,255,0.08)';
              drawRoundedRect(ctx, tx, tileY, tileW, tileH, 20);
              ctx.fill();

              // Bright colored top picture spotlight circle
              ctx.fillStyle = tileColor;
              ctx.globalAlpha = 0.28;
              ctx.beginPath();
              ctx.arc(tx + tileW / 2, tileY + 62, 46, 0, Math.PI * 2);
              ctx.fill();
              ctx.globalAlpha = 1;

              // Crisp colored tile outline
              ctx.strokeStyle = tileColor;
              ctx.lineWidth = 4;
              drawRoundedRect(ctx, tx, tileY, tileW, tileH, 20);
              ctx.stroke();

              // Big illustrated icon / picture
              ctx.font = '64px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(v.icon || '✨', tx + tileW / 2, tileY + 66);

              // Bold picture caption
              ctx.fillStyle = '#ffffff';
              ctx.font = '900 24px sans-serif';
              ctx.fillText((v.label || '').slice(0, 16), tx + tileW / 2, tileY + 132);

              // Sub-category tag
              if (v.category) {
                ctx.fillStyle = '#fde047';
                ctx.font = '800 16px sans-serif';
                ctx.fillText(v.category.toUpperCase().slice(0, 18), tx + tileW / 2, tileY + 160);
              }
            });

            // Definition Box
            ctx.fillStyle = 'rgba(255,255,255,0.06)';
            drawRoundedRect(ctx, 38, 322, 948, 126, 18);
            ctx.fill();

            ctx.fillStyle = '#fde047';
            ctx.font = '900 20px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('DEFINITION:', 60, 348);

            ctx.fillStyle = '#f8fafc';
            ctx.font = '700 25px sans-serif';
            const defText = st.definition || st.subtitle || '';
            const words = defText.split(' ');
            const defLines: string[] = [];
            let curLine = '';
            for (const w of words) {
              const test = curLine ? `${curLine} ${w}` : w;
              if (ctx.measureText(test).width > 900 && curLine) {
                defLines.push(curLine);
                curLine = w;
              } else {
                curLine = test;
              }
            }
            if (curLine) defLines.push(curLine);
            defLines.slice(0, 3).forEach((ln, li) => {
              ctx.fillText(ln, 60, 382 + li * 30);
            });

            // Types / Kinds Pills Row
            if (Array.isArray(st.types) && st.types.length > 0) {
              ctx.fillStyle = '#94a3b8';
              ctx.font = '900 18px sans-serif';
              ctx.fillText('TYPES:', 42, 488);

              let px = 122;
              st.types.slice(0, 4).forEach((tp) => {
                const label = tp.name.slice(0, 20);
                ctx.font = '800 19px sans-serif';
                const pillW = Math.min(210, ctx.measureText(label).width + 32);
                if (px + pillW < 988) {
                  ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
                  drawRoundedRect(ctx, px, 466, pillW, 42, 12);
                  ctx.fill();
                  ctx.strokeStyle = '#38bdf8';
                  ctx.lineWidth = 2;
                  ctx.stroke();

                  ctx.fillStyle = '#e0f2fe';
                  ctx.textAlign = 'center';
                  ctx.fillText(label, px + pillW / 2, 488);
                  ctx.textAlign = 'left';
                  px += pillW + 12;
                }
              });
            }

            // Bottom Highlighted Formula / Key Takeaway Banner (auto-fits cleanly so ZERO text clips!)
            const exLine =
              st.formulaOrRule ||
              st.example ||
              (Array.isArray(st.examples) && st.examples[0]) ||
              'Tap card to hear full VR teacher lesson!';
            ctx.fillStyle = 'rgba(250, 204, 21, 0.16)';
            drawRoundedRect(ctx, 38, 528, 948, 74, 16);
            ctx.fill();
            ctx.strokeStyle = '#facc15';
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.fillStyle = '#fef08a';
            ctx.textAlign = 'center';
            const displayBanner = `✨ ${exLine}`;
            let bannerFont = 23;
            ctx.font = `800 ${bannerFont}px sans-serif`;
            while (ctx.measureText(displayBanner).width > 900 && bannerFont > 15) {
              bannerFont -= 1;
              ctx.font = `800 ${bannerFont}px sans-serif`;
            }
            const safeBanner =
              ctx.measureText(displayBanner).width > 900
                ? `${displayBanner.slice(0, 72)}…`
                : displayBanner;
            ctx.fillText(safeBanner, 512, 566);

            const tex = new THREE.CanvasTexture(cnv);
            tex.needsUpdate = true;

            // If station has a real verified Wikipedia photograph (e.g., President portrait, Dinosaur, Volcano!), paint it crisply onto the 3D poster!
            if (st.imageUrl) {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.onload = () => {
                try {
                  ctx.save();
                  drawRoundedRect(ctx, 38, 122, 250, 182, 18);
                  ctx.clip();
                  const scale = Math.max(250 / img.width, 182 / img.height);
                  const dw = img.width * scale;
                  const dh = img.height * scale;
                  ctx.drawImage(img, 38 + (250 - dw) / 2, 122 + (182 - dh) / 2, dw, dh);
                  ctx.restore();
                  ctx.strokeStyle = '#facc15';
                  ctx.lineWidth = 5;
                  drawRoundedRect(ctx, 38, 122, 250, 182, 18);
                  ctx.stroke();
                  tex.needsUpdate = true;
                } catch (_) {}
              };
              img.src = st.imageUrl;
            }
            return tex;
          };

          // Build a REAL 3D sculpted animated educational object floating above each VR poster!
          const build3DStationProp = (st: AI3DStationSpec, accentHex: string) => {
            const propGroup = new THREE.Group();
            const qText = `${st.title} ${aiBlueprint.title} ${aiBlueprint.category}`.toLowerCase();
            const inferredKind =
              st.propKind ||
              (qText.includes('profit') || qText.includes('chart') || qText.includes('gain')
                ? 'chart'
                : qText.includes('cost') || qText.includes('price') || qText.includes('money') || qText.includes('loss')
                  ? 'coins'
                  : qText.includes('sell') || qText.includes('balance') || qText.includes('equation') || qText.includes('weight')
                    ? 'scale'
                    : qText.includes('fraction') || qText.includes('percent') || qText.includes('ratio')
                      ? 'pie'
                      : qText.includes('water') || qText.includes('chem') || qText.includes('matter') || qText.includes('acid')
                        ? 'beaker'
                        : qText.includes('photo') || qText.includes('plant') || qText.includes('leaf') || qText.includes('bio')
                          ? 'leaf'
                          : qText.includes('earth') || qText.includes('world') || qText.includes('continent') || qText.includes('geo')
                            ? 'globe'
                            : qText.includes('sun') || qText.includes('energy') || qText.includes('light')
                              ? 'sun'
                              : qText.includes('speech') || qText.includes('noun') || qText.includes('verb') || qText.includes('grammar') || qText.includes('english')
                                ? 'book'
                                : 'trophy');

            const matGold = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.65, roughness: 0.22, emissive: 0x713f12, emissiveIntensity: 0.25 });
            const matAccent = new THREE.MeshStandardMaterial({ color: new THREE.Color(accentHex || '#38bdf8'), metalness: 0.25, roughness: 0.35 });
            const matSilver = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.7, roughness: 0.25 });

            if (inferredKind === 'coins') {
              // Stacked 3D metallic gold coins + floating top spinning coin
              for (let c = 0; c < 4; c++) {
                const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.11, 24), matGold);
                coin.position.set(-0.32, c * 0.13 - 0.18, 0);
                propGroup.add(coin);
              }
              for (let c = 0; c < 6; c++) {
                const coin2 = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.11, 24), matGold);
                coin2.position.set(0.38, c * 0.13 - 0.18, 0.08);
                propGroup.add(coin2);
              }
              const emeraldGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.4, roughness: 0.2 }));
              emeraldGem.position.set(0, 0.85, 0);
              propGroup.add(emeraldGem);
            } else if (inferredKind === 'chart') {
              // Rising 3D neon bar chart + golden upward arrow
              const heights = [0.35, 0.62, 0.92, 1.25];
              const barCols = [0x38bdf8, 0xfacc15, 0x22c55e, 0x10b981];
              heights.forEach((h, bi) => {
                const bar = new THREE.Mesh(
                  new THREE.BoxGeometry(0.26, h, 0.26),
                  new THREE.MeshStandardMaterial({ color: barCols[bi], emissive: barCols[bi], emissiveIntensity: 0.25, roughness: 0.3 })
                );
                bar.position.set((bi - 1.5) * 0.36, h / 2 - 0.35, 0);
                propGroup.add(bar);
              });
              const base = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.1, 0.45), matSilver);
              base.position.set(0, -0.4, 0);
              propGroup.add(base);
            } else if (inferredKind === 'scale') {
              // 3D Golden Balance Scale
              const base = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.48, 0.14, 24), matGold);
              base.position.y = -0.35;
              propGroup.add(base);
              const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 1.05, 16), matGold);
              post.position.y = 0.2;
              propGroup.add(post);
              const beam = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.08, 0.08), matGold);
              beam.position.y = 0.65;
              beam.rotation.z = 0.14;
              propGroup.add(beam);
              const panL = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.18, 0.1, 20), matSilver);
              panL.position.set(-0.62, 0.22, 0);
              propGroup.add(panL);
              const panR = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.18, 0.1, 20), matAccent);
              panR.position.set(0.62, 0.42, 0);
              propGroup.add(panR);
            } else if (inferredKind === 'book') {
              // 3D Open Hardcover Classroom Book
              const leftCover = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.08, 0.95), matAccent);
              leftCover.position.set(-0.36, 0.06, 0);
              leftCover.rotation.z = 0.25;
              propGroup.add(leftCover);
              const rightCover = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.08, 0.95), matAccent);
              rightCover.position.set(0.36, 0.06, 0);
              rightCover.rotation.z = -0.25;
              propGroup.add(rightCover);
              const pagesL = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.12, 0.84), matSilver);
              pagesL.position.set(-0.34, 0.15, 0);
              pagesL.rotation.z = 0.25;
              propGroup.add(pagesL);
              const pagesR = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.12, 0.84), matSilver);
              pagesR.position.set(0.34, 0.15, 0);
              pagesR.rotation.z = -0.25;
              propGroup.add(pagesR);
            } else if (inferredKind === 'pie') {
              // 3D Fraction Cylinder Pie with popped golden wedge
              const mainPie = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.24, 28, 1, false, 0, Math.PI * 1.5), matAccent);
              mainPie.rotation.x = 0.45;
              propGroup.add(mainPie);
              const slice = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.24, 20, 1, false, Math.PI * 1.5, Math.PI * 0.5), matGold);
              slice.rotation.x = 0.45;
              slice.position.set(0.18, 0.12, 0.16);
              propGroup.add(slice);
            } else if (inferredKind === 'beaker') {
              // 3D Science Lab Flask with glowing cyan liquid
              const glass = new THREE.Mesh(
                new THREE.CylinderGeometry(0.24, 0.56, 0.95, 24),
                new THREE.MeshStandardMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.42, roughness: 0.1, metalness: 0.2 })
              );
              propGroup.add(glass);
              const liquid = new THREE.Mesh(
                new THREE.CylinderGeometry(0.38, 0.52, 0.45, 24),
                new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x0284c7, emissiveIntensity: 0.5, roughness: 0.2 })
              );
              liquid.position.y = -0.22;
              propGroup.add(liquid);
            } else if (inferredKind === 'globe') {
              const globe = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 24), new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.4 }));
              propGroup.add(globe);
              const ring = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.04, 12, 32), matGold);
              ring.rotation.y = 0.5;
              propGroup.add(ring);
            } else if (inferredKind === 'leaf') {
              const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.9, 12), new THREE.MeshStandardMaterial({ color: 0x15803d }));
              propGroup.add(stem);
              const leaf1 = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x15803d, emissiveIntensity: 0.3 }));
              leaf1.scale.set(1.4, 0.25, 0.8);
              leaf1.position.set(0.38, 0.2, 0);
              leaf1.rotation.z = 0.4;
              propGroup.add(leaf1);
              const leaf2 = leaf1.clone();
              leaf2.position.set(-0.38, 0.05, 0);
              leaf2.rotation.z = -0.4;
              propGroup.add(leaf2);
            } else if (inferredKind === 'sun') {
              const sunBall = new THREE.Mesh(new THREE.SphereGeometry(0.48, 24, 24), new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xf59e0b, emissiveIntensity: 1.1 }));
              propGroup.add(sunBall);
              const halo = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.05, 12, 32), matGold);
              propGroup.add(halo);
            } else {
              // 3D Golden Trophy Cup / Mastery Emblem
              const base = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.4, 0.16, 20), matSilver);
              base.position.y = -0.38;
              propGroup.add(base);
              const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.36, 16), matGold);
              stem.position.y = -0.14;
              propGroup.add(stem);
              const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.22, 0.55, 24), matGold);
              cup.position.y = 0.28;
              propGroup.add(cup);
            }

            return propGroup;
          };

          stations.forEach((st, idx) => {
            // Position Station 0 right at +Z (theta = 0) so camera rotY = 0 faces it dead-on, unmirrored!
            const theta = (idx / stations.length) * Math.PI * 2;
            const sx = Math.sin(theta) * ringRadius;
            const sz = Math.cos(theta) * ringRadius;
            const sy = isGallery ? 0.15 : 1.3;

            const cardTex = makeIllustratedPosterTexture(st, idx);
            if (cardTex) {
              const cardW = isGallery ? 5.6 : 4.2;
              const cardH = isGallery ? 3.5 : 2.62;
              const cardGeo = new THREE.PlaneGeometry(cardW, cardH);
              const cardMat = new THREE.MeshBasicMaterial({
                map: cardTex,
                side: THREE.DoubleSide,
                clippingPlanes: [clippingPlane],
              });
              const cardMesh = new THREE.Mesh(cardGeo, cardMat);
              cardMesh.position.set(sx, sy, sz);
              cardMesh.lookAt(sx * 2, sy, sz * 2);
              cardMesh.name = `station-${idx}`;
              cardMesh.userData = {
                stationIndex: idx,
                stationData: st,
                stationAngle: theta,
                aiAnimate: 'stationFloat',
                baseY: sy,
                baseScale: cardMesh.scale.clone(),
              };
              customGroup.add(cardMesh);
            }

            // Real 3D sculpted rotating educational prop floating right above each VR poster!
            if (isGallery) {
              const prop3D = build3DStationProp(st, st.color || '#facc15');
              prop3D.position.set(sx, sy + 2.45, sz);
              prop3D.userData = {
                aiAnimate: 'spinY',
                baseY: sy + 2.45,
                baseScale: prop3D.scale.clone(),
              };
              customGroup.add(prop3D);
            }

            // Glowing anchor pedestal pillar under each poster board
            const orb = new THREE.Mesh(
              new THREE.SphereGeometry(0.24, 16, 16),
              new THREE.MeshBasicMaterial({ color: new THREE.Color(st.color || '#facc15') })
            );
            orb.position.set(sx, sy - 2.15, sz);
            customGroup.add(orb);

            const beamGeo = new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(0, -2.35, 0),
              new THREE.Vector3(sx, sy - 2.15, sz),
            ]);
            const beam = new THREE.Line(
              beamGeo,
              new THREE.LineBasicMaterial({
                color: new THREE.Color(st.color || '#38bdf8'),
                transparent: true,
                opacity: 0.4,
              })
            );
            customGroup.add(beam);
          });
        }
      } else {
        const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(2.6, 0), std(0x8b5cf6, 0.15));
        const edges = new THREE.EdgesGeometry(new THREE.OctahedronGeometry(2.6, 0));
        crystal.add(new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xfacc15 })));
        customGroup.add(crystal);
      }

      scene.add(customGroup);
      state.vaultMesh = customGroup;
    }
  }, [activeModule, selectedShape, geoHighlightPart, selectedHeartPart, customAiKind, aiBlueprint]);

  useEffect(() => {
    buildActiveScene();
  }, [activeModule, buildActiveScene]);

  // Main 60FPS Animation Loop (WebXR compatible + zero stale closures via liveParamsRef)
  const startAnimationLoop = useCallback(() => {
    let lastSoundTime = 0;

    const animate = () => {
      const state = threeStateRef.current;
      if (!state) return;
      const { renderer, scene, camera, clock } = state;
      const lp = liveParamsRef.current;
      const time = clock.getElapsedTime();
      const effectiveSpeed = lp.isPlaying ? lp.speedMultiplier : 0;

      // Orbit / Gyro Camera Positioning + Smooth Teacher Spotlight Glide (skip when WebXR headset owns camera)
      const c = state.controls;
      if (!lp.isWebXRPresenting) {
        if (!c.isDragging) {
          if (typeof c.targetRotY === 'number') {
            // Shortest angular interpolation so camera never spins awkwardly around the back
            let diff = c.targetRotY - c.rotY;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            if (Math.abs(diff) < 0.004) {
              c.rotY = c.targetRotY;
              c.targetRotY = null;
            } else {
              c.rotY += diff * 0.1;
            }
          }
          if (typeof c.targetRotX === 'number') {
            const dx = c.targetRotX - c.rotX;
            if (Math.abs(dx) < 0.004) {
              c.rotX = c.targetRotX;
              c.targetRotX = null;
            } else {
              c.rotX += dx * 0.1;
            }
          }
          if (typeof c.targetZoom === 'number') {
            const dz = c.targetZoom - c.zoom;
            if (Math.abs(dz) < 0.05) {
              c.zoom = c.targetZoom;
              c.targetZoom = null;
            } else {
              c.zoom += dz * 0.1;
            }
          }
        }
        const radius = c.zoom;
        camera.position.x = radius * Math.sin(c.rotY) * Math.cos(c.rotX);
        camera.position.y = radius * Math.sin(c.rotX);
        camera.position.z = radius * Math.cos(c.rotY) * Math.cos(c.rotX);
        camera.lookAt(0, 0, 0);
      }

      // aframevr: Gaze Reticle Raycasting (with debounce cooldown so it triggers cleanly once)
      if (lp.gazeReticleEnabled && time > gazeCooldownRef.current) {
        state.raycaster.setFromCamera({ x: 0, y: 0 }, camera);
        const interactables =
          lp.activeModule === 'solar-system'
            ? state.orbitMeshes.map((m) => m.mesh)
            : scene.children.filter((ch: any) => ch.isMesh || ch.isGroup);

        const hits = state.raycaster.intersectObjects(interactables, true);
        if (hits.length > 0) {
          const hitObj = hits[0].object;
          const hitName = hitObj.userData?.planetData?.name || hitObj.name || 'Target';
          if (gazeTargetRef.current === hitName) {
            gazeTimerRef.current += 1.8;
            setGazeProgress(Math.min(100, gazeTimerRef.current));
            if (gazeTimerRef.current >= 100) {
              gazeTimerRef.current = 0;
              gazeCooldownRef.current = time + 2.2;
              setGazeProgress(0);
              playSynthesizedSound('laser');
              if (hitObj.userData?.planetData) {
                handleSelectPlanet(hitObj.userData.planetData.name);
              }
            }
          } else {
            gazeTargetRef.current = hitName;
            gazeTimerRef.current = 0;
            setGazeProgress(0);
          }
        } else if (gazeTargetRef.current !== null) {
          gazeTargetRef.current = null;
          gazeTimerRef.current = 0;
          setGazeProgress(0);
        }
      }

      // 1. Solar System
      if (lp.activeModule === 'solar-system') {
        state.orbitMeshes.forEach((item) => {
          if (item.data.distance > 0 && effectiveSpeed > 0) {
            item.angle += item.data.speed * 0.5 * effectiveSpeed;
            item.mesh.position.x = Math.cos(item.angle) * item.data.distance;
            item.mesh.position.z = Math.sin(item.angle) * item.data.distance;
          }
          item.mesh.rotation.y += item.data.rotationSpeed * (effectiveSpeed > 0 ? effectiveSpeed : 0);

          if (item.data.name === 'Sun') {
            const corona = item.mesh.getObjectByName('sunCorona');
            if (corona) {
              const pulse = 1 + Math.sin(time * 2.4) * 0.065;
              corona.scale.set(11.8 * pulse, 11.8 * pulse, 1);
            }
            const outerRays = item.mesh.getObjectByName('sunOuterRays');
            if (outerRays) {
              const rayPulse = 1 + Math.cos(time * 1.6) * 0.09;
              outerRays.scale.set(15.4 * rayPulse, 15.4 * rayPulse, 1);
              if (outerRays.material) {
                outerRays.material.rotation = time * 0.14;
              }
            }
            const auraShell = item.mesh.getObjectByName('sunAuraShell');
            if (auraShell) {
              const aPulse = 1 + Math.sin(time * 3.1) * 0.03;
              auraShell.scale.set(aPulse, aPulse, aPulse);
            }
          } else if (item.data.name === 'Earth' && effectiveSpeed > 0) {
            const moonPivot = item.mesh.getObjectByName('earthMoonPivot');
            if (moonPivot) {
              moonPivot.rotation.y += 0.025 * effectiveSpeed;
            }
          }
        });
      }

      // 2. Heart Anatomy
      else if (lp.activeModule === 'human-heart') {
        if (state.heartMesh) {
          if (effectiveSpeed > 0) {
            const beatWave = Math.sin(time * 4.5 * effectiveSpeed);
            const beatScale = 1 + Math.max(0, beatWave) * 0.12;
            state.heartMesh.scale.set(beatScale, beatScale, beatScale);
            state.heartMesh.rotation.y += 0.004 * effectiveSpeed;

            if (time - lastSoundTime > 1.35 / effectiveSpeed) {
              lastSoundTime = time;
              playSynthesizedSound('heartbeat');
            }
          }
        }

        if (state.bloodParticles && effectiveSpeed > 0) {
          const positions = state.bloodParticles.geometry.attributes.position.array;
          const pData = state.bloodParticles.userData.particleData;
          for (let i = 0; i < pData.length; i++) {
            const p = pData[i];
            p.phase += p.speed * effectiveSpeed;
            if (p.isArterial) {
              positions[i * 3] = 0.2 + Math.cos(p.phase) * 1.4;
              positions[i * 3 + 1] = 2.5 + Math.sin(p.phase) * 1.4;
              positions[i * 3 + 2] = Math.sin(p.phase * 2) * 0.3;
            } else {
              positions[i * 3] = -1.2 + Math.sin(p.phase) * 0.3;
              positions[i * 3 + 1] = 1.3 + ((p.phase * 0.8) % 2.2);
              positions[i * 3 + 2] = 0.2 + Math.cos(p.phase) * 0.3;
            }
          }
          state.bloodParticles.geometry.attributes.position.needsUpdate = true;
        }
      }

      // 3. Geometry (2D Flat + 3D Solid Shapes + Live Animated 3D Pointers + Hinged Cube Net!)
      else if (lp.activeModule === 'geometry-volume') {
        if (state.geometryMesh && effectiveSpeed > 0) {
          if (state.geometryMesh.userData?.is2DShape) {
            // Gentle 3D showcase sway for flat 2D shapes so pupils can always read vertices/edges clearly
            state.geometryMesh.rotation.y = Math.sin(time * 0.85 * effectiveSpeed) * 0.32;
            state.geometryMesh.rotation.x = Math.cos(time * 0.6 * effectiveSpeed) * 0.08;
          } else {
            state.geometryMesh.rotation.y += (lp.selectedShape === 'cube' ? 0.003 : 0.006) * effectiveSpeed;
            if (lp.selectedShape !== 'cube') {
              state.geometryMesh.rotation.x = Math.sin(time * 0.45 * effectiveSpeed) * 0.18;
            }
          }
          // Subtle pulse on the 3D pointer arrow so students immediately spot it!
          const ptrArrow = state.geometryMesh.getObjectByName('vrPointerArrow');
          if (ptrArrow) {
            const pScale = 1 + Math.sin(time * 5.2) * 0.12;
            ptrArrow.scale.set(pScale, pScale, pScale);
          }
        }

        if (lp.selectedShape === 'cube' && state.cubeHinges) {
          const u = lp.netUnfoldAmount * (Math.PI / 2);
          state.cubeHinges.front.rotation.x = u;
          state.cubeHinges.back.rotation.x = -u;
          state.cubeHinges.left.rotation.z = u;
          state.cubeHinges.right.rotation.z = -u;
          state.cubeHinges.top.rotation.x = -u;
        }
      }

      // 4. Earth Layers Explode & Lava Physics
      else if (lp.activeModule === 'earth-volcano') {
        if (state.geometryMesh && effectiveSpeed > 0) {
          state.geometryMesh.rotation.y += 0.004 * effectiveSpeed;
        }

        state.earthLayers.forEach((layer) => {
          const cfg = layer.userData.config;
          if (cfg) {
            layer.position.z = cfg.explodeOffset * lp.explodeAmount;
          }
        });

        if (state.lavaParticles && effectiveSpeed > 0) {
          const pos = state.lavaParticles.geometry.attributes.position.array;
          const vels = state.lavaParticles.userData.lavaVelocities;
          for (let i = 0; i < vels.length; i++) {
            const v = vels[i];
            pos[i * 3] += v.x * effectiveSpeed;
            pos[i * 3 + 1] += v.y * effectiveSpeed;
            pos[i * 3 + 2] += v.z * effectiveSpeed;
            v.y -= 0.003 * effectiveSpeed;

            if (pos[i * 3 + 1] < 3.2) {
              pos[i * 3] = (Math.random() - 0.5) * 0.2;
              pos[i * 3 + 1] = 3.6;
              pos[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
              v.y = 0.06 + Math.random() * 0.07;
            }
          }
          state.lavaParticles.geometry.attributes.position.needsUpdate = true;
        }
      }

      // 5. Vault Meshes (DNA, Cell, Atom, Pyramid, & Universal AI VR Classroom Blueprints)
      else if (state.vaultMesh) {
        const isConceptGallery =
          lp.activeModule === 'ai-custom' && Boolean(state.vaultMesh.userData?.isConceptGallery);

        if (effectiveSpeed > 0) {
          // Keep concept-gallery steady so pupils can read 3D posters cleanly; rotate physical 3D objects
          if (!isConceptGallery) {
            state.vaultMesh.rotation.y += 0.005 * effectiveSpeed;
          }
          if (lp.activeModule === 'bohr-atom' && state.atomElectrons.length > 0) {
            state.atomElectrons.forEach((el) => {
              el.angle += el.speed * effectiveSpeed;
              el.mesh.position.x = Math.cos(el.angle) * el.radius;
              el.mesh.position.z = Math.sin(el.angle) * el.radius;
            });
          } else if (lp.activeModule === 'ai-custom') {
            state.vaultMesh.children.forEach((part: any) => {
              const anim = part.userData?.aiAnimate;
              if (anim === 'spinY') part.rotation.y += 0.025 * effectiveSpeed;
              else if (anim === 'spinZ') part.rotation.z += 0.015 * effectiveSpeed;
              else if (anim === 'spinX') part.rotation.x += 0.025 * effectiveSpeed;
              else if (anim === 'stationFloat' && typeof part.userData?.baseY === 'number') {
                const isActive = part.userData.stationIndex === lp.activeStationIdx;
                const phase = (part.userData.stationIndex || 0) * 0.9;
                part.position.y =
                  part.userData.baseY + Math.sin(time * 1.6 + phase) * (isActive ? 0.06 : 0.11);
                if (part.userData.baseScale) {
                  const targetS = isActive ? 1.07 : 0.94;
                  part.scale.lerp(
                    part.userData.baseScale.clone().multiplyScalar(targetS),
                    0.12
                  );
                }
              } else if (anim === 'bob' && typeof part.userData?.baseY === 'number') {
                part.position.y = part.userData.baseY + Math.sin(time * 2.5 * effectiveSpeed) * 0.2;
              } else if (anim === 'pulse' && part.userData?.baseScale) {
                const p = 1 + Math.sin(time * 4 * effectiveSpeed) * 0.1;
                part.scale.copy(part.userData.baseScale).multiplyScalar(p);
              }
            });
          }
        }
      }

      // True Stereoscopic Dual-Viewport Rendering for Cardboard Split-VR Mode
      const stageEl = stageRef.current;
      if (lp.displayMode === 'split-vr' && !lp.isWebXRPresenting && stageEl) {
        const w = stageEl.clientWidth || 800;
        const h = stageEl.clientHeight || 500;
        const halfW = Math.floor(w / 2);
        const origAspect = camera.aspect;
        const origPos = camera.position.clone();
        const rightVec = new state.THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
        const eyeSep = Math.max(0.22, c.zoom * 0.015);

        renderer.setScissorTest(true);
        camera.aspect = halfW / h;
        camera.updateProjectionMatrix();

        // Left Eye
        camera.position.copy(origPos).addScaledVector(rightVec, -eyeSep);
        camera.lookAt(0, 0, 0);
        renderer.setViewport(0, 0, halfW, h);
        renderer.setScissor(0, 0, halfW, h);
        renderer.render(scene, camera);

        // Right Eye
        camera.position.copy(origPos).addScaledVector(rightVec, eyeSep);
        camera.lookAt(0, 0, 0);
        renderer.setViewport(halfW, 0, w - halfW, h);
        renderer.setScissor(halfW, 0, w - halfW, h);
        renderer.render(scene, camera);

        // Restore full viewport & camera state
        renderer.setScissorTest(false);
        renderer.setViewport(0, 0, w, h);
        camera.position.copy(origPos);
        camera.aspect = origAspect;
        camera.updateProjectionMatrix();
      } else {
        renderer.render(scene, camera);
      }
    };

    const st = threeStateRef.current;
    if (st?.renderer?.setAnimationLoop) {
      st.renderer.setAnimationLoop(animate);
    } else {
      const fallbackTick = () => {
        animate();
        animFrameIdRef.current = requestAnimationFrame(fallbackTick);
      };
      animFrameIdRef.current = requestAnimationFrame(fallbackTick);
    }
  }, [playSynthesizedSound]);

  // Pointer Handling (Orbit Drag + Click-to-Select 3D Planets)
  const handlePointerDown = (e: React.PointerEvent) => {
    const state = threeStateRef.current;
    if (!state) return;
    state.controls.isDragging = true;
    state.controls.targetRotX = null;
    state.controls.targetRotY = null;
    state.controls.targetZoom = null;
    state.controls.prevX = e.clientX;
    state.controls.prevY = e.clientY;
    pointerDownPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const state = threeStateRef.current;
    if (!state || !state.controls.isDragging) return;
    const dx = e.clientX - state.controls.prevX;
    const dy = e.clientY - state.controls.prevY;
    state.controls.prevX = e.clientX;
    state.controls.prevY = e.clientY;

    state.controls.rotY -= dx * 0.008;
    state.controls.rotX = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, state.controls.rotX + dy * 0.008));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const state = threeStateRef.current;
    if (!state) return;
    const wasDragging = state.controls.isDragging;
    state.controls.isDragging = false;

    // Detect clean click/tap (movement < 6px) to select 3D planets OR floating AI VR station cards directly on canvas!
    if (wasDragging && canvasRef.current) {
      const dist = Math.hypot(
        e.clientX - pointerDownPosRef.current.x,
        e.clientY - pointerDownPosRef.current.y
      );
      if (dist < 6) {
        const rect = canvasRef.current.getBoundingClientRect();
        const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        state.raycaster.setFromCamera({ x: ndcX, y: ndcY }, state.camera);

        if (liveParamsRef.current.activeModule === 'solar-system') {
          const hits = state.raycaster.intersectObjects(
            state.orbitMeshes.map((m) => m.mesh),
            true
          );
          if (hits.length > 0) {
            let obj = hits[0].object;
            while (obj && !obj.userData?.planetData && obj.parent) {
              obj = obj.parent;
            }
            if (obj?.userData?.planetData?.name) {
              handleSelectPlanet(obj.userData.planetData.name);
              setShowInfoCard(true);
            }
          }
        } else if (liveParamsRef.current.activeModule === 'ai-custom' && state.vaultMesh) {
          const hits = state.raycaster.intersectObjects(state.vaultMesh.children, true);
          const stationHit = hits.find((h: any) => typeof h.object?.userData?.stationIndex === 'number');
          if (stationHit) {
            const idx = stationHit.object.userData.stationIndex as number;
            stopTeacherTour();
            playSynthesizedSound('space');
            focusAIStation(idx, { speak: true, broadcast: true });
          }
        }
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    const state = threeStateRef.current;
    if (!state) return;
    state.controls.targetZoom = null;
    state.controls.zoom = Math.max(5, Math.min(80, state.controls.zoom + e.deltaY * 0.03));
  };

  // Gyroscope
  const toggleGyroscopeMode = async () => {
    if (gyroActive) {
      setGyroActive(false);
      setDisplayMode('desktop');
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
      return;
    }

    if (typeof (DeviceOrientationEvent as any)?.requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          setGyroActive(true);
          setDisplayMode('gyro');
          window.addEventListener('deviceorientation', handleDeviceOrientation);
        } else {
          alert('Orientation permission denied on device.');
        }
      } catch (err) {
        console.warn('Orientation request error:', err);
      }
    } else {
      setGyroActive(true);
      setDisplayMode('gyro');
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }
  };

  const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
    const state = threeStateRef.current;
    if (!state || !e.alpha || !e.beta) return;
    const alpha = (e.alpha * Math.PI) / 180;
    const beta = ((e.beta - 45) * Math.PI) / 180;
    state.controls.rotY = alpha;
    state.controls.rotX = Math.max(-1.2, Math.min(1.2, beta));
  };

  const handleResetView = () => {
    const state = threeStateRef.current;
    if (!state) return;
    state.controls.rotX = 0.3;
    state.controls.rotY = 0;
    state.controls.zoom = activeModule === 'solar-system' ? 38 : 14;
  };

  // Resize Listener (ResizeObserver on actual 3D canvas stage + window resize + fullscreen)
  useEffect(() => {
    const handleResize = () => {
      const state = threeStateRef.current;
      const stageEl = stageRef.current || containerRef.current;
      if (!state || !stageEl) return;
      const width = Math.max(stageEl.clientWidth, 1);
      const height = Math.max(stageEl.clientHeight, 1);
      state.camera.aspect = width / height;
      state.camera.updateProjectionMatrix();
      state.renderer.setSize(width, height, false);
    };

    window.addEventListener('resize', handleResize);
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && stageRef.current) {
      ro = new ResizeObserver(() => handleResize());
      ro.observe(stageRef.current);
    }
    const timer = setTimeout(handleResize, 120);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      if (ro) ro.disconnect();
    };
  }, [isFullscreen]);

  // Selection Narration Triggers
  const handleSelectPlanet = (name: string) => {
    setSelectedPin(name);
    setShowInfoCard(true);
    broadcastVRState({ selectedPin: name });
    playSynthesizedSound('space');
    const p = PLANETS.find((item) => item.name === name);
    if (p && autoNarrate) {
      speakNarration(p.speechText);
    }
  };

  const handleSelectHeartPart = (name: string) => {
    setSelectedHeartPart(name);
    playSynthesizedSound('heartbeat');
    const texts: Record<string, string> = {
      'Left Ventricle': 'The Left Ventricle is the most muscular chamber in the human heart. It contracts with great force to pump oxygen-rich blood through the aorta into your muscles, brain, and entire body!',
      'Aorta Arch': 'The Aorta is the largest artery in your body. It arches directly out of the left ventricle, branching into major blood vessels delivering oxygen-rich red blood to every organ.',
      'Vena Cava': 'The Vena Cava is the large vein system that brings deoxygenated blood back from your body to the heart, shown in blue because its oxygen has been used up.',
      'Pulmonary Artery': 'The Pulmonary Artery carries blood straight to your lungs, where breathing fills the red blood cells with fresh oxygen to be recirculated!',
    };
    if (texts[name] && autoNarrate) {
      speakNarration(texts[name]);
    }
  };

  const handleSelectShape = (shape: GeometryShapeId) => {
    stopTeacherTour();
    setSelectedShape(shape);
    const meta = GEOMETRY_SHAPES.find((g) => g.id === shape);
    if (meta) setGeoDimensionTab(meta.dimension);
    setGeoHighlightPart('vertices');
    setNetUnfoldAmount(0);
    broadcastVRState({ selectedShape: shape, netUnfoldAmount: 0 });
    playSynthesizedSound('chime');
    if (meta && autoNarrate) {
      speakNarration(meta.overviewSpeech);
    }
  };

  const handlePointGeometryPart = (part: GeoHighlightPart) => {
    stopTeacherTour();
    setGeoHighlightPart(part);
    playSynthesizedSound('space');
    const meta = GEOMETRY_SHAPES.find((g) => g.id === selectedShape);
    if (!meta) return;
    if (part === 'vertices') speakNarration(meta.vertexSpeech);
    else if (part === 'edges') speakNarration(meta.edgeSpeech);
    else if (part === 'faces') speakNarration(meta.faceSpeech);
  };

  const autoTeachGeometryParts = () => {
    const meta = GEOMETRY_SHAPES.find((g) => g.id === selectedShape);
    if (!meta) return;
    stopTeacherTour();
    const seqId = ++teachSequenceIdRef.current;
    const steps: { part: GeoHighlightPart; text: string }[] = [
      { part: 'vertices', text: meta.vertexSpeech },
      { part: 'edges', text: meta.edgeSpeech },
      { part: 'faces', text: meta.faceSpeech },
    ];
    const runStep = (i: number) => {
      if (teachSequenceIdRef.current !== seqId || i >= steps.length) return;
      setGeoHighlightPart(steps[i].part);
      playSynthesizedSound('chime');
      speakNarration(steps[i].text, () => {
        if (teachSequenceIdRef.current !== seqId) return;
        teacherTourTimerRef.current = setTimeout(() => runStep(i + 1), 700);
      });
    };
    runStep(0);
  };

  const handleSelectLayer = (layerName: string) => {
    setSelectedLayer(layerName);
    playSynthesizedSound('volcano');
    const texts: Record<string, string> = {
      Crust: 'The Earth’s Crust is the thin rocky outer layer where all continents, ocean floors, and human life exist. It ranges from 5 to 70 kilometers in thickness.',
      Mantle: 'The Mantle makes up 84 percent of Earth’s volume! It is made of hot semi-molten magma that moves in slow convection currents, powering continental drift and volcanoes.',
      'Outer Core': 'The Outer Core is a turbulent liquid ocean of molten iron and nickel over 4,000 degrees Celsius. The churning of this liquid metal creates Earth’s magnetic shield!',
      'Inner Core': 'The Inner Core is a solid sphere of iron and nickel at the exact center of Earth. Under immense pressure, it reaches 6,000 degrees Celsius, hotter than the surface of the Sun!',
    };
    if (texts[layerName] && autoNarrate) {
      speakNarration(texts[layerName]);
    }
  };

  // Universal Text-to-3D Synthesis: calls /api/ai/generate-3d so ANY topic on Earth builds a real 3D model!
  const handleGenerateAi3D = async (promptQuery: string) => {
    const cleanQuery = promptQuery.trim();
    if (!cleanQuery) return;

    setIsAiGenerating(true);
    setAiGenError(null);
    playSynthesizedSound('chime');

    try {
      const res = await fetch('/api/ai/generate-3d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: cleanQuery, gradeLevel: aiGradeLevel }),
      });

      const data = await res.json();
      if (!res.ok || !data?.blueprint) {
        throw new Error(data?.error || 'Could not generate 3D model right now.');
      }

      const bp: AI3DBlueprintSpec = data.blueprint;
      stopTeacherTour();
      aiBlueprintRef.current = bp;
      setAiBlueprint(bp);
      setActiveStationIdx(0);
      setQuizAnswers({});
      setShowQuizHint({});
      setShowQuizWork({});
      setRevealedWorkedStep(99);
      setActiveTeachPhase('idle');
      setCustomAiModelTitle(`✨ ${bp.title}`);
      setCustomAiDescription(bp.description);
      setActiveModule('ai-custom');
      setShowInfoCard(true);
      setAiBoardView('wide');
      setAiPromptOpen(false);
      broadcastVRState({ activeModule: 'ai-custom', aiBlueprint: bp, activeStationIdx: 0 });
      if (autoNarrate) {
        const opening = bp.teacherIntro || bp.narration || bp.description;
        if (bp.stations && bp.stations.length > 0) {
          if (opening) {
            speakNarration(opening, () => {
              startTeacherTour(0, bp);
            });
          } else {
            startTeacherTour(0, bp);
          }
        } else if (opening) {
          speakNarration(opening);
        }
      }
    } catch (err: any) {
      console.warn('AI 3D generation error:', err);
      setAiGenError(err?.message || 'Generation failed — please try again.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const activePlanetInfo = PLANETS.find((p) => p.name === selectedPin) || PLANETS[3];

  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative flex flex-col bg-slate-950 select-none overflow-hidden font-sans ${
        isFullscreen ? 'fixed inset-0 z-50' : ''
      }`}
    >
      {/* ============================================================
          TOP HEADER: 3D MODULES, ASSET VAULT, & WEBXR HEADSET
          ============================================================ */}
      <div className="h-12 border-b-[2.5px] border-dark bg-[#0a1124] px-3 sm:px-4 flex items-center justify-between shrink-0 text-white z-20">
        {/* Module Switcher Tabs */}
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-1">
          <span className="hidden lg:flex items-center gap-1 font-black text-xs text-yellow uppercase mr-1">
            <Sparkles className="w-3.5 h-3.5" /> 3D Lab
          </span>

          {[
            { id: 'solar-system', label: '🪐 Solar System' },
            { id: 'human-heart', label: '🫀 Anatomy Heart' },
            { id: 'geometry-volume', label: '📐 3D Geometry' },
            { id: 'earth-volcano', label: '🌋 Earth Core' },
            { id: 'dna-helix', label: '🧬 DNA Helix' },
            { id: 'plant-cell', label: '🌿 Plant Cell' },
            { id: 'bohr-atom', label: '⚛️ Bohr Atom' },
            { id: 'ancient-pyramid', label: '🏛️ Pyramid' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                const mod = tab.id as VRModuleId;
                stopTeacherTour();
                setActiveModule(mod);
                broadcastVRState({ activeModule: mod });
                playSynthesizedSound('space');
              }}
              className={`px-2 py-1 rounded-xl text-[11px] font-black transition-all flex items-center gap-1 shrink-0 border ${
                activeModule === tab.id
                  ? 'bg-yellow text-dark border-dark shadow-[1.5px_1.5px_0px_#060E1C]'
                  : 'bg-white/10 hover:bg-white/20 text-white/80 border-transparent'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Action Controls & Device Modes */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-2">
          {/* ruslanmv/GenAI-3D: AI Text-to-3D Synthesis Button */}
          <button
            onClick={() => setAiPromptOpen(!aiPromptOpen)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black transition-all bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border border-purple-400 shadow-sm"
            title="Generate a 3D model using AI"
          >
            <WandSparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI 3D Lab</span>
          </button>

          {/* oculus-samples: Native WebXR Headset OR Seamless Browser Immersive VR */}
          <button
            onClick={launchNativeWebXR}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black transition-all border ${
              isWebXRPresenting || displayMode === 'split-vr'
                ? 'bg-emerald-500 text-white border-white animate-pulse'
                : 'bg-sky-600 hover:bg-sky-500 text-white border-sky-400 shadow-sm'
            }`}
            title={
              webXRSupported
                ? 'Launch Native WebXR Headset Mode (Meta Quest / Apple Vision Pro)'
                : 'Enter Immersive 360° Stereoscopic VR Mode (works on any laptop, tablet, or Cardboard headset)'
            }
          >
            <Glasses className="w-3.5 h-3.5" />
            <span className="hidden md:inline">
              {isWebXRPresenting
                ? 'VR Headset Active'
                : displayMode === 'split-vr'
                  ? 'Exit VR Mode'
                  : webXRSupported
                    ? 'Enter WebXR'
                    : 'Enter VR Mode'}
            </span>
          </button>

          {/* aframevr: Gaze Reticle Toggle */}
          <button
            onClick={() => {
              setGazeReticleEnabled(!gazeReticleEnabled);
              playSynthesizedSound('laser');
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-black transition-all border ${
              gazeReticleEnabled
                ? 'bg-amber-500 text-dark border-dark'
                : 'bg-white/10 hover:bg-white/20 text-white/70 border-white/20'
            }`}
            title="Gaze Reticle Pointer for Cardboard VR (look to select)"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Gaze</span>
          </button>

          {/* Gyroscope Magic Window */}
          <button
            onClick={toggleGyroscopeMode}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-black transition-all border ${
              gyroActive
                ? 'bg-emerald-500 text-white border-dark animate-pulse'
                : 'bg-white/10 hover:bg-white/20 text-white/70 border-white/20'
            }`}
            title="Tilt tablet or phone to look around in 360°"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>

          {/* Cardboard Split Screen */}
          <button
            onClick={() => setDisplayMode(displayMode === 'split-vr' ? 'desktop' : 'split-vr')}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-black transition-all border ${
              displayMode === 'split-vr'
                ? 'bg-purple-600 text-white border-dark'
                : 'bg-white/10 hover:bg-white/20 text-white/70 border-white/20'
            }`}
            title="Split screen for Cardboard VR"
          >
            <Glasses className="w-3.5 h-3.5" />
          </button>

          {/* Reset Camera */}
          <button
            onClick={handleResetView}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 flex items-center justify-center border border-white/20 active:scale-95"
            title="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 flex items-center justify-center border border-white/20 active:scale-95"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ============================================================
          ruslanmv/GenAI-3D: POPUP AI 3D GENERATOR PROMPT BAR
          ============================================================ */}
      {aiPromptOpen && (
        <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 border-b-2 border-purple-500/40 px-3 sm:px-4 py-2.5 z-30 flex flex-col gap-2 shadow-2xl animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-wrap items-center gap-2 w-full">
            <WandSparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="font-black text-xs text-white uppercase tracking-wider shrink-0">
              AI VR Teacher Studio:
            </span>
            {/* Class / Grade Level Picker */}
            <div className="flex items-center gap-1.5 bg-slate-900 border-2 border-yellow/70 rounded-xl px-2.5 py-1 shrink-0 shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-wider text-yellow flex items-center gap-1 shrink-0">
                🎓 Grade / Class:
              </span>
              <select
                value={aiGradeLevel}
                onChange={(e) => setAiGradeLevel(e.target.value)}
                className="bg-transparent text-xs font-black text-white focus:outline-none cursor-pointer"
                title="Select student class or grade level"
              >
                <option value="Nursery / KG (Ages 3–5)" className="bg-slate-900 text-white">Nursery / KG (Ages 3–5)</option>
                <option value="Grade 1–3 (Lower Primary)" className="bg-slate-900 text-white">Grade 1–3 (Lower Primary)</option>
                <option value="Grade 4–6 (Upper Primary)" className="bg-slate-900 text-white">Grade 4–6 (Upper Primary)</option>
                <option value="JSS 1–3 (Grade 7–9)" className="bg-slate-900 text-white">JSS 1–3 (Grade 7–9)</option>
                <option value="SSS 1–3 (Grade 10–12)" className="bg-slate-900 text-white">SSS 1–3 (Grade 10–12)</option>
                <option value="Primary 1 / Grade 1" className="bg-slate-900 text-white">Primary 1 / Grade 1</option>
                <option value="Primary 2 / Grade 2" className="bg-slate-900 text-white">Primary 2 / Grade 2</option>
                <option value="Primary 3 / Grade 3" className="bg-slate-900 text-white">Primary 3 / Grade 3</option>
                <option value="Primary 4 / Grade 4" className="bg-slate-900 text-white">Primary 4 / Grade 4</option>
                <option value="Primary 5 / Grade 5" className="bg-slate-900 text-white">Primary 5 / Grade 5</option>
                <option value="Primary 6 / Grade 6" className="bg-slate-900 text-white">Primary 6 / Grade 6</option>
                <option value="JSS 1 (Grade 7)" className="bg-slate-900 text-white">JSS 1 (Grade 7)</option>
                <option value="JSS 2 (Grade 8)" className="bg-slate-900 text-white">JSS 2 (Grade 8)</option>
                <option value="JSS 3 (Grade 9)" className="bg-slate-900 text-white">JSS 3 (Grade 9)</option>
                <option value="SSS 1 (Grade 10)" className="bg-slate-900 text-white">SSS 1 (Grade 10)</option>
                <option value="SSS 2 (Grade 11)" className="bg-slate-900 text-white">SSS 2 (Grade 11)</option>
                <option value="SSS 3 (Grade 12)" className="bg-slate-900 text-white">SSS 3 (Grade 12)</option>
              </select>
            </div>
            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                value={aiPromptText}
                onChange={(e) => setAiPromptText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerateAi3D(aiPromptText)}
                placeholder="Type ANY lesson topic: Profit and Loss, Parts of Speech, Simple Interest, Photosynthesis..."
                className="w-full bg-slate-900/90 border border-purple-400/40 rounded-xl px-3 py-1 text-xs text-white placeholder-white/40 focus:outline-none focus:border-purple-400"
              />
              {aiGenError && <p className="text-[10px] font-bold text-rose-300 mt-1">{aiGenError}</p>}
            </div>
            <button
              onClick={() => handleGenerateAi3D(aiPromptText)}
              disabled={isAiGenerating}
              className="px-3.5 py-1.5 rounded-xl bg-yellow hover:bg-yellow/90 text-dark border-2 border-dark font-black text-xs flex items-center gap-1 shadow-[2px_2px_0px_#060E1C] shrink-0 cursor-pointer"
            >
              {isAiGenerating ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>{isAiGenerating ? 'Building VR Lesson...' : 'Generate VR Lesson'}</span>
            </button>
            <button
              onClick={() => setAiPromptOpen(false)}
              className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs text-white/70 shrink-0 cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Automatic Curriculum Subject & Topic Explorer Hub */}
          <div className="space-y-1.5 w-full">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {AUTO_CURRICULUM_SUBJECTS.map((subj) => (
                <button
                  key={subj.id}
                  onClick={() => setActiveCurriculumSubject(subj.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black shrink-0 border transition-all cursor-pointer ${
                    activeCurriculumSubject === subj.id
                      ? 'bg-yellow text-dark border-dark shadow-sm'
                      : 'bg-white/10 hover:bg-white/20 text-white/80 border-white/10'
                  }`}
                >
                  {subj.label}
                </button>
              ))}
              <button
                onClick={() => {
                  const allTopics = AUTO_CURRICULUM_SUBJECTS.flatMap((s) => s.topics);
                  const pick = allTopics[Math.floor(Math.random() * allTopics.length)];
                  if (pick) {
                    setAiPromptText(pick.query);
                    handleGenerateAi3D(pick.query);
                  }
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/25 hover:bg-emerald-500/40 text-emerald-200 border border-emerald-400/40 text-[10px] font-black shrink-0 cursor-pointer"
                title="Automatically pick and generate a rich curriculum VR lesson!"
              >
                🎲 Surprise Auto-Lesson
              </button>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[10px] text-white/50 font-bold shrink-0">1-Click Topics:</span>
              {(
                AUTO_CURRICULUM_SUBJECTS.find((s) => s.id === activeCurriculumSubject)?.topics ||
                AUTO_CURRICULUM_SUBJECTS[0].topics
              ).map((p) => (
                <button
                  key={p.label}
                  onClick={() => {
                    setAiPromptText(p.query);
                    handleGenerateAi3D(p.query);
                  }}
                  className="px-2.5 py-0.5 rounded-lg bg-white/10 hover:bg-purple-500/40 text-white/90 text-[10px] font-bold shrink-0 border border-white/10 cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          AUDIO NARRATION & Kainmueller-Lab SLICE CONTROL TOOLBAR
          ============================================================ */}
      <div className="bg-slate-900/95 border-b border-white/10 px-3 sm:px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 z-20 text-xs">
        {/* Voice Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (isSpeaking) {
                stopNarration();
              } else {
                if (activeModule === 'solar-system') {
                  speakNarration(activePlanetInfo.speechText);
                } else if (activeModule === 'human-heart') {
                  handleSelectHeartPart(selectedHeartPart);
                } else if (activeModule === 'geometry-volume') {
                  handleSelectShape(selectedShape);
                } else if (activeModule === 'dna-helix') {
                  speakNarration('DNA Double Helix: The twisted ladder structure composed of complementary base pairs: Adenine pairs with Thymine, and Guanine pairs with Cytosine.');
                } else if (activeModule === 'plant-cell') {
                  speakNarration('Eukaryotic Plant Cell: Chloroplasts perform photosynthesis, the rigid cell wall provides structure, and the central vacuole maintains turgor pressure.');
                } else if (activeModule === 'bohr-atom') {
                  speakNarration('Bohr Atom: Positively charged protons and neutral neutrons form the dense nucleus, surrounded by orbiting electrons.');
                } else if (activeModule === 'ancient-pyramid') {
                  speakNarration('Ancient Egyptian Pyramids: Architectural marvels of the ancient world constructed from millions of limestone blocks.');
                } else if (activeModule === 'ai-custom' && aiBlueprint) {
                  if (aiBlueprint.stations && aiBlueprint.stations.length > 0) {
                    startTeacherTour();
                  } else {
                    speakNarration(aiBlueprint.teacherIntro || aiBlueprint.narration || aiBlueprint.description);
                  }
                } else {
                  handleSelectLayer(selectedLayer);
                }
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-black transition-all border ${
              isSpeaking
                ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-300 shadow-sm animate-pulse'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-400 shadow-sm'
            }`}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span>Stop Voice</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                <span>🔊 Spoken Audio Tour</span>
              </>
            )}
          </button>

          {isSpeaking && (
            <div className="flex items-center gap-0.5 px-2 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-bold text-[10px]">
              <span className="w-1 h-3 bg-emerald-400 rounded-full animate-bounce" />
              <span className="w-1 h-4 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.15s]" />
              <span className="w-1 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.3s]" />
              <span className="hidden sm:inline ml-1 font-mono">Narrating Aloud...</span>
            </div>
          )}

          {/* Auto-Voice Switch */}
          <button
            onClick={() => setAutoNarrate(!autoNarrate)}
            className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg font-bold text-[10px] border transition-all ${
              autoNarrate
                ? 'bg-white/10 text-yellow border-yellow/40'
                : 'bg-white/5 text-white/50 border-white/10 hover:text-white'
            }`}
          >
            <span>Auto-Voice:</span>
            <span className="font-black uppercase">{autoNarrate ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Kainmueller-Lab: Anatomical Cross-Section Slice Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const next = !isSlicingActive;
              setIsSlicingActive(next);
              broadcastVRState({ isSlicingActive: next });
              playSynthesizedSound('laser');
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-xs border transition-all ${
              isSlicingActive
                ? 'bg-rose-600 text-white border-rose-300 shadow-sm'
                : 'bg-white/10 hover:bg-white/20 text-white/80 border-white/20'
            }`}
            title="Dissect 3D models with medical slicing plane"
          >
            <Scissors className="w-3.5 h-3.5 text-rose-300" />
            <span>{isSlicingActive ? '✂️ Slicing Active' : 'Slice Plane'}</span>
          </button>

          {isSlicingActive && (
            <div className="flex items-center gap-1.5 bg-rose-950/80 border border-rose-500/40 px-2 py-0.5 rounded-lg text-[10px]">
              <span className="text-rose-200">Cut:</span>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.05"
                value={sliceHeight}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setSliceHeight(val);
                  broadcastVRState({ sliceHeight: val });
                }}
                className="w-16 accent-rose-500 cursor-pointer h-1.5"
              />
            </div>
          )}

          {/* Manim Motion Controls */}
          <button
            onClick={() => {
              const next = !isPlaying;
              setIsPlaying(next);
              broadcastVRState({ isPlaying: next });
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20"
          >
            {isPlaying ? <Pause className="w-3 h-3 text-yellow" /> : <Play className="w-3 h-3 text-emerald-400" />}
            <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-lg border border-white/10 text-[10px] text-white/70">
            <FastForward className="w-3 h-3 text-yellow" />
            {[0.5, 1.0, 2.0, 5.0].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSpeedMultiplier(s);
                  broadcastVRState({ speedMultiplier: s });
                }}
                className={`px-1 rounded font-black ${
                  speedMultiplier === s ? 'bg-yellow text-dark' : 'hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Toggle Info Card */}
          <button
            onClick={() => setShowInfoCard(!showInfoCard)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg font-bold text-xs border transition-all ${
              showInfoCard
                ? 'bg-yellow text-dark border-dark'
                : 'bg-white/10 hover:bg-white/20 text-white/80 border-white/20'
            }`}
            title={showInfoCard ? 'Hide Fact Card for full 3D view' : 'Show Fact Card'}
          >
            <Info className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{showInfoCard ? 'Hide Info' : 'Show Info'}</span>
          </button>
        </div>
      </div>

      {/* ============================================================
          MAIN 3D WEBGL STAGE
          ============================================================ */}
      <div
        ref={stageRef}
        className="flex-1 w-full h-full min-h-[320px] relative cursor-grab active:cursor-grabbing overflow-hidden touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
      >
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Friendly Immersive VR Mode / AI Model Generated Status Banners */}
        {(vrStatusBanner || (customAiModelTitle && !(activeModule === 'ai-custom' && showInfoCard))) && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex flex-col gap-1.5 max-w-md pointer-events-auto">
            {vrStatusBanner && (
              <div className="bg-sky-950/95 border border-sky-400/60 px-3 py-2 rounded-xl text-[11px] font-bold text-sky-100 shadow-xl flex items-center justify-between gap-2">
                <span>🥽 {vrStatusBanner}</span>
                <button
                  onClick={() => {
                    setDisplayMode('desktop');
                    setGazeReticleEnabled(false);
                    setIsFullscreen(false);
                    setVrStatusBanner(null);
                  }}
                  className="px-2 py-0.5 rounded-lg bg-yellow text-dark font-black text-[10px] uppercase shrink-0"
                >
                  Exit VR
                </button>
              </div>
            )}
            {customAiModelTitle && !(activeModule === 'ai-custom' && showInfoCard) && (
              <div className="bg-purple-950/90 border border-purple-400/50 px-3 py-1.5 rounded-xl text-[11px] font-black text-purple-100 shadow-lg flex items-center justify-between gap-2">
                <span>{customAiModelTitle}</span>
                <button
                  onClick={() => setShowInfoCard(true)}
                  className="px-2 py-0.5 rounded-md bg-yellow text-dark text-[10px] font-black uppercase"
                >
                  Open Teacher Board
                </button>
                <button
                  onClick={() => setCustomAiModelTitle('')}
                  className="text-xs text-white/60 hover:text-white font-black"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        )}

        {!threeLoaded && !threeError && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#060E1C] text-white gap-3">
            <Loader className="w-8 h-8 animate-spin text-yellow" />
            <p className="text-xs font-black uppercase tracking-wider">Loading Interactive 3D &amp; VR Engine...</p>
          </div>
        )}

        {threeError && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#060E1C] text-white gap-3 p-6 text-center">
            <p className="text-sm font-black text-rose-400">{threeError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl bg-yellow text-dark font-black text-xs uppercase"
            >
              Reload 3D Lab
            </button>
          </div>
        )}

        {/* aframevr: Gaze Reticle Center Pointer Ring */}
        {gazeReticleEnabled && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
            <div className="relative w-8 h-8 rounded-full border-2 border-white/40 flex items-center justify-center">
              <div
                className="w-2.5 h-2.5 rounded-full bg-yellow transition-all"
                style={{ transform: `scale(${1 + (gazeProgress / 100) * 1.5})` }}
              />
              {gazeProgress > 0 && (
                <svg className="absolute inset-0 w-8 h-8 -rotate-90">
                  <circle
                    cx="16"
                    cy="16"
                    r="14"
                    fill="none"
                    stroke="#facc15"
                    strokeWidth="3"
                    strokeDasharray="88"
                    strokeDashoffset={88 - (88 * gazeProgress) / 100}
                  />
                </svg>
              )}
            </div>
          </div>
        )}

        {/* Cardboard Split Screen Eye Divider */}
        {displayMode === 'split-vr' && (
          <div className="absolute inset-0 pointer-events-none flex">
            <div className="w-1/2 h-full border-r-2 border-white/30 flex items-center justify-center">
              <span className="text-white/20 font-black text-xs uppercase tracking-widest">Left Eye</span>
            </div>
            <div className="w-1/2 h-full flex items-center justify-center">
              <span className="text-white/20 font-black text-xs uppercase tracking-widest">Right Eye</span>
            </div>
          </div>
        )}

        {/* Instructions & Spoken Transcript (Bottom Left) */}
        <div className="absolute bottom-3 left-3 z-20 pointer-events-none flex flex-col gap-1.5">
          <div className="bg-slate-900/80 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-xl text-[10px] font-bold text-white/80 flex items-center gap-2 shadow-lg">
            <Compass className="w-3.5 h-3.5 text-yellow animate-spin" />
            <span>Drag to Orbit 360° • Scroll to Zoom {gazeReticleEnabled && '• Gaze Pointer Active'}</span>
          </div>

          {audioFeedbackText && isSpeaking && (
            <div className="max-w-xs sm:max-w-md bg-slate-900/90 backdrop-blur-md border border-emerald-500/40 px-3 py-2 rounded-xl text-[11px] text-emerald-200 shadow-xl leading-relaxed">
              <div className="text-[9px] uppercase font-black tracking-wider text-emerald-400 mb-0.5 flex items-center gap-1">
                <Volume2 className="w-3 h-3" /> Voice Narration
              </div>
              <p className="line-clamp-3">{audioFeedbackText}</p>
            </div>
          )}
        </div>

        {/* ============================================================
            MODULE SPECIFIC OVERLAYS, FACT CARDS & MANIM CONTROLS
            ============================================================ */}

        {/* 1. SOLAR SYSTEM */}
        {activeModule === 'solar-system' && (
          <>
            <div className="absolute bottom-3 right-3 left-3 sm:left-auto z-20 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur border border-white/20 p-1.5 rounded-2xl overflow-x-auto max-w-full sm:max-w-xl">
              {PLANETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => handleSelectPlanet(p.name)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-1 ${
                    selectedPin === p.name
                      ? 'bg-yellow text-dark shadow-md scale-105'
                      : 'bg-white/10 hover:bg-white/20 text-white/80'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-dark"
                    style={{ backgroundColor: `#${p.color.toString(16).padStart(6, '0')}` }}
                  />
                  <span>{p.name}</span>
                </button>
              ))}
            </div>

            {selectedPin && showInfoCard && (
              <aside
                className={`absolute ${
                  lessonId ? 'top-24' : 'top-3'
                } right-3 z-20 w-72 sm:w-80 bg-slate-900/95 backdrop-blur-md border-2 border-white/20 rounded-2xl p-4 text-white shadow-2xl animate-in fade-in zoom-in-95`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full border border-white/40 shadow-sm"
                      style={{ backgroundColor: `#${activePlanetInfo.color.toString(16).padStart(6, '0')}` }}
                    />
                    <h3 className="font-black text-sm uppercase text-yellow">{activePlanetInfo.name}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => speakNarration(activePlanetInfo.speechText)}
                      className="h-6 px-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 flex items-center gap-1 text-[10px] font-black border border-emerald-500/30"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Listen</span>
                    </button>
                    <button
                      onClick={() => setSelectedPin(null)}
                      className="h-6 w-6 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs font-black"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <p className="text-xs text-white/80 font-medium leading-relaxed mb-3">
                  {activePlanetInfo.description}
                </p>

                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {activePlanetInfo.facts.map((f) => (
                    <div key={f.label} className="bg-white/10 p-2 rounded-xl">
                      <div className="text-[9px] uppercase tracking-wider font-bold text-white/50">{f.label}</div>
                      <div className="text-xs font-black text-white">{f.value}</div>
                    </div>
                  ))}
                </div>
              </aside>
            )}
          </>
        )}

        {/* 2. HUMAN HEART ANATOMY */}
        {activeModule === 'human-heart' && showInfoCard && (
          <aside className={`absolute ${lessonId ? 'top-24' : 'top-3'} right-3 z-20 w-72 sm:w-80 bg-slate-900/95 backdrop-blur-md border-2 border-white/20 rounded-2xl p-4 text-white shadow-2xl animate-in fade-in`}>
            <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500 animate-pulse" />
                <h3 className="font-black text-sm uppercase text-rose-400">Human Cardiac Anatomy</h3>
              </div>
              <button
                onClick={() => handleSelectHeartPart(selectedHeartPart)}
                className="h-6 px-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 flex items-center gap-1 text-[10px] font-black border border-emerald-500/30"
              >
                <Volume2 className="w-3 h-3" />
                <span>Listen</span>
              </button>
            </div>

            <p className="text-xs text-white/80 font-medium leading-relaxed mb-3">
              The human heart pumps 5 liters of blood every minute, delivering oxygen and vital nutrients to every cell in the body.
            </p>

            <div className="space-y-1.5 mb-3">
              <div className="text-[10px] font-black uppercase tracking-wider text-white/60">Anatomical Chambers:</div>
              {[
                { name: 'Left Ventricle', desc: 'Pumps oxygen-rich blood into aorta & body.' },
                { name: 'Aorta Arch', desc: 'Main thick arterial trunk branching to body.' },
                { name: 'Vena Cava', desc: 'Returns deoxygenated blue blood to heart.' },
                { name: 'Pulmonary Artery', desc: 'Transports blood to lungs for oxygen reload.' },
              ].map((part) => (
                <button
                  key={part.name}
                  onClick={() => handleSelectHeartPart(part.name)}
                  className={`w-full text-left p-2 rounded-xl border text-xs transition-all flex items-center justify-between ${
                    selectedHeartPart === part.name
                      ? 'bg-rose-500/20 border-rose-400 text-rose-300 font-black'
                      : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                  }`}
                >
                  <div>
                    <div className="font-black">{part.name}</div>
                    <div className="text-[10px] text-white/60 font-medium">{part.desc}</div>
                  </div>
                  <Volume2 className="w-3.5 h-3.5 opacity-60" />
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-white/10 text-xs font-black">
              <span>Cardiovascular Motion:</span>
              <span className="text-emerald-400 flex items-center gap-1 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> 72 BPM Systole
              </span>
            </div>
          </aside>
        )}

        {/* 3. 2D & 3D GEOMETRY STUDIO WITH LIVE ANIMATED 3D POINTERS */}
        {activeModule === 'geometry-volume' && showInfoCard && (() => {
          const activeGeo = GEOMETRY_SHAPES.find((g) => g.id === selectedShape) || GEOMETRY_SHAPES[12];
          const tabShapes = GEOMETRY_SHAPES.filter((g) => g.dimension === geoDimensionTab);
          return (
            <aside className={`absolute ${lessonId ? 'top-24' : 'top-3'} right-3 z-20 w-80 sm:w-[340px] max-h-[calc(100%-115px)] overflow-y-auto bg-slate-900/95 backdrop-blur-md border-2 border-white/20 rounded-2xl p-3.5 text-white shadow-2xl animate-in fade-in`}>
              <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Box className="w-4 h-4 text-yellow shrink-0" />
                  <h3 className="font-black text-xs uppercase text-yellow truncate">
                    2D &amp; 3D Geometry Studio
                  </h3>
                </div>
                <button
                  onClick={autoTeachGeometryParts}
                  className="h-6 px-2 rounded-lg bg-yellow hover:bg-yellow/90 text-dark flex items-center gap-1 text-[10px] font-black border border-dark shrink-0 cursor-pointer"
                  title="AI Teacher points to Vertices, Edges & Faces sequentially!"
                >
                  <GraduationCap className="w-3 h-3" />
                  <span>Auto-Point</span>
                </button>
              </div>

              {/* 2D Flat vs 3D Solid Switcher Tabs */}
              <div className="grid grid-cols-2 gap-1.5 mb-2.5">
                {(['2D', '3D'] as const).map((dim) => (
                  <button
                    key={dim}
                    onClick={() => {
                      setGeoDimensionTab(dim);
                      const first = GEOMETRY_SHAPES.find((g) => g.dimension === dim);
                      if (first && activeGeo.dimension !== dim) handleSelectShape(first.id);
                    }}
                    className={`py-1.5 rounded-xl text-[11px] font-black uppercase border transition-all cursor-pointer ${
                      geoDimensionTab === dim
                        ? 'bg-sky-500 text-dark border-sky-200 shadow-sm'
                        : 'bg-white/10 text-white/75 border-white/10 hover:bg-white/20'
                    }`}
                  >
                    {dim === '2D' ? '📐 2D Flat Shapes (12)' : '🧊 3D Solid Shapes (12)'}
                  </button>
                ))}
              </div>

              {/* Shape Grid (12 Flat 2D OR 12 Solid 3D) */}
              <div className="grid grid-cols-3 gap-1 mb-2.5">
                {tabShapes.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelectShape(s.id)}
                    className={`py-1.5 px-1 rounded-xl border text-[10px] font-black uppercase transition-all truncate cursor-pointer ${
                      selectedShape === s.id
                        ? 'bg-yellow text-dark border-dark shadow-sm'
                        : 'bg-white/10 border-white/10 text-white/75 hover:bg-white/20'
                    }`}
                  >
                    {s.shortLabel}
                  </button>
                ))}
              </div>

              {/* LIVE 3D POINTER BUTTONS (Show Students Vertices, Edges, Faces!) */}
              <div className="bg-indigo-950/75 border border-indigo-400/35 p-2 rounded-xl mb-2.5">
                <div className="text-[9px] font-black uppercase tracking-wider text-indigo-200 mb-1.5">
                  👆 Live 3D Teacher Pointer (Tap to Show &amp; Explain):
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={() => handlePointGeometryPart('vertices')}
                    className={`py-1.5 rounded-lg text-[10px] font-black border transition-all cursor-pointer ${
                      geoHighlightPart === 'vertices'
                        ? 'bg-yellow text-dark border-dark'
                        : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                    }`}
                  >
                    🟡 Vertices
                  </button>
                  <button
                    onClick={() => handlePointGeometryPart('edges')}
                    className={`py-1.5 rounded-lg text-[10px] font-black border transition-all cursor-pointer ${
                      geoHighlightPart === 'edges'
                        ? 'bg-cyan-400 text-dark border-dark'
                        : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                    }`}
                  >
                    📏 Edges
                  </button>
                  <button
                    onClick={() => handlePointGeometryPart('faces')}
                    className={`py-1.5 rounded-lg text-[10px] font-black border transition-all cursor-pointer ${
                      geoHighlightPart === 'faces'
                        ? 'bg-emerald-400 text-dark border-dark'
                        : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                    }`}
                  >
                    🟦 Faces
                  </button>
                </div>
              </div>

              {selectedShape === 'cube' && (
                <div className="bg-blue-950/70 border border-blue-500/30 p-2 rounded-xl mb-2.5">
                  <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                    <span className="flex items-center gap-1 text-blue-200">
                      <Sliders className="w-3 h-3 text-yellow" /> Unfold 3D Net:
                    </span>
                    <span className="font-mono text-yellow">{Math.round(netUnfoldAmount * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={netUnfoldAmount}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setNetUnfoldAmount(v);
                      broadcastVRState({ netUnfoldAmount: v });
                    }}
                    className="w-full accent-yellow cursor-pointer h-1.5 rounded-lg"
                  />
                </div>
              )}

              {/* Properties & Formulas Card */}
              <div className="space-y-1 bg-white/10 p-2.5 rounded-xl text-[11px]">
                <div className="font-black text-yellow uppercase text-xs mb-1">{activeGeo.label}</div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Vertices:</span>
                  <span className="font-black text-yellow">{activeGeo.vertices}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Edges / Sides:</span>
                  <span className="font-black text-cyan-300">{activeGeo.edges}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Faces:</span>
                  <span className="font-black text-emerald-300">{activeGeo.faces}</span>
                </div>
                <div className="pt-1.5 mt-1 border-t border-white/10 flex items-center justify-between">
                  <span className="text-white/60">{activeGeo.primaryFormulaLabel}:</span>
                  <span className="font-black text-white">{activeGeo.primaryFormula}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">{activeGeo.secondaryFormulaLabel}:</span>
                  <span className="font-black text-sky-300">{activeGeo.secondaryFormula}</span>
                </div>
              </div>
            </aside>
          );
        })()}

        {/* 4. EARTH LAYERS & GEOGRAPHY VOLCANOES */}
        {activeModule === 'earth-volcano' && showInfoCard && (
          <aside className={`absolute ${lessonId ? 'top-24' : 'top-3'} right-3 z-20 w-72 sm:w-84 bg-slate-900/95 backdrop-blur-md border-2 border-white/20 rounded-2xl p-4 text-white shadow-2xl animate-in fade-in`}>
            <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500 animate-bounce" />
                <h3 className="font-black text-sm uppercase text-amber-400">Earth Layers & Volcano</h3>
              </div>
              <button
                onClick={() => handleSelectLayer(selectedLayer)}
                className="h-6 px-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 flex items-center gap-1 text-[10px] font-black border border-emerald-500/30"
              >
                <Volume2 className="w-3 h-3" />
                <span>Listen</span>
              </button>
            </div>

            <div className="bg-amber-950/70 border border-amber-500/30 p-2.5 rounded-xl mb-3">
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1 text-amber-200">
                  <Sliders className="w-3 h-3 text-yellow" /> Explode Layers:
                </span>
                <span className="font-mono text-yellow">{Math.round(explodeAmount * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={explodeAmount}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setExplodeAmount(v);
                  broadcastVRState({ explodeAmount: v });
                }}
                className="w-full accent-amber-400 cursor-pointer h-1.5 rounded-lg"
              />
            </div>

            <div className="space-y-1.5 mb-3">
              {[
                { layer: 'Crust', color: '#0284c7', depth: '0 - 70 km', desc: 'Solid rock surface where we live.' },
                { layer: 'Mantle', color: '#ea580c', depth: '70 - 2,890 km', desc: 'Convection molten rock magma.' },
                { layer: 'Outer Core', color: '#f59e0b', depth: '2,890 - 5,150 km', desc: 'Liquid iron creating magnetic shield.' },
                { layer: 'Inner Core', color: '#fef08a', depth: '5,150 - 6,370 km', desc: 'Solid iron core at 6,000°C hot!' },
              ].map((l) => (
                <button
                  key={l.layer}
                  onClick={() => handleSelectLayer(l.layer)}
                  className={`w-full p-2 rounded-xl border text-xs flex items-center justify-between transition-all ${
                    selectedLayer === l.layer
                      ? 'bg-white/20 border-yellow text-white font-black'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: l.color }} />
                    <div className="text-left">
                      <div className="font-black text-white">{l.layer}</div>
                      <div className="text-[10px] text-white/50">{l.desc}</div>
                    </div>
                  </div>
                  <Volume2 className="w-3.5 h-3.5 opacity-60 shrink-0" />
                </button>
              ))}
            </div>

            <button
              onClick={() => handleGenerateAi3D('Volcanoes, Eruptions and Earth Structure')}
              className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-dark font-black text-[11px] uppercase flex items-center justify-center gap-1.5 border-2 border-dark shadow-[2px_2px_0px_#060E1C] cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Full Geography &amp; Volcanoes VR</span>
            </button>
          </aside>
        )}

        {/* 5. DNA DOUBLE HELIX */}
        {activeModule === 'dna-helix' && showInfoCard && (
          <aside className={`absolute ${lessonId ? 'top-24' : 'top-3'} right-3 z-20 w-72 sm:w-80 bg-slate-900/95 backdrop-blur-md border-2 border-cyan-500/40 rounded-2xl p-4 text-white shadow-2xl animate-in fade-in`}>
            <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
              <div className="flex items-center gap-2">
                <Dna className="w-4 h-4 text-cyan-400" />
                <h3 className="font-black text-sm uppercase text-cyan-300">DNA Double Helix</h3>
              </div>
              <button
                onClick={() =>
                  speakNarration('DNA is the molecule of heredity. It consists of two twisted strands of alternating sugar and phosphate groups, connected by pairs of four chemical bases: Adenine, Thymine, Guanine, and Cytosine.')
                }
                className="h-6 px-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 flex items-center gap-1 text-[10px] font-black border border-emerald-500/30"
              >
                <Volume2 className="w-3 h-3" />
                <span>Listen</span>
              </button>
            </div>
            <p className="text-xs text-white/80 font-medium leading-relaxed mb-3">
              Deoxyribonucleic acid carries the genetic code for the development and functioning of all known living organisms.
            </p>
            <div className="space-y-1.5 text-xs">
              <div className="p-2 rounded-xl bg-white/10 flex items-center justify-between">
                <span className="font-bold text-yellow">Adenine (A) ⇄ Thymine (T)</span>
                <span className="text-[10px] text-white/60">2 Hydrogen Bonds</span>
              </div>
              <div className="p-2 rounded-xl bg-white/10 flex items-center justify-between">
                <span className="font-bold text-emerald-400">Guanine (G) ⇄ Cytosine (C)</span>
                <span className="text-[10px] text-white/60">3 Hydrogen Bonds</span>
              </div>
            </div>
          </aside>
        )}

        {/* 6. PLANT CELL ANATOMY */}
        {activeModule === 'plant-cell' && showInfoCard && (
          <aside className={`absolute ${lessonId ? 'top-24' : 'top-3'} right-3 z-20 w-72 sm:w-80 bg-slate-900/95 backdrop-blur-md border-2 border-emerald-500/40 rounded-2xl p-4 text-white shadow-2xl animate-in fade-in`}>
            <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h3 className="font-black text-sm uppercase text-emerald-300">Eukaryotic Plant Cell</h3>
              </div>
              <button
                onClick={() =>
                  speakNarration('Plant cells differ from animal cells: they have a rigid cellulose cell wall, green chloroplasts for photosynthesis, and a large central vacuole holding water.')
                }
                className="h-6 px-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 flex items-center gap-1 text-[10px] font-black border border-emerald-500/30"
              >
                <Volume2 className="w-3 h-3" />
                <span>Listen</span>
              </button>
            </div>
            <p className="text-xs text-white/80 font-medium leading-relaxed mb-3">
              Plant cells contain specialized organelles that turn sunlight into glucose sugar while maintaining cell rigidity.
            </p>
            <div className="space-y-1.5 text-xs">
              <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/30">
                <div className="font-black text-emerald-300">🌿 Chloroplasts</div>
                <div className="text-[10px] text-white/70">Produce food via photosynthesis using chlorophyll.</div>
              </div>
              <div className="p-2 rounded-xl bg-sky-950/60 border border-sky-500/30">
                <div className="font-black text-sky-300">💧 Central Vacuole</div>
                <div className="text-[10px] text-white/70">Maintains turgor pressure so plants stand upright.</div>
              </div>
              <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-500/30">
                <div className="font-black text-purple-300">🧬 Nucleus</div>
                <div className="text-[10px] text-white/70">Contains chromosomes and master genetic code.</div>
              </div>
            </div>
          </aside>
        )}

        {/* 7. BOHR ATOM */}
        {activeModule === 'bohr-atom' && showInfoCard && (
          <aside className={`absolute ${lessonId ? 'top-24' : 'top-3'} right-3 z-20 w-72 sm:w-80 bg-slate-900/95 backdrop-blur-md border-2 border-sky-500/40 rounded-2xl p-4 text-white shadow-2xl animate-in fade-in`}>
            <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
              <div className="flex items-center gap-2">
                <Atom className="w-4 h-4 text-sky-400" />
                <h3 className="font-black text-sm uppercase text-sky-300">Bohr Quantum Atom</h3>
              </div>
              <button
                onClick={() =>
                  speakNarration('In the Bohr model of the atom, electrons orbit the central nucleus in fixed circular energy levels. The nucleus contains positive protons and neutral neutrons.')
                }
                className="h-6 px-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 flex items-center gap-1 text-[10px] font-black border border-emerald-500/30"
              >
                <Volume2 className="w-3 h-3" />
                <span>Listen</span>
              </button>
            </div>
            <p className="text-xs text-white/80 font-medium leading-relaxed mb-3">
              Atoms are the basic building blocks of all chemical matter in the universe.
            </p>
            <div className="space-y-1.5 text-xs">
              <div className="p-2 rounded-xl bg-white/10 flex items-center justify-between">
                <span className="font-bold text-rose-400">Protons (+ charge)</span>
                <span className="text-[10px] text-white/60">Inside Nucleus</span>
              </div>
              <div className="p-2 rounded-xl bg-white/10 flex items-center justify-between">
                <span className="font-bold text-yellow">Neutrons (0 charge)</span>
                <span className="text-[10px] text-white/60">Inside Nucleus</span>
              </div>
              <div className="p-2 rounded-xl bg-white/10 flex items-center justify-between">
                <span className="font-bold text-sky-400">Electrons (- charge)</span>
                <span className="text-[10px] text-white/60">Orbiting Shells</span>
              </div>
            </div>
          </aside>
        )}

        {/* 8. ANCIENT PYRAMID */}
        {activeModule === 'ancient-pyramid' && showInfoCard && (
          <aside className={`absolute ${lessonId ? 'top-24' : 'top-3'} right-3 z-20 w-72 sm:w-80 bg-slate-900/95 backdrop-blur-md border-2 border-amber-500/40 rounded-2xl p-4 text-white shadow-2xl animate-in fade-in`}>
            <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <h3 className="font-black text-sm uppercase text-amber-300">Great Pyramid of Giza</h3>
              </div>
              <button
                onClick={() =>
                  speakNarration('The Great Pyramid of Giza is the oldest of the Seven Wonders of the Ancient World. Built with over 2.3 million giant limestone blocks, it served as a monumental royal tomb.')
                }
                className="h-6 px-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 flex items-center gap-1 text-[10px] font-black border border-emerald-500/30"
              >
                <Volume2 className="w-3 h-3" />
                <span>Listen</span>
              </button>
            </div>
            <p className="text-xs text-white/80 font-medium leading-relaxed mb-3">
              One of the greatest architectural and mathematical feats in human history, dating back over 4,500 years.
            </p>
            <div className="space-y-1.5 text-xs">
              <div className="p-2 rounded-xl bg-white/10 flex items-center justify-between">
                <span className="font-bold text-white">Original Height:</span>
                <span className="text-[10px] text-amber-300 font-mono">146.6 meters</span>
              </div>
              <div className="p-2 rounded-xl bg-white/10 flex items-center justify-between">
                <span className="font-bold text-white">Estimated Blocks:</span>
                <span className="text-[10px] text-amber-300 font-mono">2.3 Million Stones</span>
              </div>
              <div className="p-2 rounded-xl bg-white/10 flex items-center justify-between">
                <span className="font-bold text-white">Astronomical Alignment:</span>
                <span className="text-[10px] text-amber-300 font-mono">True North within 0.05°</span>
              </div>
            </div>
          </aside>
        )}

        {/* 9. INTERACTIVE AI VR TEACHER CLASSROOM BOARD (Left-docked so it NEVER overlaps top-right PiP video!) */}
        {activeModule === 'ai-custom' && showInfoCard && (() => {
          const stations = aiBlueprint?.stations || [];
          const safeIdx = stations.length > 0 ? Math.min(activeStationIdx, stations.length - 1) : 0;
          const activeSt = stations[safeIdx];
          const chosenQuizIdx = quizAnswers[safeIdx];

          const renderHighlightedSentence = (sentence: string) =>
            sentence.split(/(\b[A-Z]{2,}[A-Z'’-]*\b)/g).map((chunk, ci) =>
              /^[A-Z]{2,}[A-Z'’-]*$/.test(chunk) ? (
                <span
                  key={ci}
                  className="px-1.5 py-0.5 mx-0.5 rounded-md bg-yellow text-dark font-black"
                >
                  {chunk}
                </span>
              ) : (
                <React.Fragment key={ci}>{chunk}</React.Fragment>
              )
            );

          return (
            <aside
              className={`absolute top-3 left-3 bottom-16 z-20 flex flex-col bg-[#081022]/95 backdrop-blur-xl border-[2.5px] border-yellow/70 rounded-2xl text-white shadow-[0_14px_40px_rgba(0,0,0,0.65)] overflow-hidden animate-in fade-in transition-all duration-300 ${
                aiBoardView === 'wide'
                  ? 'w-[calc(100%-24px)] max-w-3xl'
                  : 'w-[calc(100%-24px)] sm:w-[400px] lg:w-[430px]'
              }`}
            >
              {/* Teacher Header Bar */}
              <div className="px-3.5 py-2.5 bg-gradient-to-r from-indigo-950 via-[#0f1c3a] to-slate-900 border-b border-white/15 shrink-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl bg-yellow text-dark border-2 border-dark flex items-center justify-center text-lg shrink-0 shadow-[2px_2px_0px_#060E1C] ${
                        isSpeaking ? 'animate-bounce' : ''
                      }`}
                      title="Edvoura AI VR Master Teacher"
                    >
                      👩‍🏫
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="text-[9px] uppercase font-black tracking-wider px-1.5 py-0.5 rounded bg-yellow/20 text-yellow border border-yellow/30">
                          AI VR Teacher
                        </span>
                        <label
                          className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/35 text-sky-200 border border-sky-400/40 cursor-pointer shadow-sm transition-all"
                          title="Click to switch student grade or class"
                        >
                          <span>🎓</span>
                          <select
                            value={aiBlueprint?.gradeLevel || aiGradeLevel}
                            onChange={(e) => {
                              const nextGrade = e.target.value;
                              setAiGradeLevel(nextGrade);
                              if (aiBlueprint) {
                                setAiBlueprint({ ...aiBlueprint, gradeLevel: nextGrade });
                              }
                            }}
                            className="bg-transparent text-sky-200 font-black text-[9px] focus:outline-none cursor-pointer"
                          >
                            <option value="Nursery / KG (Ages 3–5)" className="bg-slate-900 text-white">Nursery / KG</option>
                            <option value="Grade 1–3 (Lower Primary)" className="bg-slate-900 text-white">Grade 1–3</option>
                            <option value="Grade 4–6 (Upper Primary)" className="bg-slate-900 text-white">Grade 4–6</option>
                            <option value="JSS 1–3 (Grade 7–9)" className="bg-slate-900 text-white">JSS 1–3</option>
                            <option value="SSS 1–3 (Grade 10–12)" className="bg-slate-900 text-white">SSS 1–3</option>
                            <option value="Primary 1 / Grade 1" className="bg-slate-900 text-white">Primary 1</option>
                            <option value="Primary 2 / Grade 2" className="bg-slate-900 text-white">Primary 2</option>
                            <option value="Primary 3 / Grade 3" className="bg-slate-900 text-white">Primary 3</option>
                            <option value="Primary 4 / Grade 4" className="bg-slate-900 text-white">Primary 4</option>
                            <option value="Primary 5 / Grade 5" className="bg-slate-900 text-white">Primary 5</option>
                            <option value="Primary 6 / Grade 6" className="bg-slate-900 text-white">Primary 6</option>
                            <option value="JSS 1 (Grade 7)" className="bg-slate-900 text-white">JSS 1</option>
                            <option value="JSS 2 (Grade 8)" className="bg-slate-900 text-white">JSS 2</option>
                            <option value="JSS 3 (Grade 9)" className="bg-slate-900 text-white">JSS 3</option>
                            <option value="SSS 1 (Grade 10)" className="bg-slate-900 text-white">SSS 1</option>
                            <option value="SSS 2 (Grade 11)" className="bg-slate-900 text-white">SSS 2</option>
                            <option value="SSS 3 (Grade 12)" className="bg-slate-900 text-white">SSS 3</option>
                          </select>
                        </label>
                      </div>
                      <h3 className="font-black text-sm text-white truncate mt-0.5">
                        {aiBlueprint?.title || customAiModelTitle || 'Interactive VR Lesson'}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setAiBoardView((v) => (v === 'sidebar' ? 'wide' : 'sidebar'))}
                      className="h-7 px-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/85 text-[10px] font-black border border-white/15 cursor-pointer"
                      title={aiBoardView === 'sidebar' ? 'Expand Teacher Board' : 'Compact Sidebar View'}
                    >
                      {aiBoardView === 'sidebar' ? 'Expand' : 'Compact'}
                    </button>
                  </div>
                </div>

                {/* Teacher Action Row: Full Explanation Video Tour + Read Full Card */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                  {stations.length > 0 && (
                    <button
                      onClick={() => (isTeacherTourActive ? stopNarration() : startTeacherTour(0))}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-black transition-all cursor-pointer border ${
                        isTeacherTourActive
                          ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-300 animate-pulse'
                          : 'bg-yellow hover:bg-yellow/90 text-dark border-dark shadow-[2px_2px_0px_#060E1C]'
                      }`}
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>{isTeacherTourActive ? 'Stop Video Lesson' : 'Play Full VR Lesson'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (isSpeaking) {
                        stopNarration();
                      } else if (activeSt) {
                        stopTeacherTour();
                        const segs = buildStationFullSegments(activeSt, safeIdx);
                        runSpeechQueue(segs);
                      } else {
                        speakNarration(
                          aiBlueprint?.teacherIntro ||
                            aiBlueprint?.narration ||
                            customAiDescription ||
                            'Interactive 3D Lesson'
                        );
                      }
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-black border border-emerald-400/40 cursor-pointer"
                    title="Read every definition, type, worked example, and activity on this card aloud"
                  >
                    {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isSpeaking ? 'Stop Voice' : 'Read Full Card'}</span>
                  </button>

                  {stations.length > 0 && (
                    <span className="ml-auto text-[10px] font-black text-white/70 bg-white/10 px-2 py-1 rounded-lg">
                      Step {safeIdx + 1} / {stations.length}
                    </span>
                  )}
                </div>

                {/* Live Speaking Phase Progress Indicator */}
                {activeTeachPhase !== 'idle' && (
                  <div className="mt-2 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-400/35 flex items-center justify-between text-[10px] font-black text-emerald-200">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>
                        Now Teaching:{' '}
                        {activeTeachPhase === 'definition'
                          ? '📖 Definition & Key Formula'
                          : activeTeachPhase === 'visuals'
                            ? '🖼️ Visual Picture Examples'
                            : activeTeachPhase === 'types'
                              ? '🏷️ Types & Categories'
                              : activeTeachPhase === 'worked'
                                ? '🧮 Step-by-Step Worked Example'
                                : activeTeachPhase === 'examples'
                                  ? '💬 Real-World Examples'
                                  : '🎯 Interactive Activity — Your Turn!'}
                      </span>
                    </span>
                  </div>
                )}

                {/* Clickable Station Stepper Pills */}
                {stations.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar pb-0.5">
                    {stations.map((st, idx) => (
                      <button
                        key={`${st.title}-${idx}`}
                        onClick={() => {
                          stopTeacherTour();
                          playSynthesizedSound('space');
                          focusAIStation(idx, { speak: true, fullCard: true, broadcast: true });
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide transition-all shrink-0 border cursor-pointer ${
                          safeIdx === idx
                            ? 'bg-white text-dark border-yellow shadow-[2px_2px_0px_#facc15]'
                            : 'bg-white/10 hover:bg-white/20 text-white/80 border-white/10'
                        }`}
                      >
                        {idx + 1}. {st.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Scrollable Rich Teacher Lesson Body (Definition, Formula, Pictures, Types, Worked Example, Examples, Interactive Activity!) */}
              <div ref={teacherBodyRef} className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-3.5">
                {activeSt ? (
                  <>
                    {/* 0. REAL VERIFIED PHOTOGRAPH BANNER (Presidents, Dinosaurs, Volcanoes, Landmarks!) */}
                    {activeSt.imageUrl && (
                      <div className="relative rounded-xl overflow-hidden border-2 border-yellow/50 bg-slate-950 shadow-lg">
                        <img
                          src={activeSt.imageUrl}
                          alt={activeSt.title}
                          className="w-full h-44 object-cover object-top"
                          loading="lazy"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent px-3 py-2 flex items-end justify-between gap-2">
                          <span className="text-xs font-black text-white drop-shadow truncate">
                            📸 {activeSt.title}
                          </span>
                          {activeSt.timelineYear && (
                            <span className="px-2 py-0.5 rounded-full bg-yellow text-dark text-[9px] font-black uppercase shrink-0">
                              {activeSt.timelineYear}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 1. Active Station Title + Full Definition + Key Formula/Rule */}
                    <div
                      id="vr-sec-definition"
                      className={`p-3 rounded-xl border-l-4 border transition-all ${
                        activeTeachPhase === 'definition'
                          ? 'bg-yellow/15 border-yellow ring-2 ring-yellow/60'
                          : 'bg-white/5 border-white/10'
                      }`}
                      style={{ borderLeftColor: activeSt.color || '#facc15' }}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="font-black text-base uppercase tracking-tight text-yellow">
                          {safeIdx + 1}. {activeSt.title}
                        </h4>
                        <button
                          onClick={() => {
                            stopTeacherTour();
                            speakNarration(
                              `${activeSt.title}. ${activeSt.definition || activeSt.subtitle}. ${
                                activeSt.formulaOrRule ? `Key rule: ${activeSt.formulaOrRule}` : ''
                              }`
                            );
                          }}
                          className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-emerald-300 flex items-center gap-1 cursor-pointer"
                          title="Read Definition aloud"
                        >
                          <Volume2 className="w-2.5 h-2.5" /> Read
                        </button>
                      </div>
                      <p className="text-xs sm:text-[13px] text-white/95 font-semibold leading-relaxed">
                        {activeSt.definition || activeSt.subtitle}
                      </p>
                      {activeSt.formulaOrRule && (
                        <div className="mt-2.5 px-3 py-2 rounded-xl bg-yellow/15 border border-yellow/50 text-xs font-black text-yellow tracking-tight">
                          🔑 {activeSt.formulaOrRule}
                        </div>
                      )}
                    </div>

                    {/* 2. DIFFERENT VISUAL PICTURE CARDS FOR EVERY STATION */}
                    {Array.isArray(activeSt.visuals) && activeSt.visuals.length > 0 && (
                      <div
                        id="vr-sec-visuals"
                        className={`p-2 rounded-xl transition-all ${
                          activeTeachPhase === 'visuals' ? 'bg-sky-500/15 ring-2 ring-sky-400/70' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-sky-300">
                            🖼️ Picture Examples (Tap any image to hear)
                          </span>
                        </div>
                        <div
                          className={`grid gap-2 ${
                            aiBoardView === 'wide' ? 'grid-cols-4' : 'grid-cols-2'
                          }`}
                        >
                          {activeSt.visuals.map((v, vi) => (
                            <button
                              key={`${v.label}-${vi}`}
                              onClick={() => {
                                playSynthesizedSound('chime');
                                speakNarration(
                                  `${v.label}${v.category ? `, ${v.category}` : ''} — an example of ${activeSt.title}!`
                                );
                              }}
                              className="group p-2.5 rounded-xl bg-white/5 hover:bg-white/15 border-2 transition-all flex flex-col items-center text-center cursor-pointer active:scale-95"
                              style={{ borderColor: v.bgColor || activeSt.color || '#38bdf8' }}
                            >
                              <div
                                className="w-12 h-12 rounded-2xl flex items-center justify-center text-3xl mb-1.5 shadow-inner group-hover:scale-110 transition-transform"
                                style={{
                                  backgroundColor: `${v.bgColor || activeSt.color || '#38bdf8'}33`,
                                }}
                              >
                                {v.icon}
                              </div>
                              <span className="text-xs font-black text-white leading-tight">
                                {v.label}
                              </span>
                              {v.category && (
                                <span className="text-[9px] font-extrabold uppercase tracking-wider text-yellow/90 mt-0.5">
                                  {v.category}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 3. TYPES / KINDS BREAKDOWN */}
                    {Array.isArray(activeSt.types) && activeSt.types.length > 0 && (
                      <div
                        id="vr-sec-types"
                        className={`space-y-1.5 p-2 rounded-xl transition-all ${
                          activeTeachPhase === 'types' ? 'bg-emerald-500/15 ring-2 ring-emerald-400/70' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
                            🏷️ Types &amp; Kinds of {activeSt.title}
                          </span>
                          <button
                            onClick={() => {
                              stopTeacherTour();
                              const txt = activeSt.types!.map((t) => `${t.name}: ${t.detail}`).join('. ');
                              speakNarration(`Types of ${activeSt.title}. ${txt}`);
                            }}
                            className="text-[9px] font-black text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer"
                          >
                            <Volume2 className="w-2.5 h-2.5" /> Read Types
                          </button>
                        </div>
                        <div className="space-y-1.5">
                          {activeSt.types.map((tp, ti) => (
                            <div
                              key={`${tp.name}-${ti}`}
                              className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-400/25"
                            >
                              <div className="text-xs font-black text-emerald-300">{tp.name}</div>
                              <div className="text-[11px] text-white/85 font-medium leading-snug mt-0.5">
                                {tp.detail}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 4. LIVE STEP-BY-STEP WORKED EXAMPLE CHALKBOARD (Explanation-Video Style!) */}
                    {activeSt.workedExample && Array.isArray(activeSt.workedExample.steps) && (
                      <div
                        id="vr-sec-worked"
                        className={`p-3 rounded-xl bg-gradient-to-br from-emerald-950/90 to-slate-900 border-2 space-y-2 transition-all ${
                          activeTeachPhase === 'worked'
                            ? 'border-yellow ring-2 ring-yellow/60'
                            : 'border-emerald-500/45'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-yellow">
                            🧮 Step-by-Step Worked Example
                          </span>
                          <button
                            onClick={() => {
                              stopTeacherTour();
                              playWorkedExampleAloud(activeSt);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-yellow hover:bg-yellow/90 text-dark font-black text-[10px] flex items-center gap-1 cursor-pointer shadow-sm"
                          >
                            <Play className="w-2.5 h-2.5" /> Work Step-by-Step
                          </button>
                        </div>
                        <div className="p-2.5 rounded-lg bg-black/35 border border-white/10 text-xs font-bold text-white leading-relaxed">
                          <span className="text-sky-300 font-black uppercase text-[10px] block mb-0.5">
                            Classroom Problem:
                          </span>
                          {activeSt.workedExample.problem}
                        </div>
                        <div className="space-y-1.5">
                          {activeSt.workedExample.steps.map((step, si) => {
                            const visible = revealedWorkedStep >= si + 1;
                            const isCurrentStep =
                              activeTeachPhase === 'worked' && revealedWorkedStep === si + 1;
                            if (!visible) return null;
                            return (
                              <div
                                key={`${step.label}-${si}`}
                                className={`p-2 rounded-lg border transition-all animate-in fade-in ${
                                  isCurrentStep
                                    ? 'bg-yellow/20 border-yellow text-white'
                                    : 'bg-white/5 border-white/15 text-white/90'
                                }`}
                              >
                                <div className="text-[10px] font-black uppercase text-emerald-300">
                                  {step.label}
                                </div>
                                <div className="text-xs font-mono font-black text-yellow mt-0.5">
                                  {step.work}
                                </div>
                                <div className="text-[11px] text-white/80 font-medium mt-0.5 leading-snug">
                                  {step.speak}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {revealedWorkedStep >= activeSt.workedExample.steps.length + 1 && (
                          <div className="p-2.5 rounded-xl bg-emerald-500/20 border-2 border-emerald-400 text-xs font-black text-emerald-200 flex items-center gap-2 animate-in fade-in">
                            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                            <span>Final Answer: {activeSt.workedExample.finalAnswer}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 5. REAL EXAMPLE SENTENCES */}
                    {((Array.isArray(activeSt.examples) && activeSt.examples.length > 0) ||
                      activeSt.example) && (
                      <div
                        id="vr-sec-examples"
                        className={`space-y-1.5 p-2 rounded-xl transition-all ${
                          activeTeachPhase === 'examples' ? 'bg-amber-500/15 ring-2 ring-amber-400/70' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                            💬 Real-World Examples
                          </span>
                          <button
                            onClick={() => {
                              stopTeacherTour();
                              const list =
                                Array.isArray(activeSt.examples) && activeSt.examples.length > 0
                                  ? activeSt.examples
                                  : [activeSt.example || ''];
                              speakNarration(`Here are examples for ${activeSt.title}: ${list.join('. ')}`);
                            }}
                            className="text-[9px] font-black text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer"
                          >
                            <Volume2 className="w-2.5 h-2.5" /> Read
                          </button>
                        </div>
                        <div className="space-y-1.5">
                          {(Array.isArray(activeSt.examples) && activeSt.examples.length > 0
                            ? activeSt.examples
                            : [activeSt.example || '']
                          )
                            .filter(Boolean)
                            .map((ex, ei) => (
                              <div
                                key={ei}
                                className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-xs text-white/95 font-semibold leading-relaxed"
                              >
                                {renderHighlightedSentence(ex)}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* 6. INTERACTIVE ACTIVITY (Reads Question & Options Aloud + Hint + Live Work It Out!) */}
                    {activeSt.quiz && Array.isArray(activeSt.quiz.options) && (
                      <div
                        id="vr-sec-quiz"
                        className={`p-3 rounded-xl bg-purple-950/70 border-2 space-y-2 transition-all ${
                          activeTeachPhase === 'quiz'
                            ? 'border-yellow ring-2 ring-yellow/70'
                            : 'border-purple-400/45'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-purple-200">
                            <HelpCircle className="w-3.5 h-3.5 text-yellow" />
                            <span>Interactive Activity — Try It!</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                stopTeacherTour();
                                const optRead = activeSt.quiz!.options
                                  .map((o, i) => `Option ${String.fromCharCode(65 + i)}: ${o}`)
                                  .join('. ');
                                speakNarration(`${activeSt.quiz!.question} ${optRead}`);
                              }}
                              className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-sky-200 text-[9px] font-black flex items-center gap-1 cursor-pointer"
                              title="Read activity question and options aloud"
                            >
                              <Volume2 className="w-2.5 h-2.5" /> Read
                            </button>
                            {activeSt.quiz.hint && (
                              <button
                                onClick={() => {
                                  setShowQuizHint((prev) => ({ ...prev, [safeIdx]: true }));
                                  speakNarration(`Here is a teacher hint: ${activeSt.quiz!.hint}`);
                                }}
                                className="px-2 py-0.5 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[9px] font-black cursor-pointer"
                              >
                                💡 Hint
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setShowQuizWork((prev) => ({ ...prev, [safeIdx]: true }));
                                setQuizAnswers((prev) => ({
                                  ...prev,
                                  [safeIdx]: activeSt.quiz!.correctIndex,
                                }));
                                playSynthesizedSound('chime');
                                const sol =
                                  activeSt.quiz!.workedSolution ||
                                  activeSt.quiz!.explanation ||
                                  `The correct answer is ${activeSt.quiz!.options[activeSt.quiz!.correctIndex]}!`;
                                speakNarration(`Let us work this activity out together! ${sol}`);
                              }}
                              className="px-2 py-0.5 rounded-md bg-yellow hover:bg-yellow/90 text-dark text-[9px] font-black cursor-pointer"
                              title="Watch & hear the VR Teacher work out the answer step by step"
                            >
                              🧮 Work It Out
                            </button>
                          </div>
                        </div>

                        <p className="text-xs font-bold text-white leading-snug">
                          {activeSt.quiz.question}
                        </p>

                        {showQuizHint[safeIdx] && activeSt.quiz.hint && (
                          <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-400/40 text-[11px] font-bold text-amber-200">
                            💡 Hint: {activeSt.quiz.hint}
                          </div>
                        )}

                        <div className="grid grid-cols-1 gap-1.5">
                          {activeSt.quiz.options.map((opt, oi) => {
                            const isPicked = chosenQuizIdx === oi;
                            const isCorrect = oi === activeSt.quiz!.correctIndex;
                            const answered = typeof chosenQuizIdx === 'number';
                            return (
                              <button
                                key={`${opt}-${oi}`}
                                onClick={() => {
                                  setQuizAnswers((prev) => ({ ...prev, [safeIdx]: oi }));
                                  if (isCorrect) {
                                    setShowQuizWork((prev) => ({ ...prev, [safeIdx]: true }));
                                    playSynthesizedSound('chime');
                                    speakNarration(
                                      activeSt.quiz?.workedSolution ||
                                        activeSt.quiz?.explanation ||
                                        `Correct! ${opt} is the right answer!`
                                    );
                                  } else {
                                    playSynthesizedSound('laser');
                                    speakNarration(
                                      activeSt.quiz?.hint
                                        ? `Not quite! Here is a hint: ${activeSt.quiz.hint}`
                                        : 'Almost! Check the worked example above and try another option, or click Work It Out!'
                                    );
                                  }
                                }}
                                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-black border transition-all flex items-center justify-between cursor-pointer ${
                                  isPicked
                                    ? isCorrect
                                      ? 'bg-emerald-500 text-dark border-emerald-200'
                                      : 'bg-rose-600/80 text-white border-rose-300'
                                    : answered && isCorrect
                                      ? 'bg-emerald-500/25 text-emerald-200 border-emerald-400/50'
                                      : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                                }`}
                              >
                                <span>
                                  {String.fromCharCode(65 + oi)}. {opt}
                                </span>
                                {isPicked && isCorrect && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>

                        {(typeof chosenQuizIdx === 'number' || showQuizWork[safeIdx]) && (
                          <div
                            className={`text-[11px] font-bold p-2.5 rounded-lg space-y-1 ${
                              chosenQuizIdx === activeSt.quiz.correctIndex
                                ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40'
                                : 'bg-rose-500/20 text-rose-200 border border-rose-400/30'
                            }`}
                          >
                            <div>
                              {chosenQuizIdx === activeSt.quiz.correctIndex
                                ? `🎉 ${activeSt.quiz.explanation || 'Excellent work!'}`
                                : '💡 Not quite — try another choice or tap "Work It Out" above!'}
                            </div>
                            {showQuizWork[safeIdx] && activeSt.quiz.workedSolution && (
                              <div className="pt-1 border-t border-white/15 text-yellow font-semibold">
                                🧮 Working: {activeSt.quiz.workedSolution}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-xs text-white/90 font-medium leading-relaxed">
                      {aiBlueprint?.description ||
                        customAiDescription ||
                        'Drag to rotate 360°, scroll to zoom, or activate Slice Plane to inspect inside.'}
                    </p>
                    {aiBlueprint?.facts && aiBlueprint.facts.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {aiBlueprint.facts.map((f, idx) => (
                          <div key={`${f.label}-${idx}`} className="bg-white/10 p-2.5 rounded-xl">
                            <div className="text-[9px] uppercase tracking-wider font-bold text-white/60">
                              {f.label}
                            </div>
                            <div className="text-xs font-black text-white mt-0.5">{f.value}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Sticky Bottom Teacher Navigation Controls */}
              <div className="px-3 py-2.5 bg-[#060e1c] border-t border-white/15 flex items-center justify-between gap-2 shrink-0">
                {stations.length > 1 ? (
                  <>
                    <button
                      onClick={() => {
                        stopTeacherTour();
                        playSynthesizedSound('space');
                        focusAIStation(safeIdx - 1, { speak: true, broadcast: true });
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-black flex items-center gap-1 border border-white/15 cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Prev</span>
                    </button>

                    <button
                      onClick={() => setAiPromptOpen(true)}
                      className="px-2.5 py-1.5 rounded-xl bg-purple-600/80 hover:bg-purple-500 text-white text-[11px] font-black flex items-center gap-1 cursor-pointer"
                    >
                      <WandSparkles className="w-3 h-3" />
                      <span>New Topic</span>
                    </button>

                    <button
                      onClick={() => {
                        stopTeacherTour();
                        playSynthesizedSound('space');
                        focusAIStation(safeIdx + 1, { speak: true, broadcast: true });
                      }}
                      className="px-3 py-1.5 rounded-xl bg-yellow hover:bg-yellow/90 text-dark text-xs font-black flex items-center gap-1 border-2 border-dark shadow-[2px_2px_0px_#060E1C] cursor-pointer"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setAiPromptOpen(true)}
                    className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black uppercase flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <WandSparkles className="w-3.5 h-3.5" />
                    <span>Generate Any 3D Lesson Topic</span>
                  </button>
                )}
              </div>
            </aside>
          );
        })()}
      </div>
    </div>
  );
}
