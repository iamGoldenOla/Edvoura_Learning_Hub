'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Star, ArrowRight, Globe2, Sparkles } from 'lucide-react';

type CurrencyCode = 'USD' | 'GBP' | 'NGN' | 'EUR' | 'CAD' | 'AUD';

interface CurrencyRate {
  code: CurrencyCode;
  symbol: string;
  name: string;
  flag: string;
  // Conversion multipliers relative to USD base rate ($20, $25, $30)
  p1: number; // Starter
  p2: number; // Growth
  p3: number; // Elite
  format: (amount: number) => string;
}

const CURRENCIES: Record<CurrencyCode, CurrencyRate> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    flag: '🇺🇸',
    p1: 20,
    p2: 25,
    p3: 30,
    format: (amt) => `$${amt}`,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    flag: '🇬🇧',
    p1: 16,
    p2: 20,
    p3: 24,
    format: (amt) => `£${amt}`,
  },
  NGN: {
    code: 'NGN',
    symbol: '₦',
    name: 'Nigerian Naira',
    flag: '🇳🇬',
    p1: 30000,
    p2: 38000,
    p3: 46000,
    format: (amt) => `₦${amt.toLocaleString()}`,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    flag: '🇪🇺',
    p1: 18,
    p2: 23,
    p3: 28,
    format: (amt) => `€${amt}`,
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    flag: '🇨🇦',
    p1: 27,
    p2: 34,
    p3: 41,
    format: (amt) => `C$${amt}`,
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    flag: '🇦🇺',
    p1: 30,
    p2: 38,
    p3: 46,
    format: (amt) => `A$${amt}`,
  },
};

export default function InteractivePricingCards() {
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('USD');

  const curr = CURRENCIES[selectedCurrency];

  const plans = [
    {
      name: 'Starter (1-on-1)',
      price: curr.format(curr.p1),
      rateUnit: '/ session (1-on-1)',
      badge: 'Foundational',
      desc: 'Ideal for continuous homework help, weekly booster lessons, and core subject confidence.',
      features: [
        'Dedicated live 1-on-1 expert tutor',
        'Interactive Edvoura Whiteboard & Seat-Work',
        'Edvoura Curriculum Matrix™ diagnostic tracking',
        'Weekly WhatsApp progress report for parents',
        'Curriculum homework assistance',
        'Email & direct tutor support',
      ],
      popular: false,
      color: 'bg-white',
      textColor: 'text-navy',
      btnColor: 'bg-white border-4 border-navy text-navy hover:bg-yellow shadow-[4px_4px_0px_#0A1628]',
    },
    {
      name: 'Growth Acceleration',
      price: curr.format(curr.p2),
      rateUnit: '/ hr',
      badge: 'Most Popular',
      desc: 'Our flagship plan for multi-subject acceleration and deep exam readiness.',
      features: [
        'Live 1-on-1 expert instruction across core subjects',
        'Full access to Edvoura LexiCore™ (7,298 words)',
        'Full access to MathMotion Studio™ (60 FPS visual proofs)',
        'STEM MechLab™ physical computing simulations',
        '300,000+ past question bank & practice quizzes',
        'Session video replays for revision',
        'Interactive learning games & storybooks',
        'Dedicated parent dashboard monitoring',
      ],
      popular: true,
      color: 'bg-navy',
      textColor: 'text-white',
      btnColor: 'bg-yellow border-4 border-navy text-navy hover:bg-yellow-light shadow-[6px_6px_0px_#0A1628]',
    },
    {
      name: 'Elite Immersion & Exam Prep',
      price: curr.format(curr.p3),
      rateUnit: '/ hr',
      badge: 'Academic Immersion',
      desc: 'Intensive preparation for WAEC, JAMB, Cambridge IGCSE, GCSE, US SAT, and 11+ Plus.',
      features: [
        'Elite senior tutor & dedicated academic coordinator',
        'Targeted exam prep (WAEC, JAMB, IGCSE, GCSE, SAT, 11+)',
        'Unlimited subjects with priority scheduling flexibility',
        'Permanent lesson video archives for lifetime revision',
        'Comprehensive mock exams with detailed examiner feedback',
        'Direct WhatsApp parent concierge line',
        'Bi-weekly academic evaluation & strategy calls',
      ],
      popular: false,
      color: 'bg-white',
      textColor: 'text-navy',
      btnColor: 'bg-white border-4 border-navy text-navy hover:bg-yellow shadow-[4px_4px_0px_#0A1628]',
    },
  ];

  return (
    <div className="space-y-12">
      {/* Currency Converter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border-4 border-navy bg-white p-5 shadow-[8px_8px_0px_#0A1628]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow border-2 border-navy flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#0A1628]">
            <Globe2 className="w-5 h-5 text-navy" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-navy">
              Live Currency Converter
            </p>
            <p className="text-xs font-bold text-navy/60">
              Select your currency to view transparent per-session rates worldwide:
            </p>
          </div>
        </div>

        {/* Currency Switcher Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => {
            const isSelected = selectedCurrency === code;
            const c = CURRENCIES[code];
            return (
              <button
                key={code}
                type="button"
                onClick={() => setSelectedCurrency(code)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-navy text-xs font-black transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-yellow text-navy shadow-[3px_3px_0px_#0A1628] scale-105'
                    : 'bg-off-white text-navy/70 hover:bg-slate-100 hover:text-navy'
                }`}
              >
                <span>{c.flag}</span>
                <span>{code}</span>
                <span className="text-[10px] font-mono opacity-60">({c.symbol})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid md:grid-cols-3 gap-8 items-start">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-3xl border-4 border-navy ${plan.color} ${
              plan.popular
                ? 'p-8 text-white shadow-[12px_12px_0px_#0A1628] md:scale-105 z-10'
                : 'p-6 text-navy shadow-[8px_8px_0px_#0A1628]'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-yellow border-2 border-navy text-navy font-black text-xs uppercase tracking-wider px-4 py-1.5 rounded-full shadow-[2px_2px_0px_#0A1628] flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-navy" /> {plan.badge}
              </div>
            )}

            <div className="flex items-center justify-between mb-2">
              <h3 className="font-heading font-black text-2xl">{plan.name}</h3>
              {!plan.popular && (
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md border border-navy/20 bg-off-white text-navy/70">
                  {plan.badge}
                </span>
              )}
            </div>

            <p className={`text-xs font-bold leading-relaxed mb-6 ${plan.popular ? 'text-white/70' : 'text-navy/60'}`}>
              {plan.desc}
            </p>

            {/* Price Headline: $20 / session, $25 / hr, $30 / hr */}
            <div className="rounded-2xl border-2 border-navy bg-white/10 backdrop-blur-sm p-4 mb-6">
              <div className="flex items-baseline gap-1.5">
                <span className={`font-heading font-black text-4xl sm:text-5xl tracking-tight ${plan.popular ? 'text-yellow' : 'text-navy'}`}>
                  {plan.price}
                </span>
                <span className={`text-xs sm:text-sm font-black uppercase tracking-wider ${plan.popular ? 'text-white/80' : 'text-navy/70'}`}>
                  {plan.rateUnit}
                </span>
              </div>
              <p className={`mt-1 text-[11px] font-bold ${plan.popular ? 'text-white/60' : 'text-navy/50'}`}>
                No locked-in contracts • Cancel or pause anytime
              </p>
            </div>

            <Link
              href="/signup"
              className={`block w-full text-center py-4 px-4 rounded-xl font-heading font-black text-sm uppercase tracking-wider transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none ${plan.btnColor}`}
            >
              Start Free Trial Session →
            </Link>

            <div className={`mt-8 pt-6 border-t ${plan.popular ? 'border-white/20' : 'border-navy/15'} space-y-3`}>
              <p className={`text-[11px] font-black uppercase tracking-wider ${plan.popular ? 'text-white/50' : 'text-navy/40'}`}>
                What&apos;s included:
              </p>
              {plan.features.map((feat) => (
                <div key={feat} className="flex items-start gap-2.5 text-xs font-bold">
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      plan.popular ? 'text-yellow' : 'text-emerald-600'
                    }`}
                  />
                  <span className={plan.popular ? 'text-white/90' : 'text-navy/80'}>
                    {feat}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
