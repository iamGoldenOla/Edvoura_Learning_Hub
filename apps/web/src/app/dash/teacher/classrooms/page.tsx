'use client';

import React, { useState, useEffect } from 'react';
import { Users, Target, AlertTriangle, TrendingUp, BookOpen, RefreshCw } from 'lucide-react';

interface ClassTopicAggregate {
  subject: string;
  topic: string;
  classAverageScore: number;
  totalAttempts: number;
  studentsStrugglingCount: number;
}

export default function TeacherClassroomDashboardPage() {
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('class_3a');
  const [enrolledCount, setEnrolledCount] = useState<number>(0);
  const [weakSpots, setWeakSpots] = useState<ClassTopicAggregate[]>([]);
  const [allTopics, setAllTopics] = useState<ClassTopicAggregate[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchClassroomAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/teacher/classrooms/aggregate?classroomId=${selectedClassId}`);
      const data = await res.json();
      if (data.success) {
        setEnrolledCount(data.enrolledCount || 0);
        setWeakSpots(data.classWeakSpots || []);
        setAllTopics(data.topicAggregates || []);
      }
    } catch (e) {
      console.error('Failed to load teacher classroom analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassroomAnalytics();
  }, [selectedClassId]);

  return (
    <div className="w-full max-w-[1200px] mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="rounded-[24px] border-[4px] border-dark bg-white p-6 shadow-[8px_8px_0px_#060E1C] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow border-[2px] border-dark rounded-lg text-[10px] font-black uppercase text-dark shadow-[2px_2px_0px_#060E1C] mb-2">
            🏫 Educator Analytics Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-dark tracking-tight">
            Classroom Aggregate Mastery Performance
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-dark/70 mt-1">
            Class-wide weak spots and aggregate analytics across all enrolled students.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchClassroomAnalytics}
          className="px-4 py-2.5 rounded-xl border-[2px] border-dark bg-slate-50 font-black text-xs uppercase text-dark shadow-[2px_2px_0px_#060E1C] hover:bg-slate-100 cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Class Level Weak Spots First */}
      <section className="rounded-[24px] border-[4px] border-dark bg-rose-50 p-6 shadow-[6px_6px_0px_#060E1C] space-y-4">
        <div className="flex items-center gap-2 border-b-[3px] border-dark/10 pb-3">
          <div className="p-2 rounded-xl border-[2px] border-dark bg-rose-200 text-rose-950">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-dark">Priority Class Weak Spots (&lt; 70% Average)</h2>
            <p className="text-xs font-semibold text-dark/70">Top topics where the majority of students are currently struggling.</p>
          </div>
        </div>

        {loading ? (
          <div className="py-6 text-center text-xs font-black text-dark/60">Loading aggregate performance...</div>
        ) : weakSpots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weakSpots.map((item, idx) => (
              <div
                key={`weak-${idx}`}
                className="p-4 rounded-2xl border-[3px] border-dark bg-white shadow-[4px_4px_0px_#060E1C] space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded-md border border-dark bg-yellow text-[10px] font-black uppercase text-dark">
                      {item.subject}
                    </span>
                    <h3 className="text-base font-black text-dark mt-1">{item.topic}</h3>
                  </div>
                  <span className="px-3 py-1 rounded-xl border-[2px] border-dark bg-rose-200 text-rose-950 font-black text-sm">
                    {item.classAverageScore.toFixed(0)}% Class Avg
                  </span>
                </div>

                <p className="text-xs font-bold text-dark/70">
                  ⚠️ Attention Needed: Multiple pupils require targeted remedial instruction in this topic.
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-2xl border-[2px] border-emerald-800 bg-emerald-100 text-emerald-950 text-xs font-black text-center">
            🎉 Outstanding! No topics currently fall below the 70% class-wide threshold.
          </div>
        )}
      </section>
    </div>
  );
}
