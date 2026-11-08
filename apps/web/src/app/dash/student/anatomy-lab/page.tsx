import { Metadata } from 'next';
import AnatomyLabExplorer from '@/components/curriculum/AnatomyLabExplorer';
import { Cog, ArrowLeft, Calculator, Compass } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'STEM Mechanical Anatomy Lab | Student Dashboard',
  description: 'Operate physical isometric machines modeling rate limiters, CPU cache, and Carnot cycles.',
};

export default function StudentAnatomyLabPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-navy border-4 border-dark rounded-[28px] p-6 sm:p-8 text-white shadow-[8px_8px_0px_#060E1C] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <Link
              href="/dash/student"
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-yellow hover:underline mb-3"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Student Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow rounded-xl border-2 border-dark flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#FFFFFF]">
                <Cog className="w-5 h-5 text-dark" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-heading font-black text-white">
                  STEM Mechanical Anatomy Lab
                </h1>
                <p className="text-xs sm:text-sm font-bold text-white/70">
                  Operate physical mechanical models to master abstract computing and thermodynamics concepts.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dash/student/math-studio"
              className="rounded-xl border-2 border-white bg-white/10 px-4 py-2 text-xs font-black uppercase text-white hover:bg-white hover:text-navy transition-all"
            >
              Math Studio
            </Link>
            <Link
              href="/dash/student/roadmap"
              className="rounded-xl border-2 border-yellow bg-yellow px-4 py-2 text-xs font-black uppercase text-navy hover:bg-yellow-light transition-all shadow-[2px_2px_0px_#000]"
            >
              Skill Roadmap
            </Link>
          </div>
        </div>
      </div>

      {/* Explorer Component */}
      <AnatomyLabExplorer />
    </div>
  );
}
