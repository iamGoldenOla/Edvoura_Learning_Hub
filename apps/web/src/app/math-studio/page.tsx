import { Metadata } from 'next';
import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';
import MathStudioExplorer from '@/components/curriculum/MathStudioExplorer';
import { Calculator, Sparkles, Cpu, Send, Layers, Compass, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Edvoura MathMotion Studio™ | Interactive Visual Mathematics',
  description:
    'Experience high-performance mathematical animations built on Edvoura MathMotion principles. Explore geometry proofs, unit circle trigonometry, calculus derivatives, and physics kinematics in real time.',
  openGraph: {
    title: 'Edvoura MathMotion Studio™ | Interactive Visual Proofs',
    description:
      'Turn abstract math formulas into crystal-clear geometric proofs and dynamic 60FPS animations. Powered by Edvoura MathMotion WebGPU principles.',
  },
};

export default function MathStudioPage() {
  return (
    <div className="flex flex-col min-h-screen bg-off-white selection:bg-yellow selection:text-navy font-body">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b-8 border-navy bg-navy pb-16 pt-[104px] sm:pb-20 sm:pt-[120px] md:pb-24 md:pt-[140px] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(#F5C518_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />

        <div className="marketing-container relative z-10 text-center max-w-5xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-yellow border-3 sm:border-4 border-white text-navy font-heading font-black px-4 sm:px-6 py-2 rounded-xl mb-6 shadow-[4px_4px_0px_#FFFFFF] rotate-[-1deg]">
            <Calculator className="w-5 h-5 text-navy" /> EDVOURA MATHMOTION STUDIO™
          </div>

          <h1
            className="font-heading font-black text-white leading-[1.08] mb-6 drop-shadow-[4px_4px_0px_#060E1C] break-words"
            style={{ fontSize: 'clamp(2.2rem, 5.5vw, 4.5rem)' }}
          >
            Turn Abstract Mathematics Into{' '}
            <span className="text-yellow underline decoration-wavy decoration-3 underline-offset-8">
              Living Animations
            </span>
          </h1>

          <p className="text-white/80 text-base sm:text-xl max-w-3xl mx-auto font-medium leading-relaxed mb-8">
            Why memorize formulas when you can see how they work? Powered by the proprietary <strong className="text-yellow">Edvoura MathMotion Engine™</strong>, Edvoura brings 60 FPS interactive visual proofs and dynamic geometry directly into your live lessons.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#studio-explorer"
              className="inline-flex items-center gap-2 rounded-2xl border-4 border-navy bg-yellow px-8 py-4 font-heading text-base sm:text-lg font-black uppercase text-navy shadow-[6px_6px_0px_#FFFFFF] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
            >
              Launch Animation Studio <ArrowRight className="h-5 w-5" />
            </a>
            <Link
              href="/roadmap"
              className="inline-flex items-center gap-2 rounded-2xl border-4 border-white bg-white/10 backdrop-blur-md px-6 py-4 font-heading text-sm sm:text-base font-black uppercase text-white hover:bg-white hover:text-navy transition-all"
            >
              <Compass className="h-5 w-5" /> View Skill Roadmap
            </Link>
          </div>
        </div>
      </section>

      {/* Main Studio Interactive Section */}
      <section id="studio-explorer" className="py-12 sm:py-16 bg-off-white">
        <MathStudioExplorer />
      </section>

      {/* Why Visual Mathematics Works */}
      <section className="border-t-8 border-navy bg-white py-16 sm:py-24">
        <div className="marketing-container max-w-6xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="rounded-xl border-[2px] border-dark bg-yellow px-4 py-1.5 text-xs font-black uppercase tracking-wider text-dark shadow-[3px_3px_0px_#060E1C]">
              Pedagogical Innovation
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-black text-dark tracking-tight">
              Why Animated Proofs Stick Faster
            </h2>
            <p className="mt-2 text-base text-dark/70 font-semibold">
              Research in cognitive load theory shows that learners retain mathematical relationships 3.2× longer when spatial movement reveals the underlying logic.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-3xl border-[3.5px] border-dark bg-off-white p-7 shadow-[6px_6px_0px_#060E1C]">
              <div className="w-12 h-12 rounded-2xl border-2 border-dark bg-yellow flex items-center justify-center mb-5 shadow-[3px_3px_0px_#060E1C]">
                <Cpu className="h-6 w-6 text-dark" />
              </div>
              <h3 className="text-xl font-black text-dark">Instant Parameter Feedback</h3>
              <p className="mt-2 text-sm font-semibold text-dark/70 leading-relaxed">
                Dragging sliders lets students test hypotheses instantly: what happens when amplitude doubles or the discriminant drops below zero?
              </p>
            </div>

            <div className="rounded-3xl border-[3.5px] border-dark bg-off-white p-7 shadow-[6px_6px_0px_#060E1C]">
              <div className="w-12 h-12 rounded-2xl border-2 border-dark bg-emerald-300 flex items-center justify-center mb-5 shadow-[3px_3px_0px_#060E1C]">
                <Send className="h-6 w-6 text-dark" />
              </div>
              <h3 className="text-xl font-black text-dark">One-Click Whiteboard Sync</h3>
              <p className="mt-2 text-sm font-semibold text-dark/70 leading-relaxed">
                Tutors can project any dynamic scene directly onto the live Edvoura whiteboard to illustrate difficult exam problems in real time.
              </p>
            </div>

            <div className="rounded-3xl border-[3.5px] border-dark bg-off-white p-7 shadow-[6px_6px_0px_#060E1C]">
              <div className="w-12 h-12 rounded-2xl border-2 border-dark bg-blue-300 flex items-center justify-center mb-5 shadow-[3px_3px_0px_#060E1C]">
                <Layers className="h-6 w-6 text-dark" />
              </div>
              <h3 className="text-xl font-black text-dark">Python Animation Code Export</h3>
              <p className="mt-2 text-sm font-semibold text-dark/70 leading-relaxed">
                Inspect and copy clean Python 3.13 code ready for execution. Run animations locally or embed them in Jupyter and school projects.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
