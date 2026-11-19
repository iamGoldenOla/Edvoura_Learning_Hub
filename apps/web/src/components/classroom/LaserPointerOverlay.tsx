'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';

export interface LaserPointerOverlayProps {
  channel: any;
  role: 'tutor' | 'student';
  userName: string;
  isLaserActive: boolean;
  isSpotlightActive: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

interface PointerPosition {
  xPct: number;
  yPct: number;
  active: boolean;
  mode: 'laser' | 'spotlight';
  senderRole: 'tutor' | 'student';
  senderName: string;
}

export function LaserPointerOverlay({
  channel,
  role,
  userName,
  isLaserActive,
  isSpotlightActive,
  containerRef,
}: LaserPointerOverlayProps) {
  const [remotePointer, setRemotePointer] = useState<PointerPosition | null>(null);
  const [localPos, setLocalPos] = useState<{ x: number; y: number } | null>(null);
  const lastBroadcastRef = useRef<number>(0);
  const hideTimerRef = useRef<any>(null);

  // Supabase Realtime broadcast listener for peer laser moves
  useEffect(() => {
    if (!channel) return;

    const handlePointerBroadcast = ({ payload }: { payload: PointerPosition }) => {
      if (!payload) return;
      if (!payload.active) {
        setRemotePointer(null);
        return;
      }
      setRemotePointer(payload);

      // Auto-hide if no move received for 3 seconds
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => {
        setRemotePointer(null);
      }, 3000);
    };

    channel.on('broadcast', { event: 'laser-pointer-move' }, handlePointerBroadcast);

    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [channel]);

  // Local pointer tracking and throttle broadcast
  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isLaserActive && !isSpotlightActive) return;
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;

      if (localX < 0 || localY < 0 || localX > rect.width || localY > rect.height) {
        setLocalPos(null);
        return;
      }

      setLocalPos({ x: localX, y: localY });

      const now = Date.now();
      // Throttle broadcast to ~33ms (30fps) for silky smooth tracking
      if (now - lastBroadcastRef.current > 33 && channel) {
        lastBroadcastRef.current = now;
        const xPct = localX / rect.width;
        const yPct = localY / rect.height;

        channel.send({
          type: 'broadcast',
          event: 'laser-pointer-move',
          payload: {
            xPct,
            yPct,
            active: true,
            mode: isSpotlightActive ? 'spotlight' : 'laser',
            senderRole: role,
            senderName: userName,
          },
        });
      }
    },
    [channel, containerRef, isLaserActive, isSpotlightActive, role, userName]
  );

  const handlePointerLeave = useCallback(() => {
    setLocalPos(null);
    if ((isLaserActive || isSpotlightActive) && channel) {
      channel.send({
        type: 'broadcast',
        event: 'laser-pointer-move',
        payload: {
          xPct: 0,
          yPct: 0,
          active: false,
          mode: isSpotlightActive ? 'spotlight' : 'laser',
          senderRole: role,
          senderName: userName,
        },
      });
    }
  }, [channel, isLaserActive, isSpotlightActive, role, userName]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (isLaserActive || isSpotlightActive) {
      window.addEventListener('pointermove', handlePointerMove);
      container.addEventListener('pointerleave', handlePointerLeave);
    } else {
      setLocalPos(null);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      container?.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [containerRef, handlePointerLeave, handlePointerMove, isLaserActive, isSpotlightActive]);

  // Determine which pointer to show:
  // If local user has laser/spotlight active, show localPos
  // If remote user has laser/spotlight active, calculate pixel coords from rect
  const containerRect = containerRef.current?.getBoundingClientRect();
  const width = containerRect?.width || 800;
  const height = containerRect?.height || 600;

  const displayPointer = localPos
    ? {
        x: localPos.x,
        y: localPos.y,
        mode: isSpotlightActive ? ('spotlight' as const) : ('laser' as const),
        label: `${userName} (You)`,
        role,
      }
    : remotePointer
      ? {
          x: remotePointer.xPct * width,
          y: remotePointer.yPct * height,
          mode: remotePointer.mode,
          label: `${remotePointer.senderRole === 'tutor' ? '🎓 Tutor' : '🎒 Student'} ${remotePointer.senderName}`,
          role: remotePointer.senderRole,
        }
      : null;

  if (!displayPointer) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {/* 1. Attention Spotlight Mask Mode */}
      {displayPointer.mode === 'spotlight' && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-150"
          style={{
            background: `radial-gradient(circle 120px at ${displayPointer.x}px ${displayPointer.y}px, transparent 0%, rgba(0, 0, 0, 0.65) 100%)`,
          }}
        />
      )}

      {/* 2. Glowing Neon Laser Dot with Aura & Trailing Blur */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-75 ease-out"
        style={{ left: displayPointer.x, top: displayPointer.y }}
      >
        {/* Pulsing Aura */}
        <span
          className={`absolute -inset-3 rounded-full opacity-75 animate-ping ${
            displayPointer.role === 'tutor' ? 'bg-red-500' : 'bg-emerald-400'
          }`}
        />
        {/* Secondary Glow */}
        <span
          className={`absolute -inset-1.5 rounded-full blur-sm ${
            displayPointer.role === 'tutor' ? 'bg-red-500' : 'bg-emerald-400'
          }`}
        />
        {/* Core Laser Dot */}
        <div
          className={`relative w-4 h-4 rounded-full border-2 border-white shadow-[0_0_15px_#ff0033] ${
            displayPointer.role === 'tutor' ? 'bg-red-600' : 'bg-emerald-500 shadow-[0_0_15px_#10b981]'
          }`}
        />

        {/* Presenter Name Tag */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-black/85 border border-white/20 text-white text-[9px] font-black uppercase tracking-wider whitespace-nowrap shadow-md">
          {displayPointer.label}
        </div>
      </div>
    </div>
  );
}
