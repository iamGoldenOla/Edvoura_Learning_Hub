import React from 'react';
import Link from 'next/link';
import { ShieldCheck, TrendingUp, LayoutGrid, Clock } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';

export default async function FinancePage() {
  const supabase = await createClient();

  const [
    { count: subscriptionsCount },
    { count: invoicesCount },
    { count: payoutsCount },
  ] = await Promise.all([
    supabase.schema('billing').from('subscriptions').select('*', { count: 'exact', head: true }).in('status', ['active', 'trialing']),
    supabase.schema('billing').from('invoices').select('*', { count: 'exact', head: true }).eq('status', 'paid'),
    supabase.schema('billing').from('tutor_payouts').select('*', { count: 'exact', head: true }).eq('status', 'paid'),
  ]);

  const { data: recentInvoices = [] } = await supabase
    .schema('billing')
    .from('invoices')
    .select('id, status, amount_paid_minor, currency_code, due_at, updated_at')
    .order('updated_at', { ascending: false })
    .limit(10);

  const normalizedInvoices = recentInvoices ?? [];
  const latestActivity = normalizedInvoices[0]?.updated_at ?? null;

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--';
    }
  };

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1680px] space-y-8 sm:space-y-10 p-4 sm:p-8 pb-24">
      
      {/* Action Header */}
      <div className="border-[3px] sm:border-[4px] border-dark rounded-[20px] sm:rounded-[28px] bg-white shadow-[4px_4px_0px_#060E1C] sm:shadow-[10px_10px_0px_#060E1C] overflow-hidden min-w-0">
        <div className="p-8 border-b-[4px] border-dark bg-yellow flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[0.92] text-dark flex items-center gap-3">
              <LayoutGrid className="w-10 h-10 text-dark" /> Finance & Billing
            </h1>
            <p className="mt-4 text-sm md:text-base font-bold text-dark/70 max-w-xl">
              Secure enterprise-grade overview for Paystack transactions, subscriptions, and payouts.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="https://dashboard.paystack.com" target="_blank" rel="noreferrer" className="bg-dark border-[3px] border-dark text-white font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-3 inline-flex items-center">
              Open Paystack Console
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-[20px] sm:rounded-[28px] border-[3px] sm:border-[4px] border-dark bg-blue-100 p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between min-w-0">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Active Subscriptions</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">{subscriptionsCount ?? 0}</p>
          </div>
        </div>

        <div className="rounded-[20px] sm:rounded-[28px] border-[3px] sm:border-[4px] border-dark bg-emerald-100 p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between min-w-0">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Paid Invoices</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">{invoicesCount ?? 0}</p>
          </div>
        </div>

        <div className="rounded-[20px] sm:rounded-[28px] border-[3px] sm:border-[4px] border-dark bg-purple-100 p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between min-w-0">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Paid Payouts</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">{payoutsCount ?? 0}</p>
            <p className="mt-2 text-[10px] font-black uppercase tracking-wider text-dark/50">
              {latestActivity ? `Latest activity ${formatDate(latestActivity)}` : 'No billing activity yet'}
            </p>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="border-[3px] sm:border-[4px] border-dark rounded-[20px] sm:rounded-[28px] bg-white shadow-[4px_4px_0px_#060E1C] sm:shadow-[10px_10px_0px_#060E1C] overflow-hidden min-w-0">
        <div className="p-6 border-b-[4px] border-dark bg-rose-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-dark tracking-tight">Recent Paystack Invoices</h2>
          <div className="flex gap-3">
            <Link href="/dash/admin/finance?action=sync-paystack" className="bg-white border-[3px] border-dark text-dark font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-4 py-2 inline-flex items-center text-sm">
              Sync Paystack
            </Link>
            <Link href="/dash/admin/finance?view=all" className="bg-dark border-[3px] border-dark text-white font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-4 py-2 inline-flex items-center text-sm">
              View All
            </Link>
          </div>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="bg-off-white border-b-[4px] border-dark text-[10px] uppercase tracking-widest text-dark font-black">
              <tr>
                <th className="px-6 py-4">Invoice ID</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y-[3px] divide-dark/10">
              {normalizedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-dark/40 font-bold">No invoices generated yet.</td>
                </tr>
              ) : (
                normalizedInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-5 font-black text-dark">{inv.id.substring(0, 13)}...</td>
                    <td className="px-6 py-5">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border-[2px] border-dark shadow-[2px_2px_0px_#060E1C] inline-block ${inv.status === 'paid' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 font-black text-dark text-lg">{(inv.amount_paid_minor / 100).toFixed(2)} {inv.currency_code}</td>
                    <td className="px-6 py-5 text-sm font-bold text-dark/70">{formatDate(inv.due_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
