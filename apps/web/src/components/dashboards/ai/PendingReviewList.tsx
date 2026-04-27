"use client";

import AIStatusBadge from "./AIStatusBadge";
import AIContentReviewActions from "./AIContentReviewActions";

type RecordItem = {
  id: string;
  title: string;
  subject: string;
  topic: string;
  grade: string;
  skill_type?: string;
  task_type: string;
  status: string;
  review_note: string | null;
  content_json: unknown;
};

export default function PendingReviewList({
  title,
  records,
  superAdminMode = false,
  onReviewAction,
  onImproveWithAI,
  onPreview,
}: {
  title: string;
  records: RecordItem[];
  superAdminMode?: boolean;
  onReviewAction?: (params: {
    action: "APPROVE" | "REJECT" | "REQUEST_CHANGES" | "PUBLISH";
    contentId: string;
    reviewNote?: string;
  }) => Promise<void>;
  onImproveWithAI?: (record: RecordItem) => Promise<void>;
  onPreview: (content: unknown) => void;
}) {
  return (
    <section className="rounded-2xl border-[3px] border-dark bg-white p-5 shadow-[4px_4px_0px_#060E1C]">
      <h2 className="mb-4 text-xl font-black text-dark">{title}</h2>
      <div className="space-y-3">
        {records.length === 0 ? (
          <div className="rounded-xl border-[2px] border-dark bg-off-white p-4 text-sm font-semibold text-dark/70">
            No records yet.
          </div>
        ) : null}
        {records.map((record) => (
          <article key={record.id} className="rounded-xl border-[2px] border-dark bg-off-white p-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="font-black text-dark">{record.title}</p>
              <AIStatusBadge status={record.status} />
            </div>
            <p className="text-xs font-bold text-dark/70">
              {record.subject} | {record.topic} | {record.grade} | {record.task_type}
            </p>
            {record.review_note ? (
              <p className="mt-2 rounded-lg border border-dark/30 bg-white p-2 text-xs font-semibold text-dark/80">
                Review note: {record.review_note}
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onPreview(record.content_json)}
                className="rounded-lg border-[2px] border-dark bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0px_#060E1C] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
              >
                Preview JSON
              </button>
              {superAdminMode && onImproveWithAI ? (
                <button
                  type="button"
                  onClick={() => void onImproveWithAI(record)}
                  className="rounded-lg border-[2px] border-dark bg-yellow px-3 py-2 text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0px_#060E1C] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                >
                  Improve with AI
                </button>
              ) : null}
            </div>
            {superAdminMode && onReviewAction ? (
              <div className="mt-3">
                <AIContentReviewActions
                  contentId={record.id}
                  status={record.status}
                  onAction={onReviewAction}
                />
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
