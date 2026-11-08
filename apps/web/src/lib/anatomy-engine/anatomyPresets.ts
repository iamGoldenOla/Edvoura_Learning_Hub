export interface AnatomyControl {
  id: string;
  name: string;
  type: 'slider' | 'toggle' | 'trigger';
  min?: number;
  max?: number;
  step?: number;
  default: number | boolean;
  unit?: string;
  label?: string;
}

export interface AnatomyMachinePreset {
  id: string;
  title: string;
  discipline: 'Computer Science' | 'Physics & Thermodynamics' | 'Data Structures' | 'Cybersecurity' | 'Electronics';
  curriculumStandard: 'WAEC / JAMB' | 'Cambridge IGCSE & A-Level' | 'US AP & College Board';
  metaphor: string;
  abstractConcept: string;
  summary: string;
  controls: AnatomyControl[];
  explanation: {
    physicalMechanism: string;
    computingParallel: string;
    examApplication: string;
  };
  drawMachine: (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    t: number,
    state: Record<string, number | boolean>
  ) => void;
}

export const ANATOMY_PRESETS: AnatomyMachinePreset[] = [
  // 1. TOKEN-BUCKET RATE LIMITER (BRASS WATER TOWER)
  {
    id: 'token-bucket',
    title: 'Token-Bucket Rate Limiter (Brass Water Tower)',
    discipline: 'Computer Science',
    curriculumStandard: 'Cambridge IGCSE & A-Level',
    metaphor: 'A physical brass reservoir with dripping tokens and a float-valve capacity threshold.',
    abstractConcept: 'API Rate Limiting & Network Queue Throttling (Leaky Bucket / Token Bucket Algorithm).',
    summary: 'See how servers and APIs withstand sudden traffic spikes by collecting tokens at a steady rate and dropping packets when the physical bucket overflows.',
    controls: [
      { id: 'refillRate', name: 'Refill Rate (Tokens/sec)', type: 'slider', min: 1, max: 10, step: 1, default: 4, unit: 't/s' },
      { id: 'burstTrigger', name: 'Send Traffic Burst (5 Requests)', type: 'trigger', default: false, label: 'Trigger Burst' },
      { id: 'leakSpeed', name: 'Drain Valve Leak Speed', type: 'slider', min: 1, max: 8, step: 1, default: 3, unit: 'req/s' },
    ],
    explanation: {
      physicalMechanism: 'Tokens drip into a cylindrical brass cistern from an overhead supply pipe at a constant rate. Requests drain tokens from the bottom spigot. If requests arrive too fast and empty the cistern, further requests are blocked by the float valve.',
      computingParallel: 'Used in Cloudflare, Stripe, and AWS to prevent DDoS attacks and server overloads by guaranteeing a bounded maximum request rate with brief allowable bursts.',
      examApplication: 'Common in Cambridge A-Level Computer Science (9618) Paper 3 on Network Protocol Queuing and Operating System Schedulers.',
    },
    drawMachine: (ctx, width, height, t, state) => {
      const centerX = width * 0.45;
      const centerY = height * 0.52;
      const bucketW = 160;
      const bucketH = 220;

      // Machine Title & Subtitle
      ctx.fillStyle = '#060E1C';
      ctx.font = 'black 14px sans-serif';
      ctx.fillText('BRASS-AND-GLASS HYDRAULIC RATE LIMITER', 30, 35);
      ctx.fillStyle = '#64748B';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('Token Buffer Capacity: 10 Tokens Max', 30, 52);

      // Supply Pipe (Top Left)
      ctx.fillStyle = '#D97706';
      ctx.strokeStyle = '#060E1C';
      ctx.lineWidth = 3;
      ctx.fillRect(centerX - 40, 70, 80, 40);
      ctx.strokeRect(centerX - 40, 70, 80, 40);

      // Dripping Token Stream
      const dripCycle = (t * 5) % 1;
      ctx.fillStyle = '#F5C518';
      ctx.strokeStyle = '#060E1C';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) {
        const dropY = 115 + ((dripCycle + i * 0.33) % 1) * 60;
        ctx.beginPath();
        ctx.arc(centerX, dropY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // Glass Cylinder with Brass Rim
      ctx.fillStyle = 'rgba(240, 249, 255, 0.6)';
      ctx.strokeStyle = '#060E1C';
      ctx.lineWidth = 4;
      ctx.fillRect(centerX - bucketW / 2, centerY - bucketH / 2, bucketW, bucketH);
      ctx.strokeRect(centerX - bucketW / 2, centerY - bucketH / 2, bucketW, bucketH);

      // Water / Token Level (Simulated fill)
      const fillRatio = 0.55 + Math.sin(t * Math.PI * 2) * 0.25;
      const waterHeight = bucketH * fillRatio;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.fillRect(
        centerX - bucketW / 2 + 3,
        centerY + bucketH / 2 - waterHeight,
        bucketW - 6,
        waterHeight
      );

      // Floating Token Coins inside Cylinder
      const tokenCount = Math.round(fillRatio * 10);
      for (let k = 0; k < tokenCount; k++) {
        const coinY = centerY + bucketH / 2 - 15 - k * 18;
        ctx.fillStyle = '#F5C518';
        ctx.strokeStyle = '#060E1C';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(centerX, coinY, 28, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // Bottom Exit Valve & Request Discharge
      ctx.fillStyle = '#D97706';
      ctx.fillRect(centerX - 25, centerY + bucketH / 2, 50, 45);
      ctx.strokeRect(centerX - 25, centerY + bucketH / 2, 50, 45);

      // Mechanical Lever Handle
      const leverAngle = Math.sin(t * Math.PI * 4) * 0.3;
      ctx.save();
      ctx.translate(centerX + bucketW / 2 + 10, centerY);
      ctx.rotate(leverAngle);
      ctx.fillStyle = '#DC2626';
      ctx.strokeStyle = '#060E1C';
      ctx.lineWidth = 3;
      ctx.fillRect(0, -6, 55, 12);
      ctx.strokeRect(0, -6, 55, 12);
      ctx.beginPath();
      ctx.arc(55, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Readout HUD on Right
      const hudX = width * 0.72;
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#060E1C';
      ctx.lineWidth = 2.5;
      ctx.fillRect(hudX, 80, width * 0.24, 180);
      ctx.strokeRect(hudX, 80, width * 0.24, 180);

      ctx.fillStyle = '#060E1C';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('MECHANICAL METRICS', hudX + 15, 105);
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#16A34A';
      ctx.fillText(`Tokens Available: ${tokenCount} / 10`, hudX + 15, 135);
      ctx.fillStyle = '#0284C7';
      ctx.fillText(`Refill Speed: ${state.refillRate ?? 4} tok/s`, hudX + 15, 160);
      ctx.fillStyle = '#D97706';
      ctx.fillText(`Drain Status: Flowing`, hudX + 15, 185);
      ctx.fillStyle = tokenCount > 0 ? '#16A34A' : '#DC2626';
      ctx.fillText(tokenCount > 0 ? '✓ Requests Allowed (200 OK)' : '⚠ Throttled (429 Too Many)', hudX + 15, 220);
    },
  },

  // 2. CPU CACHE & MEMORY CONVEYOR
  {
    id: 'cpu-cache',
    title: 'CPU Cache Hierarchy (Pneumatic Sorting Drawers)',
    discipline: 'Computer Science',
    curriculumStandard: 'Cambridge IGCSE & A-Level',
    metaphor: 'A 3-tier mechanical sorting arm fetching data blocks from high-speed drawers vs. deep warehouse silos.',
    abstractConcept: 'Memory Hierarchy: L1 Cache (1ns) vs. L2 Cache (4ns) vs. Main RAM (100ns).',
    summary: 'Understand why modern computers are fast: L1 cache sits right next to the ALU like an arm-reach desk drawer, avoiding slow trips down to warehouse RAM.',
    controls: [
      { id: 'cacheHitChance', name: 'Cache Hit Probability', type: 'slider', min: 50, max: 95, step: 5, default: 85, unit: '%' },
      { id: 'cycleSpeed', name: 'Clock Cycle Speed', type: 'slider', min: 1, max: 4, step: 1, default: 2, unit: 'GHz' },
    ],
    explanation: {
      physicalMechanism: 'A mechanical grabber arm sweeps first to the top small drawer (L1). If present (Cache Hit), it immediately retrieves the data block. If absent (Cache Miss), the arm extends down to the larger L2 shelf and finally to the massive subterranean RAM silo.',
      computingParallel: 'The principle of Spatial and Temporal Locality in modern microprocessor design (Intel/ARM architecture).',
      examApplication: 'Standard curriculum in WAEC Computer Studies & Cambridge A-Level (9618 Paper 1: Processor Architecture).',
    },
    drawMachine: (ctx, width, height, t, state) => {
      const startX = width * 0.15;
      const startY = height * 0.28;

      ctx.fillStyle = '#060E1C';
      ctx.font = 'black 14px sans-serif';
      ctx.fillText('PNEUMATIC MULTI-TIER CACHE ARCHITECTURE', 30, 35);

      // CPU Core (Left)
      ctx.fillStyle = '#F5C518';
      ctx.strokeStyle = '#060E1C';
      ctx.lineWidth = 3;
      ctx.fillRect(startX, startY, 90, 160);
      ctx.strokeRect(startX, startY, 90, 160);

      ctx.fillStyle = '#060E1C';
      ctx.font = 'black 12px sans-serif';
      ctx.fillText('CPU CORE', startX + 12, startY + 30);
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('(ALU / Reg)', startX + 15, startY + 50);

      // 3 Tiers of Storage (Drawers)
      const tiers = [
        { label: 'L1 CACHE (Desk Drawer)', speed: '~1 ns (Instant)', color: '#22C55E', w: 140, h: 42, y: startY },
        { label: 'L2 CACHE (Filing Cabinet)', speed: '~4 ns (Fast)', color: '#3B82F6', w: 170, h: 48, y: startY + 58 },
        { label: 'MAIN RAM (Warehouse Silo)', speed: '~100 ns (Slow)', color: '#94A3B8', w: 210, h: 54, y: startY + 120 },
      ];

      const tierX = startX + 150;

      tiers.forEach((tier) => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.strokeStyle = '#060E1C';
        ctx.lineWidth = 2.5;
        ctx.fillRect(tierX, tier.y, tier.w, tier.h);
        ctx.strokeRect(tierX, tier.y, tier.w, tier.h);

        // Indicator pill
        ctx.fillStyle = tier.color;
        ctx.fillRect(tierX + 6, tier.y + 6, 8, tier.h - 12);

        ctx.fillStyle = '#060E1C';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(tier.label, tierX + 20, tier.y + 20);
        ctx.font = 'bold 9px sans-serif';
        ctx.fillStyle = '#64748B';
        ctx.fillText(tier.speed, tierX + 20, tier.y + 34);
      });

      // Animated Grabber Arm
      const armProgress = (t * 3) % 1;
      const isL1Hit = Number(state.cacheHitChance ?? 85) > 60;
      const targetY = isL1Hit ? startY + 20 : startY + 140;

      ctx.strokeStyle = '#DC2626';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(startX + 90, startY + 80);
      ctx.lineTo(startX + 140, targetY);
      ctx.stroke();

      // Grabber Head
      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.arc(startX + 140, targetY, 7, 0, Math.PI * 2);
      ctx.fill();

      // Readout Status
      const hudX = width * 0.72;
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#060E1C';
      ctx.lineWidth = 2.5;
      ctx.fillRect(hudX, 80, width * 0.24, 180);
      ctx.strokeRect(hudX, 80, width * 0.24, 180);

      ctx.fillStyle = '#060E1C';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('CACHE PERFORMANCE', hudX + 15, 105);
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#16A34A';
      ctx.fillText(`Hit Ratio: ${state.cacheHitChance ?? 85}%`, hudX + 15, 135);
      ctx.fillStyle = '#2563EB';
      ctx.fillText(`Current: ${isL1Hit ? 'L1 Cache HIT!' : 'Cache MISS (Fetch RAM)'}`, hudX + 15, 160);
      ctx.fillStyle = '#64748B';
      ctx.fillText(`Latency: ${isL1Hit ? '1 Cycle' : '100+ Cycles'}`, hudX + 15, 185);
      ctx.fillStyle = '#060E1C';
      ctx.fillText(`Clock: ${state.cycleSpeed ?? 2} GHz`, hudX + 15, 215);
    },
  },

  // 3. CARNOT HEAT ENGINE & PISTON
  {
    id: 'carnot-engine',
    title: 'Carnot Heat Engine & Piston (Thermodynamics)',
    discipline: 'Physics & Thermodynamics',
    curriculumStandard: 'WAEC / JAMB',
    metaphor: 'A heavy brass reciprocating piston with burner heat source, cooling sink, and indicator gauge.',
    abstractConcept: 'The 4-Stroke Carnot Cycle (Isothermal Expansion, Adiabatic Expansion, Isothermal Compression, Adiabatic Compression).',
    summary: 'The ultimate theoretical heat engine: watch heat flow from the high-temperature reservoir Th to push the piston and perform work W.',
    controls: [
      { id: 'tempHot', name: 'Hot Reservoir Th (Kelvin)', type: 'slider', min: 400, max: 900, step: 50, default: 600, unit: 'K' },
      { id: 'tempCold', name: 'Cold Sink Tc (Kelvin)', type: 'slider', min: 200, max: 350, step: 25, default: 300, unit: 'K' },
    ],
    explanation: {
      physicalMechanism: 'Gas inside the cylinder expands when placed on the hot reservoir, pushing the piston rod outward and rotating the flywheel. Cooling the cylinder on the cold sink allows the piston to compress the gas with less work than it produced.',
      computingParallel: 'Also models computational energy efficiency and thermal throttling in high-performance GPU/CPU silicon.',
      examApplication: 'Tested heavily in WAEC Physics Paper 2 (Thermodynamics & Heat Capacity) and JAMB UTME Physics.',
    },
    drawMachine: (ctx, width, height, t, state) => {
      const centerX = width * 0.38;
      const centerY = height * 0.5;
      const cylW = 140;
      const cylH = 190;

      ctx.fillStyle = '#060E1C';
      ctx.font = 'black 14px sans-serif';
      ctx.fillText('RECIPROCATING CARNOT HEAT CYLINDER', 30, 35);

      // Cylinder Walls (Heavy Dark Metal)
      ctx.fillStyle = 'rgba(241, 245, 249, 0.8)';
      ctx.strokeStyle = '#060E1C';
      ctx.lineWidth = 4;
      ctx.fillRect(centerX - cylW / 2, centerY - cylH / 2, cylW, cylH);
      ctx.strokeRect(centerX - cylW / 2, centerY - cylH / 2, cylW, cylH);

      // Piston Motion (Up and Down)
      const stroke = (Math.sin(t * Math.PI * 2) + 1) * 0.5; // 0 to 1
      const pistonY = centerY - cylH / 2 + 30 + stroke * 90;

      // Gas Pressure Gradient inside cylinder
      const gasHeatColor = stroke < 0.5 ? 'rgba(239, 68, 68, 0.45)' : 'rgba(59, 130, 246, 0.35)';
      ctx.fillStyle = gasHeatColor;
      ctx.fillRect(centerX - cylW / 2 + 4, pistonY + 16, cylW - 8, (centerY + cylH / 2) - (pistonY + 16));

      // Piston Head
      ctx.fillStyle = '#F5C518';
      ctx.strokeStyle = '#060E1C';
      ctx.lineWidth = 3;
      ctx.fillRect(centerX - cylW / 2 + 2, pistonY, cylW - 4, 18);
      ctx.strokeRect(centerX - cylW / 2 + 2, pistonY, cylW - 4, 18);

      // Piston Connecting Rod
      ctx.fillStyle = '#060E1C';
      ctx.fillRect(centerX - 8, pistonY - 70, 16, 70);

      // Flywheel (Right side)
      const wheelX = centerX + 180;
      const wheelY = centerY - 60;
      const wheelRadius = 55;
      ctx.strokeStyle = '#060E1C';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(wheelX, wheelY, wheelRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Rotating Flywheel Spokes
      const wheelAngle = t * Math.PI * 2;
      ctx.save();
      ctx.translate(wheelX, wheelY);
      ctx.rotate(wheelAngle);
      for (let s = 0; s < 4; s++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos((s * Math.PI) / 2) * wheelRadius, Math.sin((s * Math.PI) / 2) * wheelRadius);
        ctx.stroke();
      }
      ctx.restore();

      // Heat Source Burner (Bottom)
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(centerX - 40, centerY + cylH / 2 + 5, 80, 20);
      ctx.strokeRect(centerX - 40, centerY + cylH / 2 + 5, 80, 20);

      // Flame Particles
      ctx.fillStyle = '#F59E0B';
      for (let f = 0; f < 5; f++) {
        const flameY = centerY + cylH / 2 - Math.sin(t * 10 + f) * 8;
        ctx.beginPath();
        ctx.arc(centerX - 30 + f * 15, flameY, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Efficiency calculation: \eta = 1 - Tc / Th
      const th = Number(state.tempHot ?? 600);
      const tc = Number(state.tempCold ?? 300);
      const efficiency = ((1 - tc / th) * 100).toFixed(1);

      // HUD
      const hudX = width * 0.72;
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#060E1C';
      ctx.lineWidth = 2.5;
      ctx.fillRect(hudX, 80, width * 0.24, 180);
      ctx.strokeRect(hudX, 80, width * 0.24, 180);

      ctx.fillStyle = '#060E1C';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('THERMODYNAMIC READOUT', hudX + 15, 105);
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#DC2626';
      ctx.fillText(`Hot Source (Th): ${th} K`, hudX + 15, 135);
      ctx.fillStyle = '#2563EB';
      ctx.fillText(`Cold Sink (Tc): ${tc} K`, hudX + 15, 160);
      ctx.fillStyle = '#16A34A';
      ctx.fillText(`Carnot Efficiency: ${efficiency}%`, hudX + 15, 190);
      ctx.fillStyle = '#64748B';
      ctx.fillText(`Cycle State: ${stroke < 0.5 ? 'Expansion (Work Out)' : 'Compression (Reset)'}`, hudX + 15, 220);
    },
  },

  // 4. BINARY SEARCH TREE MARBLE RUN
  {
    id: 'bst-marble-run',
    title: 'Binary Search Tree (Gravity Marble Sorter)',
    discipline: 'Data Structures',
    curriculumStandard: 'US AP & College Board',
    metaphor: 'A physical wooden marble-run track where balls drop down mechanical left/right decision gates based on comparison.',
    abstractConcept: 'Logarithmic O(log n) Search and Tree Traversal algorithms.',
    summary: 'Drop numbered balls through comparison switches. Each gate tilts left if the number is smaller and right if larger, cutting the search space in half at every level.',
    controls: [
      { id: 'searchTarget', name: 'Search Number', type: 'slider', min: 1, max: 99, step: 1, default: 42 },
      { id: 'dropBall', name: 'Drop New Ball', type: 'trigger', default: false, label: 'Drop Marble' },
    ],
    explanation: {
      physicalMechanism: 'A marble with a stamped number rolls into a balance scale at each junction. If the ball is lighter than the node threshold, the rocker arms tilt left; if heavier, they tilt right, guiding the marble down the correct chute.',
      computingParallel: 'Exact visualization of Binary Search Trees (BST), AVL self-balancing trees, and divide-and-conquer search algorithms.',
      examApplication: 'Crucial for AP Computer Science A, Cambridge A-Level 9618, and university entrance coding interviews.',
    },
    drawMachine: (ctx, width, height, t, state) => {
      const topX = width * 0.42;
      const topY = 90;

      ctx.fillStyle = '#060E1C';
      ctx.font = 'black 14px sans-serif';
      ctx.fillText('LOGARITHMIC MARBLE SORTING CHUTES', 30, 35);

      // Draw Tree Branches
      const drawNode = (x: number, y: number, val: number, level: number) => {
        // Node Circle
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#060E1C';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(x, y, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#060E1C';
        ctx.font = 'black 11px sans-serif';
        ctx.fillText(String(val), x - 8, y + 4);

        if (level < 3) {
          const spread = 120 / level;
          const nextY = y + 70;

          // Left branch
          ctx.strokeStyle = '#64748B';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x - 12, y + 12);
          ctx.lineTo(x - spread, nextY - 18);
          ctx.stroke();
          drawNode(x - spread, nextY, Math.round(val - 20 / level), level + 1);

          // Right branch
          ctx.beginPath();
          ctx.moveTo(x + 12, y + 12);
          ctx.lineTo(x + spread, nextY - 18);
          ctx.stroke();
          drawNode(x + spread, nextY, Math.round(val + 20 / level), level + 1);
        }
      };

      drawNode(topX, topY, 50, 1);

      // Rolling Marble on Path
      const marbleProgress = (t * 2) % 1;
      const currentTarget = Number(state.searchTarget ?? 42);
      // Path depends on target compared to 50
      const goesLeft = currentTarget < 50;
      const marbleX = topX + (goesLeft ? -1 : 1) * marbleProgress * 120;
      const marbleY = topY + marbleProgress * 70;

      ctx.fillStyle = '#DC2626';
      ctx.strokeStyle = '#060E1C';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(marbleX, marbleY, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // HUD
      const hudX = width * 0.72;
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#060E1C';
      ctx.lineWidth = 2.5;
      ctx.fillRect(hudX, 80, width * 0.24, 180);
      ctx.strokeRect(hudX, 80, width * 0.24, 180);

      ctx.fillStyle = '#060E1C';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('BST SEARCH STATS', hudX + 15, 105);
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#DC2626';
      ctx.fillText(`Active Value: ${currentTarget}`, hudX + 15, 135);
      ctx.fillStyle = '#16A34A';
      ctx.fillText(`Comparison: ${currentTarget} ${goesLeft ? '< 50 (Go Left)' : '≥ 50 (Go Right)'}`, hudX + 15, 160);
      ctx.fillStyle = '#D97706';
      ctx.fillText('Complexity: O(log n)', hudX + 15, 185);
      ctx.fillStyle = '#64748B';
      ctx.fillText('Levels Evaluated: 3 max', hudX + 15, 215);
    },
  },
];
