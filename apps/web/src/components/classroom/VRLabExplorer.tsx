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
  Activity,
  Sliders,
  FastForward,
  Eye,
  Info,
} from 'lucide-react';

export type VRModuleId = 'solar-system' | 'human-heart' | 'geometry-volume' | 'earth-volcano';
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

  // Manim Mathematical Motion Controls
  const [netUnfoldAmount, setNetUnfoldAmount] = useState<number>(0); // 0 = 3D folded, 1 = 2D flat net
  const [explodeAmount, setExplodeAmount] = useState<number>(0); // 0 = intact, 1 = exploded layers/faces
  const [showOrbitTrails, setShowOrbitTrails] = useState<boolean>(true);

  // Heart Specific State
  const [selectedHeartPart, setSelectedHeartPart] = useState<string>('Left Ventricle');

  // Geometry Specific State
  const [selectedShape, setSelectedShape] = useState<'cube' | 'cylinder' | 'pyramid' | 'sphere'>('cube');

  // Earth Specific State
  const [selectedLayer, setSelectedLayer] = useState<string>('Inner Core');

  // Voice Narration & Audio State
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
    controls: {
      isDragging: boolean;
      prevX: number;
      prevY: number;
      rotX: number;
      rotY: number;
      zoom: number;
    };
    orbitMeshes: any[];
    trailLines: any[];
    heartMesh: any;
    bloodParticles: any;
    geometryMesh: any;
    shapeFaces: any[];
    earthLayers: any[];
    lavaParticles: any;
    clock: any;
  } | null>(null);

  // ============================================================
  // PROCEDURAL WEB AUDIO SYNTHESIZER (No MP3 dependencies)
  // ============================================================
  const playSynthesizedSound = useCallback((type: 'heartbeat' | 'space' | 'chime' | 'volcano') => {
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
        // Lub-Dub dual low-frequency thump
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

        // Dub second beat
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
        // Crystalline cosmic ping
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.4); // A5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
      } else if (type === 'chime') {
        // High harmonic geometry chime
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.42);
      } else if (type === 'volcano') {
        // Low bubbling subterranean rumble
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
      }
    } catch (_) {}
  }, []);

  // ============================================================
  // WEB SPEECH SYNTHESIS NARRATION ENGINE
  // ============================================================
  const speakNarration = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;

      window.speechSynthesis.cancel();
      setAudioFeedbackText(text);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speechSpeed;
      utterance.pitch = 1.08; // Friendly, engaging tone for pupils

      // Select an expressive natural English voice if available
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

  // ============================================================
  // THREE.JS ENGINE INITIALIZATION
  // ============================================================
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
        controls: {
          isDragging: false,
          prevX: 0,
          prevY: 0,
          rotX: 0.3,
          rotY: 0,
          zoom: 38,
        },
        orbitMeshes: [],
        trailLines: [],
        heartMesh: null,
        bloodParticles: null,
        geometryMesh: null,
        shapeFaces: [],
        earthLayers: [],
        lavaParticles: null,
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

  // ============================================================
  // BUILD SCENE PER MODULE WITH MANIM-STYLE VISUALS
  // ============================================================
  const buildActiveScene = useCallback(() => {
    const state = threeStateRef.current;
    if (!state) return;
    const { THREE, scene, camera } = state;

    // Clean previous objects
    state.orbitMeshes.forEach((item) => {
      scene.remove(item.mesh);
      if (item.orbitLine) scene.remove(item.orbitLine);
    });
    state.orbitMeshes = [];

    state.trailLines.forEach((tl) => scene.remove(tl));
    state.trailLines = [];

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
          });
        }

        const mesh = new THREE.Mesh(geo, mat);

        // Sun Corona Pulsating Flare
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
          // Circular trajectory guide
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

        // Saturn Rings
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

    // 2. HUMAN HEART ANATOMY MODULE
    else if (activeModule === 'human-heart') {
      camera.position.set(0, 2, 12);
      camera.lookAt(0, 0, 0);

      const heartGroup = new THREE.Group();

      // Main Left/Right Ventricle Muscle
      const bodyGeo = new THREE.SphereGeometry(2.4, 32, 32);
      bodyGeo.scale(1.0, 1.35, 0.9);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0xbe123c,
        roughness: 0.35,
        metalness: 0.15,
      });
      const heartBody = new THREE.Mesh(bodyGeo, bodyMat);
      heartGroup.add(heartBody);

      // Aorta Arch (Top Red Artery)
      const aortaGeo = new THREE.TorusGeometry(1.4, 0.45, 16, 32, Math.PI);
      const aortaMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.3 });
      const aorta = new THREE.Mesh(aortaGeo, aortaMat);
      aorta.position.set(0.2, 2.5, 0);
      aorta.rotation.z = -Math.PI / 1.1;
      heartGroup.add(aorta);

      // Vena Cava (Top Blue Vein)
      const venaGeo = new THREE.CylinderGeometry(0.4, 0.4, 2.2, 16);
      const venaMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.3 });
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

      // Flowing Blood Corpuscle Particle System
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

    // 3. 3D GEOMETRY (MANIM MATHEMATICAL MOTION)
    else if (activeModule === 'geometry-volume') {
      camera.position.set(0, 4, 12);
      camera.lookAt(0, 0, 0);

      const group = new THREE.Group();

      if (selectedShape === 'cube') {
        // Manim Unfoldable Cube Net (6 hinged face planes)
        const faceSize = 2.4;
        const half = faceSize / 2;
        const faces = [
          { name: 'Bottom', pos: [0, -half, 0], rot: [Math.PI / 2, 0, 0], hinge: [0, 0, 0], unfoldRot: [0, 0, 0] },
          { name: 'Front', pos: [0, 0, half], rot: [0, 0, 0], hinge: [0, -half, half], unfoldRot: [Math.PI / 2, 0, 0] },
          { name: 'Back', pos: [0, 0, -half], rot: [0, Math.PI, 0], hinge: [0, -half, -half], unfoldRot: [-Math.PI / 2, 0, 0] },
          { name: 'Left', pos: [-half, 0, 0], rot: [0, -Math.PI / 2, 0], hinge: [-half, -half, 0], unfoldRot: [0, 0, -Math.PI / 2] },
          { name: 'Right', pos: [half, 0, 0], rot: [0, Math.PI / 2, 0], hinge: [half, -half, 0], unfoldRot: [0, 0, Math.PI / 2] },
          { name: 'Top', pos: [0, half, 0], rot: [-Math.PI / 2, 0, 0], hinge: [0, half, -half], unfoldRot: [-Math.PI, 0, 0] },
        ];

        const faceGeo = new THREE.PlaneGeometry(faceSize, faceSize);
        const faceMat = new THREE.MeshStandardMaterial({
          color: 0x3b82f6,
          side: THREE.DoubleSide,
          roughness: 0.3,
          metalness: 0.1,
          transparent: true,
          opacity: 0.9,
        });

        faces.forEach((f) => {
          const mesh = new THREE.Mesh(faceGeo, faceMat.clone());
          mesh.position.set(f.pos[0], f.pos[1], f.pos[2]);
          mesh.rotation.set(f.rot[0], f.rot[1], f.rot[2]);
          mesh.userData = { config: f, origPos: [...f.pos], origRot: [...f.rot] };

          // Edge lines
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

      // Stratified Spheres with Explode Capability
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
            : new THREE.MeshStandardMaterial({ color: lc.color, roughness: 0.45 });

        const mesh = new THREE.Mesh(geo, mat);
        mesh.userData = { config: lc };
        earthGroup.add(mesh);
        state.earthLayers.push(mesh);
      });

      // Volcano Lava Eruption Particles
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
  }, [activeModule, selectedShape]);

  useEffect(() => {
    buildActiveScene();
  }, [activeModule, buildActiveScene]);

  // ============================================================
  // MAIN 60FPS ANIMATION LOOP (MANIM DYNAMICS & MOTION)
  // ============================================================
  const startAnimationLoop = useCallback(() => {
    let lastSoundTime = 0;

    const animate = () => {
      const state = threeStateRef.current;
      if (!state) return;
      const { renderer, scene, camera, clock } = state;
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();
      const effectiveSpeed = isPlaying ? speedMultiplier : 0;

      // Camera Orbit Controls
      const c = state.controls;
      if (displayMode === 'desktop') {
        const radius = c.zoom;
        camera.position.x = radius * Math.sin(c.rotY) * Math.cos(c.rotX);
        camera.position.y = radius * Math.sin(c.rotX);
        camera.position.z = radius * Math.cos(c.rotY) * Math.cos(c.rotX);
        camera.lookAt(0, 0, 0);
      }

      // 1. Solar System Motion & Dynamic Corona
      if (activeModule === 'solar-system') {
        state.orbitMeshes.forEach((item) => {
          if (item.data.distance > 0 && effectiveSpeed > 0) {
            item.angle += item.data.speed * 0.5 * effectiveSpeed;
            item.mesh.position.x = Math.cos(item.angle) * item.data.distance;
            item.mesh.position.z = Math.sin(item.angle) * item.data.distance;
          }
          item.mesh.rotation.y += item.data.rotationSpeed * (effectiveSpeed > 0 ? effectiveSpeed : 1);

          // Corona Pulsation
          if (item.data.name === 'Sun') {
            const corona = item.mesh.getObjectByName('sunCorona');
            if (corona) {
              const pulse = 1 + Math.sin(time * 3) * 0.08;
              corona.scale.set(pulse, pulse, pulse);
            }
          }
        });
      }

      // 2. Heartbeat Systole/Diastole & Blood Flow Particles
      else if (activeModule === 'human-heart') {
        if (state.heartMesh) {
          const beatWave = Math.sin(time * 4.5 * (effectiveSpeed > 0 ? effectiveSpeed : 1));
          const beatScale = 1 + Math.max(0, beatWave) * 0.12;
          state.heartMesh.scale.set(beatScale, beatScale, beatScale);
          state.heartMesh.rotation.y += 0.004;

          // Sound trigger in sync with contraction
          if (effectiveSpeed > 0 && time - lastSoundTime > 1.35 / effectiveSpeed) {
            lastSoundTime = time;
            playSynthesizedSound('heartbeat');
          }
        }

        // Blood corpuscle flow
        if (state.bloodParticles) {
          const positions = state.bloodParticles.geometry.attributes.position.array;
          const pData = state.bloodParticles.userData.particleData;
          for (let i = 0; i < pData.length; i++) {
            const p = pData[i];
            p.phase += p.speed * (effectiveSpeed > 0 ? effectiveSpeed : 1);
            if (p.isArterial) {
              // Aorta arch trajectory (red)
              positions[i * 3] = 0.2 + Math.cos(p.phase) * 1.4;
              positions[i * 3 + 1] = 2.5 + Math.sin(p.phase) * 1.4;
              positions[i * 3 + 2] = (Math.sin(p.phase * 2) * 0.3);
            } else {
              // Vena cava vertical flow (blue)
              positions[i * 3] = -1.2 + Math.sin(p.phase) * 0.3;
              positions[i * 3 + 1] = 1.3 + ((p.phase * 0.8) % 2.2);
              positions[i * 3 + 2] = 0.2 + Math.cos(p.phase) * 0.3;
            }
          }
          state.bloodParticles.geometry.attributes.position.needsUpdate = true;
        }
      }

      // 3. Geometry Net Unfolding (Manim Easing Motion)
      else if (activeModule === 'geometry-volume') {
        if (state.geometryMesh && selectedShape !== 'cube') {
          state.geometryMesh.rotation.y += 0.008 * (effectiveSpeed > 0 ? effectiveSpeed : 1);
          state.geometryMesh.rotation.x += 0.004 * (effectiveSpeed > 0 ? effectiveSpeed : 1);
        }

        if (selectedShape === 'cube' && state.shapeFaces.length === 6) {
          state.shapeFaces.forEach((face) => {
            const cfg = face.userData.config;
            if (cfg.unfoldRot) {
              // Smoothly interpolate rotation to net
              face.rotation.x = cfg.origRot[0] + cfg.unfoldRot[0] * netUnfoldAmount;
              face.rotation.y = cfg.origRot[1] + cfg.unfoldRot[1] * netUnfoldAmount;
              face.rotation.z = cfg.origRot[2] + cfg.unfoldRot[2] * netUnfoldAmount;
            }
          });
        }
      }

      // 4. Earth Layers Explode & Lava Fountain Motion
      else if (activeModule === 'earth-volcano') {
        if (state.geometryMesh) {
          state.geometryMesh.rotation.y += 0.003 * (effectiveSpeed > 0 ? effectiveSpeed : 1);
        }

        // Explode layers along Z
        state.earthLayers.forEach((layer) => {
          const cfg = layer.userData.config;
          if (cfg) {
            layer.position.z = cfg.explodeOffset * explodeAmount;
          }
        });

        // Lava eruption physics
        if (state.lavaParticles) {
          const pos = state.lavaParticles.geometry.attributes.position.array;
          const vels = state.lavaParticles.userData.lavaVelocities;
          for (let i = 0; i < vels.length; i++) {
            const v = vels[i];
            pos[i * 3] += v.x;
            pos[i * 3 + 1] += v.y;
            pos[i * 3 + 2] += v.z;
            v.y -= 0.003; // Gravity pulling lava down

            if (pos[i * 3 + 1] < 3.2) {
              // Reset to crater
              pos[i * 3] = (Math.random() - 0.5) * 0.2;
              pos[i * 3 + 1] = 3.6;
              pos[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
              v.y = 0.06 + Math.random() * 0.07;
            }
          }
          state.lavaParticles.geometry.attributes.position.needsUpdate = true;
        }
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
    playSynthesizedSound,
  ]);

  // Pointer Interaction
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

  // Device Gyroscope Support
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
    state.controls.zoom = activeModule === 'solar-system' ? 38 : 12;
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

  // Selection change auto-narrate triggers
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

  const activePlanetInfo = PLANETS.find((p) => p.name === selectedPin) || PLANETS[3];

  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative flex flex-col bg-slate-950 select-none overflow-hidden font-sans ${
        isFullscreen ? 'fixed inset-0 z-50' : ''
      }`}
    >
      {/* ============================================================
          TOP HEADER: MODULE SELECTOR & DEVICE SWITCHERS
          ============================================================ */}
      <div className="h-12 border-b-[2.5px] border-dark bg-[#0a1124] px-3 sm:px-4 flex items-center justify-between shrink-0 text-white z-20">
        {/* Module Switcher Tabs */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-1">
          <span className="hidden lg:flex items-center gap-1.5 font-black text-xs text-yellow uppercase mr-1">
            <Sparkles className="w-3.5 h-3.5" /> 3D Lab
          </span>

          {[
            { id: 'solar-system', label: '🪐 Solar System', icon: Globe },
            { id: 'human-heart', label: '🫀 Anatomy Heart', icon: Heart },
            { id: 'geometry-volume', label: '📐 3D Geometry', icon: Box },
            { id: 'earth-volcano', label: '🌋 Earth & Volcano', icon: Flame },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveModule(tab.id as VRModuleId);
                playSynthesizedSound('space');
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 border-[1.5px] ${
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
          {/* Gyroscope Magic Window */}
          <button
            onClick={toggleGyroscopeMode}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black transition-all border-[1.5px] ${
              gyroActive
                ? 'bg-emerald-500 text-white border-dark shadow-xs animate-pulse'
                : 'bg-white/10 hover:bg-white/20 text-white/80 border-white/20'
            }`}
            title="Tilt tablet or phone to look around in 360°"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{gyroActive ? 'Gyro Active' : 'Magic Window'}</span>
          </button>

          {/* Split VR for Cardboard */}
          <button
            onClick={() => setDisplayMode(displayMode === 'split-vr' ? 'desktop' : 'split-vr')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black transition-all border-[1.5px] ${
              displayMode === 'split-vr'
                ? 'bg-purple-600 text-white border-dark shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white/80 border-white/20'
            }`}
            title="Split screen for Cardboard / VR Phone headset"
          >
            <Glasses className="w-3.5 h-3.5" />
            <span className="hidden md:inline">VR Split</span>
          </button>

          {/* Reset Camera */}
          <button
            onClick={handleResetView}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 flex items-center justify-center border border-white/20 transition-all active:scale-95"
            title="Reset Viewpoint"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 flex items-center justify-center border border-white/20 transition-all active:scale-95"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ============================================================
          VOICE NARRATION & MOTION TOOLBAR
          ============================================================ */}
      <div className="bg-slate-900/95 border-b border-white/10 px-3 sm:px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 z-20 text-xs">
        {/* Voice Narration Controls */}
        <div className="flex items-center gap-2">
          {/* Narrate / Stop Voice Button */}
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

          {/* Spoken audio wave visualizer */}
          {isSpeaking && (
            <div className="flex items-center gap-0.5 px-2 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-bold text-[10px]">
              <span className="w-1 h-3 bg-emerald-400 rounded-full animate-bounce" />
              <span className="w-1 h-4 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.15s]" />
              <span className="w-1 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.3s]" />
              <span className="hidden sm:inline ml-1 font-mono">Narrating Aloud...</span>
            </div>
          )}

          {/* Auto-Narrate Switch */}
          <button
            onClick={() => setAutoNarrate(!autoNarrate)}
            className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg font-bold text-[10px] border transition-all ${
              autoNarrate
                ? 'bg-white/10 text-yellow border-yellow/40'
                : 'bg-white/5 text-white/50 border-white/10 hover:text-white'
            }`}
            title="Automatically speak when selecting planets or body parts"
          >
            <span>Auto-Voice:</span>
            <span className="font-black uppercase">{autoNarrate ? 'ON' : 'OFF'}</span>
          </button>

          {/* Voice Speed Toggle */}
          <div className="hidden md:flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-lg border border-white/10 text-[10px] text-white/70">
            <span>Voice Speed:</span>
            {[0.85, 1.0, 1.2].map((spd) => (
              <button
                key={spd}
                onClick={() => setSpeechSpeed(spd)}
                className={`px-1.5 py-0.5 rounded font-black ${
                  speechSpeed === spd ? 'bg-yellow text-dark' : 'hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Manim Motion Controls */}
        <div className="flex items-center gap-2">
          {/* Play / Pause Motion */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20"
          >
            {isPlaying ? <Pause className="w-3 h-3 text-yellow" /> : <Play className="w-3 h-3 text-emerald-400" />}
            <span>{isPlaying ? 'Pause Motion' : 'Resume Motion'}</span>
          </button>

          {/* Motion Speed Multiplier */}
          <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-lg border border-white/10 text-[10px] text-white/70">
            <FastForward className="w-3 h-3 text-yellow" />
            <span>Speed:</span>
            {[0.5, 1.0, 2.0, 5.0].map((s) => (
              <button
                key={s}
                onClick={() => setSpeedMultiplier(s)}
                className={`px-1.5 py-0.5 rounded font-black ${
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

        {/* Cardboard Split Screen Eye Divider */}
        {displayMode === 'split-vr' && (
          <div className="absolute inset-0 pointer-events-none flex">
            <div className="w-1/2 h-full border-r-2 border-white/30 flex items-center justify-center">
              <span className="text-white/20 font-black text-xs uppercase tracking-widest">Left Eye View</span>
            </div>
            <div className="w-1/2 h-full flex items-center justify-center">
              <span className="text-white/20 font-black text-xs uppercase tracking-widest">Right Eye View</span>
            </div>
          </div>
        )}

        {/* Dynamic Motion & Camera Instructions (Bottom Left) */}
        <div className="absolute bottom-3 left-3 z-20 pointer-events-none flex flex-col gap-1.5">
          <div className="bg-slate-900/80 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-xl text-[10px] font-bold text-white/80 flex items-center gap-2 shadow-lg">
            <Compass className="w-3.5 h-3.5 text-yellow animate-spin" />
            <span>Drag to Orbit 360° • Scroll to Zoom</span>
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

        {/* 1. SOLAR SYSTEM MODULE */}
        {activeModule === 'solar-system' && (
          <>
            {/* Bottom Planet Fast-Travel Carousel */}
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

            {/* Planet Info Card (Top Right) */}
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
                      title="Read Aloud"
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

        {/* 2. HUMAN HEART ANATOMY CONTROLS */}
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

        {/* 3. 3D GEOMETRY (MANIM NET UNFOLDING & FORMULAS) */}
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

            {/* Shape Select Buttons */}
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

            {/* Manim Unfold Net Slider (for Cube) */}
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

            {/* Formulas Box */}
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

            <div className="p-2 rounded-xl bg-white/5 text-[11px] text-white/80 leading-relaxed">
              💡 <strong>Math Tip:</strong> Drag to rotate and inspect each planar face, edge boundary, and vertex corner!
            </div>
          </aside>
        )}

        {/* 4. EARTH LAYERS & VOLCANO EXPLODE */}
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

            {/* Manim Explode Layers Slider */}
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
              <div className="flex justify-between text-[9px] text-white/50 mt-1 font-mono">
                <span>Intact Sphere</span>
                <span>Exploded View</span>
              </div>
            </div>

            {/* Layer Selection */}
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
      </div>
    </div>
  );
}
