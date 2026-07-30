'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trophy, Clock, Star } from 'lucide-react';

interface GameLayoutProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  score?: number;
  showTimer?: boolean;
  accentColor?: string;
  /** When true, the layout fills the viewport with no scrolling */
  fullscreen?: boolean;
}

export default function GameLayout({ title, icon, children, score, showTimer = false, accentColor = '#6366f1', fullscreen = false }: GameLayoutProps) {
  const router = useRouter();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!showTimer) return;
    const interval = setInterval(() => setElapsed(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [showTimer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const rootStyle: React.CSSProperties = fullscreen
    ? { position: 'absolute', inset: 0, overflow: 'hidden', background: '#0f172a', display: 'grid', gridTemplateRows: 'auto 1fr', boxSizing: 'border-box' }
    : { minHeight: '100vh', background: '#0f172a' };

  const contentStyle: React.CSSProperties = fullscreen
    ? { overflow: 'hidden', display: 'flex', flexDirection: 'column', width: '100%', height: '100%', boxSizing: 'border-box' }
    : { padding: '24px', maxWidth: '1200px', margin: '0 auto' };

  return (
    <div style={rootStyle}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, #1e293b 0%, ${accentColor}22 100%)`,
        borderBottom: `1px solid ${accentColor}33`,
        padding: fullscreen ? '6px 16px' : '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => router.push('/dash/student/games')}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: fullscreen ? '8px' : '12px',
              padding: fullscreen ? '6px' : '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              color: 'white'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
          >
            <ArrowLeft size={fullscreen ? 16 : 20} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: `${accentColor}33`,
              borderRadius: fullscreen ? '8px' : '12px',
              padding: fullscreen ? '6px' : '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: accentColor
            }}>
              {icon}
            </div>
            <h1 style={{
              fontSize: fullscreen ? '16px' : '20px',
              fontWeight: 800,
              color: 'white',
              margin: 0,
              letterSpacing: '-0.02em'
            }}>
              {title}
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {showTimer && (
            <div style={{
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '10px',
              padding: fullscreen ? '4px 12px' : '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#94a3b8'
            }}>
              <Clock size={14} />
              <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 700, color: 'white' }}>
                {formatTime(elapsed)}
              </span>
            </div>
          )}
          {score !== undefined && (
            <div style={{
              background: 'linear-gradient(135deg, #f59e0b22, #f59e0b11)',
              border: '1px solid #f59e0b33',
              borderRadius: '10px',
              padding: fullscreen ? '4px 12px' : '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Star size={14} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#fbbf24' }}>{score}</span>
            </div>
          )}
        </div>
      </div>

      {/* Game Content */}
      <div style={contentStyle}>
        {children}
      </div>

      {fullscreen && (
        <style jsx global>{`
          html, body, #__next { overflow: hidden !important; }
        `}</style>
      )}
    </div>
  );
}
