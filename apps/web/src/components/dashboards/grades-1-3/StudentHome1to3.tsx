import React from 'react';
import { 
  Smile, Star, Bell, BookOpen, Rocket, Sprout, Droplet, Palette, 
  Circle, CheckCircle2, Sparkles, Puzzle, Sticker 
} from 'lucide-react';

interface StudentProps {
  enrollments: any[];
  assignments: any[];
  upcomingLessons: any[];
}

export default function StudentHome1to3({ enrollments, assignments, upcomingLessons }: StudentProps) {
  const pendingMissions = assignments.filter((a: any) => a.status === 'pending');

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500">
      
      {/* Top Banner & Parent Message Bell */}
      <div className="flex justify-between items-center bg-white rounded-3xl p-4 shadow-sm border-2 border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 shadow-inner">
            <Smile className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-edvoura-navy flex items-center gap-2">
              Hi, Explorer! <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
            </h1>
            <p className="text-slate-500 font-medium text-lg">You have <strong className="text-yellow-500">145 Stars</strong> today!</p>
          </div>
        </div>
        <div className="bg-red-50 text-red-600 border-2 border-red-200 rounded-2xl px-6 py-3 font-bold flex items-center gap-3 shadow-sm hover:scale-105 transition-transform cursor-pointer">
          <Bell className="w-6 h-6 animate-bounce" />
          Message from Mom: "Have a great class!"
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* BIG ELEMENT: My Classes Today */}
        <div className="lg:col-span-2 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-3xl border-4 border-yellow-400 p-8 shadow-lg relative overflow-hidden group">
          <div className="absolute right-[-20%] top-[-20%] opacity-10 group-hover:scale-110 transition-transform">
            <Sparkles className="w-64 h-64 text-orange-500" />
          </div>
          <h2 className="text-3xl font-extrabold text-orange-800 mb-6 flex items-center gap-3">
             <BookOpen className="w-8 h-8" /> My Class Today
          </h2>
          <div className="bg-white/80 backdrop-blur rounded-2xl p-6 border-2 border-white shadow-sm flex flex-col md:flex-row gap-6 items-center">
            <div className="w-24 h-24 bg-blue-200 rounded-full overflow-hidden border-4 border-white shadow-md flex-shrink-0">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Tutor" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold text-slate-800">Mathematics Magic</h3>
              <p className="text-lg text-slate-600 font-medium">with Tutor Sarah</p>
              <p className="text-orange-600 font-bold mt-1 text-lg">Starts in 10 minutes!</p>
            </div>
            <button className="bg-yellow-400 text-yellow-900 border-b-4 border-yellow-500 font-black text-2xl py-4 flex items-center gap-3 px-8 rounded-full shadow-lg hover:bg-yellow-300 hover:translate-y-1 hover:border-b-0 transition-all">
              JOIN CLASS! <Rocket className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Progress Garden */}
        <div className="bg-gradient-to-t from-green-300 to-green-100 rounded-3xl border-4 border-green-400 p-6 shadow-lg text-center flex flex-col justify-between">
          <h2 className="text-2xl font-extrabold text-green-900 flex justify-center items-center gap-2">
            Progress Garden <Sprout className="w-6 h-6" />
          </h2>
          <div className="flex-1 flex items-end justify-center py-4">
            <Sprout className="w-32 h-32 text-green-600" />
          </div>
          <button className="w-full bg-white flex items-center justify-center gap-2 text-green-700 font-black text-lg py-3 rounded-2xl shadow-sm border-2 border-green-200 hover:bg-green-50">
            Water My Plant! <Droplet className="w-5 h-5 text-blue-500 fill-blue-500" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Homework Corner */}
        <div className="bg-white rounded-3xl border-4 border-purple-300 p-6 shadow-lg">
          <h2 className="text-2xl font-extrabold text-purple-800 mb-6 flex items-center gap-3">
             <Palette className="w-6 h-6" /> Homework Corner
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-purple-50 p-4 rounded-2xl">
              <Circle className="w-8 h-8 text-purple-400" />
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-lg">Count the Apples</h3>
                <p className="text-purple-600 font-medium">+10 Stars</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-green-50 p-4 rounded-2xl opacity-60">
              <CheckCircle2 className="w-8 h-8 text-green-500 fill-green-100" />
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-lg line-through">Color the Dino</h3>
                <p className="text-green-600 font-medium">Done!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Gamified Widgets (Stories, Games, Stickers) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-pink-100 rounded-3xl border-4 border-pink-300 p-4 text-center cursor-pointer hover:scale-105 transition-transform flex flex-col justify-center items-center shadow-md">
            <Sparkles className="w-12 h-12 text-pink-500 mb-2" />
            <span className="font-extrabold text-pink-800 text-lg">Story Lessons</span>
          </div>
          <div className="bg-blue-100 rounded-3xl border-4 border-blue-300 p-4 text-center cursor-pointer hover:scale-105 transition-transform flex flex-col justify-center items-center shadow-md">
            <Puzzle className="w-12 h-12 text-blue-500 mb-2" />
            <span className="font-extrabold text-blue-800 text-lg">Subject Games</span>
          </div>
          <div className="col-span-2 bg-gradient-to-r from-amber-100 to-yellow-200 rounded-3xl border-4 border-yellow-400 p-4 flex justify-between items-center cursor-pointer hover:scale-105 transition-transform shadow-md">
            <div className="flex items-center gap-3">
              <Sticker className="w-10 h-10 text-yellow-600" />
              <span className="font-extrabold text-yellow-900 text-xl">My Sticker Book</span>
            </div>
            <span className="text-2xl font-bold text-yellow-700 bg-white px-4 py-1 rounded-full">8/10</span>
          </div>
        </div>
      </div>

    </div>
  );
}
