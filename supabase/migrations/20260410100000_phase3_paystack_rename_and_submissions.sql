-- Phase 3: Rename Stripe columns to Paystack equivalents
-- The Kysely types already reference paystack_* names. This migration aligns the DB columns.

-- billing.plans: stripe_price_id → paystack_plan_code
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema = 'billing' and table_name = 'plans' and column_name = 'stripe_price_id') then
    alter table billing.plans rename column stripe_price_id to paystack_plan_code;
  end if;
end $$;

-- billing.subscriptions: stripe_customer_id → paystack_customer_code
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema = 'billing' and table_name = 'subscriptions' and column_name = 'stripe_customer_id') then
    alter table billing.subscriptions rename column stripe_customer_id to paystack_customer_code;
  end if;
end $$;

-- billing.subscriptions: stripe_subscription_id → paystack_subscription_code
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema = 'billing' and table_name = 'subscriptions' and column_name = 'stripe_subscription_id') then
    alter table billing.subscriptions rename column stripe_subscription_id to paystack_subscription_code;
  end if;
end $$;

-- billing.invoices: stripe_invoice_id → paystack_reference
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema = 'billing' and table_name = 'invoices' and column_name = 'stripe_invoice_id') then
    alter table billing.invoices rename column stripe_invoice_id to paystack_reference;
  end if;
end $$;

-- billing.payments: stripe_payment_intent_id → paystack_payment_reference
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema = 'billing' and table_name = 'payments' and column_name = 'stripe_payment_intent_id') then
    alter table billing.payments rename column stripe_payment_intent_id to paystack_payment_reference;
  end if;
end $$;

-- billing.tutor_payout_accounts: stripe_connected_account_id → paystack_subaccount_code
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema = 'billing' and table_name = 'tutor_payout_accounts' and column_name = 'stripe_connected_account_id') then
    alter table billing.tutor_payout_accounts rename column stripe_connected_account_id to paystack_subaccount_code;
  end if;
end $$;

-- Add paystack_customer_code to parent_profiles for quick lookup
alter table public.parent_profiles
  add column if not exists paystack_customer_code text unique;
