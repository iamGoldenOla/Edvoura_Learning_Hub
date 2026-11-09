import React from 'react';
import { Camera, FileText, CheckCircle2, Sparkles, ArrowRight, UploadCloud } from 'lucide-react';
import Link from 'next/link';

export default function SchoolSyllabusReassuranceBanner() {
  return (
    <section className="bg-yellow border-b-8 border-navy py-12 sm:py-16 text-navy">
      <div className="marketing-container max-w-5xl mx-auto px-4">
        <div className="rounded-[2.5rem] border-4 border-navy bg-white p-6 sm:p-10 md:p-12 shadow-[8px_8px_0px_#0A1628] flex flex-col lg:flex-row items-center gap-8 md:gap-12">
          {/* Visual Icon Badge */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl border-4 border-navy bg-yellow flex items-center justify-center shrink-0 shadow-[4px_4px_0px_#0A1628]">
            <UploadCloud className="w-10 h-10 sm:w-12 sm:h-12 text-navy" />
          </div>

          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-xl border-2 border-navy bg-emerald-100 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-900 mb-3 shadow-[2px_2px_0px_#0A1628]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>School-Aligned &bull; Zero Guesswork</span>
            </div>

            <h2 className="font-heading font-black text-2xl sm:text-3xl md:text-4xl text-navy leading-tight mb-3">
              We Teach Your Child&apos;s Exact School Syllabus, Curriculum &amp; Homework
            </h2>

            <p className="text-sm sm:text-base font-bold text-navy/80 leading-relaxed max-w-2xl">
              No generic, disconnected lessons. You can share your child&apos;s school curriculum, term scheme of work, textbook chapter, or weekly homework worksheet. Your dedicated educator sits 1-on-1 to re-teach that exact classroom lesson step-by-step.
            </p>

            {/* 3 Steps */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              {[
                {
                  step: '1',
                  title: 'Share Curriculum or Task',
                  desc: "Upload your child's term syllabus, textbook page, or homework sheet",
                },
                {
                  step: '2',
                  title: '1-on-1 Patient Breakdown',
                  desc: 'Educator aligns coaching directly to what their school teacher taught',
                },
                {
                  step: '3',
                  title: 'Independent Mastery',
                  desc: 'Child finishes assignments calmly with zero evening homework tears',
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="rounded-2xl border-2 border-navy bg-off-white p-3.5 shadow-[2px_2px_0px_#0A1628]"
                >
                  <div className="flex items-center gap-2 text-navy font-black text-xs uppercase mb-1">
                    <span className="w-5 h-5 rounded-full bg-yellow border border-navy flex items-center justify-center text-[10px]">
                      {item.step}
                    </span>
                    <span>{item.title}</span>
                  </div>
                  <p className="text-[11px] font-bold text-navy/70 leading-normal">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
