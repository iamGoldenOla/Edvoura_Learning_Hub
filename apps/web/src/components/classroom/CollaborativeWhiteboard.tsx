'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
  Pencil,
  Highlighter,
  Eraser,
  Type,
  Square,
  Circle,
  ArrowRight,
  Undo2,
  Redo2,
  Trash2,
  Download,
  Lock,
  Unlock,
  Radio,
  Award,
  Video,
  Smile,
  Palette,
  ChevronLeft,
  ChevronRight,
  Grid,
  BookOpen,
  Send,
  CheckCircle2,
  Sparkles,
  Edit3,
} from 'lucide-react';
import type { DeskStudent } from './StudentDeskManager';
import { Button } from '@/components/ui/button';
import { STAMP_PRESETS, EMOJI_PRESETS, StampItem } from './BoardStamps';
import { getDrawingCursor } from './drawingCursors';
import { playSound } from '@/utils/sounds';

export type ToolType = 'pen' | 'highlighter' | 'eraser' | 'text' | 'rect' | 'circle' | 'arrow' | 'laser';
export type GridType = 'blank' | 'math-grid' | 'lined' | 'dots';
export type BgColorType =
  | 'white'
  | 'teddy-bear'
  | 'space'
  | 'chalk-green'
  | 'lined-notebook'
  | 'math-grid'
  | 'pastel-sky'
  | 'warm-cream'
  | 'black';

export interface StrokeElement {
  id: string;
  type: ToolType;
  points: { x: number; y: number }[];
  color: string;
  width: number;
  text?: string;
  isHighlighter?: boolean;
}

interface CollaborativeWhiteboardProps {
  lessonId: string;
  role: 'tutor' | 'student';
  userName?: string;
  seatWorkStudentId?: string;
  isSeatWorkMode?: boolean;
  onReturnToFullVideo?: () => void;
  seatWorkStudents?: DeskStudent[];
  activeDeskStudentId?: string;
  onSelectDeskStudent?: (id: string) => void;
  activeTaskPrompt?: string;
  onUpdateTaskPrompt?: (prompt: string) => void;
  onGiveStamp?: (stamp: string) => void;
  isHandedIn?: boolean;
  onStudentSubmit?: () => void;
  recentStamp?: string | null;
}

export const BG_CONFIG: Record<
  BgColorType,
  {
    label: string;
    emoji: string;
    hex: string;
    gridColor: string;
    defaultPen: string;
    description: string;
  }
> = {
  'teddy-bear': {
    label: 'Teddy & Stars',
    emoji: '🧸',
    hex: '#FFFDF0',
    gridColor: 'rgba(217, 119, 6, 0.15)',
    defaultPen: '#92400E',
    description: 'Cute teddy bears & star doodles',
  },
  space: {
    label: 'Cosmic Space',
    emoji: '🚀',
    hex: '#0A0F1D',
    gridColor: 'rgba(125, 211, 252, 0.2)',
    defaultPen: '#38BDF8',
    description: 'Starry galaxy & crescent moon',
  },
  'chalk-green': {
    label: 'Chalk Green',
    emoji: '🌿',
    hex: '#064E3B',
    gridColor: 'rgba(255, 255, 255, 0.15)',
    defaultPen: '#FEF08A',
    description: 'Classic school chalkboard',
  },
  'lined-notebook': {
    label: 'Lined Notebook',
    emoji: '📝',
    hex: '#FFFFFF',
    gridColor: 'rgba(59, 130, 246, 0.18)',
    defaultPen: '#1E3A8A',
    description: 'Exercise book with red margin line',
  },
  'math-grid': {
    label: 'Math Grid',
    emoji: '📐',
    hex: '#FFFFFF',
    gridColor: '#E2E8F0',
    defaultPen: '#060E1C',
    description: 'Graph paper for sums & geometry',
  },
  'pastel-sky': {
    label: 'Pastel Sky',
    emoji: '🌈',
    hex: '#F0F9FF',
    gridColor: 'rgba(56, 189, 248, 0.2)',
    defaultPen: '#0369A1',
    description: 'Soft sky blue with gentle clouds',
  },
  'warm-cream': {
    label: 'Warm Cream',
    emoji: '🍦',
    hex: '#FEFCE8',
    gridColor: 'rgba(180, 83, 9, 0.15)',
    defaultPen: '#78350F',
    description: 'Easy-reading gentle cream paper',
  },
  white: {
    label: 'Clean White',
    emoji: '⬜',
    hex: '#FFFFFF',
    gridColor: '#F1F5F9',
    defaultPen: '#060E1C',
    description: 'Crisp blank presentation canvas',
  },
  black: {
    label: 'Chalk Black',
    emoji: '⬛',
    hex: '#18181B',
    gridColor: 'rgba(255, 255, 255, 0.12)',
    defaultPen: '#FFFFFF',
    description: 'Midnight dark chalkboard',
  },
};

const PALETTE_COLORS = [
  '#060E1C', // Dark Slate
  '#FFFFFF', // White
  '#2563EB', // Blue
  '#DC2626', // Red
  '#059669', // Green
  '#F59E0B', // Amber
  '#7C3AED', // Purple
  '#EC4899', // Pink
];

// High-impact sizes: for eraser, L and XL are massive one-swipe erasers
const PEN_SIZES = [
  { label: 'S', value: 2 },
  { label: 'M', value: 5 },
  { label: 'L', value: 10 },
  { label: 'XL', value: 18 },
];

const ERASER_SIZES = [
  { label: 'S', value: 24 },
  { label: 'M', value: 54 },
  { label: 'L', value: 100 },
  { label: 'XL', value: 180 }, // Giant swipe eraser!
];

export function CollaborativeWhiteboard({
  lessonId,
  role,
  userName = 'Learner',
  seatWorkStudentId,
  isSeatWorkMode = false,
  onReturnToFullVideo,
  seatWorkStudents,
  activeDeskStudentId,
  onSelectDeskStudent,
  activeTaskPrompt,
  onUpdateTaskPrompt,
  onGiveStamp,
  isHandedIn,
  onStudentSubmit,
  recentStamp,
}: CollaborativeWhiteboardProps) {
  // Seat-work problem modal state
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [tempPrompt, setTempPrompt] = useState(activeTaskPrompt || '');

  useEffect(() => {
    if (activeTaskPrompt) {
      setTempPrompt(activeTaskPrompt);
    }
  }, [activeTaskPrompt]);
  // Layer 1: Background & Grid canvas (underneath - NEVER erased)
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);
  // Layer 2: Drawing ink canvas (transparent overlay - erased with destination-out)
  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inlineInputRef = useRef<HTMLInputElement | null>(null);

  // Drawing state
  const strokesRef = useRef<StrokeElement[]>([]);
  const redoStackRef = useRef<StrokeElement[]>([]);
  const currentStrokeRef = useRef<StrokeElement | null>(null);
  const isDrawingRef = useRef(false);
  const channelRef = useRef<any>(null);

  // UI state
  const [activeTool, setActiveTool] = useState<ToolType>('pen');
  const [bgColor, setBgColor] = useState<BgColorType>('white');
  const [selectedColor, setSelectedColor] = useState<string>(role === 'tutor' ? '#DC2626' : '#060E1C');
  const [brushWidth, setBrushWidth] = useState<number>(5);
  const [eraserWidth, setEraserWidth] = useState<number>(54);
  const [gridStyle, setGridStyle] = useState<GridType>('math-grid');
  const [studentPensLocked, setStudentPensLocked] = useState<boolean>(false);
  const [stamps, setStamps] = useState<StampItem[]>([]);
  const [selectedStamp, setSelectedStamp] = useState<string | null>(null);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [isDockCollapsed, setIsDockCollapsed] = useState<boolean>(false);
  const [activeFlyout, setActiveFlyout] = useState<'none' | 'colors' | 'shapes' | 'themes' | 'stamps'>('none');
  const [stampTab, setStampTab] = useState<'stamps' | 'emojis'>('stamps');
  const [laserPos, setLaserPos] = useState<{ x: number; y: number } | null>(null);

  // Inline text editing state (NO browser window.prompt!)
  const [inlineTextState, setInlineTextState] = useState<{ x: number; y: number; value: string } | null>(null);

  const canDraw = role === 'tutor' || !studentPensLocked || isSeatWorkMode;

  // Render Background Grid on Layer 1 (NEVER touched by eraser)
  const renderBackgroundLayer = useCallback(() => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const config = BG_CONFIG[bgColor] || BG_CONFIG.white;

    // Fill background base
    ctx.fillStyle = config.hex;
    ctx.fillRect(0, 0, width, height);

    // Render theme-specific artwork on Layer 1 (Eraser operates on Layer 2 and NEVER touches Layer 1)
    if (bgColor === 'teddy-bear') {
      ctx.save();
      ctx.strokeStyle = 'rgba(217, 119, 6, 0.2)';
      ctx.fillStyle = 'rgba(217, 119, 6, 0.12)';
      ctx.lineWidth = 1.8;
      const stepX = 140;
      const stepY = 130;
      for (let x = 70; x < width; x += stepX) {
        for (let y = 65; y < height; y += stepY) {
          const offset = ((Math.floor(x / stepX) % 2) * stepY) / 2;
          const ty = y + offset;
          if (ty > height) continue;

          // Head
          ctx.beginPath();
          ctx.arc(x, ty, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Left Ear
          ctx.beginPath();
          ctx.arc(x - 14, ty - 14, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Right Ear
          ctx.beginPath();
          ctx.arc(x + 14, ty - 14, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Star sparkle
          ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
          ctx.beginPath();
          ctx.arc(x + 32, ty - 22, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'rgba(217, 119, 6, 0.12)';
        }
      }
      ctx.restore();
    } else if (bgColor === 'space') {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      const stepX = 110;
      const stepY = 100;
      for (let x = 40; x < width; x += stepX) {
        for (let y = 40; y < height; y += stepY) {
          const r = ((x * y) % 3) + 1.2;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // Faint crescent moons
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.25)';
      ctx.lineWidth = 2;
      for (let x = 160; x < width; x += 320) {
        for (let y = 140; y < height; y += 260) {
          ctx.beginPath();
          ctx.arc(x, y, 14, 0.2 * Math.PI, 1.3 * Math.PI);
          ctx.stroke();
        }
      }
      ctx.restore();
    } else if (bgColor === 'pastel-sky') {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      for (let x = 90; x < width; x += 220) {
        for (let y = 80; y < height; y += 180) {
          ctx.beginPath();
          ctx.arc(x, y, 16, 0, Math.PI * 2);
          ctx.arc(x + 14, y - 5, 12, 0, Math.PI * 2);
          ctx.arc(x + 28, y, 16, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    } else if (bgColor === 'lined-notebook') {
      ctx.save();
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.18)';
      ctx.lineWidth = 1;
      const step = 34;
      ctx.beginPath();
      for (let y = step; y < height; y += step) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Red margin line
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(60, 0);
      ctx.lineTo(60, height);
      ctx.stroke();
      ctx.restore();
    }

    // Grid overlays
    if (gridStyle !== 'blank' && bgColor !== 'lined-notebook') {
      ctx.save();
      ctx.strokeStyle = config.gridColor;
      ctx.lineWidth = 1;

      if (gridStyle === 'math-grid' || bgColor === 'math-grid') {
        const step = 30;
        ctx.beginPath();
        for (let x = 0; x <= width; x += step) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
        }
        for (let y = 0; y <= height; y += step) {
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
        }
        ctx.stroke();
      } else if (gridStyle === 'lined') {
        const step = 36;
        ctx.beginPath();
        for (let y = step; y <= height; y += step) {
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
        }
        ctx.stroke();
      } else if (gridStyle === 'dots') {
        const step = 32;
        ctx.fillStyle = config.gridColor;
        for (let x = step / 2; x <= width; x += step) {
          for (let y = step / 2; y <= height; y += step) {
            ctx.beginPath();
            ctx.arc(x, y, 1.8, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      ctx.restore();
    }
  }, [bgColor, gridStyle]);

  // Render a single stroke on Layer 2 (Ink layer)
  const renderElement = useCallback((ctx: CanvasRenderingContext2D, el: StrokeElement, width: number, height: number) => {
    ctx.save();

    if (el.type === 'eraser') {
      // PRO ERASER: Cuts through the top ink layer without affecting background grid!
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.fillStyle = 'rgba(0,0,0,1)';
      ctx.lineWidth = el.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (el.points.length === 1) {
        ctx.beginPath();
        ctx.arc(el.points[0].x * width, el.points[0].y * height, el.width / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(el.points[0].x * width, el.points[0].y * height);
        for (let i = 1; i < el.points.length; i++) {
          ctx.lineTo(el.points[i].x * width, el.points[i].y * height);
        }
        ctx.stroke();
      }
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = el.color;
      ctx.fillStyle = el.color;
      ctx.lineWidth = el.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (el.isHighlighter) {
        ctx.globalAlpha = 0.4;
        ctx.lineWidth = el.width * 3.5;
      }

      if (el.type === 'pen' || el.type === 'highlighter') {
        if (el.points.length === 1) {
          ctx.beginPath();
          ctx.arc(el.points[0].x * width, el.points[0].y * height, el.width / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(el.points[0].x * width, el.points[0].y * height);
          for (let i = 1; i < el.points.length; i++) {
            ctx.lineTo(el.points[i].x * width, el.points[i].y * height);
          }
          ctx.stroke();
        }
      } else if (el.type === 'rect' && el.points.length >= 2) {
        const p1 = el.points[0];
        const p2 = el.points[el.points.length - 1];
        ctx.strokeRect(p1.x * width, p1.y * height, (p2.x - p1.x) * width, (p2.y - p1.y) * height);
      } else if (el.type === 'circle' && el.points.length >= 2) {
        const p1 = el.points[0];
        const p2 = el.points[el.points.length - 1];
        const rx = Math.abs((p2.x - p1.x) * width) / 2;
        const ry = Math.abs((p2.y - p1.y) * height) / 2;
        const cx = ((p1.x + p2.x) * width) / 2;
        const cy = ((p1.y + p2.y) * height) / 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (el.type === 'arrow' && el.points.length >= 2) {
        const p1 = el.points[0];
        const p2 = el.points[el.points.length - 1];
        const fromX = p1.x * width;
        const fromY = p1.y * height;
        const toX = p2.x * width;
        const toY = p2.y * height;
        const headlen = 18;
        const angle = Math.atan2(toY - fromY, toX - fromX);

        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
      } else if (el.type === 'text' && el.text) {
        ctx.font = `bold ${Math.max(18, el.width * 4)}px sans-serif`;
        ctx.fillText(el.text, el.points[0].x * width, el.points[0].y * height);
      }
    }

    ctx.restore();
  }, []);

  // Redraw All Ink Elements
  const redrawDrawingLayer = useCallback(() => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    strokesRef.current.forEach((stroke) => {
      renderElement(ctx, stroke, canvas.width, canvas.height);
    });
  }, [renderElement]);

  // Window Resize & Synchronize Both Canvases
  useEffect(() => {
    const updateCanvasSizes = () => {
      const bgCanvas = bgCanvasRef.current;
      const drawCanvas = drawCanvasRef.current;
      const container = containerRef.current;
      if (!bgCanvas || !drawCanvas || !container) return;

      const rect = container.getBoundingClientRect();
      const toolbarHeight = 48;
      const w = Math.floor(rect.width);
      const h = Math.max(300, Math.floor(rect.height - toolbarHeight));

      if (bgCanvas.width !== w || bgCanvas.height !== h) {
        bgCanvas.width = w;
        bgCanvas.height = h;
        drawCanvas.width = w;
        drawCanvas.height = h;
        renderBackgroundLayer();
        redrawDrawingLayer();
      }
    };

    updateCanvasSizes();
    window.addEventListener('resize', updateCanvasSizes);
    return () => window.removeEventListener('resize', updateCanvasSizes);
  }, [renderBackgroundLayer, redrawDrawingLayer]);

  // Re-render background on bgColor or gridStyle change
  useEffect(() => {
    renderBackgroundLayer();
  }, [renderBackgroundLayer]);

  // Supabase Real-time Channel with Full Synchronized State Catchup
  useEffect(() => {
    const supabase = createClient();
    const roomKey = isSeatWorkMode && seatWorkStudentId
      ? `whiteboard:${lessonId}:desk:${seatWorkStudentId}`
      : `whiteboard:${lessonId}:main`;

    const channel = supabase.channel(roomKey);
    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'stroke-added' }, ({ payload }: { payload: StrokeElement }) => {
        strokesRef.current.push(payload);
        const canvas = drawCanvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) renderElement(ctx, payload, canvas.width, canvas.height);
        }
      })
      .on('broadcast', { event: 'board-cleared' }, () => {
        strokesRef.current = [];
        redoStackRef.current = [];
        setStamps([]);
        redrawDrawingLayer();
      })
      .on('broadcast', { event: 'laser-moved' }, ({ payload }: { payload: { x: number; y: number } }) => {
        setLaserPos(payload);
      })
      .on('broadcast', { event: 'stamp-awarded' }, ({ payload }: { payload: StampItem }) => {
        setStamps((prev) => [...prev, payload]);
        playSound('correct');
      })
      .on('broadcast', { event: 'lock-state-changed' }, ({ payload }: { payload: { locked: boolean } }) => {
        setStudentPensLocked(payload.locked);
      })
      .on('broadcast', { event: 'bg-color-changed' }, ({ payload }: { payload: { color: BgColorType } }) => {
        if (payload?.color && BG_CONFIG[payload.color]) {
          setBgColor(payload.color);
        }
      })
      .on('broadcast', { event: 'grid-style-changed' }, ({ payload }: { payload: { style: GridType } }) => {
        if (payload?.style) {
          setGridStyle(payload.style);
        }
      })
      // New Joiner State Catchup: if pupil joins after tutor started, tutor replies with full state
      .on('broadcast', { event: 'request-board-sync' }, () => {
        if (strokesRef.current.length > 0 || stamps.length > 0) {
          channel.send({
            type: 'broadcast',
            event: 'board-sync-response',
            payload: {
              strokes: strokesRef.current,
              stamps,
              bgColor,
              gridStyle,
              studentPensLocked,
            },
          });
        }
      })
      .on('broadcast', { event: 'board-sync-response' }, ({ payload }: any) => {
        if (payload) {
          if (Array.isArray(payload.strokes)) {
            strokesRef.current = payload.strokes;
          }
          if (Array.isArray(payload.stamps)) {
            setStamps(payload.stamps);
          }
          if (payload.bgColor && BG_CONFIG[payload.bgColor as BgColorType]) {
            setBgColor(payload.bgColor);
          }
          if (payload.gridStyle) {
            setGridStyle(payload.gridStyle);
          }
          if (typeof payload.studentPensLocked === 'boolean') {
            setStudentPensLocked(payload.studentPensLocked);
          }
          redrawDrawingLayer();
        }
      })
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          // Ask any peer for the current board state
          channel.send({
            type: 'broadcast',
            event: 'request-board-sync',
            payload: {},
          });
        }
      });

    return () => {
      void channel.unsubscribe();
    };
  }, [lessonId, isSeatWorkMode, seatWorkStudentId, bgColor, gridStyle, studentPensLocked, stamps, redrawDrawingLayer, renderElement]);

  // Coordinate normalizer (0 to 1)
  const getNormCoord = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (clientY - rect.top) / rect.height)),
    };
  };

  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canDraw) return;
    const pt = getNormCoord(e);
    if (!pt) return;

    // 1. Emoji Stamp
    if (selectedEmoji && role === 'tutor') {
      const newStamp: StampItem = {
        id: `emoji-${Date.now()}`,
        type: 'emoji',
        label: selectedEmoji,
        emoji: selectedEmoji,
        x: pt.x,
        y: pt.y,
        awardedBy: userName,
        timestamp: Date.now(),
      };
      setStamps((prev) => [...prev, newStamp]);
      playSound('correct');

      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'stamp-awarded',
          payload: newStamp,
        });
      }
      setSelectedEmoji(null);
      return;
    }

    // 2. Marking Stamp
    if (selectedStamp && role === 'tutor') {
      const preset = STAMP_PRESETS.find((s) => s.type === selectedStamp);
      if (preset) {
        const newStamp: StampItem = {
          id: `stamp-${Date.now()}`,
          type: preset.type,
          label: preset.label,
          emoji: preset.emoji,
          x: pt.x,
          y: pt.y,
          awardedBy: userName,
          timestamp: Date.now(),
        };
        setStamps((prev) => [...prev, newStamp]);
        playSound('correct');

        if (channelRef.current) {
          channelRef.current.send({
            type: 'broadcast',
            event: 'stamp-awarded',
            payload: newStamp,
          });
        }
        setSelectedStamp(null);
      }
      return;
    }

    // 3. Inline Text Placement (NO alert prompt!)
    if (activeTool === 'text') {
      setInlineTextState({ x: pt.x, y: pt.y, value: '' });
      setTimeout(() => inlineInputRef.current?.focus(), 50);
      return;
    }

    // 4. Drawing / Erasing
    isDrawingRef.current = true;
    currentStrokeRef.current = {
      id: `stroke-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type: activeTool,
      points: [pt],
      color: selectedColor,
      width: activeTool === 'eraser' ? eraserWidth : brushWidth,
      isHighlighter: activeTool === 'highlighter',
    };
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const pt = getNormCoord(e);
    if (!pt) return;

    if (activeTool === 'laser' && role === 'tutor') {
      setLaserPos(pt);
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'laser-moved',
          payload: pt,
        });
      }
      return;
    }

    if (!isDrawingRef.current || !currentStrokeRef.current || !canDraw) return;

    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (['pen', 'highlighter', 'eraser'].includes(activeTool)) {
      currentStrokeRef.current.points.push(pt);
      renderElement(ctx, currentStrokeRef.current, canvas.width, canvas.height);
    } else if (['rect', 'circle', 'arrow'].includes(activeTool)) {
      redrawDrawingLayer();
      const previewEl: StrokeElement = {
        ...currentStrokeRef.current,
        points: [currentStrokeRef.current.points[0], pt],
      };
      renderElement(ctx, previewEl, canvas.width, canvas.height);
    }
  };

  const handlePointerUp = () => {
    if (!isDrawingRef.current || !currentStrokeRef.current) return;
    isDrawingRef.current = false;

    strokesRef.current.push(currentStrokeRef.current);
    redoStackRef.current = [];

    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'stroke-added',
        payload: currentStrokeRef.current,
      });
    }

    currentStrokeRef.current = null;
    redrawDrawingLayer();
  };

  // Commit Inline Text
  const commitInlineText = () => {
    if (!inlineTextState || !inlineTextState.value.trim()) {
      setInlineTextState(null);
      return;
    }

    const textElement: StrokeElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      points: [{ x: inlineTextState.x, y: inlineTextState.y }],
      color: selectedColor,
      width: brushWidth,
      text: inlineTextState.value.trim(),
    };

    strokesRef.current.push(textElement);
    redoStackRef.current = [];
    redrawDrawingLayer();

    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'stroke-added',
        payload: textElement,
      });
    }

    setInlineTextState(null);
  };

  const handleUndo = () => {
    if (strokesRef.current.length === 0) return;
    const popped = strokesRef.current.pop();
    if (popped) {
      redoStackRef.current.push(popped);
      redrawDrawingLayer();
      if (channelRef.current) {
        channelRef.current.send({ type: 'broadcast', event: 'board-cleared', payload: {} });
        strokesRef.current.forEach((st) => {
          channelRef.current.send({ type: 'broadcast', event: 'stroke-added', payload: st });
        });
      }
    }
  };

  const handleRedo = () => {
    if (redoStackRef.current.length === 0) return;
    const restored = redoStackRef.current.pop();
    if (restored) {
      strokesRef.current.push(restored);
      redrawDrawingLayer();
      if (channelRef.current) {
        channelRef.current.send({ type: 'broadcast', event: 'stroke-added', payload: restored });
      }
    }
  };

  const handleClear = () => {
    if (window.confirm('Clear all drawings and notes on this whiteboard? (Background stays intact)')) {
      strokesRef.current = [];
      redoStackRef.current = [];
      setStamps([]);
      redrawDrawingLayer();
      if (channelRef.current) {
        channelRef.current.send({ type: 'broadcast', event: 'board-cleared', payload: {} });
      }
    }
  };

  const toggleStudentLock = () => {
    const nextLocked = !studentPensLocked;
    setStudentPensLocked(nextLocked);
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'lock-state-changed',
        payload: { locked: nextLocked },
      });
    }
  };

  const handleSelectBgColor = (color: BgColorType) => {
    setBgColor(color);
    setActiveFlyout('none');

    // Auto-adjust default pen color if contrast is lost
    const conf = BG_CONFIG[color];
    if (color === 'black' || color === 'space' || color === 'chalk-green') {
      if (selectedColor === '#060E1C') setSelectedColor(conf.defaultPen);
    } else {
      if (selectedColor === '#FFFFFF') setSelectedColor(conf.defaultPen);
    }

    if (channelRef.current && role === 'tutor') {
      channelRef.current.send({
        type: 'broadcast',
        event: 'bg-color-changed',
        payload: { color },
      });
    }
  };

  const handleSelectGridStyle = (style: GridType) => {
    setGridStyle(style);
    if (channelRef.current && role === 'tutor') {
      channelRef.current.send({
        type: 'broadcast',
        event: 'grid-style-changed',
        payload: { style },
      });
    }
  };

  const handleExportPNG = () => {
    const bgCanvas = bgCanvasRef.current;
    const drawCanvas = drawCanvasRef.current;
    if (!bgCanvas || !drawCanvas) return;

    // Merge both layers into single snapshot
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = bgCanvas.width;
    exportCanvas.height = bgCanvas.height;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(bgCanvas, 0, 0);
    ctx.drawImage(drawCanvas, 0, 0);

    const imageUri = exportCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `Edvoura_Board_${lessonId}_${Date.now()}.png`;
    link.href = imageUri;
    link.click();
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full w-full bg-white overflow-hidden relative select-none font-sans"
    >
      {/* ============================================================
          UNIFIED TOP BAR (ZERO HORIZONTAL SCROLL - ALWAYS FITS)
          ============================================================ */}
      <div className="h-10 border-b-[2.5px] border-dark bg-yellow/30 px-3 flex items-center justify-between shrink-0 text-xs font-black">
        {/* Left: Desk Switcher / Student Badges, Lock, Problem Chip */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          {isSeatWorkMode ? (
            <>
              {/* Student Desk Selector Pills (Compact & Executive) */}
              {seatWorkStudents && seatWorkStudents.length > 0 ? (
                <div className="flex items-center gap-1 shrink-0">
                  {seatWorkStudents.map((s) => {
                    const isSelected = activeDeskStudentId === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => onSelectDeskStudent?.(s.id)}
                        className={`flex items-center gap-1.5 h-7 px-2 sm:px-2.5 rounded-lg border text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                          isSelected
                            ? 'bg-yellow text-dark border-dark shadow-[1px_1px_0px_#060E1C]'
                            : 'bg-white/80 hover:bg-white text-dark/70 border-dark/25'
                        }`}
                        title={`View ${s.name}'s Desk`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            s.isSubmitted ? 'bg-blue-500 animate-pulse' : s.hasActivity ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                        />
                        <span className="truncate max-w-[85px] sm:max-w-[120px]">{s.name}</span>
                        {s.isSubmitted && (
                          <span className="text-[9px] bg-blue-100 text-blue-900 px-1 py-0.2 rounded font-black shrink-0">
                            Done
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-black text-dark tracking-tight shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse border border-dark" />
                  Student Desk
                </span>
              )}

              {/* Tutor Student Lock Toggle */}
              {role === 'tutor' && (
                <button
                  onClick={toggleStudentLock}
                  className={`flex items-center gap-1 h-7 px-2 rounded-lg border-[1.5px] border-dark font-black text-[10px] uppercase shadow-[1px_1px_0px_#060E1C] active:scale-95 transition-all shrink-0 ${
                    studentPensLocked ? 'bg-rose-400 text-dark' : 'bg-emerald-300 text-dark'
                  }`}
                  title="Lock student from drawing"
                >
                  {studentPensLocked ? <Lock className="h-2.5 w-2.5" /> : <Unlock className="h-2.5 w-2.5" />}
                  <span className="hidden sm:inline">{studentPensLocked ? 'Locked' : 'Open'}</span>
                </button>
              )}

              {/* Compact Task Problem Trigger Chip */}
              {activeTaskPrompt && (
                <button
                  onClick={() => setShowPromptModal(true)}
                  className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg bg-white/85 hover:bg-white border border-dark/30 text-dark text-xs font-bold max-w-[150px] sm:max-w-xs md:max-w-sm lg:max-w-md truncate shadow-[1px_1px_0px_#060E1C] active:scale-95 transition-all cursor-pointer"
                  title="Click to view or edit the desk problem prompt"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span className="truncate text-dark/90">
                    <span className="text-dark font-black">Problem:</span> {activeTaskPrompt}
                  </span>
                  {role === 'tutor' && <Edit3 className="w-3 h-3 text-dark/60 shrink-0 ml-0.5" />}
                </button>
              )}
            </>
          ) : (
            <>
              <span className="flex items-center gap-1.5 text-xs font-black text-dark tracking-tight">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse border border-dark" />
                Interactive Whiteboard
              </span>

              {role === 'tutor' && (
                <button
                  onClick={toggleStudentLock}
                  className={`flex items-center gap-1 h-6 px-2 rounded-md border-[1.5px] border-dark font-black text-[10px] uppercase shadow-[1px_1px_0px_#060E1C] active:scale-95 transition-all ${
                    studentPensLocked ? 'bg-rose-400 text-dark' : 'bg-emerald-300 text-dark'
                  }`}
                  title="Lock student from drawing"
                >
                  {studentPensLocked ? <Lock className="h-2.5 w-2.5" /> : <Unlock className="h-2.5 w-2.5" />}
                  <span>{studentPensLocked ? 'Student Locked' : 'Student Open'}</span>
                </button>
              )}
            </>
          )}

          {activeTool === 'eraser' ? (
            <span className="hidden xl:inline-flex items-center gap-1 text-[10px] font-black uppercase text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-300">
              <Eraser className="h-3 w-3" /> Eraser
            </span>
          ) : selectedStamp || selectedEmoji ? (
            <span className="hidden xl:inline-flex items-center gap-1 text-[10px] font-black uppercase text-purple-900 bg-purple-100 px-2 py-0.5 rounded-md border border-purple-300 animate-pulse">
              <Award className="h-3 w-3" /> Stamp Armed
            </span>
          ) : null}
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Tutor Feedback Stamps (Compact in header) */}
          {role === 'tutor' && onGiveStamp && (
            <div className="hidden md:flex items-center gap-1 bg-white/70 border border-dark/20 p-0.5 rounded-lg mr-1">
              {[
                { stamp: '⭐ Super Star (+50 XP)', label: '⭐ Star' },
                { stamp: '💯 100% Accuracy', label: '💯 100%' },
                { stamp: '💡 Creative Method', label: '💡 Idea' },
                { stamp: '🔄 Check Step 2', label: '🔄 Re-check' },
              ].map((st) => (
                <button
                  key={st.label}
                  onClick={() => onGiveStamp(st.stamp)}
                  className="h-6 px-1.5 rounded bg-yellow/20 hover:bg-yellow border border-dark/30 text-dark font-bold text-[10px] transition-all active:scale-95 cursor-pointer"
                  title={`Send "${st.stamp}" feedback stamp to student`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          )}

          {/* Student Hand In Button */}
          {role === 'student' && onStudentSubmit && (
            <button
              onClick={onStudentSubmit}
              disabled={isHandedIn}
              className={`flex items-center gap-1 h-7 px-2.5 rounded-lg border-[1.5px] border-dark text-xs font-bold transition-all shadow-[1px_1px_0px_#060E1C] mr-1 ${
                isHandedIn
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-500'
                  : 'bg-yellow hover:bg-yellow/90 text-dark active:scale-95'
              }`}
            >
              {isHandedIn ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Send className="w-3.5 h-3.5" />}
              <span>{isHandedIn ? 'Handed In!' : 'Hand In Work'}</span>
            </button>
          )}

          {/* Undo, Redo, Clear, Save PNG */}
          <button
            onClick={handleUndo}
            className="h-7 w-7 rounded-lg border-[1.5px] border-dark bg-white hover:bg-slate-100 flex items-center justify-center shadow-[1px_1px_0px_#060E1C] active:scale-95"
            title="Undo"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={handleRedo}
            className="h-7 w-7 rounded-lg border-[1.5px] border-dark bg-white hover:bg-slate-100 flex items-center justify-center shadow-[1px_1px_0px_#060E1C] active:scale-95"
            title="Redo"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={handleClear}
            className="h-7 w-7 rounded-lg border-[1.5px] border-dark bg-rose-100 hover:bg-rose-200 text-rose-700 flex items-center justify-center shadow-[1px_1px_0px_#060E1C] active:scale-95"
            title="Clear Ink"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={handleExportPNG}
            className="flex items-center gap-1 h-7 px-2 rounded-lg border-[1.5px] border-dark bg-white hover:bg-slate-100 font-black text-[10px] uppercase shadow-[1px_1px_0px_#060E1C] active:scale-95"
            title="Save PNG Snapshot"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Save</span>
          </button>

          {onReturnToFullVideo && (
            <button
              onClick={onReturnToFullVideo}
              className="flex items-center gap-1 h-7 px-2.5 rounded-lg border-[1.5px] border-dark bg-yellow text-dark font-black text-[10px] uppercase shadow-[1px_1px_0px_#060E1C] active:scale-95 transition-all ml-1"
              title="Return to Full Video View"
            >
              <Video className="h-3.5 w-3.5" />
              <span>Full Video</span>
            </button>
          )}
        </div>
      </div>

      {/* ============================================================
          MAIN DUAL-LAYER STAGE (100% WIDESCREEN & ZERO SCROLL)
          Layer 1: Background & Grid (underneath, NEVER erased)
          Layer 2: Transparent Drawing Ink Canvas (erased cleanly)
          ============================================================ */}
      <div
        className="flex-1 w-full h-full min-h-0 relative overflow-hidden"
        style={{
          cursor:
            selectedStamp || selectedEmoji
              ? getDrawingCursor('stamp')
              : getDrawingCursor(activeTool, selectedColor),
        }}
      >
        {/* ============================================================
            COLLAPSIBLE LEFT-SIDE TOOL DOCK (EXPAND / TUCK AWAY)
            ============================================================ */}
        {isDockCollapsed ? (
          <button
            onClick={() => setIsDockCollapsed(false)}
            className="absolute left-3 top-3 z-30 flex items-center gap-1.5 px-3 py-2 bg-yellow hover:bg-yellow/90 text-dark border-[2.5px] border-dark rounded-2xl shadow-[3px_3px_0px_#060E1C] font-black text-xs transition-all active:scale-95 animate-in fade-in cursor-pointer"
            title="Open Drawing Tools Dock"
          >
            <Pencil className="h-4 w-4" />
            <span>Tools</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        ) : (
          <div className="absolute left-3 top-3 z-30 flex flex-col gap-1.5 p-1.5 bg-white/95 backdrop-blur border-[2.5px] border-dark rounded-2xl shadow-[4px_4px_0px_#060E1C] animate-in fade-in cursor-default">
            {/* Collapse / Close Button at top of dock */}
            <button
              onClick={() => {
                setIsDockCollapsed(true);
                setActiveFlyout('none');
              }}
              className="w-9 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-dark/70 hover:text-dark flex items-center justify-center transition-all border border-dark/15 mb-0.5 group"
              title="Close / Tuck Tools Dock"
            >
              <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            </button>

            {/* Pen */}
            <button
              onClick={() => {
                setActiveTool('pen');
                setSelectedStamp(null);
                setSelectedEmoji(null);
              }}
              className={`w-9 h-9 rounded-xl flex items-center justify-center border-[2px] transition-all ${
                activeTool === 'pen' && !selectedStamp && !selectedEmoji
                  ? 'bg-yellow border-dark shadow-[1.5px_1.5px_0px_#060E1C] scale-105'
                  : 'border-transparent hover:bg-slate-100 text-dark/70'
              }`}
              title="Pen (Draw)"
            >
              <Pencil className="h-4 w-4" style={{ color: selectedColor }} />
            </button>

            {/* Marker / Highlighter */}
            <button
              onClick={() => {
                setActiveTool('highlighter');
                setSelectedStamp(null);
                setSelectedEmoji(null);
              }}
              className={`w-9 h-9 rounded-xl flex items-center justify-center border-[2px] transition-all ${
                activeTool === 'highlighter'
                  ? 'bg-yellow border-dark shadow-[1.5px_1.5px_0px_#060E1C] scale-105'
                  : 'border-transparent hover:bg-slate-100 text-dark/70'
              }`}
              title="Highlighter Marker"
            >
              <Highlighter className="h-4 w-4 text-amber-600" />
            </button>

            {/* Eraser */}
            <button
              onClick={() => {
                setActiveTool('eraser');
                setSelectedStamp(null);
                setSelectedEmoji(null);
              }}
              className={`w-9 h-9 rounded-xl flex items-center justify-center border-[2px] transition-all ${
                activeTool === 'eraser'
                  ? 'bg-rose-100 border-dark text-rose-700 shadow-[1.5px_1.5px_0px_#060E1C] scale-105'
                  : 'border-transparent hover:bg-slate-100 text-dark/70'
              }`}
              title="Eraser (Removes ink cleanly, never harms background artwork!)"
            >
              <Eraser className="h-4 w-4 text-rose-600" />
            </button>

            {/* Inline Text */}
            <button
              onClick={() => {
                setActiveTool('text');
                setSelectedStamp(null);
                setSelectedEmoji(null);
              }}
              className={`w-9 h-9 rounded-xl flex items-center justify-center border-[2px] transition-all ${
                activeTool === 'text'
                  ? 'bg-yellow border-dark shadow-[1.5px_1.5px_0px_#060E1C] scale-105'
                  : 'border-transparent hover:bg-slate-100 text-dark/70'
              }`}
              title="Text Note (Click canvas to type)"
            >
              <Type className="h-4 w-4" />
            </button>

            {/* Shapes Flyout Toggle */}
            <button
              onClick={() => setActiveFlyout(activeFlyout === 'shapes' ? 'none' : 'shapes')}
              className={`w-9 h-9 rounded-xl flex items-center justify-center border-[2px] transition-all ${
                ['rect', 'circle', 'arrow'].includes(activeTool) || activeFlyout === 'shapes'
                  ? 'bg-yellow border-dark shadow-[1.5px_1.5px_0px_#060E1C] scale-105'
                  : 'border-transparent hover:bg-slate-100 text-dark/70'
              }`}
              title="Geometric Shapes (Rectangle, Circle, Arrow)"
            >
              {activeTool === 'circle' ? (
                <Circle className="h-4 w-4" />
              ) : activeTool === 'arrow' ? (
                <ArrowRight className="h-4 w-4" />
              ) : (
                <Square className="h-4 w-4" />
              )}
            </button>

            {/* Colors & Sizes Flyout Toggle */}
            <button
              onClick={() => setActiveFlyout(activeFlyout === 'colors' ? 'none' : 'colors')}
              className={`w-9 h-9 rounded-xl flex items-center justify-center border-[2px] transition-all ${
                activeFlyout === 'colors'
                  ? 'bg-yellow border-dark shadow-[1.5px_1.5px_0px_#060E1C] scale-105'
                  : 'border-transparent hover:bg-slate-100'
              }`}
              title="Colors & Stroke Sizes"
            >
              <span
                className="w-4 h-4 rounded-full border-[1.5px] border-dark shadow-sm"
                style={{ backgroundColor: selectedColor }}
              />
            </button>

            <div className="w-full h-[1.5px] bg-dark/15 my-0.5" />

            {/* Themes & Backgrounds Flyout Toggle (Crystal clear Palette & BG Badge) */}
            <button
              onClick={() => setActiveFlyout(activeFlyout === 'themes' ? 'none' : 'themes')}
              className={`w-9 h-9 rounded-xl flex items-center justify-center border-[2px] transition-all relative ${
                activeFlyout === 'themes'
                  ? 'bg-amber-400 border-dark shadow-[1.5px_1.5px_0px_#060E1C] scale-105'
                  : 'border-transparent hover:bg-amber-100 text-amber-900 bg-amber-50'
              }`}
              title="Classroom Themes & Backgrounds (Teddy Bear, Space, Chalk Green, Notebook, etc.)"
            >
              <Palette className="h-4 w-4 text-amber-700" />
              <span className="text-[8px] font-black uppercase text-amber-950 absolute -bottom-1 -right-1 bg-yellow px-1 rounded-full border border-dark leading-none py-0.5">
                BG
              </span>
            </button>

          {/* Stamps & Emojis Flyout Toggle */}
          {role === 'tutor' && (
            <button
              onClick={() => setActiveFlyout(activeFlyout === 'stamps' ? 'none' : 'stamps')}
              className={`w-9 h-9 rounded-xl flex items-center justify-center border-[2px] transition-all ${
                selectedStamp || selectedEmoji || activeFlyout === 'stamps'
                  ? 'bg-purple-300 border-dark shadow-[1.5px_1.5px_0px_#060E1C] scale-105'
                  : 'border-transparent hover:bg-purple-100 text-purple-900'
              }`}
              title="Reward Stamps & Emojis"
            >
              <Award className="h-4 w-4 text-purple-900" />
            </button>
          )}

          {/* Laser Pointer (Tutor only) */}
          {role === 'tutor' && (
            <button
              onClick={() => {
                setActiveTool('laser');
                setSelectedStamp(null);
                setSelectedEmoji(null);
              }}
              className={`w-9 h-9 rounded-xl flex items-center justify-center border-[2px] transition-all ${
                activeTool === 'laser'
                  ? 'bg-rose-500 text-white border-dark shadow-[1.5px_1.5px_0px_#060E1C] scale-105'
                  : 'border-transparent hover:bg-slate-100 text-rose-500'
              }`}
              title="Laser Pointer"
            >
              <Radio className="h-4 w-4" />
            </button>
          )}
        </div>
        )}

        {/* ============================================================
            COLLAPSIBLE FLYOUT DRAWERS (ADJACENT TO DOCK)
            ============================================================ */}

        {/* 1. Themes & Backgrounds Flyout */}
        {activeFlyout === 'themes' && (
          <div className="absolute left-16 top-3 w-80 max-h-[85vh] overflow-y-auto bg-white border-[3px] border-dark rounded-2xl shadow-[6px_6px_0px_#060E1C] p-3.5 z-40 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 mb-2.5 border-b-[2px] border-dark/15">
              <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-wider text-dark">
                <Palette className="h-4 w-4 text-amber-500" /> Board Themes
              </div>
              <button
                onClick={() => setActiveFlyout('none')}
                className="h-6 w-6 rounded-lg bg-slate-100 hover:bg-slate-200 border border-dark flex items-center justify-center text-xs font-black"
                title="Close"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {(Object.keys(BG_CONFIG) as BgColorType[]).map((key) => {
                const conf = BG_CONFIG[key];
                const isSelected = bgColor === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      handleSelectBgColor(key);
                    }}
                    className={`text-left p-2 rounded-xl border-[2px] transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-dark bg-yellow/30 shadow-[2px_2px_0px_#060E1C] font-black'
                        : 'border-slate-200 hover:border-dark hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg border-[1.5px] border-dark flex items-center justify-center text-base shadow-xs shrink-0"
                        style={{ backgroundColor: conf.hex }}
                      >
                        {conf.emoji}
                      </div>
                      <div>
                        <div className="text-xs font-black text-dark leading-tight">{conf.label}</div>
                        <div className="text-[10px] text-dark/60 font-semibold">{conf.description}</div>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-black uppercase bg-dark text-white px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Grid & Paper Styles Selector */}
            <div className="mt-3 pt-2.5 border-t border-dark/15">
              <div className="text-[10px] font-black uppercase text-dark/70 mb-1.5 flex items-center gap-1">
                <Grid className="h-3 w-3" /> Grid & Paper Guide
              </div>
              <div className="grid grid-cols-4 gap-1">
                {(['blank', 'math-grid', 'lined', 'dots'] as GridType[]).map((g) => (
                  <button
                    key={g}
                    onClick={() => handleSelectGridStyle(g)}
                    className={`py-1.5 rounded-lg border-[1.5px] border-dark text-[10px] font-black uppercase transition-all ${
                      gridStyle === g
                        ? 'bg-dark text-white shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-dark/70'
                    }`}
                  >
                    {g === 'math-grid' ? 'Math' : g === 'lined' ? 'Lined' : g === 'dots' ? 'Dots' : 'Blank'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. Colors & Sizes Flyout */}
        {activeFlyout === 'colors' && (
          <div className="absolute left-16 top-3 w-64 bg-white border-[3px] border-dark rounded-2xl shadow-[6px_6px_0px_#060E1C] p-3.5 z-40 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 mb-2.5 border-b-[2px] border-dark/15">
              <div className="font-black text-xs uppercase tracking-wider text-dark">
                {activeTool === 'eraser' ? 'Eraser Sizes' : 'Pen Color & Size'}
              </div>
              <button
                onClick={() => setActiveFlyout('none')}
                className="h-6 w-6 rounded-lg bg-slate-100 hover:bg-slate-200 border border-dark flex items-center justify-center text-xs font-black"
              >
                ✕
              </button>
            </div>

            {activeTool !== 'eraser' && (
              <div className="mb-3">
                <div className="text-[10px] font-black uppercase text-dark/60 mb-1.5">Color Palette</div>
                <div className="grid grid-cols-4 gap-2">
                  {PALETTE_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`h-8 rounded-xl border-[2px] border-dark transition-all flex items-center justify-center ${
                        selectedColor === c ? 'scale-110 ring-2 ring-dark shadow-sm' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                      title={c}
                    >
                      {selectedColor === c && (
                        <span className={`text-xs ${c === '#FFFFFF' ? 'text-dark font-black' : 'text-white'}`}>✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="text-[10px] font-black uppercase text-dark/60 mb-1.5">
                {activeTool === 'eraser' ? 'Eraser Size (L & XL Erase Instantly)' : 'Stroke Width'}
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {(activeTool === 'eraser' ? ERASER_SIZES : PEN_SIZES).map((b) => {
                  const currentVal = activeTool === 'eraser' ? eraserWidth : brushWidth;
                  const isSelected = currentVal === b.value;
                  return (
                    <button
                      key={b.value}
                      onClick={() => {
                        if (activeTool === 'eraser') {
                          setEraserWidth(b.value);
                        } else {
                          setBrushWidth(b.value);
                        }
                      }}
                      className={`py-1.5 rounded-xl border-[2px] border-dark text-xs font-black transition-all ${
                        isSelected
                          ? 'bg-yellow text-dark shadow-[1.5px_1.5px_0px_#060E1C]'
                          : 'bg-white hover:bg-slate-100 text-dark/70'
                      }`}
                    >
                      {b.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 3. Shapes Flyout */}
        {activeFlyout === 'shapes' && (
          <div className="absolute left-16 top-16 w-52 bg-white border-[3px] border-dark rounded-2xl shadow-[6px_6px_0px_#060E1C] p-3 z-40 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 mb-2 border-b-[2px] border-dark/15">
              <div className="font-black text-xs uppercase tracking-wider text-dark">Draw Shapes</div>
              <button
                onClick={() => setActiveFlyout('none')}
                className="h-5 w-5 rounded bg-slate-100 hover:bg-slate-200 border border-dark flex items-center justify-center text-[10px] font-black"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => {
                  setActiveTool('rect');
                  setActiveFlyout('none');
                }}
                className={`p-2 rounded-xl text-xs font-black flex items-center gap-2 border-[1.5px] transition-all ${
                  activeTool === 'rect' ? 'bg-yellow border-dark shadow-xs' : 'border-transparent hover:bg-slate-100'
                }`}
              >
                <Square className="h-4 w-4" /> Rectangle / Box
              </button>
              <button
                onClick={() => {
                  setActiveTool('circle');
                  setActiveFlyout('none');
                }}
                className={`p-2 rounded-xl text-xs font-black flex items-center gap-2 border-[1.5px] transition-all ${
                  activeTool === 'circle' ? 'bg-yellow border-dark shadow-xs' : 'border-transparent hover:bg-slate-100'
                }`}
              >
                <Circle className="h-4 w-4" /> Circle / Oval
              </button>
              <button
                onClick={() => {
                  setActiveTool('arrow');
                  setActiveFlyout('none');
                }}
                className={`p-2 rounded-xl text-xs font-black flex items-center gap-2 border-[1.5px] transition-all ${
                  activeTool === 'arrow' ? 'bg-yellow border-dark shadow-xs' : 'border-transparent hover:bg-slate-100'
                }`}
              >
                <ArrowRight className="h-4 w-4" /> Direction Arrow
              </button>
            </div>
          </div>
        )}

        {/* 4. Stamps & Emojis Flyout */}
        {activeFlyout === 'stamps' && role === 'tutor' && (
          <div className="absolute left-16 top-3 w-80 max-h-[85vh] bg-white border-[3px] border-dark rounded-2xl shadow-[6px_6px_0px_#060E1C] p-3.5 z-40 animate-in fade-in zoom-in-95 flex flex-col">
            <div className="flex items-center justify-between pb-2 mb-2 border-b-[2px] border-dark/15 shrink-0">
              <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-wider text-dark">
                <Award className="h-4 w-4 text-purple-600" /> Reward Stamps
              </div>
              <button
                onClick={() => setActiveFlyout('none')}
                className="h-6 w-6 rounded-lg bg-slate-100 hover:bg-slate-200 border border-dark flex items-center justify-center text-xs font-black"
              >
                ✕
              </button>
            </div>

            {/* Armed banner */}
            {(selectedStamp || selectedEmoji) && (
              <div className="mb-2 p-2 bg-purple-100 border-[2px] border-purple-500 rounded-xl text-xs font-black text-purple-900 flex items-center justify-between shrink-0">
                <span className="flex items-center gap-1.5">
                  <span className="animate-bounce">{selectedEmoji || '⭐'}</span> Armed: Click canvas to stamp!
                </span>
                <button
                  onClick={() => {
                    setSelectedStamp(null);
                    setSelectedEmoji(null);
                  }}
                  className="text-[10px] underline uppercase"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl mb-2 shrink-0 border border-dark/15">
              <button
                onClick={() => setStampTab('stamps')}
                className={`flex-1 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                  stampTab === 'stamps' ? 'bg-yellow text-dark border border-dark shadow-xs' : 'text-dark/70 hover:text-dark'
                }`}
              >
                Teacher Praise
              </button>
              <button
                onClick={() => setStampTab('emojis')}
                className={`flex-1 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                  stampTab === 'emojis' ? 'bg-yellow text-dark border border-dark shadow-xs' : 'text-dark/70 hover:text-dark'
                }`}
              >
                Fun Emojis
              </button>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto pr-1">
              {stampTab === 'stamps' ? (
                <div className="space-y-1.5">
                  {STAMP_PRESETS.map((st) => (
                    <button
                      key={st.type}
                      onClick={() => {
                        setSelectedStamp(st.type);
                        setSelectedEmoji(null);
                        setActiveFlyout('none');
                      }}
                      className={`w-full text-left p-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 border-[2px] border-dark shadow-[1.5px_1.5px_0px_#060E1C] active:scale-95 ${st.bg} ${st.text}`}
                    >
                      <span className="text-base">{st.emoji}</span>
                      <span className="truncate">{st.label}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2 p-1">
                  {EMOJI_PRESETS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        setSelectedEmoji(emoji);
                        setSelectedStamp(null);
                        setActiveFlyout('none');
                      }}
                      className="h-12 text-2xl flex items-center justify-center rounded-xl bg-slate-50 border-[2px] border-dark hover:bg-yellow hover:scale-110 transition-all shadow-[1.5px_1.5px_0px_#060E1C] active:scale-95"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Layer 1: Background Canvas */}
        <canvas
          ref={bgCanvasRef}
          className="absolute inset-0 w-full h-full block pointer-events-none"
        />

        {/* Layer 2: Transparent Drawing Canvas */}
        <canvas
          ref={drawCanvasRef}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          className="absolute inset-0 w-full h-full block z-10"
          style={{
            cursor: canDraw
              ? selectedStamp || selectedEmoji
                ? getDrawingCursor('stamp')
                : getDrawingCursor(activeTool, selectedColor)
              : 'not-allowed',
          }}
        />

        {/* INLINE TEXT INPUT OVERLAY (NO BROWSER PROMPT POPUP!) */}
        {inlineTextState && (
          <div
            style={{
              position: 'absolute',
              left: `${inlineTextState.x * 100}%`,
              top: `${inlineTextState.y * 100}%`,
              transform: 'translate(0, -50%)',
              zIndex: 40,
            }}
            className="flex items-center gap-1.5 p-1.5 bg-white border-[2.5px] border-dark rounded-xl shadow-[4px_4px_0px_#060E1C] animate-in zoom-in-95 duration-100"
          >
            <input
              ref={inlineInputRef}
              type="text"
              placeholder="Type note, equation, or word..."
              value={inlineTextState.value}
              onChange={(e) => setInlineTextState({ ...inlineTextState, value: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitInlineText();
                if (e.key === 'Escape') setInlineTextState(null);
              }}
              className="px-2 py-1 text-sm font-black text-dark border-none outline-none min-w-[200px] sm:min-w-[260px] bg-transparent"
              autoFocus
            />
            <button
              onClick={commitInlineText}
              className="px-2.5 py-1 bg-yellow hover:bg-yellow/80 text-dark text-xs font-black uppercase rounded-lg border border-dark shadow-[1px_1px_0px_#060E1C] active:scale-95"
            >
              Add
            </button>
            <button
              onClick={() => setInlineTextState(null)}
              className="px-2 py-1 text-xs font-black text-rose-600 hover:bg-rose-50 rounded-lg"
            >
              ✕
            </button>
          </div>
        )}

        {/* Real-time Laser Pointer Indicator */}
        {laserPos && (
          <div
            style={{
              position: 'absolute',
              left: `${laserPos.x * 100}%`,
              top: `${laserPos.y * 100}%`,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 30,
            }}
          >
            <div className="w-5 h-5 rounded-full bg-rose-500 shadow-[0_0_15px_#EF4444] animate-ping" />
            <div className="w-3 h-3 rounded-full bg-white absolute inset-1 border border-rose-600" />
          </div>
        )}

        {/* Awarded Stamps & Emojis Overlay */}
        {stamps.map((stamp) => (
          <div
            key={stamp.id}
            style={{
              position: 'absolute',
              left: `${stamp.x * 100}%`,
              top: `${stamp.y * 100}%`,
              transform: 'translate(-50%, -50%) scale(1.1) rotate(-3deg)',
              pointerEvents: 'none',
              zIndex: 25,
            }}
            className="animate-in zoom-in-50 duration-200"
          >
            {stamp.type === 'emoji' ? (
              <div className="text-4xl drop-shadow-lg select-none">{stamp.emoji}</div>
            ) : (
              <div className="px-3 py-1.5 rounded-xl border-[3px] border-dark bg-yellow text-dark font-black text-xs uppercase shadow-[4px_4px_0px_#060E1C] flex items-center gap-1.5 select-none">
                <span>{stamp.emoji || '⭐'}</span>
                <span>{stamp.label}</span>
              </div>
            )}
          </div>
        ))}

        {/* Real-time Floating Seat-Work Feedback Stamp Toast */}
        {recentStamp && (
          <div className="absolute top-3 right-3 z-40 flex items-center gap-2 px-3.5 py-2 bg-yellow border-[2.5px] border-dark rounded-2xl shadow-[4px_4px_0px_#060E1C] font-black text-xs text-dark animate-bounce pointer-events-none">
            <Sparkles className="w-4 h-4 text-dark" />
            <span>Tutor Feedback: {recentStamp}</span>
          </div>
        )}

        {/* Seat-Work Problem Prompt Modal (View & Tutor Editing) */}
        {showPromptModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full max-w-lg bg-white border-[3px] border-dark rounded-3xl shadow-[8px_8px_0px_#060E1C] p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b-[2px] border-dark">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-amber-100 rounded-xl border border-dark">
                    <BookOpen className="w-4 h-4 text-amber-800" />
                  </span>
                  <div>
                    <h3 className="font-black text-sm uppercase text-dark">Seat-Work Problem Prompt</h3>
                    <p className="text-[11px] font-semibold text-dark/60">Practice exercise displayed on student desks</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPromptModal(false)}
                  className="w-7 h-7 rounded-lg border-[1.5px] border-dark bg-white hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center font-black cursor-pointer text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-dark">Practice Exercise / Task</label>
                <textarea
                  value={tempPrompt}
                  onChange={(e) => setTempPrompt(e.target.value)}
                  disabled={role !== 'tutor'}
                  rows={3}
                  className="w-full p-3 bg-slate-50 border-[2px] border-dark rounded-xl font-bold text-xs focus:bg-white focus:outline-none disabled:opacity-80"
                  placeholder="Enter practice problem or exercise..."
                />
              </div>

              {role === 'tutor' && (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black uppercase text-dark/60">Quick Presets:</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      'Calculate Profit & % Profit: CP=$150, SP=$210',
                      'Find perimeter & area: L=12cm, W=7cm',
                      'Solve for x: 3x + 15 = 45',
                      'Write 2 sentences with an adjective and adverb',
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setTempPrompt(preset)}
                        className="text-left p-1.5 rounded-lg border border-dark/20 hover:border-dark hover:bg-yellow/20 text-[11px] font-bold text-dark truncate transition-all cursor-pointer"
                      >
                        ✏️ {preset}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-dark/15">
                <button
                  type="button"
                  onClick={() => setShowPromptModal(false)}
                  className="h-8 px-3 rounded-xl border-[1.5px] border-dark bg-white hover:bg-slate-100 font-black text-xs uppercase"
                >
                  Close
                </button>
                {role === 'tutor' && onUpdateTaskPrompt && (
                  <button
                    type="button"
                    onClick={() => {
                      if (tempPrompt.trim()) {
                        onUpdateTaskPrompt(tempPrompt.trim());
                      }
                      setShowPromptModal(false);
                    }}
                    className="h-8 px-4 rounded-xl border-[2px] border-dark bg-yellow hover:bg-yellow/90 font-black text-xs uppercase text-dark shadow-[2px_2px_0px_#060E1C]"
                  >
                    Update Student Desks
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
