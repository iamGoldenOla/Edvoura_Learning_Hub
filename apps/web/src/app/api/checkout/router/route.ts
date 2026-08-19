import { NextRequest, NextResponse } from 'next/server';

interface CheckoutRouteConfig {
  gateway: 'Flutterwave' | 'Stripe' | 'Paddle' | 'Razorpay';
  currency: string;
  merchantRole: string;
  notes: string;
}

const REGIONAL_PAYMENT_MAP: Record<string, CheckoutRouteConfig> = {
  NG: {
    gateway: 'Flutterwave',
    currency: 'NGN',
    merchantRole: 'Direct Local Processor',
    notes: 'Optimized for Nigerian Naira cards, USSD, and bank transfers.',
  },
  IN: {
    gateway: 'Razorpay',
    currency: 'INR',
    merchantRole: 'Direct Indian Processor',
    notes: 'Optimized for Indian Rupee UPI, NetBanking, and RuPay cards.',
  },
  US: {
    gateway: 'Stripe',
    currency: 'USD',
    merchantRole: 'Global Cards & Subscriptions',
    notes: 'Optimized for US Dollar cards, Apple Pay, and Google Pay.',
  },
  UK: {
    gateway: 'Paddle',
    currency: 'GBP',
    merchantRole: 'Merchant of Record (Global Tax Compliance)',
    notes: 'Handles UK & EU VAT compliance and recurring GBP subscriptions automatically.',
  },
  EU: {
    gateway: 'Paddle',
    currency: 'EUR',
    merchantRole: 'Merchant of Record (Global Tax Compliance)',
    notes: 'Handles EU VAT compliance across Eurozone member states.',
  },
  GLOBAL: {
    gateway: 'Paddle',
    currency: 'USD',
    merchantRole: 'Merchant of Record',
    notes: 'Default international gateway with global sales tax compliance.',
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { curriculum_region = 'NG', planId = 'pro_monthly', studentId = 'guest_student' } = body;

    const uppercaseRegion = String(curriculum_region).toUpperCase();
    const routeConfig = REGIONAL_PAYMENT_MAP[uppercaseRegion] || REGIONAL_PAYMENT_MAP.GLOBAL;

    const mockCheckoutUrl = `https://checkout.${routeConfig.gateway.toLowerCase()}.com/pay?plan=${planId}&region=${uppercaseRegion}&currency=${routeConfig.currency}&student=${encodeURIComponent(studentId)}`;

    return NextResponse.json({
      success: true,
      region: uppercaseRegion,
      gateway: routeConfig.gateway,
      currency: routeConfig.currency,
      merchantRole: routeConfig.merchantRole,
      checkoutUrl: mockCheckoutUrl,
      notes: routeConfig.notes,
    });
  } catch (err: any) {
    console.error('[PAYMENT ROUTER API ERROR]', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 });
  }
}
