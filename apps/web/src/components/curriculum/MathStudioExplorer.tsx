'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Search,
  Code2,
  BookOpen,
  Sliders,
  Send,
  Check,
  Copy,
  Layers,
  ChevronRight,
  Calculator,
  Compass,
} from 'lucide-react';
import { MANIMGX_PRESETS, MathScenePreset } from '@/lib/math-engine/manimgxPresets';
import MathAnimationCanvas from './MathAnimationCanvas';

const CATEGORIES = ['All', 'Elementary (Grades 1-6)', 'Geometry', 'Trigonometry', 'Calculus', 'Algebra', 'Linear Algebra', 'Physics'] as const;

export default function MathStudioExplorer() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePresetId, setActivePresetId] = useState<string>(MANIMGX_PRESETS[0].id);
  const [activeTab, setActiveTab] = useState<'controls' | 'theory'>('controls');
  const [copiedCode, setCopiedCode] = useState(false);

  // Active scene
  const activePreset = useMemo(() => {
    return MANIMGX_PRESETS.find((p) => p.id === activePresetId) || MANIMGX_PRESETS[0];
  }, [activePresetId]);

  // Initial params based on preset
  const [paramValues, setParamValues] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    activePreset.parameters.forEach((p) => {
      init[p.id] = p.default;
    });
    return init;
  });

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    const matching = MANIMGX_PRESETS.filter((p) => cat === 'All' || p.category === cat);
    if (matching.length > 0) {
      handleSelectPreset(matching[0]);
    }
  };

  const handleSelectPreset = (preset: MathScenePreset) => {
    setActivePresetId(preset.id);
    const newParams: Record<string, number> = {};
    preset.parameters.forEach((p) => {
      newParams[p.id] = p.default;
    });
    setParamValues(newParams);
  };

  const handleParamChange = (id: string, value: number) => {
    setParamValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleCopyCode = () => {
    void navigator.clipboard.writeText(activePreset.manimgxCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Filtered Presets
  const filteredPresets = useMemo(() => {
    return MANIMGX_PRESETS.filter((p) => {
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchQuery =
        !searchQuery ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Category Pills & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategorySelect(cat)}
              className={`rounded-xl border-[2px] border-dark px-3.5 py-1.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-yellow text-dark shadow-[3px_3px_0px_#060E1C]'
                  : 'bg-white text-dark/70 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search math concepts..."
            className="w-full rounded-xl border-[2px] border-dark bg-white pl-9 pr-4 py-2 text-xs font-bold text-dark placeholder:text-dark/40 shadow-[3px_3px_0px_#060E1C] focus:outline-none focus:ring-2 focus:ring-yellow"
          />
        </div>
      </div>

      {/* Main Studio Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Canvas & Scene Presentation (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Preset Header */}
          <div className="rounded-3xl border-[3.5px] border-dark bg-white p-6 shadow-[8px_8px_0px_#060E1C]">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="rounded-lg border-[2px] border-dark bg-yellow px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-dark">
                {activePreset.category}
              </span>
              <span className="rounded-lg border-[2px] border-dark bg-blue-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-dark">
                {activePreset.difficulty}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-dark tracking-tight">
              {activePreset.title}
            </h2>
            <p className="mt-1 text-sm font-semibold text-dark/70">
              {activePreset.summary}
            </p>

            {/* LaTeX Formula Banner */}
            <div className="mt-4 rounded-xl border-[2px] border-dark bg-off-white p-3 font-mono text-xs font-black text-dark flex items-center justify-between overflow-x-auto">
              <span>{activePreset.formula}</span>
              <span className="text-[10px] uppercase tracking-wider text-dark/50 shrink-0 ml-2">LaTeX Syntax</span>
            </div>
          </div>

          {/* 60FPS Interactive Canvas */}
          <MathAnimationCanvas
            preset={activePreset}
            params={paramValues}
            onParamChange={handleParamChange}
          />

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border-[3px] border-dark bg-yellow/20 p-4 shadow-[4px_4px_0px_#060E1C]">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-dark" />
              <span className="text-xs font-black uppercase tracking-wider text-dark">
                Teaching live on Edvoura?
              </span>
            </div>
            <Link
              href={`/dash/student/live?mathScene=${encodeURIComponent(activePreset.id)}`}
              className="inline-flex items-center gap-2 rounded-xl border-[2px] border-dark bg-dark text-white hover:bg-yellow hover:text-dark px-4 py-2 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#060E1C] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
            >
              <Send className="h-3.5 w-3.5" /> Project to Whiteboard
            </Link>
          </div>
        </div>

        {/* Right Side: Interactive Sliders, ManimGX Code & Presets (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Tabs: Controls vs Code vs Theory */}
          <div className="rounded-3xl border-[3.5px] border-dark bg-white shadow-[8px_8px_0px_#060E1C] overflow-hidden">
            <div className="grid grid-cols-2 border-b-[3px] border-dark bg-off-white text-center">
              <button
                type="button"
                onClick={() => setActiveTab('controls')}
                className={`py-3.5 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === 'controls' ? 'bg-yellow text-dark border-r-[2px] border-dark shadow-inner font-black' : 'text-dark/60 hover:text-dark border-r-[2px] border-dark/20'
                }`}
              >
                <Sliders className="h-4 w-4" /> Interactive Controls
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('theory')}
                className={`py-3.5 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === 'theory' ? 'bg-yellow text-dark shadow-inner font-black' : 'text-dark/60 hover:text-dark'
                }`}
              >
                <BookOpen className="h-4 w-4" /> How It Works
              </button>
            </div>

            <div className="p-5">
              {/* Tab 1: Dynamic Parameter Sliders */}
              {activeTab === 'controls' && (
                <div className="space-y-4">
                  <p className="text-xs font-bold text-dark/60 mb-2">
                    Adjust variables in real time to see how the mathematics adapts:
                  </p>
                  {activePreset.parameters.map((param) => (
                    <div key={param.id} className="rounded-2xl border-[2px] border-dark bg-off-white p-3.5 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-black text-dark">
                        <span>{param.name}</span>
                        <span className="font-mono bg-white px-2 py-0.5 rounded-md border border-dark/30">
                          {paramValues[param.id] ?? param.default} {param.unit ?? ''}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={param.min}
                        max={param.max}
                        step={param.step}
                        value={paramValues[param.id] ?? param.default}
                        onChange={(e) => handleParamChange(param.id, parseFloat(e.target.value))}
                        className="w-full accent-yellow h-2 bg-dark/20 rounded-lg cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] font-bold text-dark/40 font-mono">
                        <span>{param.min}</span>
                        <span>{param.max}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}



              {/* Tab 3: Pedagogical Explanation */}
              {activeTab === 'theory' && (
                <div className="space-y-3">
                  <p className="text-xs font-black uppercase tracking-wider text-dark/50">
                    Key Conceptual Takeaways:
                  </p>
                  <ul className="space-y-2">
                    {activePreset.explanation.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs font-bold text-dark/80">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-yellow border-[1.5px] border-dark text-[10px] font-black text-dark mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Preset Selector List */}
          <div className="rounded-3xl border-[3.5px] border-dark bg-white shadow-[8px_8px_0px_#060E1C] overflow-hidden">
            <div className="border-b-[3px] border-dark bg-off-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-dark flex items-center gap-2">
                <Layers className="h-4 w-4" /> Math Topics ({filteredPresets.length})
              </h3>
            </div>
            <div className="divide-y-2 divide-dark/10 max-h-[400px] overflow-y-auto">
              {filteredPresets.map((preset) => {
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
                      <div className="flex items-center gap-2 mb-1">
                        <span className="rounded-md border border-dark/30 bg-white px-1.5 py-0.5 text-[9px] font-black uppercase text-dark/70">
                          {preset.category}
                        </span>
                      </div>
                      <p className="text-xs font-black text-dark truncate">{preset.title}</p>
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
