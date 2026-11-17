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
  Laptop,
  Compass,
  Info,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  X,
  Sparkles,
  Layers,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export type VRModuleId = 'solar-system' | 'human-heart' | 'geometry-volume' | 'earth-volcano';
export type VRDisplayMode = 'desktop' | 'gyro' | 'split-vr';

interface VRLabExplorerProps {
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
  description: string;
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
    description: 'The glowing yellow star at the center of our Solar System. It provides light and warmth for all life on Earth.',
    facts: [
      { label: 'Surface Temp', value: '5,500°C' },
      { label: 'Type', value: 'Yellow Dwarf Star' },
      { label: 'Mass', value: '99.8% of Solar System' },
    ],
  },
  {
    name: 'Mercury',
    color: 0x9ca3af,
    size: 0.6,
    distance: 5.5,
    speed: 0.04,
    description: 'The smallest planet and closest to the Sun. It has huge temperature swings between night and day.',
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
    description: 'The hottest planet in the Solar System, blanketed by thick clouds of greenhouse gases.',
    facts: [
      { label: 'Surface Temp', value: '465°C' },
      { label: 'Rotation', value: 'Spins Backwards!' },
      { label: 'Moons', value: '0' },
    ],
  },
  {
    name: 'Earth',
    color: 0x3b82f6,
    size: 1.0,
    distance: 12.0,
    speed: 0.018,
    description: 'Our home planet! The only known world in the universe with liquid water, oceans, and living creatures.',
    facts: [
      { label: 'Water Cover', value: '71%' },
      { label: 'Moons', value: '1 (The Moon)' },
      { label: 'Atmosphere', value: '78% Nitrogen, 21% Oxygen' },
    ],
  },
  {
    name: 'Mars',
    color: 0xef4444,
    size: 0.7,
    distance: 16.0,
    speed: 0.014,
    description: 'The "Red Planet" covered in iron oxide rust. Home to Olympus Mons, the largest volcano in the Solar System.',
    facts: [
      { label: 'Moons', value: '2 (Phobos & Deimos)' },
      { label: 'Day Length', value: '24 hrs 37 mins' },
      { label: 'Rovers', value: 'Curiosity & Perseverance' },
    ],
  },
  {
    name: 'Jupiter',
    color: 0xd97706,
    size: 2.1,
    distance: 22.0,
    speed: 0.009,
    description: 'The giant king of planets! More than 1,300 Earths could fit inside Jupiter, famous for its Great Red Spot storm.',
    facts: [
      { label: 'Moons', value: '95 Known Moons' },
      { label: 'Storm Age', value: 'Over 300 Years Old' },
      { label: 'Type', value: 'Gas Giant' },
    ],
  },
  {
    name: 'Saturn',
    color: 0xfde047,
    size: 1.8,
    distance: 28.0,
    speed: 0.007,
    description: 'Famous for its magnificent glowing rings made of billions of pieces of ice, rock, and cosmic dust.',
    facts: [
      { label: 'Rings Width', value: '282,000 km' },
      { label: 'Moons', value: '146 Known Moons' },
      { label: 'Density', value: 'Light enough to float on water!' },
    ],
    hasRings: true,
  },
  {
    name: 'Uranus',
    color: 0x38bdf8,
    size: 1.3,
    distance: 34.0,
    speed: 0.005,
    description: 'An ice giant that spins completely on its side like a rolling ball, colored cyan by methane gas.',
    facts: [
      { label: 'Moons', value: '28 Known Moons' },
      { label: 'Tilt', value: '98 Degrees' },
      { label: 'Type', value: 'Ice Giant' },
    ],
  },
  {
    name: 'Neptune',
    color: 0x2563eb,
    size: 1.3,
    distance: 40.0,
    speed: 0.004,
    description: 'The outermost major planet, deep dark blue with the fastest supersonic winds in the solar system.',
    facts: [
      { label: 'Wind Speeds', value: 'Over 2,100 km/h' },
      { label: 'Moons', value: '16 Known Moons' },
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
  const [selectedPin, setSelectedPin] = useState<string | null>('Earth');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [gyroActive, setGyroActive] = useState<boolean>(false);

  // Geometry Specific State
  const [selectedShape, setSelectedShape] = useState<'cube' | 'cylinder' | 'pyramid' | 'sphere'>('cube');
  const [netUnfoldAmount, setNetUnfoldAmount] = useState<number>(0);

  // Heart Specific State
  const [selectedHeartPart, setSelectedHeartPart] = useState<string>('Left Ventricle');

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
    heartMesh: any;
    geometryMesh: any;
    clock: any;
  } | null>(null);

  // Load Three.js dynamically via high-speed CDN (No bundle bloat / Zero npm install failures)
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

      // 1. Scene, Camera, Renderer
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x060e1c); // Midnight space navy

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

      // 2. Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambientLight);

      const sunLight = new THREE.PointLight(0xffffff, 2.0, 100);
      sunLight.position.set(0, 0, 0);
      scene.add(sunLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
      dirLight.position.set(20, 30, 20);
      scene.add(dirLight);

      // 3. Cosmic Starfield Background
      const starGeometry = new THREE.BufferGeometry();
      const starCount = 1200;
      const starPositions = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount * 3; i += 3) {
        starPositions[i] = (Math.random() - 0.5) * 200;
        starPositions[i + 1] = (Math.random() - 0.5) * 200;
        starPositions[i + 2] = (Math.random() - 0.5) * 200;
      }
      starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7, transparent: true, opacity: 0.8 });
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
        heartMesh: null,
        geometryMesh: null,
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
    };
  }, []);

  // Build the 3D scene based on active module
  const buildActiveScene = useCallback(() => {
    const state = threeStateRef.current;
    if (!state) return;
    const { THREE, scene, camera } = state;

    // Clear previous module items (keep lights and stars)
    state.orbitMeshes.forEach((item) => {
      scene.remove(item.mesh);
      if (item.orbitLine) scene.remove(item.orbitLine);
    });
    state.orbitMeshes = [];

    if (state.heartMesh) {
      scene.remove(state.heartMesh);
      state.heartMesh = null;
    }

    if (state.geometryMesh) {
      scene.remove(state.geometryMesh);
      state.geometryMesh = null;
    }

    // Reset camera position based on module
    if (activeModule === 'solar-system') {
      camera.position.set(0, 22, 42);
      camera.lookAt(0, 0, 0);

      // Build Sun and Planets
      PLANETS.forEach((p) => {
        const geo = new THREE.SphereGeometry(p.size, 32, 32);
        let mat;
        if (p.name === 'Sun') {
          mat = new THREE.MeshBasicMaterial({ color: p.color });
        } else {
          mat = new THREE.MeshStandardMaterial({
            color: p.color,
            roughness: 0.5,
            metalness: 0.1,
          });
        }

        const mesh = new THREE.Mesh(geo, mat);
        mesh.userData = { planetData: p };

        let orbitLine = null;
        if (p.distance > 0) {
          // Circular orbit trajectory line
          const orbitGeo = new THREE.BufferGeometry();
          const points = [];
          for (let a = 0; a <= Math.PI * 2; a += 0.05) {
            points.push(new THREE.Vector3(Math.cos(a) * p.distance, 0, Math.sin(a) * p.distance));
          }
          orbitGeo.setFromPoints(points);
          const orbitMat = new THREE.LineBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.4 });
          orbitLine = new THREE.Line(orbitGeo, orbitMat);
          scene.add(orbitLine);
        }

        // Saturn Rings
        if (p.hasRings) {
          const ringGeo = new THREE.RingGeometry(2.4, 4.0, 32);
          const ringMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
          const ringMesh = new THREE.Mesh(ringGeo, ringMat);
          ringMesh.rotation.x = Math.PI / 2.3;
          mesh.add(ringMesh);
        }

        scene.add(mesh);
        state.orbitMeshes.push({ mesh, orbitLine, data: p, angle: Math.random() * Math.PI * 2 });
      });
    } else if (activeModule === 'human-heart') {
      camera.position.set(0, 2, 12);
      camera.lookAt(0, 0, 0);

      // Anatomical Beating Heart Group
      const heartGroup = new THREE.Group();

      // Main Left/Right Ventricle Body
      const bodyGeo = new THREE.SphereGeometry(2.4, 32, 32);
      bodyGeo.scale(1.0, 1.35, 0.9);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0xbe123c, // Rich cardiac muscle red
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
      const venaMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.3 }); // Blue deoxygenated blood
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
    } else if (activeModule === 'geometry-volume') {
      camera.position.set(0, 4, 11);
      camera.lookAt(0, 0, 0);

      const group = new THREE.Group();
      let geo;
      if (selectedShape === 'cube') {
        geo = new THREE.BoxGeometry(3.2, 3.2, 3.2);
      } else if (selectedShape === 'cylinder') {
        geo = new THREE.CylinderGeometry(1.8, 1.8, 3.5, 32);
      } else if (selectedShape === 'pyramid') {
        geo = new THREE.ConeGeometry(2.4, 3.6, 4);
      } else {
        geo = new THREE.SphereGeometry(2.2, 32, 32);
      }

      const mat = new THREE.MeshStandardMaterial({
        color: 0x2563eb,
        roughness: 0.2,
        metalness: 0.2,
        wireframe: false,
      });

      const mesh = new THREE.Mesh(geo, mat);

      // Wireframe outline edges for classroom clarity
      const edges = new THREE.EdgesGeometry(geo);
      const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xfacc15, linewidth: 2 }));
      mesh.add(line);

      group.add(mesh);
      scene.add(group);
      state.geometryMesh = group;
    } else if (activeModule === 'earth-volcano') {
      camera.position.set(0, 4, 14);
      camera.lookAt(0, 0, 0);

      const earthGroup = new THREE.Group();

      // Cutaway Earth Sphere showing Core
      const outerGeo = new THREE.SphereGeometry(3.6, 32, 32, 0, Math.PI * 1.5);
      const outerMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.6 }); // Crust & Oceans
      const outer = new THREE.Mesh(outerGeo, outerMat);
      earthGroup.add(outer);

      // Mantle layer (Orange)
      const mantleGeo = new THREE.SphereGeometry(2.7, 32, 32, 0, Math.PI * 1.5);
      const mantleMat = new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.4 });
      const mantle = new THREE.Mesh(mantleGeo, mantleMat);
      earthGroup.add(mantle);

      // Inner Glowing Core (Yellow/White hot)
      const coreGeo = new THREE.SphereGeometry(1.3, 32, 32);
      const coreMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
      const core = new THREE.Mesh(coreGeo, coreMat);
      earthGroup.add(core);

      scene.add(earthGroup);
      state.geometryMesh = earthGroup;
    }
  }, [activeModule, selectedShape]);

  // Handle module change
  useEffect(() => {
    buildActiveScene();
  }, [activeModule, buildActiveScene]);

  // Main 60FPS Animation Loop
  const startAnimationLoop = useCallback(() => {
    const animate = () => {
      const state = threeStateRef.current;
      if (!state) return;
      const { renderer, scene, camera, clock } = state;
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Camera Orbit Controls
      const c = state.controls;
      if (displayMode === 'desktop') {
        const radius = c.zoom;
        camera.position.x = radius * Math.sin(c.rotY) * Math.cos(c.rotX);
        camera.position.y = radius * Math.sin(c.rotX);
        camera.position.z = radius * Math.cos(c.rotY) * Math.cos(c.rotX);
        camera.lookAt(0, 0, 0);
      }

      // Animate Active Module Objects
      if (activeModule === 'solar-system' && isPlaying) {
        state.orbitMeshes.forEach((item) => {
          if (item.data.distance > 0) {
            item.angle += item.data.speed * 0.4;
            item.mesh.position.x = Math.cos(item.angle) * item.data.distance;
            item.mesh.position.z = Math.sin(item.angle) * item.data.distance;
          }
          item.mesh.rotation.y += 0.01;
        });
      } else if (activeModule === 'human-heart' && isPlaying && state.heartMesh) {
        // Anatomical Heartbeat Systole & Diastole Pulsation
        const beat = 1 + Math.sin(time * 5.0) * 0.08 + (Math.sin(time * 10.0) > 0.8 ? 0.05 : 0);
        state.heartMesh.scale.set(beat, beat, beat);
        state.heartMesh.rotation.y += 0.005;
      } else if (activeModule === 'geometry-volume' && isPlaying && state.geometryMesh) {
        state.geometryMesh.rotation.y += 0.008;
        state.geometryMesh.rotation.x += 0.004;
      } else if (activeModule === 'earth-volcano' && state.geometryMesh) {
        state.geometryMesh.rotation.y += 0.004;
      }

      renderer.render(scene, camera);
      animFrameIdRef.current = requestAnimationFrame(animate);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);
  }, [activeModule, displayMode, isPlaying]);

  // Touch and Mouse Orbit Controls
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

  // Device Gyroscope Support ("Magic Window Mode" on iPads & Phones)
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

  // Reset Camera View
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

  const activePlanetInfo = PLANETS.find((p) => p.name === selectedPin) || PLANETS[3];

  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative flex flex-col bg-slate-950 select-none overflow-hidden font-sans ${
        isFullscreen ? 'fixed inset-0 z-50' : ''
      }`}
    >
      {/* ============================================================
          TOP HEADER: MODULE SELECTOR & DISPLAY MODE SWITCHERS
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
              onClick={() => setActiveModule(tab.id as VRModuleId)}
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

        {/* Device Modes: Laptop 3D / Gyroscope / Split Cardboard VR */}
        <div className="flex items-center gap-1 shrink-0 ml-2">
          {/* Gyroscope Magic Window (Tablets / Mobile) */}
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
          MAIN 3D WEBGL STAGE (DUAL EYE SPLIT IF CARDBOARD MODE ACTIVE)
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

        {/* On-Screen Touch / Mouse Controls Guidance */}
        <div className="absolute bottom-3 left-3 z-20 pointer-events-none">
          <div className="bg-slate-900/80 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-xl text-[10px] font-bold text-white/80 flex items-center gap-2 shadow-lg">
            <Compass className="w-3.5 h-3.5 text-yellow animate-spin" />
            <span>Drag to Orbit 360° • Scroll to Zoom</span>
          </div>
        </div>

        {/* ============================================================
            MODULE SPECIFIC OVERLAYS & FACT CARDS
            ============================================================ */}

        {/* 1. SOLAR SYSTEM PLANET CAROUSEL & FACT CARD */}
        {activeModule === 'solar-system' && (
          <>
            {/* Bottom Planet Fast-Travel Carousel */}
            <div className="absolute bottom-3 right-3 left-3 sm:left-auto z-20 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur border border-white/20 p-1.5 rounded-2xl overflow-x-auto max-w-full sm:max-w-xl">
              {PLANETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => setSelectedPin(p.name)}
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
                  <button
                    onClick={() => setSelectedPin(null)}
                    className="h-6 w-6 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs font-black"
                  >
                    ✕
                  </button>
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

        {/* 2. HUMAN HEART ANATOMY CONTROLS & INSPECTION */}
        {activeModule === 'human-heart' && (
          <aside className="absolute top-3 right-3 z-20 w-72 sm:w-80 bg-slate-900/95 backdrop-blur-md border-2 border-white/20 rounded-2xl p-4 text-white shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500 animate-pulse" />
                <h3 className="font-black text-sm uppercase text-rose-400">Human Cardiac Anatomy</h3>
              </div>
            </div>

            <p className="text-xs text-white/80 font-medium leading-relaxed mb-3">
              The human heart pumps 5 liters of blood every minute, delivering oxygen and vital nutrients to every cell in the body.
            </p>

            <div className="space-y-1.5 mb-3">
              <div className="text-[10px] font-black uppercase tracking-wider text-white/60">Anatomical Chambers:</div>
              {[
                { name: 'Left Ventricle', desc: 'Pumps oxygen-rich blood into the aorta and entire body.' },
                { name: 'Aorta Arch', desc: 'The largest artery carrying fresh oxygenated blood.' },
                { name: 'Vena Cava', desc: 'Brings deoxygenated blood back from body to heart.' },
                { name: 'Pulmonary Artery', desc: 'Carries blood to lungs to receive fresh oxygen.' },
              ].map((part) => (
                <button
                  key={part.name}
                  onClick={() => setSelectedHeartPart(part.name)}
                  className={`w-full text-left p-2 rounded-xl border text-xs transition-all ${
                    selectedHeartPart === part.name
                      ? 'bg-rose-500/20 border-rose-400 text-rose-300 font-black'
                      : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                  }`}
                >
                  <div className="font-black">{part.name}</div>
                  <div className="text-[10px] text-white/60 font-medium">{part.desc}</div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-white/10 text-xs font-black">
              <span>Cardiac Pumping:</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> 72 BPM
              </span>
            </div>
          </aside>
        )}

        {/* 3. 3D GEOMETRY & VOLUME CALCULATOR */}
        {activeModule === 'geometry-volume' && (
          <aside className="absolute top-3 right-3 z-20 w-72 sm:w-80 bg-slate-900/95 backdrop-blur-md border-2 border-white/20 rounded-2xl p-4 text-white shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-yellow" />
                <h3 className="font-black text-sm uppercase text-yellow">3D Geometry & Volume</h3>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-1 mb-3">
              {(['cube', 'cylinder', 'pyramid', 'sphere'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedShape(s)}
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

            <div className="space-y-2 bg-white/10 p-3 rounded-xl mb-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">Shape:</span>
                <span className="font-black capitalize text-white">{selectedShape}</span>
              </div>
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

            <div className="p-2.5 rounded-xl bg-blue-950/60 border border-blue-400/30 text-xs text-blue-200">
              💡 <strong>Classroom Tip:</strong> Rotate the model to count the 3D faces, vertices, and edges!
            </div>
          </aside>
        )}

        {/* 4. EARTH LAYERS & VOLCANO CROSS-SECTION */}
        {activeModule === 'earth-volcano' && (
          <aside className="absolute top-3 right-3 z-20 w-72 sm:w-80 bg-slate-900/95 backdrop-blur-md border-2 border-white/20 rounded-2xl p-4 text-white shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500 animate-bounce" />
                <h3 className="font-black text-sm uppercase text-amber-400">Earth Layers & Volcano</h3>
              </div>
            </div>

            <p className="text-xs text-white/80 font-medium leading-relaxed mb-3">
              Inspect the cross-section of Planet Earth: from the fragile surface crust down to the scorching 6,000°C solid iron inner core.
            </p>

            <div className="space-y-1.5 mb-2">
              {[
                { layer: 'Crust', color: '#0284c7', depth: '0 - 70 km', desc: 'Solid rock surface where we live.' },
                { layer: 'Mantle', color: '#ea580c', depth: '70 - 2,890 km', desc: 'Semi-molten magma rock with convection.' },
                { layer: 'Outer Core', color: '#f59e0b', depth: '2,890 - 5,150 km', desc: 'Liquid iron and nickel creating magnetic shield.' },
                { layer: 'Inner Core', color: '#fef08a', depth: '5,150 - 6,370 km', desc: 'Solid iron ball hotter than the surface of the Sun!' },
              ].map((l) => (
                <div key={l.layer} className="p-2 rounded-xl bg-white/10 border border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: l.color }} />
                    <div>
                      <div className="font-black text-white">{l.layer}</div>
                      <div className="text-[10px] text-white/50">{l.desc}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-white/60 shrink-0">{l.depth}</span>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
