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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { STAMP_PRESETS, StampItem } from './BoardStamps';
import { playSound } from '@/utils/sounds';

export type ToolType = 'pen' | 'highlighter' | 'eraser' | 'text' | 'rect' | 'circle' | 'arrow' | 'laser';
export type GridType = 'blank' | 'math-grid' | 'lined' | 'dots';

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

const PALETTE_COLORS = [
  '#060E1C', // Dark Slate
  '#2563EB', // Blue
  '#DC2626', // Red
  '#059669', // Green
  '#D97706', // Amber
  '#7C3AED', // Purple
];

const BRUSH_SIZES = [
  { label: 'S', value: 2 },
  { label: 'M', value: 4 },
  { label: 'L', value: 8 },
  { label: 'XL', value: 16 },
];

export function CollaborativeWhiteboard({
  lessonId,
  role,
  userName = 'Learner',
  seatWorkStudentId,
  isSeatWorkMode = false,
  onReturnToFullVideo,
}: CollaborativeWhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Drawing state
  const strokesRef = useRef<StrokeElement[]>([]);
  const redoStackRef = useRef<StrokeElement[]>([]);
  const currentStrokeRef = useRef<StrokeElement | null>(null);
  const isDrawingRef = useRef(false);
  const channelRef = useRef<any>(null);

  // UI state
  const [activeTool, setActiveTool] = useState<ToolType>('pen');
  const [selectedColor, setSelectedColor] = useState<string>(role === 'tutor' ? '#DC2626' : '#060E1C');
  const [brushWidth, setBrushWidth] = useState<number>(4);
  const [gridStyle, setGridStyle] = useState<GridType>('math-grid');
  const [studentPensLocked, setStudentPensLocked] = useState<boolean>(false);
  const [stamps, setStamps] = useState<StampItem[]>([]);
  const [selectedStamp, setSelectedStamp] = useState<string | null>(null);
  const [showStampsMenu, setShowStampsMenu] = useState<boolean>(false);
  const [laserPos, setLaserPos] = useState<{ x: number; y: number } | null>(null);

  const canDraw = role === 'tutor' || !studentPensLocked || isSeatWorkMode;

  // Draw Grid helper
  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, style: GridType) => {
    if (style === 'blank') return;

    ctx.save();
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;

    if (style === 'math-grid') {
      const step = 28;
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
    } else if (style === 'lined') {
      const step = 32;
      ctx.beginPath();
      for (let y = step; y <= height; y += step) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();
    } else if (style === 'dots') {
      const step = 28;
      ctx.fillStyle = '#CBD5E1';
      for (let x = step / 2; x <= width; x += step) {
        for (let y = step / 2; y <= height; y += step) {
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    ctx.restore();
  }, []);

  // Render a single stroke
  const renderElement = useCallback((ctx: CanvasRenderingContext2D, el: StrokeElement, width: number, height: number) => {
    ctx.save();
    ctx.strokeStyle = el.color;
    ctx.fillStyle = el.color;
    ctx.lineWidth = el.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (el.isHighlighter) {
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = el.width * 3.5;
    }

    if (el.type === 'pen' || el.type === 'highlighter' || el.type === 'eraser') {
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
      const cx = (p1.x + p2.x) * width / 2;
      const cy = (p1.y + p2.y) * height / 2;
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
      const headlen = 16;
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
      ctx.font = `bold ${Math.max(16, el.width * 4)}px sans-serif`;
      ctx.fillText(el.text, el.points[0].x * width, el.points[0].y * height);
    }

    ctx.restore();
  }, []);

  // Redraw All
  const redrawAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, canvas.width, canvas.height, gridStyle);

    strokesRef.current.forEach((stroke) => {
      renderElement(ctx, stroke, canvas.width, canvas.height);
    });
  }, [drawGrid, gridStyle, renderElement]);

  // Window Resize & DPI scaling
  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      const toolbarHeight = 48; // compact single toolbar
      const w = rect.width;
      const h = Math.max(300, rect.height - toolbarHeight);

      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        redrawAll();
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [redrawAll]);

  // Supabase Real-time Channel
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
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) renderElement(ctx, payload, canvas.width, canvas.height);
        }
      })
      .on('broadcast', { event: 'board-cleared' }, () => {
        strokesRef.current = [];
        redoStackRef.current = [];
        setStamps([]);
        redrawAll();
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
      .subscribe();

    return () => {
      void channel.unsubscribe();
    };
  }, [lessonId, isSeatWorkMode, seatWorkStudentId, redrawAll, renderElement]);

  // Helper coordinate normalizer (0 to 1)
  const getNormCoord = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
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

    if (selectedStamp && role === 'tutor') {
      const preset = STAMP_PRESETS.find((s) => s.type === selectedStamp);
      if (preset) {
        const newStamp: StampItem = {
          id: `stamp-${Date.now()}`,
          type: preset.type,
          label: preset.label,
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

    if (activeTool === 'text') {
      const input = window.prompt('Enter your math equation, explanation, or note:');
      if (input && input.trim()) {
        const textElement: StrokeElement = {
          id: `text-${Date.now()}`,
          type: 'text',
          points: [pt],
          color: selectedColor,
          width: brushWidth,
          text: input.trim(),
        };
        strokesRef.current.push(textElement);
        redoStackRef.current = [];
        redrawAll();

        if (channelRef.current) {
          channelRef.current.send({
            type: 'broadcast',
            event: 'stroke-added',
            payload: textElement,
          });
        }
      }
      return;
    }

    isDrawingRef.current = true;
    currentStrokeRef.current = {
      id: `stroke-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type: activeTool,
      points: [pt],
      color: activeTool === 'eraser' ? '#FFFFFF' : selectedColor,
      width: brushWidth,
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

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (['pen', 'highlighter', 'eraser'].includes(activeTool)) {
      currentStrokeRef.current.points.push(pt);
      renderElement(ctx, currentStrokeRef.current, canvas.width, canvas.height);
    } else if (['rect', 'circle', 'arrow'].includes(activeTool)) {
      redrawAll();
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
    redrawAll();
  };

  const handleUndo = () => {
    if (strokesRef.current.length === 0) return;
    const popped = strokesRef.current.pop();
    if (popped) {
      redoStackRef.current.push(popped);
      redrawAll();
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
      redrawAll();
      if (channelRef.current) {
        channelRef.current.send({ type: 'broadcast', event: 'stroke-added', payload: restored });
      }
    }
  };

  const handleClear = () => {
    if (window.confirm('Clear all drawings and notes on this whiteboard?')) {
      strokesRef.current = [];
      redoStackRef.current = [];
      setStamps([]);
      redrawAll();
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

  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const imageUri = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `Edvoura_Board_${lessonId}_${Date.now()}.png`;
    link.href = imageUri;
    link.click();
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full w-full bg-white overflow-hidden relative select-none"
    >
      {/* ============================================================
          UNIFIED COMPACT JAMBOARD TOOLBAR (SINGLE 48px ROW - NO SCROLL)
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

          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveTool('eraser')}
            className={`h-7 px-2.5 border-[2px] border-dark rounded-lg text-xs font-black shadow-[1.5px_1.5px_0px_#060E1C] ${
              activeTool === 'eraser' ? 'bg-yellow text-dark' : 'bg-white text-dark/70'
            }`}
          >
            <Eraser className="h-3.5 w-3.5 mr-1" /> Eraser
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveTool('text')}
            className={`h-7 px-2 border-[2px] border-dark rounded-lg text-xs font-black shadow-[1.5px_1.5px_0px_#060E1C] ${
              activeTool === 'text' ? 'bg-yellow text-dark' : 'bg-white text-dark/70'
            }`}
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

        {/* Center: Color Dots & Grid */}
        <div className="flex items-center gap-2 shrink-0">
          {activeTool !== 'eraser' && (
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
          )}

          {/* Brush Sizes */}
          <div className="flex items-center gap-0.5 border-[2px] border-dark rounded-lg bg-white p-0.5 shadow-[1.5px_1.5px_0px_#060E1C]">
            {BRUSH_SIZES.map((b) => (
              <button
                key={b.value}
                onClick={() => setBrushWidth(b.value)}
                className={`h-5 px-1.5 rounded text-[10px] font-black uppercase ${
                  brushWidth === b.value ? 'bg-yellow text-dark' : 'text-dark/60'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>

          {/* Grid Type */}
          <div className="flex items-center gap-0.5 border-[2px] border-dark rounded-lg bg-white p-0.5 shadow-[1.5px_1.5px_0px_#060E1C]">
            {(['blank', 'math-grid', 'lined'] as GridType[]).map((g) => (
              <button
                key={g}
                onClick={() => { setGridStyle(g); redrawAll(); }}
                className={`h-5 px-2 rounded text-[10px] font-black uppercase ${
                  gridStyle === g ? 'bg-dark text-white' : 'text-dark/70'
                }`}
              >
                {g === 'math-grid' ? 'Math' : g === 'lined' ? 'Lined' : 'Blank'}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Stamps & Undo/Redo & Return to Full Video */}
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

          {/* Marking Stamps Popover */}
          {role === 'tutor' && (
            <div className="relative">
              <button
                onClick={() => setShowStampsMenu(!showStampsMenu)}
                className="flex items-center gap-1 h-7 px-2 rounded-lg border-[2px] border-dark bg-purple-200 hover:bg-purple-300 text-dark font-black text-[10px] uppercase shadow-[1.5px_1.5px_0px_#060E1C] active:scale-95 transition-all"
              >
                <Award className="h-3 w-3 text-purple-900" />
                <span>Stamps</span>
              </button>

              {showStampsMenu && (
                <div className="absolute top-9 right-0 w-64 bg-slate-900 border-2 border-white/20 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="text-[10px] font-black uppercase tracking-wider text-white/50 px-2 py-1 mb-1">
                    Marking Stamps
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {STAMP_PRESETS.map((st) => (
                      <button
                        key={st.type}
                        onClick={() => {
                          setSelectedStamp(st.type);
                          setShowStampsMenu(false);
                        }}
                        className={`text-left p-2 rounded-xl text-xs font-black uppercase transition-all ${st.bg} ${st.text}`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
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
            title="Clear Board"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={handleExportPNG}
            className="flex items-center gap-1 h-7 px-2 rounded-lg border-[2px] border-dark bg-white hover:bg-slate-100 font-black text-[10px] uppercase shadow-[1.5px_1.5px_0px_#060E1C] active:scale-95"
            title="Download Canvas Snapshot"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Save</span>
          </button>

          {onReturnToFullVideo && (
            <button
              onClick={onReturnToFullVideo}
              className="flex items-center gap-1.5 h-7 px-3 rounded-lg border-[2px] border-dark bg-yellow text-dark font-black text-[10px] uppercase shadow-[1.5px_1.5px_0px_#060E1C] active:scale-95 transition-all ml-1"
              title="Return to 100% Video View"
            >
              <Video className="h-3.5 w-3.5" />
              <span>Full Video</span>
            </button>
          )}
        </div>
      </div>

      {/* ============================================================
          MAIN DRAWING CANVAS (100% WIDESCREEN & HEIGHT - ZERO SCROLLBAR)
          ============================================================ */}
      <div className="flex-1 w-full h-full min-h-0 bg-white relative cursor-crosshair overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          className="absolute inset-0 w-full h-full block"
        />

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

        {/* Awarded Stamps Overlay */}
        {stamps.map((stamp) => (
          <div
            key={stamp.id}
            style={{
              position: 'absolute',
              left: `${stamp.x * 100}%`,
              top: `${stamp.y * 100}%`,
              transform: 'translate(-50%, -50%) scale(1.1) rotate(-4deg)',
              pointerEvents: 'none',
              zIndex: 25,
            }}
            className="animate-in zoom-in-50 duration-200"
          >
            <div className="px-3 py-1.5 rounded-xl border-[3px] border-dark bg-yellow text-dark font-black text-xs uppercase shadow-[4px_4px_0px_#060E1C] flex items-center gap-1.5">
              <span>⭐</span>
              <span>{stamp.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
