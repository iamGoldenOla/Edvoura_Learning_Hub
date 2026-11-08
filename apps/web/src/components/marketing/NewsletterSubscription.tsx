'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle2, ArrowRight, Loader2, Sparkles } from 'lucide-react';

interface NewsletterSubscriptionProps {
  variant?: 'footer' | 'card' | 'inline';
  source?: string;
  title?: string;
  subtitle?: string;
}

export default function NewsletterSubscription({
  variant = 'footer',
  source = 'Website Footer',
  title = 'Stay Ahead with the Edvoura Dispatch',
  subtitle = 'Get weekly international exam strategies, pedagogy tips, and curriculum breakthroughs delivered directly to your inbox.',
}: NewsletterSubscriptionProps) {
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          source,
          website: honeypot,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Subscription failed. Please try again.');
      }

      setSuccessMsg(data.message || "🎉 You're subscribed! Check your inbox.");
      setEmail('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'card') {
    return (
      <div className="rounded-3xl border-4 border-navy bg-yellow p-8 sm:p-12 shadow-[10px_10px_0px_#0A1628] text-navy">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-navy bg-white px-3 py-1 text-xs font-black uppercase tracking-wider text-navy shadow-[2px_2px_0px_#0A1628] mb-4">
            <Sparkles className="w-3.5 h-3.5 text-navy" /> FREE WEEKLY DISPATCH
          </span>
          <h3 className="font-heading font-black text-3xl sm:text-4xl text-navy tracking-tight mb-3">
            {title}
          </h3>
          <p className="text-navy/80 font-bold text-sm sm:text-base max-w-xl mx-auto mb-8">
            {subtitle}
          </p>

          {successMsg ? (
            <div className="inline-flex items-center gap-2 rounded-2xl border-3 border-navy bg-white px-6 py-4 shadow-[4px_4px_0px_#0A1628] text-navy font-black text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3">
              {/* Honeypot field */}
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
              />

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy/40" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    disabled={loading}
                    className="w-full rounded-xl border-3 border-navy bg-white pl-12 pr-4 py-3.5 text-sm font-bold text-navy placeholder:text-navy/40 shadow-[4px_4px_0px_#0A1628] focus:outline-none focus:ring-2 focus:ring-navy"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl border-3 border-navy bg-navy text-white px-6 py-3.5 font-heading font-black text-xs uppercase tracking-wider shadow-[4px_4px_0px_#FFFFFF] hover:bg-navy/90 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#FFFFFF] transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Subscribing...</span>
                    </>
                  ) : (
                    <>
                      <span>Subscribe</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {errorMsg && (
                <p className="text-xs font-black text-red-700 bg-red-100 rounded-lg p-2 border border-red-300">
                  {errorMsg}
                </p>
              )}

              <p className="text-[11px] font-bold text-navy/60">
                🔒 Zero spam. Unsubscribe with 1-click anytime.
              </p>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Footer Variant (Default)
  return (
    <div className="rounded-2xl border-2 border-white/20 bg-white/5 p-5 sm:p-6 backdrop-blur-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow animate-ping" />
            <h4 className="font-heading font-black text-base sm:text-lg text-white tracking-tight uppercase">
              Join the Edvoura Dispatch
            </h4>
          </div>
          <p className="text-xs font-medium text-white/70 leading-relaxed">
            Weekly global curriculum insights, past paper tactics (WAEC, JAMB, IGCSE, SAT), and learning tools for parents and educators.
          </p>
        </div>

        <div className="w-full lg:max-w-md">
          {successMsg ? (
            <div className="flex items-center gap-2.5 rounded-xl border-2 border-yellow bg-yellow/15 p-3 text-yellow text-xs font-black">
              <CheckCircle2 className="w-4 h-4 text-yellow shrink-0" />
              <span>{successMsg}</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-2">
              {/* Honeypot field */}
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
              />

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    disabled={loading}
                    className="w-full rounded-xl border-2 border-white/20 bg-navy/80 pl-10 pr-3 py-2.5 text-xs font-bold text-white placeholder:text-white/40 focus:border-yellow focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl border-2 border-navy bg-yellow text-navy px-5 py-2.5 font-heading font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_#000] hover:bg-yellow-light hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Joining...</span>
                    </>
                  ) : (
                    <>
                      <span>Subscribe</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              {errorMsg && (
                <p className="text-[11px] font-bold text-red-300">
                  {errorMsg}
                </p>
              )}

              <p className="text-[10px] text-white/50 font-medium">
                No spam ever. You can unsubscribe at any time.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
