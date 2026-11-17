'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowLeft,
  Glasses,
  Globe,
  Heart,
  Box,
  Flame,
  Trophy,
  Compass,
  Star,
  Award,
} from 'lucide-react';
import { VRLabExplorer, VRModuleId } from '@/components/classroom/VRLabExplorer';
import { Button } from '@/components/ui/button';

export default function StudentVRLabPage() {
  const [activeModule, setActiveModule] = useState<VRModuleId>('solar-system');
  const [pointsEarned, setPointsEarned] = useState<number>(150);

  const MODULES = [
    {
      id: 'solar-system' as VRModuleId,
      title: '🪐 Solar System Expedition',
      badge: 'Science & Space',
      desc: 'Stand on the surface of planets, watch 3D orbits to scale, and inspect Saturn’s rings.',
      color: 'bg-amber-100 text-amber-900 border-amber-500',
    },
    {
      id: 'human-heart' as VRModuleId,
      title: '🫀 3D Human Anatomy & Heart',
      badge: 'Biology & Life',
      desc: 'Watch an anatomical heart beat in real-time, inspect blood flow, and explore valves.',
      color: 'bg-rose-100 text-rose-900 border-rose-500',
    },
    {
      id: 'geometry-volume' as VRModuleId,
      title: '📐 3D Geometry & Volume Sandbox',
      badge: 'Mathematics & Spatial',
      desc: 'Manipulate 3D shapes, discover surface area and volume formulas hands-on.',
      color: 'bg-yellow text-dark border-dark',
    },
    {
      id: 'earth-volcano' as VRModuleId,
      title: '🌋 Earth Layers & Volcano',
      badge: 'Geography & Earth',
      desc: 'Peel back the Earth’s crust down to the scorching 6,000°C inner core.',
      color: 'bg-sky-100 text-sky-900 border-sky-500',
    },
  ];

  return (
    <div className="min-h-screen bg-[#060E1C] text-white flex flex-col font-sans select-none">
      {/* Top Banner Navigation */}
      <header className="h-16 border-b-[2.5px] border-dark bg-[#0a1124] px-4 sm:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/dash/student"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-black text-white transition-all active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-purple-600 rounded-xl border border-white/20 shadow-xs">
              <Glasses className="w-4 h-4 text-white" />
            </span>
            <div>
              <h1 className="text-sm font-black uppercase tracking-tight text-white flex items-center gap-1.5">
                Edvoura 3D &amp; Virtual Reality Lab
                <span className="text-[10px] bg-yellow text-dark px-1.5 py-0.5 rounded font-black">PRO</span>
              </h1>
              <p className="text-[10px] text-white/60 font-semibold hidden sm:block">
                Works on Laptops, Tablets (Magic Window), and VR Headsets
              </p>
            </div>
          </div>
        </div>

        {/* Discovery Points & Badges */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow/20 border border-yellow/40 rounded-full text-xs font-black text-yellow">
            <Trophy className="w-3.5 h-3.5 text-yellow" />
            <span>{pointsEarned} Explorer XP</span>
          </div>
        </div>
      </header>

      {/* Main 3D Stage Container */}
      <div className="flex-1 w-full relative flex flex-col min-h-0">
        <div className="flex-1 w-full h-full relative">
          <VRLabExplorer initialModule={activeModule} />
        </div>
      </div>
    </div>
  );
}
