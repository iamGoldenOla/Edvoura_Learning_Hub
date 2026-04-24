import Link from 'next/link';
import { CreditCard, DollarSign, FileText, Wallet, ArrowRight, Download, CreditCard as PaymentIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

const invoices = [
  { id: 'INV-2301', period: 'Apr 01 - Apr 07', amount: 'NGN 48,000', status: 'Paid' },
  { id: 'INV-2302', period: 'Apr 08 - Apr 14', amount: 'NGN 77,000', status: 'Pending payout' },
];

const payouts = [
  { id: 'PO-101', method: 'Bank Transfer', date: 'Apr 08, 2026', amount: 'NGN 48,000' },
  { id: 'PO-099', method: 'Bank Transfer', date: 'Apr 01, 2026', amount: 'NGN 43,500' },
];

export default async function TutorEarningsPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = (await props.searchParams) ?? {};
  const action = typeof searchParams.action === 'string' ? searchParams.action : null;

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 p-6 sm:p-8 pb-20">
      <section className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
        
        {/* Header */}
        <div className="p-8 md:p-12 border-b-[4px] border-dark bg-yellow/20">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="space-y-3 min-w-0">
              <span className="inline-flex items-center gap-2 px-4 py-2 border-[3px] border-dark bg-white text-[10px] tracking-[0.2em] font-black shadow-[4px_4px_0px_#060E1C]">
                FINANCE PORTAL
              </span>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[0.92] text-dark flex items-center gap-4">
                Invoices & Payments
                <div className="hidden md:flex h-12 w-12 rounded-2xl border-[3px] border-dark bg-white items-center justify-center shadow-[4px_4px_0px_#060E1C] -rotate-6">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
              </h1>
              <p className="text-sm md:text-base font-semibold normal-case text-dark/70 max-w-xl">
                Track invoice totals, payout status, and Paystack transfer history.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/dash/tutor/earnings?action=export">
                <Button className="bg-emerald-400 border-[3px] border-dark text-dark font-black rounded-xl shadow-[3px_3px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-3 h-auto">
                  Export CSV
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12 space-y-8">
          {action ? (
            <section className="rounded-2xl border-[3px] border-dark bg-blue-100 p-5 text-sm font-black text-dark shadow-[4px_4px_0px_#060E1C]">
              Action Center: <strong>{action}</strong> flow opened.
            </section>
          ) : null}

          <section className="grid grid-cols-1 gap-5 md:grid-cols-4">
            <Stat title="Current Cycle" value="NGN 125,000" icon={DollarSign} bgColor="bg-emerald-200" />
            <Stat title="Paid Invoices" value="1" icon={FileText} bgColor="bg-blue-200" />
            <Stat title="Pending Payout" value="1" icon={Wallet} bgColor="bg-amber-200" />
            <Stat title="Default Method" value="Bank Transfer" icon={CreditCard} bgColor="bg-white" />
          </section>

          <section className="grid grid-cols-1 gap-8 xl:grid-cols-12">
            
            <div className="space-y-6 xl:col-span-7">
              <div className="border-[3px] border-dark rounded-3xl bg-white shadow-[8px_8px_0px_#060E1C] overflow-hidden">
                <div className="p-6 border-b-[3px] border-dark bg-off-white">
                  <h2 className="text-2xl font-black text-dark tracking-tight">Invoice Summary</h2>
                </div>
                <div className="p-6 space-y-4">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C] transition-all hover:shadow-[6px_6px_0px_#060E1C]">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:items-center">
                        <p className="text-lg font-black text-dark tracking-tight">{invoice.id}</p>
                        <p className="text-xs font-bold text-dark/70">{invoice.period}</p>
                        <p className="text-lg font-black text-dark tracking-tight">{invoice.amount}</p>
                        <span className={`rounded-xl border-[2px] border-dark px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] w-fit shadow-[2px_2px_0px_#060E1C] ${invoice.status === 'Paid' ? 'bg-emerald-300 text-dark' : 'bg-amber-300 text-dark'}`}>
                          {invoice.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-8 xl:col-span-5">
              <div className="border-[3px] border-dark rounded-3xl bg-white shadow-[5px_5px_0px_#060E1C] overflow-hidden">
                <div className="p-6 border-b-[3px] border-dark bg-off-white">
                  <h2 className="text-2xl font-black text-dark tracking-tight">Payout History</h2>
                </div>
                <div className="p-6 space-y-4">
                  {payouts.map((payout) => (
                    <div key={payout.id} className="rounded-xl border-[3px] border-dark bg-white p-4 shadow-[3px_3px_0px_#060E1C]">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-black text-dark">{payout.id}</p>
                          <p className="text-[10px] font-bold text-dark/60 uppercase tracking-widest mt-1">{payout.date} | {payout.method}</p>
                        </div>
                        <p className="text-base font-black text-emerald-600">{payout.amount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-[3px] border-dark rounded-3xl bg-blue-100 p-6 shadow-[5px_5px_0px_#060E1C]">
                <h3 className="text-xl font-black text-dark mb-4">Payment Actions</h3>
                <div className="space-y-3">
                  <Link href="/dash/tutor/earnings?action=update-bank-details" className="flex items-center justify-between rounded-xl border-[2px] border-dark bg-white px-4 py-3 text-sm font-black text-dark hover:bg-yellow hover:translate-x-[2px] hover:translate-y-[2px] shadow-[3px_3px_0px_#060E1C] hover:shadow-none transition-all">
                    <span className="flex items-center gap-2"><PaymentIcon className="h-4 w-4" /> Update Bank Details</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/dash/tutor/earnings?action=download-invoice" className="flex items-center justify-between rounded-xl border-[2px] border-dark bg-white px-4 py-3 text-sm font-black text-dark hover:bg-yellow hover:translate-x-[2px] hover:translate-y-[2px] shadow-[3px_3px_0px_#060E1C] hover:shadow-none transition-all">
                    <span className="flex items-center gap-2"><Download className="h-4 w-4" /> Download Invoice PDF</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/dash/tutor/earnings?action=report-issue" className="flex items-center justify-between rounded-xl border-[2px] border-dark bg-white px-4 py-3 text-sm font-black text-dark hover:bg-rose-200 hover:translate-x-[2px] hover:translate-y-[2px] shadow-[3px_3px_0px_#060E1C] hover:shadow-none transition-all">
                    <span className="flex items-center gap-2">Report Payment Issue</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

function Stat({
  title,
  value,
  icon: Icon,
  bgColor = "bg-white"
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  bgColor?: string;
}) {
  return (
    <div className={`border-[3px] border-dark rounded-2xl ${bgColor} p-6 shadow-[5px_5px_0px_#060E1C]`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-dark/70">{title}</p>
          <p className="mt-2 text-2xl font-black text-dark">{value}</p>
        </div>
        <div className="h-12 w-12 rounded-xl border-[3px] border-dark bg-white flex items-center justify-center shadow-[2px_2px_0px_#060E1C]">
          <Icon className="h-6 w-6 text-dark" />
        </div>
      </div>
    </div>
  );
}
