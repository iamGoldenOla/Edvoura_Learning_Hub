'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Video, Brain, Compass, BookOpen, Star } from 'lucide-react';

interface SparkleItem {
  id: number;
  top: string;
  left: string;
  size: number;
  delay: string;
  duration: string;
  color: string;
}

const STATIC_SPARKLES: SparkleItem[] = [
  { id: 1, top: '15%', left: '12%', size: 16, delay: '0s', duration: '3.2s', color: '#FFFFFF' },
  { id: 2, top: '22%', left: '85%', size: 22, delay: '0.8s', duration: '3.8s', color: '#FFD84D' },
  { id: 3, top: '35%', left: '28%', size: 14, delay: '1.4s', duration: '2.9s', color: '#A5F3FC' },
  { id: 4, top: '48%', left: '8%', size: 18, delay: '2.1s', duration: '4.1s', color: '#FFFFFF' },
  { id: 5, top: '18%', left: '68%', size: 24, delay: '0.3s', duration: '3.5s', color: '#FDE047' },
  { id: 6, top: '65%', left: '92%', size: 16, delay: '1.7s', duration: '3.1s', color: '#FFFFFF' },
  { id: 7, top: '78%', left: '22%', size: 20, delay: '2.5s', duration: '4.3s', color: '#BAE6FD' },
  { id: 8, top: '82%', left: '74%', size: 14, delay: '1.1s', duration: '3.0s', color: '#FFFFFF' },
  { id: 9, top: '40%', left: '94%', size: 18, delay: '0.5s', duration: '3.7s', color: '#FDE047' },
  { id: 10, top: '12%', left: '42%', size: 12, delay: '1.9s', duration: '2.8s', color: '#FFFFFF' },
  { id: 11, top: '88%', left: '48%', size: 16, delay: '2.8s', duration: '3.9s', color: '#A5F3FC' },
  { id: 12, top: '60%', left: '4%', size: 20, delay: '1.2s', duration: '3.6s', color: '#FFFFFF' },
];

export default function CrystalMirrorHero() {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const heroRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x: Math.round(x), y: Math.round(y) });
  };

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      className="relative overflow-hidden border-b-[6px] border-dark pb-20 pt-[110px] sm:pb-24 sm:pt-[130px] md:pb-32 md:pt-[160px] z-10 selection:bg-yellow selection:text-dark"
      style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop")',
        backgroundSize: 'cover',
        backgroundPosition: 'center 30%',
      }}
    >
      {/* --- INLINE STYLES FOR CRYSTAL MIRROR SHEEN & GLITTER --- */}
      <style jsx>{`
        @keyframes mirrorSweep {
          0% {
            transform: translateX(-150%) skewX(-25deg);
            opacity: 0;
          }
          15% {
            opacity: 0.85;
          }
          50% {
            opacity: 1;
          }
          85% {
            opacity: 0.85;
          }
          100% {
            transform: translateX(250%) skewX(-25deg);
            opacity: 0;
          }
        }

        @keyframes crystalTwinkle {
          0%, 100% {
            opacity: 0.15;
            transform: scale(0.6) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.3) rotate(90deg);
            filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 18px rgba(245, 197, 24, 0.7));
          }
        }

        @keyframes borderPulse {
          0%, 100% {
            border-color: rgba(255, 255, 255, 0.35);
          }
          50% {
            border-color: rgba(245, 197, 24, 0.75);
          }
        }

        @keyframes floatingPill {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        .animate-mirror-sweep {
          animation: mirrorSweep 6.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .animate-twinkle {
          animation: crystalTwinkle infinite ease-in-out;
        }

        .animate-floating {
          animation: floatingPill 4s ease-in-out infinite;
        }
      `}</style>

      {/* 1. Deep Crystal Obsidian Mirror Substrate */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#060E1C]/92 via-[#0A1628]/85 to-[#060E1C]/95 backdrop-blur-[3px]" />

      {/* 2. Interactive Cursor Specular Mirror Glare */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 opacity-70"
        style={{
          background: `radial-gradient(circle 500px at ${mousePos.x}% ${mousePos.y}%, rgba(255, 255, 255, 0.15), rgba(56, 189, 248, 0.08) 35%, transparent 70%)`,
        }}
      />

      {/* 3. Prismatic Angle Facets (Mirror Bevel Highlights) */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.25),rgba(255,255,255,0))]" />

      {/* 4. Diagonal Sweeping Light Beam (Mirror Reflection) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="animate-mirror-sweep absolute -top-1/2 -left-1/2 h-[200%] w-[60%] pointer-events-none"
          style={{
            background:
              'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.03) 38%, rgba(255,255,255,0.32) 50%, rgba(245,197,24,0.28) 52%, rgba(255,255,255,0.12) 60%, transparent 75%)',
          }}
        />
      </div>

      {/* 5. Glittering Diamond Glints & Sparkles Across Mirror */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {STATIC_SPARKLES.map((sparkle) => (
          <div
            key={sparkle.id}
            className="animate-twinkle absolute"
            style={{
              top: sparkle.top,
              left: sparkle.left,
              width: `${sparkle.size}px`,
              height: `${sparkle.size}px`,
              animationDelay: sparkle.delay,
              animationDuration: sparkle.duration,
            }}
          >
            {/* 4-Point Diamond Crystal Star */}
            <svg
              viewBox="0 0 24 24"
              fill={sparkle.color}
              className="w-full h-full drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]"
            >
              <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
            </svg>
          </div>
        ))}
      </div>

      {/* 6. Top & Bottom Prismatic Edge Highlights */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/80 via-yellow/80 to-transparent" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />

      {/* 7. Foreground Content (Mounted atop the Crystal Platter) */}
      <div className="marketing-container relative z-10 py-4 text-center">
        {/* Crystal Pill Badge */}
        <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border-2 border-white/50 bg-white/10 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.37),inset_0_1px_1px_rgba(255,255,255,0.6)] mb-6 sm:mb-8 text-white font-black text-xs sm:text-sm tracking-wider uppercase transform -rotate-1 hover:rotate-0 transition-transform">
          <Sparkles className="w-4 h-4 text-yellow animate-spin" style={{ animationDuration: '6s' }} />
          <span>CRYSTAL LEARNING ECOSYSTEM</span>
          <span className="w-2 h-2 rounded-full bg-yellow animate-ping" />
        </div>

        {/* Hero Title */}
        <h1
          className="font-heading font-black text-white max-w-5xl mx-auto break-words leading-[1.04] mb-6 sm:mb-8 drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]"
          style={{ fontSize: 'clamp(2.2rem, 9vw, 4.8rem)' }}
        >
          A Complete Learning Ecosystem{' '}
          <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-yellow via-white to-yellow-light drop-shadow-[0_0_20px_rgba(245,197,24,0.5)]">
            Built to Win
          </span>
        </h1>

        {/* Crystal Mirror Glass Card for Description */}
        <div className="max-w-3xl mx-auto relative rounded-3xl p-6 sm:p-8 backdrop-blur-2xl bg-white/[0.08] border-2 border-white/30 shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.5)] mb-10 overflow-hidden">
          {/* Internal Glass Reflection Highlight */}
          <div className="pointer-events-none absolute -top-24 -left-24 w-48 h-48 rounded-full bg-white/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-yellow/15 blur-2xl" />

          <p className="relative z-10 text-white text-base sm:text-xl font-bold leading-relaxed drop-shadow-sm">
            From live 1-on-1 tutoring and WAEC/JAMB exam preparation to interactive curriculum skill graphs and illustrated vocabulary, Edvoura unites every tool your learner needs into one sparkling experience.
          </p>

          {/* Micro Feature Pills Floating on Glass */}
          <div className="mt-6 pt-5 border-t border-white/20 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-left">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.06] border border-white/20">
              <Video className="w-4 h-4 text-yellow shrink-0" />
              <span className="text-[11px] sm:text-xs font-black text-white truncate">1-on-1 Tutoring</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.06] border border-white/20">
              <Brain className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-[11px] sm:text-xs font-black text-white truncate">Exam Prep</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.06] border border-white/20">
              <Compass className="w-4 h-4 text-cyan-300 shrink-0" />
              <span className="text-[11px] sm:text-xs font-black text-white truncate">Skill Roadmap</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.06] border border-white/20">
              <BookOpen className="w-4 h-4 text-pink-300 shrink-0" />
              <span className="text-[11px] sm:text-xs font-black text-white truncate">Word Atlas</span>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="group relative inline-flex w-full sm:w-auto items-center justify-center gap-3 bg-gradient-to-r from-success to-emerald-600 text-white border-[3px] border-dark font-heading font-black px-8 sm:px-12 py-4 sm:py-5 rounded-2xl shadow-[6px_6px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#060E1C] text-base sm:text-xl overflow-hidden"
          >
            {/* Shimmer sheen inside button */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span className="relative z-10 flex items-center gap-2">
              Start Learning Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link
            href="/roadmap"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-white/15 text-white border-[2px] border-white/50 backdrop-blur-xl font-heading font-black px-6 sm:px-8 py-4 sm:py-5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all hover:bg-white/25 hover:border-white text-sm sm:text-base"
          >
            <Compass className="w-4 h-4 text-yellow" />
            Explore Curriculum Roadmap
          </Link>
        </div>
      </div>
    </section>
  );
}
