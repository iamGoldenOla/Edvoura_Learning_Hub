import React from 'react';

interface StudentProps {
  enrollments: any[];
  assignments: any[];
  upcomingLessons: any[];
}

export default function StudentHome4to6({ enrollments, assignments, upcomingLessons }: StudentProps) {
  const pendingMissions = assignments.filter((a: any) => a.status === 'pending');

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* Gamified Header (Streak & Badge) */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white flex flex-col md:flex-row justify-between items-center border-b-4 border-edvoura-gold shadow-xl">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 bg-slate-800 rounded-2xl border-2 border-slate-600 flex items-center justify-center text-4xl shadow-inner">
              👑
            </div>
            <div className="absolute -bottom-2 -right-2 bg-edvoura-gold text-edvoura-navy-dark text-xs font-black px-2 py-1 rounded-lg">
              LV 14
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-black italic tracking-wide uppercase text-transparent bg-clip-text bg-gradient-to-r from-edvoura-gold border-white to-yellow-200">
              Command Center
            </h1>
            <p className="text-slate-400 mt-1 font-medium">Rank: <span className="text-gray-300 font-bold">Silver Scholar Tier II</span></p>
          </div>
        </div>
        <div className="flex gap-4 mt-6 md:mt-0">
          <div className="bg-slate-800 p-4 rounded-xl text-center border border-slate-700 min-w-24">
            <div className="text-xs text-orange-400 uppercase tracking-widest font-bold mb-1 flex justify-center items-center gap-1">
              🔥 Streak
            </div>
            <div className="text-2xl font-black text-white">12 Days</div>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl text-center border border-slate-700 min-w-24">
            <div className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1 flex justify-center items-center gap-1">
              ⭐ Total XP
            </div>
            <div className="text-2xl font-black text-white">4,250</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Session & Subject Rooms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Live Session Counter */}
          <div className="bg-edvoura-navy text-white rounded-3xl shadow-xl p-8 relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L22 20H2L12 2Z"></path></svg>
            </div>
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="animate-pulse w-3 h-3 bg-red-500 rounded-full inline-block"></span>
                Next Live Session
              </h2>
              <span className="bg-edvoura-gold text-edvoura-navy-dark text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                T-Minus 00:24:10
              </span>
            </div>

            <div className="relative z-10">
              <h3 className="text-3xl font-black text-white mb-2">Advanced Algebraic Concepts</h3>
              <div className="flex items-center gap-4 text-slate-300 font-medium mb-8">
                <span className="bg-white/10 px-3 py-1 rounded-lg">Maths Room</span>
                <span>Tutor: Dr. Adebayo</span>
              </div>
              <button className="bg-white text-edvoura-navy font-black text-lg py-4 px-8 rounded-xl hover:bg-slate-100 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                JOIN GOOGLE MEET 🚀
              </button>
            </div>
          </div>

          {/* Subject Rooms Grid */}
          <h3 className="text-lg font-bold text-slate-700 uppercase tracking-wider">Subject Rooms</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {['Mathematics', 'Basic Science', 'English', 'Coding'].map((sub, i) => (
              <div key={i} className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm text-center cursor-pointer hover:border-edvoura-navy hover:shadow-md transition-all">
                <div className="w-12 h-12 mx-auto bg-slate-50 rounded-full flex items-center justify-center text-xl mb-3">
                  {i === 0 ? '📐' : i===1 ? '🔬' : i===2 ? '📚' : '💻'}
                </div>
                <h4 className="font-bold text-slate-800 text-sm">{sub}</h4>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-green-400 h-full" style={{ width: `${(i+1)*20}%`}}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Missions, Leaderboard, Tools */}
        <div className="space-y-6">
          
          {/* Active Missions (Assignments) */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-edvoura-gold"></div>
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-slate-800">
              <span className="text-lg">🎯</span> Active Missions
            </h2>
            <div className="space-y-3">
              {[1,2,3].map((a, i) => (
                <div key={i} className="group bg-slate-50 hover:bg-slate-100 border border-slate-100 p-3 rounded-xl transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-800 text-sm leading-tight">Fraction Word Problems Set {i+1}</h3>
                    <span className="shrink-0 bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full group-hover:bg-edvoura-navy group-hover:text-white transition-colors">
                      +100 XP
                    </span>
                  </div>
                  <p className="text-xs text-red-500 font-medium">Due in 2 days</p>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 text-sm font-bold text-edvoura-navy hover:underline">View All Missions →</button>
          </div>

          {/* Quick Tools */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-4 text-white shadow-md cursor-pointer hover:-translate-y-1 transition-transform">
              <span className="text-2xl block mb-2">⚡</span>
              <span className="font-bold text-sm block">Quiz Centre</span>
              <span className="text-xs opacity-80">(Timed)</span>
            </div>
            <div className="bg-gradient-to-br from-teal-400 to-emerald-500 rounded-2xl p-4 text-white shadow-md cursor-pointer hover:-translate-y-1 transition-transform">
              <span className="text-2xl block mb-2">🗂️</span>
              <span className="font-bold text-sm block">Flashcards</span>
              <span className="text-xs opacity-80">Self-study</span>
            </div>
          </div>
          
          {/* Global Leaderboard Snapshot */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 text-center">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Class Leaderboard</h2>
            <div className="flex justify-center items-end gap-2 h-24 mb-4 border-b border-slate-100">
              <div className="w-12 bg-slate-200 rounded-t-md h-12 relative"><span className="absolute -top-6 w-full text-center text-xs font-bold text-slate-500">2nd</span></div>
              <div className="w-12 bg-edvoura-gold rounded-t-md h-20 relative shadow-[0_0_15px_rgba(250,204,21,0.4)]"><span className="absolute -top-8 w-full text-center text-sm font-black text-yellow-600">1st</span><span className="absolute -top-4 w-full text-center text-xs font-bold text-edvoura-navy">You</span></div>
              <div className="w-12 bg-orange-200 rounded-t-md h-8 relative"><span className="absolute -top-6 w-full text-center text-xs font-bold text-slate-500">3rd</span></div>
            </div>
            <p className="text-xs text-slate-500 font-medium">You are leading Grade 5 Science!</p>
          </div>

        </div>

      </div>
    </div>
  );
}
