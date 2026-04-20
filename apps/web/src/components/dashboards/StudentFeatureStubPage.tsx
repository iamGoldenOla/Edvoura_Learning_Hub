import Link from 'next/link';
import { Clock, LayoutGrid, ShieldCheck, TrendingUp } from 'lucide-react';

import DashboardActionButton from '@/components/dashboards/DashboardActionButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <div className="p-8 max-w-[1400px] mx-auto animate-in fade-in duration-500 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-edvoura-navy rounded-2xl p-8 text-white shadow-md">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <LayoutGrid className="text-edvoura-gold w-8 h-8" /> {title} Dashboard
          </h1>
          <p className="mt-2 text-slate-300 text-sm">Focused tools and activities for this learning area.</p>
        </div>
        <div className="mt-6 md:mt-0 flex gap-3">
          <DashboardActionButton
            label="Export Report"
            actionKey={`student.${scope}.export`}
            scope="student"
            nextPath={targetPath}
            variant="outline"
            className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
          />
          <DashboardActionButton
            label="Open Workspace"
            actionKey={`student.${scope}.open`}
            scope="student"
            nextPath={targetPath}
            variant="primary"
            className="bg-edvoura-gold text-edvoura-navy-dark hover:bg-yellow-400 font-bold"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-2xl shadow-sm border-slate-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><TrendingUp className="w-6 h-6" /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Volume</p>
              <p className="text-2xl font-black text-slate-800">1,204</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-sm border-slate-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center"><ShieldCheck className="w-6 h-6" /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Security Status</p>
              <p className="text-2xl font-black text-slate-800">Nominal</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-sm border-slate-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center"><Clock className="w-6 h-6" /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Last Sync</p>
              <p className="text-xl font-bold text-slate-800">2 mins ago</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl shadow-sm border-slate-200 overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-100 p-6 flex flex-row justify-between items-center">
          <CardTitle className="text-lg text-slate-800">Recent {title} Activity</CardTitle>
          <Link href={targetPath} className="inline-flex h-8 items-center justify-center rounded-md px-3 text-xs font-bold text-edvoura-navy hover:bg-slate-100">
            View All
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left text-sm text-slate-600 border-collapse">
            <thead className="bg-white border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              <tr>
                <th className="px-6 py-4">ID Reference</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Updated</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{row.id}</td>
                  <td className="px-6 py-4">
                    <span className="bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded">Active</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{row.updatedLabel}</td>
                  <td className="px-6 py-4 text-right">
                    <DashboardActionButton
                      label="Review"
                      actionKey={`student.${scope}.review`}
                      scope="student"
                      nextPath={targetPath}
                      variant="outline"
                      className="h-7 text-[10px] text-slate-600"
                      metadata={{ referenceId: row.id }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

