import Link from 'next/link';
import { CreditCard, FileText, Receipt } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getBillingSummary, requireAppViewer } from '@/lib/app-context';

export default async function ParentBillingPage() {
  const viewer = await requireAppViewer();
  const billing = await getBillingSummary(viewer.accessToken).catch(() => null);

  const subscription = billing?.subscription ?? null;
  const invoices = billing?.invoices ?? [];

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 sm:p-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-edvoura-navy">Billing & Subscription</h1>
        <p className="mt-2 text-sm text-slate-600">
          Manage plan status, payment history, and account billing records.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Plan Name</p>
              <p className="text-xl font-bold text-slate-900">{subscription?.planName ?? 'No active plan'}</p>
              <p className="mt-1 text-xs text-slate-600">Status: {subscription?.status ?? 'inactive'}</p>
              <p className="text-xs text-slate-600">
                Next renewal: {subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : 'n/a'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" className="text-xs">
                <CreditCard className="mr-1 h-3.5 w-3.5" />
                Upgrade via Paystack
              </Button>
              <Button variant="outline" className="text-xs">
                <FileText className="mr-1 h-3.5 w-3.5" />
                Update Payment Method
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Entitlement</p>
              <p className="font-semibold text-slate-900">
                {billing?.entitlement.hasAccess ? 'Access Active' : 'Access Limited'}
              </p>
              <p className="text-xs text-slate-600">{billing?.entitlement.reason ?? 'No record'}</p>
            </div>
            <Link href="/dash/profile">
              <Button variant="outline" className="w-full text-xs">
                Open Consent & Account Settings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <div className="space-y-2">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Invoice #{invoice.id.slice(0, 8)}</p>
                    <p className="text-xs text-slate-600">
                      Status: {invoice.status} | Due: {invoice.dueAt ? new Date(invoice.dueAt).toLocaleDateString() : 'n/a'}
                    </p>
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    <Receipt className="mr-1 inline h-3.5 w-3.5 text-slate-600" />
                    {(invoice.amountDueMinor / 100).toLocaleString()} NGN
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600">No invoices available yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
