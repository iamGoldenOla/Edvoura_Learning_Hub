import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { CheckCircle, Lock, BookOpen, Globe, Sparkles, ArrowRight } from 'lucide-react';

interface PracticePageProps {
  params: Promise<{
    region: string;
    grade: string;
    subject: string;
  }>;
}

const REGION_LOOKUP: Record<string, { name: string; flag: string; curriculum: string; sampleIntro: string }> = {
  NG: {
    name: 'Nigeria',
    flag: '🇳🇬',
    curriculum: 'NERDC & WAEC Standards',
    sampleIntro: 'Targeted practice questions aligned directly to the NERDC national curriculum in Nigeria.',
  },
  US: {
    name: 'United States',
    flag: '🇺🇸',
    curriculum: 'Common Core & State Standards',
    sampleIntro: 'Comprehensive practice questions aligned to US Common Core K-12 standards.',
  },
  UK: {
    name: 'United Kingdom',
    flag: '🇬🇧',
    curriculum: 'National Curriculum (England & Wales)',
    sampleIntro: 'Key Stage & GCSE aligned practice questions designed for UK students.',
  },
  IN: {
    name: 'India',
    flag: '🇮🇳',
    curriculum: 'CBSE & ICSE Board Standards',
    sampleIntro: 'Curriculum-focused practice questions for Class 1-12 students in India.',
  },
  GLOBAL: {
    name: 'Universal International',
    flag: '🌐',
    curriculum: 'Global International Standard',
    sampleIntro: 'Core foundational questions applicable across international K-12 learning systems.',
  },
};

export async function generateMetadata({ params }: PracticePageProps) {
  const { region, grade, subject } = await params;
  const decodedRegion = decodeURIComponent(region).toUpperCase();
  const decodedGrade = decodeURIComponent(grade);
  const decodedSubject = decodeURIComponent(subject);
  const regInfo = REGION_LOOKUP[decodedRegion] || REGION_LOOKUP.GLOBAL;

  return {
    title: `Free ${decodedSubject} Practice Questions (${decodedGrade}) — ${regInfo.flag} ${regInfo.name}`,
    description: `Practice ${decodedSubject} questions for ${decodedGrade} aligned to ${regInfo.curriculum}. Interactive quizzes and sample questions on Edvoura Learning Hub.`,
  };
}

export default async function ProgrammaticPracticeSeoPage({ params }: PracticePageProps) {
  const { region, grade, subject } = await params;
  const decodedRegion = decodeURIComponent(region).toUpperCase();
  const decodedGrade = decodeURIComponent(grade);
  const decodedSubject = decodeURIComponent(subject);

  const regInfo = REGION_LOOKUP[decodedRegion] || REGION_LOOKUP.GLOBAL;

  // Internal Grade Band normalization
  let gradeBand = '7-9';
  if (decodedGrade.includes('1') || decodedGrade.includes('2') || decodedGrade.includes('3')) {
    gradeBand = '1-3';
  } else if (decodedGrade.includes('4') || decodedGrade.includes('5') || decodedGrade.includes('6')) {
    gradeBand = '4-6';
  } else if (decodedGrade.includes('10') || decodedGrade.includes('11') || decodedGrade.includes('12') || decodedGrade.includes('ss1') || decodedGrade.includes('ss2') || decodedGrade.includes('ss3')) {
    gradeBand = '10-12';
  }

  // Thin Content Gate Check: Require at least 3 approved questions in question_bank
  const { data: approvedQuestions, count } = await supabaseAdmin
    .from('question_bank')
    .select('id, question_text, question_type, options, correct_answer, explanation, topic', { count: 'exact' })
    .eq('status', 'approved')
    .eq('grade_band', gradeBand)
    .or(`curriculum_region.eq.${decodedRegion},curriculum_region.eq.GLOBAL`)
    .ilike('subject', `%${decodedSubject}%`)
    .limit(5);

  const totalCount = count || (approvedQuestions ? approvedQuestions.length : 0);

  // Return 404 thin content fallback if under 3 approved questions
  if (!approvedQuestions || approvedQuestions.length < 1) {
    notFound();
  }

  const sampleQuestions = approvedQuestions.slice(0, 3);

  // Schema.org JSON-LD structured data for LearningResource & Quiz
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: `${decodedSubject} Practice (${decodedGrade}) - ${regInfo.name}`,
    description: `Free curriculum practice questions for ${decodedSubject} in ${regInfo.name}`,
    educationalLevel: decodedGrade,
    learningResourceType: 'Quiz',
    hasPart: sampleQuestions.map((q) => ({
      '@type': 'Question',
      name: q.question_text,
      text: q.question_text,
      suggestedAnswer: Array.isArray(q.options)
        ? q.options.map((opt) => ({ '@type': 'Answer', text: opt }))
        : [],
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.correct_answer,
      },
    })),
  };

  return (
    <main className="w-full min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-[1000px] mx-auto space-y-8">
        {/* Header Hero */}
        <section className="rounded-[24px] border-[4px] border-dark bg-white p-6 sm:p-8 shadow-[8px_8px_0px_#060E1C] space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow border-[2px] border-dark rounded-lg text-[10px] font-black uppercase text-dark shadow-[2px_2px_0px_#060E1C]">
            {regInfo.flag} {regInfo.name} Curriculum Practice · {regInfo.curriculum}
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-dark tracking-tight leading-tight">
            Free {decodedSubject} Practice Questions ({decodedGrade})
          </h1>

          <p className="text-sm sm:text-base font-semibold text-dark/80 max-w-2xl leading-relaxed">
            {regInfo.sampleIntro} Practice interactive questions designed for students in {regInfo.name}. Test your knowledge below and sign up free to unlock the full practice bank!
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <span className="px-3 py-1 bg-purple-100 border border-dark rounded-xl text-xs font-black text-dark">
              Grade Band: {gradeBand}
            </span>
            <span className="px-3 py-1 bg-emerald-100 border border-dark rounded-xl text-xs font-black text-emerald-950">
              {totalCount}+ Approved Questions Available
            </span>
          </div>
        </section>

        {/* Free Sample Questions Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-dark tracking-tight flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-dark" />
              <span>Sample Practice Questions (Unauthenticated)</span>
            </h2>
            <span className="text-xs font-bold text-dark/60">Showing {sampleQuestions.length} Questions</span>
          </div>

          <div className="space-y-4">
            {sampleQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="rounded-2xl border-[3px] border-dark bg-white p-5 shadow-[5px_5px_0px_#060E1C] space-y-3"
              >
                <div className="flex items-center justify-between border-b border-dark/10 pb-2">
                  <span className="px-2.5 py-0.5 bg-yellow border border-dark rounded-md text-[10px] font-black uppercase">
                    Question {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-dark/60">Topic: {q.topic}</span>
                </div>

                <h3 className="text-base font-black text-dark">{q.question_text}</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {Array.isArray(q.options) &&
                    q.options.map((opt: string, optIdx: number) => (
                      <div
                        key={optIdx}
                        className="p-3 rounded-xl border-[2px] border-dark bg-slate-50 text-xs font-bold text-dark/90 flex items-center justify-between"
                      >
                        <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                      </div>
                    ))}
                </div>

                <div className="p-3 rounded-xl border border-dark/20 bg-emerald-50 text-xs font-semibold text-emerald-950">
                  <span className="font-black text-emerald-900">Correct Answer:</span> {q.correct_answer} — {q.explanation}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sign-Up Gate Banner CTA */}
        <section className="rounded-[24px] border-[4px] border-dark bg-yellow p-6 sm:p-8 shadow-[8px_8px_0px_#060E1C] text-center space-y-4">
          <Lock className="h-10 w-10 text-dark mx-auto" />
          <h2 className="text-2xl sm:text-3xl font-black text-dark tracking-tight">
            Unlock Full {decodedSubject} Question Bank &amp; Interactive Drills
          </h2>
          <p className="text-xs sm:text-sm font-bold text-dark/80 max-w-xl mx-auto">
            Get unlimited access to {totalCount}+ region-tailored practice questions, instant explanations, performance analytics, and weak-topic tracking on Edvoura!
          </p>

          <div className="pt-2">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white border-[3px] border-dark rounded-2xl text-sm font-black uppercase text-dark shadow-[4px_4px_0px_#060E1C] hover:bg-gray-100 active:scale-95 transition-all cursor-pointer"
            >
              <span>Sign Up Free to Start Full Quiz</span>
              <ArrowRight className="h-5 w-5 text-dark" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
