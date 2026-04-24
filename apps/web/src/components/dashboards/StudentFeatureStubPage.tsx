import Link from 'next/link';
import { LayoutGrid, ArrowRight, Inbox } from 'lucide-react';

import DashboardActionButton from '@/components/dashboards/DashboardActionButton';

export default function StudentFeatureStubPage({
  title,
  scope,
  targetPath,
}: {
  title: string;
  scope: string;
  targetPath: string;
}) {
  return (
    <div className="p-6 sm:p-8 max-w-[1400px] mx-auto animate-in fade-in duration-500 space-y-8 pb-20">
      <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
        <div className="p-8 border-b-[4px] border-dark bg-dark flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <LayoutGrid className="text-yellow w-8 h-8" /> {title}
            </h1>
            <p className="mt-3 text-white/60 text-sm font-bold">Focused tools and activities for this learning area.</p>
          </div>
          <div className="flex gap-3">
            <DashboardActionButton
              label="Open Workspace"
              actionKey={`student.${scope}.open`}
              scope="student"
              nextPath={targetPath}
              variant="primary"
              className="!bg-yellow !text-dark !font-black !border-[3px] !border-dark !rounded-xl !shadow-[4px_4px_0px_#ffffff] hover:!translate-x-[2px] hover:!translate-y-[2px] hover:!shadow-none !px-5 !py-3"
            />
          </div>
        </div>
      </div>

      <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
        <div className="p-6 border-b-[4px] border-dark bg-amber-100 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-dark tracking-tight">Recent {title} Activity</h2>
          <Link href={targetPath} className="inline-flex items-center gap-2 rounded-xl border-[3px] border-dark bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-dark shadow-[2px_2px_0px_#060E1C] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="p-8 sm:p-12">
          <div className="rounded-2xl border-[3px] border-dashed border-dark/20 bg-slate-50 p-12 text-center flex flex-col items-center">
            <Inbox className="h-12 w-12 text-dark/20 mb-6" />
            <p className="text-xl font-black text-dark/40">No activity yet</p>
            <p className="mt-3 text-sm font-bold text-dark/40 max-w-md">
              Activity for {title.toLowerCase()} will appear here automatically as your tutors assign work, create quizzes, and upload resources.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
