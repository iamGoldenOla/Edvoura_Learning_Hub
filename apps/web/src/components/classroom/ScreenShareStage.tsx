'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  ScreenShare,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Volume2,
  VolumeX,
  X,
  Monitor,
  Move,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export interface ScreenShareStageProps {
  stream: MediaStream | null;
  sharerName: string;
  sharerRole: 'tutor' | 'student';
  isLocal: boolean;
  onStopSharing: () => void;
  viewerRole: 'tutor' | 'student';
}

export function ScreenShareStage({
  stream,
  sharerName,
  sharerRole,
  isLocal,
  onStopSharing,
  viewerRole,
}: ScreenShareStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Attach stream to video element whenever it changes
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (stream) {
      if (el.srcObject !== stream) {
        el.srcObject = stream;
      }
      el.play().catch(() => {});
      const audioTracks = stream.getAudioTracks();
      setHasAudio(audioTracks.length > 0 && audioTracks.some((t) => t.enabled));
    } else {
      el.srcObject = null;
      setHasAudio(false);
    }
  }, [stream]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleZoomIn = () => {
    setZoomLevel((z) => Math.min(2.5, +(z + 0.25).toFixed(2)));
  };

  const handleZoomOut = () => {
    setZoomLevel((z) => {
      const next = Math.max(1, +(z - 0.25).toFixed(2));
      if (next === 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Draggable pan when zoomed in
  const handlePointerDown = (e: React.PointerEvent) => {
    if (zoomLevel <= 1) return;
    setIsPanning(true);
    panStartRef.current = {
      x: e.clientX - panOffset.x,
      y: e.clientY - panOffset.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPanning || zoomLevel <= 1) return;
    setPanOffset({
      x: e.clientX - panStartRef.current.x,
      y: e.clientY - panStartRef.current.y,
    });
  };

  const handlePointerUp = () => {
    setIsPanning(false);
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`relative w-full h-full bg-[#050B14] flex flex-col items-center justify-center overflow-hidden select-none ${
        zoomLevel > 1 ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
      }`}
    >
      {/* ============================================================
          TOP CONTROL STRIP: STATUS & ACTIONS
          ============================================================ */}
      <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between gap-2 pointer-events-none">
        {/* Left Status Pill */}
        <div className="pointer-events-auto flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#0B1426]/90 border-[2px] border-dark text-white shadow-[3px_3px_0px_#060E1C] backdrop-blur-md">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <ScreenShare className="w-4 h-4 text-emerald-400 shrink-0" />

          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-black uppercase tracking-wider text-white truncate">
              {isLocal
                ? 'You are Sharing Screen'
                : sharerRole === 'tutor'
                  ? `Tutor ${sharerName || 'Presenter'}`
                  : `Student ${sharerName || 'Pupil'}`}
            </span>
            <span className="text-[9px] font-bold text-white/60 truncate">
              {isLocal
                ? 'Transmitting HD Window / Tab'
                : sharerRole === 'student'
                  ? 'Student Presentation • Homework & Correction Review'
                  : 'Live 1080p Screen Presentation'}
            </span>
          </div>

          <span className="ml-1 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-black uppercase shrink-0">
            1080p HD
          </span>

          {hasAudio && (
            <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[9px] font-black uppercase flex items-center gap-1 shrink-0">
              <Volume2 className="w-3 h-3" />
              <span>Audio</span>
            </span>
          )}
        </div>

        {/* Right Action Tools */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-[#0B1426]/90 border-[2px] border-dark p-1.5 rounded-2xl shadow-[3px_3px_0px_#060E1C] backdrop-blur-md">
          {/* Zoom Out */}
          <button
            onClick={handleZoomOut}
            disabled={zoomLevel <= 1}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* Zoom Reset / Level Indicator */}
          <button
            onClick={handleResetZoom}
            className="px-2 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-black transition-all cursor-pointer active:scale-95"
            title="Click to reset zoom to 100% Fit"
          >
            {Math.round(zoomLevel * 100)}%
          </button>

          {/* Zoom In */}
          <button
            onClick={handleZoomIn}
            disabled={zoomLevel >= 2.5}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
            title="Zoom in (read fine text, code, or math equations)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
            title={isFullscreen ? 'Exit Fullscreen' : 'Edge-to-Edge Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Audio Mute/Unmute for viewer if screen stream contains sound */}
          {!isLocal && hasAudio && (
            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.muted = !isAudioMuted;
                  setIsAudioMuted(!isAudioMuted);
                }
              }}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
              title={isAudioMuted ? 'Unmute Screen Audio' : 'Mute Screen Audio'}
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          )}

          {/* Stop Sharing Button (Available for local sharer, or tutor can stop student screen) */}
          {(isLocal || viewerRole === 'tutor') && (
            <button
              onClick={onStopSharing}
              className="flex items-center gap-1.5 px-3 h-8 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase shadow-[2px_2px_0px_#060E1C] transition-all cursor-pointer active:scale-95 ml-1"
              title={isLocal ? 'Stop sharing your screen' : 'Stop student screen presentation'}
            >
              <X className="w-3.5 h-3.5" />
              <span>{isLocal ? 'Stop Sharing' : 'Close Share'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ============================================================
          MAIN VIDEO DISPLAY: 100% WIDESCREEN OBJECT-CONTAIN
          NEVER CROPPED, NEVER MIRRORED, SHARP 1080P/60FPS
          ============================================================ */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        {stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isLocal || isAudioMuted}
            style={{
              transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
              transformOrigin: 'center center',
              transition: isPanning ? 'none' : 'transform 0.15s ease-out',
            }}
            className="w-full h-full object-contain pointer-events-auto"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 text-center text-white p-6 max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-yellow/20 border-2 border-yellow text-yellow flex items-center justify-center shadow-lg animate-pulse">
              <Monitor className="w-8 h-8" />
            </div>
            <h4 className="text-base font-black uppercase tracking-wide">Connecting HD Screen Stream...</h4>
            <p className="text-xs text-white/60 font-semibold leading-relaxed">
              Negotiating peer video track. The shared screen will appear in full resolution in a moment.
            </p>
          </div>
        )}
      </div>

      {/* Subtle Hint Bar when Zoomed In */}
      {zoomLevel > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-white/20 text-white/80 text-[10px] font-black uppercase tracking-wider backdrop-blur-md">
          <Move className="w-3 h-3 text-yellow" />
          <span>Click &amp; Drag to Pan Screen • {Math.round(zoomLevel * 100)}% Zoom</span>
          <button
            onClick={handleResetZoom}
            className="pointer-events-auto underline text-yellow hover:text-white cursor-pointer ml-1"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
