"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type ReviewAction = "APPROVE" | "REJECT" | "REQUEST_CHANGES" | "PUBLISH";

export default function AIContentReviewActions({
  contentId,
  status,
  onAction,
}: {
  contentId: string;
  status: string;
  onAction: (params: {
    action: ReviewAction;
    contentId: string;
    reviewNote?: string;
  }) => Promise<void>;
}) {
  const [reviewNote, setReviewNote] = useState("");
  const upper = status.toUpperCase();
  const canPublish = upper === "APPROVED";
  const canApproveReject = upper === "PENDING_REVIEW" || upper === "REJECTED";

  return (
    <div className="space-y-3 rounded-xl border-[2px] border-dark bg-off-white p-3">
      <textarea
        value={reviewNote}
        onChange={(event) => setReviewNote(event.target.value)}
        rows={2}
        placeholder="Review note (required for reject/request changes)"
        className="w-full rounded-lg border-[2px] border-dark bg-white p-2 text-xs font-semibold outline-none"
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={!canApproveReject}
          onClick={() => void onAction({ action: "APPROVE", contentId, reviewNote })}
          className="bg-emerald-400 border-[2px] border-dark text-dark px-3 py-2 text-xs font-black"
        >
          Approve
        </Button>
        <Button
          type="button"
          disabled={!canApproveReject}
          onClick={() => void onAction({ action: "REQUEST_CHANGES", contentId, reviewNote })}
          className="bg-amber-300 border-[2px] border-dark text-dark px-3 py-2 text-xs font-black"
        >
          Request Changes
        </Button>
        <Button
          type="button"
          disabled={!canApproveReject}
          onClick={() => void onAction({ action: "REJECT", contentId, reviewNote })}
          className="bg-rose-300 border-[2px] border-dark text-dark px-3 py-2 text-xs font-black"
        >
          Reject
        </Button>
        <Button
          type="button"
          disabled={!canPublish}
          onClick={() => void onAction({ action: "PUBLISH", contentId, reviewNote })}
          className="bg-violet-300 border-[2px] border-dark text-dark px-3 py-2 text-xs font-black"
        >
          Publish
        </Button>
      </div>
    </div>
  );
}
