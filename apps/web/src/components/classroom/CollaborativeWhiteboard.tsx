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
  Grid,
  Undo2,
  Redo2,
  Trash2,
  Download,
  Lock,
  Unlock,
  Radio,
  Eye,
  Sparkles,
  Award,
  Users,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Share2,
  ScreenShare,
  Check,
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
  seatWorkStudentId?: string; // If set, this represents a specific student's seat-work desk
  isSeatWorkMode?: boolean;
}

const PALETTE_COLORS = [
  '#060E1C', // Dark Navy / Slate
  '#2563EB', // Electric Blue
  '#DC2626', // Teacher Red
  '#059669', // Emerald Green
  '#D97706', // Warm Amber
  '#7C3AED', // Vivid Purple
  '#DB2777', // Bright Pink
];

const BRUSH_SIZES = [
  { label: 'Fine', value: 2 },
  { label: 'Medium', value: 4 },
  { label: 'Thick', value: 8 },
  { label: 'Broad', value: 16 },
];

export function CollaborativeWhiteboard({
  lessonId,
  role,
  userName = 'Learner',
  seatWorkStudentId,
  isSeatWorkMode = false,
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
  const [laserPos, setLaserPos] = useState<{ x: number; y: number } | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [copiedBoardLink, setCopiedBoardLink] = useState<boolean>(false);

  const handleShareBoardLink = () => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/dash/student/live/classroom?lessonId=${lessonId}`;
    navigator.clipboard.writeText(url);
    setCopiedBoardLink(true);
    setTimeout(() => setCopiedBoardLink(false), 3000);
  };

  const handleScreenShareBoard = async () => {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
      try {
        await navigator.mediaDevices.getDisplayMedia({ video: true });
      } catch (err) {
        console.warn('Screen share cancelled or unsupported', err);
      }
    } else {
      alert('Screen sharing is available on desktop or via the video toolbar below.');
    }
  };

  // Can the current user write? (Tutor always can; student can unless locked by tutor in lecture mode)
  const canDraw = role === 'tutor' || (!studentPensLocked && (!isSeatWorkMode || true));

  // Determine channel key (shared lecture board vs. student private desk)
  const channelTopic = seatWorkStudentId
    ? `desk:${lessonId}:${seatWorkStudentId}`
    : `classroom:${lessonId}:board`;

  // Render Background Grid
  const drawBackgroundGrid = (ctx: CanvasRenderingContext2D, width: number, height: number, type: GridType) => {
    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    if (type === 'math-grid') {
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      const gridSize = 24;
      for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    } else if (type === 'lined') {
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      const lineSpacing = 32;
      for (let y = lineSpacing; y <= height; y += lineSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      // Red margin line for notebook effect
      ctx.strokeStyle = '#FECDD3';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(60, 0);
      ctx.lineTo(60, height);
      ctx.stroke();
    } else if (type === 'dots') {
      ctx.fillStyle = '#CBD5E1';
      const dotSpacing = 28;
      for (let x = dotSpacing; x < width; x += dotSpacing) {
        for (let y = dotSpacing; y < height; y += dotSpacing) {
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.restore();
  };

  // Render a single stroke element on canvas
  const renderElement = (ctx: CanvasRenderingContext2D, el: StrokeElement, canvasW: number, canvasH: number) => {
    if (!el.points || el.points.length === 0) return;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (el.isHighlighter) {
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = el.color;
      ctx.lineWidth = el.width * 3.5;
    } else if (el.type === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.lineWidth = el.width * 4;
    } else {
      ctx.globalAlpha = 1.0;
      ctx.strokeStyle = el.color;
      ctx.lineWidth = el.width;
    }

    if (el.type === 'rect' && el.points.length >= 2) {
      const p0 = el.points[0];
      const p1 = el.points[el.points.length - 1];
      const x = p0.x * canvasW;
      const y = p0.y * canvasH;
      const w = (p1.x - p0.x) * canvasW;
      const h = (p1.y - p0.y) * canvasH;
      ctx.strokeRect(x, y, w, h);
    } else if (el.type === 'circle' && el.points.length >= 2) {
      const p0 = el.points[0];
      const p1 = el.points[el.points.length - 1];
      const x0 = p0.x * canvasW;
      const y0 = p0.y * canvasH;
      const x1 = p1.x * canvasW;
      const y1 = p1.y * canvasH;
      const radius = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
      ctx.beginPath();
      ctx.arc(x0, y0, radius, 0, Math.PI * 2);
      ctx.stroke();
    } else if (el.type === 'arrow' && el.points.length >= 2) {
      const p0 = el.points[0];
      const p1 = el.points[el.points.length - 1];
      const fromX = p0.x * canvasW;
      const fromY = p0.y * canvasH;
      const toX = p1.x * canvasW;
      const toY = p1.y * canvasH;

      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();

      // Arrowhead
      const headlen = 14;
      const angle = Math.atan2(toY - fromY, toX - fromX);
      ctx.beginPath();
      ctx.moveTo(toX, toY);
      ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
      ctx.moveTo(toX, toY);
      ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
      ctx.stroke();
    } else if (el.type === 'text' && el.text) {
      ctx.fillStyle = el.color;
      ctx.font = `bold ${Math.max(16, el.width * 4)}px 'Outfit', sans-serif`;
      ctx.fillText(el.text, el.points[0].x * canvasW, el.points[0].y * canvasH);
    } else {
      // Freeform line or highlighter
      ctx.beginPath();
      ctx.moveTo(el.points[0].x * canvasW, el.points[0].y * canvasH);
      for (let i = 1; i < el.points.length; i++) {
        ctx.lineTo(el.points[i].x * canvasW, el.points[i].y * canvasH);
      }
      ctx.stroke();
    }

    ctx.restore();
  };

  // Redraw full board
  const redrawAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawBackgroundGrid(ctx, canvas.width, canvas.height, gridStyle);
    strokesRef.current.forEach((stroke) => {
      renderElement(ctx, stroke, canvas.width, canvas.height);
    });
  }, [gridStyle]);

  // Connect Supabase Realtime Channel
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(channelTopic) as any;
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
        redrawAll();
      })
      .on('broadcast', { event: 'undo-applied' }, () => {
        if (strokesRef.current.length > 0) {
          const popped = strokesRef.current.pop();
          if (popped) redoStackRef.current.push(popped);
          redrawAll();
        }
      })
      .on('broadcast', { event: 'laser-moved' }, ({ payload }: { payload: { x: number; y: number } | null }) => {
        setLaserPos(payload);
      })
      .on('broadcast', { event: 'lock-state-changed' }, ({ payload }: { payload: { locked: boolean } }) => {
        setStudentPensLocked(payload.locked);
      })
      .on('broadcast', { event: 'stamp-awarded' }, ({ payload }: { payload: StampItem }) => {
        setStamps((prev) => [...prev, payload]);
        playSound('correct');
      })
      .on('broadcast', { event: 'sync-request' }, () => {
        if (role === 'tutor' && strokesRef.current.length > 0) {
          channel.send({
            type: 'broadcast',
            event: 'sync-response',
            payload: { strokes: strokesRef.current, gridStyle, stamps },
          });
        }
      })
      .on('broadcast', { event: 'sync-response' }, ({ payload }: { payload: { strokes: StrokeElement[]; gridStyle: GridType; stamps: StampItem[] } }) => {
        if (role === 'student') {
          strokesRef.current = payload.strokes || [];
          if (payload.gridStyle) setGridStyle(payload.gridStyle);
          if (payload.stamps) setStamps(payload.stamps);
          redrawAll();
        }
      })
      .subscribe((status: any) => {
        if (status === 'SUBSCRIBED' && role === 'student') {
          channel.send({ type: 'broadcast', event: 'sync-request', payload: {} });
        }
      });

    return () => {
      void channel.unsubscribe();
    };
  }, [channelTopic, role, redrawAll, gridStyle, stamps]);

  // Canvas Resize Watcher
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight || 560;
      redrawAll();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [redrawAll]);

  // Coordinate normalizer (0.0 to 1.0)
  const getNormCoord = (e: React.MouseEvent | React.TouchEvent) => {
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

  // Pointer Down
  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canDraw) return;
    const pt = getNormCoord(e);
    if (!pt) return;

    // Handle Stamp Placement
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

    // Handle Text tool
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

  // Pointer Move
  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const pt = getNormCoord(e);
    if (!pt) return;

    // Broadcast Laser pointer if laser is active
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
      // Preview shape with live feedback
      redrawAll();
      const previewEl: StrokeElement = {
        ...currentStrokeRef.current,
        points: [currentStrokeRef.current.points[0], pt],
      };
      renderElement(ctx, previewEl, canvas.width, canvas.height);
    }
  };

  // Pointer Up
  const handlePointerUp = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (activeTool === 'laser' && role === 'tutor') {
      setLaserPos(null);
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'laser-moved',
          payload: null,
        });
      }
    }

    if (!isDrawingRef.current || !currentStrokeRef.current || !canDraw) return;
    isDrawingRef.current = false;

    const pt = getNormCoord(e);
    if (pt && ['rect', 'circle', 'arrow'].includes(activeTool)) {
      currentStrokeRef.current.points = [currentStrokeRef.current.points[0], pt];
    }

    strokesRef.current.push(currentStrokeRef.current);
    redoStackRef.current = [];
    redrawAll();

    // Broadcast to other participants
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'stroke-added',
        payload: currentStrokeRef.current,
      });
    }

    currentStrokeRef.current = null;
  };

  // Undo
  const handleUndo = () => {
    if (strokesRef.current.length === 0) return;
    const popped = strokesRef.current.pop();
    if (popped) {
      redoStackRef.current.push(popped);
      redrawAll();
      if (channelRef.current) {
        channelRef.current.send({ type: 'broadcast', event: 'undo-applied', payload: {} });
      }
    }
  };

  // Redo
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

  // Clear Board
  const handleClear = () => {
    if (window.confirm('Clear all drawings and notes on this board?')) {
      strokesRef.current = [];
      redoStackRef.current = [];
      setStamps([]);
      redrawAll();
      if (channelRef.current) {
        channelRef.current.send({ type: 'broadcast', event: 'board-cleared', payload: {} });
      }
    }
  };

  // Toggle Student Pen Lock (Tutor only)
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

  // Export board as PNG
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
      className="flex flex-col h-full w-full bg-white rounded-[24px] border-[4px] border-black overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative select-none"
    >
      {/* Top Header Bar: EDVOURA LEARNING HUB BOARD */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-black bg-yellow-300 px-4 py-2.5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-black text-yellow-300 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000]">
            <Radio className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
            EDVOURA BOARD
          </div>
          <span className="text-xs font-black uppercase tracking-wide text-black/80 hidden sm:inline">
            {isSeatWorkMode ? `Desk: ${seatWorkStudentId ? 'Student Seat-Work' : 'My Desk'}` : 'Interactive Class Canvas'}
          </span>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2">
          {role === 'tutor' && !isSeatWorkMode && (
            <button
              onClick={toggleStudentLock}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border-[2px] border-black font-black text-xs uppercase shadow-[2px_2px_0px_#000] active:scale-95 transition-all ${
                studentPensLocked ? 'bg-rose-400 text-black' : 'bg-emerald-300 text-black'
              }`}
            >
              {studentPensLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
              {studentPensLocked ? 'Student Pens Locked' : 'Student Pens Open'}
            </button>
          )}

          {role === 'student' && studentPensLocked && !isSeatWorkMode && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl border-[2px] border-black bg-rose-200 text-black font-black text-[11px] uppercase">
              <Lock className="h-3 w-3" /> View Only (Lecture Mode)
            </span>
          )}

          {/* Grid Style Dropdown */}
          <div className="flex items-center gap-1 bg-white border-[2px] border-black rounded-xl p-0.5 shadow-[2px_2px_0px_#000]">
            <button
              onClick={() => { setGridStyle('blank'); redrawAll(); }}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${gridStyle === 'blank' ? 'bg-black text-white' : 'text-black'}`}
              title="Plain Whiteboard"
            >
              Blank
            </button>
            <button
              onClick={() => { setGridStyle('math-grid'); redrawAll(); }}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${gridStyle === 'math-grid' ? 'bg-black text-white' : 'text-black'}`}
              title="Math Squared Grid"
            >
              Math
            </button>
            <button
              onClick={() => { setGridStyle('lined'); redrawAll(); }}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${gridStyle === 'lined' ? 'bg-black text-white' : 'text-black'}`}
              title="Handwriting Lined"
            >
              Lined
            </button>
            <button
              onClick={() => { setGridStyle('dots'); redrawAll(); }}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${gridStyle === 'dots' ? 'bg-black text-white' : 'text-black'}`}
              title="Dot Grid"
            >
              Dots
            </button>
          </div>

          {/* Screen Share Board */}
          <button
            onClick={handleScreenShareBoard}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl border-[2px] border-black bg-yellow hover:bg-yellow/90 text-black font-black text-xs uppercase shadow-[2px_2px_0px_#000] active:scale-95 transition-all"
            title="Present and Screen-Share this Board to student"
            aria-label="Screen Share Board"
          >
            <ScreenShare className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Share Screen</span>
          </button>

          {/* Copy Board Invite Link */}
          <button
            onClick={handleShareBoardLink}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl border-[2px] border-black bg-white hover:bg-slate-100 text-black font-black text-xs uppercase shadow-[2px_2px_0px_#000] active:scale-95 transition-all"
            title="Copy board room link to send to pupil"
            aria-label="Copy Board Invite Link"
          >
            {copiedBoardLink ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Share2 className="h-3.5 w-3.5" />}
            <span>{copiedBoardLink ? 'Link Copied!' : 'Share Board'}</span>
          </button>

          {/* Export Button */}
          <button
            onClick={handleExportPNG}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl border-[2px] border-black bg-white hover:bg-slate-100 text-black font-black text-xs uppercase shadow-[2px_2px_0px_#000] active:scale-95 transition-all"
            title="Download Canvas Snapshot"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Save</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-[3px] border-black bg-slate-50 px-3 py-2 shrink-0">
        {/* Drawing Tools Group */}
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveTool('pen')}
            className={`h-8 px-2.5 border-[2px] border-black rounded-xl font-black text-xs shadow-[2px_2px_0px_#000] ${
              activeTool === 'pen' ? 'bg-yellow text-black' : 'bg-white text-black/70'
            }`}
          >
            <Pencil className="h-3.5 w-3.5 mr-1" /> Pen
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveTool('highlighter')}
            className={`h-8 px-2.5 border-[2px] border-black rounded-xl font-black text-xs shadow-[2px_2px_0px_#000] ${
              activeTool === 'highlighter' ? 'bg-yellow text-black' : 'bg-white text-black/70'
            }`}
          >
            <Highlighter className="h-3.5 w-3.5 mr-1 text-amber-600" /> Highlight
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveTool('eraser')}
            className={`h-8 px-2.5 border-[2px] border-black rounded-xl font-black text-xs shadow-[2px_2px_0px_#000] ${
              activeTool === 'eraser' ? 'bg-yellow text-black' : 'bg-white text-black/70'
            }`}
          >
            <Eraser className="h-3.5 w-3.5 mr-1" /> Eraser
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveTool('text')}
            className={`h-8 px-2.5 border-[2px] border-black rounded-xl font-black text-xs shadow-[2px_2px_0px_#000] ${
              activeTool === 'text' ? 'bg-yellow text-black' : 'bg-white text-black/70'
            }`}
          >
            <Type className="h-3.5 w-3.5 mr-1" /> Text
          </Button>

          {/* Shapes Picker */}
          <div className="flex items-center border-[2px] border-black rounded-xl bg-white overflow-hidden shadow-[2px_2px_0px_#000]">
            <button
              onClick={() => setActiveTool('rect')}
              className={`p-1.5 hover:bg-slate-100 ${activeTool === 'rect' ? 'bg-yellow font-black' : ''}`}
              title="Rectangle"
            >
              <Square className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setActiveTool('circle')}
              className={`p-1.5 hover:bg-slate-100 ${activeTool === 'circle' ? 'bg-yellow font-black' : ''}`}
              title="Circle"
            >
              <Circle className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setActiveTool('arrow')}
              className={`p-1.5 hover:bg-slate-100 ${activeTool === 'arrow' ? 'bg-yellow font-black' : ''}`}
              title="Arrow"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Laser Pointer (Tutor Only) */}
          {role === 'tutor' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActiveTool('laser')}
              className={`h-8 px-2.5 border-[2px] border-black rounded-xl font-black text-xs shadow-[2px_2px_0px_#000] ${
                activeTool === 'laser' ? 'bg-rose-500 text-white' : 'bg-white text-black/70'
              }`}
            >
              <Radio className="h-3.5 w-3.5 mr-1 text-rose-500" /> Laser
            </Button>
          )}
        </div>

        {/* Color Palette (hidden in eraser mode) */}
        {activeTool !== 'eraser' && (
          <div className="flex items-center gap-1 bg-white border-[2px] border-black p-1 rounded-xl shadow-[2px_2px_0px_#000]">
            {PALETTE_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedColor(c)}
                style={{ backgroundColor: c }}
                className={`h-5 w-5 rounded-full border-[1.5px] border-black transition-all ${
                  selectedColor === c ? 'scale-125 ring-2 ring-black shadow-[1px_1px_0px_#000]' : 'hover:scale-110'
                }`}
                aria-label={`Select color ${c}`}
              />
            ))}
          </div>
        )}

        {/* Brush Sizes */}
        <div className="flex items-center gap-1">
          {BRUSH_SIZES.map((b) => (
            <button
              key={b.value}
              onClick={() => setBrushWidth(b.value)}
              className={`h-7 px-2 rounded-lg border-[2px] border-black font-black text-[11px] uppercase transition-all ${
                brushWidth === b.value ? 'bg-yellow text-black shadow-[2px_2px_0px_#000]' : 'bg-white text-black/60'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* Undo / Redo & Clear */}
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={handleUndo}
            className="p-1.5 rounded-lg border-[2px] border-black bg-white hover:bg-slate-100 text-black shadow-[2px_2px_0px_#000] active:scale-95 transition-all"
            title="Undo"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleRedo}
            className="p-1.5 rounded-lg border-[2px] border-black bg-white hover:bg-slate-100 text-black shadow-[2px_2px_0px_#000] active:scale-95 transition-all"
            title="Redo"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleClear}
            className="p-1.5 rounded-lg border-[2px] border-black bg-rose-100 hover:bg-rose-200 text-rose-700 shadow-[2px_2px_0px_#000] active:scale-95 transition-all"
            title="Clear Board"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Tutor Feedback Stamps Selector (Tutor Only) */}
      {role === 'tutor' && (
        <div className="flex flex-wrap items-center gap-1.5 bg-indigo-50/80 border-b-[2px] border-black px-3 py-1.5 text-xs font-black shrink-0">
          <span className="text-[10px] uppercase tracking-wider text-black/60 flex items-center gap-1">
            <Award className="h-3.5 w-3.5 text-indigo-600" /> Marking Stamps:
          </span>
          {STAMP_PRESETS.map((st) => (
            <button
              key={st.type}
              onClick={() => setSelectedStamp(selectedStamp === st.type ? null : st.type)}
              className={`px-2.5 py-1 rounded-xl border-[2px] border-black font-black text-xs uppercase shadow-[2px_2px_0px_#000] active:scale-95 transition-all ${
                st.bg
              } ${st.text} ${selectedStamp === st.type ? 'ring-2 ring-black scale-105' : 'hover:scale-102'}`}
            >
              {st.label}
            </button>
          ))}
          {selectedStamp && (
            <span className="text-[11px] font-bold text-rose-600 ml-2 animate-bounce">
              Click anywhere on the student's canvas to place stamp!
            </span>
          )}
        </div>
      )}

      {/* Drawing Canvas Area */}
      <div className="flex-1 bg-white relative cursor-crosshair min-h-[460px] overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          className="absolute inset-0 w-full h-full"
        />

        {/* Real-time Laser Pointer Indicator */}
        {laserPos && (
          <div
            className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 transition-all duration-75 z-30"
            style={{
              left: `${laserPos.x * 100}%`,
              top: `${laserPos.y * 100}%`,
            }}
          >
            <div className="h-4 w-4 rounded-full bg-rose-500 shadow-[0_0_12px_#F43F5E] animate-ping opacity-80" />
            <div className="h-3 w-3 rounded-full bg-rose-600 border border-white absolute inset-0.5" />
          </div>
        )}

        {/* Display Awarded Stamps */}
        {stamps.map((stamp) => (
          <div
            key={stamp.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 bg-white/95 border-[3px] border-black px-3 py-1.5 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-xs font-black uppercase pointer-events-none animate-in fade-in zoom-in duration-200 z-20 flex items-center gap-1.5"
            style={{
              left: `${stamp.x * 100}%`,
              top: `${stamp.y * 100}%`,
            }}
          >
            <span>{stamp.label}</span>
            <span className="text-[9px] font-bold text-black/50 lowercase">({stamp.awardedBy})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
