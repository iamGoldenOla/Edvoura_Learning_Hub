import { Metadata } from 'next';
import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';
import { Mail, Phone, MapPin, Send, MessageSquare, Globe, HelpCircle, Briefcase, CreditCard, LifeBuoy, Info } from 'lucide-react';
import Link from 'next/link';
import { siteContact } from '@/lib/site';
import ContactFormClient from '@/components/marketing/ContactFormClient';

export const metadata: Metadata = {
  title: 'Contact Us | Support & Tutor Inquiries',
  description:
    'Get in touch with the Edvoura team. Inquire about student enrollment, tutor applications, partnership opportunities, or technical support.',
  openGraph: {
    title: 'Contact Us | Edvoura Learning Hub',
    description:
      'Contact our support team or learn how to join as a certified tutor on Edvoura.',
  },
};

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-off-white selection:bg-yellow selection:text-navy font-body">
      <Navbar />

      {/* Hero (Parallax + Brutalist) */}
      <section 
        className="relative overflow-hidden border-b-8 border-navy bg-cover bg-center pb-16 pt-[104px] sm:pb-20 sm:pt-[120px] md:pb-28 md:pt-[150px] z-10"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop")' }}
      >
        <div className="absolute inset-0 bg-success/85 backdrop-blur-sm" />
        
        <div className="marketing-container relative z-10 py-6 text-center w-full min-w-0">
          <div className="inline-block bg-white border-4 border-navy text-navy font-heading font-black px-4 sm:px-6 py-2 rounded-xl mb-8 shadow-[4px_4px_0px_#0A1628] rotate-2 transition-transform hover:rotate-0 max-w-full break-words">
            CONTACT US
          </div>
          <h1 className="font-heading font-black text-navy max-w-4xl mx-auto leading-[1.1] mb-8 drop-shadow-[4px_4px_0px_#FFFFFF] break-words" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
            We&apos;re Here to Support Your Journey
          </h1>
          <p className="text-navy text-base sm:text-xl max-w-3xl mx-auto font-bold bg-white/70 backdrop-blur-md p-4 sm:p-6 rounded-2xl border-4 border-navy shadow-[6px_6px_0px_#0A1628] transform -rotate-1 max-w-full break-words">
            Have a question about our global tutors or want to book a free introductory session? Our team typically responds within 24 hours.
          </p>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="bg-white py-24 md:py-32 border-b-8 border-navy relative w-full">
        <div className="marketing-container w-full min-w-0">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-stretch">

            {/* Contact Info Cards */}
            <div className="lg:col-span-2 space-y-10 w-full min-w-0">
              <div className="bg-navy rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 text-white border-4 sm:border-8 border-navy-mid shadow-[8px_8px_0px_#F5C518] sm:shadow-[15px_15px_0px_#F5C518] transform -rotate-1 max-w-full min-w-0">
                <h3 className="font-heading font-black text-2xl sm:text-3xl mb-8 sm:mb-10 flex items-center gap-4 break-words">
                   <Globe className="w-8 h-8 text-yellow shrink-0" /> Official Email Directory
                </h3>
                <div className="space-y-6 w-full min-w-0">
                  {/* General Inquiries */}
                  <a
                    href={`mailto:${siteContact.email.info}?subject=General%20Inquiry%20-%20Edvoura`}
                    className="flex items-start gap-4 sm:gap-5 group hover:translate-x-1.5 transition-transform w-full min-w-0 bg-white/5 hover:bg-white/10 p-3.5 sm:p-4 rounded-2xl border-2 border-white/10"
                  >
                    <div className="w-11 h-11 sm:w-12 sm:h-12 bg-white border-2 border-yellow rounded-xl flex items-center justify-center shrink-0 shadow-[3px_3px_0px_#F5C518] group-hover:rotate-6 transition-transform">
                      <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-navy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[10px] sm:text-xs text-yellow font-black uppercase tracking-widest">General Inquiries</p>
                        <span className="text-[9px] bg-yellow/20 text-yellow px-1.5 py-0.5 rounded font-black">Admissions</span>
                      </div>
                      <p className="text-sm sm:text-base text-white font-bold break-all group-hover:text-yellow transition-colors">{siteContact.email.info}</p>
                      <p className="text-[11px] text-white/60 font-medium">Information, curriculum questions & free trials</p>
                    </div>
                  </a>

                  {/* Careers / Tutors */}
                  <a
                    href={`mailto:${siteContact.email.careers}?subject=Tutor%20Application%20Inquiry`}
                    className="flex items-start gap-4 sm:gap-5 group hover:translate-x-1.5 transition-transform w-full min-w-0 bg-white/5 hover:bg-white/10 p-3.5 sm:p-4 rounded-2xl border-2 border-white/10"
                  >
                    <div className="w-11 h-11 sm:w-12 sm:h-12 bg-white border-2 border-emerald-400 rounded-xl flex items-center justify-center shrink-0 shadow-[3px_3px_0px_#22C55E] group-hover:-rotate-6 transition-transform">
                      <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-navy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[10px] sm:text-xs text-emerald-400 font-black uppercase tracking-widest">Careers & Tutors</p>
                        <span className="text-[9px] bg-emerald-400/20 text-emerald-300 px-1.5 py-0.5 rounded font-black">Join Team</span>
                      </div>
                      <p className="text-sm sm:text-base text-white font-bold break-all group-hover:text-emerald-300 transition-colors">{siteContact.email.careers}</p>
                      <p className="text-[11px] text-white/60 font-medium">Tutor onboarding, CV submissions & educator roles</p>
                    </div>
                  </a>

                  {/* Support */}
                  <a
                    href={`mailto:${siteContact.email.support}?subject=Support%20Request`}
                    className="flex items-start gap-4 sm:gap-5 group hover:translate-x-1.5 transition-transform w-full min-w-0 bg-white/5 hover:bg-white/10 p-3.5 sm:p-4 rounded-2xl border-2 border-white/10"
                  >
                    <div className="w-11 h-11 sm:w-12 sm:h-12 bg-white border-2 border-sky-400 rounded-xl flex items-center justify-center shrink-0 shadow-[3px_3px_0px_#38BDF8] group-hover:rotate-6 transition-transform">
                      <LifeBuoy className="w-5 h-5 sm:w-6 sm:h-6 text-navy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[10px] sm:text-xs text-sky-400 font-black uppercase tracking-widest">Customer Support</p>
                        <span className="text-[9px] bg-sky-400/20 text-sky-300 px-1.5 py-0.5 rounded font-black">24/7 Help</span>
                      </div>
                      <p className="text-sm sm:text-base text-white font-bold break-all group-hover:text-sky-300 transition-colors">{siteContact.email.support}</p>
                      <p className="text-[11px] text-white/60 font-medium">Platform help, student accounts & technical issues</p>
                    </div>
                  </a>

                  {/* Payment */}
                  <a
                    href={`mailto:${siteContact.email.payment}?subject=Payment%20Confirmation%20Receipt`}
                    className="flex items-start gap-4 sm:gap-5 group hover:translate-x-1.5 transition-transform w-full min-w-0 bg-white/5 hover:bg-white/10 p-3.5 sm:p-4 rounded-2xl border-2 border-white/10"
                  >
                    <div className="w-11 h-11 sm:w-12 sm:h-12 bg-white border-2 border-amber-400 rounded-xl flex items-center justify-center shrink-0 shadow-[3px_3px_0px_#F59E0B] group-hover:-rotate-6 transition-transform">
                      <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-navy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[10px] sm:text-xs text-amber-400 font-black uppercase tracking-widest">Billing & Payments</p>
                        <span className="text-[9px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded font-black">Proof of Payment</span>
                      </div>
                      <p className="text-sm sm:text-base text-white font-bold break-all group-hover:text-amber-300 transition-colors">{siteContact.email.payment}</p>
                      <p className="text-[11px] text-white/60 font-medium">Send transfer screenshots, receipts & invoice queries</p>
                    </div>
                  </a>

                  {/* Phone, WhatsApp & Telegram */}
                  <div className="pt-4 border-t border-white/10 space-y-4">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-yellow shrink-0" />
                      <div className="text-xs">
                        <span className="text-white/60 font-bold">Call / Support: </span>
                        <a href={`tel:${siteContact.phone.support}`} className="text-white font-bold hover:text-yellow transition-colors">{siteContact.phone.support}</a>
                        <span className="text-white/40 mx-1.5">•</span>
                        <a href={`tel:${siteContact.phone.secondary}`} className="text-white font-bold hover:text-yellow transition-colors">{siteContact.phone.secondary}</a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div className="text-xs">
                        <span className="text-white/60 font-bold">WhatsApp: </span>
                        <a href={`https://wa.me/${siteContact.phone.whatsappIntl}`} target="_blank" rel="noreferrer" className="text-white font-bold hover:text-emerald-300 transition-colors">{siteContact.phone.whatsapp}</a>
                        <span className="text-white/40 mx-1.5">•</span>
                        <a href={`https://wa.me/${siteContact.phone.whatsappSecondaryIntl}`} target="_blank" rel="noreferrer" className="text-white font-bold hover:text-emerald-300 transition-colors">{siteContact.phone.secondary}</a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Send className="w-5 h-5 text-sky-400 shrink-0" />
                      <div className="text-xs">
                        <span className="text-white/60 font-bold">Telegram: </span>
                        <a href={siteContact.phone.telegramUrl} target="_blank" rel="noreferrer" className="text-white font-bold hover:text-sky-300 transition-colors">{siteContact.phone.telegram}</a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-white/50 shrink-0" />
                      <p className="text-xs text-white/60 font-bold">{siteContact.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Help Card */}
              <div className="bg-yellow border-4 border-navy rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-[8px_8px_0px_#0A1628] sm:shadow-[10px_10px_0px_#0A1628] transform rotate-1 max-w-full min-w-0">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white border-4 border-navy rounded-xl flex items-center justify-center shadow-[4px_4px_0px_#0A1628] shrink-0">
                    <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-navy" />
                  </div>
                  <h3 className="font-heading font-black text-xl sm:text-2xl text-navy break-words">Quick Resources</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    'How do I book a free session?',
                    'Supported curriculums (WAEC, AP, SAT)',
                    'Becoming a vetted Global Tutor',
                    'Parent dashboard setup'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 font-bold text-navy hover:translate-x-2 transition-transform cursor-pointer group">
                      <div className="w-6 h-6 rounded bg-navy text-white flex items-center justify-center text-[10px] font-black group-hover:bg-info shrink-0 mt-0.5">
                         {idx + 1}
                      </div>
                      <span className="break-words leading-tight">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3 w-full min-w-0">
              <div className="bg-off-white border-4 sm:border-8 border-navy rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 md:p-14 shadow-[10px_10px_0px_#22C55E] sm:shadow-[20px_20px_0px_#22C55E] -rotate-1 max-w-full min-w-0 overflow-hidden">
                <div className="mb-8 sm:mb-10 text-center md:text-left">
                  <h2 className="font-heading font-black text-navy text-3xl sm:text-4xl mb-4 break-words">Send Us a Message</h2>
                  <p className="text-navy/60 text-base sm:text-lg font-bold break-words">Fill out the form and our global team will be in touch shortly.</p>
                </div>

                <ContactFormClient />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Solid Brutalist CTA */}
      <section className="bg-yellow relative py-24 md:py-32 overflow-hidden border-b-8 border-navy z-10">
        <div className="marketing-container relative z-10 max-w-4xl text-center">
          <h2 className="font-heading font-black text-navy text-5xl md:text-7xl mb-12 tracking-tight drop-shadow-[6px_6px_0px_#FFFFFF] transform rotate-[-2deg]">
             READY TO ACING IT?
          </h2>
          <Link
            href="/signup"
            className="inline-block bg-navy text-white font-heading font-black px-16 py-6 rounded-2xl border-4 border-white shadow-[12px_12px_0px_#0A1628] hover:translate-x-2 hover:translate-y-2 hover:shadow-[4px_4px_0px_#0A1628] active:translate-x-3 active:translate-y-3 active:shadow-none transition-all text-2xl transform rotate-2 w-full sm:w-auto"
          >
            JOIN EDVOURA NOW
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
