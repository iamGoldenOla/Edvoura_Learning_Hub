import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="bg-navy pt-[72px] relative overflow-hidden">
        <div className="hero-grid-overlay absolute inset-0 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6 md:px-8 py-20 md:py-24 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-yellow-dim mb-4">Contact</p>
          <h1 className="font-heading font-extrabold text-white max-w-3xl mx-auto leading-tight" style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)' }}>
            We&apos;d Love to Hear From You
          </h1>
          <p className="mt-6 text-grey text-base max-w-xl mx-auto">
            Have a question, feedback, or partnership inquiry? Our team typically responds within 24 hours.
          </p>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="bg-off-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* Contact Info Cards */}
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-navy rounded-2xl p-8 text-white">
                <h3 className="font-heading font-bold text-lg mb-6">Get in Touch</h3>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-navy-mid rounded-xl flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-yellow" />
                    </div>
                    <div>
                      <p className="text-xs text-grey font-bold uppercase tracking-widest mb-1">Email</p>
                      <p className="text-sm text-white/80">hello@edvouralearninghub.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-navy-mid rounded-xl flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-yellow" />
                    </div>
                    <div>
                      <p className="text-xs text-grey font-bold uppercase tracking-widest mb-1">Phone</p>
                      <p className="text-sm text-white/80">+234 (0) 801 234 5678</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-navy-mid rounded-xl flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-yellow" />
                    </div>
                    <div>
                      <p className="text-xs text-grey font-bold uppercase tracking-widest mb-1">Office</p>
                      <p className="text-sm text-white/80">Lagos, Nigeria</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-navy-mid rounded-xl flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-yellow" />
                    </div>
                    <div>
                      <p className="text-xs text-grey font-bold uppercase tracking-widest mb-1">Hours</p>
                      <p className="text-sm text-white/80">Mon – Fri, 8am – 6pm WAT</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-grey-light rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare className="w-5 h-5 text-yellow" />
                  <h3 className="font-heading font-bold text-navy">Quick Help</h3>
                </div>
                <ul className="space-y-3 text-sm text-grey">
                  <li className="hover:text-yellow cursor-pointer transition-colors">→ How do I reset my password?</li>
                  <li className="hover:text-yellow cursor-pointer transition-colors">→ How do I cancel my subscription?</li>
                  <li className="hover:text-yellow cursor-pointer transition-colors">→ How do I become a tutor?</li>
                  <li className="hover:text-yellow cursor-pointer transition-colors">→ How do I add another child?</li>
                </ul>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <div className="bg-white border border-grey-light rounded-2xl p-8 md:p-10">
                <h2 className="font-heading font-extrabold text-navy text-2xl mb-2">Send Us a Message</h2>
                <p className="text-grey text-sm mb-8">Fill out the form below and we&apos;ll get back to you as soon as possible.</p>

                {/* TODO: Wire to API endpoint or Supabase function */}
                <form className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-navy mb-1.5">Full Name</label>
                      <input
                        type="text"
                        placeholder="Your full name"
                        className="w-full px-4 py-3 rounded-xl border border-grey-light bg-off-white text-navy text-sm focus:outline-none focus:border-yellow focus:ring-2 focus:ring-yellow/20 transition-all placeholder:text-grey"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-navy mb-1.5">Email Address</label>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 rounded-xl border border-grey-light bg-off-white text-navy text-sm focus:outline-none focus:border-yellow focus:ring-2 focus:ring-yellow/20 transition-all placeholder:text-grey"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-navy mb-1.5">Subject</label>
                    <select className="w-full px-4 py-3 rounded-xl border border-grey-light bg-off-white text-navy text-sm focus:outline-none focus:border-yellow focus:ring-2 focus:ring-yellow/20 transition-all">
                      <option value="">Select a topic</option>
                      <option value="general">General Enquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="billing">Billing & Payments</option>
                      <option value="tutor">Become a Tutor</option>
                      <option value="partnership">Partnership / Business</option>
                      <option value="feedback">Feedback</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-navy mb-1.5">Message</label>
                    <textarea
                      rows={5}
                      placeholder="Tell us how we can help..."
                      className="w-full px-4 py-3 rounded-xl border border-grey-light bg-off-white text-navy text-sm focus:outline-none focus:border-yellow focus:ring-2 focus:ring-yellow/20 transition-all placeholder:text-grey resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full md:w-auto bg-yellow hover:bg-yellow-light text-navy font-heading font-bold px-10 py-3.5 rounded-xl transition-colors text-sm inline-flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" /> Send Message
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
