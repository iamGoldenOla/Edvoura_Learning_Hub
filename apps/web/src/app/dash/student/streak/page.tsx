'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Flame, Trophy, Star, Zap, Calendar, TrendingUp, Gift, Target, Shield, Crown, Sparkles, BookOpen } from 'lucide-react';

/* ═══════════════════════ STREAK DATA (Mock - will connect to API) ═══════════════════════ */
const MOCK_STREAK = {
  currentStreak: 12,
  longestStreak: 24,
  totalActiveDays: 47,
  todayCompleted: true,
  weeklyGoal: 5,
  weeklyCompleted: 4,
};

// Generate mock activity data for the last 35 days
function generateActivityData(): { date: Date; active: boolean; score: number }[] {
  const days = [];
  const today = new Date();
  for (let i = 34; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const active = i === 0 ? MOCK_STREAK.todayCompleted : Math.random() > 0.25;
    days.push({
      date: d,
      active,
      score: active ? Math.floor(Math.random() * 80) + 20 : 0,
    });
  }
  return days;
}

const MILESTONES = [
  { days: 3, label: '3-Day Spark', icon: Zap, color: '#fbbf24', earned: true, reward: '+10 XP' },
  { days: 7, label: 'Week Warrior', icon: Shield, color: '#22c55e', earned: true, reward: '+25 XP' },
  { days: 14, label: 'Fortnight Fire', icon: Flame, color: '#f97316', earned: false, reward: '+50 XP' },
  { days: 30, label: 'Monthly Master', icon: Crown, color: '#8b5cf6', earned: false, reward: '+100 XP' },
  { days: 60, label: 'Diamond Streak', icon: Star, color: '#3b82f6', earned: false, reward: '+250 XP' },
  { days: 100, label: 'Century Legend', icon: Trophy, color: '#ef4444', earned: false, reward: '+500 XP' },
];

const DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function StreakPage() {
  const [activityData] = useState(generateActivityData);
  const [flameSize, setFlameSize] = useState(1);
  const [pulseActive, setPulseActive] = useState(false);

  // Flame breathing animation
  useEffect(() => {
    const interval = setInterval(() => {
      setFlameSize(s => s === 1 ? 1.08 : 1);
      setPulseActive(p => !p);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const streak = MOCK_STREAK;
  const streakIntensity = Math.min(streak.currentStreak / 30, 1); // 0 to 1

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px 64px', color: '#0f172a' }}>
      {/* Hero Streak Banner */}
      <section style={{
        borderRadius: '28px',
        border: '4px solid #0f172a',
        background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 50%, #431407 100%)',
        padding: '40px 32px',
        boxShadow: '10px 10px 0px #0f172a',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Animated fire particles */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.06,
          backgroundImage: 'radial-gradient(circle, #f97316 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }} />

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px',
          position: 'relative',
        }}>
          {/* Flame Icon with Breathing Animation */}
          <div style={{
            width: '90px', height: '90px', borderRadius: '50%',
            background: `radial-gradient(circle, rgba(249,115,22,0.4) 0%, rgba(239,68,68,0.2) 50%, transparent 70%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: `scale(${flameSize})`,
            transition: 'transform 1.2s ease-in-out',
          }}>
            <Flame style={{
              width: '54px', height: '54px',
              color: streak.currentStreak >= 7 ? '#f97316' : '#fbbf24',
              filter: `drop-shadow(0 0 ${8 + streakIntensity * 16}px rgba(249,115,22,0.6))`,
            }} />
          </div>

          <div style={{ textAlign: 'left' }}>
            <div style={{
              fontSize: '60px', fontWeight: 950, color: '#ffffff', lineHeight: 1,
              textShadow: '0 0 30px rgba(249,115,22,0.4)',
            }}>
              {streak.currentStreak}
            </div>
            <div style={{
              fontSize: '16px', fontWeight: 900, color: '#f97316',
              textTransform: 'uppercase', letterSpacing: '0.15em',
            }}>
              Day Streak 🔥
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '32px', marginTop: '24px',
          position: 'relative',
        }}>
          {[
            { label: 'Longest Streak', value: `${streak.longestStreak} days`, icon: Trophy },
            { label: 'Total Active Days', value: `${streak.totalActiveDays} days`, icon: Calendar },
            { label: 'Weekly Goal', value: `${streak.weeklyCompleted}/${streak.weeklyGoal}`, icon: Target },
          ].map(s => (
            <div key={s.label} style={{
              background: 'rgba(255,255,255,0.08)', borderRadius: '16px',
              padding: '12px 20px', border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <s.icon style={{ width: '14px', height: '14px', color: '#fbbf24' }} />
                <span style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {s.label}
                </span>
              </div>
              <div style={{ fontSize: '20px', fontWeight: 950, color: '#ffffff' }}>{s.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Activity Calendar */}
      <section style={{
        borderRadius: '24px', border: '4px solid #0f172a',
        background: '#ffffff', padding: '24px',
        boxShadow: '8px 8px 0px #0f172a', marginTop: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Calendar style={{ width: '22px', height: '22px', color: '#8b5cf6' }} />
          <h2 style={{ fontSize: '22px', fontWeight: 950 }}>Activity Calendar</h2>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginLeft: 'auto' }}>Last 35 days</span>
        </div>

        {/* Calendar Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
          {/* Day headers */}
          {DAY_NAMES.map((d, i) => (
            <div key={i} style={{
              textAlign: 'center', fontSize: '10px', fontWeight: 900,
              color: '#94a3b8', textTransform: 'uppercase', padding: '4px 0',
            }}>
              {d}
            </div>
          ))}

          {/* Activity cells */}
          {activityData.map((day, idx) => {
            const isToday = idx === activityData.length - 1;
            const intensity = day.active ? Math.min(day.score / 100, 1) : 0;
            const bgColor = day.active
              ? `rgba(34, 197, 94, ${0.2 + intensity * 0.6})`
              : '#f1f5f9';
            const borderColor = isToday ? '#8b5cf6' : day.active ? '#22c55e' : '#e2e8f0';

            return (
              <div
                key={idx}
                title={`${day.date.toLocaleDateString()} — ${day.active ? `Score: ${day.score}` : 'No activity'}`}
                style={{
                  aspectRatio: '1', borderRadius: '10px',
                  background: bgColor,
                  border: `2.5px solid ${borderColor}`,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 900,
                  color: day.active ? '#15803d' : '#cbd5e1',
                  position: 'relative',
                  boxShadow: isToday ? '0 0 0 2px #8b5cf6' : 'none',
                  cursor: 'default',
                }}
              >
                {day.date.getDate()}
                {day.active && (
                  <Flame style={{
                    width: '10px', height: '10px',
                    color: intensity > 0.6 ? '#f97316' : '#fbbf24',
                    position: 'absolute', top: '2px', right: '2px',
                  }} />
                )}
              </div>
            );
          })}
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '16px',
          marginTop: '16px', justifyContent: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: '#f1f5f9', border: '1.5px solid #e2e8f0' }} />
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8' }}>No activity</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: 'rgba(34,197,94,0.3)', border: '1.5px solid #22c55e' }} />
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8' }}>Low</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: 'rgba(34,197,94,0.6)', border: '1.5px solid #22c55e' }} />
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8' }}>Medium</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: 'rgba(34,197,94,0.85)', border: '1.5px solid #15803d' }} />
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8' }}>High</span>
          </div>
        </div>
      </section>

      {/* Streak Milestones */}
      <section style={{
        borderRadius: '24px', border: '4px solid #0f172a',
        background: '#ffffff', padding: '24px',
        boxShadow: '8px 8px 0px #0f172a', marginTop: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Trophy style={{ width: '22px', height: '22px', color: '#fbbf24' }} />
          <h2 style={{ fontSize: '22px', fontWeight: 950 }}>Streak Milestones</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {MILESTONES.map((m) => {
            const MIcon = m.icon;
            const progress = Math.min(streak.currentStreak / m.days, 1);

            return (
              <div key={m.days} style={{
                borderRadius: '20px',
                border: m.earned ? `3px solid ${m.color}` : '3px solid #e2e8f0',
                background: m.earned ? '#ffffff' : '#f8fafc',
                padding: '20px 16px', textAlign: 'center',
                boxShadow: m.earned ? `4px 4px 0px ${m.color}40` : 'none',
                opacity: m.earned ? 1 : 0.7,
                position: 'relative',
              }}>
                {m.earned && (
                  <div style={{
                    position: 'absolute', top: '-10px', right: '-6px',
                    fontSize: '18px',
                  }}>
                    ✅
                  </div>
                )}

                <div style={{
                  width: '48px', height: '48px', borderRadius: '14px',
                  background: m.earned ? m.color : '#e2e8f0',
                  border: '2.5px solid #0f172a',
                  boxShadow: m.earned ? '2px 2px 0px #0f172a' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 10px',
                }}>
                  <MIcon style={{ width: '24px', height: '24px', color: m.earned ? '#ffffff' : '#94a3b8' }} />
                </div>

                <div style={{ fontSize: '13px', fontWeight: 950, color: '#0f172a' }}>{m.label}</div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginTop: '2px' }}>{m.days} days</div>

                {/* Progress bar */}
                <div style={{
                  width: '100%', height: '6px', borderRadius: '3px',
                  background: '#e2e8f0', marginTop: '10px', overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${progress * 100}%`, height: '100%',
                    background: m.earned ? m.color : '#94a3b8',
                    borderRadius: '3px',
                    transition: 'width 0.5s ease',
                  }} />
                </div>

                <div style={{
                  fontSize: '10px', fontWeight: 900, color: m.earned ? m.color : '#94a3b8',
                  marginTop: '6px',
                }}>
                  <Gift style={{ width: '10px', height: '10px', display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />
                  {m.reward}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Consistency Tips */}
      <section style={{
        borderRadius: '24px', border: '4px solid #0f172a',
        background: '#fffbeb', padding: '24px',
        boxShadow: '8px 8px 0px #0f172a', marginTop: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Sparkles style={{ width: '22px', height: '22px', color: '#f59e0b' }} />
          <h2 style={{ fontSize: '22px', fontWeight: 950 }}>Keep Your Streak Alive!</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {[
            { tip: 'Complete one assignment today to protect your streak', icon: BookOpen },
            { tip: 'Join your next class on time to boost consistency', icon: Target },
            { tip: 'Practice at least one quiz drill to keep momentum', icon: TrendingUp },
          ].map((t) => (
            <div key={t.tip} style={{
              borderRadius: '16px', border: '3px solid #0f172a',
              background: '#ffffff', padding: '16px',
              display: 'flex', alignItems: 'flex-start', gap: '10px',
            }}>
              <t.icon style={{ width: '20px', height: '20px', color: '#f59e0b', flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', textTransform: 'none', lineHeight: 1.5 }}>
                {t.tip}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
