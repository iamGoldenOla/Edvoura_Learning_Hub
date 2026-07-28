import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';
import Link from 'next/link';
import { CheckCircle2, Star, ChevronRight, HelpCircle, ArrowRight } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    hourly: '$7',
    price: '$84',
    period: '/month',
    desc: 'Perfect for trying out live tutoring with 12 sessions per month.',
    sessions: '12 sessions per month',
    features: [
      '12 live sessions per month',
      '1 core subject',
      'Basic progress reports',
      'Assignment submission',
      'Email support',
    ],
    excluded: ['Session recordings', 'Exam prep modules', 'Parent dashboard', 'Interactive games'],
    popular: false,
    color: 'bg-white',
    buttonCode: 'bg-white border-4 border-navy text-navy hover:bg-yellow shadow-[4px_4px_0px_#0A1628] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_#0A1628]'
  },
  {
    name: 'Growth',
    hourly: '$10',
    price: '$160',
    period: '/month',
    desc: 'Our most popular plan with 16 sessions per month.',
    sessions: '16 sessions per month',
    features: [
      '16 live sessions per month',
      'Up to 3 subjects',
      'Full progress analytics',
      'Quiz & assignment access',
      'Session recordings (30-day)',
      'Interactive learning games',
      'Parent dashboard access',
    ],
    excluded: ['Exam prep modules', 'Dedicated tutor'],
    popular: true,
    color: 'bg-navy',
    buttonCode: 'bg-yellow border-4 border-navy text-navy hover:bg-yellow-light shadow-[6px_6px_0px_#0A1628] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_#0A1628]'
  },
  {
    name: 'Premium',
    hourly: '$12',
    price: '$240',
    period: '/month',
    desc: 'The complete Edvoura experience with 20 sessions per month.',
    sessions: '20 sessions per month',
    features: [
      '20 live sessions per month',
      'All subjects included',
      'WAEC, JAMB & NECO prep',
      'Dedicated personal tutor',
      'Unlimited session recordings',
      '24/7 priority support',
      'Certificates of completion',
    ],
    excluded: [],
    popular: false,
    color: 'bg-success',
    buttonCode: 'bg-white border-4 border-navy text-navy hover:bg-yellow shadow-[4px_4px_0px_#0A1628] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_#0A1628]'
  },
];

const faqs = [
  { q: 'Can I switch plans at any time?', a: 'Absolutely. You can upgrade or downgrade your plan at any time from your dashboard. Changes take effect at the start of your next billing cycle.' },
  { q: 'Is there a free trial?', a: 'We offer a free introductory session so you can experience Edvoura before committing. Sign up and book your first session at no cost.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major bank cards, bank transfers, and USSD via our secure Paystack integration. International cards (Stripe/PayPal) are also supported for global users.' },
  { q: 'Can I add multiple children to one account?', a: 'Yes! Parents can manage multiple children from a single parent account. Each child gets their own student dashboard and tutor assignments.' },
  { q: 'What happens if I miss a session?', a: 'Sessions can be rescheduled up to 2 hours before the scheduled time. Missed sessions without notice are deducted from your monthly allocation.' },
  { q: 'How are tutors vetted?', a: 'All tutors undergo a rigorous screening process including credential verification, background checks, demo teaching sessions, and ongoing performance reviews.' },
];

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-off-white selection:bg-yellow selection:text-navy font-body">
      <Navbar />

      {/* Hero (Parallax) */}
      <section 
        className="relative overflow-hidden border-b-8 border-navy bg-cover bg-center pb-36 sm:pb-44 md:pb-64 pt-[104px] sm:pt-[120px] md:pt-[148px]"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1427504494785-3a9a2753cd0e?q=80&w=2070&auto=format&fit=crop")' }}
      >
        <div className="absolute inset-0 bg-info/85 backdrop-blur-sm" />
        
        <div className="marketing-container relative z-10 pt-6 text-center w-full min-w-0">
          <div className="inline-block bg-yellow border-4 border-navy text-navy font-heading font-black px-6 py-2 rounded-xl mb-8 shadow-[4px_4px_0px_#0A1628] rotate-2 transition-transform hover:rotate-0 break-words max-w-full">
            GLOBAL PRICING
          </div>
          <h1 className="font-heading font-black text-white max-w-4xl mx-auto leading-[1.1] mb-8 drop-shadow-[4px_4px_0px_#0A1628] break-words" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
            Plans Built for Global Success
          </h1>
          <p className="text-navy text-base sm:text-xl max-w-2xl mx-auto font-bold bg-white/70 backdrop-blur-md p-4 sm:p-6 rounded-2xl border-4 border-navy shadow-[6px_6px_0px_#0A1628] transform -rotate-1 max-w-full break-words">
            Transparent, hourly-based global pricing. Choose the tier that matches your academic goals and start learning today.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative z-20 -mt-12 md:-mt-20 pb-24 border-b-8 border-navy bg-off-white">
        <div className="marketing-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 items-stretch">
            {plans.map((plan, i) => (
              <div
                key={plan.name}
                className={`rounded-[2rem] p-6 sm:p-8 md:p-10 transition-transform duration-300 relative border-4 border-navy shadow-[12px_12px_0px_#0A1628] max-w-full overflow-hidden ${
                  plan.popular 
                    ? 'bg-navy text-white md:scale-[1.03] z-10 -rotate-1' 
                    : `${plan.color} text-navy rotate-1`
                } hover:-translate-y-2`}
              >
                {plan.popular && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-yellow border-4 border-navy text-navy text-xs sm:text-sm font-black uppercase tracking-widest px-4 sm:px-6 py-2 rounded-xl flex items-center gap-2 shadow-[4px_4px_0px_#0A1628] rotate-3 max-w-[90%] text-center break-words">
                    <Star className="w-4 h-4 fill-navy shrink-0" /> Most Popular
                  </div>
                )}
                
                <h3 className="font-heading font-black text-3xl mb-4 break-words pt-4 sm:pt-0">{plan.name}</h3>
                <p className={`text-base sm:text-lg font-bold mb-8 ${plan.popular ? 'text-white/80' : 'text-navy/80'}`}>{plan.desc}</p>
                
                <div className="mb-10 bg-white/10 p-4 rounded-xl border-4 border-transparent break-words">
                  <span className={`text-4xl sm:text-5xl font-heading font-black tracking-tight ${plan.popular ? 'text-yellow' : 'text-navy'}`}>{plan.hourly}</span>
                  <span className={`text-lg sm:text-xl font-bold ml-1 ${plan.popular ? 'text-white/60' : 'text-navy/60'}`}>/ hour</span>
                </div>
                
                <Link
                  href="/signup"
                  className={`block text-center font-heading font-black py-4 rounded-xl transition-all text-lg sm:text-xl mb-10 w-full ${plan.buttonCode}`}
                >
                  Choose {plan.name}
                </Link>

                <div className="pt-8 border-t-4 border-white/20">
                  <p className={`text-sm font-black uppercase tracking-widest mb-6 ${plan.popular ? 'text-yellow' : 'text-navy'}`}>What&apos;s included</p>
                  <ul className="space-y-4">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-4 text-sm sm:text-base font-bold">
                        <CheckCircle2 className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 mt-0.5 ${plan.popular ? 'text-yellow' : 'text-success'}`} />
                        <span className={`break-words ${plan.popular ? 'text-white' : 'text-navy'}`}>{f}</span>
                      </li>
                    ))}
                    {plan.excluded.map((f) => (
                      <li key={f} className={`flex items-start gap-4 text-sm sm:text-base font-bold ${plan.popular ? 'opacity-40' : 'opacity-40'}`}>
                        <div className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 mt-0.5 rounded bg-black/10 flex items-center justify-center">
                           <div className="w-2 rounded-full h-0.5 bg-black/50" />
                        </div>
                        <span className="break-words">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Weekend Support Section */}
      <section className="bg-white py-24 border-b-8 border-navy relative overflow-hidden w-full">
        <div className="marketing-container w-full min-w-0">
          <div className="bg-error border-4 border-navy shadow-[10px_10px_0px_#0A1628] sm:shadow-[15px_15px_0px_#0A1628] rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-12 text-white relative overflow-hidden transform rotate-1 max-w-full">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
             <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
               <div className="max-w-2xl text-center md:text-left break-words w-full">
                  <h2 className="font-heading font-black text-3xl sm:text-4xl md:text-6xl mb-6 leading-tight drop-shadow-[4px_4px_0px_#0A1628] break-words">Weekends & Assignment Support</h2>
                  <p className="text-base sm:text-xl font-bold opacity-90 break-words">Specialized on-demand support for complex assignments and intensive weekend sessions.</p>
               </div>
               <div className="bg-white text-navy border-4 border-navy rounded-[2rem] p-6 sm:p-10 text-center shadow-[6px_6px_0px_#0A1628] sm:shadow-[10px_10px_0px_#0A1628] transform -rotate-2 hover:rotate-0 transition-transform cursor-default w-full md:w-auto">
                  <p className="text-xs sm:text-sm font-black uppercase tracking-widest mb-2">Hourly Rate</p>
                  <p className="text-5xl sm:text-6xl font-heading font-black">$20<span className="text-lg sm:text-xl"> /hr</span></p>
                  <Link href="/signup" className="mt-6 inline-flex items-center gap-2 bg-navy text-white font-heading font-black px-6 sm:px-8 py-3 rounded-xl hover:bg-info transition-colors">
                    Book Now <ArrowRight className="w-5 h-5" />
                  </Link>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-success py-24 md:py-32 border-b-8 border-navy relative w-full">
        <div className="absolute w-full h-[200%] top-0 left-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="marketing-container relative z-10 max-w-4xl w-full min-w-0">
          <div className="text-center mb-16 break-words w-full">
            <div className="inline-block bg-white border-4 border-navy text-navy font-heading font-black px-4 sm:px-6 py-2 rounded-xl mb-6 shadow-[4px_4px_0px_#0A1628] rotate-2 max-w-full break-words">
              QUESTIONS?
            </div>
            <h2 className="font-heading font-black text-white text-4xl sm:text-5xl md:text-6xl drop-shadow-[4px_4px_0px_#0A1628] break-words">
              Frequently Asked
            </h2>
          </div>

          <div className="space-y-6 w-full">
            {faqs.map((faq) => (
              <details key={faq.q} className="group bg-white border-4 border-navy shadow-[6px_6px_0px_#0A1628] rounded-2xl overflow-hidden transition-all hover:shadow-[8px_8px_0px_#0A1628] hover:-translate-y-1 w-full min-w-0">
                <summary className="flex items-center justify-between p-4 sm:p-6 md:p-8 cursor-pointer list-none w-full min-w-0">
                  <span className="font-heading font-black text-navy text-lg sm:text-xl pr-4 break-words">{faq.q}</span>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow rounded-xl flex items-center justify-center shrink-0 border-4 border-navy shadow-[2px_2px_0px_#0A1628] group-open:bg-navy group-open:border-navy group-open:text-white transition-colors">
                    <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-navy group-open:hidden shrink-0" />
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 hidden group-open:block group-open:rotate-90 transition-transform shrink-0" />
                  </div>
                </summary>
                <div className="px-4 sm:px-6 md:px-8 pb-6 sm:pb-8 text-navy text-base sm:text-lg font-bold leading-relaxed -mt-2 bg-off-white border-t-4 border-navy pt-6 shadow-[inset_0_4px_0_rgba(10,22,40,0.1)] break-words">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Solid Brutalist CTA */}
      <section className="bg-yellow relative py-24 md:py-32 overflow-hidden border-b-8 border-navy z-10 w-full">
        <div className="marketing-container relative z-10 max-w-4xl text-center w-full min-w-0">
          <h2 className="font-heading font-black text-navy text-4xl sm:text-5xl md:text-7xl mb-12 tracking-tight drop-shadow-[4px_4px_0px_#FFFFFF] sm:drop-shadow-[6px_6px_0px_#FFFFFF] transform rotate-[-2deg] break-words">
            STILL DECIDING?
          </h2>
          <Link
            href="/signup"
            className="inline-block bg-navy text-white font-heading font-black px-8 sm:px-16 py-4 sm:py-6 rounded-2xl border-4 border-white shadow-[8px_8px_0px_#0A1628] sm:shadow-[12px_12px_0px_#0A1628] hover:translate-x-2 hover:translate-y-2 hover:shadow-[4px_4px_0px_#0A1628] active:translate-x-3 active:translate-y-3 active:shadow-none transition-all text-xl sm:text-2xl transform rotate-2 w-full sm:w-auto max-w-full break-words"
          >
            BOOK FREE SESSION
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
