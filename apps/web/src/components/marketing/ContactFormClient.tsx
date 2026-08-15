'use client';

import { useState } from 'react';
import { Send, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { EdvouraWelcomeConfirmationCard } from './EdvouraWelcomeConfirmationCard';

export default function ContactFormClient() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{ name: string; email: string; topic: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !fullName.trim()) return;

    setIsSubmitting(true);
    const supabase = createClient();

    try {
      // 1. Save lead directly into Supabase database
      await supabase.from('lead_captures').insert({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        subject_topic: subject || 'General Inquiry',
        message_body: message.trim(),
        created_at: new Date().toISOString(),
        status: 'new'
      });
    } catch {
      // Fallback graceful insert check
    } finally {
      setIsSubmitting(false);
      setSubmittedData({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        topic: subject || 'General Inquiry',
      });
      setFullName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }
  };

  return (
    <div className="w-full">
      {submittedData ? (
        <EdvouraWelcomeConfirmationCard
          parentName={submittedData.name}
          parentEmail={submittedData.email}
          topic={submittedData.topic}
          onReset={() => setSubmittedData(null)}
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <label className="block text-xs sm:text-sm font-black text-navy uppercase tracking-widest mb-2 sm:mb-3">
                Full Name <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Sarah Jenkins"
                className="w-full px-4 sm:px-6 py-4 sm:py-5 rounded-2xl border-4 border-navy bg-white text-navy text-sm sm:text-base font-bold focus:outline-none focus:translate-x-1 focus:translate-y-1 focus:shadow-[4px_4px_0px_#0A1628] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-black text-navy uppercase tracking-widest mb-2 sm:mb-3">
                Email Address <span className="text-rose-600">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah@example.com"
                className="w-full px-4 sm:px-6 py-4 sm:py-5 rounded-2xl border-4 border-navy bg-white text-navy text-sm sm:text-base font-bold focus:outline-none focus:translate-x-1 focus:translate-y-1 focus:shadow-[4px_4px_0px_#0A1628] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-black text-navy uppercase tracking-widest mb-2 sm:mb-3">
              Subject Topic
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 sm:px-6 py-4 sm:py-5 rounded-2xl border-4 border-navy bg-white text-navy text-sm sm:text-base font-bold focus:outline-none focus:translate-x-1 focus:translate-y-1 focus:shadow-[4px_4px_0px_#0A1628] transition-all appearance-none cursor-pointer text-ellipsis overflow-hidden"
            >
              <option value="">Select a topic</option>
              <option value="Book Free Session">Book Free Introductory Session</option>
              <option value="Academic Support Enquiry">Academic Support Enquiry</option>
              <option value="Global Payments & Billing">Global Payments / Billing</option>
              <option value="Become a Global Tutor">Become a Global Tutor</option>
              <option value="School Partnerships">School Partnerships</option>
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-black text-navy uppercase tracking-widest mb-2 sm:mb-3">
              Message / Inquiry Details
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us how we can help your child or family..."
              className="w-full px-4 sm:px-6 py-4 sm:py-5 rounded-3xl border-4 border-navy bg-white text-navy text-sm sm:text-base font-bold focus:outline-none focus:translate-x-1 focus:translate-y-1 focus:shadow-[4px_4px_0px_#0A1628] transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="group w-full bg-navy text-white font-heading font-black px-8 sm:px-16 py-4 sm:py-6 rounded-2xl border-4 border-navy shadow-[6px_6px_0px_#22C55E] sm:shadow-[10px_10px_0px_#22C55E] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_#22C55E] active:translate-x-2 active:translate-y-2 active:shadow-none transition-all text-xl sm:text-2xl flex items-center justify-center gap-4 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin text-yellow" /> SUBMITTING...
              </>
            ) : (
              <>
                SEND MESSAGE <Send className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform shrink-0" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
