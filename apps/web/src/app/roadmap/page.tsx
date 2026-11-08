import { Metadata } from 'next';
import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';
import { SkillRoadmapExplorer } from '@/components/curriculum/SkillRoadmapExplorer';
import {
  getAllSubjects,
  getDomainsForSubject,
  getTopics,
} from '@/lib/curriculum/taxonomy/skillGraph';
import { Network, Sparkles, BookOpen, Compass, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Interactive Learning Roadmap & Skill Tree | Edvoura Learning Hub',
  description:
    'Explore 1,860+ micro-topics and 4,000+ prerequisite connections across Mathematics, Science, English, Computing, and History. Built for UK National Curriculum and US Common Core K-12 learners.',
  openGraph: {
    title: 'Edvoura Skill Tree & Knowledge Roadmap',
    description:
      'Understand what concepts your child needs to master first, with interactive prerequisite graphs and diagnostic evaluation prompts.',
  },
};

export default function RoadmapPage() {
  // Pre-load top topics for fast static/server hydration
  const initialTopics = getTopics({ limit: 400 });
  const subjectNames = getAllSubjects();
  const subjects = subjectNames.map((s) => ({
    subject: s,
    domains: getDomainsForSubject(s),
  }));

  return (
    <div className="flex flex-col min-h-screen bg-off-white selection:bg-yellow selection:text-navy font-body">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b-8 border-navy bg-navy pb-16 pt-[104px] sm:pb-20 sm:pt-[120px] md:pb-24 md:pt-[140px] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(#F5C518_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />

        <div className="marketing-container relative z-10 text-center max-w-5xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-yellow border-3 sm:border-4 border-white text-navy font-heading font-black px-4 sm:px-6 py-2 rounded-xl mb-6 shadow-[4px_4px_0px_#FFFFFF] rotate-[-1deg]">
            <Network className="w-5 h-5 text-navy" /> K-12 KNOWLEDGE GRAPH &amp; SKILL TREE
          </div>

          <h1
            className="font-heading font-black text-white leading-[1.1] mb-6 drop-shadow-[4px_4px_0px_#060E1C] break-words"
            style={{ fontSize: 'clamp(2.2rem, 5.5vw, 4.5rem)' }}
          >
            What Should Your Child Learn Next?
          </h1>

          <p className="text-white/80 text-base sm:text-xl max-w-3xl mx-auto font-bold mb-10 leading-relaxed">
            Education isn&apos;t just a list of topics — it&apos;s a connected web. Explore{' '}
            <strong className="text-yellow">1,860+ micro-topics</strong> and{' '}
            <strong className="text-yellow">4,000+ prerequisite links</strong> mapped directly to the UK National Curriculum and US Common Core.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="p-4 bg-white/10 rounded-2xl border-2 border-white/20 backdrop-blur-sm">
              <span className="block text-2xl sm:text-3xl font-black text-yellow font-heading">1,860+</span>
              <span className="text-xs font-bold text-white/70 uppercase tracking-wider">Micro-Topics</span>
            </div>
            <div className="p-4 bg-white/10 rounded-2xl border-2 border-white/20 backdrop-blur-sm">
              <span className="block text-2xl sm:text-3xl font-black text-emerald-400 font-heading">4,000+</span>
              <span className="text-xs font-bold text-white/70 uppercase tracking-wider">Prerequisite Links</span>
            </div>
            <div className="p-4 bg-white/10 rounded-2xl border-2 border-white/20 backdrop-blur-sm">
              <span className="block text-2xl sm:text-3xl font-black text-sky-400 font-heading">8</span>
              <span className="text-xs font-bold text-white/70 uppercase tracking-wider">Core Subjects</span>
            </div>
            <div className="p-4 bg-white/10 rounded-2xl border-2 border-white/20 backdrop-blur-sm">
              <span className="block text-2xl sm:text-3xl font-black text-pink-400 font-heading">Ages 4–15</span>
              <span className="text-xs font-bold text-white/70 uppercase tracking-wider">EYFS to Year 10</span>
            </div>
          </div>
        </div>
      </section>

      {/* Explorer Section */}
      <section className="py-12 sm:py-16 md:py-20 border-b-8 border-navy flex-1">
        <div className="marketing-container max-w-7xl mx-auto px-4 sm:px-6">
          <SkillRoadmapExplorer initialTopics={initialTopics} subjects={subjects} />
        </div>
      </section>

      {/* Tutor & Practice CTA */}
      <section className="bg-yellow py-16 md:py-20 border-b-8 border-navy">
        <div className="marketing-container max-w-4xl mx-auto text-center px-4">
          <h2 className="font-heading font-black text-navy text-3xl sm:text-5xl mb-6">
            Need an Expert Tutor to Guide This Roadmap?
          </h2>
          <p className="text-navy/80 text-base sm:text-lg font-bold mb-8 max-w-2xl mx-auto">
            Our certified educators use this adaptive knowledge graph to diagnose foundational gaps and accelerate your child&apos;s grades.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-navy text-white font-heading font-black px-8 py-4 rounded-xl border-3 border-navy shadow-[4px_4px_0px_#FFFFFF] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-lg"
            >
              Book a Free Trial Session
            </Link>
            <Link
              href="/pricing"
              className="bg-white text-navy font-heading font-black px-8 py-4 rounded-xl border-3 border-navy shadow-[4px_4px_0px_#060E1C] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-lg"
            >
              Explore Plans ($20/session)
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
