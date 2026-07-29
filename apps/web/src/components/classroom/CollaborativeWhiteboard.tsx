'use client';

import React, { useRef, useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Pencil, Eraser, Trash2, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Point {
  x: number;
  y: number;
}

interface DrawLine {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  color: string;
  width: number;
  isEraser: boolean;
}

interface CollaborativeWhiteboardProps {
  lessonId: string;
  role: 'tutor' | 'student';
}

const COLORS = [
  '#060E1C', // Dark/Black
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F5C518', // Yellow
  '#F97316', // Orange
];

const BRUSH_SIZES = [2, 4, 8, 16];

export function CollaborativeWhiteboard({ lessonId, role }: CollaborativeWhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const drawHistoryRef = useRef<DrawLine[]>([]);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<Point>({ x: 0, y: 0 });
  const channelRef = useRef<any>(null);

  const [color, setColor] = useState('#060E1C');
  const [brushSize, setBrushSize] = useState(4);
  const [isEraser, setIsEraser] = useState(false);

  // Initialize Supabase Client & Realtime Channel
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`classroom:${lessonId}`);

    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'draw' }, ({ payload }: { payload: DrawLine }) => {
        drawHistoryRef.current.push(payload);
        drawOnCanvas(payload);
      })
      .on('broadcast', { event: 'clear' }, () => {
        drawHistoryRef.current = [];
        clearLocalCanvas();
      })
      .on('broadcast', { event: 'sync-request' }, () => {
        if (role === 'tutor' && drawHistoryRef.current.length > 0) {
          channel.send({
            type: 'broadcast',
            event: 'sync-response',
            payload: { history: drawHistoryRef.current },
          });
        }
      })
      .on('broadcast', { event: 'sync-response' }, ({ payload }: { payload: { history: DrawLine[] } }) => {
        if (role === 'student') {
          drawHistoryRef.current = payload.history;
          redrawHistory();
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED' && role === 'student') {
          // Request current whiteboard state from the tutor
          channel.send({
            type: 'broadcast',
            event: 'sync-request',
            payload: {},
          });
        }
      });

    return () => {
      void channel.unsubscribe();
    };
  }, [lessonId, role]);

  // Handle canvas sizing
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      // Keep backup of canvas drawing before resizing
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.drawImage(canvas, 0, 0);
      }

      // Resize canvas to match container size
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight || 500;

      // Restore drawing and redraw history
      redrawHistory();
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const drawOnCanvas = ({ x0, y0, x1, y1, color, width, isEraser }: DrawLine) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x0 * canvas.width, y0 * canvas.height);
    ctx.lineTo(x1 * canvas.width, y1 * canvas.height);
    ctx.strokeStyle = isEraser ? '#FFFFFF' : color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.closePath();
  };

  const redrawHistory = () => {
    clearLocalCanvas();
    drawHistoryRef.current.forEach((line) => drawOnCanvas(line));
  };

  const clearLocalCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleClearBoard = () => {
    drawHistoryRef.current = [];
    clearLocalCanvas();
    
    // Broadcast clear event
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'clear',
        payload: {},
      });
    }
  };

  // Drawing mouse/touch handlers
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent): Point | null => {
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
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const point = getCoordinates(e);
    if (!point) return;

    isDrawingRef.current = true;
    lastPointRef.current = point;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const point = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!point || !canvas) return;

    const x0 = lastPointRef.current.x / canvas.width;
    const y0 = lastPointRef.current.y / canvas.height;
    const x1 = point.x / canvas.width;
    const y1 = point.y / canvas.height;

    const line: DrawLine = {
      x0,
      y0,
      x1,
      y1,
      color,
      width: brushSize,
      isEraser,
    };

    // Draw locally immediately
    drawHistoryRef.current.push(line);
    drawOnCanvas(line);

    // Broadcast drawing event
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'draw',
        payload: line,
      });
    }

    lastPointRef.current = point;
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  return (
    <div ref={containerRef} className="flex flex-col h-full w-full bg-white rounded-3xl border-[3px] border-dark overflow-hidden shadow-[6px_6px_0px_#060E1C]">
      {/* Tool bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-dark bg-indigo-50/50 p-4 shrink-0">
        <div className="flex items-center gap-2">
          {/* Pen / Eraser toggles */}
          <Button
            variant="outline"
            onClick={() => setIsEraser(false)}
            className={`border-[2px] border-dark rounded-xl font-bold shadow-[2px_2px_0px_#060E1C] active:scale-95 transition-all ${
              !isEraser ? 'bg-yellow text-dark' : 'bg-white text-dark/70'
            }`}
          >
            <Pencil className="h-4 w-4 mr-1.5" /> Pen
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsEraser(true)}
            className={`border-[2px] border-dark rounded-xl font-bold shadow-[2px_2px_0px_#060E1C] active:scale-95 transition-all ${
              isEraser ? 'bg-yellow text-dark' : 'bg-white text-dark/70'
            }`}
          >
            <Eraser className="h-4 w-4 mr-1.5" /> Eraser
          </Button>
        </div>

        {/* Colors selector (hidden in eraser mode) */}
        {!isEraser && (
          <div className="flex items-center gap-1.5">
            <Palette className="h-4 w-4 text-dark/50 mr-1" />
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`h-6 w-6 rounded-full border-2 border-dark transition-all scale-100 ${
                  color === c ? 'ring-2 ring-indigo-500 scale-110 shadow-[1px_1px_0px_#000]' : ''
                }`}
                aria-label={`Select color ${c}`}
              />
            ))}
          </div>
        )}

        {/* Brush Size */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase text-dark/50 tracking-wider">Size:</span>
          {BRUSH_SIZES.map((size) => (
            <button
              key={size}
              onClick={() => setBrushSize(size)}
              className={`flex h-6 w-6 items-center justify-center rounded-lg border-2 border-dark font-bold text-xs bg-white transition-all hover:bg-slate-100 ${
                brushSize === size ? 'bg-yellow font-black scale-105' : ''
              }`}
            >
              {size === 2 ? 'S' : size === 4 ? 'M' : size === 8 ? 'L' : 'XL'}
            </button>
          ))}
        </div>

        {/* Clear (only tutor can clear, or student if permitted, let's allow both for collaboration ease) */}
        <Button
          variant="outline"
          onClick={handleClearBoard}
          className="border-[2px] border-dark bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl font-bold shadow-[2px_2px_0px_#060E1C] active:scale-95 transition-all ml-auto"
        >
          <Trash2 className="h-4 w-4 mr-1.5" /> Clear Board
        </Button>
      </div>

      {/* Canvas */}
      <div className="flex-1 bg-white relative cursor-crosshair min-h-[400px]">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="absolute inset-0 w-full h-full"
        />
      </div>
    </div>
  );
}
