import Link from 'next/link';
import {
  CreditCard,
  DollarSign,
  Wallet,
  ArrowRight,
  Download,
  CreditCard as PaymentIcon,
  Landmark,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { requireAppViewer } from '@/lib/app-context';
import { createClient } from '@/utils/supabase/server';

type PayoutRow = {
  id: string;
  period_start: string;
  period_end: string;
  amount_minor: number;
  currency_code: string;
  status: string;
  created_at: string;
};

const formatMoney = (amountMinor: number, currencyCode: string) =>
  `${currencyCode} ${Math.round(amountMinor / 100).toLocaleString()}`;

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

export default async function TutorEarningsPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAppViewer();
  const searchParams = (await props.searchParams) ?? {};
  const action = typeof searchParams.action === 'string' ? searchParams.action : null;

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const userId = session?.user?.id;

  const [{ data: payoutAccount }, { data: payoutsData = [] }] = userId
    ? await Promise.all([
        supabase
          .schema('billing')
          .from('tutor_payout_accounts')
          .select('id, onboarding_status, paystack_subaccount_code, updated_at')
          .eq('tutor_user_id', userId)
          .maybeSingle(),
        supabase
          .schema('billing')
          .from('tutor_payouts')
          .select('id, period_start, period_end, amount_minor, currency_code, status, created_at')
          .eq('tutor_user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10),
      ])
    : [{ data: null }, { data: [] as PayoutRow[] }];

  const payouts = (payoutsData ?? []) as PayoutRow[];
  const totalPaidMinor = payouts
    .filter((item) => item.status === 'paid')
    .reduce((sum, item) => sum + item.amount_minor, 0);
  const pendingPayouts = payouts.filter((item) => item.status === 'pending' || item.status === 'processing');
  const latestCurrencyCode = payouts[0]?.currency_code ?? 'NGN';
  const payoutMethod = payoutAccount?.paystack_subaccount_code ? 'Bank Transfer' : 'Not configured';

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 p-6 sm:p-8 pb-20">
      <section className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
        <div className="p-8 md:p-12 border-b-[4px] border-dark bg-yellow/20">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="space-y-3 min-w-0">
              <span className="inline-flex items-center gap-2 px-4 py-2 border-[3px] border-dark bg-white text-[10px] tracking-[0.2em] font-black shadow-[4px_4px_0px_#060E1C]">
                FINANCE PORTAL
              </span>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[0.92] text-dark flex items-center gap-4">
                Payouts & Bank Details
                <div className="hidden md:flex h-12 w-12 rounded-2xl border-[3px] border-dark bg-white items-center justify-center shadow-[4px_4px_0px_#060E1C] -rotate-6">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
              </h1>
              <p className="text-sm md:text-base font-semibold normal-case text-dark/70 max-w-xl">
                Track verified payout records, current payout status, and your Paystack transfer setup.
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
            <Stat
              title="Total Paid"
              value={formatMoney(totalPaidMinor, latestCurrencyCode)}
              icon={DollarSign}
              bgColor="bg-emerald-200"
            />
            <Stat title="Paid Payouts" value={String(payouts.filter((item) => item.status === 'paid').length)} icon={CreditCard} bgColor="bg-blue-200" />
            <Stat title="Pending Payouts" value={String(pendingPayouts.length)} icon={Wallet} bgColor="bg-amber-200" />
            <Stat title="Default Method" value={payoutMethod} icon={Landmark} bgColor="bg-white" />
          </section>

          <section className="grid grid-cols-1 gap-8 xl:grid-cols-12">
            <div className="space-y-6 xl:col-span-7">
              <div className="border-[3px] border-dark rounded-3xl bg-white shadow-[8px_8px_0px_#060E1C] overflow-hidden">
                <div className="p-6 border-b-[3px] border-dark bg-off-white">
                  <h2 className="text-2xl font-black text-dark tracking-tight">Recent Payouts</h2>
                </div>
                <div className="p-6 space-y-4">
                  {payouts.length > 0 ? (
                    payouts.map((payout) => (
                      <div key={payout.id} className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C] transition-all hover:shadow-[6px_6px_0px_#060E1C]">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:items-center">
                          <p className="text-lg font-black text-dark tracking-tight">{payout.id.slice(0, 8)}</p>
                          <p className="text-xs font-bold text-dark/70">
                            {formatDate(payout.period_start)} - {formatDate(payout.period_end)}
                          </p>
                          <p className="text-lg font-black text-dark tracking-tight">
                            {formatMoney(payout.amount_minor, payout.currency_code)}
                          </p>
                          <span
                            className={`rounded-xl border-[2px] border-dark px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] w-fit shadow-[2px_2px_0px_#060E1C] ${
                              payout.status === 'paid'
                                ? 'bg-emerald-300 text-dark'
                                : payout.status === 'failed'
                                  ? 'bg-rose-200 text-dark'
                                  : 'bg-amber-300 text-dark'
                            }`}
                          >
                            {payout.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border-[3px] border-dashed border-dark/20 bg-slate-50 p-8 text-center text-sm font-semibold text-dark/60">
                      No payout records have been created yet.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-8 xl:col-span-5">
              <div className="border-[3px] border-dark rounded-3xl bg-white shadow-[5px_5px_0px_#060E1C] overflow-hidden">
                <div className="p-6 border-b-[3px] border-dark bg-off-white">
                  <h2 className="text-2xl font-black text-dark tracking-tight">Payout Account</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="rounded-xl border-[3px] border-dark bg-white p-4 shadow-[3px_3px_0px_#060E1C]">
                    <p className="text-[10px] font-black text-dark/60 uppercase tracking-widest">Onboarding Status</p>
                    <p className="mt-2 text-base font-black text-dark">{payoutAccount?.onboarding_status ?? 'not_started'}</p>
                  </div>
                  <div className="rounded-xl border-[3px] border-dark bg-white p-4 shadow-[3px_3px_0px_#060E1C]">
                    <p className="text-[10px] font-black text-dark/60 uppercase tracking-widest">Paystack Subaccount</p>
                    <p className="mt-2 text-sm font-black text-dark break-all">
                      {payoutAccount?.paystack_subaccount_code ?? 'No payout account has been connected yet.'}
                    </p>
                  </div>
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
                    <span className="flex items-center gap-2"><Download className="h-4 w-4" /> Export Payout History</span>
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
  bgColor = 'bg-white',
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
