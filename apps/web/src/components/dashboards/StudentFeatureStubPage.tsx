import Link from 'next/link';
import { Clock, LayoutGrid, ShieldCheck, TrendingUp, ArrowRight } from 'lucide-react';

import DashboardActionButton from '@/components/dashboards/DashboardActionButton';

const rows = [1, 2, 3, 4].map((n) => ({
  id: `REF-${2000 + n}`,
  updatedLabel: `Today, 10:4${n} AM`,
}));

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
              <LayoutGrid className="text-yellow w-8 h-8" /> {title} Dashboard
            </h1>
            <p className="mt-3 text-white/60 text-sm font-bold">Focused tools and activities for this learning area.</p>
          </div>
          <div className="flex gap-3">
            <DashboardActionButton
              label="Export Report"
              actionKey={`student.${scope}.export`}
              scope="student"
              nextPath={targetPath}
              variant="outline"
              className="!border-[3px] !border-white/30 !bg-white/10 !text-white !font-black !rounded-xl !shadow-none hover:!bg-white/20 !px-5 !py-3"
            />
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-[28px] border-[4px] border-dark bg-blue-100 p-6 shadow-[6px_6px_0px_#060E1C]">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/70">Total Volume</p>
          </div>
          <p className="text-4xl font-black text-dark">1,204</p>
        </div>
        <div className="rounded-[28px] border-[4px] border-dark bg-emerald-100 p-6 shadow-[6px_6px_0px_#060E1C]">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="w-6 h-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/70">Security Status</p>
          </div>
          <p className="text-4xl font-black text-dark">Nominal</p>
        </div>
        <div className="rounded-[28px] border-[4px] border-dark bg-purple-100 p-6 shadow-[6px_6px_0px_#060E1C]">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/70">Last Sync</p>
          </div>
          <p className="text-4xl font-black text-dark">2m ago</p>
        </div>
      </div>

      <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
        <div className="p-6 border-b-[4px] border-dark bg-amber-100 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-dark tracking-tight">Recent {title} Activity</h2>
          <Link href={targetPath} className="inline-flex items-center gap-2 rounded-xl border-[3px] border-dark bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-dark shadow-[2px_2px_0px_#060E1C] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="divide-y-[3px] divide-dark/10">
          {rows.map((row) => (
            <div key={row.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 hover:bg-off-white transition-colors">
              <div className="flex items-center gap-4">
                <span className="text-lg font-black text-dark">{row.id}</span>
                <span className="inline-flex rounded-xl border-[2px] border-dark bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-900 shadow-[2px_2px_0px_#060E1C]">Active</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-dark/50">{row.updatedLabel}</span>
                <DashboardActionButton
                  label="Review"
                  actionKey={`student.${scope}.review`}
                  scope="student"
                  nextPath={targetPath}
                  variant="outline"
                  className="!border-[2px] !border-dark !bg-white !text-dark !font-black !rounded-xl !shadow-[2px_2px_0px_#060E1C] hover:!translate-x-[1px] hover:!translate-y-[1px] hover:!shadow-none !px-3 !py-1.5 !text-[10px]"
                  metadata={{ referenceId: row.id }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

