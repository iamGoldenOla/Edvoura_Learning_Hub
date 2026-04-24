'use client';

import { useState } from 'react';
import { useBand } from './BandContext';
import ChildHomeworkView from './ChildHomeworkView';
import StudentAssignmentUploadCard from './StudentAssignmentUploadCard';

const formatDate = (value: string | null) => {
  if (!value) return 'No due date';
  return new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
};

type Assignment = {
  id: string;
  title: string;
  classTitle: string;
  subjectName: string;
  dueAt: string | null;
  instructions: string | null;
  submissionStatus: string | null;
  score: string | null;
  feedbackText: string | null;
  resources: Array<{
    id: string;
    fileName: string;
    downloadUrl: string | null;
  }>;
};

export default function StudentHomeworkWorkspace({ 
  assignments 
}: { 
  assignments: Assignment[] 
}) {
  const { band } = useBand();
  const [activeTab, setActiveTab] = useState<'todo' | 'graded'>('todo');

  if (band === '1-3') {
    return <ChildHomeworkView assignments={assignments} />;
  }

  const pending = assignments.filter(
    (a) =>
      !a.submissionStatus ||
      a.submissionStatus === 'draft' ||
      a.submissionStatus === 'submitted' ||
      a.submissionStatus === 'late',
  );
  const graded = assignments.filter(
    (a) =>
      a.submissionStatus === 'graded' || a.submissionStatus === 'returned',
  );

  return (
    <div className="space-y-8">
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
  items: Assignment[];
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
