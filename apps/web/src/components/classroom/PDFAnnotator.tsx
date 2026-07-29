'use client';

import React, { useRef, useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Pencil, Eraser, Trash2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2, Sparkles } from 'lucide-react';
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
  pageIndex: number;
}

interface PDFAnnotatorProps {
  lessonId: string;
  role: 'tutor' | 'student';
  pdfUrl: string;
}

const COLORS = [
  '#060E1C', // Dark/Black
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F5C518', // Yellow (Highlight)
];

const BRUSH_SIZES = [2, 4, 8, 16];

export function PDFAnnotator({ lessonId, role, pdfUrl }: PDFAnnotatorProps) {
  const renderCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const channelRef = useRef<any>(null);
  
  // pageIndex -> DrawLine[]
  const drawHistoryRef = useRef<Record<number, DrawLine[]>>({});
  
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<Point>({ x: 0, y: 0 });
  const pdfDocRef = useRef<any>(null);

  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [zoom, setZoom] = useState(1.2);
  
  const [color, setColor] = useState('#EF4444'); // Default to red for annotation markup visibility
  const [brushSize, setBrushSize] = useState(4);
  const [isEraser, setIsEraser] = useState(false);

  // Load PDF.js from CDN dynamically
  useEffect(() => {
    if ((window as any).pdfjsLib) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
    script.async = true;
    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
      setScriptLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      // Don't remove script as other tabs might need it, just cleanup
    };
  }, []);

  // Initialize Supabase Client & Realtime Channel
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`pdf-annotation:${lessonId}`);

    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'pdf-draw' }, ({ payload }: { payload: DrawLine }) => {
        if (!drawHistoryRef.current[payload.pageIndex]) {
          drawHistoryRef.current[payload.pageIndex] = [];
        }
        drawHistoryRef.current[payload.pageIndex].push(payload);
        
        if (payload.pageIndex === pageIndex) {
          drawOnCanvas(payload);
        }
      })
      .on('broadcast', { event: 'pdf-clear' }, ({ payload }: { payload: { pageIndex: number } }) => {
        drawHistoryRef.current[payload.pageIndex] = [];
        if (payload.pageIndex === pageIndex) {
          clearLocalCanvas();
        }
      })
      .on('broadcast', { event: 'pdf-sync-request' }, () => {
        if (role === 'tutor') {
          channel.send({
            type: 'broadcast',
            event: 'pdf-sync-response',
            payload: { history: drawHistoryRef.current },
          });
        }
      })
      .on('broadcast', { event: 'pdf-sync-response' }, ({ payload }: { payload: { history: Record<number, DrawLine[]> } }) => {
        if (role === 'student') {
          drawHistoryRef.current = payload.history;
          redrawPageHistory();
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED' && role === 'student') {
          channel.send({
            type: 'broadcast',
            event: 'pdf-sync-request',
            payload: {},
          });
        }
      });

    return () => {
      void channel.unsubscribe();
    };
  }, [lessonId, role, pageIndex]);

  // Load PDF document once script is loaded and url is provided
  useEffect(() => {
    if (!scriptLoaded || !pdfUrl) return;

    let active = true;
    async function loadPdf() {
      setLoading(true);
      try {
        const pdfjsLib = (window as any).pdfjsLib;
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        if (active) {
          pdfDocRef.current = pdf;
          setNumPages(pdf.numPages);
          setPageIndex(1);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading PDF:', err);
      }
    }

    void loadPdf();
    return () => {
      active = false;
    };
  }, [scriptLoaded, pdfUrl]);

  // Render current PDF page
  useEffect(() => {
    if (loading || !pdfDocRef.current) return;

    let active = true;
    async function renderPage() {
      try {
        const pdf = pdfDocRef.current;
        const page = await pdf.getPage(pageIndex);
        if (!active) return;

        const canvas = renderCanvasRef.current;
        const drawCanvas = drawCanvasRef.current;
        if (!canvas || !drawCanvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Calculate viewport
        const viewport = page.getViewport({ scale: zoom });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        // Align drawing canvas exactly
        drawCanvas.width = viewport.width;
        drawCanvas.height = viewport.height;

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
        
        if (active) {
          // Redraw existing annotations for this page
          redrawPageHistory();
        }
      } catch (err) {
        console.error('Error rendering page:', err);
      }
    }

    void renderPage();
    return () => {
      active = false;
    };
  }, [pageIndex, zoom, loading]);

  const drawOnCanvas = ({ x0, y0, x1, y1, color, width, isEraser }: DrawLine) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x0 * canvas.width, y0 * canvas.height);
    ctx.lineTo(x1 * canvas.width, y1 * canvas.height);
    
    // Highlight support (translucent yellow)
    if (color === '#F5C518' && !isEraser) {
      ctx.strokeStyle = 'rgba(245, 197, 24, 0.4)';
    } else {
      ctx.strokeStyle = isEraser ? '#FFFFFF' : color;
    }
    
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Use destination-out blend mode if eraser is active to clear drawings without overlaying white
    if (isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
    }
    
    ctx.stroke();
    ctx.closePath();
    ctx.globalCompositeOperation = 'source-over'; // Restore default
  };

  const redrawPageHistory = () => {
    clearLocalCanvas();
    const history = drawHistoryRef.current[pageIndex] || [];
    history.forEach((line) => drawOnCanvas(line));
  };

  const clearLocalCanvas = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleClearPage = () => {
    drawHistoryRef.current[pageIndex] = [];
    clearLocalCanvas();

    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'pdf-clear',
        payload: { pageIndex },
      });
    }
  };

  // Drawing mouse/touch handlers
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent): Point | null => {
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
    const canvas = drawCanvasRef.current;
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
      pageIndex,
    };

    if (!drawHistoryRef.current[pageIndex]) {
      drawHistoryRef.current[pageIndex] = [];
    }
    drawHistoryRef.current[pageIndex].push(line);
    drawOnCanvas(line);

    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'pdf-draw',
        payload: line,
      });
    }

    lastPointRef.current = point;
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  return (
    <div ref={containerRef} className="flex flex-col h-full w-full bg-slate-50 rounded-3xl border-[3px] border-dark overflow-hidden shadow-[6px_6px_0px_#060E1C]">
      
      {/* Control bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-dark bg-indigo-50/50 p-4 shrink-0">
        
        {/* Drawing Tools */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsEraser(false)}
            className={`border-[2px] border-dark rounded-xl font-bold shadow-[2px_2px_0px_#060E1C] active:scale-95 transition-all ${
              !isEraser ? 'bg-yellow text-dark' : 'bg-white text-dark/70'
            }`}
          >
            <Pencil className="h-4 w-4 mr-1.5" /> Annotate
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

        {/* Colors (Pencil only) */}
        {!isEraser && (
          <div className="flex items-center gap-1.5">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`h-6 w-6 rounded-full border-2 border-dark transition-all scale-100 ${
                  color === c ? 'ring-2 ring-indigo-500 scale-110 shadow-[1px_1px_0px_#000]' : ''
                }`}
                title={c === '#F5C518' ? 'Yellow Highlighter' : 'Select color'}
              />
            ))}
          </div>
        )}

        {/* Brush Sizes */}
        <div className="flex items-center gap-2">
          {BRUSH_SIZES.map((size) => (
            <button
              key={size}
              onClick={() => setBrushSize(size)}
              className={`flex h-6 w-6 items-center justify-center rounded-lg border-2 border-dark font-bold text-[10px] bg-white transition-all hover:bg-slate-100 ${
                brushSize === size ? 'bg-yellow font-black scale-105' : ''
              }`}
            >
              {size === 2 ? 'S' : size === 4 ? 'M' : size === 8 ? 'L' : 'XL'}
            </button>
          ))}
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-1.5 border-[2px] border-dark rounded-xl bg-white p-1 shadow-[2px_2px_0px_#060E1C]">
          <button
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
            className="p-1 hover:bg-slate-100 rounded-lg"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="text-[10px] font-black w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(2.0, z + 0.2))}
            className="p-1 hover:bg-slate-100 rounded-lg"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>

        {/* Page Nav */}
        <div className="flex items-center gap-2 border-[2px] border-dark rounded-xl bg-white p-1 shadow-[2px_2px_0px_#060E1C]">
          <button
            disabled={pageIndex <= 1}
            onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
            className="p-1 hover:bg-slate-100 rounded-lg disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-[10px] font-black px-1.5">
            Page {pageIndex} / {numPages || '?'}
          </span>
          <button
            disabled={pageIndex >= numPages}
            onClick={() => setPageIndex((p) => Math.min(numPages, p + 1))}
            className="p-1 hover:bg-slate-100 rounded-lg disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Clear Annotations */}
        <Button
          variant="outline"
          onClick={handleClearPage}
          className="border-[2px] border-dark bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl font-bold shadow-[2px_2px_0px_#060E1C] active:scale-95 transition-all"
        >
          <Trash2 className="h-4 w-4 mr-1.5" /> Clear Markup
        </Button>
      </div>

      {/* Main Workspace Frame */}
      <div className="flex-1 overflow-auto p-6 flex justify-center items-start min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 w-full">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-3" />
            <p className="text-sm font-bold text-dark/60">Rendering document pages...</p>
          </div>
        ) : (
          <div className="relative shadow-lg border-[3px] border-dark bg-white rounded-lg overflow-hidden">
            {/* Native Render Canvas */}
            <canvas ref={renderCanvasRef} />
            
            {/* Draw Overlay Canvas */}
            <canvas
              ref={drawCanvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="absolute inset-0 cursor-crosshair"
            />
          </div>
        )}
      </div>
    </div>
  );
}
