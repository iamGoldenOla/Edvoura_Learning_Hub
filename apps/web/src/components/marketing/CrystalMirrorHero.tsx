'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Video, Brain, Compass, BookOpen, Camera, CameraOff, Star } from 'lucide-react';

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
  { id: 1, top: '12%', left: '10%', size: 16, delay: '0s', duration: '3.0s', color: '#060E1C' },
  { id: 2, top: '20%', left: '88%', size: 24, delay: '0.7s', duration: '3.6s', color: '#F5C518' },
  { id: 3, top: '32%', left: '24%', size: 14, delay: '1.3s', duration: '2.8s', color: '#64748B' },
  { id: 4, top: '45%', left: '6%', size: 18, delay: '2.0s', duration: '4.0s', color: '#060E1C' },
  { id: 5, top: '15%', left: '65%', size: 22, delay: '0.4s', duration: '3.4s', color: '#F5C518' },
  { id: 6, top: '62%', left: '94%', size: 16, delay: '1.6s', duration: '3.1s', color: '#64748B' },
  { id: 7, top: '75%', left: '18%', size: 20, delay: '2.4s', duration: '4.2s', color: '#060E1C' },
  { id: 8, top: '80%', left: '76%', size: 14, delay: '1.0s', duration: '2.9s', color: '#F5C518' },
  { id: 9, top: '38%', left: '92%', size: 18, delay: '0.6s', duration: '3.5s', color: '#060E1C' },
  { id: 10, top: '10%', left: '38%', size: 14, delay: '1.8s', duration: '2.7s', color: '#F5C518' },
  { id: 11, top: '85%', left: '46%', size: 16, delay: '2.6s', duration: '3.8s', color: '#64748B' },
  { id: 12, top: '56%', left: '3%', size: 20, delay: '1.1s', duration: '3.5s', color: '#F5C518' },
];

export default function CrystalMirrorHero() {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x: Math.round(x), y: Math.round(y) });
  };

  const toggleCameraMirror = async () => {
    if (cameraActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setCameraActive(false);
      return;
    }

    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch {
      setCameraError('Please allow camera permission to see your live reflection.');
      setTimeout(() => setCameraError(null), 4000);
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      className="relative overflow-hidden border-b-[6px] border-dark pb-20 pt-[105px] sm:pb-28 sm:pt-[125px] md:pb-36 md:pt-[150px] z-10 selection:bg-yellow selection:text-dark"
      style={{
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 25%, #F1F5F9 50%, #FFFFFF 75%, #F8FAFC 100%)',
      }}
    >
      {/* --- INLINE STYLES FOR SPECULAR MIRROR SWEEP & GLITTER --- */}
      <style jsx>{`
        @keyframes silverMirrorSweep {
          0% {
            transform: translateX(-160%) skewX(-25deg);
            opacity: 0;
          }
          15% {
            opacity: 0.95;
          }
          50% {
            opacity: 1;
          }
          85% {
            opacity: 0.95;
          }
          100% {
            transform: translateX(260%) skewX(-25deg);
            opacity: 0;
          }
        }

        @keyframes crystalSparkle {
          0%, 100% {
            opacity: 0.15;
            transform: scale(0.6) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.35) rotate(90deg);
            filter: drop-shadow(0 0 10px rgba(245, 197, 24, 0.9)) drop-shadow(0 0 18px rgba(255, 255, 255, 1));
          }
        }

        .animate-mirror-sweep {
          animation: silverMirrorSweep 6.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .animate-crystal-sparkle {
          animation: crystalSparkle infinite ease-in-out;
        }
      `}</style>

      {/* 1. Pure Crystal Mirror Specular Glaze */}
      <div
        className="pointer-events-none absolute inset-0 opacity-90 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle 600px at ${mousePos.x}% ${mousePos.y}%, rgba(255, 255, 255, 1) 0%, rgba(241, 245, 249, 0.5) 45%, transparent 75%)`,
        }}
      />

      {/* 2. Prismatic Mirror Bevel Highlights */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(255,255,255,0.95),transparent_70%)]" />

      {/* 3. Sweeping Silver-Platinum Mirror Light Beam */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="animate-mirror-sweep absolute -top-1/2 -left-1/2 h-[200%] w-[55%] pointer-events-none"
          style={{
            background:
              'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.2) 36%, rgba(255,255,255,0.85) 50%, rgba(245,197,24,0.45) 52%, rgba(255,255,255,0.4) 60%, transparent 75%)',
          }}
        />
      </div>

      {/* 4. Sparkling Diamond Glints (Sparkling across the mirror surface) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {STATIC_SPARKLES.map((sparkle) => (
          <div
            key={sparkle.id}
            className="animate-crystal-sparkle absolute"
            style={{
              top: sparkle.top,
              left: sparkle.left,
              width: `${sparkle.size}px`,
              height: `${sparkle.size}px`,
              animationDelay: sparkle.delay,
              animationDuration: sparkle.duration,
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill={sparkle.color}
              className="w-full h-full drop-shadow-[0_0_8px_rgba(255,255,255,0.95)]"
            >
              <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
            </svg>
          </div>
        ))}
      </div>

      {/* 5. Crystal Edge Silver Bevel Lines */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-white via-yellow/70 to-transparent" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-slate-300 to-transparent" />

      {/* 6. Foreground Content (Pure Crystal Clarity Platter) */}
      <div className="marketing-container relative z-10 py-4 text-center">
        {/* Crystal Pill Badge */}
        <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border-2 border-dark bg-yellow shadow-[4px_4px_0px_#060E1C] mb-6 sm:mb-8 text-dark font-black text-xs sm:text-sm tracking-wider uppercase transform -rotate-1 hover:rotate-0 transition-transform">
          <Sparkles className="w-4 h-4 text-dark animate-spin" style={{ animationDuration: '6s' }} />
          <span>CRYSTAL MIRROR OF LEARNING</span>
          <span className="w-2 h-2 rounded-full bg-dark animate-ping" />
        </div>

        {/* Hero Title */}
        <h1
          className="font-heading font-black text-dark max-w-5xl mx-auto break-words leading-[1.04] mb-6 sm:mb-8 drop-shadow-[2px_2px_0px_rgba(255,255,255,1)]"
          style={{ fontSize: 'clamp(2.2rem, 9vw, 4.8rem)' }}
        >
          See Your Future in the{' '}
          <span className="relative inline-block text-dark underline decoration-yellow decoration-wavy decoration-4">
            Edvoura Mirror
          </span>
        </h1>

        {/* --- THE MIRROR FRAME (Pure Crystal Glass) --- */}
        <div className="max-w-3xl mx-auto relative rounded-[32px] p-6 sm:p-9 backdrop-blur-2xl bg-white/90 border-[3px] border-dark shadow-[10px_10px_0px_#060E1C,inset_0_2px_6px_rgba(255,255,255,1)] mb-10 overflow-hidden">
          {/* Internal Specular Highlight */}
          <div className="pointer-events-none absolute -top-28 -left-28 w-56 h-56 rounded-full bg-white blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -right-28 w-56 h-56 rounded-full bg-yellow/20 blur-3xl" />

          {/* Optional Live Camera Mirror Stream */}
          {cameraActive ? (
            <div className="relative mb-6 mx-auto w-full max-w-md aspect-video rounded-2xl overflow-hidden border-2 border-dark shadow-[4px_4px_0px_#060E1C] bg-dark">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
              <div className="absolute top-3 left-3 bg-dark/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border border-white/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Mirror Reflection
              </div>
              <div className="absolute bottom-3 inset-x-3 text-center bg-dark/80 backdrop-blur-md text-yellow font-bold text-xs py-1.5 rounded-xl border border-yellow/40">
                ✨ The reflection of tomorrow&apos;s leader!
              </div>
            </div>
          ) : (
            /* Pristine Silver Mirror Reflection Silhouette */
            <div className="relative mb-6 mx-auto w-full max-w-sm h-36 sm:h-44 rounded-2xl overflow-hidden border-2 border-dark/15 bg-gradient-to-b from-white via-slate-50 to-slate-200/70 flex flex-col items-center justify-center shadow-inner">
              {/* Ethereal Silhouette of a Learner looking in mirror */}
              <div className="relative flex flex-col items-center opacity-45 hover:opacity-70 transition-opacity">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-dark bg-yellow shadow-[2px_2px_0px_#060E1C] flex items-center justify-center">
                  <Star className="w-7 h-7 text-dark animate-pulse" />
                </div>
                <div className="w-24 sm:w-28 h-10 bg-dark/15 rounded-t-full mt-2 border-t-2 border-dark/25" />
              </div>
              <p className="mt-2 text-xs font-black uppercase tracking-widest text-dark/70">
                &ldquo;When you look into Edvoura, you see who you can become.&rdquo;
              </p>
            </div>
          )}

          {/* Toggle Live Camera Mirror Button */}
          <div className="mb-6 flex justify-center">
            <button
              type="button"
              onClick={toggleCameraMirror}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-dark bg-off-white hover:bg-yellow px-4 py-2 text-xs font-black uppercase tracking-wider text-dark shadow-[3px_3px_0px_#060E1C] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
            >
              {cameraActive ? (
                <>
                  <CameraOff className="w-4 h-4 text-dark" />
                  Turn Off Live Mirror
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 text-dark" />
                  🪞 Look Into The Live Mirror (See Your Reflection)
                </>
              )}
            </button>
          </div>

          {cameraError && (
            <p className="text-xs font-bold text-rose-600 mb-4">{cameraError}</p>
          )}

          {/* Description */}
          <p className="relative z-10 text-dark text-base sm:text-lg font-bold leading-relaxed">
            From live 1-on-1 tutoring and WAEC/JAMB exam preparation to interactive curriculum skill graphs and illustrated vocabulary, Edvoura reflects the full potential of every learner in a crystal-clear learning hub.
          </p>

          {/* Micro Feature Pills Floating on Glass */}
          <div className="mt-6 pt-5 border-t-2 border-dark/15 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-left">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border-2 border-dark shadow-[2px_2px_0px_#060E1C]">
              <Video className="w-4 h-4 text-dark shrink-0" />
              <span className="text-[11px] sm:text-xs font-black text-dark truncate">1-on-1 Tutoring</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border-2 border-dark shadow-[2px_2px_0px_#060E1C]">
              <Brain className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-[11px] sm:text-xs font-black text-dark truncate">Exam Prep</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border-2 border-dark shadow-[2px_2px_0px_#060E1C]">
              <Compass className="w-4 h-4 text-yellow-dim shrink-0" />
              <span className="text-[11px] sm:text-xs font-black text-dark truncate">Skill Roadmap</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border-2 border-dark shadow-[2px_2px_0px_#060E1C]">
              <BookOpen className="w-4 h-4 text-pink-600 shrink-0" />
              <span className="text-[11px] sm:text-xs font-black text-dark truncate">Word Atlas</span>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="group relative inline-flex w-full sm:w-auto items-center justify-center gap-3 bg-yellow text-dark border-[3px] border-dark font-heading font-black px-8 sm:px-12 py-4 sm:py-5 rounded-2xl shadow-[6px_6px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#060E1C] text-base sm:text-xl overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Start Learning Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link
            href="/roadmap"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-white text-dark border-[3px] border-dark font-heading font-black px-6 sm:px-8 py-4 sm:py-5 rounded-2xl shadow-[4px_4px_0px_#060E1C] transition-all hover:bg-off-white hover:translate-x-[1px] hover:translate-y-[1px] text-sm sm:text-base"
          >
            <Compass className="w-4 h-4 text-dark" />
            Explore Curriculum Roadmap
          </Link>
        </div>
      </div>
    </section>
  );
}
