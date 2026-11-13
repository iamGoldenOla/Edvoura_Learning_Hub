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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { STAMP_PRESETS, EMOJI_PRESETS, StampItem } from './BoardStamps';
import { playSound } from '@/utils/sounds';

export type ToolType = 'pen' | 'highlighter' | 'eraser' | 'text' | 'rect' | 'circle' | 'arrow' | 'laser';
export type GridType = 'blank' | 'math-grid' | 'lined' | 'dots';
export type BgColorType = 'white' | 'black' | 'navy' | 'mild-blue' | 'warm-cream' | 'chalk-green';

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
}

const BG_CONFIG: Record<BgColorType, { label: string; hex: string; gridColor: string; defaultPen: string }> = {
  white: { label: 'White', hex: '#FFFFFF', gridColor: '#E2E8F0', defaultPen: '#060E1C' },
  black: { label: 'Chalk Black', hex: '#18181B', gridColor: 'rgba(255, 255, 255, 0.15)', defaultPen: '#FFFFFF' },
  navy: { label: 'Navy Blue', hex: '#0F172A', gridColor: 'rgba(56, 189, 248, 0.2)', defaultPen: '#38BDF8' },
  'mild-blue': { label: 'Mild Blue', hex: '#E0F2FE', gridColor: 'rgba(2, 132, 199, 0.18)', defaultPen: '#0369A1' },
  'warm-cream': { label: 'Warm Cream', hex: '#FEFCE8', gridColor: 'rgba(180, 83, 9, 0.15)', defaultPen: '#78350F' },
  'chalk-green': { label: 'Chalk Green', hex: '#064E3B', gridColor: 'rgba(255, 255, 255, 0.18)', defaultPen: '#FEF08A' },
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
}: CollaborativeWhiteboardProps) {
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
  const [showStampsMenu, setShowStampsMenu] = useState<boolean>(false);
  const [stampTab, setStampTab] = useState<'stamps' | 'emojis'>('stamps');
  const [showBgMenu, setShowBgMenu] = useState<boolean>(false);
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

    // Fill background color
    ctx.fillStyle = config.hex;
    ctx.fillRect(0, 0, width, height);

    if (gridStyle === 'blank') return;

    ctx.save();
    ctx.strokeStyle = config.gridColor;
    ctx.lineWidth = 1;

    if (gridStyle === 'math-grid') {
      const step = 32;
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
    setShowBgMenu(false);

    // Auto-adjust default pen color if contrast is lost
    const conf = BG_CONFIG[color];
    if (color === 'black' || color === 'navy' || color === 'chalk-green') {
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
          UNIFIED COMPACT TOOLBAR (SINGLE 48px ROW - NO SCROLL)
          ============================================================ */}
      <div className="h-12 border-b-[2.5px] border-dark bg-yellow/20 px-3 flex items-center justify-between gap-2 shrink-0 overflow-x-auto text-xs font-black">
        {/* Left: Primary Drawing Tools */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveTool('pen')}
            className={`h-7 px-2.5 border-[2px] border-dark rounded-lg text-xs font-black shadow-[1.5px_1.5px_0px_#060E1C] ${
              activeTool === 'pen' ? 'bg-yellow text-dark' : 'bg-white text-dark/70'
            }`}
          >
            <Pencil className="h-3.5 w-3.5 mr-1" /> Pen
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveTool('highlighter')}
            className={`h-7 px-2.5 border-[2px] border-dark rounded-lg text-xs font-black shadow-[1.5px_1.5px_0px_#060E1C] ${
              activeTool === 'highlighter' ? 'bg-yellow text-dark' : 'bg-white text-dark/70'
            }`}
          >
            <Highlighter className="h-3.5 w-3.5 mr-1 text-amber-600" /> Marker
          </Button>

          {/* Eraser Tool with High-Impact Sizing Indicator */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveTool('eraser')}
            className={`h-7 px-2.5 border-[2px] border-dark rounded-lg text-xs font-black shadow-[1.5px_1.5px_0px_#060E1C] ${
              activeTool === 'eraser' ? 'bg-yellow text-dark' : 'bg-white text-dark/70'
            }`}
            title="Eraser (Removes ink cleanly, never damages background lines!)"
          >
            <Eraser className="h-3.5 w-3.5 mr-1 text-rose-600" /> Eraser
          </Button>

          {/* Inline Text Tool */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveTool('text')}
            className={`h-7 px-2 border-[2px] border-dark rounded-lg text-xs font-black shadow-[1.5px_1.5px_0px_#060E1C] ${
              activeTool === 'text' ? 'bg-yellow text-dark' : 'bg-white text-dark/70'
            }`}
            title="Click anywhere on canvas to type text notes or equations"
          >
            <Type className="h-3.5 w-3.5 mr-1" /> Text
          </Button>

          {/* Shapes */}
          <div className="flex items-center border-[2px] border-dark rounded-lg bg-white overflow-hidden shadow-[1.5px_1.5px_0px_#060E1C]">
            <button
              onClick={() => setActiveTool('rect')}
              className={`p-1 hover:bg-slate-100 ${activeTool === 'rect' ? 'bg-yellow font-black' : ''}`}
              title="Rectangle"
            >
              <Square className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setActiveTool('circle')}
              className={`p-1 hover:bg-slate-100 ${activeTool === 'circle' ? 'bg-yellow font-black' : ''}`}
              title="Circle"
            >
              <Circle className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setActiveTool('arrow')}
              className={`p-1 hover:bg-slate-100 ${activeTool === 'arrow' ? 'bg-yellow font-black' : ''}`}
              title="Arrow"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {role === 'tutor' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActiveTool('laser')}
              className={`h-7 px-2 border-[2px] border-dark rounded-lg text-xs font-black shadow-[1.5px_1.5px_0px_#060E1C] ${
                activeTool === 'laser' ? 'bg-rose-500 text-white' : 'bg-white text-dark/70'
              }`}
            >
              <Radio className="h-3.5 w-3.5 mr-1 text-rose-500" /> Laser
            </Button>
          )}
        </div>

        {/* Center: Color Dots & Dynamic Brush/Eraser Sizes */}
        <div className="flex items-center gap-2 shrink-0">
          {activeTool !== 'eraser' ? (
            <div className="flex items-center gap-1 bg-white border-[2px] border-dark px-1.5 py-0.5 rounded-lg shadow-[1.5px_1.5px_0px_#060E1C]">
              {PALETTE_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  style={{ backgroundColor: c }}
                  className={`h-4 w-4 rounded-full border border-dark transition-all ${
                    selectedColor === c ? 'scale-125 ring-2 ring-dark shadow-sm' : 'hover:scale-110'
                  }`}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          ) : (
            <div className="text-[10px] font-black uppercase text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-300">
              Ink Eraser Active
            </div>
          )}

          {/* Sizes: Adapts to Pen vs. Eraser (S, M, L, XL are huge for Eraser!) */}
          <div className="flex items-center gap-0.5 border-[2px] border-dark rounded-lg bg-white p-0.5 shadow-[1.5px_1.5px_0px_#060E1C]">
            {(activeTool === 'eraser' ? ERASER_SIZES : PEN_SIZES).map((b) => {
              const currentVal = activeTool === 'eraser' ? eraserWidth : brushWidth;
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
                  className={`h-5 px-1.5 rounded text-[10px] font-black uppercase transition-all ${
                    currentVal === b.value ? 'bg-yellow text-dark scale-105' : 'text-dark/60 hover:text-dark'
                  }`}
                  title={`${b.label} Size (${b.value}px)`}
                >
                  {b.label}
                </button>
              );
            })}
          </div>

          {/* Grid Type (Math / Lined / Blank / Dots) */}
          <div className="flex items-center gap-0.5 border-[2px] border-dark rounded-lg bg-white p-0.5 shadow-[1.5px_1.5px_0px_#060E1C]">
            {(['blank', 'math-grid', 'lined', 'dots'] as GridType[]).map((g) => (
              <button
                key={g}
                onClick={() => handleSelectGridStyle(g)}
                className={`h-5 px-1.5 rounded text-[10px] font-black uppercase ${
                  gridStyle === g ? 'bg-dark text-white' : 'text-dark/70'
                }`}
              >
                {g === 'math-grid' ? 'Math' : g === 'lined' ? 'Lined' : g === 'dots' ? 'Dots' : 'Blank'}
              </button>
            ))}
          </div>

          {/* Background Colors Palette Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowBgMenu(!showBgMenu)}
              className="flex items-center gap-1 h-7 px-2 rounded-lg border-[2px] border-dark bg-white hover:bg-slate-50 font-black text-[10px] uppercase shadow-[1.5px_1.5px_0px_#060E1C] active:scale-95"
              title="Change Whiteboard Background Color (White, Black, Navy, Mild Blue, etc.)"
            >
              <Palette className="h-3 w-3 text-dark" />
              <span className="hidden xl:inline">{BG_CONFIG[bgColor]?.label || 'Color'}</span>
            </button>

            {showBgMenu && (
              <div className="absolute top-9 left-0 w-48 bg-slate-900 border-2 border-white/20 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="text-[10px] font-black uppercase tracking-wider text-white/50 px-2 py-1 mb-1">
                  Board Theme
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {(Object.keys(BG_CONFIG) as BgColorType[]).map((key) => {
                    const conf = BG_CONFIG[key];
                    return (
                      <button
                        key={key}
                        onClick={() => handleSelectBgColor(key)}
                        className={`text-left p-1.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${
                          bgColor === key ? 'bg-white/20 text-yellow' : 'hover:bg-white/10 text-white'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-white/40 shrink-0"
                          style={{ backgroundColor: conf.hex }}
                        />
                        <span>{conf.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Stamps & Emojis, Student Lock, Undo/Redo, Snapshot */}
        <div className="flex items-center gap-1 shrink-0 ml-auto">
          {role === 'tutor' && (
            <button
              onClick={toggleStudentLock}
              className={`flex items-center gap-1 h-7 px-2 rounded-lg border-[2px] border-dark font-black text-[10px] uppercase shadow-[1.5px_1.5px_0px_#060E1C] active:scale-95 transition-all ${
                studentPensLocked ? 'bg-rose-400 text-dark' : 'bg-emerald-300 text-dark'
              }`}
              title="Lock student from drawing"
            >
              {studentPensLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
              <span className="hidden md:inline">{studentPensLocked ? 'Locked' : 'Open'}</span>
            </button>
          )}

          {/* Stamps & Emojis Menu */}
          {role === 'tutor' && (
            <div className="relative">
              <button
                onClick={() => setShowStampsMenu(!showStampsMenu)}
                className={`flex items-center gap-1 h-7 px-2.5 rounded-lg border-[2px] border-dark font-black text-[10px] uppercase shadow-[1.5px_1.5px_0px_#060E1C] active:scale-95 transition-all ${
                  selectedStamp || selectedEmoji ? 'bg-yellow text-dark animate-pulse' : 'bg-purple-200 hover:bg-purple-300 text-dark'
                }`}
                title="Reward Stamps & Emojis"
              >
                <Award className="h-3 w-3 text-purple-900" />
                <span>{selectedEmoji ? `Stamp ${selectedEmoji}` : selectedStamp ? 'Stamp Armed' : 'Stamps & Emojis'}</span>
              </button>

              {showStampsMenu && (
                <div className="absolute top-9 right-0 w-80 bg-slate-900 border-2 border-white/20 rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95">
                  {/* Tabs */}
                  <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl mb-2">
                    <button
                      onClick={() => setStampTab('stamps')}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                        stampTab === 'stamps' ? 'bg-yellow text-dark' : 'text-white/70 hover:text-white'
                      }`}
                    >
                      Teacher Stamps
                    </button>
                    <button
                      onClick={() => setStampTab('emojis')}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                        stampTab === 'emojis' ? 'bg-yellow text-dark' : 'text-white/70 hover:text-white'
                      }`}
                    >
                      Fun Emojis
                    </button>
                  </div>

                  {stampTab === 'stamps' ? (
                    <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                      {STAMP_PRESETS.map((st) => (
                        <button
                          key={st.type}
                          onClick={() => {
                            setSelectedStamp(st.type);
                            setSelectedEmoji(null);
                            setShowStampsMenu(false);
                          }}
                          className={`w-full text-left p-1.5 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${st.bg} ${st.text}`}
                        >
                          <span className="text-sm">{st.emoji}</span>
                          <span className="truncate">{st.label}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-6 gap-1 max-h-60 overflow-y-auto p-1">
                      {EMOJI_PRESETS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => {
                            setSelectedEmoji(emoji);
                            setSelectedStamp(null);
                            setShowStampsMenu(false);
                          }}
                          className="h-10 text-xl flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 hover:scale-125 transition-all"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleUndo}
            className="h-7 w-7 rounded-lg border-[2px] border-dark bg-white hover:bg-slate-100 flex items-center justify-center shadow-[1.5px_1.5px_0px_#060E1C] active:scale-95"
            title="Undo"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={handleRedo}
            className="h-7 w-7 rounded-lg border-[2px] border-dark bg-white hover:bg-slate-100 flex items-center justify-center shadow-[1.5px_1.5px_0px_#060E1C] active:scale-95"
            title="Redo"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={handleClear}
            className="h-7 w-7 rounded-lg border-[2px] border-dark bg-rose-100 hover:bg-rose-200 text-rose-700 flex items-center justify-center shadow-[1.5px_1.5px_0px_#060E1C] active:scale-95"
            title="Clear Ink"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={handleExportPNG}
            className="flex items-center gap-1 h-7 px-2 rounded-lg border-[2px] border-dark bg-white hover:bg-slate-100 font-black text-[10px] uppercase shadow-[1.5px_1.5px_0px_#060E1C] active:scale-95"
            title="Save PNG Snapshot"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Save</span>
          </button>

          {onReturnToFullVideo && (
            <button
              onClick={onReturnToFullVideo}
              className="flex items-center gap-1.5 h-7 px-3 rounded-lg border-[2px] border-dark bg-yellow text-dark font-black text-[10px] uppercase shadow-[1.5px_1.5px_0px_#060E1C] active:scale-95 transition-all ml-1"
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
      <div className="flex-1 w-full h-full min-h-0 relative cursor-crosshair overflow-hidden">
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
      </div>
    </div>
  );
}
