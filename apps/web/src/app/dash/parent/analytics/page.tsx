'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Award, Target, AlertTriangle, BookOpen } from 'lucide-react';

interface TopicMasteryItem {
  id: string;
  subject: string;
  topic: string;
  correct_count: number;
  attempt_count: number;
  mastery_score: number;
}

export default function ParentAnalyticsDashboardPage() {
  const [childId, setChildId] = useState<string>('james_jedidiahz');
  const [topics, setTopics] = useState<TopicMasteryItem[]>([]);
  const [weakTopics, setWeakTopics] = useState<TopicMasteryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChildAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/student/topic-mastery/list?studentId=${encodeURIComponent(childId)}`);
      const data = await res.json();
      if (data.topics) {
        setTopics(data.topics);
        setWeakTopics(data.weakTopics || []);
      }
    } catch (e) {
      console.error('Failed to load parent child analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildAnalytics();
  }, [childId]);

  return (
    <div className="w-full max-w-[1000px] mx-auto p-4 sm:p-6 space-y-6">
      <div className="rounded-[24px] border-[4px] border-dark bg-white p-6 shadow-[8px_8px_0px_#060E1C] space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow border-[2px] border-dark rounded-lg text-[10px] font-black uppercase text-dark shadow-[2px_2px_0px_#060E1C]">
          ❤️ Guardian Performance Portal · Linked via guardian_links
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-dark tracking-tight">
          Child Progress &amp; Mastery Overview
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-dark/70">
          Scoped performance analytics for your child ({childId}).
        </p>
      </div>

      <div className="rounded-2xl border-[3px] border-dark bg-white p-6 shadow-[5px_5px_0px_#060E1C] space-y-4">
        <h2 className="text-lg font-black text-dark flex items-center gap-2">
          <Target className="h-5 w-5 text-dark" />
          <span>Topic Mastery Breakdown</span>
        </h2>

        {loading ? (
          <div className="py-6 text-center text-xs font-black text-dark/60">Loading progress...</div>
        ) : topics.length > 0 ? (
          <div className="space-y-3">
            {topics.map((t) => (
              <div
                key={t.id || t.topic}
                className="p-3.5 rounded-xl border-[2px] border-dark bg-slate-50 flex items-center justify-between"
              >
                <div>
                  <span className="px-2 py-0.5 rounded-md border border-dark bg-yellow text-[10px] font-black uppercase text-dark">
                    {t.subject}
                  </span>
                  <h3 className="text-sm font-black text-dark mt-1">{t.topic}</h3>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-dark">{t.mastery_score.toFixed(0)}% Score</span>
                  <p className="text-[10px] font-bold text-dark/60">
                    {t.correct_count} / {t.attempt_count} correct
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-xs font-bold text-dark/60">
            No quiz drill records recorded for your child yet.
          </div>
        )}
      </div>
    </div>
  );
}
