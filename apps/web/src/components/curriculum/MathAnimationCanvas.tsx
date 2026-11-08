'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, FastForward, Maximize2, Download, Sparkles } from 'lucide-react';
import { MathScenePreset } from '@/lib/math-engine/manimgxPresets';

interface MathAnimationCanvasProps {
  preset: MathScenePreset;
  params: Record<string, number>;
  onParamChange?: (id: string, value: number) => void;
}

export default function MathAnimationCanvas({ preset, params, onParamChange }: MathAnimationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0); // 0 to 1
  const [speed, setSpeed] = useState(1); // 0.5, 1, 2
  const progressRef = useRef(0);
  const isPlayingRef = useRef(true);
  const speedRef = useRef(1);

  isPlayingRef.current = isPlaying;
  speedRef.current = speed;

  // Animation cycle duration in milliseconds (e.g. 6 seconds per full loop)
  const durationMs = 6000;

  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const renderLoop = (now: number) => {
      const dt = now - lastTime;
      lastTime = now;

      if (isPlayingRef.current) {
        const step = (dt / durationMs) * speedRef.current;
        let newProgress = (progressRef.current + step) % 1;
        progressRef.current = newProgress;
        setProgress(newProgress);
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const width = canvas.width;
          const height = canvas.height;

          // Clear Canvas
          ctx.clearRect(0, 0, width, height);

          // Subtle Grid Background
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);

          // Draw Math Scene
          preset.drawScene(ctx, width, height, progressRef.current, params);
        }
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => cancelAnimationFrame(animId);
  }, [preset, params]);

  // Handle Resize for Retina Displays
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = (rect.width * 0.58) * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.width * 0.58}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    progressRef.current = val;
    setProgress(val);
  };

  const handleReset = () => {
    progressRef.current = 0;
    setProgress(0);
  };

  const handleSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `edvoura-manimgx-${preset.id}.png`;
    a.click();
  };

  return (
    <div className="flex flex-col rounded-3xl border-[3.5px] border-dark bg-white shadow-[8px_8px_0px_#060E1C] overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b-[3px] border-dark bg-yellow/20 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-black uppercase tracking-wider text-dark">
            Edvoura MathMotion™ 60FPS Engine
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSnapshot}
            title="Download Frame Snapshot"
            className="rounded-lg border-[2px] border-dark bg-white px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-dark shadow-[2px_2px_0px_#060E1C] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-1 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" /> Snapshot
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div ref={containerRef} className="relative w-full bg-white flex items-center justify-center overflow-hidden">
        <canvas ref={canvasRef} className="w-full block" />
      </div>

      {/* Scrub Timeline & Control Bar */}
      <div className="border-t-[3px] border-dark bg-off-white p-4 space-y-3">
        {/* Scrubber slider */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono font-black text-dark/60 w-12 text-right">
            {(progress * 100).toFixed(0)}%
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.005"
            value={progress}
            onChange={handleScrub}
            className="w-full accent-yellow h-2.5 rounded-lg bg-dark/10 cursor-pointer"
          />
          <span className="text-[11px] font-mono font-black text-dark/60 w-12">
            100%
          </span>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 rounded-xl border-[2px] border-dark bg-yellow px-4 py-2 text-xs font-black uppercase tracking-wider text-dark shadow-[3px_3px_0px_#060E1C] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              title="Reset Timeline"
              className="flex items-center justify-center rounded-xl border-[2px] border-dark bg-white p-2 text-dark shadow-[3px_3px_0px_#060E1C] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* Speed Selectors */}
          <div className="flex items-center gap-1.5 rounded-xl border-[2px] border-dark bg-white p-1 shadow-[3px_3px_0px_#060E1C]">
            {[0.5, 1, 2].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSpeed(s)}
                className={`rounded-lg px-2.5 py-1 text-xs font-black transition-colors ${
                  speed === s ? 'bg-dark text-white' : 'text-dark hover:bg-slate-100'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
