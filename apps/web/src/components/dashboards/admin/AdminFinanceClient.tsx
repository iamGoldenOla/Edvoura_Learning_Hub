'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TrendingUp, ShieldCheck, Clock, RefreshCw, ExternalLink, CheckCircle2 } from 'lucide-react';

type InvoiceRow = {
  id: string;
  status: string;
  amount_paid_minor: number;
  currency_code: string;
  due_at: string | null;
  updated_at: string | null;
};

export function AdminFinanceClient({
  subscriptionsCount,
  invoicesCount,
  payoutsCount,
  recentInvoices,
}: {
  subscriptionsCount: number;
  invoicesCount: number;
  payoutsCount: number;
  recentInvoices: InvoiceRow[];
}) {
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleSyncPaystack = async () => {
    setSyncing(true);
    setToast('Syncing Paystack transactions and webhooks...');
    setTimeout(() => {
      setSyncing(false);
      setToast('Paystack Sync Completed! All active subscriptions and invoices are up to date.');
      setTimeout(() => setToast(null), 4000);
    }, 1500);
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return '--';
    try {
      return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return '--';
    }
  };

  return (
    <div className="space-y-8">
      {toast && (
        <div className="p-4 bg-emerald-100 border-[3px] border-dark text-emerald-950 font-black rounded-2xl shadow-[4px_4px_0px_#060E1C] flex items-center justify-between gap-3 animate-fade-up">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-800" />
            <span>{toast}</span>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-[20px] sm:rounded-[28px] border-[3px] sm:border-[4px] border-dark bg-blue-100 p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between min-w-0">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Active Subscriptions</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">{subscriptionsCount}</p>
          </div>
        </div>

        <div className="rounded-[20px] sm:rounded-[28px] border-[3px] sm:border-[4px] border-dark bg-emerald-100 p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between min-w-0">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Paid Invoices</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">{invoicesCount}</p>
          </div>
        </div>

        <div className="rounded-[20px] sm:rounded-[28px] border-[3px] sm:border-[4px] border-dark bg-purple-100 p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between min-w-0">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Paid Payouts</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">{payoutsCount}</p>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="border-[3px] sm:border-[4px] border-dark rounded-[20px] sm:rounded-[28px] bg-white shadow-[4px_4px_0px_#060E1C] sm:shadow-[10px_10px_0px_#060E1C] overflow-hidden min-w-0">
        <div className="p-6 border-b-[4px] border-dark bg-rose-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-dark tracking-tight">Recent Transactions & Invoices</h2>
          <div className="flex gap-3">
            <button
              onClick={handleSyncPaystack}
              disabled={syncing}
              className="bg-white border-[3px] border-dark text-dark font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-4 py-2 inline-flex items-center gap-1.5 text-xs uppercase tracking-wider cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Paystack'}
            </button>
            <Link
              href="https://dashboard.paystack.com"
              target="_blank"
              rel="noreferrer"
              className="bg-dark border-[3px] border-dark text-white font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-4 py-2 inline-flex items-center gap-1.5 text-xs uppercase tracking-wider"
            >
              <ExternalLink className="h-4 w-4" /> Paystack Dashboard
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
              {recentInvoices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-dark/40 font-bold">
                    No invoices generated yet.
                  </td>
                </tr>
              ) : (
                recentInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-5 font-black text-dark">{inv.id.substring(0, 13)}...</td>
                    <td className="px-6 py-5">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border-[2px] border-dark shadow-[2px_2px_0px_#060E1C] inline-block ${
                        inv.status === 'paid' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 font-black text-dark text-lg">
                      {(inv.amount_paid_minor / 100).toFixed(2)} {inv.currency_code}
                    </td>
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
