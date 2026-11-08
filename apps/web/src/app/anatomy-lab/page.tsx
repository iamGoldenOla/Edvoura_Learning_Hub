import { Metadata } from 'next';
import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';
import AnatomyLabExplorer from '@/components/curriculum/AnatomyLabExplorer';
import { Cog, Wrench, Shield, Compass, ArrowRight, Cpu, Layers } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Edvoura STEM MechLab™ | Physical Mechanical Simulations',
  description:
    'Experience abstract computer science, networking, and thermodynamics as physical mechanical machines. Powered by Edvoura MechLab truth-first simulation modeling.',
  openGraph: {
    title: 'Edvoura STEM MechLab™ | Computing & Physics Machines',
    description:
      'Translating rate limiters, CPU cache hierarchies, binary search trees, and Carnot heat engines into interactive isometric machines.',
  },
};

export default function AnatomyLabPage() {
  return (
    <div className="flex flex-col min-h-screen bg-off-white selection:bg-yellow selection:text-navy font-body">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b-8 border-navy bg-navy pb-16 pt-[104px] sm:pb-20 sm:pt-[120px] md:pb-24 md:pt-[140px] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(#22C55E_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />

        <div className="marketing-container relative z-10 text-center max-w-5xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-yellow border-3 sm:border-4 border-white text-navy font-heading font-black px-4 sm:px-6 py-2 rounded-xl mb-6 shadow-[4px_4px_0px_#FFFFFF] rotate-[-1deg]">
            <Cog className="w-5 h-5 text-navy" /> EDVOURA STEM MECHLAB™
          </div>

          <h1
            className="font-heading font-black text-white leading-[1.08] mb-6 drop-shadow-[4px_4px_0px_#060E1C] break-words"
            style={{ fontSize: 'clamp(2.2rem, 5.5vw, 4.5rem)' }}
          >
            Abstract STEM Concepts as{' '}
            <span className="text-yellow underline decoration-wavy decoration-3 underline-offset-8">
              Physical Machines
            </span>
          </h1>

          <p className="text-white/80 text-base sm:text-xl max-w-3xl mx-auto font-medium leading-relaxed mb-8">
            Stop staring at dry code and abstract circuit diagrams. Powered by the proprietary <strong className="text-yellow">Edvoura MechLab Simulation Engine™</strong>, Edvoura transforms rate limiters, memory caches, binary trees, and Carnot cycles into interactive mechanical machines you can operate with your hands.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#anatomy-explorer"
              className="inline-flex items-center gap-2 rounded-2xl border-4 border-navy bg-yellow px-8 py-4 font-heading text-base sm:text-lg font-black uppercase text-navy shadow-[6px_6px_0px_#FFFFFF] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
            >
              Operate Machines <ArrowRight className="h-5 w-5" />
            </a>
            <Link
              href="/math-studio"
              className="inline-flex items-center gap-2 rounded-2xl border-4 border-white bg-white/10 backdrop-blur-md px-6 py-4 font-heading text-sm sm:text-base font-black uppercase text-white hover:bg-white hover:text-navy transition-all"
            >
              Math Animation Studio →
            </Link>
          </div>
        </div>
      </section>

      {/* Main Machine Lab */}
      <section id="anatomy-explorer" className="py-12 sm:py-16 bg-off-white">
        <AnatomyLabExplorer />
      </section>

      <Footer />
    </div>
  );
}
