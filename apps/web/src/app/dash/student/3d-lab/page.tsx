'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Glasses, Trophy, Video } from 'lucide-react';
import { VRLabExplorer, VRModuleId } from '@/components/classroom/VRLabExplorer';

const LAB_MODULES: { id: VRModuleId; label: string; badge: string }[] = [
  { id: 'solar-system', label: '🪐 Solar System', badge: 'Space' },
  { id: 'human-heart', label: '🫀 Human Heart', badge: 'Biology' },
  { id: 'geometry-volume', label: '📐 3D Geometry', badge: 'Math' },
  { id: 'earth-volcano', label: '🌋 Earth & Volcano', badge: 'Geography' },
  { id: 'dna-helix', label: '🧬 DNA Helix', badge: 'Genetics' },
  { id: 'plant-cell', label: '🌿 Plant Cell', badge: 'Botany' },
  { id: 'bohr-atom', label: '⚛️ Bohr Atom', badge: 'Chemistry' },
  { id: 'ancient-pyramid', label: '🏛️ Great Pyramid', badge: 'History' },
];

export default function StudentVRLabPage() {
  const [activeModule, setActiveModule] = useState<VRModuleId>('solar-system');
  const [explored, setExplored] = useState<Set<VRModuleId>>(() => new Set(['solar-system']));

  const handlePickModule = (id: VRModuleId) => {
    setActiveModule(id);
    setExplored((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  return (
    <div className="w-full flex flex-col rounded-[24px] border-[3px] border-dark overflow-hidden bg-[#060E1C] text-white shadow-[8px_8px_0px_#060E1C] select-none font-sans">
      {/* Top Banner Navigation */}
      <header className="min-h-14 border-b-[2.5px] border-white/10 bg-[#0a1124] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/dash/student"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-black text-white transition-all active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-purple-600 rounded-xl border border-white/20">
              <Glasses className="w-4 h-4 text-white" />
            </span>
            <div>
              <h1 className="text-sm font-black uppercase tracking-tight text-white flex items-center gap-1.5">
                Edvoura 3D &amp; Virtual Reality Lab
                <span className="text-[10px] bg-yellow text-dark px-1.5 py-0.5 rounded font-black">3D / VR</span>
              </h1>
              <p className="text-[10px] text-white/60 font-semibold hidden sm:block">
                Interactive 3D on Laptops, Magic Window on Tablets, &amp; WebXR / Cardboard VR
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow/20 border border-yellow/40 rounded-full text-xs font-black text-yellow">
            <Trophy className="w-3.5 h-3.5 text-yellow" />
            <span>{explored.size} / {LAB_MODULES.length} Worlds Explored</span>
          </div>
          <Link
            href="/dash/student/live"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black transition-all"
          >
            <Video className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Join Live Class</span>
          </Link>
        </div>
      </header>

      {/* Curriculum World Quick Bar */}
      <div className="bg-[#0d162d] border-b border-white/10 px-4 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {LAB_MODULES.map((m) => (
          <button
            key={m.id}
            onClick={() => handlePickModule(m.id)}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-black shrink-0 border transition-all flex items-center gap-1.5 ${
              activeModule === m.id
                ? 'bg-purple-600 text-white border-purple-300 shadow-sm'
                : 'bg-white/5 hover:bg-white/15 text-white/75 border-white/10'
            }`}
          >
            <span>{m.label}</span>
            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-black/30 text-white/70">{m.badge}</span>
          </button>
        ))}
      </div>

      {/* Main 3D Stage Container with explicit viewport height */}
      <div className="w-full h-[calc(100vh-14rem)] min-h-[540px] relative">
        <VRLabExplorer initialModule={activeModule} role="student" />
      </div>
    </div>
  );
}
