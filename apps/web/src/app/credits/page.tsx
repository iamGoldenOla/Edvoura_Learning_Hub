import { Metadata } from 'next';
import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';
import { Heart, Code2, ShieldCheck, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Open Source Acknowledgments & Credits | Edvoura Learning Hub',
  description:
    'Edvoura proudly stands on the shoulders of global open-source developers. A complete list of open-source libraries, engines, and datasets powering our learning platform.',
};

const OPEN_SOURCE_PROJECTS = [
  {
    name: 'Marble Open Skill Taxonomy',
    license: 'MIT / Open Dataset',
    author: 'Marble App Foundation',
    usage: 'Curriculum micro-topics graph structure and K-12 prerequisite relationships.',
  },
  {
    name: 'Word Atlas Vocabulary Dataset',
    license: 'MIT License',
    author: 'Fuchen Design',
    usage: 'Illustrated linguistic vocabulary and British/American phonetic pronunciation data.',
  },
  {
    name: 'ManimGX Animation Engine',
    license: 'MIT License',
    author: 'Academa Labs (Abdullah Geduk & Sina Atalay)',
    usage: 'Mathematical vector animation principles and WebGPU geometric render loops.',
  },
  {
    name: 'Anatomy System Modeling',
    license: 'MIT License',
    author: 'Ryan Sharma',
    usage: 'Isometric mechanical metaphor architecture for computing and physics.',
  },
  {
    name: 'Next.js & React',
    license: 'MIT License',
    author: 'Vercel, Inc. & Meta Platforms',
    usage: 'Core web application framework, App Router, and server-side rendering.',
  },
  {
    name: 'Tailwind CSS',
    license: 'MIT License',
    author: 'Tailwind Labs, Inc.',
    usage: 'Utility-first CSS styling and responsive layout system.',
  },
  {
    name: 'Lucide Icons',
    license: 'ISC License',
    author: 'Lucide Project & Contributors',
    usage: 'Open-source SVG iconography across the marketing and dashboard interfaces.',
  },
  {
    name: 'Supabase',
    license: 'Apache 2.0',
    author: 'Supabase, Inc.',
    usage: 'PostgreSQL database, real-time data channels, and secure user authentication.',
  },
];

export default function CreditsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-off-white selection:bg-yellow selection:text-navy font-body">
      <Navbar />

      <main className="flex-1 py-16 sm:py-24">
        <div className="marketing-container max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-xl border-2 border-dark bg-yellow px-4 py-1.5 text-xs font-black uppercase tracking-wider text-dark shadow-[3px_3px_0px_#060E1C] mb-4">
              <Heart className="h-4 w-4 text-rose-600 fill-rose-600" /> Open Source Acknowledgments
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-dark tracking-tight">
              Built on the Shoulders of Giants
            </h1>
            <p className="mt-4 text-sm sm:text-base font-semibold text-dark/70 max-w-2xl mx-auto leading-relaxed">
              Edvoura believes in giving back to the global developer and research community. In compliance with open-source licensing, here are the foundational open-source libraries, datasets, and engines powering our platform.
            </p>
          </div>

          {/* Credits Grid */}
          <div className="space-y-4">
            {OPEN_SOURCE_PROJECTS.map((project) => (
              <div
                key={project.name}
                className="rounded-2xl border-[3px] border-dark bg-white p-5 shadow-[4px_4px_0px_#060E1C] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-base font-black text-dark">{project.name}</h2>
                    <span className="rounded-md border border-dark/30 bg-off-white px-2 py-0.5 text-[10px] font-mono font-bold text-dark/70">
                      {project.license}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-dark/60">
                    By <strong className="text-dark">{project.author}</strong> — {project.usage}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-300 shrink-0">
                  <ShieldCheck className="h-4 w-4" /> Compliant
                </div>
              </div>
            ))}
          </div>

          {/* Legal Note */}
          <div className="mt-12 rounded-2xl border-2 border-dark/20 bg-slate-100 p-6 text-center text-xs font-medium text-dark/60 leading-relaxed">
            All registered trademarks, company names, and logos are the property of their respective owners. Their inclusion here signifies gratitude and compliance under open-source licenses and does not imply endorsement.
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
