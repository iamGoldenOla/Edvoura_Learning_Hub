import { createClient } from '@/utils/supabase/server';
import { requireAppViewer } from '@/lib/app-context';
import Link from 'next/link';

export default async function QuizPage() {
  const viewer = await requireAppViewer();
  const supabase = await createClient();

  const { data: quizzes } = await supabase
    .from('quizzes')
    .select('id, title, instructions, time_limit_minutes, status, created_at')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-edvoura-navy">Quizzes & Tests</h1>
        <p className="mt-2 text-sm text-slate-600">
          Take quizzes and tests assigned by your tutors.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {quizzes && quizzes.length > 0 ? (
          quizzes.map((quiz) => (
            <div key={quiz.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">{quiz.title}</h2>
              <p className="mt-1 text-sm text-slate-600">{quiz.instructions || 'No special instructions.'}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  {quiz.time_limit_minutes ? `${quiz.time_limit_minutes} Mins` : 'No Time Limit'}
                </span>
                <button className="rounded-lg bg-edvoura-navy px-4 py-2 text-xs font-semibold text-white">
                  Start Quiz
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
            No quizzes assigned yet! Check back later.
          </div>
        )}
      </section>
    </div>
  );
}
