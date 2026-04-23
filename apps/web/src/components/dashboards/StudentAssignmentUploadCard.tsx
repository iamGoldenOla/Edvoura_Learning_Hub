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
  instructions?: string | null;
  feedbackText?: string | null;
  allowUpload?: boolean;
  resources?: Array<{
    id: string;
    fileName: string;
    downloadUrl: string | null;
  }>;
};

export default function StudentAssignmentUploadCard(props: AssignmentCardProps) {
  const [selectedFile, setSelectedFile] = useState('');
  const [selectedBlob, setSelectedBlob] = useState<File | null>(null);
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

      {props.instructions ? (
        <div className="mt-4 border-l-4 border-yellow bg-slate-50 p-4">
          <p className="text-sm font-bold text-dark uppercase tracking-wider text-[10px] mb-1">Tutor Instructions</p>
          <p className="text-sm normal-case text-dark/80 whitespace-pre-wrap">{props.instructions}</p>
        </div>
      ) : null}

      {props.allowUpload ? (
        <div className="mt-4 rounded-xl border-[2px] border-dark bg-off-white p-3">
          <p className="text-xs font-semibold text-dark/70">Submit assignment work</p>
          <input
            type="file"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              const fileName = file?.name ?? '';
              setSelectedFile(fileName);
              setSelectedBlob(file);
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
                const { data, error } = await supabase.rpc('submit_student_assignment', {
                  target_assignment_id: props.id,
                  submission_text: reflection.trim() || null,
                  submission_metadata: selectedFile ? { draftFileName: selectedFile } : {},
                });

                if (error) {
                  setIsSubmitting(false);
                  setMessage(error.message);
                  return;
                }

                const submission = Array.isArray(data) ? data[0] : null;

                if (submission?.submission_id && selectedBlob) {
                  const safeName = `${Date.now()}-${selectedBlob.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
                  const objectPath = `submissions/${submission.submission_id}/${safeName}`;
                  const upload = await supabase.storage.from('student-work').upload(objectPath, selectedBlob, {
                    cacheControl: '3600',
                    upsert: false,
                  });

                  if (upload.error) {
                    setIsSubmitting(false);
                    setMessage(upload.error.message);
                    return;
                  }

                  const attach = await supabase.rpc('attach_submission_file', {
                    target_submission_id: submission.submission_id,
                    object_path: objectPath,
                    bucket_id: 'student-work',
                  });

                  if (attach.error) {
                    setIsSubmitting(false);
                    setMessage(attach.error.message);
                    return;
                  }
                }

                setIsSubmitting(false);
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

      {props.resources && props.resources.length > 0 ? (
        <div className="mt-4 rounded-xl border-[2px] border-dark bg-off-white p-3">
          <p className="text-xs font-semibold text-dark/70">Assignment resources</p>
          <div className="mt-2 space-y-2">
            {props.resources.map((resource) =>
              resource.downloadUrl ? (
                <a
                  key={resource.id}
                  href={resource.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-lg border-[2px] border-dark bg-white px-3 py-2 text-xs font-semibold text-dark"
                >
                  {resource.fileName}
                </a>
              ) : (
                <div key={resource.id} className="rounded-lg border-[2px] border-dark bg-white px-3 py-2 text-xs font-semibold text-dark/70">
                  {resource.fileName}
                </div>
              ),
            )}
          </div>
        </div>
      ) : null}

      {props.feedbackText ? (
        <p className="mt-4 text-sm normal-case text-dark/70 font-semibold">{props.feedbackText}</p>
      ) : null}
    </article>
  );
}
