'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Glasses, Video, Sparkles } from 'lucide-react';
import { VRLabExplorer, VRModuleId } from '@/components/classroom/VRLabExplorer';

const TUTOR_VR_MODULES: { id: VRModuleId; label: string; subject: string }[] = [
  { id: 'solar-system', label: '🪐 Solar System', subject: 'Space Science' },
  { id: 'human-heart', label: '🫀 Human Heart', subject: 'Anatomy & Biology' },
  { id: 'geometry-volume', label: '📐 3D Geometry', subject: 'Math & Nets' },
  { id: 'earth-volcano', label: '🌋 Earth & Volcano', subject: 'Geography' },
  { id: 'dna-helix', label: '🧬 DNA Helix', subject: 'Genetics' },
  { id: 'plant-cell', label: '🌿 Plant Cell', subject: 'Botany' },
  { id: 'bohr-atom', label: '⚛️ Bohr Atom', subject: 'Chemistry' },
  { id: 'ancient-pyramid', label: '🏛️ Great Pyramid', subject: 'World History' },
];

export default function TutorVRLabPage() {
  const [activeModule, setActiveModule] = useState<VRModuleId>('solar-system');

  return (
    <div className="w-full flex flex-col rounded-[24px] border-[3px] border-dark overflow-hidden bg-[#060E1C] text-white shadow-[8px_8px_0px_#060E1C] select-none font-sans">
      <header className="min-h-14 border-b-[2.5px] border-white/10 bg-[#0a1124] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/dash/tutor"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-black text-white transition-all active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Tutor Hub</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-purple-600 rounded-xl border border-white/20">
              <Glasses className="w-4 h-4 text-white" />
            </span>
            <div>
              <h1 className="text-sm font-black uppercase tracking-tight text-white flex items-center gap-1.5">
                Tutor 3D &amp; Virtual Reality Studio
                <span className="text-[10px] bg-yellow text-dark px-1.5 py-0.5 rounded font-black">LIVE SYNC READY</span>
              </h1>
              <p className="text-[10px] text-white/60 font-semibold hidden sm:block">
                Preview 3D lessons with Voice Narration &amp; Slicing Plane, or present live to pupils in class
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/dash/tutor/live/classroom"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-yellow hover:bg-yellow/90 text-dark text-xs font-black border-2 border-dark shadow-[2px_2px_0px_#ffffff] active:scale-95 transition-all"
        >
          <Video className="w-3.5 h-3.5" />
          <span>Launch Inside Live Classroom</span>
        </Link>
      </header>

      <div className="bg-[#0d162d] border-b border-white/10 px-4 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-black uppercase text-yellow/80 mr-1 flex items-center gap-1 shrink-0">
          <Sparkles className="w-3 h-3" /> Curriculum Worlds:
        </span>
        {TUTOR_VR_MODULES.map((m) => (
          <button
            key={m.id}
            onClick={() => setActiveModule(m.id)}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-black shrink-0 border transition-all flex items-center gap-1.5 ${
              activeModule === m.id
                ? 'bg-purple-600 text-white border-purple-300 shadow-sm'
                : 'bg-white/5 hover:bg-white/15 text-white/75 border-white/10'
            }`}
          >
            <span>{m.label}</span>
            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-black/30 text-white/70">{m.subject}</span>
          </button>
        ))}
      </div>

      <div className="w-full h-[calc(100vh-14rem)] min-h-[540px] relative">
        <VRLabExplorer initialModule={activeModule} role="tutor" />
      </div>
    </div>
  );
}
