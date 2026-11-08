export interface MathSceneParameter {
  id: string;
  name: string;
  min: number;
  max: number;
  step: number;
  default: number;
  unit?: string;
}

export interface MathScenePreset {
  id: string;
  title: string;
  category: 'Elementary (Grades 1-6)' | 'Geometry' | 'Trigonometry' | 'Calculus' | 'Algebra' | 'Linear Algebra' | 'Physics';
  difficulty: 'Grade 1-3' | 'Grade 4-6' | 'Elementary' | 'Junior Secondary' | 'Senior Secondary' | 'Advanced (A-Level / JAMB)';
  summary: string;
  formula: string;
  explanation: string[];
  parameters: MathSceneParameter[];
  manimgxCode: string;
  drawScene: (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    t: number, // normalized animation progress 0 -> 1
    params: Record<string, number>
  ) => void;
}

export const MANIMGX_PRESETS: MathScenePreset[] = [
  // ===== ELEMENTARY (GRADES 1 TO 6) PRESETS =====
  {
    id: 'fraction-pizza',
    title: 'Visual Fraction Pizza & Slices (Grades 2–5)',
    category: 'Elementary (Grades 1-6)',
    difficulty: 'Grade 1-3',
    summary: 'See how a whole pizza is sliced into equal parts. Slide the numbers to discover how fractions, decimals, and percentages work!',
    formula: '\\frac{\\text{Numerator (Slices Eaten)}}{\\text{Denominator (Total Slices)}}',
    explanation: [
      'The Denominator (bottom number) is how many equal slices the whole pizza is cut into.',
      'The Numerator (top number) tells us how many slices are selected or eaten.',
      'When the numerator equals the denominator (e.g. 4/4), you have the entire pizza (1 whole)!',
      'Try setting slices to 4, then selected to 2: notice that 2/4 is the exact same as 1/2 (half a pizza)!'
    ],
    parameters: [
      { id: 'denominator', name: 'Total Slices (Denominator)', min: 2, max: 12, step: 1, default: 4, unit: 'slices' },
      { id: 'numerator', name: 'Slices Eaten (Numerator)', min: 1, max: 12, step: 1, default: 3, unit: 'slices' },
    ],
    manimgxCode: `# Edvoura MathMotion - Fraction Pizza Visualizer`,
    drawScene: (ctx, width, height, t, params) => {
      const centerX = width * 0.45;
      const centerY = height * 0.5;
      const radius = Math.min(width, height) * 0.32;
      const denom = Math.max(2, Math.min(12, Math.round(params.denominator ?? 4)));
      const num = Math.max(1, Math.min(denom, Math.round(params.numerator ?? 3)));
      const sliceAngle = (Math.PI * 2) / denom;

      // Crust shadow
      ctx.fillStyle = '#E2E8F0';
      ctx.beginPath();
      ctx.arc(centerX + 6, centerY + 6, radius + 12, 0, Math.PI * 2);
      ctx.fill();

      // Crust
      ctx.fillStyle = '#D97706';
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 10, 0, Math.PI * 2);
      ctx.fill();

      // Cheese base
      ctx.fillStyle = '#FEF3C7';
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw each slice
      for (let i = 0; i < denom; i++) {
        const startAngle = i * sliceAngle - Math.PI / 2;
        const endAngle = startAngle + sliceAngle;
        const isSelected = i < num;

        ctx.save();
        if (isSelected) {
          const midAngle = startAngle + sliceAngle / 2;
          const pullDist = 14 + Math.sin(t * Math.PI * 2) * 4;
          ctx.translate(Math.cos(midAngle) * pullDist, Math.sin(midAngle) * pullDist);
          ctx.fillStyle = '#F59E0B';
        } else {
          ctx.fillStyle = '#FDE68A';
        }

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#B45309';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Pepperoni on slice
        const midAngle = startAngle + sliceAngle / 2;
        const pepDist = radius * 0.6;
        const pepX = centerX + Math.cos(midAngle) * pepDist;
        const pepY = centerY + Math.sin(midAngle) * pepDist;
        ctx.fillStyle = isSelected ? '#DC2626' : '#991B1B';
        ctx.beginPath();
        ctx.arc(pepX, pepY, radius * 0.09, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#7F1D1D';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();
      }

      // Info Card on the right
      const cardX = width * 0.82;
      ctx.fillStyle = '#060E1C';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${num} / ${denom}`, cardX, centerY - 35);

      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = '#D97706';
      ctx.fillText(`Numerator: ${num} (Selected)`, cardX, centerY + 12);
      ctx.fillStyle = '#475569';
      ctx.fillText(`Denominator: ${denom} (Total)`, cardX, centerY + 36);

      const percent = Math.round((num / denom) * 100);
      ctx.fillStyle = '#059669';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(`${percent}% of Pizza`, cardX, centerY + 75);
    },
  },

  {
    id: 'multiplication-grid',
    title: 'Visual Multiplication Array (Grades 2–5)',
    category: 'Elementary (Grades 1-6)',
    difficulty: 'Grade 1-3',
    summary: 'Multiplication is repeated addition! Watch rows and columns multiply into a visual array of glowing stars.',
    formula: '\\text{Rows} \\times \\text{Columns} = \\text{Total Stars}',
    explanation: [
      'Each row has the exact same number of stars as every other row.',
      'Instead of counting 1 by 1, you can multiply: Rows × Columns.',
      'Try setting Rows to 3 and Columns to 4: 4 + 4 + 4 = 12 stars!',
      'Multiplication is commutative: 3 × 4 gives the exact same total as 4 × 3.'
    ],
    parameters: [
      { id: 'rows', name: 'Number of Rows', min: 1, max: 10, step: 1, default: 4, unit: 'rows' },
      { id: 'cols', name: 'Stars per Row (Columns)', min: 1, max: 10, step: 1, default: 5, unit: 'cols' },
    ],
    manimgxCode: `# Edvoura MathMotion - Multiplication Array Visualizer`,
    drawScene: (ctx, width, height, t, params) => {
      const rows = Math.max(1, Math.min(10, Math.round(params.rows ?? 4)));
      const cols = Math.max(1, Math.min(10, Math.round(params.cols ?? 5)));
      const total = rows * cols;
      const startX = width * 0.10;
      const startY = height * 0.22;
      const cellWidth = Math.min((width * 0.52) / cols, (height * 0.65) / rows, 48);

      ctx.fillStyle = '#060E1C';
      ctx.font = '900 24px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${rows} rows of ${cols} stars = ${total} total`, startX, height * 0.12);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cx = startX + c * cellWidth + cellWidth / 2;
          const cy = startY + r * cellWidth + cellWidth / 2;
          const radius = cellWidth * 0.38;

          ctx.fillStyle = '#F5C518';
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#060E1C';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          ctx.fillStyle = '#060E1C';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${r * cols + c + 1}`, cx, cy);
        }
      }

      const cardX = width * 0.82;
      ctx.textAlign = 'center';
      ctx.font = '900 36px sans-serif';
      ctx.fillStyle = '#060E1C';
      ctx.fillText(`${rows} × ${cols} = ${total}`, cardX, height * 0.38);

      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = '#475569';
      const repeated = Array(rows).fill(cols).join(' + ');
      ctx.fillText('Repeated Addition:', cardX, height * 0.52);
      ctx.fillStyle = '#0284C7';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(`${repeated} = ${total}`, cardX, height * 0.60);
    },
  },

  {
    id: 'number-line-frog',
    title: 'Number Line & Frog Jumps (Grades 1–3)',
    category: 'Elementary (Grades 1-6)',
    difficulty: 'Grade 1-3',
    summary: 'Help the frog jump across the number line! Master addition, skip-counting, and times tables visually.',
    formula: '\\text{Jumps} \\times \\text{Jump Size} = \\text{Landing Spot}',
    explanation: [
      'The number line starts at 0 and counts up to 20.',
      'Each green arc represents one jump of equal length.',
      'Skip counting by 2s gives even numbers: 2, 4, 6, 8, 10...',
      'Skip counting by 5s teaches how to read clock minutes: 5, 10, 15, 20...'
    ],
    parameters: [
      { id: 'jumpSize', name: 'Jump Size (Distance)', min: 1, max: 5, step: 1, default: 3, unit: 'units' },
      { id: 'jumpCount', name: 'Number of Jumps', min: 1, max: 6, step: 1, default: 4, unit: 'jumps' },
    ],
    manimgxCode: `# Edvoura MathMotion - Number Line Frog Jumps`,
    drawScene: (ctx, width, height, t, params) => {
      const jumpSize = Math.max(1, Math.min(5, Math.round(params.jumpSize ?? 3)));
      const jumpCount = Math.max(1, Math.min(6, Math.round(params.jumpCount ?? 4)));
      const total = jumpSize * jumpCount;
      const maxMark = 20;
      const lineY = height * 0.65;
      const startX = width * 0.08;
      const endX = width * 0.92;
      const stepPx = (endX - startX) / maxMark;

      // Main line
      ctx.strokeStyle = '#060E1C';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(startX - 15, lineY);
      ctx.lineTo(endX + 15, lineY);
      ctx.stroke();

      // Arrow
      ctx.fillStyle = '#060E1C';
      ctx.beginPath();
      ctx.moveTo(endX + 22, lineY);
      ctx.lineTo(endX + 10, lineY - 8);
      ctx.lineTo(endX + 10, lineY + 8);
      ctx.fill();

      // Tick marks
      for (let i = 0; i <= maxMark; i++) {
        const x = startX + i * stepPx;
        const isJumpTarget = i > 0 && i <= total && i % jumpSize === 0;

        ctx.strokeStyle = isJumpTarget ? '#059669' : '#94A3B8';
        ctx.lineWidth = isJumpTarget ? 3 : 1.5;
        ctx.beginPath();
        ctx.moveTo(x, lineY - (isJumpTarget ? 14 : 8));
        ctx.lineTo(x, lineY + (isJumpTarget ? 14 : 8));
        ctx.stroke();

        ctx.fillStyle = isJumpTarget ? '#059669' : '#475569';
        ctx.font = isJumpTarget ? 'bold 15px sans-serif' : '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${i}`, x, lineY + 28);
      }

      // Parabolic Arcs
      for (let j = 0; j < jumpCount; j++) {
        const fromX = startX + (j * jumpSize) * stepPx;
        const toX = startX + ((j + 1) * jumpSize) * stepPx;
        const midX = (fromX + toX) / 2;
        const arcHeight = Math.min(100, jumpSize * 24);

        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(fromX, lineY);
        ctx.quadraticCurveTo(midX, lineY - arcHeight, toX, lineY);
        ctx.stroke();

        ctx.fillStyle = '#047857';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`+${jumpSize}`, midX, lineY - arcHeight - 6);
      }

      // Animated Frog
      const currentJump = (t * jumpCount) % jumpCount;
      const curJIdx = Math.floor(currentJump);
      const curProg = currentJump - curJIdx;
      const fromX = startX + (curJIdx * jumpSize) * stepPx;
      const toX = startX + ((curJIdx + 1) * jumpSize) * stepPx;
      const curX = fromX + (toX - fromX) * curProg;
      const arcH = Math.min(100, jumpSize * 24);
      const curY = lineY - Math.sin(curProg * Math.PI) * arcH - 12;

      ctx.font = '26px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🐸', curX, curY);

      // Top Banner
      ctx.fillStyle = '#060E1C';
      ctx.font = '900 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${jumpCount} jumps of ${jumpSize} = Frog lands at ${total}!`, width * 0.5, height * 0.18);
    },
  },

  {
    id: 'clock-time',
    title: 'Telling Time on an Analog Clock (Grades 1–4)',
    category: 'Elementary (Grades 1-6)',
    difficulty: 'Grade 1-3',
    summary: 'Turn the red hour hand and blue minute hand to master reading analog clocks and telling time.',
    formula: '\\text{Angle} = 30^\\circ \\times \\text{Hour} - 5.5^\\circ \\times \\text{Minute}',
    explanation: [
      'The short red hand points to the HOUR (1 to 12).',
      'The long blue hand counts the MINUTES around the 60 ticks.',
      'When the minute hand is at 12, it is o\'clock (e.g. 3:00).',
      'When at 3, it is Quarter Past (:15). At 6, Half Past (:30). At 9, Quarter To (:45).'
    ],
    parameters: [
      { id: 'hour', name: 'Hour Hand (Short Red)', min: 1, max: 12, step: 1, default: 3, unit: 'hr' },
      { id: 'minute', name: 'Minute Hand (Long Blue)', min: 0, max: 55, step: 5, default: 15, unit: 'min' },
    ],
    manimgxCode: `# Edvoura MathMotion - Analog Clock Time`,
    drawScene: (ctx, width, height, t, params) => {
      const centerX = width * 0.42;
      const centerY = height * 0.5;
      const radius = Math.min(width, height) * 0.34;
      const hour = Math.max(1, Math.min(12, Math.round(params.hour ?? 3)));
      const minute = Math.max(0, Math.min(55, Math.round(params.minute ?? 15)));

      ctx.fillStyle = '#E2E8F0';
      ctx.beginPath();
      ctx.arc(centerX + 6, centerY + 6, radius + 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#060E1C';
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#060E1C';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let n = 1; n <= 12; n++) {
        const ang = (n * Math.PI) / 6 - Math.PI / 2;
        const numR = radius * 0.82;
        const nx = centerX + Math.cos(ang) * numR;
        const ny = centerY + Math.sin(ang) * numR;
        ctx.fillText(`${n}`, nx, ny);
      }

      for (let m = 0; m < 60; m++) {
        const ang = (m * Math.PI) / 30 - Math.PI / 2;
        const is5 = m % 5 === 0;
        const r1 = radius * (is5 ? 0.91 : 0.95);
        const r2 = radius * 0.98;
        ctx.strokeStyle = is5 ? '#060E1C' : '#94A3B8';
        ctx.lineWidth = is5 ? 2.5 : 1;
        ctx.beginPath();
        ctx.moveTo(centerX + Math.cos(ang) * r1, centerY + Math.sin(ang) * r1);
        ctx.lineTo(centerX + Math.cos(ang) * r2, centerY + Math.sin(ang) * r2);
        ctx.stroke();
      }

      const minAngle = (minute * Math.PI) / 30 - Math.PI / 2;
      const hrAngle = ((hour % 12) + minute / 60) * (Math.PI / 6) - Math.PI / 2;

      // Hour Hand (Red)
      ctx.strokeStyle = '#DC2626';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + Math.cos(hrAngle) * radius * 0.52, centerY + Math.sin(hrAngle) * radius * 0.52);
      ctx.stroke();

      // Minute Hand (Blue)
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + Math.cos(minAngle) * radius * 0.76, centerY + Math.sin(minAngle) * radius * 0.76);
      ctx.stroke();

      // Pivot
      ctx.fillStyle = '#060E1C';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
      ctx.fill();

      // Digital display
      const cardX = width * 0.82;
      ctx.fillStyle = '#060E1C';
      ctx.font = '900 42px monospace';
      ctx.textAlign = 'center';
      const mmStr = minute < 10 ? `0${minute}` : `${minute}`;
      const hhStr = hour < 10 ? `0${hour}` : `${hour}`;
      ctx.fillText(`${hhStr}:${mmStr}`, cardX, centerY - 30);

      let verbal = '';
      if (minute === 0) verbal = `${hour} o'clock`;
      else if (minute === 15) verbal = `Quarter past ${hour}`;
      else if (minute === 30) verbal = `Half past ${hour}`;
      else if (minute === 45) verbal = `Quarter to ${(hour % 12) + 1}`;
      else if (minute < 30) verbal = `${minute} mins past ${hour}`;
      else verbal = `${60 - minute} mins to ${(hour % 12) + 1}`;

      ctx.font = 'bold 20px sans-serif';
      ctx.fillStyle = '#D97706';
      ctx.fillText(verbal, cardX, centerY + 25);

      ctx.font = 'bold 13px sans-serif';
      ctx.fillStyle = '#64748B';
      ctx.fillText('🔴 Red = Hour Hand', cardX, centerY + 65);
      ctx.fillText('🔵 Blue = Minute Hand', cardX, centerY + 88);
    },
  },

  {
    id: 'perimeter-area',
    title: 'Perimeter vs. Area Explorer (Grades 3–6)',
    category: 'Elementary (Grades 1-6)',
    difficulty: 'Grade 4-6',
    summary: 'Never confuse Perimeter and Area again! Count the square tiles inside (Area) vs the fence around the outside (Perimeter).',
    formula: '\\text{Area} = w \\times h, \\quad \\text{Perimeter} = 2(w + h)',
    explanation: [
      'AREA is the inside space covered by square unit tiles (m²).',
      'PERIMETER is the total distance around the outside edge (like building a fence).',
      'Area multiplies width × height, while perimeter adds up all 4 sides.',
      'Notice: two shapes can have the same area but different perimeters!'
    ],
    parameters: [
      { id: 'width', name: 'Width (meters)', min: 2, max: 8, step: 1, default: 5, unit: 'm' },
      { id: 'height', name: 'Height (meters)', min: 2, max: 6, step: 1, default: 3, unit: 'm' },
    ],
    manimgxCode: `# Edvoura MathMotion - Perimeter and Area Explorer`,
    drawScene: (ctx, width, height, t, params) => {
      const w = Math.max(2, Math.min(8, Math.round(params.width ?? 5)));
      const h = Math.max(2, Math.min(6, Math.round(params.height ?? 3)));
      const area = w * h;
      const perimeter = 2 * (w + h);
      const cellSize = Math.min((width * 0.5) / w, (height * 0.55) / h, 54);
      const startX = width * 0.12;
      const startY = height * 0.28;

      ctx.fillStyle = '#060E1C';
      ctx.font = '900 24px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Shape: ${w}m wide × ${h}m tall`, startX, height * 0.15);

      for (let r = 0; r < h; r++) {
        for (let c = 0; c < w; c++) {
          const tx = startX + c * cellSize;
          const ty = startY + r * cellSize;
          ctx.fillStyle = '#FEF08A';
          ctx.fillRect(tx, ty, cellSize, cellSize);
          ctx.strokeStyle = '#CA8A04';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(tx, ty, cellSize, cellSize);

          ctx.fillStyle = '#854D0E';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${r * w + c + 1}`, tx + cellSize / 2, ty + cellSize / 2);
        }
      }

      ctx.strokeStyle = '#DC2626';
      ctx.lineWidth = 5;
      ctx.strokeRect(startX, startY, w * cellSize, h * cellSize);

      ctx.fillStyle = '#DC2626';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Width = ${w}m`, startX + (w * cellSize) / 2, startY - 12);
      ctx.fillText(`Width = ${w}m`, startX + (w * cellSize) / 2, startY + h * cellSize + 24);
      ctx.fillText(`${h}m`, startX - 20, startY + (h * cellSize) / 2);
      ctx.fillText(`${h}m`, startX + w * cellSize + 25, startY + (h * cellSize) / 2);

      const cardX = width * 0.82;
      ctx.textAlign = 'center';

      ctx.fillStyle = '#CA8A04';
      ctx.font = '900 16px sans-serif';
      ctx.fillText('🟨 AREA (Inside Tiles)', cardX, height * 0.35);
      ctx.fillStyle = '#060E1C';
      ctx.font = '900 32px sans-serif';
      ctx.fillText(`${area} m²`, cardX, height * 0.44);
      ctx.font = 'bold 13px sans-serif';
      ctx.fillStyle = '#64748B';
      ctx.fillText(`${w} × ${h} = ${area} tiles`, cardX, height * 0.51);

      ctx.fillStyle = '#DC2626';
      ctx.font = '900 16px sans-serif';
      ctx.fillText('🔴 PERIMETER (Outer Fence)', cardX, height * 0.64);
      ctx.fillStyle = '#060E1C';
      ctx.font = '900 32px sans-serif';
      ctx.fillText(`${perimeter} m`, cardX, height * 0.73);
      ctx.font = 'bold 13px sans-serif';
      ctx.fillStyle = '#64748B';
      ctx.fillText(`${w}+${h}+${w}+${h} = ${perimeter}m`, cardX, height * 0.80);
    },
  },

  // 1. UNIT CIRCLE & TRIGONOMETRIC WAVES
  {
    id: 'unit-circle',
    title: 'Unit Circle & Trigonometric Waves (sin / cos)',
    category: 'Trigonometry',
    difficulty: 'Senior Secondary',
    summary: 'Watch how rotating an angle on a unit circle generates the smooth sine and cosine waves in real time.',
    formula: 'x = \\cos(\\theta), \\quad y = \\sin(\\theta), \\quad \\sin^2(\\theta) + \\cos^2(\\theta) = 1',
    explanation: [
      'The radius vector rotates counterclockwise at angle θ.',
      'The vertical projection (green line) defines sin(θ) and traces the sine wave to the right.',
      'The horizontal projection (blue line) defines cos(θ).',
      'At θ = 90° (π/2), sin(θ) reaches its maximum peak of +1.',
    ],
    parameters: [
      { id: 'speed', name: 'Angular Speed', min: 0.5, max: 3, step: 0.1, default: 1, unit: 'x' },
      { id: 'amplitude', name: 'Wave Amplitude', min: 0.5, max: 1.5, step: 0.1, default: 1 },
      { id: 'frequency', name: 'Wave Frequency', min: 1, max: 4, step: 0.5, default: 1 },
    ],
    manimgxCode: `from manimgx import *

class UnitCircleWave(Scene):
    def construct(self):
        plane = NumberPlane(x_range=[-3, 6], y_range=[-2, 2])
        circle = Circle(radius=1.5, color=WHITE).shift(LEFT * 2)
        dot = Dot(color=YELLOW)
        
        # Rotating angle theta
        theta = ValueTracker(0)
        
        # Sine wave curve
        sine_curve = always_redraw(
            lambda: FunctionGraph(
                lambda x: np.sin(x),
                x_range=[0, theta.get_value()],
                color=GREEN
            ).shift(RIGHT * 0.5)
        )
        
        self.play(Create(plane), Create(circle))
        self.play(theta.animate.set_value(TAU * 2), run_time=6, rate_func=linear)
`,
    drawScene: (ctx, width, height, t, params) => {
      const centerX = width * 0.28;
      const centerY = height * 0.5;
      const radius = Math.min(width, height) * 0.24 * (params.amplitude ?? 1);
      const angle = (t * Math.PI * 4 * (params.frequency ?? 1)) % (Math.PI * 4);

      // Background Grid
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.moveTo(centerX, 0);
      ctx.lineTo(centerX, height);
      ctx.stroke();

      // Unit Circle
      ctx.strokeStyle = '#060E1C';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Current Point on Circle
      const px = centerX + Math.cos(-angle) * radius;
      const py = centerY + Math.sin(-angle) * radius;

      // Cosine projection (horizontal - blue)
      ctx.strokeStyle = '#2563EB';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(px, centerY);
      ctx.stroke();

      // Sine projection (vertical - green)
      ctx.strokeStyle = '#16A34A';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(px, centerY);
      ctx.lineTo(px, py);
      ctx.stroke();

      // Rotating Radius Vector
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(px, py);
      ctx.stroke();

      // Point on Circle
      ctx.fillStyle = '#F5C518';
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#060E1C';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Connecting dash line from circle to wave
      const waveStartX = width * 0.52;
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#16A34A';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(waveStartX, py);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Sine Wave
      ctx.strokeStyle = '#16A34A';
      ctx.lineWidth = 3;
      ctx.beginPath();
      const wavePoints = 120;
      const waveWidth = width * 0.44;

      for (let i = 0; i <= wavePoints; i++) {
        const progressRatio = i / wavePoints;
        const currentX = waveStartX + progressRatio * waveWidth;
        const waveAngle = angle - (progressRatio * Math.PI * 2);
        const waveY = centerY + Math.sin(-waveAngle) * radius;
        if (i === 0) ctx.moveTo(currentX, waveY);
        else ctx.lineTo(currentX, waveY);
      }
      ctx.stroke();

      // Wave Tracker Point
      ctx.fillStyle = '#16A34A';
      ctx.beginPath();
      ctx.arc(waveStartX, py, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#060E1C';
      ctx.stroke();

      // Labels
      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = '#060E1C';
      ctx.fillText(`θ = ${(angle % (Math.PI * 2)).toFixed(2)} rad (${(((angle % (Math.PI * 2)) * 180) / Math.PI).toFixed(0)}°)`, centerX - 60, centerY + radius + 30);
      ctx.fillStyle = '#16A34A';
      ctx.fillText(`sin(θ) = ${(-Math.sin(-angle)).toFixed(2)}`, waveStartX, 35);
      ctx.fillStyle = '#2563EB';
      ctx.fillText(`cos(θ) = ${Math.cos(-angle).toFixed(2)}`, centerX - 30, centerY - radius - 15);
    },
  },

  // 2. PYTHAGOREAN THEOREM VISUAL PROOF
  {
    id: 'pythagorean-theorem',
    title: 'Pythagorean Theorem Geometric Proof (a² + b² = c²)',
    category: 'Geometry',
    difficulty: 'Junior Secondary',
    summary: 'A geometric dissection proof showing how squares constructed on legs a and b exactly equal the square on hypotenuse c.',
    formula: 'a^2 + b^2 = c^2',
    explanation: [
      'In any right-angled triangle, the area of the square on the hypotenuse (c) is equal to the sum of the areas of squares on the other two sides (a and b).',
      'Watch the animated morphing of the side areas into the large hypotenuse square.',
      'Notice that the equality holds true regardless of the triangle proportions.',
    ],
    parameters: [
      { id: 'sideA', name: 'Leg a Length', min: 60, max: 120, step: 10, default: 80, unit: 'px' },
      { id: 'sideB', name: 'Leg b Length', min: 80, max: 160, step: 10, default: 110, unit: 'px' },
    ],
    manimgxCode: `from manimgx import *

class PythagoreanProof(Scene):
    def construct(self):
        # Construct Right Triangle
        a = 2.0
        b = 3.0
        triangle = Polygon(ORIGIN, RIGHT * b, RIGHT * b + UP * a, color=BLUE)
        
        # Squares on sides
        sq_a = Square(side_length=a, color=GREEN).next_to(triangle, RIGHT, buff=0)
        sq_b = Square(side_length=b, color=YELLOW).next_to(triangle, DOWN, buff=0)
        
        # Hypotenuse square
        c = np.sqrt(a**2 + b**2)
        sq_c = Square(side_length=c, color=RED).shift(UP * 1.5 + LEFT * 1)
        
        self.play(Create(triangle))
        self.play(Create(sq_a), Create(sq_b))
        self.play(Transform(sq_a, sq_c), Transform(sq_b, sq_c), run_time=3)
`,
    drawScene: (ctx, width, height, t, params) => {
      const a = params.sideA ?? 80;
      const b = params.sideB ?? 110;
      const c = Math.sqrt(a * a + b * b);
      const startX = width * 0.42;
      const startY = height * 0.58;

      // Triangle Vertices: Right angle at (startX, startY)
      // Horizontal leg b to right: (startX + b, startY)
      // Vertical leg a up: (startX, startY - a)

      // Square on Leg a (Vertical - left side)
      ctx.fillStyle = 'rgba(34, 197, 94, 0.35)';
      ctx.strokeStyle = '#15803D';
      ctx.lineWidth = 2.5;
      ctx.fillRect(startX - a, startY - a, a, a);
      ctx.strokeRect(startX - a, startY - a, a, a);

      // Square on Leg b (Horizontal - bottom)
      ctx.fillStyle = 'rgba(245, 197, 24, 0.35)';
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 2.5;
      ctx.fillRect(startX, startY, b, b);
      ctx.strokeRect(startX, startY, b, b);

      // Square on Hypotenuse (c) angled
      const angle = Math.atan2(a, b);
      ctx.save();
      ctx.translate(startX + b, startY);
      ctx.rotate(-angle);
      const morphAlpha = Math.min(1, Math.max(0.15, t * 1.2));
      ctx.fillStyle = `rgba(239, 68, 68, ${0.15 + morphAlpha * 0.25})`;
      ctx.strokeStyle = '#B91C1C';
      ctx.lineWidth = 2.5;
      ctx.fillRect(0, -c, c, c);
      ctx.strokeRect(0, -c, c, c);
      ctx.restore();

      // Right-angled triangle
      ctx.fillStyle = 'rgba(10, 22, 40, 0.1)';
      ctx.strokeStyle = '#060E1C';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(startX + b, startY);
      ctx.lineTo(startX, startY - a);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Right angle square indicator
      ctx.strokeStyle = '#060E1C';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(startX, startY - 14, 14, 14);

      // Labels
      ctx.font = 'black 14px sans-serif';
      ctx.fillStyle = '#15803D';
      ctx.fillText(`a² = ${(a * a).toFixed(0)}`, startX - a / 2 - 25, startY - a / 2);
      ctx.fillStyle = '#D97706';
      ctx.fillText(`b² = ${(b * b).toFixed(0)}`, startX + b / 2 - 25, startY + b / 2 + 10);
      ctx.fillStyle = '#B91C1C';
      ctx.fillText(`c² = a² + b² = ${(c * c).toFixed(0)}`, startX + 20, startY - a - 40);

      // Progress animation wave indicator
      const glowProgress = Math.sin(t * Math.PI * 2);
      ctx.fillStyle = '#060E1C';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`Hypotenuse c = ${c.toFixed(1)} px`, width * 0.05, height * 0.9);
    },
  },

  // 3. DERIVATIVE & TANGENT SLOPE VISUALIZER
  {
    id: 'calculus-derivative',
    title: 'Derivative as Tangent Slope (f\'(x) = lim Δy/Δx)',
    category: 'Calculus',
    difficulty: 'Senior Secondary',
    summary: 'See how the secant line between two points snaps into the instantaneous tangent line as Δx approaches zero.',
    formula: 'f\'(x) = \\lim_{\\Delta x \\to 0} \\frac{f(x + \\Delta x) - f(x)}{\\Delta x}',
    explanation: [
      'The secant line represents the average rate of change between x and x + Δx.',
      'As Δx shrinks to zero, the secant line smoothly pivots into the tangent line.',
      'The slope of this tangent line is the exact derivative f\'(x) at that instantaneous point.',
    ],
    parameters: [
      { id: 'xPos', name: 'Tangent Position x', min: -2, max: 2, step: 0.1, default: 0.8 },
      { id: 'deltaX', name: 'Step Δx', min: 0.02, max: 1.5, step: 0.05, default: 0.6 },
    ],
    manimgxCode: `from manimgx import *

class DerivativeScene(Scene):
    def construct(self):
        axes = Axes(x_range=[-3, 3], y_range=[-1, 5], color=WHITE)
        curve = axes.plot(lambda x: x**2, color=BLUE)
        
        # Point and Secant line shrinking to tangent
        x_val = ValueTracker(1.0)
        dx_val = ValueTracker(1.0)
        
        secant = always_redraw(
            lambda: axes.get_secant_slope_group(
                x_val.get_value(), curve, dx=dx_val.get_value(), color=GREEN
            )
        )
        
        self.play(Create(axes), Create(curve))
        self.play(Create(secant))
        self.play(dx_val.animate.set_value(0.01), run_time=4)
`,
    drawScene: (ctx, width, height, t, params) => {
      const originX = width * 0.5;
      const originY = height * 0.72;
      const scaleX = width * 0.16;
      const scaleY = height * 0.14;

      // Coordinate axes
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(width * 0.08, originY);
      ctx.lineTo(width * 0.92, originY);
      ctx.moveTo(originX, height * 0.08);
      ctx.lineTo(originX, height * 0.92);
      ctx.stroke();

      // Parabola f(x) = x^2
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      for (let px = -2.5; px <= 2.5; px += 0.05) {
        const py = px * px;
        const screenX = originX + px * scaleX;
        const screenY = originY - py * scaleY;
        if (px === -2.5) ctx.moveTo(screenX, screenY);
        else ctx.lineTo(screenX, screenY);
      }
      ctx.stroke();

      // Current x position
      const x0 = params.xPos ?? 0.8;
      // Shrinking deltaX over time animation
      const animDelta = (params.deltaX ?? 0.6) * (1 - Math.sin(t * Math.PI) * 0.92);
      const x1 = x0 + animDelta;

      const y0 = x0 * x0;
      const y1 = x1 * x1;

      const sX0 = originX + x0 * scaleX;
      const sY0 = originY - y0 * scaleY;
      const sX1 = originX + x1 * scaleX;
      const sY1 = originY - y1 * scaleY;

      // Slope of secant / tangent
      const slope = (y1 - y0) / (x1 - x0);

      // Draw Tangent/Secant line extended
      ctx.strokeStyle = animDelta < 0.08 ? '#16A34A' : '#F59E0B';
      ctx.lineWidth = 3;
      ctx.beginPath();
      const lineLen = 2.2;
      const startLineX = originX + (x0 - lineLen) * scaleX;
      const startLineY = originY - (y0 - lineLen * slope) * scaleY;
      const endLineX = originX + (x0 + lineLen) * scaleX;
      const endLineY = originY - (y0 + lineLen * slope) * scaleY;
      ctx.moveTo(startLineX, startLineY);
      ctx.lineTo(endLineX, endLineY);
      ctx.stroke();

      // Slope triangle (Rise / Run)
      if (animDelta > 0.08) {
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(sX0, sY0);
        ctx.lineTo(sX1, sY0);
        ctx.lineTo(sX1, sY1);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Points P and Q
      ctx.fillStyle = '#060E1C';
      ctx.beginPath();
      ctx.arc(sX0, sY0, 6, 0, Math.PI * 2);
      ctx.fill();

      if (animDelta > 0.05) {
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(sX1, sY1, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // HUD readout
      ctx.font = 'bold 13px sans-serif';
      ctx.fillStyle = '#060E1C';
      ctx.fillText(`f(x) = x²`, originX + 110, originY - 180);
      ctx.fillStyle = '#0284C7';
      ctx.fillText(`Point P: x = ${x0.toFixed(2)}, f(x) = ${y0.toFixed(2)}`, 30, 40);
      ctx.fillStyle = animDelta < 0.08 ? '#16A34A' : '#F59E0B';
      ctx.fillText(`Δx = ${animDelta.toFixed(3)} | Secant Slope = ${slope.toFixed(3)}`, 30, 65);
      ctx.fillStyle = '#16A34A';
      ctx.fillText(`Instantaneous Derivative f'(${x0.toFixed(2)}) = ${(2 * x0).toFixed(3)}`, 30, 90);
    },
  },

  // 4. RIEMANN SUMS & DEFINITE INTEGRALS
  {
    id: 'calculus-riemann',
    title: 'Riemann Sums: Area Under Curve (∫ f(x) dx)',
    category: 'Calculus',
    difficulty: 'Advanced (A-Level / JAMB)',
    summary: 'Watch rectangles multiply and shrink in width, converging into the exact mathematical area beneath the curve.',
    formula: '\\int_a^b f(x)\\,dx = \\lim_{n \\to \\infty} \\sum_{i=1}^n f(x_i^*)\\,\\Delta x',
    explanation: [
      'The area under any curve is approximated by dividing the interval [a, b] into n rectangles.',
      'As n increases, the gaps and overshoots vanish.',
      'At infinity, the discrete Riemann sum equals the continuous definite integral.',
    ],
    parameters: [
      { id: 'rectangles', name: 'Number of Rectangles n', min: 4, max: 40, step: 2, default: 12 },
    ],
    manimgxCode: `from manimgx import *

class RiemannIntegral(Scene):
    def construct(self):
        axes = Axes(x_range=[0, 4], y_range=[0, 5])
        curve = axes.plot(lambda x: 0.3 * x**2 + 0.5, color=BLUE)
        
        # Increasing rectangle count
        for n in [4, 8, 16, 32]:
            rects = axes.get_riemann_rectangles(curve, x_range=[0.5, 3.5], dx=3.0/n, color=YELLOW)
            self.play(Transform(rects, rects), run_time=1.5)
`,
    drawScene: (ctx, width, height, t, params) => {
      const originX = width * 0.15;
      const originY = height * 0.78;
      const scaleX = width * 0.2;
      const scaleY = height * 0.12;

      // Axes
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(originX - 20, originY);
      ctx.lineTo(width * 0.9, originY);
      ctx.moveTo(originX, originY + 20);
      ctx.lineTo(originX, height * 0.1);
      ctx.stroke();

      const a = 0.5;
      const b = 3.5;
      const baseRects = params.rectangles ?? 12;
      // Animate rectangle count pulse
      const n = Math.max(4, Math.round(baseRects + Math.sin(t * Math.PI * 2) * 8));
      const dx = (b - a) / n;

      const f = (x: number) => 0.25 * x * x + 0.6;

      let totalArea = 0;

      // Draw Riemann Rectangles
      for (let i = 0; i < n; i++) {
        const xLeft = a + i * dx;
        const xMid = xLeft + dx * 0.5;
        const hVal = f(xMid);
        totalArea += hVal * dx;

        const screenLeft = originX + xLeft * scaleX;
        const screenWidth = dx * scaleX;
        const screenHeight = hVal * scaleY;
        const screenTop = originY - screenHeight;

        ctx.fillStyle = 'rgba(245, 197, 24, 0.45)';
        ctx.fillRect(screenLeft, screenTop, screenWidth, screenHeight);
        ctx.strokeStyle = '#B45309';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(screenLeft, screenTop, screenWidth, screenHeight);
      }

      // Draw Continuous Function Curve
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      for (let x = 0; x <= 4; x += 0.05) {
        const sx = originX + x * scaleX;
        const sy = originY - f(x) * scaleY;
        if (x === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();

      // Exact Analytical Integral: \int_0.5^3.5 (0.25 x^2 + 0.6) dx = [0.25/3 x^3 + 0.6 x]_0.5^3.5
      const exactIntegral = ((0.25 / 3) * Math.pow(b, 3) + 0.6 * b) - ((0.25 / 3) * Math.pow(a, 3) + 0.6 * a);

      // HUD
      ctx.font = 'bold 13px sans-serif';
      ctx.fillStyle = '#060E1C';
      ctx.fillText(`f(x) = 0.25x² + 0.6`, originX + 160, height * 0.2);
      ctx.fillStyle = '#B45309';
      ctx.fillText(`Rectangles n = ${n} | Δx = ${dx.toFixed(3)}`, 30, 40);
      ctx.fillText(`Riemann Sum Approx Area = ${totalArea.toFixed(4)}`, 30, 65);
      ctx.fillStyle = '#16A34A';
      ctx.fillText(`Exact Definite Integral ∫ f(x)dx = ${exactIntegral.toFixed(4)}`, 30, 90);
      ctx.fillStyle = '#64748B';
      ctx.fillText(`Error = ${Math.abs(totalArea - exactIntegral).toFixed(5)}`, 30, 115);
    },
  },

  // 5. QUADRATIC FUNCTION EXPLORER
  {
    id: 'algebra-quadratic',
    title: 'Quadratic Parabola & Roots (ax² + bx + c = 0)',
    category: 'Algebra',
    difficulty: 'Junior Secondary',
    summary: 'Manipulate coefficients a, b, and c to see how vertex, axis of symmetry, and real roots change instantly.',
    formula: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}, \\quad \\Delta = b^2 - 4ac',
    explanation: [
      'The coefficient a determines whether the parabola opens upward (a > 0) or downward (a < 0).',
      'The discriminant Δ = b² - 4ac tells you the number of real roots: Δ > 0 (2 roots), Δ = 0 (1 root), Δ < 0 (no real roots).',
      'The vertex occurs exactly at x = -b / (2a).',
    ],
    parameters: [
      { id: 'coeffA', name: 'Coefficient a', min: -2, max: 2, step: 0.2, default: 1 },
      { id: 'coeffB', name: 'Coefficient b', min: -4, max: 4, step: 0.5, default: -2 },
      { id: 'coeffC', name: 'Coefficient c', min: -3, max: 3, step: 0.5, default: -1 },
    ],
    manimgxCode: `from manimgx import *

class QuadraticExplorer(Scene):
    def construct(self):
        axes = Axes(x_range=[-4, 4], y_range=[-4, 6])
        a, b, c = 1.0, -2.0, -1.0
        parabola = axes.plot(lambda x: a*x**2 + b*x + c, color=YELLOW)
        
        # Highlight vertex & roots
        disc = b**2 - 4*a*c
        r1 = (-b - np.sqrt(disc)) / (2*a)
        r2 = (-b + np.sqrt(disc)) / (2*a)
        
        dots = VGroup(Dot(axes.c2p(r1, 0), color=RED), Dot(axes.c2p(r2, 0), color=RED))
        
        self.play(Create(axes), Create(parabola), FadeIn(dots))
`,
    drawScene: (ctx, width, height, t, params) => {
      const originX = width * 0.5;
      const originY = height * 0.55;
      const scaleX = width * 0.08;
      const scaleY = height * 0.08;

      // Coordinate axes
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(width * 0.1, originY);
      ctx.lineTo(width * 0.9, originY);
      ctx.moveTo(originX, height * 0.1);
      ctx.lineTo(originX, height * 0.9);
      ctx.stroke();

      const a = params.coeffA ?? 1;
      const b = params.coeffB ?? -2;
      const c = params.coeffC ?? -1;

      // Draw Parabola
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      for (let px = -5; px <= 5; px += 0.05) {
        const py = a * px * px + b * px + c;
        const sx = originX + px * scaleX;
        const sy = originY - py * scaleY;
        if (px === -5) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();

      // Vertex (-b / (2a))
      if (Math.abs(a) > 0.01) {
        const vx = -b / (2 * a);
        const vy = a * vx * vx + b * vx + c;
        const svx = originX + vx * scaleX;
        const svy = originY - vy * scaleY;

        ctx.fillStyle = '#2563EB';
        ctx.beginPath();
        ctx.arc(svx, svy, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#2563EB';
        ctx.fillText(`Vertex (${vx.toFixed(2)}, ${vy.toFixed(2)})`, svx + 8, svy - 8);
      }

      // Discriminant and roots
      const discriminant = b * b - 4 * a * c;

      if (discriminant >= 0 && Math.abs(a) > 0.01) {
        const r1 = (-b - Math.sqrt(discriminant)) / (2 * a);
        const r2 = (-b + Math.sqrt(discriminant)) / (2 * a);

        [r1, r2].forEach((root) => {
          const rx = originX + root * scaleX;
          ctx.fillStyle = '#DC2626';
          ctx.beginPath();
          ctx.arc(rx, originY, 6, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // HUD
      ctx.font = 'bold 13px sans-serif';
      ctx.fillStyle = '#060E1C';
      ctx.fillText(`f(x) = ${a.toFixed(1)}x² ${b >= 0 ? '+' : ''}${b.toFixed(1)}x ${c >= 0 ? '+' : ''}${c.toFixed(1)}`, 30, 40);
      ctx.fillStyle = discriminant > 0 ? '#16A34A' : discriminant === 0 ? '#F59E0B' : '#DC2626';
      ctx.fillText(`Discriminant Δ = ${discriminant.toFixed(2)} (${discriminant > 0 ? '2 Real Roots' : discriminant === 0 ? '1 Repeated Root' : 'Complex / No Real Roots'})`, 30, 65);
    },
  },

  // 6. 2D LINEAR ALGEBRA MATRIX TRANSFORMATION
  {
    id: 'linear-algebra-matrix',
    title: 'Linear Algebra: 2D Matrix Grid Warping',
    category: 'Linear Algebra',
    difficulty: 'Advanced (A-Level / JAMB)',
    summary: 'Visualize how a 2×2 matrix transforms basis vectors î and ĵ, stretching and rotating the entire space.',
    formula: 'M = \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}, \\quad \\det(M) = ad - bc',
    explanation: [
      'Every 2D linear transformation is determined completely by where it sends basis vectors î = (1, 0) and ĵ = (0, 1).',
      'The determinant det(M) equals the factor by which area is scaled.',
      'If det(M) is negative, the orientation of space has flipped.',
    ],
    parameters: [
      { id: 'm11', name: 'Matrix a (i_x)', min: -2, max: 2, step: 0.2, default: 1.2 },
      { id: 'm12', name: 'Matrix b (j_x)', min: -2, max: 2, step: 0.2, default: 0.8 },
      { id: 'm21', name: 'Matrix c (i_y)', min: -2, max: 2, step: 0.2, default: 0.4 },
      { id: 'm22', name: 'Matrix d (j_y)', min: -2, max: 2, step: 0.2, default: 1.1 },
    ],
    manimgxCode: `from manimgx import *

class MatrixTransform(Scene):
    def construct(self):
        grid = NumberPlane()
        matrix = [[1.2, 0.8], [0.4, 1.1]]
        
        self.play(Create(grid))
        self.play(grid.animate.apply_matrix(matrix), run_time=3)
`,
    drawScene: (ctx, width, height, t, params) => {
      const originX = width * 0.5;
      const originY = height * 0.5;
      const unit = Math.min(width, height) * 0.12;

      // Matrix values interpolated with identity over animation cycle
      const animT = Math.sin(t * Math.PI);
      const m11 = 1 + ((params.m11 ?? 1.2) - 1) * animT;
      const m12 = 0 + (params.m12 ?? 0.8) * animT;
      const m21 = 0 + (params.m21 ?? 0.4) * animT;
      const m22 = 1 + ((params.m22 ?? 1.1) - 1) * animT;

      const transform = (x: number, y: number) => {
        const tx = m11 * x + m12 * y;
        const ty = m21 * x + m22 * y;
        return {
          sx: originX + tx * unit,
          sy: originY - ty * unit,
        };
      };

      // Draw transformed grid lines
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      for (let g = -5; g <= 5; g++) {
        // Vertical grid line
        const p1 = transform(g, -5);
        const p2 = transform(g, 5);
        ctx.beginPath();
        ctx.moveTo(p1.sx, p1.sy);
        ctx.lineTo(p2.sx, p2.sy);
        ctx.stroke();

        // Horizontal grid line
        const p3 = transform(-5, g);
        const p4 = transform(5, g);
        ctx.beginPath();
        ctx.moveTo(p3.sx, p3.sy);
        ctx.lineTo(p4.sx, p4.sy);
        ctx.stroke();
      }

      // Unit Square transformed area (determinant representation)
      const p00 = transform(0, 0);
      const p10 = transform(1, 0);
      const p11 = transform(1, 1);
      const p01 = transform(0, 1);

      ctx.fillStyle = 'rgba(245, 197, 24, 0.35)';
      ctx.beginPath();
      ctx.moveTo(p00.sx, p00.sy);
      ctx.lineTo(p10.sx, p10.sy);
      ctx.lineTo(p11.sx, p11.sy);
      ctx.lineTo(p01.sx, p01.sy);
      ctx.closePath();
      ctx.fill();

      // Basis Vector i-hat (Red)
      ctx.strokeStyle = '#DC2626';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(p00.sx, p00.sy);
      ctx.lineTo(p10.sx, p10.sy);
      ctx.stroke();

      // Basis Vector j-hat (Green)
      ctx.strokeStyle = '#16A34A';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(p00.sx, p00.sy);
      ctx.lineTo(p01.sx, p01.sy);
      ctx.stroke();

      // Determinant calculation
      const det = m11 * m22 - m12 * m21;

      // HUD
      ctx.font = 'bold 13px sans-serif';
      ctx.fillStyle = '#060E1C';
      ctx.fillText(`Matrix: [ [${m11.toFixed(2)}, ${m12.toFixed(2)}], [${m21.toFixed(2)}, ${m22.toFixed(2)}] ]`, 30, 40);
      ctx.fillStyle = '#DC2626';
      ctx.fillText(`î transformed = (${m11.toFixed(2)}, ${m21.toFixed(2)})`, 30, 65);
      ctx.fillStyle = '#16A34A';
      ctx.fillText(`ĵ transformed = (${m12.toFixed(2)}, ${m22.toFixed(2)})`, 30, 90);
      ctx.fillStyle = '#B45309';
      ctx.fillText(`Area Scaling Factor det(M) = ${det.toFixed(3)}`, 30, 115);
    },
  },

  // 7. PROJECTILE MOTION WITH GRAVITY PARABOLA
  {
    id: 'physics-projectile',
    title: 'Projectile Motion & Velocity Vectors (Kinematics)',
    category: 'Physics',
    difficulty: 'Senior Secondary',
    summary: 'Analyze two-dimensional parabolic flight with real-time velocity vector decomposition into horizontal vx and vertical vy.',
    formula: 'x(t) = v_0 \\cos(\\theta) t, \\quad y(t) = v_0 \\sin(\\theta) t - \\frac{1}{2}gt^2',
    explanation: [
      'Horizontal motion proceeds at constant velocity vx because gravity acts only vertically.',
      'Vertical velocity vy decelerates upward at g = 9.8 m/s², reaches zero at the apex, and accelerates downward.',
      'Maximum range occurs when launching at θ = 45° (in the absence of air resistance).',
    ],
    parameters: [
      { id: 'velocity', name: 'Initial Velocity v₀', min: 20, max: 60, step: 5, default: 38, unit: 'm/s' },
      { id: 'angleDeg', name: 'Launch Angle θ', min: 15, max: 75, step: 5, default: 45, unit: '°' },
    ],
    manimgxCode: `from manimgx import *

class ProjectileMotion(Scene):
    def construct(self):
        axes = Axes(x_range=[0, 150], y_range=[0, 60])
        v0, theta, g = 40.0, PI/4, 9.8
        
        # Parabolic Trajectory
        trajectory = axes.plot(
            lambda x: x * np.tan(theta) - (g * x**2) / (2 * v0**2 * np.cos(theta)**2),
            color=YELLOW
        )
        dot = Dot(color=RED)
        
        self.play(Create(axes), Create(trajectory))
        self.play(MoveAlongPath(dot, trajectory), run_time=4)
`,
    drawScene: (ctx, width, height, t, params) => {
      const originX = width * 0.1;
      const originY = height * 0.82;
      const g = 9.8;
      const v0 = params.velocity ?? 38;
      const angleRad = ((params.angleDeg ?? 45) * Math.PI) / 180;

      const vx = v0 * Math.cos(angleRad);
      const vy0 = v0 * Math.sin(angleRad);
      const totalFlightTime = (2 * vy0) / g;
      const maxRange = vx * totalFlightTime;
      const maxHeight = (vy0 * vy0) / (2 * g);

      const scaleX = (width * 0.78) / Math.max(1, maxRange);
      const scaleY = (height * 0.55) / Math.max(1, maxHeight);

      // Ground line
      ctx.strokeStyle = '#060E1C';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(originX - 10, originY);
      ctx.lineTo(width * 0.94, originY);
      ctx.stroke();

      // Draw Full Trajectory Path (Dotted)
      ctx.strokeStyle = '#94A3B8';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let step = 0; step <= 80; step++) {
        const timeAtStep = (step / 80) * totalFlightTime;
        const xPos = vx * timeAtStep;
        const yPos = vy0 * timeAtStep - 0.5 * g * timeAtStep * timeAtStep;
        const sx = originX + xPos * scaleX;
        const sy = originY - yPos * scaleY;
        if (step === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Current Projectile Position
      const currentTime = t * totalFlightTime;
      const curX = vx * currentTime;
      const curY = Math.max(0, vy0 * currentTime - 0.5 * g * currentTime * currentTime);
      const curVy = vy0 - g * currentTime;

      const pX = originX + curX * scaleX;
      const pY = originY - curY * scaleY;

      // Velocity Vectors
      const vectorScale = 1.8;
      // Resultant Velocity (Yellow)
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(pX, pY);
      ctx.lineTo(pX + vx * vectorScale, pY - curVy * vectorScale);
      ctx.stroke();

      // Horizontal component vx (Blue)
      ctx.strokeStyle = '#2563EB';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pX, pY);
      ctx.lineTo(pX + vx * vectorScale, pY);
      ctx.stroke();

      // Vertical component vy (Green)
      ctx.strokeStyle = '#16A34A';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pX, pY);
      ctx.lineTo(pX, pY - curVy * vectorScale);
      ctx.stroke();

      // Projectile ball
      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.arc(pX, pY, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#060E1C';
      ctx.lineWidth = 2;
      ctx.stroke();

      // HUD
      ctx.font = 'bold 13px sans-serif';
      ctx.fillStyle = '#060E1C';
      ctx.fillText(`Launch v₀ = ${v0} m/s @ θ = ${params.angleDeg ?? 45}°`, 30, 40);
      ctx.fillStyle = '#2563EB';
      ctx.fillText(`Horizontal Velocity v_x = ${vx.toFixed(1)} m/s (Constant)`, 30, 65);
      ctx.fillStyle = '#16A34A';
      ctx.fillText(`Vertical Velocity v_y = ${curVy.toFixed(1)} m/s`, 30, 90);
      ctx.fillStyle = '#D97706';
      ctx.fillText(`Max Height = ${maxHeight.toFixed(1)} m | Total Range = ${maxRange.toFixed(1)} m`, 30, 115);
    },
  },
];
