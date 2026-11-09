import React from 'react';
import { Star, Quote, CheckCircle2, HeartHandshake } from 'lucide-react';

export default function ParentSocialProofSection() {
  const reviews = [
    {
      parent: 'Mrs. Folashade A.',
      location: 'London, United Kingdom 🇬🇧',
      grade: 'Parent of Grade 4 Pupil (UK Year 5)',
      quote:
        'Our tutor turned evening homework tears into calm, focused 45-minute sessions. Her math confidence and fractions understanding have soared, and her classroom teacher in London noticed the jump in participation within three weeks.',
      highlight: 'Turned homework tears into calm focus',
      verified: 'Verified UK Parent',
    },
    {
      parent: 'Dr. & Mrs. Adeleke',
      location: 'Lagos, Nigeria 🇳🇬',
      grade: 'Parent of Grade 2 Pupil (Primary 2)',
      quote:
        'The hybrid structure—Saturday online via Google Meet and weekday in-person home tutoring—gives Smith the exact consistency he needs. He is reading and solving word problems well ahead of his class.',
      highlight: 'Reading & math well ahead of class',
      verified: 'Verified Hybrid Student',
    },
    {
      parent: 'Elena & Rustam',
      location: 'Tashkent, Uzbekistan 🇺🇿',
      grade: 'Parents of Grade 3 Cambridge Learner',
      quote:
        'Finding patient English phonics and Singapore math tutors in our time zone was a challenge before Edvoura. The 1-on-1 lessons match our international school syllabus, and the weekly progress report gives us total visibility.',
      highlight: 'Perfect fit for international school syllabus',
      verified: 'Verified International Family',
    },
    {
      parent: 'David & Chioma O.',
      location: 'Toronto, Canada 🇨🇦',
      grade: 'Parents of Grade 5 Pupil (Ontario Math)',
      quote:
        'We were paying $70/hr for agency tutoring in Toronto with minimal personal attention. Edvoura’s $20 focused sessions are much more engaging, patient, and aligned directly with the Ontario curriculum.',
      highlight: 'Far better results than $70/hr agency tutoring',
      verified: 'Verified Canadian Diaspora Parent',
    },
  ];

  return (
    <section className="bg-sand py-20 sm:py-28 border-b-8 border-navy text-navy font-sans">
      <div className="marketing-container max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-xl border-2 border-navy bg-yellow px-4 py-1 text-xs font-black uppercase tracking-wider mb-4 shadow-[3px_3px_0px_#0A1628]">
            <HeartHandshake className="w-4 h-4" />
            <span>Real Families &bull; Measurable Progress</span>
          </div>

          <h2 className="font-heading font-black text-3xl sm:text-5xl text-navy tracking-tight leading-tight">
            Trusted by Parents Across Continents
          </h2>
          <p className="mt-4 text-base sm:text-lg font-bold text-navy/70 leading-relaxed">
            From London and Lagos to Tashkent and Toronto, see how dedicated 1-on-1 coaching transforms daily learning confidence.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {reviews.map((rev) => (
            <div
              key={rev.parent}
              className="rounded-3xl border-4 border-navy bg-white p-7 sm:p-9 shadow-[8px_8px_0px_#0A1628] flex flex-col justify-between hover:-translate-y-1 transition-transform"
            >
              <div>
                {/* Top Badge & Rating */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-yellow">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow text-navy" />
                    ))}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border border-navy/20 bg-emerald-50 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{rev.verified}</span>
                  </span>
                </div>

                {/* Highlight Pill */}
                <div className="mb-3">
                  <span className="font-heading font-black text-sm text-navy bg-yellow/40 px-2.5 py-1 rounded-lg border border-navy/20 inline-block">
                    &ldquo;{rev.highlight}&rdquo;
                  </span>
                </div>

                {/* Quote */}
                <p className="text-sm font-bold text-navy/80 leading-relaxed mb-6">
                  &ldquo;{rev.quote}&rdquo;
                </p>
              </div>

              {/* Parent Info */}
              <div className="pt-4 border-t-2 border-navy/10 flex items-center justify-between">
                <div>
                  <h4 className="font-heading font-black text-base text-navy">{rev.parent}</h4>
                  <p className="text-xs font-bold text-navy/60">{rev.grade}</p>
                </div>
                <span className="text-xs font-black text-navy/70 bg-off-white px-2.5 py-1 rounded-xl border border-navy/15">
                  {rev.location}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
