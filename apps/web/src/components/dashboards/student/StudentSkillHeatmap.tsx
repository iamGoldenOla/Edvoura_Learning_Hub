'use client';

import { useState } from 'react';
import { Target, CheckCircle2, AlertTriangle, Sparkles, BookOpen } from 'lucide-react';

type SkillTopic = {
  id: string;
  subject: string;
  topic: string;
  masteryPercent: number;
  status: 'mastered' | 'developing' | 'needs_practice';
  recommendedPractice: string;
};

export function StudentSkillHeatmap() {
  const [topics] = useState<SkillTopic[]>([
    { id: '1', subject: 'Mathematics', topic: 'Addition & Subtraction Word Problems', masteryPercent: 95, status: 'mastered', recommendedPractice: 'Challenge Math Riddles' },
    { id: '2', subject: 'Mathematics', topic: 'Fractions & Division Concepts', masteryPercent: 42, status: 'needs_practice', recommendedPractice: 'Edvoura AI Fraction Visualizer' },
    { id: '3', subject: 'English & Phonics', topic: 'Reading Comprehension & Context Clues', masteryPercent: 88, status: 'mastered', recommendedPractice: 'Advanced Story Explorer' },
    { id: '4', subject: 'Science & Robotics', topic: 'Basic Electric Circuits & Solar Power', masteryPercent: 68, status: 'developing', recommendedPractice: 'Virtual Robotics Lab Test' },
  ]);

  return (
    <div className="border-[3px] border-dark rounded-[24px] bg-white shadow-[4px_4px_0px_#060E1C] overflow-hidden min-w-0 sm:border-[4px] sm:rounded-[28px] sm:shadow-[10px_10px_0px_#060E1C]">
      <div className="p-5 sm:p-6 border-b-[4px] border-dark bg-purple-100 flex items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-[2px] border-dark bg-white text-[10px] font-black uppercase tracking-widest text-dark mb-1">
            <Target className="h-3.5 w-3.5 text-purple-600" />
            AI Skill Tree &amp; Topic Mastery
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-dark tracking-tight">
            Curriculum Topic Heatmap 🗺️
          </h2>
          <p className="text-xs font-bold text-dark/70 mt-0.5">
            Identify mastered subjects and topics that need focused AI practice.
          </p>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-4">
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
                  <div>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded border border-dark bg-white">
                      {t.subject}
                    </span>
                    <h3 className="text-base font-black text-dark mt-1">{t.topic}</h3>
                  </div>
                  <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded border-[2px] border-dark ${
                    isMastered
                      ? 'bg-emerald-300 text-emerald-950'
                      : isDeveloping
                      ? 'bg-amber-300 text-amber-950'
                      : 'bg-rose-300 text-rose-950'
                  }`}>
                    {isMastered ? 'Mastered (90%+)' : isDeveloping ? 'Developing (60-89%)' : 'Needs Practice (<60%)'}
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
                    <Sparkles className="h-3 w-3 text-purple-600" /> {t.recommendedPractice}
                  </span>
                  <button className="px-3 py-1 bg-yellow border-[2px] border-dark rounded-lg text-[10px] font-black uppercase shadow-[2px_2px_0px_#060E1C] cursor-pointer">
                    Practice Topic 🚀
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
