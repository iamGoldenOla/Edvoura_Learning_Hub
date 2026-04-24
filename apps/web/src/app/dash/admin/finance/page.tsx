import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ShieldCheck, TrendingUp, LayoutGrid, Clock } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';

export default async function FinancePage() {
  const supabase = await createClient();

  const [
    { count: subscriptionsCount },
    { count: invoicesCount },
  ] = await Promise.all([
    supabase.schema('billing').from('subscriptions').select('*', { count: 'exact', head: true }).in('status', ['active', 'trialing']),
    supabase.schema('billing').from('invoices').select('*', { count: 'exact', head: true }).eq('status', 'paid'),
  ]);

  const { data: recentInvoices = [] } = await supabase
    .schema('billing')
    .from('invoices')
    .select('id, status, amount_paid_minor, currency_code, due_at')
    .order('due_at', { ascending: false })
    .limit(10);

  const normalizedInvoices = recentInvoices ?? [];

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--';
    }
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto animate-in fade-in duration-500 space-y-8">
      
      {/* Action Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-edvoura-navy rounded-2xl p-8 text-white shadow-md">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <LayoutGrid className="text-edvoura-gold w-8 h-8" /> Finance Dashboard
          </h1>
          <p className="mt-2 text-slate-300 text-sm">Secure enterprise-grade overview for Finance records and actions.</p>
        </div>
        <div className="mt-6 md:mt-0 flex gap-3">
          <Link href="/dash/admin/finance?export=report" className="inline-flex items-center justify-center rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700">
            Export Report
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-2xl shadow-sm border-slate-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><TrendingUp className="w-6 h-6"/></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Active Subscriptions</p>
              <p className="text-2xl font-black text-slate-800">{subscriptionsCount ?? 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-sm border-slate-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center"><ShieldCheck className="w-6 h-6"/></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Paid Invoices</p>
              <p className="text-2xl font-black text-slate-800">{invoicesCount ?? 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-sm border-slate-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center"><Clock className="w-6 h-6"/></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Last Sync</p>
              <p className="text-xl font-bold text-slate-800">Just now</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card className="rounded-2xl shadow-sm border-slate-200 overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-100 p-6 flex flex-row justify-between items-center">
          <CardTitle className="text-lg text-slate-800">Recent Invoices</CardTitle>
          <Link href="/dash/admin/finance?view=all" className="inline-flex h-8 items-center justify-center rounded-md bg-transparent px-4 py-2 text-xs font-bold text-edvoura-navy transition-colors hover:bg-slate-100">
            View All
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left text-sm text-slate-600 border-collapse">
            <thead className="bg-white border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              <tr>
                <th className="px-6 py-4">Invoice ID</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {normalizedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">No invoices generated yet.</td>
                </tr>
              ) : (
                normalizedInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{inv.id.substring(0, 13)}...</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${inv.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">{(inv.amount_paid_minor / 100).toFixed(2)} {inv.currency_code}</td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(inv.due_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
