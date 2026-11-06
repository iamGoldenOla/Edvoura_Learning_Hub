import { Metadata } from 'next';
import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';
import Link from 'next/link';
import { CheckCircle2, Star, ChevronRight, HelpCircle, ArrowRight, ShieldCheck, Globe2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Affordable Online Tutoring Plans & Pricing ($20/session)',
  description:
    'Transparent, premium K-12 tutoring plans starting from $20/session ($240/mo). Verified certified tutors for Cambridge, IB, US Common Core, and WAEC curricula worldwide.',
  openGraph: {
    title: 'Affordable Online Tutoring Plans & Pricing | Edvoura Learning Hub',
    description:
      'Transparent, premium K-12 tutoring plans starting from $20/session. Flexible monthly packages for international families.',
  },
};

const plans = [
  {
    name: 'Starter',
    hourly: '$20',
    price: '$240',
    period: '/month',
    desc: 'Perfect for foundational mastery with 12 personalized 1-on-1 sessions per month.',
    sessions: '12 sessions per month',
    features: [
      '12 live 1-on-1 sessions per month',
      '1 core subject of choice',
      'Interactive EDVOURA Whiteboard & Seat-Work',
      'Comprehensive progress reports',
      'Curriculum homework assistance',
      'Email & parent portal support',
    ],
    excluded: ['Session video recordings', 'Exam prep intensive modules', 'Multi-subject switching'],
    popular: false,
    color: 'bg-white',
    buttonCode: 'bg-white border-4 border-navy text-navy hover:bg-yellow shadow-[4px_4px_0px_#0A1628] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_#0A1628]'
  },
  {
    name: 'Growth',
    hourly: '$25',
    price: '$400',
    period: '/month',
    desc: 'Our most popular plan: 16 sessions per month for multi-subject acceleration.',
    sessions: '16 sessions per month',
    features: [
      '16 live 1-on-1 sessions per month',
      'Up to 3 core subjects (Math, Science, English)',
      'Interactive EDVOURA Whiteboard & Seat-Work',
      'Full learning analytics & milestone tracking',
      'Unlimited quiz & 300,000+ past question bank access',
      'HD session recordings (30-day replay)',
      'Interactive educational games & storybook library',
      'Dedicated parent dashboard monitoring',
    ],
    excluded: ['Dedicated primary mentor coordinator'],
    popular: true,
    color: 'bg-navy',
    buttonCode: 'bg-yellow border-4 border-navy text-navy hover:bg-yellow-light shadow-[6px_6px_0px_#0A1628] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_#0A1628]'
  },
  {
    name: 'Elite Immersion',
    hourly: '$30',
    price: '$600',
    period: '/month',
    desc: 'The complete academic immersion: 20 sessions per month with dedicated tutor coordination.',
    sessions: '20 sessions per month',
    features: [
      '20 live 1-on-1 sessions per month',
      'Unlimited subjects & flexible scheduling',
      'Dedicated elite tutor & academic coordinator',
      'Comprehensive exam prep (IGCSE, IB, SAT, WAEC, 11+)',
      'Permanent session video archives for revision',
      'Priority tutor matching & reschedule flexibility',
      'Direct WhatsApp parent concierge support',
      'Bi-weekly academic evaluation & strategy calls',
    ],
    excluded: [],
    popular: false,
    color: 'bg-white',
    buttonCode: 'bg-white border-4 border-navy text-navy hover:bg-yellow shadow-[4px_4px_0px_#0A1628] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_#0A1628]'
  },
];

const faqs = [
  {
    q: 'Why did Edvoura choose $20 to $30 per session?',
    a: 'We believe premium education requires paying certified, thoroughly vetted educators top-market rates while keeping costs 50% to 70% lower than traditional in-person tutoring in London, New York, Tokyo, or Shanghai ($50–$90/hr).',
  },
  {
    q: 'Can international parents outside Nigeria pay in USD, GBP, or EUR?',
    a: 'Yes! We support global multi-currency payments via Stripe (Visa, Mastercard, American Express), as well as Paystack and Flutterwave for African and diaspora corridors.',
  },
  {
    q: 'Can I change my plan later?',
    a: 'Yes! You can upgrade, downgrade, or pause your subscription at any time from your parent dashboard. Changes take effect on your next billing cycle.',
  },
  {
    q: 'What happens if we miss a session?',
    a: 'Sessions can be rescheduled up to 4 hours before the scheduled start time at no penalty. Missed sessions without prior notice can be made up within the same calendar month.',
  },
  {
    q: 'How are tutors vetted?',
    a: 'All Edvoura tutors undergo a multi-step vetting process including identity verification, background checks, subject competency testing, and a live teaching demo before being approved.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Yes! Every new family receives 1 free trial session with a matched tutor to experience the Edvoura platform before selecting a plan.',
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-sand flex flex-col">
      <Navbar />

      <main className="flex-1 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 bg-yellow border-2 border-navy rounded-full text-navy font-bold text-xs uppercase tracking-wider mb-4 shadow-[2px_2px_0px_#0A1628]">
              Transparent Global Pricing
            </span>
            <h1 className="font-syne font-extrabold text-4xl sm:text-5xl text-navy mb-4 tracking-tight">
              Invest in your child&apos;s future with elite 1-on-1 tutoring
            </h1>
            <p className="text-navy/70 text-lg sm:text-xl font-medium">
              World-class educators for Cambridge, IB, US Common Core, and WAEC. Starting at $20/session.
            </p>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid md:grid-cols-3 gap-8 items-start mb-20">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-3xl border-4 border-navy ${plan.color} ${
                  plan.popular
                    ? 'p-8 text-white shadow-[12px_12px_0px_#0A1628] scale-105 z-10'
                    : 'p-6 text-navy shadow-[8px_8px_0px_#0A1628]'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-yellow border-2 border-navy text-navy font-bold text-xs uppercase tracking-wider px-4 py-1.5 rounded-full shadow-[2px_2px_0px_#0A1628] flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-navy" /> Most Popular
                  </div>
                )}

                <h3 className="font-syne font-bold text-2xl mb-1">{plan.name}</h3>
                <p className={`text-sm mb-6 ${plan.popular ? 'text-white/70' : 'text-navy/60'}`}>
                  {plan.desc}
                </p>

                <div className="flex items-baseline gap-1 mb-2">
                  <span className="font-syne font-extrabold text-4xl">{plan.price}</span>
                  <span className={`text-sm ${plan.popular ? 'text-white/70' : 'text-navy/60'}`}>
                    {plan.period}
                  </span>
                </div>

                <div className="mb-6">
                  <span
                    className={`inline-block text-xs font-bold px-2.5 py-1 rounded-md border ${
                      plan.popular
                        ? 'bg-white/10 border-white/20 text-yellow'
                        : 'bg-navy/5 border-navy/10 text-navy'
                    }`}
                  >
                    {plan.hourly} / session (1-on-1)
                  </span>
                </div>

                <Link
                  href="/signup"
                  className={`block w-full text-center py-3.5 px-4 rounded-xl font-syne font-bold text-sm tracking-wide transition-all ${plan.buttonCode}`}
                >
                  Get Started
                </Link>

                <div className="mt-8 pt-8 border-t border-navy/10 space-y-3">
                  <p className={`text-xs font-bold uppercase tracking-wider mb-4 ${plan.popular ? 'text-white/50' : 'text-navy/40'}`}>
                    Included in this plan
                  </p>
                  {plan.features.map((feat) => (
                    <div key={feat} className="flex items-start gap-3 text-sm">
                      <CheckCircle2
                        className={`w-5 h-5 shrink-0 ${
                          plan.popular ? 'text-yellow' : 'text-green-600'
                        }`}
                      />
                      <span className={plan.popular ? 'text-white/90' : 'text-navy/80'}>
                        {feat}
                      </span>
                    </div>
                  ))}
                  {plan.excluded.map((feat) => (
                    <div
                      key={feat}
                      className={`flex items-start gap-3 text-sm opacity-40 ${
                        plan.popular ? 'text-white' : 'text-navy'
                      }`}
                    >
                      <div className="w-5 h-5 shrink-0 flex items-center justify-center font-bold">
                        &times;
                      </div>
                      <span className="line-through">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Guarantee Banner */}
          <div className="bg-yellow border-4 border-navy rounded-3xl p-8 mb-20 shadow-[8px_8px_0px_#0A1628] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-white border-3 border-navy rounded-2xl flex items-center justify-center shrink-0 shadow-[4px_4px_0px_#0A1628]">
                <ShieldCheck className="w-7 h-7 text-navy" />
              </div>
              <div>
                <h3 className="font-syne font-bold text-xl text-navy">
                  100% Satisfaction Guarantee
                </h3>
                <p className="text-navy/80 text-sm font-medium mt-1">
                  If you&apos;re not completely satisfied with your first session, we will match you with a different tutor or issue a full refund.
                </p>
              </div>
            </div>
            <Link
              href="/signup"
              className="bg-navy text-white font-syne font-bold px-6 py-3 rounded-xl border-2 border-navy hover:bg-navy/90 shrink-0 shadow-[4px_4px_0px_#0A1628] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2"
            >
              Book Free Trial <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* FAQs */}
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-syne font-bold text-3xl text-navy">
                Frequently Asked Questions
              </h2>
              <p className="text-navy/70 text-sm mt-2">
                Have questions about pricing and international scheduling? Here are answers to common questions.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq) => (
                <div
                  key={faq.q}
                  className="bg-white border-3 border-navy rounded-2xl p-6 shadow-[4px_4px_0px_#0A1628]"
                >
                  <h4 className="font-syne font-bold text-base text-navy flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-yellow shrink-0 mt-0.5" />
                    {faq.q}
                  </h4>
                  <p className="text-navy/70 text-sm mt-3 ml-8 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
