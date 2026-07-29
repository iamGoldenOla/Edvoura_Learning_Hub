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
}

export default function GameLayout({ title, icon, children, score, showTimer = false, accentColor = '#6366f1' }: GameLayoutProps) {
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

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a' }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, #1e293b 0%, ${accentColor}22 100%)`,
        borderBottom: `1px solid ${accentColor}33`,
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => router.push('/dash/student/games')}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '12px',
              padding: '10px',
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
            <ArrowLeft size={20} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: `${accentColor}33`,
              borderRadius: '12px',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: accentColor
            }}>
              {icon}
            </div>
            <h1 style={{
              fontSize: '20px',
              fontWeight: 800,
              color: 'white',
              margin: 0,
              letterSpacing: '-0.02em'
            }}>
              {title}
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {showTimer && (
            <div style={{
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#94a3b8'
            }}>
              <Clock size={16} />
              <span style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: 700, color: 'white' }}>
                {formatTime(elapsed)}
              </span>
            </div>
          )}
          {score !== undefined && (
            <div style={{
              background: 'linear-gradient(135deg, #f59e0b22, #f59e0b11)',
              border: '1px solid #f59e0b33',
              borderRadius: '12px',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Star size={16} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#fbbf24' }}>{score}</span>
            </div>
          )}
        </div>
      </div>

      {/* Game Content */}
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        {children}
      </div>
    </div>
  );
}
