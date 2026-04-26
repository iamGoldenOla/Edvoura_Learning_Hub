import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';
import { Mail, Phone, MapPin, Send, MessageSquare, Globe, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { siteContact } from '@/lib/site';

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
        
        <div className="marketing-container relative z-10 py-6 text-center">
          <div className="inline-block bg-white border-4 border-navy text-navy font-heading font-black px-6 py-2 rounded-xl mb-8 shadow-[4px_4px_0px_#0A1628] rotate-2 transition-transform hover:rotate-0">
            CONTACT US
          </div>
          <h1 className="font-heading font-black text-navy max-w-4xl mx-auto leading-[1.1] mb-8 drop-shadow-[4px_4px_0px_#FFFFFF]" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)' }}>
            We&apos;re Here to Support Your Journey
          </h1>
          <p className="text-navy text-xl max-w-3xl mx-auto font-bold bg-white/70 backdrop-blur-md p-6 rounded-2xl border-4 border-navy shadow-[6px_6px_0px_#0A1628] transform -rotate-1">
            Have a question about our global tutors or want to book a free introductory session? Our team typically responds within 24 hours.
          </p>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="bg-white py-24 md:py-32 border-b-8 border-navy relative">
        <div className="marketing-container">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">

            {/* Contact Info Cards */}
            <div className="lg:col-span-2 space-y-10">
              <div className="bg-navy rounded-[2.5rem] p-10 text-white border-8 border-navy-mid shadow-[15px_15px_0px_#F5C518] transform -rotate-1">
                <h3 className="font-heading font-black text-3xl mb-10 flex items-center gap-4">
                   <Globe className="w-8 h-8 text-yellow" /> Get in Touch
                </h3>
                <div className="space-y-8">
                  <div className="flex items-start gap-6 group cursor-pointer hover:translate-x-2 transition-transform">
                    <div className="w-14 h-14 bg-white border-4 border-yellow rounded-2xl flex items-center justify-center shrink-0 shadow-[4px_4px_0px_#F5C518] group-hover:rotate-12 transition-transform">
                      <Mail className="w-7 h-7 text-navy" />
                    </div>
                    <div>
                      <p className="text-xs text-yellow font-black uppercase tracking-widest mb-1">General Email</p>
                      <p className="text-xl text-white font-bold">{siteContact.email.info}</p>
                      <p className="mt-1 text-sm text-white/70 font-bold">Support: {siteContact.email.support}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-6 group cursor-pointer hover:translate-x-2 transition-transform">
                    <div className="w-14 h-14 bg-white border-4 border-yellow rounded-2xl flex items-center justify-center shrink-0 shadow-[4px_4px_0px_#F5C518] group-hover:-rotate-12 transition-transform">
                      <Phone className="w-7 h-7 text-navy" />
                    </div>
                    <div>
                      <p className="text-xs text-yellow font-black uppercase tracking-widest mb-1">Support Line</p>
                      <p className="text-xl text-white font-bold">{siteContact.phone.support}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-6 group cursor-pointer hover:translate-x-2 transition-transform">
                    <div className="w-14 h-14 bg-white border-4 border-yellow rounded-2xl flex items-center justify-center shrink-0 shadow-[4px_4px_0px_#F5C518] group-hover:rotate-12 transition-transform">
                      <MessageSquare className="w-7 h-7 text-navy" />
                    </div>
                    <div>
                      <p className="text-xs text-yellow font-black uppercase tracking-widest mb-1">WhatsApp</p>
                      <a
                        href={`https://wa.me/${siteContact.phone.whatsappIntl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xl text-white font-bold hover:text-yellow transition-colors"
                      >
                        {siteContact.phone.whatsapp}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-6 group cursor-pointer hover:translate-x-2 transition-transform">
                    <div className="w-14 h-14 bg-white border-4 border-yellow rounded-2xl flex items-center justify-center shrink-0 shadow-[4px_4px_0px_#F5C518] group-hover:-rotate-12 transition-transform">
                      <MapPin className="w-7 h-7 text-navy" />
                    </div>
                    <div>
                      <p className="text-xs text-yellow font-black uppercase tracking-widest mb-1">Address</p>
                      <p className="text-xl text-white font-bold">{siteContact.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Help Card */}
              <div className="bg-yellow border-4 border-navy rounded-[2.5rem] p-10 shadow-[10px_10px_0px_#0A1628] transform rotate-1">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-white border-4 border-navy rounded-xl flex items-center justify-center shadow-[4px_4px_0px_#0A1628]">
                    <HelpCircle className="w-6 h-6 text-navy" />
                  </div>
                  <h3 className="font-heading font-black text-2xl text-navy">Quick Resources</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    'How do I book a free session?',
                    'Supported curriculums (WAEC, AP, SAT)',
                    'Becoming a vetted Global Tutor',
                    'Parent dashboard setup'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 font-bold text-navy hover:translate-x-2 transition-transform cursor-pointer group">
                      <div className="w-6 h-6 rounded bg-navy text-white flex items-center justify-center text-[10px] font-black group-hover:bg-info">
                         {idx + 1}
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <div className="bg-off-white border-8 border-navy rounded-[2.5rem] p-8 md:p-14 shadow-[20px_20px_0px_#22C55E] -rotate-1">
                <div className="mb-10 text-center md:text-left">
                  <h2 className="font-heading font-black text-navy text-4xl mb-4">Send Us a Message</h2>
                  <p className="text-navy/60 text-lg font-bold">Fill out the form and our global team will be in touch shortly.</p>
                </div>

                <form className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-sm font-black text-navy uppercase tracking-widest mb-3">Full Name</label>
                      <input
                        type="text"
                        placeholder="Sarah Jenkins"
                        className="w-full px-6 py-5 rounded-2xl border-4 border-navy bg-white text-navy font-bold focus:outline-none focus:translate-x-1 focus:translate-y-1 focus:shadow-[4px_4px_0px_#0A1628] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-navy uppercase tracking-widest mb-3">Email Address</label>
                      <input
                        type="email"
                        placeholder="sarah@example.com"
                        className="w-full px-6 py-5 rounded-2xl border-4 border-navy bg-white text-navy font-bold focus:outline-none focus:translate-x-1 focus:translate-y-1 focus:shadow-[4px_4px_0px_#0A1628] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-black text-navy uppercase tracking-widest mb-3">Subject</label>
                    <select className="w-full px-6 py-5 rounded-2xl border-4 border-navy bg-white text-navy font-bold focus:outline-none focus:translate-x-1 focus:translate-y-1 focus:shadow-[4px_4px_0px_#0A1628] transition-all appearance-none cursor-pointer">
                      <option value="">Select a topic</option>
                      <option value="general">Book Free Introductory Session</option>
                      <option value="support">Academic Support Enquiry</option>
                      <option value="billing">Global Payments / Billing</option>
                      <option value="tutor">Become a Global Tutor</option>
                      <option value="partnership">School Partnerships</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-black text-navy uppercase tracking-widest mb-3">Message</label>
                    <textarea
                      rows={5}
                      placeholder="Tell us how we can help..."
                      className="w-full px-6 py-5 rounded-3xl border-4 border-navy bg-white text-navy font-bold focus:outline-none focus:translate-x-1 focus:translate-y-1 focus:shadow-[4px_4px_0px_#0A1628] transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="group w-full md:w-auto bg-navy text-white font-heading font-black px-16 py-6 rounded-2xl border-4 border-navy shadow-[10px_10px_0px_#22C55E] hover:translate-x-1 hover:translate-y-1 hover:shadow-[5px_5px_0px_#22C55E] active:translate-x-2 active:translate-y-2 active:shadow-none transition-all text-2xl flex items-center justify-center gap-4"
                  >
                    SEND MESSAGE <Send className="w-6 h-6 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
                  </button>
                </form>
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
