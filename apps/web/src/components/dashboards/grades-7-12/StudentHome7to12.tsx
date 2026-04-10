'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ActivityGraph, 
  RadialRetention, 
  LiveClassCard, 
  RankingTable, 
  ActionButton
} from '../shared/MockupComponents';
import { 
  Calendar, Users, Crown, Bell, Search, Zap, Activity, 
  ChevronRight, GraduationCap, Flame, Target, BookOpen, Shield, MessageCircle
} from 'lucide-react';

interface StudentProps {
  enrollments: any[];
  assignments: any[];
  upcomingLessons: any[];
}

export default function StudentHome7to12({ enrollments, assignments, upcomingLessons }: StudentProps) {
  return (
    <div className="space-y-16 max-w-[1600px] mx-auto pb-32">
      
      {/* Neo-Brutalist Header */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10 border-b-[4px] border-dark pb-16"
      >
        <div className="flex items-center gap-10">
           <div className="relative brutalist-3d group">
              <div className="w-32 h-32 bg-yellow border-[4px] border-dark rounded-2xl flex items-center justify-center shadow-[10px_10px_0px_#060E1C] group-hover:rotate-6 transition-transform">
                 <GraduationCap className="w-16 h-16 text-dark" />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-error text-white text-[12px] font-black px-4 py-2 border-[3px] border-dark shadow-[4px_4px_0px_#060E1C]">
                 SENIOR
              </div>
           </div>
           <div>
             <div className="flex items-center gap-4 mb-4">
                <span className="bg-success/20 text-success border-[2px] border-success px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em]">Academic Status: Optimal</span>
             </div>
             <h1 className="text-dark font-heading font-black text-7xl tracking-tighter leading-[0.85] mb-4">
               The <span className="text-info">Cockpit.</span>
             </h1>
             <p className="text-dark/40 text-sm font-black uppercase tracking-[0.2em] max-w-xl leading-relaxed">
               Welcome back, Scholar. All systems are operational. Your next core session begins in <span className="text-error">02:45:00</span>.
             </p>
           </div>
        </div>
        
        <div className="flex items-center gap-6">
           <div className="brutalist-card bg-off-white p-6 flex flex-col items-center justify-center min-w-[140px] brutalist-3d">
              <Flame className="w-8 h-8 text-error mb-2" />
              <span className="text-2xl font-black text-dark">12</span>
              <span className="text-[9px] font-black uppercase opacity-40">Day Streak</span>
           </div>
           <div className="brutalist-card bg-white p-6 flex flex-col items-center justify-center min-w-[140px] brutalist-3d">
              <Target className="w-8 h-8 text-info mb-2" />
              <span className="text-2xl font-black text-dark">94%</span>
              <span className="text-[9px] font-black uppercase opacity-40">Proficiency</span>
           </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-16">
        
        {/* Dashboard Heart */}
        <div className="xl:col-span-9 space-y-16">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <ActivityGraph />
              
              <div className="grid grid-cols-2 gap-8">
                 <div className="brutalist-card p-10 flex flex-col justify-between group cursor-pointer brutalist-3d bg-pink-50 hover:bg-white">
                    <Zap className="w-10 h-10 text-error mb-6" />
                    <div>
                       <span className="text-5xl font-black block leading-none mb-2 tabular-nums">92%</span>
                       <span className="text-[10px] font-black text-dark uppercase tracking-widest opacity-40">Mastery Index</span>
                    </div>
                 </div>
                 
                 <div className="brutalist-card p-10 flex flex-col justify-between group cursor-pointer brutalist-3d bg-blue-50 hover:bg-white">
                    <GraduationCap className="w-10 h-10 text-info mb-6" />
                    <div>
                       <span className="text-5xl font-black block leading-none mb-2 tabular-nums">24</span>
                       <span className="text-[10px] font-black text-dark uppercase tracking-widest opacity-40">Course Credits</span>
                    </div>
                 </div>
                 
                 <div className="col-span-2">
                    <RadialRetention value={88} />
                 </div>
              </div>
           </div>

           {/* Central Feed */}
           <div className="grid grid-cols-1 xl:grid-cols-3 gap-16">
              <div className="xl:col-span-2">
                 <LiveClassCard />
              </div>
              
              <div className="xl:col-span-1 space-y-8">
                 <div className="brutalist-card p-10 bg-white h-full">
                    <div className="flex justify-between items-center mb-10 border-b-[3px] border-dark pb-6">
                       <h3 className="text-xl font-black uppercase tracking-tight">Focus Goals</h3>
                       <Target className="w-6 h-6 text-error" />
                    </div>
                    
                    <div className="space-y-6">
                       {[
                         { t: 'Calculus Module 4', d: 'Due Today', p: 80, c: 'bg-info' },
                         { t: 'Organic Chem Lab', d: 'Due Tomorrow', p: 40, c: 'bg-success' },
                         { t: 'History Essay Draft', d: 'In Progress', p: 15, c: 'bg-yellow' }
                       ].map((goal, i) => (
                         <div key={i} className="group cursor-pointer">
                            <div className="flex justify-between mb-3 items-end">
                               <span className="text-[11px] font-black uppercase">{goal.t}</span>
                               <span className="text-[9px] font-black opacity-30 uppercase">{goal.d}</span>
                            </div>
                            <div className="h-4 border-[2px] border-dark bg-off-white overflow-hidden">
                               <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${goal.p}%` }}
                                 className={`h-full ${goal.c} border-r-[2px] border-dark shadow-[2px_0_0_#060E1C]`} 
                               />
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>

           {/* Learning Modules */}
           <div className="space-y-10">
              <h3 className="text-3xl font-black uppercase tracking-tighter">Enrolled Sectors</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                 {[
                   { name: 'Physics AP', prof: 'Dr. Sarah', progress: 85, color: 'bg-blue-100', text: 'text-info' },
                   { name: 'Chemistry', prof: 'Prof. Ade', progress: 62, color: 'bg-green-100', text: 'text-success' },
                   { name: 'Pure Math', prof: 'Dr. Mike', progress: 41, color: 'bg-yellow-100', text: 'text-yellow' },
                   { name: 'Government', prof: 'Prof. Chen', progress: 95, color: 'bg-pink-100', text: 'text-error' }
                 ].map((sub, i) => (
                   <div key={i} className={`brutalist-card p-8 group cursor-pointer transition-all brutalist-3d ${sub.color} hover:bg-white`}>
                      <div className="flex justify-between items-start mb-8">
                         <div className={`w-14 h-14 border-[3px] border-dark rounded-xl bg-white flex items-center justify-center group-hover:bg-dark transition-colors`}>
                            <BookOpen className={`w-7 h-7 ${sub.text} group-hover:text-white transition-colors`} />
                         </div>
                         <div className="w-8 h-8 rounded-full border-[2px] border-dark bg-white overflow-hidden">
                            <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${sub.name}`} alt="avatar" />
                         </div>
                      </div>
                      <h4 className="text-xl font-black uppercase tracking-tight mb-2 group-hover:text-dark">{sub.name}</h4>
                      <p className="text-[10px] font-black uppercase opacity-30 mb-6">{sub.prof}</p>
                      
                      <div className="flex items-center gap-4">
                         <div className="flex-1 h-3 border-[2px] border-dark bg-white">
                            <div className={`h-full ${sub.text.replace('text-', 'bg-')} border-r-[2px] border-dark`} style={{ width: `${sub.progress}%` }} />
                         </div>
                         <span className="text-[10px] font-black">{sub.progress}%</span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Sidebar Actions */}
        <div className="xl:col-span-3 space-y-16">
           <div className="brutalist-card p-10 bg-white space-y-8">
              <div className="flex items-center justify-between mb-4 border-b-[3px] border-dark pb-6">
                 <h3 className="text-xl font-black uppercase tracking-tight">Flash Actions</h3>
                 <Crown className="w-5 h-5 text-yellow fill-yellow" />
              </div>
              <div className="space-y-6">
                 <ActionButton label="Enter Lecture" icon={GraduationCap} primary />
                 <ActionButton label="Exam Centre" icon={Target} />
                 <ActionButton label="Group Comms" icon={MessageCircle} />
                 <ActionButton label="Study Schedule" icon={Calendar} />
              </div>
           </div>

           <RankingTable />

           <div className="brutalist-card p-8 bg-error/10 border-error group cursor-pointer brutalist-3d hover:bg-error/20">
              <div className="flex items-center gap-4 mb-6">
                 <Shield className="w-8 h-8 text-error" />
                 <h3 className="text-xl font-black text-error uppercase tracking-tight">Security Clear</h3>
              </div>
              <p className="text-[11px] font-black text-error/60 uppercase leading-relaxed mb-6">
                 All upcoming evaluations are end-to-end encrypted. Proctored sessions are ready.
              </p>
              <button className="w-full py-4 border-[3px] border-error bg-white text-error font-black uppercase text-[10px] tracking-widest hover:bg-error hover:text-white transition-all">
                 System Check
              </button>
           </div>
        </div>

      </div>
    </div>
  );
}
