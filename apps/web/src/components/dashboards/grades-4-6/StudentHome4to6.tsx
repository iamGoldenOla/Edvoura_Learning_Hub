'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ActivityGraph, 
  RadialRetention, 
  LiveClassCard, 
  RankingTable, 
  ActionButton,
  ObsidianCard
} from '../shared/MockupComponents';
import { 
  Rocket, 
  Star, 
  Zap, 
  Trophy, 
  MessageSquare, 
  Layout, 
  Award, 
  Flame,
  ChevronRight,
  MoreHorizontal,
  Target,
  BookMarked,
  Calendar,
  Activity,
  Cpu,
  ShieldAlert,
  Gamepad2,
  Map
} from 'lucide-react';

interface StudentProps {
  enrollments: any[];
  assignments: any[];
  upcomingLessons: any[];
}

export default function StudentHome4to6({ enrollments, assignments, upcomingLessons }: StudentProps) {
  return (
    <div className="space-y-16 max-w-[1600px] mx-auto pb-32">
      
      {/* Explorer Command Header */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-12 border-b-[4px] border-dark pb-16"
      >
        <div className="flex items-center gap-10">
           <div className="relative group brutalist-3d">
              <div className="w-32 h-32 bg-info border-[4px] border-dark rounded-3xl flex items-center justify-center shadow-[10px_10px_0px_#060E1C] group-hover:rotate-[-6deg] transition-transform">
                 <Rocket className="w-16 h-16 text-white" />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-yellow text-dark text-[11px] font-black px-4 py-2 border-[3px] border-dark shadow-[4px_4px_0px_#060E1C]">
                 EXPLORER
              </div>
           </div>
           <div>
             <div className="flex items-center gap-4 mb-4">
                <span className="bg-yellow/20 text-dark border-[2px] border-dark px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em]">Sector Progress: Alpha II</span>
             </div>
             <h1 className="text-dark font-heading font-black text-7xl tracking-tighter leading-[0.85] mb-4">
               The <span className="text-success">Frontier.</span>
             </h1>
             <p className="text-dark/40 text-sm font-black uppercase tracking-[0.2em] max-w-xl leading-relaxed">
               Welcome back, Explorer. Your current mission is <span className="text-info">85% Complete</span>. 
               Ready to sync with the next module?
             </p>
           </div>
        </div>
        
        <div className="flex items-center gap-6">
           <div className="brutalist-card bg-white p-6 flex flex-col items-center justify-center min-w-[150px] brutalist-3d hover:bg-yellow">
              <Flame className="w-8 h-8 text-error mb-2" />
              <span className="text-3xl font-black text-dark">12</span>
              <span className="text-[10px] font-black uppercase opacity-40">Day Streak</span>
           </div>
           <div className="brutalist-card bg-info p-6 flex flex-col items-center justify-center min-w-[150px] brutalist-3d group">
              <Award className="w-8 h-8 text-white mb-2 group-hover:rotate-12 transition-transform" />
              <span className="text-3xl font-black text-white">4,250</span>
              <span className="text-[10px] font-black uppercase text-white/60">Total XP</span>
           </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-16">
        
        {/* Mission Core */}
        <div className="xl:col-span-9 space-y-16">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <ActivityGraph />
              
              <div className="grid grid-cols-2 gap-8">
                 <div className="brutalist-card p-10 flex flex-col justify-between group cursor-pointer brutalist-3d bg-success/10 hover:bg-white">
                    <Zap className="w-10 h-10 text-success mb-6" />
                    <div>
                       <span className="text-5xl font-black block leading-none mb-2 tabular-nums">92%</span>
                       <span className="text-[10px] font-black text-dark uppercase tracking-widest opacity-40">Efficiency</span>
                    </div>
                 </div>
                 
                 <div className="brutalist-card p-10 flex flex-col justify-between group cursor-pointer brutalist-3d bg-yellow/10 hover:bg-white">
                    <Target className="w-10 h-10 text-yellow mb-6" />
                    <div>
                       <span className="text-5xl font-black block leading-none mb-2 tabular-nums">08</span>
                       <span className="text-[10px] font-black text-dark uppercase tracking-widest opacity-40">Active Missions</span>
                    </div>
                 </div>
                 
                 <div className="col-span-2">
                    <RadialRetention value={84} />
                 </div>
              </div>
           </div>

           {/* Tactical View */}
           <div className="grid grid-cols-1 xl:grid-cols-3 gap-16">
              <div className="xl:col-span-2">
                 <LiveClassCard />
              </div>
              
              {/* Squad Rankings */}
              <div className="xl:col-span-1 bg-white brutalist-card p-10">
                 <div className="flex justify-between items-center mb-10 border-b-[3px] border-dark pb-6">
                    <h3 className="text-xl font-black uppercase tracking-tight">Squad Ranks</h3>
                    <Trophy className="w-6 h-6 text-yellow" />
                 </div>
                 
                 <div className="flex items-end justify-center gap-5 h-48 mb-12">
                    <div className="flex-1 bg-off-white border-[3px] border-dark h-[50%] relative brutalist-3d group">
                       <span className="absolute -top-10 w-full text-center text-[11px] font-black uppercase">#2</span>
                       <div className="absolute -bottom-6 w-full flex justify-center">
                          <div className="w-12 h-12 rounded-xl border-[2px] border-dark bg-white overflow-hidden p-1">
                             <img src="https://api.dicebear.com/7.x/bottts/svg?seed=ScholarA" alt="Avatar" />
                          </div>
                       </div>
                    </div>
                    <div className="flex-1 bg-yellow border-[3px] border-dark h-[100%] relative brutalist-3d shadow-[10px_10px_0px_#060E1C] group">
                       <span className="absolute -top-12 w-full text-center text-[12px] font-black text-dark uppercase">ALPHA</span>
                       <div className="absolute -bottom-8 w-full flex justify-center">
                          <div className="w-16 h-16 rounded-2xl border-[3px] border-dark bg-white overflow-hidden p-1 scale-110">
                             <img src="https://api.dicebear.com/7.x/bottts/svg?seed=EliteUser" alt="Avatar" />
                          </div>
                       </div>
                    </div>
                    <div className="flex-1 bg-off-white border-[3px] border-dark h-[35%] relative brutalist-3d group">
                       <span className="absolute -top-10 w-full text-center text-[11px] font-black uppercase">#3</span>
                       <div className="absolute -bottom-6 w-full flex justify-center">
                          <div className="w-12 h-12 rounded-xl border-[2px] border-dark bg-white overflow-hidden p-1">
                             <img src="https://api.dicebear.com/7.x/bottts/svg?seed=ScholarC" alt="Avatar" />
                          </div>
                       </div>
                    </div>
                 </div>
                 
                 <p className="text-[11px] font-black text-center uppercase tracking-widest opacity-40 mb-10 pt-4">
                    Top in Grade 5 Science!
                 </p>
                 
                 <button className="w-full py-5 border-[3px] border-dark bg-white text-dark font-black uppercase text-[10px] tracking-widest hover:bg-dark hover:text-white transition-all shadow-[6px_6px_0px_#060E1C]">
                    See Rankings
                 </button>
              </div>
           </div>

           {/* Mission Archive (Subject Rooms) */}
           <div className="space-y-10">
              <h3 className="text-3xl font-black uppercase tracking-tighter pl-1 text-dark">Sector Objectives</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                 {[
                   { name: 'Mathematics', icon: Map, color: 'bg-blue-100', text: 'text-info', progress: 85, badge: 'READY' },
                   { name: 'Science', icon: Rocket, color: 'bg-green-100', text: 'text-success', progress: 62, badge: 'ACTIVE' },
                   { name: 'Coding Hub', icon: Gamepad2, color: 'bg-yellow-100', text: 'text-yellow', progress: 41, badge: 'NEW' },
                   { name: 'Literature', icon: BookMarked, color: 'bg-pink-100', text: 'text-error', progress: 95, badge: 'SYNCED' }
                 ].map((sub, i) => (
                   <div key={i} className={`brutalist-card p-10 group cursor-pointer transition-all brutalist-3d ${sub.color} hover:bg-white`}>
                      <div className="flex justify-between items-start mb-10">
                         <div className={`w-14 h-14 border-[3px] border-dark rounded-2xl bg-white flex items-center justify-center group-hover:${sub.text} transition-colors`}>
                            <sub.icon className="w-7 h-7" />
                         </div>
                         <span className={`text-[9px] font-black px-4 py-2 border-[2px] border-dark shadow-[3px_3px_0px_#060E1C] ${sub.badge === 'NEW' ? 'bg-yellow text-dark' : 'bg-white text-dark'}`}>
                            {sub.badge}
                         </span>
                      </div>
                      <h4 className="text-xl font-black uppercase tracking-tight mb-4 group-hover:text-dark">{sub.name}</h4>
                      <div className="h-4 border-[2px] border-dark bg-white overflow-hidden mb-3">
                         <motion.div 
                           initial={{ width: 0 }}
                           whileInView={{ width: `${sub.progress}%` }}
                           className={`h-full ${sub.text.replace('text-', 'bg-')} border-r-[2px] border-dark`} 
                         />
                      </div>
                      <span className="text-[10px] font-black uppercase opacity-30 tracking-widest">{sub.progress}% SYNCED</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Action Sidebar */}
        <div className="xl:col-span-3 space-y-16">
           <div className="brutalist-card p-10 bg-white space-y-8">
              <div className="flex items-center justify-between mb-8 border-b-[3px] border-dark pb-6">
                 <h3 className="text-xl font-black uppercase tracking-tight">Operations</h3>
                 <span className="bg-error border-[2px] border-dark text-white text-[10px] font-black px-4 py-1.5 shadow-[4px_4px_0px_#060E1C]">2 ALERT</span>
              </div>
              
              <div className="space-y-6 mb-12">
                 {[
                   { t: 'Quantum Fractions', xp: '120 XP', d: '2 Days Left' },
                   { t: 'Solar Energy Lab', xp: '450 XP', d: '12 Hours Left' },
                 ].map((m, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ x: 5 }}
                      className="bg-off-white border-[3px] border-dark p-6 cursor-pointer group hover:bg-yellow transition-all brutalist-3d"
                    >
                       <h4 className="text-sm font-black uppercase mb-3 group-hover:text-dark leading-tight">{m.t}</h4>
                       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                          <span className="text-info">{m.xp}</span>
                          <span className="opacity-40">{m.d}</span>
                       </div>
                    </motion.div>
                 ))}
              </div>

              <div className="space-y-6">
                 <ActionButton label="Enter Rocket" icon={Rocket} primary />
                 <ActionButton label="Quiz Telemetry" icon={Target} />
                 <ActionButton label="Squad Chat" icon={MessageSquare} />
                 <ActionButton label="Mission Calendar" icon={Calendar} />
              </div>
           </div>

           {/* Mission Objectives */}
           <div className="brutalist-card p-10 bg-white">
              <h3 className="text-xl font-black uppercase tracking-tight mb-10 border-b-[3px] border-dark pb-6 flex items-center gap-4">
                 <ShieldAlert className="w-7 h-7 text-yellow" /> DAILY GOALS
              </h3>
              <div className="space-y-6">
                 {[
                   { task: 'Physics Level 1', done: true },
                   { task: 'Morning Broadcast', done: true },
                   { task: 'Daily 500 XP', done: false },
                   { task: 'Review Lab Work', done: false },
                 ].map((goal, i) => (
                    <div key={i} className="flex items-center gap-5 group cursor-pointer transition-all">
                       <div className={`w-8 h-8 border-[3px] border-dark flex items-center justify-center shrink-0 transition-all shadow-[3px_3px_0px_#060E1C] ${
                         goal.done ? 'bg-success border-success' : 'bg-white group-hover:border-yellow'
                       }`}>
                          {goal.done && <ChevronRight className="w-5 h-5 text-navy font-black" />}
                       </div>
                       <span className={`text-[12px] font-black uppercase tracking-widest ${goal.done ? 'text-dark/20 line-through' : 'text-dark'}`}>
                          {goal.task}
                       </span>
                    </div>
                 ))}
              </div>
              
              <button className="w-full mt-12 py-5 border-[3px] border-dark bg-yellow text-dark font-black uppercase text-[11px] tracking-[0.3em] hover:bg-dark hover:text-white transition-all shadow-[6px_6px_0px_#060E1C]">
                 GLOBAL SYNC
              </button>
           </div>
        </div>

      </div>
    </div>
  );
}



