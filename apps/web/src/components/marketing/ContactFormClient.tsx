'use client';

import { useState } from 'react';
import { Send, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { EdvouraWelcomeConfirmationCard } from './EdvouraWelcomeConfirmationCard';

export default function ContactFormClient() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState('');
  const [websiteHoneypot, setWebsiteHoneypot] = useState(''); // Invisible honeypot trap for bots
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{ name: string; email: string; topic: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !fullName.trim()) return;

    setIsSubmitting(true);

    try {
      // Post to our unified inquiries API endpoint (triggers lead capture + instant client & admin emails)
      await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || null,
          subject: subject || 'General Inquiry',
          message: message.trim(),
          website: websiteHoneypot, // If filled by a bot, the API rejects it silently
        }),
      });
    } catch (err) {
      console.error('[CONTACT FORM SUBMISSION]', err);
    } finally {
      setIsSubmitting(false);
      setSubmittedData({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        topic: subject || 'General Inquiry',
      });
      setFullName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
      setWebsiteHoneypot('');
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
          {/* Honeypot field (hidden from human eyes; bots fill it automatically and get trapped) */}
          <div className="hidden" aria-hidden="true" style={{ display: 'none' }}>
            <label htmlFor="form_website_hp">Leave this empty</label>
            <input
              id="form_website_hp"
              type="text"
              name="website"
              value={websiteHoneypot}
              onChange={(e) => setWebsiteHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <label className="block text-xs sm:text-sm font-black text-navy uppercase tracking-widest mb-2 sm:mb-3">
                Phone / WhatsApp (Optional Backup)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 019 2831 or +44 20 7946 0912"
                className="w-full px-4 sm:px-6 py-4 sm:py-5 rounded-2xl border-4 border-navy bg-white text-navy text-sm sm:text-base font-bold focus:outline-none focus:translate-x-1 focus:translate-y-1 focus:shadow-[4px_4px_0px_#0A1628] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-black text-navy uppercase tracking-widest mb-2 sm:mb-3">
                Inquiry Topic / Grade
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 sm:px-6 py-4 sm:py-5 rounded-2xl border-4 border-navy bg-white text-navy text-sm sm:text-base font-bold focus:outline-none focus:translate-x-1 focus:translate-y-1 focus:shadow-[4px_4px_0px_#0A1628] transition-all"
              >
                <option value="">Select a topic or curriculum</option>
                <option value="Book Free 1-on-1 Trial Session">Book Free 1-on-1 Trial Session</option>
                <option value="British Curriculum & GCSE Tutoring">British Curriculum & GCSE Tutoring</option>
                <option value="US Common Core (Grades 1-12)">US Common Core (Grades 1-12)</option>
                <option value="Cambridge IGCSE & IB Mastery">Cambridge IGCSE & IB Mastery</option>
                <option value="WAEC, NECO & JAMB Exam Prep">WAEC, NECO & JAMB Exam Prep</option>
                <option value="Early Years / EYFS Preschool Program">Early Years / EYFS Preschool Program</option>
                <option value="Tutor Application & Onboarding">Tutor Application & Onboarding</option>
                <option value="Corporate / School Partnership">Corporate / School Partnership</option>
                <option value="Other Inquiries">Other Inquiries</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-black text-navy uppercase tracking-widest mb-2 sm:mb-3">
              Your Message or Student Needs
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us about your child's grade, learning goals, or preferred lesson schedule..."
              className="w-full px-4 sm:px-6 py-4 sm:py-5 rounded-2xl border-4 border-navy bg-white text-navy text-sm sm:text-base font-bold focus:outline-none focus:translate-x-1 focus:translate-y-1 focus:shadow-[4px_4px_0px_#0A1628] transition-all"
            />
          </div>

          <div className="text-center md:text-left">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-3 bg-navy text-white border-4 border-navy font-heading font-black px-8 sm:px-12 py-4 sm:py-5 rounded-2xl shadow-[6px_6px_0px_#F5C518] hover:translate-x-1 hover:translate-y-1 hover:shadow-[3px_3px_0px_#F5C518] active:translate-x-2 active:translate-y-2 active:shadow-none transition-all text-lg sm:text-xl disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Sending Inquiry...
                </>
              ) : (
                <>
                  Submit Inquiry <Send className="w-5 h-5 text-yellow" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
