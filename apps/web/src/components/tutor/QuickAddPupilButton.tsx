'use client';

import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import QuickAddPupilModal from './QuickAddPupilModal';

export default function QuickAddPupilButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl border-2 border-navy bg-yellow hover:bg-yellow/90 text-navy px-4 py-2 text-xs sm:text-sm font-black uppercase tracking-wider shadow-[3px_3px_0px_#0A1628] hover:-translate-y-0.5 transition-transform"
      >
        <UserPlus className="w-4 h-4" />
        <span>+ Add Pupil &amp; Meet Link</span>
      </button>

      <QuickAddPupilModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
