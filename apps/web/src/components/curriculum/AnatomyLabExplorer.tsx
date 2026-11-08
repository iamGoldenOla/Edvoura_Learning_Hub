'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Cog,
  Wrench,
  BookOpen,
  Send,
  Sliders,
  ChevronRight,
  Layers,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { ANATOMY_PRESETS, AnatomyMachinePreset } from '@/lib/anatomy-engine/anatomyPresets';
import AnatomyMachineCanvas from './AnatomyMachineCanvas';

export default function AnatomyLabExplorer() {
  const [activePresetId, setActivePresetId] = useState<string>(ANATOMY_PRESETS[0].id);
  const [activeTab, setActiveTab] = useState<'controls' | 'curriculum'>('controls');

  const activePreset = useMemo(() => {
    return ANATOMY_PRESETS.find((p) => p.id === activePresetId) || ANATOMY_PRESETS[0];
  }, [activePresetId]);

  // Dynamic Machine Control States
  const [controlState, setControlState] = useState<Record<string, number | boolean>>(() => {
    const init: Record<string, number | boolean> = {};
    activePreset.controls.forEach((c) => {
      init[c.id] = c.default;
    });
    return init;
  });

  const handleSelectPreset = (preset: AnatomyMachinePreset) => {
    setActivePresetId(preset.id);
    const newInit: Record<string, number | boolean> = {};
    preset.controls.forEach((c) => {
      newInit[c.id] = c.default;
    });
    setControlState(newInit);
  };

  const handleControlChange = (id: string, val: number | boolean) => {
    setControlState((prev) => ({
      ...prev,
      [id]: val,
    }));
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Main Machine Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 8 Cols: Canvas & Machine Details */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Card */}
          <div className="rounded-3xl border-[3.5px] border-dark bg-white p-6 shadow-[8px_8px_0px_#060E1C]">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="rounded-lg border-[2px] border-dark bg-emerald-300 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-dark">
                {activePreset.discipline}
              </span>
              <span className="rounded-lg border-[2px] border-dark bg-yellow px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-dark">
                {activePreset.curriculumStandard}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-dark tracking-tight">
              {activePreset.title}
            </h2>
            <p className="mt-1 text-sm font-semibold text-dark/70">
              {activePreset.summary}
            </p>

            {/* Metaphor Pill */}
            <div className="mt-4 rounded-xl border-[2px] border-dark bg-off-white p-3.5 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-dark/50">
                Physical Mechanical Metaphor
              </span>
              <p className="text-xs font-bold text-dark">
                {activePreset.metaphor}
              </p>
            </div>
          </div>

          {/* Interactive Mechanical Canvas */}
          <AnatomyMachineCanvas preset={activePreset} state={controlState} />

          {/* Live Classroom Sync Action */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border-[3px] border-dark bg-emerald-100 p-4 shadow-[4px_4px_0px_#060E1C]">
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-dark" />
              <span className="text-xs font-black uppercase tracking-wider text-dark">
                Want to demonstrate this machine in live class?
              </span>
            </div>
            <Link
              href={`/dash/student/live?anatomyMachine=${encodeURIComponent(activePreset.id)}`}
              className="inline-flex items-center gap-2 rounded-xl border-[2px] border-dark bg-dark text-white hover:bg-yellow hover:text-dark px-4 py-2 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#060E1C] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
            >
              <Send className="h-3.5 w-3.5" /> Project to Whiteboard
            </Link>
          </div>
        </div>

        {/* Right 4 Cols: Interactive Valves, Levers & Curriculum Alignment */}
        <div className="lg:col-span-4 space-y-6">
          {/* Controls vs Curriculum Tabs */}
          <div className="rounded-3xl border-[3.5px] border-dark bg-white shadow-[8px_8px_0px_#060E1C] overflow-hidden">
            <div className="grid grid-cols-2 border-b-[3px] border-dark bg-off-white text-center">
              <button
                type="button"
                onClick={() => setActiveTab('controls')}
                className={`py-3 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'controls' ? 'bg-yellow text-dark border-r-[2px] border-dark' : 'text-dark/60 hover:text-dark border-r-[2px] border-dark/20'
                }`}
              >
                <Sliders className="h-3.5 w-3.5" /> Mechanical Knobs
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('curriculum')}
                className={`py-3 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'curriculum' ? 'bg-yellow text-dark' : 'text-dark/60 hover:text-dark'
                }`}
              >
                <GraduationCap className="h-3.5 w-3.5" /> Syllabus Mapping
              </button>
            </div>

            <div className="p-5">
              {activeTab === 'controls' ? (
                <div className="space-y-4">
                  <p className="text-xs font-bold text-dark/60 mb-2">
                    Operate valves, levers, and flow controls:
                  </p>
                  {activePreset.controls.map((ctrl) => (
                    <div key={ctrl.id} className="rounded-2xl border-[2px] border-dark bg-off-white p-3.5 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-black text-dark">
                        <span>{ctrl.name}</span>
                        {ctrl.type === 'slider' && (
                          <span className="font-mono bg-white px-2 py-0.5 rounded-md border border-dark/30">
                            {controlState[ctrl.id] ?? ctrl.default} {ctrl.unit ?? ''}
                          </span>
                        )}
                      </div>

                      {ctrl.type === 'slider' ? (
                        <input
                          type="range"
                          min={ctrl.min}
                          max={ctrl.max}
                          step={ctrl.step}
                          value={Number(controlState[ctrl.id] ?? ctrl.default)}
                          onChange={(e) => handleControlChange(ctrl.id, parseFloat(e.target.value))}
                          className="w-full accent-yellow h-2 bg-dark/20 rounded-lg cursor-pointer"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            handleControlChange(ctrl.id, true);
                            setTimeout(() => handleControlChange(ctrl.id, false), 800);
                          }}
                          className="w-full rounded-xl border-[2px] border-dark bg-yellow hover:bg-yellow-light text-dark font-black text-xs uppercase tracking-wider py-2 shadow-[2px_2px_0px_#060E1C] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                        >
                          {ctrl.label ?? 'Pull Lever'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-xl border-[2px] border-dark bg-off-white p-3">
                    <span className="text-[10px] font-black uppercase text-dark/50">Physical Mechanism</span>
                    <p className="mt-1 text-xs font-bold text-dark leading-relaxed">
                      {activePreset.explanation.physicalMechanism}
                    </p>
                  </div>
                  <div className="rounded-xl border-[2px] border-dark bg-blue-50 p-3">
                    <span className="text-[10px] font-black uppercase text-blue-700">Real-World STEM Parallel</span>
                    <p className="mt-1 text-xs font-bold text-dark leading-relaxed">
                      {activePreset.explanation.computingParallel}
                    </p>
                  </div>
                  <div className="rounded-xl border-[2px] border-dark bg-emerald-50 p-3">
                    <span className="text-[10px] font-black uppercase text-emerald-800">Exam Application</span>
                    <p className="mt-1 text-xs font-bold text-dark leading-relaxed">
                      {activePreset.explanation.examApplication}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Machine Preset Selector */}
          <div className="rounded-3xl border-[3.5px] border-dark bg-white shadow-[8px_8px_0px_#060E1C] overflow-hidden">
            <div className="border-b-[3px] border-dark bg-off-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-dark flex items-center gap-2">
                <Cog className="h-4 w-4" /> STEM Machines ({ANATOMY_PRESETS.length})
              </h3>
            </div>
            <div className="divide-y-2 divide-dark/10 max-h-[400px] overflow-y-auto">
              {ANATOMY_PRESETS.map((preset) => {
                const isSelected = preset.id === activePresetId;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`w-full p-4 text-left transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected ? 'bg-yellow/30' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0">
                      <span className="rounded-md border border-dark/30 bg-white px-1.5 py-0.5 text-[9px] font-black uppercase text-dark/70">
                        {preset.discipline}
                      </span>
                      <p className="text-xs font-black text-dark truncate mt-1">{preset.title}</p>
                    </div>
                    <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${isSelected ? 'rotate-90 text-dark' : 'text-dark/40'}`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
