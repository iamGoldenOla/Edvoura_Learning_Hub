'use client';

import { useState } from 'react';
import { Building2, Copy, Check, ShieldCheck, Download, Receipt, Sparkles, Send, X, ArrowUpRight } from 'lucide-react';

export function BankTransferPaymentCard({
  parentName = 'Parent',
  userEmail = 'parent@edvoura.com',
}: {
  parentName?: string;
  userEmail?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const [amountPaid, setAmountPaid] = useState('25000');
  const [senderName, setSenderName] = useState(parentName);
  const [reference, setReference] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('Monthly Lesson Plan (Grade 1 - SS 3)');

  const [generatedInvoice, setGeneratedInvoice] = useState<{
    invoiceId: string;
    date: string;
    amount: string;
    sender: string;
    plan: string;
    ref: string;
  } | null>(null);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('3110197941');
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleConfirmTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const randId = `INV-EDV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const invoice = {
      invoiceId: randId,
      date: dateStr,
      amount: Number(amountPaid).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' }),
      sender: senderName || parentName,
      plan: selectedPlan,
      ref: reference || `TRF-${Math.floor(100000 + Math.random() * 900000)}`,
    };

    setGeneratedInvoice(invoice);
    setShowConfirmModal(false);
    setShowInvoiceModal(true);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="border-[3px] sm:border-[4px] border-dark rounded-[20px] sm:rounded-[28px] bg-white shadow-[4px_4px_0px_#060E1C] sm:shadow-[10px_10px_0px_#060E1C] overflow-hidden min-w-0">
      {/* Header */}
      <div className="p-6 border-b-[4px] border-dark bg-yellow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-white border-[3px] border-dark rounded-2xl flex items-center justify-center shadow-[3px_3px_0px_#060E1C] shrink-0">
            <Building2 className="h-6 w-6 text-dark" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-dark tracking-tight">Direct Bank Payment Details</h2>
            <p className="text-xs font-bold text-dark/70">Official Edvoura Bank Account for Lesson Subscriptions & Transfers</p>
          </div>
        </div>

        <button
          onClick={() => setShowConfirmModal(true)}
          className="w-full sm:w-auto bg-dark text-white border-[3px] border-dark font-black rounded-xl shadow-[4px_4px_0px_#060E1C] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all active:scale-95 px-5 py-3 text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
        >
          <Receipt className="h-4 w-4 text-yellow" /> Confirm Transfer & Get Invoice
        </button>
      </div>

      {/* Account Info Box */}
      <div className="p-6 sm:p-8 space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border-[3px] border-dark bg-emerald-100 p-5 shadow-[4px_4px_0px_#060E1C]">
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/60">Bank Name</p>
            <p className="mt-1 text-2xl font-black text-dark">First Bank</p>
          </div>

          <div className="rounded-2xl border-[3px] border-dark bg-blue-100 p-5 shadow-[4px_4px_0px_#060E1C] relative">
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/60">Account Number</p>
            <p className="mt-1 text-2xl sm:text-3xl font-black text-dark font-mono tracking-wider">3110197941</p>

            <button
              onClick={handleCopyAccount}
              className="mt-3 bg-white border-[2px] border-dark text-dark font-black rounded-lg px-3 py-1 text-xs shadow-[2px_2px_0px_#060E1C] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-dark" /> Copy Number
                </>
              )}
            </button>
          </div>

          <div className="rounded-2xl border-[3px] border-dark bg-amber-100 p-5 shadow-[4px_4px_0px_#060E1C]">
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/60">Account Name</p>
            <p className="mt-1 text-2xl font-black text-dark">Olujobi Akinola</p>
          </div>
        </div>

        <div className="rounded-2xl border-[2.5px] border-dark bg-off-white p-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
            <p className="text-xs font-bold text-dark/80">
              Instant Automated Invoice: After bank transfer, click <strong>&quot;Confirm Transfer &amp; Get Invoice&quot;</strong> to generate and download your receipt immediately.
            </p>
          </div>
          {generatedInvoice && (
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="bg-yellow border-[2px] border-dark text-dark font-black rounded-lg px-3 py-1.5 text-xs shadow-[2px_2px_0px_#060E1C] flex items-center gap-1.5 cursor-pointer"
            >
              <Receipt className="h-4 w-4" /> View Last Receipt
            </button>
          )}
        </div>
      </div>

      {/* Confirm Payment Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-[24px] border-[4px] border-dark bg-white p-6 shadow-[10px_10px_0px_#060E1C] animate-fade-up">
            <div className="flex items-center justify-between border-b-[3px] border-dark pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-dark" />
                <h3 className="text-xl font-black text-dark">Confirm Bank Transfer Payment</h3>
              </div>
              <button onClick={() => setShowConfirmModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="h-5 w-5 text-dark" />
              </button>
            </div>

            <form onSubmit={handleConfirmTransfer} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-dark mb-1">Lesson Subscription Plan</label>
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-[2.5px] border-dark text-sm font-bold text-dark focus:outline-none focus:border-yellow bg-white"
                >
                  <option value="Monthly Lesson Plan (Grade 1 - SS 3)">Monthly Lesson Plan (Grade 1 - SS 3) - ₦25,000</option>
                  <option value="Termly Complete Academic Package">Termly Complete Academic Package - ₦65,000</option>
                  <option value="Spelling Bee & Quiz Mastery Package">Spelling Bee & Quiz Mastery Package - ₦15,000</option>
                  <option value="Custom One-on-One Tutoring Session">Custom One-on-One Tutoring Session - ₦35,000</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-dark mb-1">Amount Transferred (NGN)</label>
                <input
                  type="number"
                  required
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder="25000"
                  className="w-full px-4 py-3 rounded-xl border-[2.5px] border-dark text-sm font-bold text-dark focus:outline-none focus:border-yellow"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-dark mb-1">Depositor / Sender Full Name</label>
                <input
                  type="text"
                  required
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. Olujobi Akinola"
                  className="w-full px-4 py-3 rounded-xl border-[2.5px] border-dark text-sm font-bold text-dark focus:outline-none focus:border-yellow"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-dark mb-1">Bank Session ID / Transfer Reference (Optional)</label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. 000013240814120000"
                  className="w-full px-4 py-3 rounded-xl border-[2.5px] border-dark text-sm font-bold text-dark focus:outline-none focus:border-yellow font-mono text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2.5 rounded-xl border-[2px] border-dark text-xs font-bold text-dark hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-yellow border-[2.5px] border-dark rounded-xl text-xs font-black text-dark shadow-[3px_3px_0px_#060E1C] flex items-center gap-2"
                >
                  Generate Official Invoice <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Downloadable / Printable Digital Invoice Modal */}
      {showInvoiceModal && generatedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-[28px] border-[4px] border-dark bg-white p-6 sm:p-8 shadow-[12px_12px_0px_#060E1C] animate-fade-up">
            <div className="flex items-center justify-between border-b-[3px] border-dark pb-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-yellow rounded-lg flex items-center justify-center border border-dark font-black text-sm">E</div>
                <h3 className="text-xl font-black text-dark">EDVOURA OFFICIAL INVOICE</h3>
              </div>
              <button onClick={() => setShowInvoiceModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="h-5 w-5 text-dark" />
              </button>
            </div>

            <div id="edvoura-printable-invoice" className="space-y-6">
              {/* Status Banner */}
              <div className="p-4 bg-emerald-100 border-[2.5px] border-dark rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-900">Payment Status</span>
                  <p className="text-lg font-black text-emerald-950 flex items-center gap-1.5">
                    <Check className="h-5 w-5 text-emerald-800" /> CONFIRMED &amp; PAID
                  </p>
                </div>
                <span className="px-3 py-1 bg-white border border-dark rounded-xl text-[11px] font-black font-mono text-dark shadow-[2px_2px_0px_#060E1C]">
                  {generatedInvoice.invoiceId}
                </span>
              </div>

              {/* Invoice Table */}
              <div className="border-[2.5px] border-dark rounded-2xl p-5 space-y-3 bg-slate-50">
                <div className="flex justify-between text-xs font-bold border-b border-dark/10 pb-2">
                  <span className="text-dark/60">Payer Name:</span>
                  <span className="font-black text-dark">{generatedInvoice.sender}</span>
                </div>
                <div className="flex justify-between text-xs font-bold border-b border-dark/10 pb-2">
                  <span className="text-dark/60">Subscription Package:</span>
                  <span className="font-black text-dark">{generatedInvoice.plan}</span>
                </div>
                <div className="flex justify-between text-xs font-bold border-b border-dark/10 pb-2">
                  <span className="text-dark/60">Bank Account Paid To:</span>
                  <span className="font-black text-dark">First Bank (3110197941 - Olujobi Akinola)</span>
                </div>
                <div className="flex justify-between text-xs font-bold border-b border-dark/10 pb-2">
                  <span className="text-dark/60">Transfer Reference:</span>
                  <span className="font-mono text-dark">{generatedInvoice.ref}</span>
                </div>
                <div className="flex justify-between text-xs font-bold pt-1">
                  <span className="text-dark/60">Date &amp; Time Issued:</span>
                  <span className="font-black text-dark">{generatedInvoice.date}</span>
                </div>
              </div>

              {/* Total Amount Box */}
              <div className="p-4 bg-yellow border-[2.5px] border-dark rounded-2xl flex justify-between items-center shadow-[4px_4px_0px_#060E1C]">
                <span className="text-xs font-black uppercase tracking-wider text-dark">Total Amount Paid</span>
                <span className="text-2xl font-black text-dark">{generatedInvoice.amount}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handlePrintInvoice}
                className="flex-1 bg-dark text-white border-[2.5px] border-dark rounded-xl px-4 py-3 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#060E1C] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="h-4 w-4" /> Download / Print PDF Invoice
              </button>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="bg-white text-dark border-[2.5px] border-dark rounded-xl px-4 py-3 text-xs font-black uppercase tracking-wider hover:bg-slate-100"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
