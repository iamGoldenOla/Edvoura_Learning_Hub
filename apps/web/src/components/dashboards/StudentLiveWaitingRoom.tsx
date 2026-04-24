'use client';

import { useState, useEffect } from 'react';
import { Video, PlayCircle, Clock, MessageCircle, Sparkles, Tv, Rocket } from 'lucide-react';
import type { StudentDashboardData } from '@/lib/app-context';

export default function StudentLiveWaitingRoom({ 
  dashboard,
  band 
}: { 
  dashboard: StudentDashboardData,
  band: string 
}) {
  const [isEarly, setIsEarly] = useState(true);
  const nextLesson = dashboard.upcomingLessons[0];
  
  // Age-appropriate videos
  const videos: Record<string, string> = {
    '1-3': 'https://www.youtube.com/embed/videoseries?list=PL6573D54D5D4E12C8',
    '4-6': 'https://www.youtube.com/embed/videoseries?list=PL_l7v58Gv7N4rYVvA-A-yH5x_8_X8_8_8',
    '7-12': 'https://www.youtube.com/embed/videoseries?list=PL8dPuuaLjXtN0ge7yDk_UA0ldZJdhwkoV',
  };

  const videoUrl = videos[band] || videos['1-3'];

  // Effect to "check" for tutor (mock)
  useEffect(() => {
    if (nextLesson?.joinUrl) {
       // If there's a join URL, maybe they aren't early anymore?
       // For demo, we'll stay early for 5 seconds
       const timer = setTimeout(() => setIsEarly(false), 5000);
       return () => clearTimeout(timer);
    }
  }, [nextLesson]);

  if (!nextLesson) {
    return (
      <div className="py-24 text-center bg-white border-[4px] border-dark border-dashed rounded-[60px] shadow-[10px_10px_0px_#060E1C]">
        <div className="text-7xl mb-6">🏜️</div>
        <h3 className="text-3xl font-black text-dark">No Classes Right Now</h3>
        <p className="text-xl font-semibold text-dark/40 italic text-normal">Check back later or explore your garden!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white border-[4px] border-dark rounded-[40px] p-8 shadow-[10px_10px_0px_#060E1C]">
        <div className="flex items-center gap-6">
           <div className="h-20 w-20 rounded-full bg-red-100 border-[3px] border-dark flex items-center justify-center text-4xl animate-pulse">
              🎥
           </div>
           <div>
              <h1 className="text-4xl font-black text-dark tracking-tight leading-none">{nextLesson.title}</h1>
              <p className="text-lg font-bold text-dark/50 mt-2">{nextLesson.subjectName} • {nextLesson.classTitle}</p>
           </div>
        </div>
        <div className="px-6 py-3 bg-slate-100 border-[3px] border-dark rounded-2xl flex items-center gap-3">
           <div className={`h-3 w-3 rounded-full animate-ping ${isEarly ? 'bg-orange-500' : 'bg-red-500'}`} />
           <span className="text-sm font-black uppercase tracking-widest text-dark">
             {isEarly ? 'Waiting Room' : 'Class is Live!'}
           </span>
        </div>
      </header>

      {isEarly ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-8 space-y-8">
              <div className="bg-white border-[6px] border-dark rounded-[60px] overflow-hidden shadow-[16px_16px_0px_#060E1C]">
                 <div className="bg-indigo-600 p-6 border-b-[4px] border-dark flex items-center justify-between">
                    <div className="flex items-center gap-3 text-white">
                       <Tv className="h-6 w-6" />
                       <span className="text-xs font-black uppercase tracking-widest">Edvoura AI: Pre-Class Fun</span>
                    </div>
                    <span className="px-4 py-1 bg-white/20 rounded-full text-[10px] font-black text-white uppercase tracking-widest">
                       Tutor joins soon
                    </span>
                 </div>
                 <div className="aspect-video bg-dark">
                    <iframe 
                      width="100%" 
                      height="100%" 
                      src={videoUrl}
                      title="Educational Video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                 </div>
                 <div className="p-8 bg-slate-50 border-t-[4px] border-dark">
                    <div className="flex items-start gap-4 text-left">
                       <div className="h-12 w-12 rounded-2xl bg-white border-[3px] border-dark flex items-center justify-center text-2xl shrink-0">🤖</div>
                       <div>
                          <p className="text-sm font-black text-dark uppercase tracking-tight">Edvoura AI says:</p>
                          <p className="text-sm font-bold text-dark/60 normal-case italic mt-1 leading-relaxed">
                            "Hey explorer! While we wait for your tutor to open the classroom, I've found this fun video for you. Watch and learn!"
                          </p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="lg:col-span-4 space-y-6 text-left">
              <div className="bg-white border-[4px] border-dark rounded-[40px] p-8 shadow-[8px_8px_0px_#060E1C] space-y-6">
                 <h3 className="text-2xl font-black text-dark uppercase tracking-tight flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-yellow" />
                    Who's Here?
                 </h3>
                 <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="h-10 w-10 rounded-full bg-blue-100 border-2 border-dark flex items-center justify-center font-black">U</div>
                       <p className="text-sm font-bold text-dark">You</p>
                    </div>
                    <div className="flex items-center gap-3 opacity-40 italic">
                       <div className="h-10 w-10 rounded-full bg-slate-100 border-2 border-dashed border-dark flex items-center justify-center font-black">?</div>
                       <p className="text-sm font-bold text-dark">Waiting for others...</p>
                    </div>
                 </div>
              </div>

              <div className="bg-yellow border-[4px] border-dark rounded-[40px] p-8 shadow-[8px_8px_0px_#060E1C] space-y-4">
                 <h3 className="text-xl font-black text-dark uppercase tracking-tight">Session Info:</h3>
                 <div className="p-4 bg-white border-[3px] border-dark rounded-2xl">
                    <p className="text-[10px] font-black text-dark/30 uppercase tracking-widest mb-1">Time</p>
                    <p className="font-bold text-dark">{new Date(nextLesson.scheduledStartAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                 </div>
              </div>
           </div>
        </div>
      ) : (
        <div className="bg-white border-[6px] border-dark rounded-[60px] p-20 shadow-[20px_20px_0px_#060E1C] text-center space-y-10 animate-in zoom-in-95 duration-500">
           <div className="h-32 w-32 rounded-full bg-green-100 border-[4px] border-dark flex items-center justify-center text-6xl mx-auto animate-bounce">
              👨‍🏫
           </div>
           <div className="space-y-4">
              <h2 className="text-5xl font-black text-dark tracking-tight">Your Tutor is Ready!</h2>
              <p className="text-2xl font-bold text-dark/60 italic text-normal">The classroom door is open. Step inside!</p>
           </div>
           
           <a 
             href={nextLesson.joinUrl || '#'}
             target="_blank"
             rel="noreferrer"
             className="inline-flex items-center gap-4 px-12 py-6 bg-red-600 text-white border-[4px] border-dark rounded-[32px] font-black uppercase text-xl tracking-widest shadow-[12px_12px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
           >
              <PlayCircle className="h-10 w-10" /> Join Live Meet
           </a>
        </div>
      )}
    </div>
  );
}
