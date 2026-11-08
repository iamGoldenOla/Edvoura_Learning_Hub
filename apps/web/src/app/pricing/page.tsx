import { Metadata } from 'next';
import Navbar from '@/components/marketing/Navbar';
import InteractivePricingCards from '@/components/pricing/InteractivePricingCards';
import Footer from '@/components/marketing/Footer';
import Link from 'next/link';
import { CheckCircle2, Star, ChevronRight, HelpCircle, ArrowRight, ShieldCheck, Globe2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Affordable Online Tutoring Plans & Pricing ($20/session, $25/hr, $30/hr) | Edvoura',
  description:
    'Transparent, accessible 1-on-1 tutoring starting at $20/session with live multi-currency converter (USD, GBP, NGN, EUR, CAD). Certified tutors for Cambridge, IB, US Common Core, and WAEC.',
  openGraph: {
    title: 'Affordable Online Tutoring Plans & Pricing | Edvoura Learning Hub',
    description:
      'Transparent, premium K-12 tutoring plans starting from $20/session. Flexible monthly packages for international families.',
  },
};

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
    q: 'Can I pay via direct bank transfer and submit proof of payment?',
    a: 'Yes! We accept direct bank transfers. You can send your transfer receipt or payment screenshot to payment@edvouralearninghub.com for immediate activation.',
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

          {/* Interactive Pricing Cards with Live Currency Converter */}
          <div className="mb-20">
            <InteractivePricingCards />
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
