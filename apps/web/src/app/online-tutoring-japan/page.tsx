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
  title: 'Online Tutoring in Japan | 1-on-1 English & Math Tutors in Tokyo',
  description:
    'Premier 1-on-1 online tutoring for international and bilingual students in Tokyo, Yokohama, and across Japan. Certified educators for Cambridge Primary, IB PYP, and Singapore Math starting from $20/session.',
  keywords: [
    'online tutoring Japan',
    'online tutor Tokyo',
    'English tutor Japan expat',
    'Cambridge Primary tutor Tokyo',
    'Singapore math tutor Japan',
    'international school tutoring Tokyo',
    'Kikokushijo returnee tutor Japan',
    '1-on-1 online tutor Tokyo $20',
  ],
  alternates: {
    canonical: 'https://edvouralearninghub.com/online-tutoring-japan',
  },
  openGraph: {
    title: '1-on-1 Online Tutoring in Japan — Cambridge Math & English',
    description:
      'Connecting families in Tokyo, Yokohama, and Japan with certified online tutors for Cambridge Primary, IB, Singapore Math, and English literacy from $20/session.',
    url: 'https://edvouralearninghub.com/online-tutoring-japan',
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
      name: '1-on-1 Online Tutoring in Japan',
      provider: {
        '@type': 'EducationalOrganization',
        name: 'Edvoura Learning Hub',
        url: 'https://edvouralearninghub.com',
      },
      areaServed: [
        { '@type': 'Country', name: 'Japan' },
        { '@type': 'City', name: 'Tokyo' },
        { '@type': 'City', name: 'Yokohama' },
        { '@type': 'City', name: 'Osaka' },
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
          name: 'Does Edvoura support students in Japan Standard Time (JST)?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! All classes are scheduled around Japan Standard Time (JST / UTC+9). Tutors are available after school from 3:30 PM to 9:00 PM JST on weekdays and throughout weekends.',
          },
        },
        {
          '@type': 'Question',
          name: 'What curriculum is taught for international school students in Japan?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'We support Cambridge Primary, IB Primary Years Programme (PYP), British National Curriculum, and Singapore Math for students attending schools such as ASIJ, The British School in Tokyo, St. Marys, and Seisen.',
          },
        },
        {
          '@type': 'Question',
          name: 'How much does online tutoring cost for parents in Japan?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Pricing starts at $20 per session for 1-on-1 coaching, saving families 50% to 70% compared to local in-person cram schools (Juku) or Tokyo private tutors.',
          },
        },
      ],
    },
  ],
};

export default function JapanTutoringPage() {
  return (
    <div className="min-h-screen bg-off-white text-navy flex flex-col font-sans selection:bg-yellow selection:text-navy">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="bg-[#060E1C] text-white pt-16 pb-20 sm:pt-24 sm:pb-28 border-b-8 border-navy relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F5C518_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

          <div className="marketing-container max-w-6xl mx-auto px-4 relative z-10 text-center">
            {/* Country Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-yellow/40 bg-white/10 px-4 py-1.5 mb-6 backdrop-blur-sm">
              <span className="text-xl">🇯🇵</span>
              <span className="text-xs font-black uppercase tracking-wider text-yellow">
                Japan &amp; East Asia Learning Corridor
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto font-heading">
              World-Class 1-on-1 Online Tutoring for Students in{' '}
              <span className="text-yellow underline decoration-wavy decoration-yellow/60">
                Tokyo &amp; Across Japan
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-xl font-bold text-white/80 max-w-2xl mx-auto leading-relaxed">
              Empower your child with patient, certified educators in Cambridge Primary, IB PYP, Singapore Math, and English Fluency. Scheduled conveniently in Japan Standard Time (JST).
            </p>

            {/* Quick Pricing Badge */}
            <div className="mt-8 inline-flex items-center gap-4 bg-yellow text-navy px-6 py-3 rounded-2xl border-4 border-navy shadow-[6px_6px_0px_#ffffff]">
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider">
                Transparent Pricing:
              </span>
              <span className="text-xl sm:text-2xl font-black">
                $20 <span className="text-xs font-bold uppercase">/ session (1-on-1)</span>
              </span>
            </div>

            {/* CTAs */}
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

            {/* Trust Points */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left max-w-4xl mx-auto">
              {[
                { label: 'Japan Time (JST)', desc: 'After-school & weekend slots' },
                { label: 'Cambridge & IB PYP', desc: 'Primary Checkpoint & fluency' },
                { label: 'No Juku Burnout', desc: 'Patient, calm 1-hr coaching' },
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

        {/* WHY FAMILIES IN JAPAN CHOOSE EDVOURA */}
        <section className="py-20 sm:py-24 bg-white border-b-8 border-navy">
          <div className="marketing-container max-w-6xl mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="inline-block rounded-xl border-2 border-navy bg-yellow px-4 py-1 text-xs font-black uppercase tracking-wider text-navy mb-3 shadow-[3px_3px_0px_#0A1628]">
                Expat &amp; Returnee (Kikokushijo) Support
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-navy tracking-tight font-heading">
                Tailored for International School Students in Japan
              </h2>
              <p className="mt-3 text-base font-bold text-navy/70 leading-relaxed">
                Whether your child attends The British School in Tokyo, ASIJ, St. Mary&apos;s, Seisen, or an international bilingual academy, Edvoura delivers individualized excellence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="rounded-3xl border-4 border-navy bg-off-white p-8 shadow-[8px_8px_0px_#0A1628] hover:-translate-y-1 transition-transform">
                <div className="w-14 h-14 rounded-2xl border-3 border-navy bg-yellow flex items-center justify-center mb-6 shadow-[3px_3px_0px_#0A1628]">
                  <Calculator className="w-7 h-7 text-navy" />
                </div>
                <h3 className="font-heading font-black text-2xl text-navy mb-3">
                  Singapore Math &amp; Bar Modeling
                </h3>
                <p className="text-sm font-bold text-navy/80 leading-relaxed">
                  We turn abstract math into intuitive games using visual fraction models, arrays, and bar modeling to solve complex multi-step word problems calmly.
                </p>
              </div>

              <div className="rounded-3xl border-4 border-navy bg-off-white p-8 shadow-[8px_8px_0px_#0A1628] hover:-translate-y-1 transition-transform">
                <div className="w-14 h-14 rounded-2xl border-3 border-navy bg-sky-200 flex items-center justify-center mb-6 shadow-[3px_3px_0px_#0A1628]">
                  <BookOpen className="w-7 h-7 text-navy" />
                </div>
                <h3 className="font-heading font-black text-2xl text-navy mb-3">
                  English Literacy &amp; Phonics
                </h3>
                <p className="text-sm font-bold text-navy/80 leading-relaxed">
                  Systematic phonics decoding, expressive reading aloud, and vocabulary expansion. Overcoming Katakana pronunciation drift to build true native confidence.
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
                  End stressful evenings. A dedicated educator works 1-on-1 for 60 structured minutes to unpack tough international school worksheets and re-teach concepts clearly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section className="py-20 bg-yellow border-b-8 border-navy">
          <div className="marketing-container max-w-4xl mx-auto px-4 text-center">
            <span className="inline-block rounded-xl border-2 border-navy bg-white px-4 py-1 text-xs font-black uppercase tracking-wider text-navy mb-3 shadow-[3px_3px_0px_#0A1628]">
              No Juku Overcrowding &bull; No Hidden Fees
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-navy tracking-tight font-heading">
              Save 50% to 70% Compared to Tokyo Private Tutors
            </h2>
            <p className="mt-4 text-base sm:text-lg font-bold text-navy/80 max-w-xl mx-auto">
              Give your child direct 1-on-1 access to passionate international educators at a fraction of central Tokyo tutoring fees.
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
                  '1-on-1 private video classroom with interactive tools',
                  'Singapore Math, Cambridge & IB PYP syllabus alignment',
                  'Scheduled to Japan Standard Time (JST)',
                  'Weekly autonomous AI parent report to email',
                  'Homework coaching & reading fluency practice',
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
              Join expat and bilingual families in Tokyo, Yokohama, and Osaka who trust Edvoura for patient, structured 1-on-1 tutoring.
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
