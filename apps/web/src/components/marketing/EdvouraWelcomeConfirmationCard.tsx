'use client';

import { CheckCircle2, Sparkles, Globe, Phone, BookOpen, ShieldCheck, ArrowRight, Star, Heart } from 'lucide-react';
import Link from 'next/link';

export function EdvouraWelcomeConfirmationCard({
  parentName,
  parentEmail,
  topic = 'General Inquiry',
  onReset,
}: {
  parentName: string;
  parentEmail: string;
  topic?: string;
  onReset: () => void;
}) {
  const firstName = parentName.split(' ')[0] || 'Parent';

  return (
    <div className="w-full rounded-[28px] border-[4px] border-navy bg-white p-6 sm:p-10 shadow-[12px_12px_0px_#22C55E] animate-fade-up space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl border-[3px] border-navy bg-gradient-to-r from-yellow via-amber-200 to-emerald-200 shadow-[4px_4px_0px_#0A1628] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-[3px] border-navy bg-white shadow-[3px_3px_0px_#0A1628]">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full border-[2px] border-navy bg-navy text-yellow text-[10px] font-black uppercase tracking-widest mb-1">
              <Sparkles className="h-3 w-3 text-yellow" /> Inquiry Received &amp; Logged
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-black text-navy leading-tight">
              Welcome to Edvoura, {firstName}! 🎉
            </h2>
            <p className="text-xs sm:text-sm font-bold text-navy/80 mt-0.5">
              Confirmation &amp; Welcome Guide dispatched to <span className="underline font-black text-navy">{parentEmail}</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Comprehensive Overview Grid */}
      <div className="grid gap-6 md:grid-cols-2 text-left">
        
        {/* Left Column: Why Edvoura & Features */}
        <div className="p-6 rounded-2xl border-[3px] border-navy bg-sky-50 shadow-[4px_4px_0px_#0A1628] space-y-4">
          <div className="flex items-center gap-2 text-navy font-heading font-black text-lg">
            <Globe className="h-5 w-5 text-navy" />
            <h3>Why Families Love Edvoura</h3>
          </div>
          <ul className="space-y-3 text-xs sm:text-sm font-bold text-navy/90 leading-relaxed">
            <li className="flex items-start gap-2">
              <Star className="h-4 w-4 text-amber-500 fill-amber-400 shrink-0 mt-0.5" />
              <span><strong>1-on-1 Vetted Global Tutors:</strong> Matched strictly to your child&apos;s learning speed and curriculum needs.</span>
            </li>
            <li className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
              <span><strong>AI Learning Profiler:</strong> Detects weak topics in real time and reinforces visual memory.</span>
            </li>
            <li className="flex items-start gap-2">
              <BookOpen className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>3D Gamified Live Studio:</strong> Interactive quizzes &amp; Millionaire live game shows for peak retention.</span>
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <span><strong>Grade 1 to 12 Isolation:</strong> Dedicated isolated grade material (WAEC, IGCSE, AP, SAT).</span>
            </li>
          </ul>
        </div>

        {/* Right Column: 3-Step Onboarding Next Timeline */}
        <div className="p-6 rounded-2xl border-[3px] border-navy bg-amber-50 shadow-[4px_4px_0px_#0A1628] space-y-4">
          <div className="flex items-center gap-2 text-navy font-heading font-black text-lg">
            <ShieldCheck className="h-5 w-5 text-navy" />
            <h3>Your 3-Step Next Journey</h3>
          </div>
          <div className="space-y-3 text-xs sm:text-sm font-bold text-navy/90">
            <div className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[2px] border-navy bg-emerald-400 text-navy font-black text-xs">1</span>
              <p><strong>Advisor Outreach (Within 24 Hours):</strong> Our senior academic advisor will reach out to confirm your child&apos;s exact grade and goals.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[2px] border-navy bg-yellow text-navy font-black text-xs">2</span>
              <p><strong>Free Introductory Live Session:</strong> Experience a 1-on-1 live trial class with a matched expert tutor.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[2px] border-navy bg-purple-400 text-white font-black text-xs">3</span>
              <p><strong>Custom Academic Roadmap:</strong> Receive weekly progress reports, PDF report cards, and homework support.</p>
            </div>
          </div>
        </div>

      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t-[3px] border-navy/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-black text-navy/70">
          <Phone className="h-4 w-4 text-emerald-600" />
          <span>Need instant assistance? Call or WhatsApp us: <strong>07010158258</strong></span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onReset}
            className="px-5 py-2.5 bg-white border-[2.5px] border-navy text-navy font-heading font-black rounded-xl text-xs uppercase tracking-wider hover:bg-slate-100 cursor-pointer"
          >
            Send Another Inquiry
          </button>
          <Link
            href="/login"
            className="px-6 py-2.5 bg-navy text-white border-[2.5px] border-navy rounded-xl text-xs font-heading font-black uppercase tracking-wider shadow-[3px_3px_0px_#F5C518] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-1.5"
          >
            Explore Parent Portal <ArrowRight className="h-4 w-4 text-yellow" />
          </Link>
        </div>
      </div>

    </div>
  );
}
