import { Metadata } from 'next';
import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';
import CrystalMirrorHero from '@/components/marketing/CrystalMirrorHero';
import Link from 'next/link';
import Image from 'next/image';
import {
  Video,
  Brain,
  ClipboardList,
  Users,
  BarChart,
  BookOpen,
  Shield,
  Headphones,
  ArrowRight,
  CheckCircle2,
  Monitor,
  Star,
  Compass,
  Sparkles,
  Calculator,
  Cog,
  GraduationCap,
  MessageCircle,
  Clock,
  Layers,
  Award,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'All Tutoring Services & Proprietary Learning Suite | Edvoura Learning Hub',
  description:
    'Comprehensive K-12 education: 1-on-1 tutoring, WAEC/JAMB/IGCSE exam prep, Curriculum Matrix™, LexiCore™ Vocabulary, MathMotion Studio™, and STEM MechLab™.',
  openGraph: {
    title: 'Edvoura Learning Hub Services | The Complete Educational Ecosystem',
    description:
      'From 1-on-1 expert tutoring to proprietary visual math and mechanical physics engines. Designed for international learners across UK, US, and West African curricula.',
  },
};

export default function ServicesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-off-white selection:bg-yellow selection:text-navy font-body">
      <Navbar />

      {/* Hero Section */}
      <CrystalMirrorHero />

      {/* THE 4 PROPRIETARY EDVOURA LEARNING ENGINES */}
      <section className="bg-white py-20 sm:py-28 border-b-8 border-navy">
        <div className="marketing-container max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 rounded-xl border-2 border-navy bg-yellow px-4 py-1.5 text-xs font-black uppercase tracking-wider text-navy shadow-[3px_3px_0px_#0A1628] mb-4">
              <Sparkles className="w-4 h-4 text-navy" /> PROPRIETARY TECHNOLOGY SUITE
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-navy tracking-tight">
              Four Engines No Other Tutoring Platform Has
            </h2>
            <p className="mt-4 text-base sm:text-lg font-bold text-navy/70 leading-relaxed">
              We don&apos;t just assign worksheets. Every Edvoura learner gains full access to our proprietary suite of visual learning, linguistic, and mechanical simulation engines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Engine 1 */}
            <div className="group rounded-3xl border-4 border-navy bg-yellow/15 p-6 shadow-[6px_6px_0px_#0A1628] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl border-2 border-navy bg-yellow flex items-center justify-center shadow-[2px_2px_0px_#0A1628]">
                    <Compass className="w-6 h-6 text-navy" />
                  </div>
                  <span className="rounded-md border border-navy/30 bg-white px-2 py-0.5 text-[10px] font-black uppercase text-navy">
                    Curriculum Graph
                  </span>
                </div>
                <h3 className="text-xl font-black text-navy mb-2">Curriculum Matrix™</h3>
                <p className="text-xs font-semibold text-navy/70 leading-relaxed">
                  1,860+ K-12 micro-topics mapped with 4,000+ prerequisite links. Pinpoints exact foundational learning gaps before exams.
                </p>
              </div>
              <Link
                href="/roadmap"
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-black uppercase text-navy group-hover:text-yellow-dim transition-colors pt-4 border-t border-navy/15"
              >
                <span>Explore Roadmap</span> <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Engine 2 */}
            <div className="group rounded-3xl border-4 border-navy bg-sky-50 p-6 shadow-[6px_6px_0px_#0A1628] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl border-2 border-navy bg-sky-200 flex items-center justify-center shadow-[2px_2px_0px_#0A1628]">
                    <BookOpen className="w-6 h-6 text-navy" />
                  </div>
                  <span className="rounded-md border border-navy/30 bg-white px-2 py-0.5 text-[10px] font-black uppercase text-navy">
                    Linguistics
                  </span>
                </div>
                <h3 className="text-xl font-black text-navy mb-2">LexiCore™ Word Atlas</h3>
                <p className="text-xs font-semibold text-navy/70 leading-relaxed">
                  7,298 illustrated vocabulary words with dual British &amp; American pronunciation audio, CEFR levels, and usage collocations.
                </p>
              </div>
              <Link
                href="/vocabulary"
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-black uppercase text-navy group-hover:text-info transition-colors pt-4 border-t border-navy/15"
              >
                <span>Browse LexiCore</span> <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Engine 3 */}
            <div className="group rounded-3xl border-4 border-navy bg-emerald-50 p-6 shadow-[6px_6px_0px_#0A1628] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl border-2 border-navy bg-emerald-300 flex items-center justify-center shadow-[2px_2px_0px_#0A1628]">
                    <Calculator className="w-6 h-6 text-navy" />
                  </div>
                  <span className="rounded-md border border-navy/30 bg-white px-2 py-0.5 text-[10px] font-black uppercase text-navy">
                    Visual Math
                  </span>
                </div>
                <h3 className="text-xl font-black text-navy mb-2">MathMotion Studio™</h3>
                <p className="text-xs font-semibold text-navy/70 leading-relaxed">
                  60 FPS interactive vector animations for geometry, trigonometry, calculus derivatives, and quadratic parabolas with live sliders.
                </p>
              </div>
              <Link
                href="/math-studio"
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-black uppercase text-navy group-hover:text-emerald-700 transition-colors pt-4 border-t border-navy/15"
              >
                <span>Launch Studio</span> <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Engine 4 */}
            <div className="group rounded-3xl border-4 border-navy bg-purple-50 p-6 shadow-[6px_6px_0px_#0A1628] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl border-2 border-navy bg-purple-200 flex items-center justify-center shadow-[2px_2px_0px_#0A1628]">
                    <Cog className="w-6 h-6 text-navy" />
                  </div>
                  <span className="rounded-md border border-navy/30 bg-white px-2 py-0.5 text-[10px] font-black uppercase text-navy">
                    STEM Physics
                  </span>
                </div>
                <h3 className="text-xl font-black text-navy mb-2">STEM MechLab™</h3>
                <p className="text-xs font-semibold text-navy/70 leading-relaxed">
                  Translates abstract computing and thermodynamics into physical isometric machines with moving valves, pistons, and levers.
                </p>
              </div>
              <Link
                href="/anatomy-lab"
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-black uppercase text-navy group-hover:text-purple-700 transition-colors pt-4 border-t border-navy/15"
              >
                <span>Operate MechLab</span> <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CORE TUTORING SERVICES & FORMATS */}
      <section className="bg-off-white py-20 sm:py-28 border-b-8 border-navy">
        <div className="marketing-container max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block rounded-xl border-2 border-navy bg-yellow px-4 py-1.5 text-xs font-black uppercase tracking-wider text-navy shadow-[3px_3px_0px_#0A1628] mb-4">
              PERSONALIZED INSTRUCTION
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-navy tracking-tight">
              How We Deliver World-Class Learning
            </h2>
            <p className="mt-4 text-base sm:text-lg font-bold text-navy/70 leading-relaxed">
              Every child is paired with an educator who specializes in their exact curriculum, learning pace, and academic goals.
            </p>
          </div>

          <div className="space-y-12">
            {[
              {
                icon: Video,
                title: 'Live 1-on-1 Personalized Tutoring',
                tag: 'Flagship Service',
                tagColor: 'bg-yellow',
                desc: 'Intimate, face-to-face video instruction tailored entirely to your child. Tutors work directly on difficult homework questions, introduce new syllabus topics, and break down complex concepts step-by-step.',
                features: [
                  'Dedicated certified tutor matched to your child',
                  'Interactive collaborative whiteboard & digital seat-work',
                  'Flexible scheduling across UK, US, and West African time zones',
                  'HD video session recordings available for revision anytime',
                ],
                color: 'bg-white',
              },
              {
                icon: GraduationCap,
                title: 'Comprehensive Exam Preparation & Masterclasses',
                tag: 'High Impact',
                tagColor: 'bg-emerald-300',
                desc: 'Rigorous preparation for major milestone examinations. We dissect past questions, train timing techniques, and master mark scheme expectations to turn nervous test-takers into confident top-scorers.',
                features: [
                  'WAEC & NECO Senior School Certificate Examination',
                  'JAMB UTME (CBT Practice & Speed Tactics)',
                  'Cambridge IGCSE & GCE O/A-Levels',
                  'US College Board SAT & Advanced Placement (AP)',
                  'UK 11+ Plus Grammar & Independent School Entrance',
                ],
                color: 'bg-white',
              },
              {
                icon: Shield,
                title: 'Weekly Parent Transparency & WhatsApp Digest',
                tag: 'Guardian Peace of Mind',
                tagColor: 'bg-blue-200',
                desc: 'You never have to guess what your child learned this week. Parents receive automated weekly academic summaries via WhatsApp and their dedicated dashboard, complete with attendance logs and quiz scores.',
                features: [
                  'Automated weekly WhatsApp academic report card',
                  'Direct messaging line with tutors for feedback',
                  'Transparent attendance records and lesson notes',
                  'Bi-weekly progress checks and curriculum milestone tracking',
                ],
                color: 'bg-white',
              },
            ].map((service, i) => (
              <div
                key={service.title}
                className="bg-white border-4 border-navy shadow-[10px_10px_0px_#0A1628] rounded-[2rem] p-8 md:p-12 flex flex-col lg:flex-row gap-8 items-start hover:-translate-y-1 transition-transform"
              >
                <div className="w-16 h-16 rounded-2xl border-4 border-navy bg-yellow flex items-center justify-center shrink-0 shadow-[4px_4px_0px_#0A1628]">
                  <service.icon className="w-8 h-8 text-navy" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h3 className="font-heading font-black text-navy text-2xl sm:text-3xl">
                      {service.title}
                    </h3>
                    <span className={`rounded-lg border-2 border-navy ${service.tagColor} px-3 py-0.5 text-[10px] font-black uppercase text-navy shadow-[2px_2px_0px_#0A1628]`}>
                      {service.tag}
                    </span>
                  </div>
                  <p className="text-navy font-bold text-sm sm:text-base leading-relaxed mb-6">
                    {service.desc}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t-2 border-navy/10">
                    {service.features.map((feat) => (
                      <div key={feat} className="flex items-start gap-2.5 text-xs sm:text-sm font-bold text-navy">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CURRICULA SUPPORTED */}
      <section className="bg-navy py-20 sm:py-24 text-white border-b-8 border-navy">
        <div className="marketing-container max-w-6xl mx-auto px-4 text-center">
          <span className="rounded-xl border-2 border-white bg-yellow px-4 py-1.5 text-xs font-black uppercase tracking-wider text-navy shadow-[3px_3px_0px_#FFFFFF] mb-4 inline-block">
            GLOBAL ACCREDITATION
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
            Curricula We Support Worldwide
          </h2>
          <p className="text-white/70 text-base max-w-2xl mx-auto font-medium mb-12">
            Whether your child attends a British international academy, a Nigerian secondary school, or an American charter school, our tutors teach to their official curriculum standards.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div className="rounded-2xl border-4 border-navy bg-off-white p-6 text-navy shadow-[6px_6px_0px_#F5C518]">
              <span className="text-2xl mb-3 block">🇬🇧</span>
              <h3 className="text-xl font-black mb-2">British Curriculum</h3>
              <p className="text-xs font-semibold text-navy/70 leading-relaxed">
                Key Stage 1–4, UK National Curriculum, GCSE, Cambridge IGCSE, and A-Level examinations across Edexcel, AQA, and OCR.
              </p>
            </div>
            <div className="rounded-2xl border-4 border-navy bg-off-white p-6 text-navy shadow-[6px_6px_0px_#F5C518]">
              <span className="text-2xl mb-3 block">🇳🇬</span>
              <h3 className="text-xl font-black mb-2">Nigerian &amp; West African</h3>
              <p className="text-xs font-semibold text-navy/70 leading-relaxed">
                WAEC SSCE, NECO, BECE Junior Secondary, and JAMB UTME with computer-based test strategies and 300,000+ past questions.
              </p>
            </div>
            <div className="rounded-2xl border-4 border-navy bg-off-white p-6 text-navy shadow-[6px_6px_0px_#F5C518]">
              <span className="text-2xl mb-3 block">🇺🇸</span>
              <h3 className="text-xl font-black mb-2">US &amp; International</h3>
              <p className="text-xs font-semibold text-navy/70 leading-relaxed">
                US Common Core State Standards (Grades 1–12), College Board SAT preparation, AP courses, and International Baccalaureate (IB).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="bg-yellow py-20 sm:py-24 border-b-8 border-navy text-navy text-center">
        <div className="marketing-container max-w-4xl mx-auto px-4">
          <h2 className="font-heading font-black text-3xl sm:text-5xl md:text-6xl tracking-tight mb-6">
            Ready to Unlock Your Child&apos;s Full Potential?
          </h2>
          <p className="text-base sm:text-xl font-bold max-w-2xl mx-auto mb-10 text-navy/80">
            Book a free trial session today. We will match your child with a certified expert tutor and provide a full curriculum diagnostic report.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-2xl border-4 border-navy bg-navy text-white px-8 py-4 font-heading text-base sm:text-lg font-black uppercase shadow-[6px_6px_0px_#060E1C] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              Start Free Trial Session <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-2xl border-4 border-navy bg-white text-navy px-8 py-4 font-heading text-base sm:text-lg font-black uppercase shadow-[6px_6px_0px_#060E1C] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              View Transparent Pricing ($20/session)
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
