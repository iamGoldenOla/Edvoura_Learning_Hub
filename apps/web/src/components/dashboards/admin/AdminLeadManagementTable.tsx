'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Phone, Calendar, UserCheck, MessageSquare, Clock, ArrowUpRight, Search, RefreshCw } from 'lucide-react';

interface LeadItem {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  country: string | null;
  subject_topic: string;
  message_body: string | null;
  status: string;
  created_at: string;
}

export function AdminLeadManagementTable() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inquiries');
      const data = await res.json();
      if (data.leads) {
        setLeads(data.leads);
      }
    } catch (e) {
      console.error('Failed to load inquiries:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchLeads();
  }, []);

  const filteredLeads = leads.filter(
    (l) =>
      l.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.subject_topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[8px_8px_0px_#060E1C] overflow-hidden">
      {/* Table Header */}
      <div className="p-6 border-b-[4px] border-dark bg-yellow-300 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-dark tracking-tight uppercase">
              Prospective Client Inquiries & Leads
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-black text-yellow-300 font-black text-xs">
              {leads.length} Total
            </span>
          </div>
          <p className="text-xs font-bold text-dark/70 mt-1">
            Real-time contact submissions and trial booking requests from international & local parents.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark/50" />
            <input type="text"
              aria-label="Search by name, email..." placeholder="Search by name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border-[2px] border-dark rounded-xl text-xs font-bold bg-white text-dark focus:outline-none"
            />
          </div>

          <button
            onClick={fetchLeads}
            disabled={loading}
            className="p-2 border-[2px] border-dark bg-white hover:bg-slate-100 rounded-xl shadow-[2px_2px_0px_#000] active:scale-95 transition-all"
            title="Refresh list"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-12 text-center text-dark/60 font-bold">Loading inquiries...</div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-12 text-center text-dark/50 font-bold">
            No inquiries recorded yet. Once a parent fills the contact form, their inquiry and email dispatch will appear here instantly.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-[3px] border-dark bg-slate-50 text-[11px] font-black uppercase text-dark/60 tracking-wider">
                <th className="py-3 px-4">Parent / Client</th>
                <th className="py-3 px-4">Inquiry Topic</th>
                <th className="py-3 px-4">Message Details</th>
                <th className="py-3 px-4">Date Received</th>
                <th className="py-3 px-4 text-right">Quick Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y-[2px] divide-dark/10 text-xs font-bold">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-black text-dark text-sm">{lead.full_name}</div>
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <Mail className="h-3 w-3" /> {lead.email}
                    </a>
                    {lead.phone && (
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3" /> {lead.phone}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-block px-2.5 py-1 rounded-lg border-[1.5px] border-dark bg-sky-100 text-sky-900 font-black text-[11px] uppercase">
                      {lead.subject_topic}
                    </span>
                  </td>
                  <td className="py-4 px-4 max-w-xs">
                    <p className="text-dark/80 line-clamp-2 text-xs font-medium">
                      {lead.message_body || '—'}
                    </p>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-dark/60 text-[11px]">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(lead.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Email Action */}
                      <a
                        href={`mailto:${lead.email}?subject=Regarding your Edvoura Inquiry: ${encodeURIComponent(lead.subject_topic)}`}
                        className="px-3 py-1.5 border-[2px] border-dark bg-white hover:bg-yellow rounded-xl font-black text-xs text-dark shadow-[2px_2px_0px_#000] active:scale-95 transition-all inline-flex items-center gap-1"
                      >
                        <Mail className="h-3 w-3" /> Email
                      </a>

                      {/* WhatsApp Backup Action */}
                      {lead.phone && (
                        <a
                          href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 border-[2px] border-dark bg-emerald-300 hover:bg-emerald-400 rounded-xl font-black text-xs text-dark shadow-[2px_2px_0px_#000] active:scale-95 transition-all inline-flex items-center gap-1"
                          title="WhatsApp Backup"
                        >
                          <MessageSquare className="h-3 w-3" /> WhatsApp
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
