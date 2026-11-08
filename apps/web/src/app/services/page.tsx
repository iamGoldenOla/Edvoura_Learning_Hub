import { Metadata } from 'next';
import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';
import Link from 'next/link';
import Image from 'next/image';
import {
  Video,
  Brain,
  BookOpen,
  Shield,
  ArrowRight,
  CheckCircle2,
  Star,
  Compass,
  Sparkles,
  Calculator,
  Cog,
  GraduationCap,
  MessageCircle,
  Clock,
  Heart,
  Smile,
  ShieldCheck,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Primary & Elementary Online Tutoring (Grades 1–6) | Edvoura Learning Hub',
  description:
    'Dedicated 1-on-1 online tutoring for primary and elementary pupils (Grades 1 to 6, Ages 5–11). Primary mathematics, phonics, reading fluency, homework help, and Cambridge Checkpoint prep starting at $20/session.',
  openGraph: {
    title: 'Edvoura Primary Tutoring (Grades 1–6) | Where Young Learners Flourish',
    description:
      'Patient certified educators specializing in young minds (Ages 5–11). Primary math, reading, spelling, and homework confidence starting at $20/session.',
  },
};

export default function ServicesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-off-white selection:bg-yellow selection:text-navy font-body">
      <Navbar />

      {/* ===== HERO SECTION (SOLID NAVY BLUE BACKGROUND) ===== */}
      <section className="relative overflow-hidden border-b-8 border-navy bg-navy text-white pt-32 pb-20 sm:pt-40 sm:pb-28">
        {/* Subtle Specular Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#F5C518_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />

        <div className="marketing-container relative z-10 max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-xl border-3 border-navy bg-yellow px-5 py-2 text-xs sm:text-sm font-black uppercase tracking-wider text-navy shadow-[4px_4px_0px_#FFFFFF] rotate-[-1.5deg] mb-8">
            <Star className="w-4 h-4 fill-navy" /> PRIMARY &amp; ELEMENTARY SPECIALISTS (GRADES 1 TO 6)
          </div>

          <h1 className="font-heading font-black text-4xl sm:text-6xl md:text-7xl leading-[1.08] text-white tracking-tight mb-8 drop-shadow-[4px_4px_0px_#060E1C]">
            Empowering Young Minds (Grades 1–6) With Joyful, 1-on-1 Learning
          </h1>

          <p className="text-base sm:text-xl font-bold text-white/90 max-w-3xl mx-auto leading-relaxed bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-3xl border-3 border-white/20 shadow-[6px_6px_0px_#F5C518] mb-12">
            The elementary years build the foundation for your child&apos;s entire education. We turn early math anxiety, spelling struggles, and evening homework battles into cheerful confidence through patient certified primary educators and playful visual learning tools.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-2xl border-4 border-navy bg-yellow text-navy px-8 py-4 sm:py-5 font-heading text-base sm:text-xl font-black uppercase tracking-wider shadow-[6px_6px_0px_#FFFFFF] hover:translate-x-1 hover:translate-y-1 hover:shadow-none hover:bg-yellow-light transition-all"
            >
              Start Free Trial Session <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-2xl border-4 border-white bg-white text-navy px-8 py-4 sm:py-5 font-heading text-base sm:text-xl font-black uppercase tracking-wider shadow-[6px_6px_0px_#F5C518] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              View Transparent Pricing ($20/session)
            </Link>
          </div>

          {/* Quick Pillars */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="rounded-2xl border-2 border-white/20 bg-white/5 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow border-2 border-navy flex items-center justify-center text-navy shrink-0">
                <Heart className="w-5 h-5 fill-navy" />
              </div>
              <div>
                <p className="text-xs font-black uppercase text-yellow">Patient Mentors</p>
                <p className="text-[11px] text-white/70 font-semibold">Specialized in young pupils (Ages 5–11)</p>
              </div>
            </div>
            <div className="rounded-2xl border-2 border-white/20 bg-white/5 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow border-2 border-navy flex items-center justify-center text-navy shrink-0">
                <Smile className="w-5 h-5 text-navy" />
              </div>
              <div>
                <p className="text-xs font-black uppercase text-yellow">No More Homework Tears</p>
                <p className="text-[11px] text-white/70 font-semibold">Stress-free evening guidance</p>
              </div>
            </div>
            <div className="rounded-2xl border-2 border-white/20 bg-white/5 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow border-2 border-navy flex items-center justify-center text-navy shrink-0">
                <MessageCircle className="w-5 h-5 text-navy" />
              </div>
              <div>
                <p className="text-xs font-black uppercase text-yellow">WhatsApp Parent Digest</p>
                <p className="text-[11px] text-white/70 font-semibold">Weekly progress card to your phone</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CORE PRIMARY (GRADES 1 TO 6) SERVICES ===== */}
      <section className="bg-white py-20 sm:py-28 border-b-8 border-navy">
        <div className="marketing-container max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block rounded-xl border-2 border-navy bg-yellow px-4 py-1.5 text-xs font-black uppercase tracking-wider text-navy shadow-[3px_3px_0px_#0A1628] mb-4">
              TAILORED FOR AGES 5 TO 11
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-navy tracking-tight">
              What We Teach &amp; Master in Grades 1 to 6
            </h2>
            <p className="mt-4 text-base sm:text-lg font-bold text-navy/70 leading-relaxed">
              Every lesson is personalized 1-on-1 to match your child&apos;s attention span, school syllabus, and individual learning pace.
            </p>
          </div>

          <div className="space-y-8">
            {[
              {
                icon: Calculator,
                title: 'Primary Mathematics & Mental Math Mastery',
                grade: 'Grades 1 – 6',
                tagColor: 'bg-yellow',
                desc: 'We transform abstract numbers into visual, tactile games. From early counting and number bonds to times tables 1–12, visual fractions, place value, and word problems, we build unshakable math confidence.',
                features: [
                  'Overcoming early math anxiety with calm, patient coaching',
                  'Visual Fraction Pizzas & Times Table Arrays for deep conceptual understanding',
                  'Singapore-style bar modeling to easily solve tricky word problems',
                  'Mental math tricks that make addition and subtraction rapid and fun',
                ],
              },
              {
                icon: BookOpen,
                title: 'English Literacy, Phonics & Reading Fluency',
                grade: 'Grades 1 – 6',
                tagColor: 'bg-sky-200',
                desc: 'Reading is the master skill that unlocks every other subject. Our primary educators teach systematic phonics, spelling rules, vocabulary comprehension, and expressive reading aloud.',
                features: [
                  'Systematic phonics decoding for early and struggling readers',
                  'Illustrated storybook library for vocabulary & reading enjoyment',
                  'Gentle real-time pronunciation corrections (British & American English)',
                  'Creative sentence construction, grammar fundamentals & writing practice',
                ],
              },
              {
                icon: Clock,
                title: 'Daily Homework & School Seat-Work Booster',
                grade: 'Daily Evening Support',
                tagColor: 'bg-emerald-300',
                desc: 'End the evening homework struggle. A dedicated tutor sits 1-on-1 with your child to review what their school teacher taught that day, explain confusing concepts, and finish their homework calmly.',
                features: [
                  'Zero parent homework stress after long working days',
                  'Patient re-explanation of topics your child didn\'t understand at school',
                  'Cultivating tidy presentation, focus, and independent study habits',
                  'Aligned to your child\'s exact school curriculum textbooks',
                ],
              },
              {
                icon: GraduationCap,
                title: 'Primary Checkpoint & 11+ Common Entrance Preparation',
                grade: 'Grades 5 & 6',
                tagColor: 'bg-purple-200',
                desc: 'Targeted preparation for primary milestone examinations, including Cambridge Primary Checkpoint, UK 11+ Plus Grammar School Entrance, and National Common Entrance Examinations (NCEE).',
                features: [
                  'Gentle, encouraging past-question practice without creating exam panic',
                  'Time management tactics and multiple-choice reasoning confidence',
                  'Verbal & Non-Verbal reasoning coaching for top school admissions',
                  'Comprehensive mock evaluations with detailed examiner feedback',
                ],
              },
            ].map((service) => (
              <div
                key={service.title}
                className="bg-white border-4 border-navy shadow-[10px_10px_0px_#0A1628] rounded-[2rem] p-8 md:p-10 flex flex-col lg:flex-row gap-8 items-start hover:-translate-y-1 transition-transform"
              >
                <div className="w-16 h-16 rounded-2xl border-4 border-navy bg-yellow flex items-center justify-center shrink-0 shadow-[4px_4px_0px_#0A1628]">
                  <service.icon className="w-8 h-8 text-navy" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h3 className="font-heading font-black text-navy text-2xl sm:text-3xl">
                      {service.title}
                    </h3>
                    <span className={`rounded-lg border-2 border-navy ${service.tagColor} px-3 py-0.5 text-xs font-black uppercase text-navy shadow-[2px_2px_0px_#0A1628]`}>
                      {service.grade}
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

      {/* ===== THE 4 PROPRIETARY TOOLS (REFRAMED FOR ELEMENTARY) ===== */}
      <section className="bg-sand py-20 sm:py-28 border-b-8 border-navy">
        <div className="marketing-container max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 rounded-xl border-2 border-navy bg-yellow px-4 py-1.5 text-xs font-black uppercase tracking-wider text-navy shadow-[3px_3px_0px_#0A1628] mb-4">
              <Sparkles className="w-4 h-4 text-navy" /> PROPRIETARY TECHNOLOGY SUITE
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-navy tracking-tight">
              Interactive Tools That Make Primary Learning Fun
            </h2>
            <p className="mt-4 text-base sm:text-lg font-bold text-navy/70 leading-relaxed">
              We never subject elementary kids to boring PDF worksheets. Our tutors project interactive visual models directly onto the collaborative classroom whiteboard!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Tool 1 */}
            <div className="group rounded-3xl border-4 border-navy bg-white p-6 shadow-[6px_6px_0px_#0A1628] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl border-2 border-navy bg-yellow flex items-center justify-center shadow-[2px_2px_0px_#0A1628]">
                    <Calculator className="w-6 h-6 text-navy" />
                  </div>
                  <span className="rounded-md border border-navy/30 bg-yellow/20 px-2 py-0.5 text-[10px] font-black uppercase text-navy">
                    Visual Math
                  </span>
                </div>
                <h3 className="text-xl font-black text-navy mb-2">MathMotion Studio™</h3>
                <p className="text-xs font-semibold text-navy/70 leading-relaxed">
                  Interactive fraction pizzas, times table star arrays, and jumping frog number lines that make math visual and intuitive.
                </p>
              </div>
              <Link
                href="/math-studio"
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-black uppercase text-navy group-hover:text-emerald-700 transition-colors pt-4 border-t border-navy/15"
              >
                <span>Launch Math Studio</span> <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Tool 2 */}
            <div className="group rounded-3xl border-4 border-navy bg-white p-6 shadow-[6px_6px_0px_#0A1628] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl border-2 border-navy bg-sky-200 flex items-center justify-center shadow-[2px_2px_0px_#0A1628]">
                    <BookOpen className="w-6 h-6 text-navy" />
                  </div>
                  <span className="rounded-md border border-navy/30 bg-sky-100 px-2 py-0.5 text-[10px] font-black uppercase text-navy">
                    Vocabulary
                  </span>
                </div>
                <h3 className="text-xl font-black text-navy mb-2">LexiCore™ Word Atlas</h3>
                <p className="text-xs font-semibold text-navy/70 leading-relaxed">
                  7,298 illustrated vocabulary words with dual British &amp; American pronunciation audio, designed to accelerate reading confidence.
                </p>
              </div>
              <Link
                href="/vocabulary"
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-black uppercase text-navy group-hover:text-sky-700 transition-colors pt-4 border-t border-navy/15"
              >
                <span>Browse LexiCore</span> <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Tool 3 */}
            <div className="group rounded-3xl border-4 border-navy bg-white p-6 shadow-[6px_6px_0px_#0A1628] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl border-2 border-navy bg-emerald-300 flex items-center justify-center shadow-[2px_2px_0px_#0A1628]">
                    <Compass className="w-6 h-6 text-navy" />
                  </div>
                  <span className="rounded-md border border-navy/30 bg-emerald-100 px-2 py-0.5 text-[10px] font-black uppercase text-navy">
                    Milestones
                  </span>
                </div>
                <h3 className="text-xl font-black text-navy mb-2">Curriculum Matrix™</h3>
                <p className="text-xs font-semibold text-navy/70 leading-relaxed">
                  1,860+ step-by-step micro-skills showing parents the exact foundational milestones their child has mastered in Grades 1 to 6.
                </p>
              </div>
              <Link
                href="/roadmap"
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-black uppercase text-navy group-hover:text-emerald-700 transition-colors pt-4 border-t border-navy/15"
              >
                <span>Explore Roadmap</span> <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Tool 4 */}
            <div className="group rounded-3xl border-4 border-navy bg-white p-6 shadow-[6px_6px_0px_#0A1628] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl border-2 border-navy bg-purple-200 flex items-center justify-center shadow-[2px_2px_0px_#0A1628]">
                    <Cog className="w-6 h-6 text-navy" />
                  </div>
                  <span className="rounded-md border border-navy/30 bg-purple-100 px-2 py-0.5 text-[10px] font-black uppercase text-navy">
                    Science Fun
                  </span>
                </div>
                <h3 className="text-xl font-black text-navy mb-2">STEM MechLab™</h3>
                <p className="text-xs font-semibold text-navy/70 leading-relaxed">
                  Interactive isometric machines with moving levers, heat engines, and marble sorters that spark early love for science.
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

      {/* ===== SUPPORTED PRIMARY CURRICULA ===== */}
      <section className="bg-navy py-20 sm:py-24 text-white border-b-8 border-navy">
        <div className="marketing-container max-w-6xl mx-auto px-4 text-center">
          <span className="rounded-xl border-2 border-white bg-yellow px-4 py-1.5 text-xs font-black uppercase tracking-wider text-navy shadow-[3px_3px_0px_#FFFFFF] mb-4 inline-block">
            ACCREDITED CURRICULA
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
            Curricula We Support for Grades 1–6
          </h2>
          <p className="text-white/70 text-base max-w-2xl mx-auto font-medium mb-12">
            Whether your child attends a British international school, a Nigerian private academy, or follows the US curriculum, our tutors teach to their official school standards.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div className="rounded-2xl border-4 border-navy bg-off-white p-6 text-navy shadow-[6px_6px_0px_#F5C518]">
              <span className="text-2xl mb-3 block">🇬🇧</span>
              <h3 className="text-xl font-black mb-2">British &amp; Cambridge Primary</h3>
              <p className="text-xs font-semibold text-navy/70 leading-relaxed">
                Key Stage 1 &amp; Key Stage 2 (Years 1 to 6), Cambridge Primary Checkpoint, and 11+ Plus Grammar school entrance preparation.
              </p>
            </div>
            <div className="rounded-2xl border-4 border-navy bg-off-white p-6 text-navy shadow-[6px_6px_0px_#F5C518]">
              <span className="text-2xl mb-3 block">🇳🇬</span>
              <h3 className="text-xl font-black mb-2">Nigerian Primary School</h3>
              <p className="text-xs font-semibold text-navy/70 leading-relaxed">
                Basic 1 to Basic 6 curriculum, National Common Entrance Examination (NCEE), and state model secondary school entrance exams.
              </p>
            </div>
            <div className="rounded-2xl border-4 border-navy bg-off-white p-6 text-navy shadow-[6px_6px_0px_#F5C518]">
              <span className="text-2xl mb-3 block">🇺🇸</span>
              <h3 className="text-xl font-black mb-2">US Common Core Elementary</h3>
              <p className="text-xs font-semibold text-navy/70 leading-relaxed">
                Kindergarten to Grade 6 Common Core State Standards in Mathematics, English Language Arts (ELA), and inquiry-based STEM.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== GUARANTEE & CALL TO ACTION ===== */}
      <section className="bg-yellow py-20 sm:py-24 border-b-8 border-navy text-navy text-center">
        <div className="marketing-container max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 rounded-full border-3 border-navy bg-white px-4 py-1.5 text-xs font-black uppercase text-navy shadow-[3px_3px_0px_#060E1C] mb-6">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% SATISFACTION GUARANTEE
          </div>
          <h2 className="font-heading font-black text-3xl sm:text-5xl md:text-6xl tracking-tight mb-6">
            Give Your Child the Gift of Learning Confidence
          </h2>
          <p className="text-base sm:text-xl font-bold max-w-2xl mx-auto mb-10 text-navy/80">
            Book a free 1-on-1 trial session today. We will pair your child with an encouraging primary tutor and send you an initial learning profile.
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
