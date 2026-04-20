import Link from 'next/link';
import { CreditCard, DollarSign, FileText, Wallet } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div className="mx-auto max-w-7xl space-y-8 p-6 sm:p-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-edvoura-navy">Invoice and Payment</h1>
        <p className="mt-2 text-sm text-slate-600">
          Track invoice totals, payout status, and payment history.
        </p>
      </section>

      {action ? (
        <section className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          Action Center: <strong>{action}</strong> flow opened.
        </section>
      ) : null}

      <section className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <Stat title="Current Cycle" value="NGN 125,000" icon={DollarSign} />
        <Stat title="Paid Invoices" value="1" icon={FileText} />
        <Stat title="Pending Payout" value="1" icon={Wallet} />
        <Stat title="Default Method" value="Bank Transfer" icon={CreditCard} />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Invoice Summary</CardTitle>
              <Link href="/dash/tutor/earnings?action=export">
                <Button variant="outline" className="border-slate-300 bg-white text-xs">Export CSV</Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-4 md:items-center">
                    <p className="text-sm font-semibold text-slate-900">{invoice.id}</p>
                    <p className="text-xs text-slate-600">{invoice.period}</p>
                    <p className="text-xs font-semibold text-slate-800">{invoice.amount}</p>
                    <p className="text-xs text-slate-700">{invoice.status}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 xl:col-span-5">
          <Card>
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {payouts.map((payout) => (
                <div key={payout.id} className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-sm font-semibold text-slate-900">{payout.id}</p>
                  <p className="text-xs text-slate-600">{payout.date} | {payout.method}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-800">{payout.amount}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/dash/tutor/earnings?action=update-payment">
                <Button variant="outline" className="w-full border-slate-300 bg-white text-sm">
                  Update Payment Method
                </Button>
              </Link>
              <Link href="/dash/tutor/earnings?action=download-invoice">
                <Button variant="outline" className="w-full border-slate-300 bg-white text-sm">
                  Download Invoice PDF
                </Button>
              </Link>
              <Link href="/dash/tutor/earnings?action=report-issue">
                <Button variant="outline" className="w-full border-slate-300 bg-white text-sm">
                  Report Payment Issue
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

function Stat({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-xs font-medium text-slate-500">{title}</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
        </div>
        <Icon className="h-5 w-5 text-slate-500" />
      </CardContent>
    </Card>
  );
}
