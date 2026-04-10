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
  Smile, 
  Star, 
  Sparkles, 
  Rocket, 
  Sprout, 
  Palette, 
  Puzzle, 
  Sticker,
  Zap,
  MessageSquare,
  Clock,
  ChevronRight,
  Trophy,
  Activity,
  Cpu,
  Heart,
  Cloud,
  Gamepad
} from 'lucide-react';

interface StudentProps {
  enrollments: any[];
  assignments: any[];
  upcomingLessons: any[];
}

export default function StudentHome1to3({ enrollments, assignments, upcomingLessons }: StudentProps) {
  return (
    <div className="space-y-16 max-w-[1600px] mx-auto pb-32">
      
      {/* Playful Adventure Billboard */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="brutalist-header relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow/5 border-l-[3px] border-b-[3px] border-dark -rotate-12 translate-x-12 -translate-y-12" />
        
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-16 relative z-10">
          <div className="flex items-center gap-10">
             <motion.div 
               whileHover={{ rotate: [0, -10, 10, 0], scale: 1.15 }}
               className="relative brutalist-3d"
             >
                <div className="w-40 h-40 bg-yellow border-[5px] border-dark rounded-[4rem] flex items-center justify-center shadow-[15px_15px_0px_#060E1C] overflow-hidden group">
                   <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                   <Smile className="w-24 h-24 text-dark group-hover:scale-125 transition-transform" />
                </div>
                <motion.div 
                  animate={{ y: [0, -12, 0], rotate: [0, 8, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="absolute -top-6 -right-6 bg-error text-white text-[12px] font-black px-6 py-3 border-[4px] border-dark shadow-[6px_6px_0px_#060E1C] rotate-12"
                >
                   READY!
                </motion.div>
             </motion.div>
             <div>
               <div className="flex items-center gap-4 mb-6">
                  <span className="bg-pink border-[3px] border-dark text-dark px-6 py-2 text-[12px] font-black uppercase tracking-[0.4em] shadow-[4px_4px_0px_#060E1C]">ADVENTURE LV. 05</span>
               </div>
               <h1 className="text-dark font-heading font-black text-8xl tracking-tighter leading-[0.8] mb-6">
                 HI, <span className="text-info">EXPLORER!</span>
               </h1>
               <p className="text-dark/40 text-[18px] font-black uppercase tracking-[0.25em] max-w-2xl leading-relaxed">
                 SYNC STATUS: <span className="text-success">OPTIMAL</span>. YOU COLLECTED <span className="text-yellow underline decoration-dark decoration-[4px]">145 STARS</span> THIS WEEK!
               </p>
             </div>
          </div>
          
          <div className="flex items-center gap-8">
             <div className="brutalist-card bg-success/10 p-10 flex items-center gap-8 brutalist-3d group shadow-[12px_12px_0px_#22C55E]">
                <div className="w-20 h-20 bg-white border-[4px] border-dark rounded-3xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                   <Star className="w-10 h-10 text-yellow fill-yellow animate-pulse" />
                </div>
                <div>
                   <span className="text-[12px] font-black uppercase opacity-40 mb-2 block">HOME MESSAGE</span>
                   <p className="text-xl font-black uppercase tracking-tight text-dark group-hover:text-success transition-colors max-w-[200px]">"GO GET 'EM, CHAMP!"</p>
                </div>
             </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-16">
        
        {/* Adventure Hub */}
        <div className="xl:col-span-9 space-y-16">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <ActivityGraph />
              
              <div className="grid grid-cols-1 gap-8">
                 <div className="brutalist-card p-10 flex items-center justify-between group cursor-pointer brutalist-3d bg-white hover:bg-yellow">
                    <div className="flex items-center gap-6">
                       <div className="w-20 h-20 bg-success/10 border-[3px] border-dark rounded-3xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                          <Sprout className="w-10 h-10 text-success" />
                       </div>
                       <div>
                          <span className="text-5xl font-black block leading-none mb-1">LV 4</span>
                          <span className="text-[10px] font-black text-dark uppercase tracking-widest opacity-40">Magic Garden</span>
                       </div>
                    </div>
                    <button className="brutalist-button-primary bg-white text-[10px]">
                       Water Seed
                    </button>
                 </div>
                 
                 <RadialRetention value={72} />
              </div>
           </div>

           {/* Spotlight */}
           <div className="grid grid-cols-1 xl:grid-cols-3 gap-16">
              <div className="xl:col-span-2">
                 <LiveClassCard />
              </div>
              
              {/* Sticker Collection */}
              <div className="xl:col-span-1 brutalist-card p-10 bg-white flex flex-col items-center">
                 <div className="w-full flex justify-between items-center mb-10 border-b-[3px] border-dark pb-6">
                    <h3 className="text-xl font-black uppercase tracking-tight">Sticker Box</h3>
                    <Sticker className="w-6 h-6 text-info" />
                 </div>
                 
                 <div className="grid grid-cols-3 gap-5 mb-12 w-full">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <motion.div 
                        key={i} 
                        whileHover={{ scale: 1.2, rotate: 15 }}
                        className={`aspect-square border-[3px] border-dark rounded-2xl flex items-center justify-center brutalist-3d ${i < 4 ? 'bg-yellow' : 'bg-off-white opacity-20'}`}
                      >
                         {i < 4 ? <Heart className="w-6 h-6 text-dark fill-dark" /> : <Cloud className="w-6 h-6 text-dark" />}
                      </motion.div>
                    ))}
                    <div className="aspect-square border-[3px] border-dashed border-dark/20 rounded-2xl flex items-center justify-center text-[10px] font-black opacity-20">
                       +8
                    </div>
                 </div>
                 
                 <button className="brutalist-button-primary w-full bg-info text-white">
                    Explore Vault
                 </button>
              </div>
           </div>

           {/* Story Tracks */}
           <div className="space-y-10">
              <h3 className="text-3xl font-black uppercase tracking-tighter">Choose Your Path</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                 {[
                   { name: 'Animal Fun', icon: Smile, color: 'bg-orange-100', text: 'text-orange-600', level: '1', progress: 100 },
                   { name: 'Space Trip', icon: Rocket, color: 'bg-blue-100', text: 'text-info', level: '2', progress: 45 },
                   { name: 'Color Lab', icon: Palette, color: 'bg-pink-100', text: 'text-error', level: '1', progress: 80 },
                   { name: 'Puzzle Day', icon: Puzzle, color: 'bg-green-100', text: 'text-success', level: '3', progress: 20 }
                 ].map((story, i) => (
                   <div key={i} className={`brutalist-card p-10 text-center group cursor-pointer transition-all brutalist-3d ${story.color} hover:bg-white`}>
                      <div className={`w-20 h-20 mx-auto border-[3px] border-dark rounded-[2rem] bg-white flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-[6px_6px_0px_#060E1C]`}>
                         <story.icon className={`w-10 h-10 ${story.text}`} />
                      </div>
                      <h4 className="text-xl font-black uppercase tracking-tight mb-4 group-hover:text-dark">{story.name}</h4>
                      <div className="h-4 border-[2px] border-dark bg-white overflow-hidden mb-4">
                         <div className={`h-full ${story.progress === 100 ? 'bg-success' : 'bg-yellow'} border-r-[2px] border-dark`} style={{ width: `${story.progress}%` }} />
                      </div>
                      <span className="text-[9px] font-black uppercase opacity-30">TRACK {story.level} • {story.progress}%</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Adventure Actions */}
        <div className="xl:col-span-3 space-y-16">
           <div className="brutalist-card p-10 bg-white space-y-8">
              <div className="flex items-center justify-between mb-10 border-b-[3px] border-dark pb-6">
                 <h3 className="text-xl font-black uppercase tracking-tight">Ready?</h3>
                 <Sparkles className="w-6 h-6 text-yellow fill-yellow" />
              </div>
              
              <div className="space-y-6">
                 {[
                   { title: 'Counting Apples', reward: '+10 Stars', done: true },
                   { title: 'Color the Dino', reward: '+15 Stars', done: false },
                   { title: 'Friendly Shapes', reward: '+20 Stars', done: false },
                 ].map((item, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ x: 5 }}
                      className={`flex items-center gap-5 p-6 border-[3px] border-dark rounded-2xl transition-all cursor-pointer brutalist-3d ${
                        item.done ? 'bg-success/10 opacity-40' : 'bg-white hover:bg-yellow shadow-[6px_6px_0px_#060E1C]'
                      }`}
                    >
                       <div className={`w-8 h-8 rounded-xl border-[2px] border-dark flex items-center justify-center shrink-0 ${
                         item.done ? 'bg-success' : 'bg-off-white'
                       }`}>
                          {item.done && <ChevronRight className="w-5 h-5 rotate-90" />}
                       </div>
                       <div className="flex-1">
                          <h4 className={`text-xs font-black uppercase tracking-tight leading-none mb-2 ${item.done ? 'line-through' : 'text-dark'}`}>
                             {item.title}
                          </h4>
                          <span className="text-[9px] font-black uppercase opacity-30">{item.reward}</span>
                       </div>
                    </motion.div>
                 ))}
              </div>

              <div className="space-y-6 pt-8">
                 <ActionButton label="Start Rocket!" icon={Rocket} primary />
                 <ActionButton label="Play Zone" icon={Gamepad} />
                 <ActionButton label="Call Mom" icon={Smile} />
              </div>
           </div>

           {/* Star Champions */}
           <div className="brutalist-card p-10 bg-white">
              <h3 className="text-xl font-black uppercase tracking-tight mb-10 text-center border-b-[3px] border-dark pb-6 flex items-center justify-center gap-4">
                 <Trophy className="w-7 h-7 text-yellow" /> STAR LEADERS
              </h3>
              
              <div className="space-y-6 mb-12">
                 {[
                   { name: 'Felix', stars: 450, rank: 1, you: true },
                   { name: 'Ayo', stars: 420, rank: 2 },
                   { name: 'Lila', stars: 380, rank: 3 },
                 ].map((champ, i) => (
                    <div key={i} className={`flex items-center justify-between p-6 border-[3px] border-dark rounded-2xl transition-all brutalist-3d ${
                      champ.you ? 'bg-yellow shadow-[6px_6px_0px_#060E1C]' : 'bg-white hover:bg-off-white'
                    }`}>
                       <div className="flex items-center gap-5">
                          <span className={`text-sm font-black ${champ.rank === 1 ? 'text-error' : 'text-dark/20'}`}>#{champ.rank}</span>
                          <div className="w-12 h-12 rounded-xl border-[2px] border-dark bg-white p-1">
                             <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${champ.name}`} alt="avatar" />
                          </div>
                          <div>
                             <span className="text-xs font-black uppercase tracking-tight">{champ.name}</span>
                             {champ.you && <span className="text-[8px] font-black bg-dark text-white px-2 py-0.5 ml-2">YOU</span>}
                          </div>
                       </div>
                       <span className="text-sm font-black text-dark">{champ.stars}⭐</span>
                    </div>
                 ))}
              </div>
              
              <button className="w-full py-5 border-[3px] border-dark bg-off-white text-dark font-black uppercase text-[10px] tracking-widest hover:bg-dark hover:text-white transition-all">
                 View All Heroes
              </button>
           </div>
        </div>

      </div>
    </div>
  );
}
