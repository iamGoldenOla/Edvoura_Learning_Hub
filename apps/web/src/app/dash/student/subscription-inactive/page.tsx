'use client';

import Link from 'next/link';
import { Lock, LogOut, User, Crown, Zap, Rocket, Star, Check, X, Sparkles, BookOpen, Gamepad2, Trophy, Video } from 'lucide-react';
import { LogoutButton } from '@/components/ui/logout-button';
import { useState } from 'react';

export const dynamic = 'force-dynamic';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '₦5,000',
    period: '/month',
    color: '#3b82f6',
    shadow: '#1e40af',
    icon: Zap,
    emoji: '⚡',
    popular: false,
    features: [
      { label: 'Core subjects access', included: true },
      { label: 'Assignments & quizzes', included: true },
      { label: '5 live lessons/month', included: true },
      { label: 'Progress tracking', included: true },
      { label: 'Educational games', included: false },
      { label: 'Spelling Bee events', included: false },
      { label: 'Exam prep & mock exams', included: false },
      { label: '1-on-1 tutor chat', included: false },
    ],
  },
  {
    id: 'scholar',
    name: 'Scholar',
    price: '₦12,000',
    period: '/month',
    color: '#8b5cf6',
    shadow: '#5b21b6',
    icon: Crown,
    emoji: '👑',
    popular: true,
    features: [
      { label: 'All subjects access', included: true },
      { label: 'Assignments & quizzes', included: true },
      { label: 'Unlimited live lessons', included: true },
      { label: 'Progress tracking', included: true },
      { label: 'Educational games', included: true },
      { label: 'Spelling Bee events', included: true },
      { label: 'Exam prep & mock exams', included: true },
      { label: '1-on-1 tutor chat', included: false },
    ],
  },
  {
    id: 'elite',
    name: 'Elite',
    price: '₦25,000',
    period: '/month',
    color: '#f59e0b',
    shadow: '#b45309',
    icon: Rocket,
    emoji: '🚀',
    popular: false,
    features: [
      { label: 'All subjects access', included: true },
      { label: 'Assignments & quizzes', included: true },
      { label: 'Unlimited live lessons', included: true },
      { label: 'Progress tracking', included: true },
      { label: 'Educational games', included: true },
      { label: 'Spelling Bee events', included: true },
      { label: 'Exam prep & mock exams', included: true },
      { label: '1-on-1 tutor chat', included: true },
    ],
  },
];

const HIGHLIGHTS = [
  { icon: BookOpen, label: 'Expert Tutors', description: 'Verified educators for every subject' },
  { icon: Gamepad2, label: '10+ Games', description: 'Chess, Millionaire, Monopoly & more' },
  { icon: Trophy, label: 'Rewards', description: 'Earn badges, streaks & XP points' },
  { icon: Video, label: 'Live Classes', description: 'Interactive Zoom & Meet sessions' },
];

export default function StudentSubscriptionInactivePage() {
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 16px 64px' }}>
      {/* Hero Lock Section */}
      <div style={{
        borderRadius: '28px',
        border: '4px solid #0f172a',
        background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 50%, #1e1b4b 100%)',
        padding: '48px 32px',
        boxShadow: '10px 10px 0px #0f172a',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Animated background dots */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.05,
          backgroundImage: 'radial-gradient(circle, #fbbf24 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }} />

        <div style={{
          width: '80px', height: '80px', borderRadius: '24px',
          border: '4px solid #0f172a', background: '#fecaca',
          boxShadow: '4px 4px 0px #0f172a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', position: 'relative',
        }}>
          <Lock style={{ width: '36px', height: '36px', color: '#0f172a' }} />
        </div>

        <h1 style={{
          fontSize: '36px', fontWeight: 950, color: '#ffffff',
          letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '16px',
        }}>
          Learning Portal Locked
        </h1>

        <p style={{
          fontSize: '16px', fontWeight: 700, color: 'rgba(255,255,255,0.7)',
          maxWidth: '520px', margin: '0 auto 24px', lineHeight: 1.6,
          textTransform: 'none',
        }}>
          Your student workspace is temporarily locked because your family subscription is currently inactive.
          Ask your parent to choose a plan below to unlock your full learning experience!
        </p>

        <div style={{
          background: 'rgba(251,191,36,0.15)', border: '2px dashed rgba(251,191,36,0.4)',
          borderRadius: '16px', padding: '16px 24px',
          display: 'inline-flex', alignItems: 'center', gap: '10px',
        }}>
          <Sparkles style={{ width: '20px', height: '20px', color: '#fbbf24' }} />
          <span style={{ fontSize: '13px', fontWeight: 900, color: '#fbbf24' }}>
            Ask your parent to visit their Parent Portal → Billing to activate
          </span>
        </div>
      </div>

      {/* Highlights Strip */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px',
        marginTop: '24px',
      }}>
        {HIGHLIGHTS.map((h) => (
          <div key={h.label} style={{
            borderRadius: '20px', border: '3px solid #0f172a',
            background: '#ffffff', padding: '20px 16px',
            boxShadow: '5px 5px 0px #0f172a', textAlign: 'center',
          }}>
            <h.icon style={{ width: '28px', height: '28px', color: '#8b5cf6', margin: '0 auto 8px' }} />
            <div style={{ fontSize: '13px', fontWeight: 950, color: '#0f172a' }}>{h.label}</div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginTop: '4px', textTransform: 'none' }}>
              {h.description}
            </div>
          </div>
        ))}
      </div>

      {/* Plan Cards */}
      <h2 style={{
        fontSize: '28px', fontWeight: 950, color: '#0f172a',
        textAlign: 'center', marginTop: '40px', marginBottom: '24px',
        letterSpacing: '-0.02em',
      }}>
        Choose Your Learning Plan
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {PLANS.map((plan) => {
          const isHovered = hoveredPlan === plan.id;
          const PlanIcon = plan.icon;

          return (
            <div
              key={plan.id}
              onMouseEnter={() => setHoveredPlan(plan.id)}
              onMouseLeave={() => setHoveredPlan(null)}
              style={{
                borderRadius: '24px',
                border: plan.popular ? `4px solid ${plan.color}` : '3px solid #0f172a',
                background: '#ffffff',
                padding: '28px 20px',
                boxShadow: isHovered
                  ? `8px 8px 0px ${plan.shadow}`
                  : plan.popular
                    ? `6px 6px 0px ${plan.shadow}`
                    : '5px 5px 0px #0f172a',
                position: 'relative',
                transform: isHovered ? 'translate(-3px, -3px)' : 'none',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
              }}
            >
              {plan.popular && (
                <div style={{
                  position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)',
                  background: plan.color, color: '#ffffff',
                  fontSize: '10px', fontWeight: 950, letterSpacing: '0.1em',
                  padding: '4px 16px', borderRadius: '20px',
                  border: '2px solid #0f172a', boxShadow: '2px 2px 0px #0f172a',
                  textTransform: 'uppercase',
                }}>
                  ⭐ Most Popular
                </div>
              )}

              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '16px',
                  background: plan.color, border: '3px solid #0f172a',
                  boxShadow: '3px 3px 0px #0f172a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 12px',
                }}>
                  <PlanIcon style={{ width: '28px', height: '28px', color: '#ffffff' }} />
                </div>
                <div style={{ fontSize: '11px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                  {plan.name}
                </div>
                <div style={{ fontSize: '32px', fontWeight: 950, color: '#0f172a', lineHeight: 1.1, marginTop: '4px' }}>
                  {plan.price}
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#94a3b8' }}>{plan.period}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                {plan.features.map((f) => (
                  <div key={f.label} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    opacity: f.included ? 1 : 0.4,
                  }}>
                    {f.included ? (
                      <Check style={{ width: '16px', height: '16px', color: '#22c55e', flexShrink: 0 }} />
                    ) : (
                      <X style={{ width: '16px', height: '16px', color: '#cbd5e1', flexShrink: 0 }} />
                    )}
                    <span style={{
                      fontSize: '12px', fontWeight: 700, color: f.included ? '#0f172a' : '#94a3b8',
                      textTransform: 'none',
                    }}>
                      {f.label}
                    </span>
                  </div>
                ))}
              </div>

              <button style={{
                width: '100%', padding: '12px',
                borderRadius: '14px', border: '3px solid #0f172a',
                background: plan.popular ? plan.color : '#f8fafc',
                color: plan.popular ? '#ffffff' : '#0f172a',
                fontSize: '13px', fontWeight: 950,
                boxShadow: '3px 3px 0px #0f172a',
                cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em',
                transition: 'all 0.15s ease',
              }}>
                {plan.popular ? '🎓 Get Scholar Plan' : `Choose ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: '16px',
        marginTop: '32px', flexWrap: 'wrap',
      }}>
        <Link
          href="/dash/profile"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '12px 24px', borderRadius: '14px',
            border: '3px solid #0f172a', background: '#ffffff',
            color: '#0f172a', fontSize: '13px', fontWeight: 950,
            boxShadow: '4px 4px 0px #0f172a', textDecoration: 'none',
            textTransform: 'uppercase', letterSpacing: '0.05em',
            transition: 'all 0.15s ease',
          }}
        >
          <User style={{ width: '16px', height: '16px' }} /> Profile Settings
        </Link>
        <div>
          <LogoutButton variant="brutalist" />
        </div>
      </div>
    </div>
  );
}
