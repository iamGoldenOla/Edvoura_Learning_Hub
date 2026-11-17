'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Target, Sparkles, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

type SkillTopic = {
  id: string;
  subject: string;
  topic: string;
  masteryPercent: number;
  status: 'mastered' | 'developing' | 'needs_practice';
  recommendedPractice: string;
};

export function StudentSkillHeatmap() {
  const [topics, setTopics] = useState<SkillTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadSkillData = async () => {
      try {
        const supabase = createClient();
        const { data: userRes } = await supabase.auth.getUser();
        const userId = userRes?.user?.id;
        if (!userId) {
          if (active) setLoading(false);
          return;
        }

        const { data: scores } = await supabase
          .from('student_ai_practice_scores')
          .select('id, subject_name, topic, score, total_questions, created_at')
          .eq('student_id', userId)
          .order('created_at', { ascending: false })
          .limit(30);

        if (!active) return;

        // Group by subject + topic to compute real mastery averages
        const grouped = new Map<string, { subject: string; topic: string; sumPct: number; count: number }>();
        for (const row of scores ?? []) {
          const subject = (row as any).subject_name || 'General';
          const topic = (row as any).topic || subject;
          const total = Math.max(1, Number((row as any).total_questions ?? 10));
          const pct = Math.min(100, Math.round((Number((row as any).score ?? 0) / total) * 100));
          const key = `${subject}::${topic}`;
          const existing = grouped.get(key);
          if (existing) {
            existing.sumPct += pct;
            existing.count += 1;
          } else {
            grouped.set(key, { subject, topic, sumPct: pct, count: 1 });
          }
        }

        const mapped: SkillTopic[] = Array.from(grouped.entries())
          .slice(0, 6)
          .map(([key, g]) => {
            const avg = Math.round(g.sumPct / g.count);
            const status: SkillTopic['status'] =
              avg >= 85 ? 'mastered' : avg >= 60 ? 'developing' : 'needs_practice';
            return {
              id: key,
              subject: g.subject,
              topic: g.topic,
              masteryPercent: avg,
              status,
              recommendedPractice:
                status === 'mastered'
                  ? 'Try Advanced Challenge Quiz'
                  : status === 'developing'
                    ? 'Build Consistency Drill'
                    : 'Focused Guided AI Practice',
            };
          });

        setTopics(mapped);
      } catch (err) {
        console.warn('Skill heatmap load warning:', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadSkillData();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="border-[3px] border-dark rounded-[24px] bg-white shadow-[4px_4px_0px_#060E1C] overflow-hidden min-w-0 sm:border-[4px] sm:rounded-[28px] sm:shadow-[10px_10px_0px_#060E1C]">
      <div className="p-5 sm:p-6 border-b-[4px] border-dark bg-purple-100 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-[2px] border-dark bg-white text-[10px] font-black uppercase tracking-widest text-dark mb-1">
            <Target className="h-3.5 w-3.5 text-purple-600" />
            AI Skill Tree &amp; Topic Mastery
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-dark tracking-tight">
            Curriculum Topic Heatmap 🗺️
          </h2>
          <p className="text-xs font-bold text-dark/70 mt-0.5">
            Live mastery percentages calculated from your completed AI quizzes and drills.
          </p>
        </div>
        <Link
          href="/dash/student/quiz"
          className="px-4 py-2 rounded-xl border-[2px] border-dark bg-yellow text-dark font-black text-xs uppercase shadow-[3px_3px_0px_#060E1C] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
        >
          Start New Quiz 🚀
        </Link>
      </div>

      <div className="p-5 sm:p-6 space-y-4">
        {loading ? (
          <div className="py-10 flex items-center justify-center gap-2 text-xs font-black text-dark/60">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading your live mastery scores...</span>
          </div>
        ) : topics.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {topics.map((t) => {
              const isMastered = t.status === 'mastered';
              const isDeveloping = t.status === 'developing';
              return (
                <div
                  key={t.id}
                  className="p-5 rounded-2xl border-[3px] border-dark bg-off-white shadow-[4px_4px_0px_#060E1C] space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded border border-dark bg-white">
                        {t.subject}
                      </span>
                      <h3 className="text-base font-black text-dark mt-1 break-words">{t.topic}</h3>
                    </div>
                    <span
                      className={`px-2.5 py-1 text-[10px] font-black uppercase rounded border-[2px] border-dark shrink-0 ${
                        isMastered
                          ? 'bg-emerald-300 text-emerald-950'
                          : isDeveloping
                            ? 'bg-amber-300 text-amber-950'
                            : 'bg-rose-300 text-rose-950'
                      }`}
                    >
                      {isMastered ? 'Mastered (85%+)' : isDeveloping ? 'Developing (60-84%)' : 'Needs Practice (<60%)'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-black text-dark">
                      <span>Mastery Level</span>
                      <span>{t.masteryPercent}%</span>
                    </div>
                    <div className="h-3.5 w-full rounded-full border-[2px] border-dark bg-white overflow-hidden">
                      <div
                        className={`h-full border-r-[2px] border-dark ${
                          isMastered ? 'bg-emerald-400' : isDeveloping ? 'bg-amber-400' : 'bg-rose-400'
                        }`}
                        style={{ width: `${t.masteryPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-dark/10 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-dark/70 flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-purple-600 shrink-0" /> {t.recommendedPractice}
                    </span>
                    <Link
                      href={`/dash/student/quiz?subject=${encodeURIComponent(t.subject)}&topic=${encodeURIComponent(t.topic)}`}
                      className="px-3 py-1 bg-yellow border-[2px] border-dark rounded-lg text-[10px] font-black uppercase shadow-[2px_2px_0px_#060E1C] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all shrink-0"
                    >
                      Practice Topic 🚀
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border-[3px] border-dashed border-dark/25 bg-off-white p-8 text-center space-y-3">
            <p className="text-base font-black text-dark">Complete your first AI Practice Quiz to light up your Skill Heatmap!</p>
            <p className="text-xs font-semibold text-dark/65 max-w-md mx-auto">
              Every quiz you take automatically maps your strengths and highlights topics to master next.
            </p>
            <Link
              href="/dash/student/quiz"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-[2px] border-dark bg-yellow text-dark font-black text-xs uppercase shadow-[3px_3px_0px_#060E1C] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
            >
              Launch AI Study Hub 🚀
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
