'use client';

import React, { useState, useEffect } from 'react';
import { Target, AlertTriangle, TrendingUp, ArrowRight, RefreshCw, Award } from 'lucide-react';

interface TopicMasteryItem {
  id: string;
  subject: string;
  topic: string;
  correct_count: number;
  attempt_count: number;
  mastery_score: number;
  last_attempted_at: string;
}

interface WeakTopicsWidgetProps {
  studentId?: string;
  onSelectTopicForPractice?: (subject: string, topic: string) => void;
}

export default function WeakTopicsWidget({
  studentId = 'james_jedidiahz',
  onSelectTopicForPractice,
}: WeakTopicsWidgetProps) {
  const [topics, setTopics] = useState<TopicMasteryItem[]>([]);
  const [weakTopics, setWeakTopics] = useState<TopicMasteryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMastery = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/student/topic-mastery/list?studentId=${encodeURIComponent(studentId)}`);
      const data = await res.json();
      if (data.topics) {
        setTopics(data.topics);
        setWeakTopics(data.weakTopics || []);
      }
    } catch (e) {
      console.error('Failed to load topic mastery:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMastery();
  }, [studentId]);

  return (
    <div className="w-full rounded-[24px] border-[4px] border-dark bg-white p-6 shadow-[6px_6px_0px_#060E1C] space-y-4">
      <div className="flex items-center justify-between border-b-[3px] border-dark/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl border-[2px] border-dark bg-rose-200 text-rose-950">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-dark tracking-tight">Weak Topics &amp; Mastery Callouts</h3>
            <p className="text-xs font-semibold text-dark/70">Personalized analytics surfacing topics needing practice.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchMastery}
          className="p-2 rounded-xl border-[2px] border-dark bg-slate-50 hover:bg-slate-100 text-dark cursor-pointer"
          title="Refresh analytics"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs font-black text-dark/60">Loading mastery analytics...</div>
      ) : weakTopics.length > 0 ? (
        <div className="space-y-3">
          <div className="text-xs font-black uppercase text-rose-800 tracking-wider flex items-center gap-1">
            <AlertTriangle className="h-4 w-4" />
            <span>Attention Needed ({weakTopics.length} Weak Topics):</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {weakTopics.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl border-[3px] border-dark bg-rose-50 shadow-[3px_3px_0px_#060E1C] space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded-md border border-dark bg-white text-[10px] font-black uppercase text-dark">
                      {item.subject}
                    </span>
                    <h4 className="text-sm font-black text-dark mt-1">You're struggling with {item.topic}</h4>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl border-[2px] border-dark bg-rose-200 text-rose-950 font-black text-xs">
                    {item.mastery_score.toFixed(0)}% Score
                  </span>
                </div>

                <p className="text-[11px] font-semibold text-dark/70">
                  Correct: {item.correct_count} / {item.attempt_count} attempts
                </p>

                <button
                  type="button"
                  onClick={() => onSelectTopicForPractice && onSelectTopicForPractice(item.subject, item.topic)}
                  className="w-full py-2 px-3 rounded-xl border-[2px] border-dark bg-yellow font-black text-xs uppercase text-dark shadow-[2px_2px_0px_#060E1C] hover:bg-yellow-400 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Practice {item.topic} Now</span>
                  <ArrowRight className="h-3.5 w-3.5 text-dark" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : topics.length > 0 ? (
        <div className="p-4 rounded-2xl border-[3px] border-dark bg-emerald-100 text-center space-y-2 shadow-[3px_3px_0px_#060E1C]">
          <Award className="h-8 w-8 text-emerald-800 mx-auto" />
          <h4 className="text-base font-black text-dark">All Attempted Topics Mastered! (≥ 70%)</h4>
          <p className="text-xs font-bold text-dark/70">Great job! Keep practicing to maintain your high mastery scores across all subjects.</p>
        </div>
      ) : (
        <div className="p-4 rounded-2xl border-[3px] border-dashed border-dark/20 bg-slate-50 text-center space-y-1">
          <p className="text-xs font-black text-dark/70">No topic mastery data recorded yet.</p>
          <p className="text-[11px] font-semibold text-dark/50">Complete quiz drills above to automatically trigger weak topic surfacing!</p>
        </div>
      )}
    </div>
  );
}
