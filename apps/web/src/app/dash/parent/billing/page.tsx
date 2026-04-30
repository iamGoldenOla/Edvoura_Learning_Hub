import Link from 'next/link';
import { CreditCard, FileText, Receipt, ShieldCheck, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { getBillingSummary, requireAppViewer } from '@/lib/app-context';

export default async function ParentBillingPage() {
  const viewer = await requireAppViewer();
  const billing = await getBillingSummary(viewer.accessToken).catch(() => null);

  const subscription = billing?.subscription ?? null;
  const invoices = billing?.invoices ?? [];

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1680px] space-y-8 sm:space-y-10 p-4 sm:p-8 pb-24">
      <div className="border-[3px] sm:border-[4px] border-dark rounded-[20px] sm:rounded-[28px] bg-white shadow-[4px_4px_0px_#060E1C] sm:shadow-[10px_10px_0px_#060E1C] overflow-hidden min-w-0">
        <div className="p-5 sm:p-8 border-b-[4px] border-dark bg-emerald-100">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[0.92] text-dark break-words">
            Billing & Subscription
          </h1>
          <p className="mt-3 sm:mt-4 text-sm md:text-base font-bold text-dark/70 max-w-xl break-words">
            Manage Paystack subscription status, payment history, and account billing records.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Current Plan */}
        <div className="lg:col-span-2 border-[3px] sm:border-[4px] border-dark rounded-[20px] sm:rounded-[28px] bg-white shadow-[4px_4px_0px_#060E1C] sm:shadow-[10px_10px_0px_#060E1C] overflow-hidden min-w-0 flex flex-col">
          <div className="p-6 border-b-[4px] border-dark bg-yellow/20 flex items-center gap-3">
            <CreditCard className="h-6 w-6 text-dark" />
            <h2 className="text-2xl font-black text-dark tracking-tight">Current Plan</h2>
          </div>
          <div className="p-6 sm:p-8 flex flex-col flex-1 gap-6">
            <div className="rounded-2xl border-[3px] border-dark bg-off-white p-6 shadow-[4px_4px_0px_#060E1C]">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/60">Plan Name</p>
              <p className="mt-2 text-3xl font-black text-dark">{subscription?.planName ?? 'No active plan'}</p>
              <div className="mt-4 flex flex-wrap gap-4">
                <span className={`inline-flex rounded-xl border-[2px] border-dark px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] shadow-[2px_2px_0px_#060E1C] ${subscription?.status === 'active' ? 'bg-emerald-300 text-dark' : 'bg-rose-100 text-rose-900'}`}>
                  Status: {subscription?.status ?? 'inactive'}
                </span>
                <span className="inline-flex rounded-xl border-[2px] border-dark bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] shadow-[2px_2px_0px_#060E1C] text-dark/80">
                  Next renewal: {subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : 'n/a'}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4 mt-auto">
              <Link href="/dash/parent/billing?action=checkout">
                <Button className="w-full sm:w-auto bg-emerald-400 border-[2px] sm:border-[3px] border-dark !text-dark font-black rounded-xl shadow-[3px_3px_0px_#060E1C] sm:shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-4 sm:px-6 py-3 sm:py-4 h-auto text-sm sm:text-base whitespace-normal break-words">
                  <CreditCard className="mr-2 h-5 w-5 shrink-0" />
                  Upgrade Plan (Paystack)
                </Button>
              </Link>
              <Link href="/dash/parent/billing?action=manage-subscription">
                <Button className="w-full sm:w-auto bg-white border-[2px] sm:border-[3px] border-dark !text-dark font-black rounded-xl shadow-[3px_3px_0px_#060E1C] sm:shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-4 sm:px-6 py-3 sm:py-4 h-auto text-sm sm:text-base whitespace-normal break-words">
                  <FileText className="mr-2 h-5 w-5 shrink-0" />
                  Manage Billing Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Billing Status */}
        <div className="border-[3px] sm:border-[4px] border-dark rounded-[20px] sm:rounded-[28px] bg-white shadow-[4px_4px_0px_#060E1C] sm:shadow-[10px_10px_0px_#060E1C] overflow-hidden min-w-0 flex flex-col">
          <div className="p-6 border-b-[4px] border-dark bg-blue-100 flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-dark" />
            <h2 className="text-2xl font-black text-dark tracking-tight">Access Status</h2>
          </div>
          <div className="p-6 sm:p-8 flex flex-col flex-1 gap-6">
            <div className={`rounded-2xl border-[3px] border-dark p-6 shadow-[4px_4px_0px_#060E1C] ${billing?.entitlement.hasAccess ? 'bg-emerald-100' : 'bg-rose-100'}`}>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/60">Entitlement</p>
              <p className="mt-2 text-2xl font-black text-dark">
                {billing?.entitlement.hasAccess ? 'Access Active' : 'Access Limited'}
              </p>
              <p className="mt-2 text-xs font-bold text-dark/70 leading-relaxed">{billing?.entitlement.reason ?? 'No record'}</p>
            </div>
            
            <Link href="/dash/profile" className="mt-auto">
              <Button className="w-full bg-dark border-[3px] border-dark !text-white font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-4 h-auto text-base flex justify-between items-center">
                <span>Account Settings</span>
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="border-[3px] sm:border-[4px] border-dark rounded-[20px] sm:rounded-[28px] bg-white shadow-[4px_4px_0px_#060E1C] sm:shadow-[10px_10px_0px_#060E1C] overflow-hidden min-w-0">
        <div className="p-6 border-b-[4px] border-dark bg-amber-100 flex items-center gap-3">
          <Receipt className="h-6 w-6 text-dark" />
          <h2 className="text-2xl font-black text-dark tracking-tight">Payment History</h2>
        </div>
        <div className="p-6 sm:p-8">
          {invoices.length > 0 ? (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex flex-col gap-4 rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C] sm:flex-row sm:items-center sm:justify-between transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#060E1C]"
                >
                  <div>
                    <p className="text-lg font-black text-dark">Invoice #{invoice.id.slice(0, 8)}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/60 mt-1">
                      Due: {invoice.dueAt ? new Date(invoice.dueAt).toLocaleDateString() : 'n/a'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`inline-flex rounded-xl border-[2px] border-dark px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] shadow-[2px_2px_0px_#060E1C] ${invoice.status === 'paid' ? 'bg-emerald-300 text-dark' : 'bg-slate-200 text-dark'}`}>
                      {invoice.status}
                    </span>
                    <div className="text-lg font-black text-dark flex items-center bg-white border-[2px] border-dark px-3 py-1.5 rounded-xl shadow-[2px_2px_0px_#060E1C]">
                      <Receipt className="mr-2 h-4 w-4 text-dark" />
                      {(invoice.amountDueMinor / 100).toLocaleString()} NGN
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-[3px] border-dashed border-dark/20 bg-slate-50 p-8 text-center text-sm font-bold text-dark/60">
              No invoices available yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
