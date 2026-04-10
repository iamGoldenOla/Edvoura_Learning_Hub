import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';
import Link from 'next/link';
import { CheckCircle2, Star, ChevronRight, HelpCircle } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '₦15,000',
    period: '/month',
    desc: 'Perfect for trying out live tutoring with one subject.',
    features: [
      '4 live sessions per month',
      '1 subject',
      'Basic progress reports',
      'Assignment submission',
      'Email support',
      'Session recordings (7-day access)',
    ],
    excluded: ['Exam prep modules', 'Dedicated tutor', 'Parent dashboard', 'Priority support'],
    popular: false,
  },
  {
    name: 'Growth',
    price: '₦35,000',
    period: '/month',
    desc: 'Our most popular plan for serious, consistent learners.',
    features: [
      '12 live sessions per month',
      'Up to 3 subjects',
      'Full progress analytics',
      'Quiz & assignment access',
      'Priority email support',
      'Session recordings (30-day access)',
      'Interactive learning games',
      'Badge & reward system',
    ],
    excluded: ['Exam prep modules', 'Dedicated tutor'],
    popular: true,
  },
  {
    name: 'Premium',
    price: '₦65,000',
    period: '/month',
    desc: 'The complete Edvoura experience with unlimited access.',
    features: [
      'Unlimited live sessions',
      'All subjects included',
      'WAEC, JAMB & NECO exam prep',
      'Dedicated personal tutor',
      'Full parent dashboard access',
      '24/7 priority support',
      'Session recordings (unlimited)',
      'Certificates of completion',
      'Study planner & calendar',
      'Past questions bank access',
    ],
    excluded: [],
    popular: false,
  },
];

const faqs = [
  { q: 'Can I switch plans at any time?', a: 'Absolutely. You can upgrade or downgrade your plan at any time from your dashboard. Changes take effect at the start of your next billing cycle.' },
  { q: 'Is there a free trial?', a: 'We offer a free introductory session so you can experience Edvoura before committing. Sign up and book your first session at no cost.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major Nigerian bank cards, bank transfers, and USSD via our secure Paystack integration. International cards are also supported.' },
  { q: 'Can I add multiple children to one account?', a: 'Yes! Parents can manage multiple children from a single parent account. Each child gets their own student dashboard and tutor assignments.' },
  { q: 'What happens if I miss a session?', a: 'Sessions can be rescheduled up to 2 hours before the scheduled time. Missed sessions without notice are deducted from your monthly allocation.' },
  { q: 'How are tutors vetted?', a: 'All tutors undergo a rigorous screening process including credential verification, background checks, demo teaching sessions, and ongoing performance reviews.' },
];

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="bg-navy pt-[72px] relative overflow-hidden">
        <div className="hero-grid-overlay absolute inset-0 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6 md:px-8 py-20 md:py-28 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-yellow-dim mb-4">Pricing</p>
          <h1 className="font-heading font-extrabold text-white max-w-3xl mx-auto leading-tight" style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)' }}>
            Transparent Pricing. No Hidden Fees.
          </h1>
          <p className="mt-6 text-grey text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Choose a plan that fits your child&apos;s learning needs. All plans include access to our interactive platform, vetted tutors, and progress tracking.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="bg-off-white py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border relative ${
                  plan.popular
                    ? 'bg-navy text-white border-yellow shadow-xl scale-[1.03]'
                    : 'bg-white border-grey-light shadow-sm'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow text-navy text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full flex items-center gap-1.5">
                    <Star className="w-3 h-3 fill-navy" /> Most Popular
                  </div>
                )}

                <div className="p-8">
                  <h3 className={`font-heading font-bold text-xl mb-2 ${plan.popular ? 'text-white' : 'text-navy'}`}>{plan.name}</h3>
                  <p className={`text-sm mb-6 ${plan.popular ? 'text-grey' : 'text-grey'}`}>{plan.desc}</p>

                  <div className="mb-8">
                    <span className={`text-4xl font-heading font-extrabold ${plan.popular ? 'text-yellow' : 'text-navy'}`}>{plan.price}</span>
                    <span className={`text-sm ${plan.popular ? 'text-grey' : 'text-grey'}`}>{plan.period}</span>
                  </div>

                  <Link
                    href="/signup"
                    className={`block text-center font-heading font-bold py-3.5 rounded-xl transition-colors text-sm mb-8 ${
                      plan.popular
                        ? 'bg-yellow text-navy hover:bg-yellow-light'
                        : 'border border-grey-light text-navy hover:border-yellow hover:text-yellow'
                    }`}
                  >
                    Get Started <ChevronRight className="w-4 h-4 inline" />
                  </Link>

                  <div className="border-t border-navy-light/20 pt-6">
                    <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${plan.popular ? 'text-grey' : 'text-grey'}`}>What&apos;s included</p>
                    <ul className="space-y-3">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm">
                          <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${plan.popular ? 'text-yellow' : 'text-success'}`} />
                          <span className={plan.popular ? 'text-white/80' : 'text-grey'}>{f}</span>
                        </li>
                      ))}
                      {plan.excluded.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm opacity-40">
                          <span className="w-4 h-4 shrink-0 mt-0.5 text-center">—</span>
                          <span className={plan.popular ? 'text-white/40' : 'text-grey'}>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6 md:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-yellow-dim mb-3">FAQ</p>
            <h2 className="font-heading font-extrabold text-navy" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)' }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <details key={faq.q} className="group bg-off-white border border-grey-light rounded-2xl overflow-hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <span className="font-heading font-bold text-navy text-sm pr-4">{faq.q}</span>
                  <HelpCircle className="w-5 h-5 text-grey shrink-0 group-open:text-yellow transition-colors" />
                </summary>
                <div className="px-6 pb-6 text-grey text-sm leading-relaxed -mt-2">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-yellow py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-6 md:px-8 text-center">
          <h2 className="font-heading font-extrabold text-navy text-2xl md:text-3xl mb-4">
            Still Deciding? Try Your First Session Free.
          </h2>
          <p className="text-navy/70 text-sm mb-8">No credit card required. Book a free introductory session and see the Edvoura difference.</p>
          <Link href="/signup" className="inline-flex items-center gap-2 bg-navy hover:bg-dark text-white font-heading font-bold px-10 py-4 rounded-xl transition-colors">
            Book Free Session <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
