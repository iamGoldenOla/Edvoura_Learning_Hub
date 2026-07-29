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
import { EarningsExportClient } from './EarningsExportClient';

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
    <div className="mx-auto w-full min-w-0 max-w-[1400px] space-y-6 sm:space-y-8 pb-20">
      <section className="border-[3px] sm:border-[4px] border-dark rounded-[20px] sm:rounded-[28px] bg-white shadow-[4px_4px_0px_#060E1C] sm:shadow-[10px_10px_0px_#060E1C] overflow-hidden min-w-0">
        <div className="p-5 sm:p-8 md:p-12 border-b-[3px] sm:border-b-[4px] border-dark bg-yellow/20">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 sm:gap-8 min-w-0">
            <div className="space-y-3 min-w-0 w-full">
              <span className="inline-flex items-center justify-center text-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 border-[2px] sm:border-[3px] border-dark bg-white text-[9px] sm:text-[10px] tracking-[0.1em] sm:tracking-[0.2em] font-black shadow-[3px_3px_0px_#060E1C] sm:shadow-[4px_4px_0px_#060E1C] break-words max-w-full">
                FINANCE PORTAL
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[0.92] text-dark flex items-center gap-4 break-words">
                Payouts & Bank Details
                <div className="hidden md:flex h-12 w-12 rounded-2xl border-[3px] border-dark bg-white items-center justify-center shadow-[4px_4px_0px_#060E1C] -rotate-6 shrink-0">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
              </h1>
              <p className="text-sm md:text-base font-semibold normal-case text-dark/70 max-w-xl break-words">
                Track verified payout records, current payout status, and your Paystack transfer setup.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full sm:w-auto mt-4 sm:mt-0">
              <Link href="/dash/tutor/earnings?action=export" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-emerald-400 border-[3px] border-dark text-dark font-black rounded-xl shadow-[3px_3px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-4 sm:px-6 py-3 h-auto text-sm sm:text-base">
                  Export CSV
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-8 md:p-12 space-y-6 sm:space-y-8 min-w-0">
          {action === 'export' && payouts.length > 0 && (
            <EarningsExportClient payouts={payouts} />
          )}
          {action === 'export' && payouts.length === 0 && (
            <section className="rounded-[20px] sm:rounded-2xl border-[3px] border-dark bg-amber-100 p-4 sm:p-5 text-sm font-bold text-dark shadow-[4px_4px_0px_#060E1C] break-words">
              <p className="font-black mb-1">No Data to Export</p>
              <p>There are no payout records to export yet.</p>
            </section>
          )}
          {action === 'update-bank-details' && (
            <section className="rounded-[20px] sm:rounded-2xl border-[3px] border-dark bg-amber-100 p-4 sm:p-5 text-sm font-bold text-dark shadow-[4px_4px_0px_#060E1C] break-words">
              <p className="font-black mb-1">Update Bank Details</p>
              <p>Bank details are managed through your Paystack dashboard. Contact <strong>support@edvoura.com</strong> if you need assistance updating your payout account.</p>
            </section>
          )}
          {action === 'download-invoice' && (
            <section className="rounded-[20px] sm:rounded-2xl border-[3px] border-dark bg-blue-100 p-4 sm:p-5 text-sm font-bold text-dark shadow-[4px_4px_0px_#060E1C] break-words">
              <p className="font-black mb-1">Invoice Export</p>
              <p>Detailed payout invoices will be available in a future update. For now, use the CSV export to download your payout records.</p>
            </section>
          )}
          {action === 'report-issue' && (
            <section className="rounded-[20px] sm:rounded-2xl border-[3px] border-dark bg-rose-100 p-4 sm:p-5 text-sm font-bold text-dark shadow-[4px_4px_0px_#060E1C] break-words">
              <p className="font-black mb-1">Report Payment Issue</p>
              <p>To report a payment discrepancy, email <strong>finance@edvoura.com</strong> with your payout ID and a description of the issue. Our team responds within 24 hours.</p>
            </section>
          )}

          <section className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-4 min-w-0">
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

          <section className="grid grid-cols-1 gap-6 sm:gap-8 xl:grid-cols-12 min-w-0">
            <div className="space-y-6 sm:space-y-8 xl:col-span-7 min-w-0">
              <div className="border-[3px] border-dark rounded-[20px] sm:rounded-3xl bg-white shadow-[4px_4px_0px_#060E1C] sm:shadow-[8px_8px_0px_#060E1C] overflow-hidden min-w-0">
                <div className="p-5 sm:p-6 border-b-[3px] border-dark bg-off-white min-w-0">
                  <h2 className="text-xl sm:text-2xl font-black text-dark tracking-tight break-words">Recent Payouts</h2>
                </div>
                <div className="p-5 sm:p-6 space-y-4 min-w-0">
                  {payouts.length > 0 ? (
                    payouts.map((payout) => (
                      <div key={payout.id} className="rounded-[20px] sm:rounded-2xl border-[3px] border-dark bg-off-white p-4 sm:p-5 shadow-[4px_4px_0px_#060E1C] sm:shadow-[4px_4px_0px_#060E1C] transition-all hover:shadow-[5px_5px_0px_#060E1C] sm:hover:shadow-[6px_6px_0px_#060E1C] min-w-0">
                        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-4 md:items-center min-w-0">
                          <p className="text-base sm:text-lg font-black text-dark tracking-tight break-words">{payout.id.slice(0, 8)}</p>
                          <p className="text-[10px] sm:text-xs font-bold text-dark/70 break-words">
                            {formatDate(payout.period_start)} - {formatDate(payout.period_end)}
                          </p>
                          <p className="text-base sm:text-lg font-black text-dark tracking-tight break-words">
                            {formatMoney(payout.amount_minor, payout.currency_code)}
                          </p>
                          <span
                            className={`rounded-lg sm:rounded-xl border-[2px] border-dark px-2 sm:px-3 py-1 sm:py-1.5 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.15em] w-fit shadow-[2px_2px_0px_#060E1C] break-words ${
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
                    <div className="rounded-[20px] sm:rounded-2xl border-[3px] border-dashed border-dark/20 bg-slate-50 p-6 sm:p-8 text-center text-xs sm:text-sm font-semibold text-dark/60 min-w-0 break-words">
                      No payout records have been created yet.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6 sm:space-y-8 xl:col-span-5 min-w-0">
              <div className="border-[3px] border-dark rounded-[20px] sm:rounded-3xl bg-white shadow-[4px_4px_0px_#060E1C] sm:shadow-[5px_5px_0px_#060E1C] overflow-hidden min-w-0">
                <div className="p-5 sm:p-6 border-b-[3px] border-dark bg-off-white min-w-0">
                  <h2 className="text-xl sm:text-2xl font-black text-dark tracking-tight break-words">Payout Account</h2>
                </div>
                <div className="p-5 sm:p-6 space-y-4 min-w-0">
                  <div className="rounded-[20px] sm:rounded-xl border-[3px] border-dark bg-white p-4 shadow-[3px_3px_0px_#060E1C] min-w-0">
                    <p className="text-[9px] sm:text-[10px] font-black text-dark/60 uppercase tracking-[0.1em] sm:tracking-widest break-words">Onboarding Status</p>
                    <p className="mt-2 text-sm sm:text-base font-black text-dark break-words">{payoutAccount?.onboarding_status ?? 'not_started'}</p>
                  </div>
                  <div className="rounded-[20px] sm:rounded-xl border-[3px] border-dark bg-white p-4 shadow-[3px_3px_0px_#060E1C] min-w-0">
                    <p className="text-[9px] sm:text-[10px] font-black text-dark/60 uppercase tracking-[0.1em] sm:tracking-widest break-words">Paystack Subaccount</p>
                    <p className="mt-2 text-xs sm:text-sm font-black text-dark break-all">
                      {payoutAccount?.paystack_subaccount_code ?? 'No payout account has been connected yet.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-[3px] border-dark rounded-[20px] sm:rounded-3xl bg-blue-100 p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[5px_5px_0px_#060E1C] min-w-0">
                <h3 className="text-lg sm:text-xl font-black text-dark mb-4 break-words">Payment Actions</h3>
                <div className="space-y-3 min-w-0">
                  <Link href="/dash/tutor/earnings?action=update-bank-details" className="flex items-center justify-between gap-2 rounded-xl border-[2px] border-dark bg-white px-4 py-3 text-xs sm:text-sm font-black text-dark hover:bg-yellow hover:translate-x-[2px] hover:translate-y-[2px] shadow-[2px_2px_0px_#060E1C] sm:shadow-[3px_3px_0px_#060E1C] hover:shadow-none transition-all min-w-0">
                    <span className="flex items-center gap-2 truncate"><PaymentIcon className="h-4 w-4 shrink-0" /> <span className="truncate">Update Bank Details</span></span>
                    <ArrowRight className="h-4 w-4 shrink-0" />
                  </Link>
                  <Link href="/dash/tutor/earnings?action=download-invoice" className="flex items-center justify-between gap-2 rounded-xl border-[2px] border-dark bg-white px-4 py-3 text-xs sm:text-sm font-black text-dark hover:bg-yellow hover:translate-x-[2px] hover:translate-y-[2px] shadow-[2px_2px_0px_#060E1C] sm:shadow-[3px_3px_0px_#060E1C] hover:shadow-none transition-all min-w-0">
                    <span className="flex items-center gap-2 truncate"><Download className="h-4 w-4 shrink-0" /> <span className="truncate">Export Payout History</span></span>
                    <ArrowRight className="h-4 w-4 shrink-0" />
                  </Link>
                  <Link href="/dash/tutor/earnings?action=report-issue" className="flex items-center justify-between gap-2 rounded-xl border-[2px] border-dark bg-white px-4 py-3 text-xs sm:text-sm font-black text-dark hover:bg-rose-200 hover:translate-x-[2px] hover:translate-y-[2px] shadow-[2px_2px_0px_#060E1C] sm:shadow-[3px_3px_0px_#060E1C] hover:shadow-none transition-all min-w-0">
                    <span className="flex items-center gap-2 truncate"><span className="truncate">Report Payment Issue</span></span>
                    <ArrowRight className="h-4 w-4 shrink-0" />
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
    <div className={`border-[2px] sm:border-[3px] border-dark rounded-[20px] sm:rounded-2xl ${bgColor} p-4 sm:p-6 shadow-[3px_3px_0px_#060E1C] sm:shadow-[5px_5px_0px_#060E1C] min-w-0`}>
      <div className="flex items-center justify-between gap-2 min-w-0">
        <div className="min-w-0">
          <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-widest text-dark/70 break-words">{title}</p>
          <p className="mt-1 sm:mt-2 text-xl sm:text-2xl font-black text-dark break-words">{value}</p>
        </div>
        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl border-[2px] sm:border-[3px] border-dark bg-white flex items-center justify-center shadow-[2px_2px_0px_#060E1C] shrink-0">
          <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-dark" />
        </div>
      </div>
    </div>
  );
}
