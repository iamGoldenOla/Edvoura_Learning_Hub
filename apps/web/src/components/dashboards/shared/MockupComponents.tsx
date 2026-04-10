'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  TrendingUp, 
  Users, 
  Shield, 
  Zap, 
  MessageCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  Plus
} from 'lucide-react';

export const ActivityGraph = () => (
  <div className="brutalist-card p-10 h-full flex flex-col group relative bg-white shadow-[12px_12px_0px_#F5C518]">
    <div className="absolute top-4 right-4 text-dark opacity-10">
       <Activity className="w-16 h-16" />
    </div>
    <div className="flex justify-between items-center mb-10">
      <h3 className="text-xl font-black uppercase tracking-tight">Growth Telemetry</h3>
      <span className="bg-yellow border-[3px] border-dark px-4 py-2 text-[10px] font-black uppercase shadow-[4px_4px_0px_#060E1C]">+12% EXP</span>
    </div>
    <div className="flex-1 flex items-end gap-3 h-48">
      {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
        <div key={i} className="flex-1 group/bar relative">
           <motion.div 
             initial={{ height: 0 }}
             animate={{ height: `${h}%` }}
             className={`w-full border-[3px] border-dark transition-all duration-300 ${
               i === 6 ? 'bg-error shadow-[6px_6px_0px_#060E1C]' : 'bg-info/20 group-hover/bar:bg-info shadow-[6px_6px_0px_#060E1C]'
             }`} 
           />
        </div>
      ))}
    </div>
    <div className="flex justify-between mt-8 text-[11px] font-black opacity-30 uppercase tracking-[0.2em]">
       <span>MON</span>
       <span>WED</span>
       <span>TODAY</span>
    </div>
  </div>
);

export const RadialRetention = ({ value = 85 }: { value?: number }) => (
  <div className="brutalist-card p-10 flex flex-col md:flex-row items-center justify-between group brutalist-3d bg-white shadow-[12px_12px_0px_#22C55E]">
    <div className="relative w-36 h-36 flex items-center justify-center">
       {/* Simple SVG Circular Progress */}
       <svg className="w-full h-full transform -rotate-90">
          <circle cx="72" cy="72" r="62" stroke="currentColor" strokeWidth="15" fill="transparent" className="text-off-white" />
          <motion.circle 
            cx="72" cy="72" r="62" 
            stroke="currentColor" 
            strokeWidth="15" 
            fill="transparent" 
            strokeDasharray={390}
            initial={{ strokeDashoffset: 390 }}
            animate={{ strokeDashoffset: 390 - (390 * value) / 100 }}
            className="text-success" 
          />
       </svg>
       <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black leading-none">{value}%</span>
       </div>
    </div>
    <div className="flex-1 mt-8 md:mt-0 md:ml-12">
       <h4 className="text-xl font-black uppercase leading-tight mb-3">Core Retention Sync</h4>
       <p className="text-[12px] font-black text-navy opacity-40 uppercase tracking-widest leading-loose">
           SYNC STATUS: <span className="text-success underline decoration-[#22C55E] decoration-[4px]">OPTIMAL</span>. READINESS AT PEAK.
       </p>
    </div>
  </div>
);

export const LiveClassCard = () => (
  <div className="brutalist-card relative group flex flex-col lg:flex-row transition-all duration-500 hover:shadow-[18px_18px_0px_#EF4444] bg-white shadow-[12px_12px_0px_#060E1C]">
    <div className="lg:w-1/2 h-80 bg-dark relative overflow-hidden border-b-[4px] lg:border-b-0 lg:border-r-[4px] border-dark">
       <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1510070112810-d4e9a46d9e91?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-700 opacity-60" />
       
       <div className="absolute top-6 left-6 flex items-center gap-4 bg-error border-[3px] border-dark px-6 py-2 shadow-[6px_6px_0px_#060E1C]">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-white uppercase tracking-widest">TRANSMISSION ACTIVE</span>
       </div>
       
       <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-yellow border-[4px] border-dark p-6 shadow-[8px_8px_0px_#060E1C]">
             <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-xl bg-white border-[3px] border-dark flex items-center justify-center">
                   <Users className="w-6 h-6 text-dark" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-dark/60 uppercase tracking-widest leading-none mb-1">LIVE SCHOLARS</p>
                   <p className="text-2xl font-black text-dark leading-none">1,248 SYNCED</p>
                </div>
             </div>
          </div>
       </div>
    </div>
    
    <div className="p-12 flex flex-col justify-between lg:w-1/2">
       <div>
          <span className="bg-info text-white border-[3px] border-dark px-6 py-2 text-[11px] font-black uppercase tracking-[0.4em] mb-8 inline-block shadow-[4px_4px_0px_#060E1C]">SESSION 24B</span>
          <h3 className="text-4xl font-black text-dark uppercase tracking-tighter leading-[0.9] mb-8 group-hover:text-info transition-colors">Quantum Mechanics & The Observer Effect</h3>
       </div>
       
       <div className="flex items-center gap-6">
          <button className="brutalist-button-primary bg-success w-full lg:w-auto h-20 flex items-center justify-center gap-4 text-[12px] shadow-[8px_8px_0px_#060E1C] px-10">
             <Zap className="w-6 h-6 fill-dark" />
             JOIN BROADCAST
          </button>
       </div>
    </div>
  </div>
);

export const ActionButton = ({ label, icon: Icon, primary }: { label: string, icon: any, primary?: boolean }) => (
  <button className={`w-full group brutalist-card h-20 flex items-center justify-between px-8 transition-all brutalist-3d ${primary ? 'bg-yellow shadow-[10px_10px_0px_#060E1C]' : 'bg-white shadow-[10px_10px_0px_#060E1C]'}`}>
    <div className="flex items-center gap-6">
       <div className={`w-12 h-12 border-[3px] border-dark rounded-xl flex items-center justify-center ${primary ? 'bg-white' : 'bg-off-white'}`}>
          <Icon className="w-6 h-6" />
       </div>
       <span className="text-[13px] font-black uppercase tracking-[0.2em]">{label}</span>
    </div>
    <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
  </button>
);

export const ObsidianCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`brutalist-card p-10 bg-white ${className}`}>
    {children}
  </div>
);

export const RankingTable = () => (
  <div className="brutalist-card bg-white p-10 shadow-[12px_12px_0px_#3B82F6]">
    <div className="flex justify-between items-center mb-10 border-b-[4px] border-dark pb-8">
       <h3 className="text-2xl font-black uppercase tracking-tight">Lead Rankings</h3>
       <Plus className="w-8 h-8 rotate-45 cursor-pointer brutalist-3d" />
    </div>
    <div className="space-y-6">
       {[
         { name: 'Dr. Sarah', score: '9.8', color: 'bg-yellow' },
         { name: 'Prof. Ade', score: '9.5', color: 'bg-info' },
         { name: 'Dr. Mike', score: '9.3', color: 'bg-success' }
       ].map((item, i) => (
         <div key={i} className={`flex items-center justify-between p-6 border-[3px] border-dark rounded-2xl brutalist-3d hover:translate-x-[-4px] hover:shadow-[8px_8px_0px_#060E1C] group transition-all`}>
            <div className="flex items-center gap-6">
               <div className={`w-12 h-12 border-[3px] border-dark rounded-full ${item.color} flex items-center justify-center font-black text-lg`}>
                  {i + 1}
               </div>
               <span className="font-black uppercase tracking-tight text-lg">{item.name}</span>
            </div>
            <span className="text-2xl font-black text-dark group-hover:text-error transition-colors">{item.score}</span>
         </div>
       ))}
    </div>
  </div>
);
