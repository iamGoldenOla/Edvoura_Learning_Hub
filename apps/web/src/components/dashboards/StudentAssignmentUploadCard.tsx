'use client';

import { useState } from 'react';

import { createClient } from '@/utils/supabase/client';

type AssignmentCardProps = {
  id: string;
  subjectName: string;
  title: string;
  classTitle: string;
  dueLabel: string;
  statusLabel: string;
  scoreLabel?: string;
  feedbackText?: string | null;
  allowUpload?: boolean;
};

export default function StudentAssignmentUploadCard(props: AssignmentCardProps) {
  const [selectedFile, setSelectedFile] = useState('');
  const [reflection, setReflection] = useState('');
  const [message, setMessage] = useState('');
  const [uploadedFile, setUploadedFile] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <article className="border-[3px] border-dark rounded-2xl bg-white p-5">
      <p className="text-[11px] tracking-[0.25em] text-dark/40">{props.subjectName}</p>
      <h3 className="text-xl font-black text-dark">{props.title}</h3>
      <p className="text-sm normal-case text-dark/70 font-semibold">{props.classTitle}</p>
      <div className="mt-4 flex flex-wrap gap-3 text-[11px]">
        <span className="px-3 py-2 border-[2px] border-dark bg-off-white">{props.dueLabel}</span>
        <span className="px-3 py-2 border-[2px] border-dark bg-off-white">{props.statusLabel}</span>
        {props.scoreLabel ? (
          <span className="px-3 py-2 border-[2px] border-dark bg-yellow">{props.scoreLabel}</span>
        ) : null}
      </div>

      {props.allowUpload ? (
        <div className="mt-4 rounded-xl border-[2px] border-dark bg-off-white p-3">
          <p className="text-xs font-semibold text-dark/70">Submit assignment work</p>
          <input
            type="file"
            onChange={(event) => {
              const fileName = event.target.files?.[0]?.name ?? '';
              setSelectedFile(fileName);
            }}
            className="mt-2 block w-full text-xs text-dark/80 file:mr-2 file:rounded file:border file:border-dark file:bg-white file:px-2 file:py-1"
          />
          <textarea
            value={reflection}
            onChange={(event) => setReflection(event.target.value)}
            placeholder="Add a short answer or note for your tutor (optional)"
            className="mt-3 min-h-24 w-full rounded-xl border-[2px] border-dark bg-white px-3 py-2 text-xs text-dark/80 outline-none"
          />
          <p className="mt-2 text-[11px] text-dark/60">
            Storage upload is the next phase. For now, the dashboard records your submission and the selected file name.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={async () => {
                if (!selectedFile && !reflection.trim()) {
                  setMessage('Add a short note or choose a file name before submitting.');
                  return;
                }

                setIsSubmitting(true);
                setMessage('');

                const supabase = createClient();
                const { error } = await supabase.rpc('submit_student_assignment', {
                  target_assignment_id: props.id,
                  submission_text: reflection.trim() || null,
                  submission_metadata: selectedFile ? { draftFileName: selectedFile } : {},
                });

                setIsSubmitting(false);

                if (error) {
                  setMessage(error.message);
                  return;
                }

                setUploadedFile(selectedFile || 'Text response only');
                setMessage('Submission recorded. Refreshing dashboard...');
                window.location.reload();
              }}
              className="inline-flex items-center justify-center rounded-md border-[2px] border-dark bg-yellow px-3 py-1.5 text-xs font-black text-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
            </button>
          </div>
          {uploadedFile ? <p className="mt-2 text-xs text-green-700">Latest submission: {uploadedFile}</p> : null}
          {message ? <p className="mt-1 text-xs text-dark/70">{message}</p> : null}
        </div>
      ) : null}

      {props.feedbackText ? (
        <p className="mt-4 text-sm normal-case text-dark/70 font-semibold">{props.feedbackText}</p>
      ) : null}
    </article>
  );
}
