'use client';

import { useState, useEffect } from 'react';
import { getStudentDashboardData, requireAppViewer } from '@/lib/app-context';
import StudentAssignmentUploadCard from '@/components/dashboards/StudentAssignmentUploadCard';
import Link from 'next/link';

const formatDate = (value: string | null) => {
  if (!value) return 'No due date';
  return new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
};

export default function StudentAssignmentsPage() {
  const [activeTab, setActiveTab] = useState<'todo' | 'graded'>('todo');
  const [dashboard, setDashboard] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = (await import('@/utils/supabase/client')).createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const data = await getStudentDashboardData(session.access_token);
          setDashboard(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load assignments.');
      }
    }
    loadData();
  }, []);

  if (error) {
    return (
      <div className="max-w-3xl mx-auto bg-white border-[4px] border-dark rounded-[28px] p-10 shadow-[10px_10px_0px_#060E1C]">
        <h1 className="text-3xl font-heading font-black text-dark mb-4">Assignments unavailable</h1>
        <p className="text-sm text-dark/70 font-semibold normal-case mb-6">{error}</p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/dash/student"
            className="inline-flex items-center justify-center px-6 py-3 border-[3px] border-dark bg-yellow text-dark font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_#060E1C]"
          >
            Back to Overview
          </Link>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark"></div>
      </div>
    );
  }

  const pending = dashboard.assignments.filter(
    (assignment: any) =>
      !assignment.submissionStatus ||
      assignment.submissionStatus === 'draft' ||
      assignment.submissionStatus === 'submitted' ||
      assignment.submissionStatus === 'late',
  );
  const graded = dashboard.assignments.filter(
    (assignment: any) =>
      assignment.submissionStatus === 'graded' || assignment.submissionStatus === 'returned',
  );

  return (
    <div className="space-y-8 max-w-[1320px]">
      <div className="border-[4px] border-dark bg-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-8">
        <h1 className="text-4xl font-heading tracking-tight text-dark">Home Work Workspace</h1>
        
        {/* Tab Buttons */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => setActiveTab('todo')}
            className={`px-8 py-3 rounded-xl border-[3px] border-dark font-black uppercase text-xs tracking-widest transition-all ${
              activeTab === 'todo' 
              ? 'bg-yellow shadow-[4px_4px_0px_#060E1C] translate-y-[-2px]' 
              : 'bg-white text-dark/40 hover:text-dark'
            }`}
          >
            To Do ({pending.length})
          </button>
          <button
            onClick={() => setActiveTab('graded')}
            className={`px-8 py-3 rounded-xl border-[3px] border-dark font-black uppercase text-xs tracking-widest transition-all ${
              activeTab === 'graded' 
              ? 'bg-yellow shadow-[4px_4px_0px_#060E1C] translate-y-[-2px]' 
              : 'bg-white text-dark/40 hover:text-dark'
            }`}
          >
            Completed ({graded.length})
          </button>
        </div>
      </div>

      <div className="max-w-3xl">
        {activeTab === 'todo' ? (
          <AssignmentBucket title="Waiting for you" items={pending} />
        ) : (
          <AssignmentBucket title="Graded & Returned" items={graded} graded />
        )}
      </div>
    </div>
  );
}

function AssignmentBucket({
  title,
  items,
  graded = false,
}: {
  title: string;
  items: any[];
  graded?: boolean;
}) {
  return (
    <section className="border-[4px] border-dark bg-off-white rounded-[28px] shadow-[8px_8px_0px_#060E1C] p-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-black text-dark">{title}</h2>
      </div>

      <div className="space-y-4">
        {items.length > 0 ? (
          items.map((item) => (
            <StudentAssignmentUploadCard
              key={item.id}
              id={item.id}
              subjectName={item.subjectName}
              title={item.title}
              classTitle={item.classTitle}
              dueLabel={formatDate(item.dueAt)}
              statusLabel={item.submissionStatus ?? 'not started'}
              scoreLabel={graded && item.score ? `Score ${Number(item.score).toFixed(0)}%` : undefined}
              instructions={item.instructions}
              feedbackText={graded ? item.feedbackText : null}
              allowUpload={!graded}
              resources={item.resources}
            />
          ))
        ) : (
          <div className="border-[3px] border-dashed border-dark/30 rounded-2xl p-6 text-sm normal-case text-dark/60 italic">
            {graded ? 'No graded work yet.' : 'Yay! You are all caught up!'}
          </div>
        )}
      </div>
    </section>
  );
}

