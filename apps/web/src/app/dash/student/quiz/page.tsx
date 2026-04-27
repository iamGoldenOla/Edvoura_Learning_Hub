import { createClient } from '@/utils/supabase/server';
import { requireAppViewer } from '@/lib/app-context';
import { Target, Sparkles, Clock, ArrowRight } from 'lucide-react';
import { PracticeQuizClient } from './PracticeQuizClient';

export default async function QuizPage() {
  const viewer = await requireAppViewer();
  const supabase = await createClient();

  // 1. Fetch manual quizzes
  const { data: quizzes } = await supabase
    .from('quizzes')
    .select('id, title, instructions, time_limit_minutes, status, created_at')
    .order('created_at', { ascending: false });

  // 2. Fetch published AI quizzes
  const { data: aiQuizzes } = await supabase
    .from('ai_generated_content')
    .select('id, raw_output, created_at')
    .eq('content_type', 'quiz')
    .in('status', ['published', 'PUBLISHED'])
    .order('created_at', { ascending: false });

  // Map AI quizzes to a common format
  const normalizedAiQuizzes = (aiQuizzes || []).map(q => ({
    id: q.id,
    title: (q.raw_output as any).title || 'AI Practice Challenge',
    instructions: (q.raw_output as any).description || 'Master this topic with Edvoura AI.',
    isAi: true,
    data: q.raw_output
  }));

  return (
    <div className="mx-auto max-w-[1680px] space-y-10 p-6 sm:p-8 pb-24">
      <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
        <div className="p-8 border-b-[4px] border-dark bg-purple-100">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[0.92] text-dark flex items-center gap-4">
            <Target className="h-10 w-10" /> AI Study Hub
          </h1>
          <p className="mt-4 text-sm md:text-base font-bold text-dark/70 max-w-xl">
            Tutor-assigned AI challenges and practice quizzes.
          </p>
        </div>
      </div>

      <PracticeQuizClient aiQuizzes={normalizedAiQuizzes} />

      <section className="grid gap-6 md:grid-cols-2">
        {quizzes && quizzes.length > 0 ? (
          quizzes.map((quiz) => (
            <div key={quiz.id} className="rounded-[28px] border-[4px] border-dark bg-white p-6 shadow-[10px_10px_0px_#060E1C] overflow-hidden flex flex-col transition-all hover:-translate-y-1 hover:shadow-[12px_12px_0px_#060E1C]">
              <h2 className="text-2xl font-black text-dark tracking-tight">{quiz.title}</h2>
              <p className="mt-3 text-sm font-bold text-dark/70 leading-relaxed flex-1">{quiz.instructions || 'No special instructions.'}</p>
              <div className="mt-6 flex items-center justify-between gap-4 border-t-[3px] border-dark/10 pt-6">
                <span className="inline-flex items-center gap-2 rounded-xl border-[2px] border-dark bg-amber-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-dark shadow-[2px_2px_0px_#060E1C]">
                  <Clock className="h-4 w-4" />
                  {quiz.time_limit_minutes ? `${quiz.time_limit_minutes} Mins` : 'No Time Limit'}
                </span>
                <button className="inline-flex items-center gap-2 bg-emerald-400 border-[3px] border-dark !text-dark font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-5 py-3 text-sm">
                  Start Quiz <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        ) : null}
      </section>
    </div>
  );
}
