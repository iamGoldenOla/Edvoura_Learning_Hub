-- Phase 3: Rename Stripe columns to Paystack equivalents
-- The Kysely types already reference paystack_* names. This migration aligns the DB columns.

-- billing.plans: stripe_price_id → paystack_plan_code
alter table billing.plans rename column stripe_price_id to paystack_plan_code;

-- billing.subscriptions: stripe_customer_id → paystack_customer_code
alter table billing.subscriptions rename column stripe_customer_id to paystack_customer_code;

-- billing.subscriptions: stripe_subscription_id → paystack_subscription_code
alter table billing.subscriptions rename column stripe_subscription_id to paystack_subscription_code;

-- billing.invoices: stripe_invoice_id → paystack_reference
alter table billing.invoices rename column stripe_invoice_id to paystack_reference;

-- billing.payments: stripe_payment_intent_id → paystack_payment_reference
alter table billing.payments rename column stripe_payment_intent_id to paystack_payment_reference;

-- billing.tutor_payout_accounts: stripe_connected_account_id → paystack_subaccount_code
alter table billing.tutor_payout_accounts rename column stripe_connected_account_id to paystack_subaccount_code;

-- Add paystack_customer_code to parent_profiles for quick lookup
alter table public.parent_profiles
  add column if not exists paystack_customer_code text unique;
