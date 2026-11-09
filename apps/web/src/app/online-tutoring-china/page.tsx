import { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';
import SchoolSyllabusReassuranceBanner from '@/components/marketing/SchoolSyllabusReassuranceBanner';
import ParentSocialProofSection from '@/components/marketing/ParentSocialProofSection';
import {
  Calculator,
  BookOpen,
  Clock,
  CheckCircle2,
  ArrowRight,
  Globe2,
  ShieldCheck,
  Star,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Online Tutoring in China | 1-on-1 English & Math Tutors in Shanghai & Beijing',
  description:
    'Premier 1-on-1 online tutoring for international and bilingual school students in Shanghai, Beijing, Shenzhen, and Guangzhou. Certified educators for IB PYP, Cambridge, and Singapore Math from $20/session.',
  keywords: [
    'online tutoring China',
    'online tutor Shanghai',
    'online tutor Beijing',
    'English tutor China expat',
    'Cambridge Primary tutor China',
    'Singapore math tutor Shanghai',
    'international school tutoring Beijing',
    '1-on-1 online tutor China $20',
  ],
  alternates: {
    canonical: 'https://edvouralearninghub.com/online-tutoring-china',
  },
  openGraph: {
    title: '1-on-1 Online Tutoring in China — IB, Cambridge Math & English',
    description:
      'Connecting international and bilingual school families in Shanghai, Beijing, and Shenzhen with certified online tutors from $20/session.',
    url: 'https://edvouralearninghub.com/online-tutoring-china',
    siteName: 'Edvoura Learning Hub',
    locale: 'en_US',
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      name: '1-on-1 Online Tutoring in China',
      provider: {
        '@type': 'EducationalOrganization',
        name: 'Edvoura Learning Hub',
        url: 'https://edvouralearninghub.com',
      },
      areaServed: [
        { '@type': 'Country', name: 'China' },
        { '@type': 'City', name: 'Shanghai' },
        { '@type': 'City', name: 'Beijing' },
        { '@type': 'City', name: 'Shenzhen' },
        { '@type': 'City', name: 'Guangzhou' },
      ],
      serviceType: '1-on-1 Online Tutoring & Academic Coaching',
      offers: {
        '@type': 'Offer',
        price: '20.00',
        priceCurrency: 'USD',
        description: '$20 per focused 1-on-1 60-minute session ($25/hr for standard, $30/hr for elite prep)',
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Does Edvoura accommodate China Standard Time (CST)?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! Classes are scheduled conveniently in China Standard Time (CST / UTC+8), providing after-school slots (4:00 PM to 9:00 PM CST) and weekend daytime classes.',
          },
        },
        {
          '@type': 'Question',
          name: 'What curriculum is supported for students in China?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'We support IB Primary Years Programme (PYP), Cambridge Primary, US Common Core, and Singapore Math for students attending schools such as Shanghai American School, Dulwich College, Concordia, and Harrow.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do parents in China connect and pay?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Lessons are accessed via the Edvoura web portal with integrated secure live video. Payments are transparent at $20/session with no long-term lock-ins.',
          },
        },
      ],
    },
  ],
};

export default function ChinaTutoringPage() {
  return (
    <div className="min-h-screen bg-off-white text-navy flex flex-col font-sans selection:bg-yellow selection:text-navy">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <main className="flex-1">
        {/* HERO */}
        <section className="bg-[#060E1C] text-white pt-16 pb-20 sm:pt-24 sm:pb-28 border-b-8 border-navy relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F5C518_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

          <div className="marketing-container max-w-6xl mx-auto px-4 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-yellow/40 bg-white/10 px-4 py-1.5 mb-6 backdrop-blur-sm">
              <span className="text-xl">🇨🇳</span>
              <span className="text-xs font-black uppercase tracking-wider text-yellow">
                China &amp; International School Corridor
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto font-heading">
              1-on-1 Online Tutoring for Students in{' '}
              <span className="text-yellow underline decoration-wavy decoration-yellow/60">
                Shanghai, Beijing &amp; Across China
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-xl font-bold text-white/80 max-w-2xl mx-auto leading-relaxed">
              Certified international educators specializing in Cambridge Primary, IB PYP, Singapore Math, and English Fluency. Scheduled in China Standard Time (CST).
            </p>

            <div className="mt-8 inline-flex items-center gap-4 bg-yellow text-navy px-6 py-3 rounded-2xl border-4 border-navy shadow-[6px_6px_0px_#ffffff]">
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider">
                Transparent Pricing:
              </span>
              <span className="text-xl sm:text-2xl font-black">
                $20 <span className="text-xs font-bold uppercase">/ session (1-on-1)</span>
              </span>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/signup?role=parent"
                className="rounded-2xl border-4 border-navy bg-yellow px-8 py-4 text-base sm:text-lg font-black text-navy shadow-[6px_6px_0px_#0A1628] hover:-translate-y-1 transition-transform inline-flex items-center gap-2"
              >
                <span>Book a Free Trial Session</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/services"
                className="rounded-2xl border-4 border-white/30 bg-white/10 px-8 py-4 text-base sm:text-lg font-black text-white hover:bg-white/20 transition-colors"
              >
                Explore Primary Subjects
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left max-w-4xl mx-auto">
              {[
                { label: 'China Time (CST)', desc: 'After-school & weekend slots' },
                { label: 'IB PYP & Cambridge', desc: 'Curriculum-aligned mastery' },
                { label: 'English Comprehension', desc: 'Vocabulary & writing focus' },
                { label: 'Weekly Parent Digest', desc: 'AI progress reports to email' },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-white/20 bg-white/5 p-3">
                  <div className="flex items-center gap-1.5 text-yellow text-xs font-black">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  <p className="text-[11px] text-white/70 mt-1 font-semibold">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PILLARS */}
        <section className="py-20 sm:py-24 bg-white border-b-8 border-navy">
          <div className="marketing-container max-w-6xl mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="inline-block rounded-xl border-2 border-navy bg-yellow px-4 py-1 text-xs font-black uppercase tracking-wider text-navy mb-3 shadow-[3px_3px_0px_#0A1628]">
                Bilingual &amp; Expat Focus
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-navy tracking-tight font-heading">
                Serving International &amp; Bilingual School Learners
              </h2>
              <p className="mt-3 text-base font-bold text-navy/70 leading-relaxed">
                Whether enrolled at Shanghai American School, Dulwich, Concordia, Harrow, or top bilingual academies, our tutors unlock your child’s highest potential.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="rounded-3xl border-4 border-navy bg-off-white p-8 shadow-[8px_8px_0px_#0A1628] hover:-translate-y-1 transition-transform">
                <div className="w-14 h-14 rounded-2xl border-3 border-navy bg-yellow flex items-center justify-center mb-6 shadow-[3px_3px_0px_#0A1628]">
                  <Calculator className="w-7 h-7 text-navy" />
                </div>
                <h3 className="font-heading font-black text-2xl text-navy mb-3">
                  Singapore Math &amp; Heuristics
                </h3>
                <p className="text-sm font-bold text-navy/80 leading-relaxed">
                  Deep conceptual problem solving. Visual bar modeling bridges abstract equations into clear logic for multi-step Olympiad and school exam questions.
                </p>
              </div>

              <div className="rounded-3xl border-4 border-navy bg-off-white p-8 shadow-[8px_8px_0px_#0A1628] hover:-translate-y-1 transition-transform">
                <div className="w-14 h-14 rounded-2xl border-3 border-navy bg-sky-200 flex items-center justify-center mb-6 shadow-[3px_3px_0px_#0A1628]">
                  <BookOpen className="w-7 h-7 text-navy" />
                </div>
                <h3 className="font-heading font-black text-2xl text-navy mb-3">
                  English Critical Reading &amp; Phonics
                </h3>
                <p className="text-sm font-bold text-navy/80 leading-relaxed">
                  Moving beyond rote test prep. We build authentic English fluency, reading comprehension, critical analysis, and expressive creative writing.
                </p>
              </div>

              <div className="rounded-3xl border-4 border-navy bg-off-white p-8 shadow-[8px_8px_0px_#0A1628] hover:-translate-y-1 transition-transform">
                <div className="w-14 h-14 rounded-2xl border-3 border-navy bg-emerald-300 flex items-center justify-center mb-6 shadow-[3px_3px_0px_#0A1628]">
                  <Clock className="w-7 h-7 text-navy" />
                </div>
                <h3 className="font-heading font-black text-2xl text-navy mb-3">
                  Focused 1-Hour Homework Help
                </h3>
                <p className="text-sm font-bold text-navy/80 leading-relaxed">
                  Structured 60-minute coaching to master demanding international school coursework without family friction or burnout.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="py-20 bg-yellow border-b-8 border-navy text-center">
          <div className="marketing-container max-w-4xl mx-auto px-4">
            <span className="inline-block rounded-xl border-2 border-navy bg-white px-4 py-1 text-xs font-black uppercase tracking-wider text-navy mb-3 shadow-[3px_3px_0px_#0A1628]">
              Transparent Global Value
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-navy tracking-tight font-heading">
              World-Class 1-on-1 Tutoring at Just $20 / Session
            </h2>
            <p className="mt-4 text-base sm:text-lg font-bold text-navy/80 max-w-xl mx-auto">
              Save over 60% compared to private tutoring centers in Shanghai and Beijing while giving your child direct access to certified international educators.
            </p>

            <div className="mt-10 bg-white border-4 border-navy rounded-3xl p-8 sm:p-10 shadow-[10px_10px_0px_#0A1628] text-left max-w-lg mx-auto">
              <div className="flex items-center justify-between pb-6 border-b-2 border-navy/10">
                <div>
                  <h3 className="font-heading font-black text-2xl text-navy">1-on-1 Live Tutoring</h3>
                  <p className="text-xs font-bold text-navy/60">Grades 1 – 6 (Ages 5 – 11)</p>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-black text-navy">$20</span>
                  <span className="block text-xs font-bold text-navy/70">/ session</span>
                </div>
              </div>

              <div className="space-y-3 py-6">
                {[
                  '1-on-1 private live video room & whiteboard',
                  'IB PYP, Cambridge & Singapore Math alignment',
                  'Scheduled to China Standard Time (CST)',
                  'Weekly autonomous AI parent report to email',
                  'Homework review & vocabulary coaching',
                ].map((perk) => (
                  <div key={perk} className="flex items-center gap-3 text-sm font-bold text-navy">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/signup?role=parent"
                className="w-full block text-center rounded-2xl border-4 border-navy bg-yellow py-4 text-base font-black text-navy shadow-[4px_4px_0px_#0A1628] hover:-translate-y-1 transition-transform"
              >
                Start with a Free Consultation
              </Link>
            </div>
          </div>
        </section>

        {/* PARENT REVIEWS & SOCIAL PROOF */}
        <ParentSocialProofSection />

        {/* BOTTOM CTA */}
        <section className="py-20 bg-[#060E1C] text-white text-center">
          <div className="marketing-container max-w-2xl mx-auto px-4">
            <h2 className="text-3xl sm:text-4xl font-black font-heading mb-4">
              Give Your Child an Unstoppable Academic Foundation
            </h2>
            <p className="text-base font-bold text-white/80 mb-8">
              Join families in Shanghai, Beijing, and Shenzhen who trust Edvoura for patient, structured 1-on-1 tutoring.
            </p>
            <Link
              href="/signup?role=parent"
              className="inline-flex items-center gap-2 rounded-2xl border-4 border-navy bg-yellow px-8 py-4 text-lg font-black text-navy shadow-[6px_6px_0px_#ffffff] hover:-translate-y-1 transition-transform"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
