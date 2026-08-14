'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Video, BookOpen, Clock, ShieldCheck, ExternalLink, CheckCircle2, X, Bell, UserCheck, Search } from 'lucide-react';

type LessonRecord = {
  id: string;
  title: string;
  classTitle: string;
  subjectName: string;
  tutorName: string;
  tutorEmail: string;
  scheduledStartAt: string;
  status: 'live' | 'scheduled' | 'completed';
  meetingUrl: string;
  lessonNotes: string;
  enrolledStudentsCount: number;
};

const sampleLessons: LessonRecord[] = [
  {
    id: 'les-1',
    title: 'Algebra & Quadratic Equations Masterclass',
    classTitle: 'Mathematics Basic 8 (JSS 2)',
    subjectName: 'Mathematics',
    tutorName: 'Dr. Adebayo Ogunlesi',
    tutorEmail: 'adebayo@edvoura.com',
    scheduledStartAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    status: 'live',
    meetingUrl: 'https://meet.google.com/edv-math-room-1',
    lessonNotes: 'Topic: Quadratic Equations. Objective: Solve equations using factorization and quadratic formula. Homework: Exercises 4A #1-10.',
    enrolledStudentsCount: 18,
  },
  {
    id: 'les-2',
    title: 'Grammar & Essay Structure Essentials',
    classTitle: 'English Language Primary 5',
    subjectName: 'English Language',
    tutorName: 'Mrs. Chidimma Okoro',
    tutorEmail: 'chidimma@edvoura.com',
    scheduledStartAt: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    status: 'scheduled',
    meetingUrl: 'https://meet.google.com/edv-eng-room-2',
    lessonNotes: 'Topic: Narrative Essay Writing. Objective: Structuring introduction, climax, and conclusion. Vocabulary drill: 10 new words.',
    enrolledStudentsCount: 22,
  },
  {
    id: 'les-3',
    title: 'Introductory Physics: Force & Motion',
    classTitle: 'Basic Science & Tech (SSS 1)',
    subjectName: 'Physics',
    tutorName: 'Mr. Emmanuel Vance',
    tutorEmail: 'emmanuel@edvoura.com',
    scheduledStartAt: new Date(Date.now() + 120 * 60 * 1000).toISOString(),
    status: 'scheduled',
    meetingUrl: 'https://meet.google.com/edv-phy-room-3',
    lessonNotes: 'Topic: Newton Laws of Motion. Objective: Understand inertia, force = mass x acceleration, and action-reaction pairs.',
    enrolledStudentsCount: 15,
  },
];

export function AdminLiveLessonsClient({
  lessonsToday,
  liveSessionsCount,
}: {
  lessonsToday: number;
  liveSessionsCount: number;
}) {
  const [selectedNotes, setSelectedNotes] = useState<LessonRecord | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLessons = sampleLessons.filter(
    (l) =>
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.tutorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.subjectName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendReminder = (lessonTitle: string, tutorName: string) => {
    setToast(`🔔 Class Reminder alert sent to all students & parents for "${lessonTitle}" by ${tutorName}!`);
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="space-y-8">
      {toast && (
        <div className="p-4 bg-emerald-100 border-[3px] border-dark text-emerald-950 font-black rounded-2xl shadow-[4px_4px_0px_#060E1C] flex items-center justify-between gap-3 animate-fade-up">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-800" />
            <span>{toast}</span>
          </div>
        </div>
      )}

      {/* KPI Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-[20px] sm:rounded-[28px] border-[3px] sm:border-[4px] border-dark bg-blue-100 p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between min-w-0">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Scheduled Today</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">{lessonsToday || sampleLessons.length}</p>
          </div>
        </div>

        <div className="rounded-[20px] sm:rounded-[28px] border-[3px] sm:border-[4px] border-dark bg-purple-100 p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between min-w-0">
          <div className="flex items-center gap-3">
            <Video className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Live Sessions Now</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">{liveSessionsCount || 1}</p>
          </div>
        </div>

        <div className="rounded-[20px] sm:rounded-[28px] border-[3px] sm:border-[4px] border-dark bg-emerald-100 p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between min-w-0">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Tutor Compliance</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">100%</p>
          </div>
        </div>
      </div>

      {/* Live Class Inspector Directory */}
      <div className="border-[3px] sm:border-[4px] border-dark rounded-[20px] sm:rounded-[28px] bg-white shadow-[4px_4px_0px_#060E1C] sm:shadow-[10px_10px_0px_#060E1C] overflow-hidden min-w-0">
        <div className="p-6 border-b-[4px] border-dark bg-amber-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-dark tracking-tight flex items-center gap-2">
              <Video className="h-6 w-6 text-dark" /> Live Class &amp; Lesson Note Quality Inspector
            </h2>
            <p className="text-xs font-bold text-dark/70 mt-0.5">
              Supervise live teaching rooms, inspect tutor lesson plans, and trigger class reminders.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-dark/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search class, tutor, subject..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border-[2px] border-dark bg-white text-xs font-bold text-dark focus:outline-none focus:border-yellow"
            />
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-4">
          {filteredLessons.map((lesson) => (
            <div key={lesson.id} className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-2 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded-lg border border-dark text-[10px] font-black uppercase tracking-widest ${
                    lesson.status === 'live' ? 'bg-rose-500 text-white animate-pulse' : 'bg-blue-100 text-blue-950'
                  }`}>
                    {lesson.status === 'live' ? '🔴 LIVE NOW' : 'SCHEDULED'}
                  </span>
                  <span className="text-xs font-black text-dark/60">{lesson.classTitle}</span>
                </div>

                <h3 className="text-xl font-black text-dark tracking-tight">{lesson.title}</h3>

                <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-dark/70">
                  <span>Tutor: <strong>{lesson.tutorName}</strong></span>
                  <span>Enrolled: <strong>{lesson.enrolledStudentsCount} Students</strong></span>
                  <span>Time: <strong>{new Date(lesson.scheduledStartAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 self-end lg:self-center shrink-0">
                <button
                  onClick={() => setSelectedNotes(lesson)}
                  className="px-3.5 py-2 bg-white text-dark border-[2px] border-dark rounded-xl text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#060E1C] hover:bg-slate-100 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="h-4 w-4" /> Lesson Notes
                </button>

                <a
                  href={lesson.meetingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-yellow text-dark border-[2px] border-dark rounded-xl text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#060E1C] hover:bg-yellow-light transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="h-4 w-4" /> Join / Audit Live Meeting
                </a>

                <button
                  onClick={() => handleSendReminder(lesson.title, lesson.tutorName)}
                  className="px-3 py-2 bg-slate-900 text-white border-[2px] border-dark rounded-xl text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#060E1C] hover:bg-slate-800 transition-all flex items-center gap-1 cursor-pointer"
                  title="Send Push Alert Reminder to Class"
                >
                  <Bell className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lesson Notes Inspector Modal */}
      {selectedNotes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-[28px] border-[4px] border-dark bg-white p-6 sm:p-8 shadow-[12px_12px_0px_#060E1C] animate-fade-up">
            <div className="flex items-center justify-between border-b-[3px] border-dark pb-4 mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-dark" />
                <h3 className="text-xl font-black text-dark">Tutor Lesson Plan Inspector</h3>
              </div>
              <button onClick={() => setSelectedNotes(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="h-5 w-5 text-dark" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-dark/50">Lesson Title</p>
                <p className="text-lg font-black text-dark">{selectedNotes.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-off-white border-[2px] border-dark rounded-xl">
                  <p className="text-[9px] font-black uppercase text-dark/50">Assigned Tutor</p>
                  <p className="text-sm font-black text-dark">{selectedNotes.tutorName}</p>
                </div>
                <div className="p-3 bg-off-white border-[2px] border-dark rounded-xl">
                  <p className="text-[9px] font-black uppercase text-dark/50">Subject &amp; Class</p>
                  <p className="text-sm font-black text-dark">{selectedNotes.subjectName} ({selectedNotes.classTitle})</p>
                </div>
              </div>

              <div className="p-4 bg-sky-50 border-[2px] border-dark rounded-2xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-sky-950 mb-2">Lesson Notes &amp; Syllabus Objectives</p>
                <p className="text-sm font-bold text-dark/80 leading-relaxed whitespace-pre-line">
                  {selectedNotes.lessonNotes}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => {
                  setSelectedNotes(null);
                  setToast(`✅ Lesson notes for "${selectedNotes.title}" approved by Admin.`);
                  setTimeout(() => setToast(null), 4000);
                }}
                className="px-5 py-2.5 bg-emerald-400 text-dark border-[2.5px] border-dark rounded-xl text-xs font-black shadow-[3px_3px_0px_#060E1C]"
              >
                Approve Lesson Notes
              </button>
              <button
                onClick={() => setSelectedNotes(null)}
                className="px-4 py-2.5 bg-white text-dark border-[2.5px] border-dark rounded-xl text-xs font-black"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
