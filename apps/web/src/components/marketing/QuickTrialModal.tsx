'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, MessageSquare, Sparkles, Send, ArrowRight } from 'lucide-react';
import { siteContact } from '@/lib/site';

interface QuickTrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultGrade?: string;
  defaultSubject?: string;
}

export default function QuickTrialModal({
  isOpen,
  onClose,
  defaultGrade = 'Grade 3',
  defaultSubject = 'Primary Mathematics',
}: QuickTrialModalProps) {
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');
  const [grade, setGrade] = useState(defaultGrade);
  const [subject, setSubject] = useState(defaultSubject);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentName.trim() || !phone.trim()) return;

    setIsSubmitting(true);

    try {
      // 1. Log inquiry to backend API
      await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: parentName,
          phone,
          email: `${parentName.toLowerCase().replace(/\s+/g, '')}@lead.edvoura.com`,
          role: 'parent',
          grade,
          subject,
          source: 'quick_trial_modal',
        }),
      }).catch(() => null);

      setIsSubmitted(true);

      // 2. Format prefilled WhatsApp message
      const text = encodeURIComponent(
        `Hello Edvoura Learning Hub! 👋\n\nI'm ${parentName}. I would like to book a free 1-on-1 trial session for my child.\n\n📚 Grade: ${grade}\n🎯 Focus: ${subject}\n📱 Phone: ${phone}`
      );

      // 3. Open WhatsApp after short delay
      setTimeout(() => {
        window.open(`https://wa.me/${siteContact.phone.whatsappIntl}?text=${text}`, '_blank');
      }, 700);
    } catch {
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <span>Zero Risk &bull; No Credit Card</span>
            </div>

            <h3 className="font-heading font-black text-2xl sm:text-3xl text-navy mb-2">
              Book a Free 1-on-1 Trial Session
            </h3>
            <p className="text-xs sm:text-sm font-bold text-navy/70 mb-6 leading-relaxed">
              Experience a private 1-on-1 lesson with a patient educator matched to your child&apos;s exact grade and school syllabus.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-navy mb-1.5">
                  Parent&apos;s Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mrs. Lawson / Mr. Agbagwa"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-3 border-navy bg-white text-navy font-bold text-sm focus:outline-none focus:ring-2 focus:ring-yellow shadow-[2px_2px_0px_#0A1628]"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-navy mb-1.5">
                  WhatsApp / Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +234 906 813 3874 or +44 7..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-3 border-navy bg-white text-navy font-bold text-sm focus:outline-none focus:ring-2 focus:ring-yellow shadow-[2px_2px_0px_#0A1628]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-navy mb-1.5">
                    Child&apos;s Grade
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl border-3 border-navy bg-white text-navy font-bold text-sm focus:outline-none focus:ring-2 focus:ring-yellow shadow-[2px_2px_0px_#0A1628]"
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
                  <label className="block text-xs font-black uppercase tracking-wider text-navy mb-1.5">
                    Subject Focus
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl border-3 border-navy bg-white text-navy font-bold text-sm focus:outline-none focus:ring-2 focus:ring-yellow shadow-[2px_2px_0px_#0A1628]"
                  >
                    <option value="Primary Mathematics & Mental Math">Primary Mathematics</option>
                    <option value="English Literacy & Phonics">English Literacy &amp; Phonics</option>
                    <option value="Focused 1-Hour Homework Help">Focused 1-Hr Homework Help</option>
                    <option value="Cambridge Checkpoint / 11+ Prep">Cambridge Checkpoint / 11+</option>
                    <option value="Both Math & English">Both Math &amp; English</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-4 px-6 rounded-2xl border-4 border-navy bg-yellow hover:bg-yellow/90 text-navy font-heading font-black text-base uppercase tracking-wider shadow-[4px_4px_0px_#0A1628] hover:-translate-y-0.5 transition-transform flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Connecting to Educator...</span>
                ) : (
                  <>
                    <span>Confirm Free Trial on WhatsApp</span>
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
              Opening WhatsApp with an educator now. If it didn&apos;t open automatically, click the button below:
            </p>
            <a
              href={`https://wa.me/${siteContact.phone.whatsappIntl}?text=${encodeURIComponent(
                `Hello Edvoura! I'm ${parentName}. Requesting a free trial for my child in ${grade} for ${subject}.`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border-3 border-navy bg-emerald-500 text-white px-6 py-3 font-heading font-black text-sm uppercase tracking-wider shadow-[3px_3px_0px_#0A1628]"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Continue on WhatsApp</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
