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
  title: 'Online Tutoring in Canada | 1-on-1 Math & English Tutors in Toronto & Vancouver',
  description:
    'Premier 1-on-1 online tutoring for students in Toronto, Vancouver, Calgary, and across Canada. Certified educators for Ontario Curriculum, BC Curriculum, and Singapore Math from $20/session.',
  keywords: [
    'online tutoring Canada',
    'online tutor Toronto',
    'online tutor Vancouver',
    'Ontario curriculum tutor',
    'BC curriculum math tutor',
    'diaspora tutoring Canada',
    'Canadian primary tutor $20',
    '1-on-1 online tutor Canada',
  ],
  alternates: {
    canonical: 'https://edvouralearninghub.com/online-tutoring-canada',
  },
  openGraph: {
    title: '1-on-1 Online Tutoring in Canada — Ontario & BC Math & Literacy',
    description:
      'Connecting families in Toronto, Vancouver, and across Canada with certified online educators from $20/session.',
    url: 'https://edvouralearninghub.com/online-tutoring-canada',
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
      name: '1-on-1 Online Tutoring in Canada',
      provider: {
        '@type': 'EducationalOrganization',
        name: 'Edvoura Learning Hub',
        url: 'https://edvouralearninghub.com',
      },
      areaServed: [
        { '@type': 'Country', name: 'Canada' },
        { '@type': 'City', name: 'Toronto' },
        { '@type': 'City', name: 'Vancouver' },
        { '@type': 'City', name: 'Calgary' },
        { '@type': 'City', name: 'Ottawa' },
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
          name: 'Does Edvoura accommodate Canadian timezones?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! We support all Canadian timezones including Eastern (EST), Central (CST), Mountain (MST), and Pacific (PST) with after-school and weekend schedules.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is the teaching aligned to Canadian provincial curricula?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! Our tutors align lessons with the Ontario Curriculum (including the destreamed Math curriculum and EQAO readiness), the British Columbia (BC) Curriculum, and Alberta standards.',
          },
        },
        {
          '@type': 'Question',
          name: 'How much does online tutoring cost in Canada on Edvoura?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Our rates start at just $20 per focused 1-on-1 session. This is 60% lower than typical in-person tutoring agencies in Toronto or Vancouver that charge $55 to $80 per hour.',
          },
        },
      ],
    },
  ],
};

export default function CanadaTutoringPage() {
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
              <span className="text-xl">🇨🇦</span>
              <span className="text-xs font-black uppercase tracking-wider text-yellow">
                Canada &amp; Diaspora Learning Corridor
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto font-heading">
              1-on-1 Online Tutoring for Students in{' '}
              <span className="text-yellow underline decoration-wavy decoration-yellow/60">
                Toronto, Vancouver &amp; Canada
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-xl font-bold text-white/80 max-w-2xl mx-auto leading-relaxed">
              Patient, certified educators aligned with the Ontario, British Columbia &amp; Alberta curricula. Scheduled in your local Canadian time zone from $20/session.
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
                { label: 'Canadian Zones (EST/PST)', desc: 'After-school & weekend slots' },
                { label: 'Provincial Alignment', desc: 'Ontario & BC curriculum fit' },
                { label: 'Save 60% on Rates', desc: 'No $75/hr agency markups' },
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
                Newcomer &amp; Diaspora Family Support
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-navy tracking-tight font-heading">
                Comprehensive K-12 Support Across Canada
              </h2>
              <p className="mt-3 text-base font-bold text-navy/70 leading-relaxed">
                Whether navigating Ontario EQAO testing, high school transition, or early elementary literacy, our dedicated tutors ensure your child excels.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="rounded-3xl border-4 border-navy bg-off-white p-8 shadow-[8px_8px_0px_#0A1628] hover:-translate-y-1 transition-transform">
                <div className="w-14 h-14 rounded-2xl border-3 border-navy bg-yellow flex items-center justify-center mb-6 shadow-[3px_3px_0px_#0A1628]">
                  <Calculator className="w-7 h-7 text-navy" />
                </div>
                <h3 className="font-heading font-black text-2xl text-navy mb-3">
                  Foundational &amp; Destreamed Math
                </h3>
                <p className="text-sm font-bold text-navy/80 leading-relaxed">
                  Aligned with Ontario and BC provincial standards. We use visual Singapore-style bar modeling, fractions arrays, and algebra problem-solving techniques.
                </p>
              </div>

              <div className="rounded-3xl border-4 border-navy bg-off-white p-8 shadow-[8px_8px_0px_#0A1628] hover:-translate-y-1 transition-transform">
                <div className="w-14 h-14 rounded-2xl border-3 border-navy bg-sky-200 flex items-center justify-center mb-6 shadow-[3px_3px_0px_#0A1628]">
                  <BookOpen className="w-7 h-7 text-navy" />
                </div>
                <h3 className="font-heading font-black text-2xl text-navy mb-3">
                  English Literacy &amp; Reading Fluency
                </h3>
                <p className="text-sm font-bold text-navy/80 leading-relaxed">
                  Phonics decoding, structured paragraph writing, grammar mastery, and critical comprehension tailored to help students excel in classroom assessments.
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
                  Dedicated 60-minute sessions to unpack complex school projects, worksheet roadblocks, and test preparation without tension.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="py-20 bg-yellow border-b-8 border-navy text-center">
          <div className="marketing-container max-w-4xl mx-auto px-4">
            <span className="inline-block rounded-xl border-2 border-navy bg-white px-4 py-1 text-xs font-black uppercase tracking-wider text-navy mb-3 shadow-[3px_3px_0px_#0A1628]">
              Transparent Canadian Value
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-navy tracking-tight font-heading">
              World-Class 1-on-1 Tutoring at Just $20 / Session
            </h2>
            <p className="mt-4 text-base sm:text-lg font-bold text-navy/80 max-w-xl mx-auto">
              Save up to 65% compared to private learning centers in the GTA or Greater Vancouver while receiving individualized, patient instruction.
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
                  'Ontario, BC & Alberta provincial curriculum fit',
                  'Scheduled to Canadian EST, CST, MST, PST times',
                  'Weekly autonomous AI parent report to email',
                  'Homework coaching & EQAO readiness support',
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
              Join families in Toronto, Vancouver, and Calgary who trust Edvoura for patient, structured 1-on-1 tutoring.
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
