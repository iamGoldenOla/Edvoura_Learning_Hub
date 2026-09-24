'use client';

import { Card } from '@/components/ui/card';
import { toast } from '@/lib/toast';
// import { playSound } from '@/utils/sounds'; // If available

export default function NurseryStudentDashboard() {
  
  const handleCardClick = (activity: string) => {
    // try { playSound('pop'); } catch(e) {}
    toast.success(`Opening ${activity}!`);
  };

  return (
    <div className="min-h-screen bg-pink-50 p-8 space-y-12 pb-32">
      <div className="text-center">
        <h1 className="text-6xl font-black text-black drop-shadow-[4px_4px_0_rgba(255,255,255,1)]">
          My Play Area
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
        
        {/* ABC Phonics */}
        <button onClick={() => handleCardClick('ABC Phonics')} className="text-left w-full focus:outline-none focus:ring-8 focus:ring-blue-400 rounded-[40px]">
          <Card className="h-80 border-[8px] border-black rounded-[40px] shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] bg-red-300 hover:bg-red-400 transition-all hover:-translate-y-2 hover:shadow-[24px_24px_0px_0px_rgba(0,0,0,1)] active:translate-y-4 active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center p-8 overflow-hidden relative group">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white opacity-20 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
            <span className="text-9xl font-black text-white drop-shadow-[6px_6px_0_rgba(0,0,0,1)] z-10">
              A B C
            </span>
            <div className="mt-8 text-7xl z-10">🍎 🐻 🐱</div>
          </Card>
        </button>

        {/* 123 Numbers */}
        <button onClick={() => handleCardClick('123 Numbers')} className="text-left w-full focus:outline-none focus:ring-8 focus:ring-blue-400 rounded-[40px]">
          <Card className="h-80 border-[8px] border-black rounded-[40px] shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] bg-blue-300 hover:bg-blue-400 transition-all hover:-translate-y-2 hover:shadow-[24px_24px_0px_0px_rgba(0,0,0,1)] active:translate-y-4 active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center p-8 overflow-hidden relative group">
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white opacity-20 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
            <span className="text-9xl font-black text-white drop-shadow-[6px_6px_0_rgba(0,0,0,1)] z-10">
              1 2 3
            </span>
            <div className="mt-8 flex gap-4 z-10">
              <div className="w-12 h-12 bg-white rounded-full border-4 border-black"></div>
              <div className="flex gap-2">
                 <div className="w-12 h-12 bg-white rounded-full border-4 border-black"></div>
                 <div className="w-12 h-12 bg-white rounded-full border-4 border-black"></div>
              </div>
            </div>
          </Card>
        </button>

        {/* Shapes */}
        <button onClick={() => handleCardClick('Shapes')} className="text-left w-full focus:outline-none focus:ring-8 focus:ring-blue-400 rounded-[40px]">
          <Card className="h-80 border-[8px] border-black rounded-[40px] shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] bg-yellow-300 hover:bg-yellow-400 transition-all hover:-translate-y-2 hover:shadow-[24px_24px_0px_0px_rgba(0,0,0,1)] active:translate-y-4 active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center p-8 overflow-hidden relative group">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white opacity-20 rotate-45 group-hover:rotate-90 transition-transform duration-700"></div>
            <div className="flex gap-6 z-10">
               <div className="w-32 h-32 bg-pink-500 border-8 border-black rounded-full"></div>
               <div className="w-32 h-32 bg-green-500 border-8 border-black"></div>
               <div className="w-0 h-0 border-l-[64px] border-l-transparent border-r-[64px] border-r-transparent border-b-[110px] border-b-purple-500 relative">
                  {/* CSS triangle with border is tricky, simplifying for illustration */}
                  <div className="absolute -left-[72px] top-[4px] w-0 h-0 border-l-[72px] border-l-transparent border-r-[72px] border-r-transparent border-b-[124px] border-b-black -z-10"></div>
               </div>
            </div>
          </Card>
        </button>

        {/* Stickers */}
        <button onClick={() => handleCardClick('My Stickers')} className="text-left w-full focus:outline-none focus:ring-8 focus:ring-blue-400 rounded-[40px]">
          <Card className="h-80 border-[8px] border-black rounded-[40px] shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] bg-purple-300 hover:bg-purple-400 transition-all hover:-translate-y-2 hover:shadow-[24px_24px_0px_0px_rgba(0,0,0,1)] active:translate-y-4 active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center p-8 overflow-hidden relative group">
            <span className="text-[120px] drop-shadow-[6px_6px_0_rgba(0,0,0,1)] group-hover:scale-110 transition-transform duration-500 z-10">
              ⭐
            </span>
            <div className="absolute top-10 left-10 text-5xl">🏆</div>
            <div className="absolute bottom-10 right-10 text-6xl">🚀</div>
            <div className="absolute top-1/2 right-12 text-4xl">🦄</div>
          </Card>
        </button>

      </div>
    </div>
  );
}
