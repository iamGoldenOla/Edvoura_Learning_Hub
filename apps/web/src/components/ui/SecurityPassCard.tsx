'use client';

import { useState } from 'react';
import { ShieldCheck, Copy, Check, Download, KeyRound, Sparkles } from 'lucide-react';

export function generateUniqueAccessKey(userId: string, role = 'student'): string {
  const prefix = role === 'admin' ? 'ADM' : role === 'parent' ? 'PAR' : role === 'tutor' ? 'TUT' : 'EDV';
  const cleanStr = userId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const part1 = cleanStr.slice(0, 4) || '8492';
  const part2 = cleanStr.slice(4, 8) || '3104';
  return `${prefix}-${part1}-${part2}`;
}

export function SecurityPassCard({
  fullName,
  email,
  userId,
  role = 'student',
}: {
  fullName: string;
  email: string;
  userId: string;
  role?: string;
}) {
  const [copied, setCopied] = useState(false);
  const accessKey = generateUniqueAccessKey(userId, role);

  const handleCopy = () => {
    navigator.clipboard.writeText(accessKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadPass = () => {
    const text = `EDVOURA LEARNING HUB - OFFICIAL DIGITAL SECURITY PASS
--------------------------------------------------
Holder Name : ${fullName}
Registered Email: ${email}
Account Role    : ${role.toUpperCase()}
Unique Pass Key : ${accessKey}
Issued Date     : ${new Date().toLocaleDateString()}
--------------------------------------------------
Keep this Unique Pass Key secure. You can use it for quick verification and account recovery anywhere on Edvoura.`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Edvoura-Security-Pass-${accessKey}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-[24px] border-[3px] border-dark bg-navy p-6 text-white shadow-[8px_8px_0px_#060E1C] relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-yellow/15 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-yellow" />
          <span className="font-heading font-black text-sm tracking-widest text-yellow uppercase">
            Official Security Pass
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-yellow/20 text-yellow border border-yellow/40 text-[10px] font-black uppercase tracking-wider">
          Active Verified
        </span>
      </div>

      <div className="space-y-3 mb-6">
        <div>
          <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Account Holder</p>
          <h3 className="text-xl font-black text-white tracking-tight">{fullName}</h3>
          <p className="text-xs text-white/70 font-semibold">{email}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-white/10 border border-white/20 flex items-center justify-between gap-3">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-yellow flex items-center gap-1">
              <KeyRound className="h-3 w-3" /> Unique Access Pass Key
            </p>
            <p className="font-mono text-lg font-black text-white tracking-wider mt-0.5">{accessKey}</p>
          </div>

          <button
            onClick={handleCopy}
            className="px-3 py-2 bg-yellow text-navy font-black text-xs rounded-lg border border-dark shadow-[2px_2px_0px_#060E1C] hover:translate-y-[-1px] transition-all flex items-center gap-1.5"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-900" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy Key'}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
        <p className="text-[10px] font-bold text-white/60">Save or download your Pass Key for instant 1-click verification.</p>
        <button
          onClick={handleDownloadPass}
          className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0"
        >
          <Download className="h-4 w-4" /> Download Pass
        </button>
      </div>
    </div>
  );
}
