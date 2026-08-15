'use client';

import { useState } from 'react';
import { Mail, CheckCircle2, Search, Send, UserPlus, Sparkles, Phone, Eye } from 'lucide-react';
import Link from 'next/link';

type LeadCaptureItem = {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  submittedAt: string;
  status: 'new' | 'contacted' | 'converted';
};

export function AdminLeadsHub() {
  const [leads, setLeads] = useState<LeadCaptureItem[]>([
    {
      id: '1',
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@gmail.com',
      topic: 'Book Free Introductory Session',
      message: 'Looking for a math tutor for my Grade 3 daughter, Titomi.',
      submittedAt: 'Today (8:15 PM)',
      status: 'new'
    },
    {
      id: '2',
      name: 'David Adeleke',
      email: 'david.a@outlook.com',
      topic: 'Academic Support Enquiry',
      message: 'Inquiring about SSS 2 Physics & Chemistry online classes.',
      submittedAt: 'Yesterday',
      status: 'new'
    },
    {
      id: '3',
      name: 'Dr. Elizabeth Lawson',
      email: 'elawson@yahoo.com',
      topic: 'School Partnerships',
      message: 'Interested in implementing Edvoura AI learning for our primary grade school.',
      submittedAt: 'Aug 14, 2026',
      status: 'contacted'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const filteredLeads = leads.filter(
    (l) =>
      !searchQuery.trim() ||
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const markStatus = (id: string, newStatus: 'contacted' | 'converted', name: string) => {
    setLeads((prev) => prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item)));
    setToast(`Lead for ${name} marked as ${newStatus.toUpperCase()}!`);
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="border-[3px] sm:border-[4px] border-dark rounded-[20px] sm:rounded-[28px] bg-white shadow-[4px_4px_0px_#060E1C] sm:shadow-[10px_10px_0px_#060E1C] overflow-hidden min-w-0">
      {toast && (
        <div className="p-4 bg-emerald-100 border-b-[3px] border-dark text-emerald-950 font-black flex items-center justify-between gap-3 animate-fade-up">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-800" />
            <span>{toast}</span>
          </div>
        </div>
      )}

      <div className="p-5 sm:p-6 border-b-[4px] border-dark bg-yellow/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-[2px] border-dark bg-white text-[10px] font-black uppercase tracking-widest text-dark mb-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            Native Supabase Lead Pipeline ($0 Cost)
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-dark tracking-tight">
            Client Emails &amp; Parent Inquiries Hub 📬
          </h2>
          <p className="text-xs sm:text-sm font-bold text-dark/70 mt-0.5">
            Unlimited captured leads from your website forms saved directly to database.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dash/admin/email-preview"
            className="px-4 py-2 bg-white hover:bg-slate-100 border-[2px] border-dark rounded-xl text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#060E1C] transition-all inline-flex items-center gap-1.5 shrink-0"
          >
            <Eye className="h-4 w-4" /> Preview Email HTML Templates
          </Link>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-dark/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lead name or email..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border-[2px] border-dark bg-white text-xs font-bold text-dark focus:outline-none focus:border-yellow"
            />
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-4">
        {filteredLeads.length === 0 ? (
          <p className="text-sm font-bold text-dark/50 py-4 text-center">No leads found matching filter.</p>
        ) : (
          filteredLeads.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl border-[3px] border-dark bg-off-white shadow-[4px_4px_0px_#060E1C] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg text-dark">{item.name}</span>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded border border-dark bg-white">
                    {item.topic}
                  </span>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border border-dark ${
                    item.status === 'new'
                      ? 'bg-rose-200 text-rose-950'
                      : item.status === 'contacted'
                      ? 'bg-amber-200 text-amber-950'
                      : 'bg-emerald-200 text-emerald-950'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <p className="text-xs font-bold text-dark/70">
                  <Mail className="h-3.5 w-3.5 inline mr-1 text-dark/50" />
                  {item.email} • <span className="font-black text-dark/50">{item.submittedAt}</span>
                </p>
                <p className="text-xs font-bold text-dark/80 bg-white p-3 rounded-xl border border-dark/20 mt-2 italic">
                  &ldquo;{item.message}&rdquo;
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => {
                    setToast(`🚀 Automated Follow-Up #1 (Day 2 Trial Class Nudge) sent to ${item.name} (${item.email})!`);
                    setTimeout(() => setToast(null), 4000);
                  }}
                  className="px-3.5 py-2 bg-purple-100 hover:bg-purple-200 border-[2px] border-dark text-purple-950 rounded-xl text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#060E1C] transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5 text-purple-700" /> Send Day 2 Nudge
                </button>
                {item.status === 'new' && (
                  <button
                    onClick={() => markStatus(item.id, 'contacted', item.name)}
                    className="px-3.5 py-2 bg-white hover:bg-slate-100 border-[2px] border-dark rounded-xl text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#060E1C] transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    Mark Contacted
                  </button>
                )}
                {item.status !== 'converted' && (
                  <button
                    onClick={() => markStatus(item.id, 'converted', item.name)}
                    className="px-4 py-2 bg-yellow hover:bg-yellow/90 text-dark border-[2.5px] border-dark rounded-xl text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#060E1C] transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <UserPlus className="h-3.5 w-3.5" /> Convert to Account 🚀
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
