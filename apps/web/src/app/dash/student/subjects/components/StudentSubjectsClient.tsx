'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { BookOpen, FolderOpen, ArrowRight, Library } from 'lucide-react';

type AIContentItem = {
  id: string;
  title: string;
  subject: string;
  topic: string;
  grade: string;
  taskType: string;
  content: Record<string, unknown>;
  createdAt: string;
};

type Enrollment = {
  id: string;
  subjectName: string;
  classTitle: string;
  tutorName: string;
};

const SUBJECT_ALIAS_MAP: Record<string, string> = {
  english: 'English Language',
  'english language': 'English Language',
  maths: 'Mathematics',
  math: 'Mathematics',
  mathematics: 'Mathematics',
  'basic science': 'Basic Science',
  'social studies': 'Social Studies',
  'civic education': 'Civic Education',
  'computer studies': 'Computer Studies',
  spelling: 'Spelling',
  games: 'Games',
};

function normalizeSubjectLabel(value: string | null | undefined) {
  const raw = value?.trim() || 'General Studies';
  const key = raw.toLowerCase().replace(/\s+/g, ' ');
  return SUBJECT_ALIAS_MAP[key] ?? raw;
}

export default function StudentSubjectsClient({
  contentItems,
  enrollments,
}: {
  contentItems: AIContentItem[];
  enrollments: Enrollment[];
}) {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const normalizedContentItems = useMemo(
    () =>
      contentItems.map((item) => ({
        ...item,
        subject: normalizeSubjectLabel(item.subject),
      })),
    [contentItems],
  );

  const normalizedEnrollments = useMemo(
    () =>
      enrollments.map((entry) => ({
        ...entry,
        subjectName: normalizeSubjectLabel(entry.subjectName),
      })),
    [enrollments],
  );

  // Group all content items by subject
  const contentBySubject = useMemo(() => {
    const map = new Map<string, AIContentItem[]>();
    for (const item of normalizedContentItems) {
      const subject = item.subject || 'General Studies';
      if (!map.has(subject)) map.set(subject, []);
      map.get(subject)!.push(item);
    }
    return map;
  }, [normalizedContentItems]);

  // Merge the subjects from the AI content with the student's actual enrollments
  const allSubjects = useMemo(() => {
    const set = new Set<string>();
    for (const en of normalizedEnrollments) set.add(en.subjectName);
    for (const subject of Array.from(contentBySubject.keys())) set.add(subject);
    return Array.from(set).sort();
  }, [normalizedEnrollments, contentBySubject]);

  return (
    <div className="mx-auto max-w-[1680px] space-y-8 sm:space-y-10 p-4 sm:p-8 pb-24 animate-in fade-in duration-700 w-full min-w-0">
      <div className="border-[3px] sm:border-[4px] border-dark rounded-[20px] sm:rounded-[28px] bg-white shadow-[6px_6px_0px_#060E1C] sm:shadow-[10px_10px_0px_#060E1C] overflow-hidden max-w-full">
        <div className="p-6 sm:p-8 border-b-[3px] sm:border-b-[4px] border-dark bg-emerald-100">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[0.92] text-dark flex items-center gap-3 sm:gap-4 flex-wrap break-words">
            <Library className="h-8 w-8 sm:h-10 sm:w-10 shrink-0" /> My Subjects
          </h1>
          <p className="mt-4 text-xs sm:text-sm md:text-base font-bold text-dark/70 max-w-xl break-words">
            Explore lesson notes, practice quizzes, and spelling challenges published by your tutor, organized subject by subject.
          </p>
        </div>
      </div>

      {!selectedSubject ? (
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 w-full min-w-0">
          {allSubjects.length > 0 ? (
            allSubjects.map((subject) => {
              const subjectEnrollments = normalizedEnrollments.filter(e => e.subjectName === subject);
              const subjectContent = contentBySubject.get(subject) || [];
              
              const notesCount = subjectContent.filter(c => c.taskType.includes('LESSON')).length;
              const quizCount = subjectContent.filter(c => c.taskType.includes('QUIZ')).length;
              const spellingCount = subjectContent.filter(c => c.taskType.includes('SPELLING')).length;

              return (
                <div 
                  key={subject} 
                  className="rounded-[20px] sm:rounded-[28px] border-[3px] sm:border-[4px] border-dark bg-white p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[8px_8px_0px_#060E1C] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#060E1C] sm:hover:shadow-[12px_12px_0px_#060E1C] transition-all flex flex-col cursor-pointer w-full min-w-0 break-words"
                  onClick={() => setSelectedSubject(subject)}
                >
                  <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
                    <div className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-xl sm:rounded-2xl bg-emerald-50 border-[2px] sm:border-[3px] border-dark flex items-center justify-center">
                      <FolderOpen className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                    </div>
                    <span className="inline-flex rounded-xl border-[2px] border-dark bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-dark shadow-[2px_2px_0px_#060E1C] shrink-0 mt-1">
                      {subjectContent.length} Items
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-dark tracking-tight mb-2 break-words">{subject}</h2>
                  
                  {subjectEnrollments.length > 0 ? (
                    <p className="text-[10px] sm:text-xs font-bold text-dark/60 mb-6 break-words">
                      Enrolled in {subjectEnrollments.length} class{subjectEnrollments.length > 1 ? 'es' : ''}
                    </p>
                  ) : (
                    <p className="text-[10px] sm:text-xs font-bold text-dark/60 mb-6 italic break-words">No active classes</p>
                  )}

                  <div className="flex gap-2 flex-wrap mb-6 flex-1 w-full min-w-0">
                    {notesCount > 0 && <span className="text-[9px] sm:text-[10px] font-black uppercase border-[2px] border-dark bg-blue-100 text-blue-900 px-2 py-1 rounded-md shrink-0">Notes: {notesCount}</span>}
                    {quizCount > 0 && <span className="text-[9px] sm:text-[10px] font-black uppercase border-[2px] border-dark bg-amber-100 text-amber-900 px-2 py-1 rounded-md shrink-0">Quizzes: {quizCount}</span>}
                    {spellingCount > 0 && <span className="text-[9px] sm:text-[10px] font-black uppercase border-[2px] border-dark bg-rose-100 text-rose-900 px-2 py-1 rounded-md shrink-0">Spelling: {spellingCount}</span>}
                  </div>

                  <div className="flex items-center justify-between border-t-[3px] border-dark/10 pt-4 w-full min-w-0 mt-auto">
                    <span className="text-xs sm:text-sm font-black text-emerald-600 break-words">Open Subject</span>
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 shrink-0" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center rounded-[20px] sm:rounded-[28px] border-[3px] sm:border-[4px] border-dashed border-dark/20 bg-white w-full min-w-0">
              <FolderOpen className="h-10 w-10 sm:h-12 sm:w-12 text-dark/20 mx-auto mb-4" />
              <p className="text-base sm:text-lg font-bold text-dark/50 break-words">No subjects available yet.</p>
            </div>
          )}
        </section>
      ) : (
        <section className="space-y-6 animate-in slide-in-from-right-4 duration-500 w-full min-w-0">
          <button 
            onClick={() => setSelectedSubject(null)}
            className="inline-flex items-center text-sm sm:text-base font-black text-dark hover:underline mb-2 sm:mb-4 shrink-0"
          >
            ← Back to all subjects
          </button>
          
          <h2 className="text-2xl sm:text-3xl font-black text-dark break-words">{selectedSubject} Content</h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 w-full min-w-0">
            {(contentBySubject.get(selectedSubject) || []).map(item => {
              const isNote = item.taskType.includes('LESSON');
              const isQuiz = item.taskType.includes('QUIZ');
              const isSpelling = item.taskType.includes('SPELLING');

              let href = '/dash/student';
              if (isNote) href = '/dash/student/notes';
              else if (isQuiz) href = '/dash/student/quiz';
              else if (isSpelling) href = '/dash/student/spelling-bee';

              let label = 'Unknown Type';
              let badgeColor = 'bg-slate-100';
              if (isNote) { label = 'Lesson Note'; badgeColor = 'bg-blue-100'; }
              if (isQuiz) { label = 'Quiz Challenge'; badgeColor = 'bg-amber-100'; }
              if (isSpelling) { label = 'Spelling Bee'; badgeColor = 'bg-rose-100'; }

              return (
                <div key={item.id} className="rounded-2xl border-[3px] sm:border-[4px] border-dark bg-white p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[6px_6px_0px_#060E1C] flex flex-col hover:bg-slate-50 transition-colors w-full min-w-0 break-words">
                  <div className="flex justify-between items-start mb-4 gap-2 flex-wrap">
                    <span className={`inline-flex rounded-md border-[2px] border-dark px-2 py-1 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-dark shadow-[2px_2px_0px_#060E1C] ${badgeColor} shrink-0`}>
                      {label}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-bold text-dark/50 shrink-0 mt-1">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h3 className="text-lg sm:text-xl font-black text-dark mb-2 break-words">{item.title}</h3>
                  <p className="text-xs font-bold text-dark/60 mb-6 break-words">Topic: {item.topic}</p>
                  
                  <div className="mt-auto pt-4 border-t-[3px] border-dark/10 w-full min-w-0">
                    <Link href={href} className="inline-flex flex-wrap items-center text-xs sm:text-sm font-black text-indigo-600 hover:underline break-words">
                      Open in {isNote ? 'Notes' : isQuiz ? 'Quizzes' : isSpelling ? 'Spelling Bee' : 'Dashboard'}
                      <ArrowRight className="h-4 w-4 ml-1 shrink-0" />
                    </Link>
                  </div>
                </div>
              );
            })}
            
            {(contentBySubject.get(selectedSubject) || []).length === 0 && (
              <div className="col-span-full py-12 text-center rounded-[20px] sm:rounded-[28px] border-[3px] sm:border-[4px] border-dashed border-dark/20 bg-white w-full min-w-0">
                <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-dark/20 mx-auto mb-4" />
                <p className="text-base sm:text-lg font-bold text-dark/50 break-words">No published content for this subject yet.</p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
