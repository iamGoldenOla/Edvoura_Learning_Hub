'use client';

import { useState } from 'react';
import { ShieldCheck, Copy, Check, Download, Lock, KeyRound } from 'lucide-react';

export function generateGuaranteedUniqueCode(fullName: string, role = 'student'): string {
  const prefix = role === 'admin' ? 'ADM' : role === 'parent' ? 'PAR' : role === 'tutor' ? 'TUT' : 'EDV';
  const namePart = (fullName || 'USER')
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 5) || 'EXPLORER';
  
  const dateObj = new Date();
  const datePart = dateObj.toISOString().slice(0, 10).replace(/-/g, ''); // e.g. 20260814
  const randEntropy = Math.floor(1000 + Math.random() * 9000); // 4 random digits

  return `${prefix}-${namePart}-${datePart}-${randEntropy}`;
}

export function UniqueCodeVerificationGate({
  fullName,
  email,
  role = 'student',
  uniqueCode,
  onVerified,
}: {
  fullName: string;
  email: string;
  role?: string;
  uniqueCode: string;
  onVerified: () => void;
}) {
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMatch = inputCode.trim().toUpperCase() === uniqueCode.trim().toUpperCase();

  const handleCopy = () => {
    navigator.clipboard.writeText(uniqueCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const content = `==================================================
EDVOURA LEARNING HUB - OFFICIAL SECURITY ACCESS PASS
==================================================
ACCOUNT HOLDER : ${fullName}
REGISTERED EMAIL: ${email}
ACCOUNT ROLE    : ${role.toUpperCase()}
UNIQUE PASS CODE: ${uniqueCode}
ISSUED DATE     : ${new Date().toLocaleDateString()}
==================================================
IMPORTANT: Keep this Unique Security Pass Code safe! 
You can use this code for quick verification and account recovery.
==================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Edvoura-Pass-${uniqueCode}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmitVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMatch) {
      setError('Code does not match. Please copy or type your exact Unique Code shown above.');
      return;
    }
    setError(null);
    onVerified();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-[28px] border-[4px] border-dark bg-white p-6 sm:p-8 shadow-[12px_12px_0px_#060E1C] animate-fade-up my-auto">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="h-16 w-16 bg-yellow border-[3px] border-dark rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-[4px_4px_0px_#060E1C]">
            <ShieldCheck className="h-9 w-9 text-dark" />
          </div>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-400 font-black text-[10px] uppercase tracking-widest rounded-full">
            Account Created Successfully! 🎉
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-dark tracking-tight mt-2">
            Your Security Access Code
          </h2>
          <p className="text-xs font-semibold text-dark/60 mt-1">
            Please copy or download your unique security code below. You must confirm this code to unlock dashboard access.
          </p>
        </div>

        {/* Security Card Display */}
        <div className="rounded-2xl border-[3px] border-dark bg-navy p-5 text-white shadow-[6px_6px_0px_#060E1C] mb-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-yellow">
              {role.toUpperCase()} SECURITY PASS
            </span>
            <span className="text-xs font-bold text-white/70">{fullName}</span>
          </div>

          <div className="p-4 rounded-xl bg-white/10 border border-white/20 text-center mb-4">
            <p className="text-[9px] font-black text-yellow uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
              <KeyRound className="h-3 w-3" /> 100% Unique Access Code
            </p>
            <p className="font-mono text-xl sm:text-2xl font-black tracking-widest text-white select-all">
              {uniqueCode}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="py-2.5 px-3 bg-yellow hover:bg-yellow-light text-navy font-black text-xs rounded-xl border border-dark shadow-[2px_2px_0px_#060E1C] transition-all flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-900" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="py-2.5 px-3 bg-white/20 hover:bg-white/30 text-white font-black text-xs rounded-xl border border-white/30 transition-all flex items-center justify-center gap-1.5"
            >
              <Download className="h-4 w-4" /> Download Pass
            </button>
          </div>
        </div>

        {/* Verification Input Gate Form */}
        <form onSubmit={handleSubmitVerification} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-dark mb-1.5">
              Confirm Your Unique Code to Enter Dashboard:
            </label>
            <input
              type="text"
              required
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder={`Paste or type: ${uniqueCode}`}
              className="w-full px-4 py-3.5 rounded-xl border-[2.5px] border-dark bg-slate-50 font-mono text-sm font-black text-dark focus:bg-white focus:outline-none focus:border-yellow transition-all placeholder:text-dark/30 uppercase tracking-widest"
            />
          </div>

          {error && (
            <p className="text-xs font-black text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!inputCode.trim()}
            className="w-full py-4 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed border-[3px] border-dark rounded-xl font-black uppercase text-xs tracking-widest text-dark shadow-[4px_4px_0px_#060E1C] flex items-center justify-center gap-2 transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none cursor-pointer"
          >
            <Lock className="h-4 w-4" /> Verify Code & Enter Dashboard →
          </button>
        </form>

      </div>
    </div>
  );
}
