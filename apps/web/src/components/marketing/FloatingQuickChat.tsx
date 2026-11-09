'use client';

import React, { useState } from 'react';
import { MessageSquare, Send, Phone, X, Sparkles, Calendar, ChevronRight } from 'lucide-react';
import { siteContact } from '@/lib/site';
import QuickTrialModal from './QuickTrialModal';

export default function FloatingQuickChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [trialModalOpen, setTrialModalOpen] = useState(false);

  return (
    <>
      {/* FLOATING ACTION BUTTON */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end">
        {/* Expanded Popover Card */}
        {isOpen && (
          <div className="mb-3 w-[calc(100vw-2.5rem)] sm:w-80 rounded-3xl border-4 border-navy bg-white p-5 shadow-[8px_8px_0px_#0A1628] animate-in slide-in-from-bottom-3 duration-200 text-navy font-sans">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b-2 border-navy/10 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
                    Educator Online
                  </span>
                </div>
                <h4 className="font-heading font-black text-lg text-navy leading-tight mt-0.5">
                  Chat with Edvoura
                </h4>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg border-2 border-navy bg-off-white flex items-center justify-center hover:bg-yellow transition-colors"
                aria-label="Close chat menu"
              >
                <X className="w-4 h-4 text-navy" />
              </button>
            </div>

            <p className="text-xs font-bold text-navy/70 mb-4 leading-relaxed">
              Have questions about 1-on-1 tutoring, your child&apos;s grade, or pricing? Choose your preferred direct channel:
            </p>

            {/* Quick Action Options */}
            <div className="space-y-2">
              {/* WhatsApp Line 1 */}
              <a
                href={`https://wa.me/${siteContact.phone.whatsappIntl}?text=${encodeURIComponent(
                  "Hello Edvoura! I'm interested in 1-on-1 online tutoring for my child."
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-2xl border-2 border-navy bg-emerald-50 hover:bg-emerald-100 transition-colors shadow-[2px_2px_0px_#0A1628] group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="block text-xs font-black text-navy group-hover:text-emerald-800">
                      WhatsApp Line 1
                    </span>
                    <span className="text-[10px] font-bold text-navy/60">{siteContact.phone.support}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-navy/40 group-hover:translate-x-0.5 transition-transform" />
              </a>

              {/* WhatsApp Line 2 */}
              <a
                href={`https://wa.me/${siteContact.phone.whatsappSecondaryIntl}?text=${encodeURIComponent(
                  "Hello Edvoura! I'd like to ask about tutoring schedules and trial lessons."
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-2xl border-2 border-navy bg-emerald-50/60 hover:bg-emerald-100 transition-colors shadow-[2px_2px_0px_#0A1628] group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="block text-xs font-black text-navy group-hover:text-emerald-800">
                      WhatsApp Line 2
                    </span>
                    <span className="text-[10px] font-bold text-navy/60">{siteContact.phone.secondary}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-navy/40 group-hover:translate-x-0.5 transition-transform" />
              </a>

              {/* Telegram */}
              <a
                href={siteContact.phone.telegramUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-2xl border-2 border-navy bg-sky-50 hover:bg-sky-100 transition-colors shadow-[2px_2px_0px_#0A1628] group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0">
                    <Send className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="block text-xs font-black text-navy group-hover:text-sky-800">
                      Telegram Direct
                    </span>
                    <span className="text-[10px] font-bold text-navy/60">{siteContact.phone.telegram}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-navy/40 group-hover:translate-x-0.5 transition-transform" />
              </a>

              {/* Instant Free Trial Trigger */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setTrialModalOpen(true);
                }}
                className="w-full mt-1 flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-navy bg-yellow hover:bg-yellow/90 font-heading font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_#0A1628] transition-transform active:translate-y-0.5"
              >
                <Sparkles className="w-4 h-4 text-navy" />
                <span>Book Free Trial Session</span>
              </button>
            </div>
          </div>
        )}

        {/* Collapsed Pill Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group flex items-center gap-2.5 rounded-full border-3 border-navy bg-yellow hover:bg-yellow/90 text-navy px-4 py-3 sm:px-5 sm:py-3.5 shadow-[4px_4px_0px_#0A1628] hover:-translate-y-0.5 active:translate-y-0 transition-transform font-heading font-black text-xs sm:text-sm uppercase tracking-wider"
          aria-label="Open chat with an educator"
        >
          <div className="relative">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-navy shadow-sm">
              <MessageSquare className="w-4 h-4 fill-white" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-navy rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-navy rounded-full" />
          </div>
          <span>Chat with Us</span>
        </button>
      </div>

      {/* Free Trial Modal */}
      <QuickTrialModal
        isOpen={trialModalOpen}
        onClose={() => setTrialModalOpen(false)}
      />
    </>
  );
}
