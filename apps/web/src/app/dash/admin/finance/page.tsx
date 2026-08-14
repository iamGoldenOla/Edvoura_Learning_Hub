import React from 'react';
import { AdminNavHeader } from '@/components/dashboards/admin/AdminNavHeader';
import { AdminFinanceClient } from '@/components/dashboards/admin/AdminFinanceClient';
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

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1680px] space-y-8 sm:space-y-10 p-4 sm:p-8 pb-24">
      <AdminNavHeader
        title="Finance & Billing"
        subtitle="Secure enterprise-grade overview for Paystack transactions, subscriptions, and payouts."
      />
      <AdminFinanceClient
        subscriptionsCount={subscriptionsCount ?? 0}
        invoicesCount={invoicesCount ?? 0}
        payoutsCount={payoutsCount ?? 0}
        recentInvoices={normalizedInvoices}
      />
    </div>
  );
}
