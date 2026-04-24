'use client';

import { BookOpen, Star, CheckCircle2, PlayCircle, Clock } from 'lucide-react';

type Assignment = {
  id: string;
  title: string;
  classTitle: string;
  subjectName: string;
  dueAt: string | null;
  instructions: string | null;
  submissionStatus: string | null;
  score: string | null;
  feedbackText: string | null;
  resources: Array<{
    id: string;
    fileName: string;
    downloadUrl: string | null;
  }>;
};

export default function ChildHomeworkView({ assignments }: { assignments: Assignment[] }) {
  const pending = assignments.filter(
    (a) =>
      !a.submissionStatus ||
      a.submissionStatus === 'draft' ||
      a.submissionStatus === 'submitted' ||
      a.submissionStatus === 'late',
  );
  
  const completed = assignments.filter(
    (a) => a.submissionStatus === 'graded' || a.submissionStatus === 'returned'
  );

  return (
    <div className="space-y-12">
      <header className="text-center bg-white border-[4px] border-dark rounded-[40px] p-10 shadow-[10px_10px_0px_#060E1C]">
        <h1 className="text-5xl font-heading font-black text-dark">My Learning Missions</h1>
        <p className="mt-4 text-xl text-dark/60 font-semibold italic">Finish your missions to grow your magic garden!</p>
      </header>

      <section className="space-y-6">
        <div className="flex items-center gap-3 mb-8">
           <div className="h-10 w-10 rounded-full bg-yellow border-[3px] border-dark flex items-center justify-center shadow-[4px_4px_0px_#060E1C]">
             <Star className="h-5 w-5" />
           </div>
           <h2 className="text-3xl font-black text-dark uppercase tracking-tight">Active Missions</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pending.length > 0 ? (
            pending.map((item) => (
              <div key={item.id} className="bg-white border-[4px] border-dark rounded-[32px] shadow-[8px_8px_0px_#060E1C] overflow-hidden flex flex-col hover:translate-y-[-4px] transition-all">
                <div className="bg-blue-600 p-6 flex items-center justify-between border-b-[4px] border-dark">
                  <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center text-white">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <span className="px-3 py-1 bg-white text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Ready!
                  </span>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/30 mb-2">{item.subjectName}</p>
                  <h3 className="text-2xl font-black text-dark mb-4">{item.title}</h3>
                  <p className="text-sm text-dark/60 font-semibold mb-6 line-clamp-2">{item.instructions || 'No instructions provided.'}</p>
                  
                  <div className="mt-auto pt-6 flex flex-col gap-3">
                    <button className="w-full py-4 border-[3px] border-dark bg-yellow rounded-2xl font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_#060E1C] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all flex items-center justify-center gap-2">
                       <PlayCircle className="h-5 w-5" /> Start Mission
                    </button>
                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-dark/40">
                       <Clock className="h-3 w-3" /> Due: {item.dueAt ? new Date(item.dueAt).toLocaleDateString() : 'No deadline'}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-white border-[4px] border-dark border-dashed rounded-[40px]">
               <div className="text-6xl mb-4">🏆</div>
               <h3 className="text-2xl font-black text-dark">All Missions Complete!</h3>
               <p className="text-dark/60 font-semibold italic">You are a superstar learner!</p>
            </div>
          )}
        </div>
      </section>

      {completed.length > 0 && (
        <section className="pt-12 space-y-6 opacity-80">
          <div className="flex items-center gap-3 mb-8">
             <div className="h-10 w-10 rounded-full bg-green-400 border-[3px] border-dark flex items-center justify-center shadow-[4px_4px_0px_#060E1C]">
               <CheckCircle2 className="h-5 w-5" />
             </div>
             <h2 className="text-3xl font-black text-dark uppercase tracking-tight">Finished Missions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {completed.map((item) => (
              <div key={item.id} className="bg-slate-50 border-[3px] border-dark/20 rounded-[32px] p-8 flex flex-col grayscale opacity-60">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/30 mb-2">{item.subjectName}</p>
                <h3 className="text-xl font-black text-dark mb-4">{item.title}</h3>
                <div className="mt-auto flex items-center justify-between">
                   <span className="text-xs font-black text-green-600 uppercase tracking-widest">Done!</span>
                   {item.score && (
                     <div className="h-10 w-10 rounded-full bg-yellow border-2 border-dark flex items-center justify-center font-black text-xs">
                        {Number(item.score).toFixed(0)}
                     </div>
                   )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
