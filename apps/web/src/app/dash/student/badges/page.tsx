'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Trophy, Star, Shield, Crown, Flame, Zap, BookOpen, Target,
  Gamepad2, Users, Award, Heart, Sparkles, Lock, Check, Medal,
  Brain, Rocket, GraduationCap, Clock, Pencil, Music
} from 'lucide-react';

/* ═══════════════════════ BADGE DEFINITIONS ═══════════════════════ */
interface Badge {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  category: 'academic' | 'attendance' | 'games' | 'social' | 'special';
  earned: boolean;
  earnedDate?: string;
  progress?: number; // 0-100
  requirement: string;
}

const BADGES: Badge[] = [
  // Academic
  { id: 'first-task', name: 'First Steps', description: 'Completed your first assignment', icon: Pencil, color: '#22c55e', category: 'academic', earned: true, earnedDate: 'Jul 15, 2026', progress: 100, requirement: 'Complete 1 assignment' },
  { id: 'quiz-ace', name: 'Quiz Ace', description: 'Scored 90%+ on a quiz', icon: Brain, color: '#8b5cf6', category: 'academic', earned: true, earnedDate: 'Jul 20, 2026', progress: 100, requirement: 'Score 90%+ on any quiz' },
  { id: 'bookworm', name: 'Bookworm', description: 'Completed 10 assignments', icon: BookOpen, color: '#3b82f6', category: 'academic', earned: true, earnedDate: 'Jul 28, 2026', progress: 100, requirement: 'Complete 10 assignments' },
  { id: 'math-wizard', name: 'Math Wizard', description: 'Perfect score on 3 math quizzes', icon: Sparkles, color: '#f59e0b', category: 'academic', earned: false, progress: 67, requirement: '3 perfect math quizzes (2/3)' },
  { id: 'scholar', name: 'Super Scholar', description: 'Average score above 85%', icon: GraduationCap, color: '#ec4899', category: 'academic', earned: false, progress: 82, requirement: 'Maintain 85%+ average' },
  { id: 'top-class', name: 'Top of Class', description: 'Ranked #1 in any subject', icon: Crown, color: '#fbbf24', category: 'academic', earned: false, progress: 0, requirement: 'Rank #1 in a subject' },

  // Attendance
  { id: 'early-bird', name: 'Early Bird', description: 'Joined a class 5 mins early', icon: Clock, color: '#22c55e', category: 'attendance', earned: true, earnedDate: 'Jul 12, 2026', progress: 100, requirement: 'Join class 5 mins early' },
  { id: 'week-warrior', name: 'Week Warrior', description: '7-day login streak', icon: Shield, color: '#3b82f6', category: 'attendance', earned: true, earnedDate: 'Jul 22, 2026', progress: 100, requirement: '7-day streak' },
  { id: 'iron-will', name: 'Iron Will', description: '30-day login streak', icon: Flame, color: '#f97316', category: 'attendance', earned: false, progress: 40, requirement: '30-day streak (12/30)' },
  { id: 'perfect-month', name: 'Perfect Month', description: 'Attended every class in a month', icon: Target, color: '#ef4444', category: 'attendance', earned: false, progress: 75, requirement: '100% monthly attendance' },

  // Games
  { id: 'game-starter', name: 'Game Starter', description: 'Played your first game', icon: Gamepad2, color: '#22c55e', category: 'games', earned: true, earnedDate: 'Jul 18, 2026', progress: 100, requirement: 'Play 1 game' },
  { id: 'millionaire', name: 'Millionaire', description: 'Won Who Wants to Be a Millionaire', icon: Award, color: '#fbbf24', category: 'games', earned: false, progress: 53, requirement: 'Reach level 15' },
  { id: 'chess-master', name: 'Chess Master', description: 'Won 5 chess games', icon: Crown, color: '#8b5cf6', category: 'games', earned: false, progress: 40, requirement: 'Win 5 chess games (2/5)' },
  { id: 'word-smith', name: 'Word Smith', description: 'Score 500+ in Scrabble', icon: Music, color: '#ec4899', category: 'games', earned: false, progress: 30, requirement: 'Score 500+ in Scrabble' },

  // Social
  { id: 'team-player', name: 'Team Player', description: 'Participated in a group activity', icon: Users, color: '#22c55e', category: 'social', earned: true, earnedDate: 'Jul 25, 2026', progress: 100, requirement: 'Join a group activity' },
  { id: 'helpful-hand', name: 'Helpful Hand', description: 'Helped 3 classmates', icon: Heart, color: '#ef4444', category: 'social', earned: false, progress: 33, requirement: 'Help 3 classmates (1/3)' },

  // Special
  { id: 'founding', name: 'Founding Scholar', description: 'Joined EDVOURA in its first year', icon: Rocket, color: '#fbbf24', category: 'special', earned: true, earnedDate: 'Jul 10, 2026', progress: 100, requirement: 'Early adopter' },
  { id: 'explorer', name: 'Explorer', description: 'Visited every section of the dashboard', icon: Star, color: '#8b5cf6', category: 'special', earned: false, progress: 70, requirement: 'Visit all dashboard sections' },
];

const CATEGORIES = [
  { key: 'all', label: 'All Badges', icon: Trophy },
  { key: 'academic', label: 'Academic', icon: BookOpen },
  { key: 'attendance', label: 'Attendance', icon: Clock },
  { key: 'games', label: 'Games', icon: Gamepad2 },
  { key: 'social', label: 'Social', icon: Users },
  { key: 'special', label: 'Special', icon: Star },
];

export default function BadgesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);

  const filtered = selectedCategory === 'all'
    ? BADGES
    : BADGES.filter(b => b.category === selectedCategory);

  const earnedCount = BADGES.filter(b => b.earned).length;
  const totalCount = BADGES.length;
  const completionPercent = Math.round((earnedCount / totalCount) * 100);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px 64px', color: '#0f172a' }}>
      {/* Hero Section */}
      <section style={{
        borderRadius: '28px', border: '4px solid #0f172a',
        background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 60%, #1e1b4b 100%)',
        padding: '40px 32px', boxShadow: '10px 10px 0px #0f172a',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'radial-gradient(circle, #fbbf24 1px, transparent 1px)',
          backgroundSize: '18px 18px',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(251,191,36,0.15)', border: '2px solid rgba(251,191,36,0.3)',
              borderRadius: '20px', padding: '6px 16px', marginBottom: '16px',
            }}>
              <Medal style={{ width: '14px', height: '14px', color: '#fbbf24' }} />
              <span style={{ fontSize: '11px', fontWeight: 900, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Badge Collection
              </span>
            </div>
            <h1 style={{ fontSize: '36px', fontWeight: 950, color: '#ffffff', lineHeight: 1.1 }}>
              Rewards & Achievements
            </h1>
            <p style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginTop: '8px', textTransform: 'none' }}>
              Earn badges by completing challenges, maintaining streaks, and excelling in your studies.
            </p>
          </div>

          {/* Completion Ring */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '100px', height: '100px', borderRadius: '50%',
              background: `conic-gradient(#fbbf24 ${completionPercent}%, rgba(255,255,255,0.1) ${completionPercent}%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '3px solid rgba(255,255,255,0.2)',
            }}>
              <div style={{
                width: '76px', height: '76px', borderRadius: '50%',
                background: '#0f172a', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: '22px', fontWeight: 950, color: '#fbbf24' }}>{earnedCount}</span>
                <span style={{ fontSize: '9px', fontWeight: 800, color: 'rgba(255,255,255,0.4)' }}>/{totalCount}</span>
              </div>
            </div>
            <div style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.5)', marginTop: '8px', textTransform: 'uppercase' }}>
              {completionPercent}% Complete
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <div style={{
        display: 'flex', gap: '8px', marginTop: '20px', flexWrap: 'wrap',
      }}>
        {CATEGORIES.map(cat => {
          const CatIcon = cat.icon;
          const isActive = selectedCategory === cat.key;
          const count = cat.key === 'all' ? BADGES.length : BADGES.filter(b => b.category === cat.key).length;

          return (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', borderRadius: '14px',
                border: isActive ? '3px solid #0f172a' : '2px solid #e2e8f0',
                background: isActive ? '#fbbf24' : '#ffffff',
                color: isActive ? '#0f172a' : '#64748b',
                fontSize: '12px', fontWeight: 950, cursor: 'pointer',
                boxShadow: isActive ? '3px 3px 0px #0f172a' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <CatIcon style={{ width: '14px', height: '14px' }} />
              {cat.label}
              <span style={{
                fontSize: '10px', fontWeight: 900,
                background: isActive ? 'rgba(0,0,0,0.15)' : '#f1f5f9',
                borderRadius: '8px', padding: '1px 6px',
              }}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Badges Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '14px', marginTop: '20px',
      }}>
        {filtered.map(badge => {
          const BadgeIcon = badge.icon;
          const isHovered = hoveredBadge === badge.id;

          return (
            <div
              key={badge.id}
              onMouseEnter={() => setHoveredBadge(badge.id)}
              onMouseLeave={() => setHoveredBadge(null)}
              style={{
                borderRadius: '20px',
                border: badge.earned ? `3px solid ${badge.color}` : '3px solid #e2e8f0',
                background: '#ffffff',
                padding: '20px',
                boxShadow: isHovered
                  ? badge.earned ? `6px 6px 0px ${badge.color}40` : '4px 4px 0px #e2e8f0'
                  : badge.earned ? `4px 4px 0px ${badge.color}30` : 'none',
                transform: isHovered ? 'translate(-2px, -2px)' : 'none',
                transition: 'all 0.2s ease',
                opacity: badge.earned ? 1 : 0.75,
                position: 'relative',
              }}
            >
              {/* Badge Icon */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '16px',
                  background: badge.earned ? badge.color : '#f1f5f9',
                  border: `2.5px solid ${badge.earned ? '#0f172a' : '#e2e8f0'}`,
                  boxShadow: badge.earned ? '2px 2px 0px #0f172a' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, position: 'relative',
                }}>
                  <BadgeIcon style={{
                    width: '26px', height: '26px',
                    color: badge.earned ? '#ffffff' : '#cbd5e1',
                  }} />
                  {!badge.earned && (
                    <Lock style={{
                      width: '12px', height: '12px', color: '#94a3b8',
                      position: 'absolute', bottom: '-3px', right: '-3px',
                      background: '#ffffff', borderRadius: '4px', padding: '1px',
                    }} />
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 950, color: '#0f172a' }}>{badge.name}</div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginTop: '2px', textTransform: 'none' }}>
                    {badge.description}
                  </div>
                  {badge.earned && badge.earnedDate && (
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '6px',
                      fontSize: '10px', fontWeight: 800, color: '#22c55e',
                    }}>
                      <Check style={{ width: '12px', height: '12px' }} />
                      Earned {badge.earnedDate}
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar (for unearned badges) */}
              {!badge.earned && badge.progress !== undefined && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'none' }}>
                      {badge.requirement}
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: 950, color: badge.color }}>{badge.progress}%</span>
                  </div>
                  <div style={{
                    width: '100%', height: '6px', borderRadius: '3px',
                    background: '#f1f5f9', overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${badge.progress}%`, height: '100%',
                      background: badge.color, borderRadius: '3px',
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Call to Action */}
      <div style={{
        borderRadius: '24px', border: '4px solid #0f172a',
        background: '#fffbeb', padding: '24px 32px',
        boxShadow: '8px 8px 0px #0f172a', marginTop: '24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Sparkles style={{ width: '28px', height: '28px', color: '#f59e0b' }} />
          <div>
            <div style={{ fontSize: '16px', fontWeight: 950 }}>Keep earning badges!</div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'none' }}>
              Complete assignments, play games, and maintain streaks to unlock more.
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/dash/student/streak" style={{
            padding: '10px 20px', borderRadius: '12px',
            border: '3px solid #0f172a', background: '#f97316', color: '#ffffff',
            fontSize: '12px', fontWeight: 950, textDecoration: 'none',
            boxShadow: '3px 3px 0px #0f172a', textTransform: 'uppercase',
          }}>
            🔥 View Streaks
          </Link>
          <Link href="/dash/student/games" style={{
            padding: '10px 20px', borderRadius: '12px',
            border: '3px solid #0f172a', background: '#8b5cf6', color: '#ffffff',
            fontSize: '12px', fontWeight: 950, textDecoration: 'none',
            boxShadow: '3px 3px 0px #0f172a', textTransform: 'uppercase',
          }}>
            🎮 Play Games
          </Link>
        </div>
      </div>
    </div>
  );
}
