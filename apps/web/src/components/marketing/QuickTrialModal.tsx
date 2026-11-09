'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, MessageSquare, Sparkles, Send, ArrowRight, Phone } from 'lucide-react';
import { siteContact } from '@/lib/site';

interface QuickTrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultGrade?: string;
  defaultSubject?: string;
}

type PreferredApp = 'whatsapp' | 'telegram';

export default function QuickTrialModal({
  isOpen,
  onClose,
  defaultGrade = 'Grade 3',
  defaultSubject = 'Primary Mathematics',
}: QuickTrialModalProps) {
  const [parentName, setParentName] = useState('');
  const [contactHandle, setContactHandle] = useState('');
  const [preferredApp, setPreferredApp] = useState<PreferredApp>('whatsapp');
  const [grade, setGrade] = useState(defaultGrade);
  const [subject, setSubject] = useState(defaultSubject);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentName.trim() || !contactHandle.trim()) return;

    setIsSubmitting(true);

    try {
      // 1. Log inquiry to backend API
      await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: parentName,
          phone: contactHandle,
          email: `${parentName.toLowerCase().replace(/[^a-z0-9]/g, '')}@lead.edvoura.com`,
          role: 'parent',
          grade,
          subject,
          preferredApp,
          source: 'quick_trial_modal',
        }),
      }).catch(() => null);

      setIsSubmitted(true);

      const messageText = `Hello Edvoura Learning Hub! 👋\n\nI'm ${parentName}. I would like to book a free 1-on-1 trial session for my child.\n\n📚 Grade: ${grade}\n🎯 Focus: ${subject}\n📱 Contact: ${contactHandle}`;

      // 2. Open chosen platform after short delay
      setTimeout(() => {
        if (preferredApp === 'telegram') {
          window.open(
            `https://t.me/edvouralearninghub?text=${encodeURIComponent(messageText)}`,
            '_blank'
          );
        } else {
          window.open(
            `https://wa.me/${siteContact.phone.whatsappIntl}?text=${encodeURIComponent(messageText)}`,
            '_blank'
          );
        }
      }, 700);
    } catch {
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const encodedMessage = encodeURIComponent(
    `Hello Edvoura! I'm ${parentName}. Requesting a free trial for my child in ${grade} for ${subject}.`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-off-white border-4 border-navy rounded-[2rem] p-6 sm:p-8 shadow-[10px_10px_0px_#F5C518] text-navy animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 rounded-xl bg-white border-2 border-navy flex items-center justify-center hover:bg-yellow transition-colors shadow-[2px_2px_0px_#0A1628]"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 text-navy" />
        </button>

        {!isSubmitted ? (
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg border-2 border-navy bg-yellow px-3 py-1 text-xs font-black uppercase tracking-wider mb-3 shadow-[2px_2px_0px_#0A1628]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Zero Risk &bull; International &amp; Global</span>
            </div>

            <h3 className="font-heading font-black text-2xl sm:text-3xl text-navy mb-1.5">
              Book a Free 1-on-1 Trial Session
            </h3>
            <p className="text-xs sm:text-sm font-bold text-navy/70 mb-5 leading-relaxed">
              Connect directly with an educator matched to your child&apos;s grade and exact school syllabus.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Preferred Platform Selector */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-navy mb-1.5">
                  How would you prefer to connect?
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPreferredApp('whatsapp')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 border-navy text-xs font-black uppercase tracking-wider transition-all ${
                      preferredApp === 'whatsapp'
                        ? 'bg-emerald-500 text-white shadow-[3px_3px_0px_#0A1628]'
                        : 'bg-white text-navy/70 hover:bg-emerald-50'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreferredApp('telegram')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 border-navy text-xs font-black uppercase tracking-wider transition-all ${
                      preferredApp === 'telegram'
                        ? 'bg-sky-500 text-white shadow-[3px_3px_0px_#0A1628]'
                        : 'bg-white text-navy/70 hover:bg-sky-50'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    <span>Telegram</span>
                  </button>
                </div>
              </div>

              {/* Parent Name */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-navy mb-1">
                  Parent&apos;s Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mrs. Lawson / Elena / Mr. Agbagwa"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-navy bg-white text-navy font-bold text-sm focus:outline-none focus:ring-2 focus:ring-yellow shadow-[2px_2px_0px_#0A1628]"
                />
              </div>

              {/* Contact Handle */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-navy mb-1">
                  {preferredApp === 'telegram'
                    ? 'Telegram Username or Phone Number'
                    : 'WhatsApp / Phone Number'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    preferredApp === 'telegram'
                      ? 'e.g. @username or +998 90... / +234...'
                      : 'e.g. +234 906 813 3874 or +44 7...'
                  }
                  value={contactHandle}
                  onChange={(e) => setContactHandle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-navy bg-white text-navy font-bold text-sm focus:outline-none focus:ring-2 focus:ring-yellow shadow-[2px_2px_0px_#0A1628]"
                />
              </div>

              {/* Grade and Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-navy mb-1">
                    Child&apos;s Grade
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-navy bg-white text-navy font-bold text-sm focus:outline-none focus:ring-2 focus:ring-yellow shadow-[2px_2px_0px_#0A1628]"
                  >
                    <option value="Grade 1 / Primary 1">Grade 1 / Primary 1</option>
                    <option value="Grade 2 / Primary 2">Grade 2 / Primary 2</option>
                    <option value="Grade 3 / Primary 3">Grade 3 / Primary 3</option>
                    <option value="Grade 4 / Primary 4">Grade 4 / Primary 4 (UK Year 5)</option>
                    <option value="Grade 5 / Primary 5">Grade 5 / Primary 5</option>
                    <option value="Grade 6 / Primary 6">Grade 6 / Primary 6</option>
                    <option value="Secondary / 11+ Prep">Secondary / 11+ Prep</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-navy mb-1">
                    Subject Focus
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-navy bg-white text-navy font-bold text-sm focus:outline-none focus:ring-2 focus:ring-yellow shadow-[2px_2px_0px_#0A1628]"
                  >
                    <option value="Primary Mathematics & Mental Math">Primary Mathematics</option>
                    <option value="English Literacy & Phonics">English Literacy &amp; Phonics</option>
                    <option value="Focused 1-Hour Homework Help">Focused 1-Hr Homework Help</option>
                    <option value="School Syllabus & Textbook Help">School Syllabus &amp; Curriculum</option>
                    <option value="Cambridge Checkpoint / 11+ Prep">Cambridge Checkpoint / 11+</option>
                    <option value="Both Math & English">Both Math &amp; English</option>
                  </select>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full mt-2 py-3.5 px-6 rounded-2xl border-4 border-navy font-heading font-black text-sm sm:text-base uppercase tracking-wider shadow-[4px_4px_0px_#0A1628] hover:-translate-y-0.5 transition-transform flex items-center justify-center gap-2 ${
                  preferredApp === 'telegram'
                    ? 'bg-sky-400 hover:bg-sky-300 text-navy'
                    : 'bg-yellow hover:bg-yellow/90 text-navy'
                }`}
              >
                {isSubmitting ? (
                  <span>Connecting to Educator...</span>
                ) : (
                  <>
                    <span>
                      Confirm on {preferredApp === 'telegram' ? 'Telegram' : 'WhatsApp'}
                    </span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 border-4 border-navy flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_#0A1628]">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="font-heading font-black text-2xl text-navy mb-2">
              Free Trial Request Received!
            </h3>
            <p className="text-sm font-bold text-navy/70 max-w-sm mx-auto mb-6">
              Opening {preferredApp === 'telegram' ? 'Telegram' : 'WhatsApp'} now. You can also tap either button below to chat immediately:
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={`https://wa.me/${siteContact.phone.whatsappIntl}?text=${encodedMessage}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border-3 border-navy bg-emerald-500 text-white px-5 py-3 font-heading font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_#0A1628] hover:bg-emerald-600 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>

              <a
                href={`https://t.me/edvouralearninghub?text=${encodedMessage}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border-3 border-navy bg-sky-500 text-white px-5 py-3 font-heading font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_#0A1628] hover:bg-sky-600 transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Chat on Telegram</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
