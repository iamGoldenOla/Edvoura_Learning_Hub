'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
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
  ChevronRight,
  Plus,
} from 'lucide-react';

export type VRModuleId =
  | 'solar-system'
  | 'human-heart'
  | 'geometry-volume'
  | 'earth-volcano'
  | 'dna-helix'
  | 'plant-cell'
  | 'bohr-atom'
  | 'ancient-pyramid';

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Simulation State
  const [activeModule, setActiveModule] = useState<VRModuleId>(initialModule);
  const [displayMode, setDisplayMode] = useState<VRDisplayMode>('desktop');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const [selectedPin, setSelectedPin] = useState<string | null>('Earth');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [gyroActive, setGyroActive] = useState<boolean>(false);

  // Kainmueller-Lab/vr-viewer: Slicing Plane Feature
  const [sliceHeight, setSliceHeight] = useState<number>(1.0); // 1 = fully intact, 0 = sliced halfway, -1 = full cut
  const [isSlicingActive, setIsSlicingActive] = useState<boolean>(false);

  // aframevr: Gaze Reticle Cursor for Headset/Cardboard
  const [gazeReticleEnabled, setGazeReticleEnabled] = useState<boolean>(false);
  const [gazeProgress, setGazeProgress] = useState<number>(0); // 0 to 100%
  const gazeTargetRef = useRef<string | null>(null);
  const gazeTimerRef = useRef<number>(0);

  // oculus-samples: Native WebXR Session State
  const [webXRSupported, setWebXRSupported] = useState<boolean>(false);
  const [isWebXRPresenting, setIsWebXRPresenting] = useState<boolean>(false);

  // ruslanmv/GenAI-3D: Generative AI 3D Prompting
  const [aiPromptOpen, setAiPromptOpen] = useState<boolean>(false);
  const [aiPromptText, setAiPromptText] = useState<string>('');
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [customAiModelTitle, setCustomAiModelTitle] = useState<string>('');

  // Manim Motion Controls
  const [netUnfoldAmount, setNetUnfoldAmount] = useState<number>(0); // 0 = 3D folded, 1 = 2D flat net
  const [explodeAmount, setExplodeAmount] = useState<number>(0); // 0 = intact, 1 = exploded layers

  // Module Specific Sub-selections
  const [selectedHeartPart, setSelectedHeartPart] = useState<string>('Left Ventricle');
  const [selectedShape, setSelectedShape] = useState<'cube' | 'cylinder' | 'pyramid' | 'sphere'>('cube');
  const [selectedLayer, setSelectedLayer] = useState<string>('Inner Core');
  const [selectedCellOrganelle, setSelectedCellOrganelle] = useState<string>('Chloroplast');

  // Voice Narration & Audio
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [autoNarrate, setAutoNarrate] = useState<boolean>(true);
  const [speechSpeed, setSpeechSpeed] = useState<number>(1.0);
  const [audioFeedbackText, setAudioFeedbackText] = useState<string>('');
  const audioContextRef = useRef<any>(null);

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
    };
    orbitMeshes: any[];
    heartMesh: any;
    bloodParticles: any;
    geometryMesh: any;
    shapeFaces: any[];
    earthLayers: any[];
    lavaParticles: any;
    vaultMesh: any;
    raycaster: any;
    clock: any;
  } | null>(null);

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

  // Web Speech Synthesis
  const speakNarration = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;

      window.speechSynthesis.cancel();
      setAudioFeedbackText(text);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speechSpeed;
      utterance.pitch = 1.08;

      const voices = window.speechSynthesis.getVoices();
      const naturalVoice = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (/natural|google|samantha|libby|karen|female|victoria/i.test(v.name) || v.localService)
      ) || voices.find((v) => v.lang.startsWith('en'));

      if (naturalVoice) utterance.voice = naturalVoice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [speechSpeed]
  );

  const stopNarration = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Launch Native WebXR Session (oculus-samples)
  const launchNativeWebXR = async () => {
    const state = threeStateRef.current;
    if (!state || !navigator || !(navigator as any).xr) {
      alert('WebXR is not supported on this browser/device. Try Meta Quest Browser, Apple Vision Pro, or Chrome with WebXR extension.');
      return;
    }

    try {
      const session = await (navigator as any).xr.requestSession('immersive-vr', {
        optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking'],
      });

      state.renderer.xr.enabled = true;
      await state.renderer.xr.setSession(session);
      setIsWebXRPresenting(true);
      playSynthesizedSound('laser');

      session.addEventListener('end', () => {
        setIsWebXRPresenting(false);
        state.renderer.xr.enabled = false;
      });
    } catch (err) {
      console.warn('WebXR session launch failed:', err);
      alert('Could not start WebXR session: ' + (err as any)?.message);
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
      document.body.appendChild(script);
    };

    const initThreeEngine = () => {
      const THREE = (window as any).THREE;
      if (!THREE || !canvasRef.current || !containerRef.current) return;

      const container = containerRef.current;
      const width = container.clientWidth || 800;
      const height = container.clientHeight || 500;

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
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Kainmueller-Lab/vr-viewer: Enable local slicing clipping planes
      renderer.localClippingEnabled = true;
      const clippingPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 10);

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
      scene.add(ambientLight);

      const sunLight = new THREE.PointLight(0xffffff, 2.2, 120);
      sunLight.position.set(0, 0, 0);
      scene.add(sunLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
      dirLight.position.set(20, 30, 20);
      scene.add(dirLight);

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
          rotX: 0.3,
          rotY: 0,
          zoom: 38,
        },
        orbitMeshes: [],
        heartMesh: null,
        bloodParticles: null,
        geometryMesh: null,
        shapeFaces: [],
        earthLayers: [],
        lavaParticles: null,
        vaultMesh: null,
        raycaster: new THREE.Raycaster(),
        clock: new THREE.Clock(),
      };

      buildActiveScene();
      startAnimationLoop();
    };

    loadThreeScript();

    return () => {
      isCancelled = true;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
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

    // 1. SOLAR SYSTEM MODULE
    if (activeModule === 'solar-system') {
      camera.position.set(0, 22, 42);
      camera.lookAt(0, 0, 0);

      PLANETS.forEach((p) => {
        const geo = new THREE.SphereGeometry(p.size, 32, 32);
        let mat;
        if (p.name === 'Sun') {
          mat = new THREE.MeshBasicMaterial({ color: p.color });
        } else {
          mat = new THREE.MeshStandardMaterial({
            color: p.color,
            roughness: 0.45,
            metalness: 0.15,
            clippingPlanes: [clippingPlane],
            clipShadows: true,
          });
        }

        const mesh = new THREE.Mesh(geo, mat);

        if (p.name === 'Sun') {
          const coronaGeo = new THREE.RingGeometry(3.1, 4.2, 32);
          const coronaMat = new THREE.MeshBasicMaterial({
            color: 0xffe066,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.4,
          });
          const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
          coronaMesh.name = 'sunCorona';
          mesh.add(coronaMesh);
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
          const ringGeo = new THREE.RingGeometry(2.4, 4.2, 32);
          const ringMat = new THREE.MeshBasicMaterial({
            color: 0xfef08a,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7,
          });
          const ringMesh = new THREE.Mesh(ringGeo, ringMat);
          ringMesh.rotation.x = Math.PI / 2.3;
          mesh.add(ringMesh);
        }

        scene.add(mesh);
        state.orbitMeshes.push({
          mesh,
          orbitLine,
          data: p,
          angle: Math.random() * Math.PI * 2,
        });
      });
    }

    // 2. HUMAN HEART ANATOMY (with Kainmueller Slicing)
    else if (activeModule === 'human-heart') {
      camera.position.set(0, 2, 12);
      camera.lookAt(0, 0, 0);

      const heartGroup = new THREE.Group();

      const bodyGeo = new THREE.SphereGeometry(2.4, 32, 32);
      bodyGeo.scale(1.0, 1.35, 0.9);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0xbe123c,
        roughness: 0.35,
        metalness: 0.15,
        clippingPlanes: [clippingPlane],
        clipShadows: true,
        side: THREE.DoubleSide,
      });
      const heartBody = new THREE.Mesh(bodyGeo, bodyMat);
      heartGroup.add(heartBody);

      // Aorta Arch
      const aortaGeo = new THREE.TorusGeometry(1.4, 0.45, 16, 32, Math.PI);
      const aortaMat = new THREE.MeshStandardMaterial({
        color: 0xe11d48,
        roughness: 0.3,
        clippingPlanes: [clippingPlane],
      });
      const aorta = new THREE.Mesh(aortaGeo, aortaMat);
      aorta.position.set(0.2, 2.5, 0);
      aorta.rotation.z = -Math.PI / 1.1;
      heartGroup.add(aorta);

      // Vena Cava
      const venaGeo = new THREE.CylinderGeometry(0.4, 0.4, 2.2, 16);
      const venaMat = new THREE.MeshStandardMaterial({
        color: 0x2563eb,
        roughness: 0.3,
        clippingPlanes: [clippingPlane],
      });
      const vena = new THREE.Mesh(venaGeo, venaMat);
      vena.position.set(-1.2, 2.4, 0.2);
      heartGroup.add(vena);

      // Pulmonary Artery
      const pulmGeo = new THREE.CylinderGeometry(0.38, 0.38, 2.0, 16);
      const pulm = new THREE.Mesh(pulmGeo, venaMat);
      pulm.position.set(1.1, 2.1, 0.3);
      pulm.rotation.z = Math.PI / 5;
      heartGroup.add(pulm);

      scene.add(heartGroup);
      state.heartMesh = heartGroup;

      // Flowing Blood Corpuscles
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

        const r = isArterial ? 1.0 : 0.2;
        const g = isArterial ? 0.1 : 0.5;
        const b = isArterial ? 0.2 : 1.0;
        colors[i * 3] = r;
        colors[i * 3 + 1] = g;
        colors[i * 3 + 2] = b;
      }

      bloodGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      bloodGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const bloodMat = new THREE.PointsMaterial({
        size: 0.25,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
      });

      const bloodParticles = new THREE.Points(bloodGeo, bloodMat);
      bloodParticles.userData = { particleData };
      scene.add(bloodParticles);
      state.bloodParticles = bloodParticles;
    }

    // 3. 3D GEOMETRY (MANIM MATHEMATICAL NET UNFOLD)
    else if (activeModule === 'geometry-volume') {
      camera.position.set(0, 4, 12);
      camera.lookAt(0, 0, 0);

      const group = new THREE.Group();

      if (selectedShape === 'cube') {
        const faceSize = 2.4;
        const half = faceSize / 2;
        const faces = [
          { name: 'Bottom', pos: [0, -half, 0], rot: [Math.PI / 2, 0, 0], unfoldRot: [0, 0, 0] },
          { name: 'Front', pos: [0, 0, half], rot: [0, 0, 0], unfoldRot: [Math.PI / 2, 0, 0] },
          { name: 'Back', pos: [0, 0, -half], rot: [0, Math.PI, 0], unfoldRot: [-Math.PI / 2, 0, 0] },
          { name: 'Left', pos: [-half, 0, 0], rot: [0, -Math.PI / 2, 0], unfoldRot: [0, 0, -Math.PI / 2] },
          { name: 'Right', pos: [half, 0, 0], rot: [0, Math.PI / 2, 0], unfoldRot: [0, 0, Math.PI / 2] },
          { name: 'Top', pos: [0, half, 0], rot: [-Math.PI / 2, 0, 0], unfoldRot: [-Math.PI, 0, 0] },
        ];

        const faceGeo = new THREE.PlaneGeometry(faceSize, faceSize);
        const faceMat = new THREE.MeshStandardMaterial({
          color: 0x3b82f6,
          side: THREE.DoubleSide,
          roughness: 0.3,
          metalness: 0.1,
          transparent: true,
          opacity: 0.9,
          clippingPlanes: [clippingPlane],
        });

        faces.forEach((f) => {
          const mesh = new THREE.Mesh(faceGeo, faceMat.clone());
          mesh.position.set(f.pos[0], f.pos[1], f.pos[2]);
          mesh.rotation.set(f.rot[0], f.rot[1], f.rot[2]);
          mesh.userData = { config: f, origPos: [...f.pos], origRot: [...f.rot] };

          const edges = new THREE.EdgesGeometry(faceGeo);
          const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xfacc15, linewidth: 2 }));
          mesh.add(line);

          group.add(mesh);
          state.shapeFaces.push(mesh);
        });
      } else {
        let geo;
        if (selectedShape === 'cylinder') {
          geo = new THREE.CylinderGeometry(1.8, 1.8, 3.6, 32);
        } else if (selectedShape === 'pyramid') {
          geo = new THREE.ConeGeometry(2.4, 3.6, 4);
        } else {
          geo = new THREE.SphereGeometry(2.2, 32, 32);
        }

        const mat = new THREE.MeshStandardMaterial({
          color: 0x2563eb,
          roughness: 0.25,
          metalness: 0.2,
          transparent: true,
          opacity: 0.85,
          clippingPlanes: [clippingPlane],
        });

        const mesh = new THREE.Mesh(geo, mat);
        const edges = new THREE.EdgesGeometry(geo);
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xfacc15, linewidth: 2 }));
        mesh.add(line);
        group.add(mesh);
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

      // Orbital Rings (K-shell and L-shell)
      [3.0, 5.0, 7.0].forEach((r, idx) => {
        const ringGeo = new THREE.BufferGeometry();
        const pts = [];
        for (let a = 0; a <= Math.PI * 2; a += 0.05) {
          pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r));
        }
        ringGeo.setFromPoints(pts);
        const ringMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.4 });
        const ring = new THREE.Line(ringGeo, ringMat);
        ring.rotation.x = idx === 1 ? Math.PI / 3 : idx === 2 ? -Math.PI / 3 : 0;
        atomGroup.add(ring);
      });

      scene.add(atomGroup);
      state.vaultMesh = atomGroup;
    }

    // 8. project-SIMPLE: ANCIENT PYRAMID & ARCHAEOLOGY
    else if (activeModule === 'ancient-pyramid') {
      camera.position.set(0, 6, 18);
      camera.lookAt(0, 0, 0);

      const pyrGroup = new THREE.Group();

      // Stepped Egyptian Pyramid
      const steps = 6;
      for (let s = 0; s < steps; s++) {
        const w = (steps - s) * 2.2;
        const boxGeo = new THREE.BoxGeometry(w, 0.9, w);
        const boxMat = new THREE.MeshStandardMaterial({
          color: 0xd97706,
          roughness: 0.7,
          clippingPlanes: [clippingPlane],
        });
        const b = new THREE.Mesh(boxGeo, boxMat);
        b.position.y = s * 0.9;
        pyrGroup.add(b);
      }

      scene.add(pyrGroup);
      state.vaultMesh = pyrGroup;
    }
  }, [activeModule, selectedShape]);

  useEffect(() => {
    buildActiveScene();
  }, [activeModule, buildActiveScene]);

  // Main 60FPS Animation Loop
  const startAnimationLoop = useCallback(() => {
    let lastSoundTime = 0;

    const animate = () => {
      const state = threeStateRef.current;
      if (!state) return;
      const { renderer, scene, camera, clock } = state;
      const time = clock.getElapsedTime();
      const effectiveSpeed = isPlaying ? speedMultiplier : 0;

      // Desktop Orbit Controls
      const c = state.controls;
      if (displayMode === 'desktop' && !isWebXRPresenting) {
        const radius = c.zoom;
        camera.position.x = radius * Math.sin(c.rotY) * Math.cos(c.rotX);
        camera.position.y = radius * Math.sin(c.rotX);
        camera.position.z = radius * Math.cos(c.rotY) * Math.cos(c.rotX);
        camera.lookAt(0, 0, 0);
      }

      // aframevr: Gaze Reticle Raycasting
      if (gazeReticleEnabled) {
        state.raycaster.setFromCamera({ x: 0, y: 0 }, camera);
        const interactables =
          activeModule === 'solar-system'
            ? state.orbitMeshes.map((m) => m.mesh)
            : scene.children.filter((ch: any) => ch.isMesh || ch.isGroup);

        const hits = state.raycaster.intersectObjects(interactables, true);
        if (hits.length > 0) {
          const hitName = hits[0].object.name || hits[0].object.userData?.planetData?.name || 'Target';
          if (gazeTargetRef.current === hitName) {
            gazeTimerRef.current += 1.6;
            setGazeProgress(Math.min(100, gazeTimerRef.current));
            if (gazeTimerRef.current >= 100) {
              gazeTimerRef.current = 0;
              playSynthesizedSound('laser');
              if (hits[0].object.userData?.planetData) {
                handleSelectPlanet(hits[0].object.userData.planetData.name);
              }
            }
          } else {
            gazeTargetRef.current = hitName;
            gazeTimerRef.current = 0;
            setGazeProgress(0);
          }
        } else {
          gazeTargetRef.current = null;
          gazeTimerRef.current = 0;
          setGazeProgress(0);
        }
      }

      // 1. Solar System
      if (activeModule === 'solar-system') {
        state.orbitMeshes.forEach((item) => {
          if (item.data.distance > 0 && effectiveSpeed > 0) {
            item.angle += item.data.speed * 0.5 * effectiveSpeed;
            item.mesh.position.x = Math.cos(item.angle) * item.data.distance;
            item.mesh.position.z = Math.sin(item.angle) * item.data.distance;
          }
          item.mesh.rotation.y += item.data.rotationSpeed * (effectiveSpeed > 0 ? effectiveSpeed : 1);

          if (item.data.name === 'Sun') {
            const corona = item.mesh.getObjectByName('sunCorona');
            if (corona) {
              const pulse = 1 + Math.sin(time * 3) * 0.08;
              corona.scale.set(pulse, pulse, pulse);
            }
          }
        });
      }

      // 2. Heart Anatomy
      else if (activeModule === 'human-heart') {
        if (state.heartMesh) {
          const beatWave = Math.sin(time * 4.5 * (effectiveSpeed > 0 ? effectiveSpeed : 1));
          const beatScale = 1 + Math.max(0, beatWave) * 0.12;
          state.heartMesh.scale.set(beatScale, beatScale, beatScale);
          state.heartMesh.rotation.y += 0.004;

          if (effectiveSpeed > 0 && time - lastSoundTime > 1.35 / effectiveSpeed) {
            lastSoundTime = time;
            playSynthesizedSound('heartbeat');
          }
        }

        if (state.bloodParticles) {
          const positions = state.bloodParticles.geometry.attributes.position.array;
          const pData = state.bloodParticles.userData.particleData;
          for (let i = 0; i < pData.length; i++) {
            const p = pData[i];
            p.phase += p.speed * (effectiveSpeed > 0 ? effectiveSpeed : 1);
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

      // 3. Geometry (Manim Net Unfolding)
      else if (activeModule === 'geometry-volume') {
        if (state.geometryMesh && selectedShape !== 'cube') {
          state.geometryMesh.rotation.y += 0.008 * (effectiveSpeed > 0 ? effectiveSpeed : 1);
          state.geometryMesh.rotation.x += 0.004 * (effectiveSpeed > 0 ? effectiveSpeed : 1);
        }

        if (selectedShape === 'cube' && state.shapeFaces.length === 6) {
          state.shapeFaces.forEach((face) => {
            const cfg = face.userData.config;
            if (cfg.unfoldRot) {
              face.rotation.x = cfg.origRot[0] + cfg.unfoldRot[0] * netUnfoldAmount;
              face.rotation.y = cfg.origRot[1] + cfg.unfoldRot[1] * netUnfoldAmount;
              face.rotation.z = cfg.origRot[2] + cfg.unfoldRot[2] * netUnfoldAmount;
            }
          });
        }
      }

      // 4. Earth Layers Explode & Lava Physics
      else if (activeModule === 'earth-volcano') {
        if (state.geometryMesh) {
          state.geometryMesh.rotation.y += 0.003 * (effectiveSpeed > 0 ? effectiveSpeed : 1);
        }

        state.earthLayers.forEach((layer) => {
          const cfg = layer.userData.config;
          if (cfg) {
            layer.position.z = cfg.explodeOffset * explodeAmount;
          }
        });

        if (state.lavaParticles) {
          const pos = state.lavaParticles.geometry.attributes.position.array;
          const vels = state.lavaParticles.userData.lavaVelocities;
          for (let i = 0; i < vels.length; i++) {
            const v = vels[i];
            pos[i * 3] += v.x;
            pos[i * 3 + 1] += v.y;
            pos[i * 3 + 2] += v.z;
            v.y -= 0.003;

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

      // 5. Vault Meshes (DNA, Cell, Atom, Pyramid)
      else if (state.vaultMesh) {
        state.vaultMesh.rotation.y += 0.006 * (effectiveSpeed > 0 ? effectiveSpeed : 1);
      }

      renderer.render(scene, camera);
      animFrameIdRef.current = requestAnimationFrame(animate);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);
  }, [
    activeModule,
    displayMode,
    isPlaying,
    speedMultiplier,
    selectedShape,
    netUnfoldAmount,
    explodeAmount,
    gazeReticleEnabled,
    isWebXRPresenting,
    playSynthesizedSound,
  ]);

  // Pointer Handling
  const handlePointerDown = (e: React.PointerEvent) => {
    const state = threeStateRef.current;
    if (!state) return;
    state.controls.isDragging = true;
    state.controls.prevX = e.clientX;
    state.controls.prevY = e.clientY;
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

  const handlePointerUp = () => {
    const state = threeStateRef.current;
    if (state) state.controls.isDragging = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    const state = threeStateRef.current;
    if (!state) return;
    state.controls.zoom = Math.max(10, Math.min(80, state.controls.zoom + e.deltaY * 0.04));
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

  // Resize Listener
  useEffect(() => {
    const handleResize = () => {
      const state = threeStateRef.current;
      if (!state || !containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      state.camera.aspect = width / height;
      state.camera.updateProjectionMatrix();
      state.renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Selection Narration Triggers
  const handleSelectPlanet = (name: string) => {
    setSelectedPin(name);
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

  const handleSelectShape = (shape: 'cube' | 'cylinder' | 'pyramid' | 'sphere') => {
    setSelectedShape(shape);
    setNetUnfoldAmount(0);
    playSynthesizedSound('chime');
    const texts: Record<string, string> = {
      cube: 'This is a 3D Cube. A cube has 6 identical square faces, 12 straight edges, and 8 vertices. Its volume is side cubed, and its surface area is 6 times side squared. Slide Unfold Net to see its flat 2D pattern!',
      cylinder: 'This is a cylinder. It has two congruent circular bases connected by a smooth curved surface. Its volume formula is pi times radius squared times height!',
      pyramid: 'This is a square pyramid. It has one square base and four triangular faces that converge at a single vertex. Its volume is one third times base area times height!',
      sphere: 'This is a sphere. Every point on its surface is the exact same distance from the center. Its volume is four thirds pi r cubed, and surface area is four pi r squared!',
    };
    if (texts[shape] && autoNarrate) {
      speakNarration(texts[shape]);
    }
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

  // ruslanmv/GenAI-3D: Dynamic Text-to-3D Synthesis Trigger
  const handleGenerateAi3D = (promptQuery: string) => {
    const q = promptQuery.toLowerCase().trim();
    if (!q) return;

    setIsAiGenerating(true);
    playSynthesizedSound('chime');

    setTimeout(() => {
      setIsAiGenerating(false);
      setAiPromptOpen(false);

      if (q.includes('dna') || q.includes('gene') || q.includes('genetic') || q.includes('helix')) {
        setActiveModule('dna-helix');
        setCustomAiModelTitle('🧬 Generated: DNA Double Helix Molecular Model');
        speakNarration('Generating 3D simulation of DNA! DNA, or Deoxyribonucleic acid, contains the biological genetic blueprints for all living organisms. Notice the double helix twisted ladder with Adenine, Thymine, Guanine, and Cytosine base pairs!');
      } else if (q.includes('cell') || q.includes('plant') || q.includes('chloroplast') || q.includes('biology')) {
        setActiveModule('plant-cell');
        setCustomAiModelTitle('🌿 Generated: Eukaryotic Plant Cell Model');
        speakNarration('Synthesizing 3D Plant Cell! Plant cells feature a protective rigid cell wall, a large water-filled central vacuole, and green chloroplasts that convert sunlight into chemical energy through photosynthesis.');
      } else if (q.includes('atom') || q.includes('electron') || q.includes('proton') || q.includes('bohr') || q.includes('chemistry')) {
        setActiveModule('bohr-atom');
        setCustomAiModelTitle('⚛️ Generated: Bohr Quantum Atom Model');
        speakNarration('Generating Bohr Atom model! At the center lies the dense nucleus of positively charged protons and neutral neutrons, surrounded by electrons in concentric quantum energy shells.');
      } else if (q.includes('pyramid') || q.includes('egypt') || q.includes('history') || q.includes('ancient')) {
        setActiveModule('ancient-pyramid');
        setCustomAiModelTitle('🏛️ Generated: Great Pyramid of Giza');
        speakNarration('Synthesizing Ancient Egyptian Stepped Pyramid! Built as grand monumental tombs over 4,500 years ago, these marvels of engineering align precisely with the cardinal directions.');
      } else {
        // Fallback default custom model
        setActiveModule('geometry-volume');
        setSelectedShape('cylinder');
        setCustomAiModelTitle(`✨ AI 3D Model: ${promptQuery}`);
        speakNarration(`Generated 3D solid for ${promptQuery}! Rotate with your mouse or finger to inspect its spatial geometry, surface faces, and internal volume.`);
      }
    }, 900);
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
                setActiveModule(tab.id as VRModuleId);
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

          {/* oculus-samples: Native WebXR Headset Button */}
          <button
            onClick={launchNativeWebXR}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black transition-all border ${
              isWebXRPresenting
                ? 'bg-emerald-500 text-white border-white animate-pulse'
                : 'bg-sky-600 hover:bg-sky-500 text-white border-sky-400 shadow-sm'
            }`}
            title="Launch Native WebXR for Meta Quest / Apple Vision Pro"
          >
            <Glasses className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{isWebXRPresenting ? 'VR Headset Active' : 'Enter WebXR'}</span>
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
        <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 border-b-2 border-purple-500/40 px-3 sm:px-4 py-2.5 z-30 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-2xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <WandSparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="font-black text-xs text-white uppercase tracking-wider shrink-0">
              AI 3D Lab Generator:
            </span>
            <div className="relative flex-1 sm:w-80">
              <input
                type="text"
                value={aiPromptText}
                onChange={(e) => setAiPromptText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerateAi3D(aiPromptText)}
                placeholder="e.g. Plant cell, DNA helix, Bohr atom, Pyramid..."
                className="w-full bg-slate-900/90 border border-purple-400/40 rounded-xl px-3 py-1 text-xs text-white placeholder-white/40 focus:outline-none focus:border-purple-400"
              />
            </div>
            <button
              onClick={() => handleGenerateAi3D(aiPromptText)}
              disabled={isAiGenerating}
              className="px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs flex items-center gap-1 shadow-sm shrink-0"
            >
              {isAiGenerating ? <Loader className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              <span>{isAiGenerating ? 'Synthesizing...' : 'Generate 3D'}</span>
            </button>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full sm:w-auto">
            <span className="text-[10px] text-white/50 font-bold shrink-0">Try:</span>
            {[
              { label: '🧬 DNA', query: 'DNA Double Helix' },
              { label: '🌿 Cell', query: 'Plant Cell' },
              { label: '⚛️ Atom', query: 'Bohr Atom' },
              { label: '🏛️ Pyramid', query: 'Ancient Pyramid' },
            ].map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  setAiPromptText(p.query);
                  handleGenerateAi3D(p.query);
                }}
                className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 text-[10px] font-bold shrink-0"
              >
                {p.label}
              </button>
            ))}
            <button
              onClick={() => setAiPromptOpen(false)}
              className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs text-white/70 ml-1 shrink-0"
            >
              ✕
            </button>
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
              setIsSlicingActive(!isSlicingActive);
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
                onChange={(e) => setSliceHeight(parseFloat(e.target.value))}
                className="w-16 accent-rose-500 cursor-pointer h-1.5"
              />
            </div>
          )}

          {/* Manim Motion Controls */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
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
                onClick={() => setSpeedMultiplier(s)}
                className={`px-1 rounded font-black ${
                  speedMultiplier === s ? 'bg-yellow text-dark' : 'hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================
          MAIN 3D WEBGL STAGE
          ============================================================ */}
      <div
        className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing overflow-hidden"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
      >
        <canvas ref={canvasRef} className="w-full h-full block" />

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

            {selectedPin && (
              <aside className="absolute top-3 right-3 z-20 w-72 sm:w-80 bg-slate-900/95 backdrop-blur-md border-2 border-white/20 rounded-2xl p-4 text-white shadow-2xl animate-in fade-in zoom-in-95">
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
        {activeModule === 'human-heart' && (
          <aside className="absolute top-3 right-3 z-20 w-72 sm:w-80 bg-slate-900/95 backdrop-blur-md border-2 border-white/20 rounded-2xl p-4 text-white shadow-2xl animate-in fade-in">
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

        {/* 3. 3D GEOMETRY */}
        {activeModule === 'geometry-volume' && (
          <aside className="absolute top-3 right-3 z-20 w-72 sm:w-84 bg-slate-900/95 backdrop-blur-md border-2 border-white/20 rounded-2xl p-4 text-white shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-yellow" />
                <h3 className="font-black text-sm uppercase text-yellow">3D Geometry & Volume</h3>
              </div>
              <button
                onClick={() => handleSelectShape(selectedShape)}
                className="h-6 px-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 flex items-center gap-1 text-[10px] font-black border border-emerald-500/30"
              >
                <Volume2 className="w-3 h-3" />
                <span>Listen</span>
              </button>
            </div>

            <div className="grid grid-cols-4 gap-1 mb-3">
              {(['cube', 'cylinder', 'pyramid', 'sphere'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => handleSelectShape(s)}
                  className={`py-1.5 rounded-xl border text-xs font-black uppercase transition-all ${
                    selectedShape === s
                      ? 'bg-yellow text-dark border-dark shadow-sm'
                      : 'bg-white/10 border-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {selectedShape === 'cube' && (
              <div className="bg-blue-950/70 border border-blue-500/30 p-2.5 rounded-xl mb-3">
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="flex items-center gap-1 text-blue-200">
                    <Sliders className="w-3 h-3 text-yellow" /> Manim Net Unfold:
                  </span>
                  <span className="font-mono text-yellow">{Math.round(netUnfoldAmount * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={netUnfoldAmount}
                  onChange={(e) => setNetUnfoldAmount(parseFloat(e.target.value))}
                  className="w-full accent-yellow cursor-pointer h-1.5 rounded-lg"
                />
                <div className="flex justify-between text-[9px] text-white/50 mt-1 font-mono">
                  <span>3D Solid</span>
                  <span>Flat 2D Net</span>
                </div>
              </div>
            )}

            <div className="space-y-1.5 bg-white/10 p-3 rounded-xl mb-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">Volume Formula:</span>
                <span className="font-black text-yellow">
                  {selectedShape === 'cube'
                    ? 'V = s³'
                    : selectedShape === 'cylinder'
                    ? 'V = π × r² × h'
                    : selectedShape === 'pyramid'
                    ? 'V = ⅓ × B × h'
                    : 'V = ⁴⁄₃ × π × r³'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">Surface Area:</span>
                <span className="font-black text-emerald-400">
                  {selectedShape === 'cube'
                    ? 'SA = 6s²'
                    : selectedShape === 'cylinder'
                    ? 'SA = 2πrh + 2πr²'
                    : selectedShape === 'pyramid'
                    ? 'SA = B + ½Ps'
                    : 'SA = 4πr²'}
                </span>
              </div>
            </div>
          </aside>
        )}

        {/* 4. EARTH LAYERS */}
        {activeModule === 'earth-volcano' && (
          <aside className="absolute top-3 right-3 z-20 w-72 sm:w-84 bg-slate-900/95 backdrop-blur-md border-2 border-white/20 rounded-2xl p-4 text-white shadow-2xl animate-in fade-in">
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
                onChange={(e) => setExplodeAmount(parseFloat(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-1.5 rounded-lg"
              />
            </div>

            <div className="space-y-1.5 mb-2">
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
          </aside>
        )}

        {/* 5. DNA DOUBLE HELIX */}
        {activeModule === 'dna-helix' && (
          <aside className="absolute top-3 right-3 z-20 w-72 sm:w-80 bg-slate-900/95 backdrop-blur-md border-2 border-cyan-500/40 rounded-2xl p-4 text-white shadow-2xl animate-in fade-in">
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
        {activeModule === 'plant-cell' && (
          <aside className="absolute top-3 right-3 z-20 w-72 sm:w-80 bg-slate-900/95 backdrop-blur-md border-2 border-emerald-500/40 rounded-2xl p-4 text-white shadow-2xl animate-in fade-in">
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
        {activeModule === 'bohr-atom' && (
          <aside className="absolute top-3 right-3 z-20 w-72 sm:w-80 bg-slate-900/95 backdrop-blur-md border-2 border-sky-500/40 rounded-2xl p-4 text-white shadow-2xl animate-in fade-in">
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
        {activeModule === 'ancient-pyramid' && (
          <aside className="absolute top-3 right-3 z-20 w-72 sm:w-80 bg-slate-900/95 backdrop-blur-md border-2 border-amber-500/40 rounded-2xl p-4 text-white shadow-2xl animate-in fade-in">
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
      </div>
    </div>
  );
}
