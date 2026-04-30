import React from 'react';
import Link from 'next/link';
import { ShieldCheck, TrendingUp, LayoutGrid, Clock } from 'lucide-react';
import { requireSuperAdminAccess } from '../_lib/role-guard';

export default async function SettingsPage() {
  await requireSuperAdminAccess();

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1680px] space-y-8 sm:space-y-10 p-4 sm:p-8 pb-24">
      
      {/* Action Header */}
      <div className="border-[3px] sm:border-[4px] border-dark rounded-[20px] sm:rounded-[28px] bg-white shadow-[4px_4px_0px_#060E1C] sm:shadow-[10px_10px_0px_#060E1C] overflow-hidden min-w-0">
        <div className="p-8 border-b-[4px] border-dark bg-yellow flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[0.92] text-dark flex items-center gap-3">
              <LayoutGrid className="w-10 h-10 text-dark" /> Platform Settings
            </h1>
            <p className="mt-4 text-sm md:text-base font-bold text-dark/70 max-w-xl">
              Secure enterprise-grade overview for global configuration and system controls.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/dash/admin/settings?export=report" className="bg-white border-[3px] border-dark text-dark font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-3 inline-flex items-center">
              Export Config
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-[20px] sm:rounded-[28px] border-[3px] sm:border-[4px] border-dark bg-blue-100 p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between min-w-0">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">API Requests</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">0</p>
          </div>
        </div>

        <div className="rounded-[20px] sm:rounded-[28px] border-[3px] sm:border-[4px] border-dark bg-emerald-100 p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between min-w-0">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Security Status</p>
          </div>
          <div className="mt-6">
            <p className="text-4xl font-black text-dark">Nominal</p>
          </div>
        </div>

        <div className="rounded-[20px] sm:rounded-[28px] border-[3px] sm:border-[4px] border-dark bg-purple-100 p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between min-w-0">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Last Sync</p>
          </div>
          <div className="mt-6">
            <p className="text-4xl font-black text-dark">Just now</p>
          </div>
        </div>
      </div>

      <div className="border-[3px] sm:border-[4px] border-dark rounded-[20px] sm:rounded-[28px] bg-white shadow-[4px_4px_0px_#060E1C] sm:shadow-[10px_10px_0px_#060E1C] overflow-hidden min-w-0">
        <div className="p-6 border-b-[4px] border-dark bg-rose-100 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-dark tracking-tight">Recent Settings Activity</h2>
        </div>
        <div className="p-6 sm:p-8 space-y-4">
           <p className="text-sm font-bold text-dark/50">No recent setting changes.</p>
        </div>
      </div>
    </div>
  );
}
