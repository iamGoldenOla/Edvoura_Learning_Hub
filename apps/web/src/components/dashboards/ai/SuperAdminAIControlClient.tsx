"use client";

import { useEffect, useMemo, useState } from "react";
import AIContentGeneratorForm, {
  type GeneratorPayload,
} from "./AIContentGeneratorForm";
import AIContentPreview from "./AIContentPreview";
import PendingReviewList, { type PendingReviewRecord } from "./PendingReviewList";
import { generateEdvouraContent } from "@/lib/ai/contentGenerationService";
import {
  listDashboardAiContent,
  reviewContent,
  type DashboardAiStatus,
} from "@/lib/ai/aiContentRepository";

type RecordItem = PendingReviewRecord & {
  status: DashboardAiStatus;
};

export default function SuperAdminAIControlClient() {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [previewContent, setPreviewContent] = useState<unknown>(null);
  const [feedback, setFeedback] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  async function loadRecords() {
    const data = await listDashboardAiContent("SUPER_ADMIN");
    setRecords(data.records as RecordItem[]);
  }

  useEffect(() => {
    void loadRecords();
  }, []);

  async function onGenerate(payload: GeneratorPayload) {
    setIsGenerating(true);
    setFeedback("Generating super-admin draft...");
    try {
      const generated = await generateEdvouraContent({
        userRole: "super_admin",
        ...payload,
      });
      setPreviewContent(generated.content);
      setFeedback("Draft generated and saved.");
      await loadRecords();
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "AI generation is temporarily unavailable. You can still create or edit this content manually.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function onImproveWithAI(record: RecordItem) {
    setIsGenerating(true);
    setFeedback("Improving selected content with Edvoura AI...");
    try {
      const generated = await generateEdvouraContent({
        userRole: "super_admin",
        taskType: "IMPROVE_CONTENT",
        subject: record.subject,
        topic: record.topic,
        grade: record.grade,
        skillType: record.skill_type ?? "Core Academic",
        existingContent: JSON.stringify(record.content_json),
        extraInstruction:
          "Improve clarity, structure, and originality. Keep grade appropriateness and educational objective intact.",
      });
      setPreviewContent(generated.content);
      setFeedback("Improved draft generated and saved.");
      await loadRecords();
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "Unable to improve content right now.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function onReviewAction(params: {
    action: "APPROVE" | "REJECT" | "REQUEST_CHANGES" | "PUBLISH";
    contentId: string;
    reviewNote?: string;
  }) {
    try {
      await reviewContent(params);
      setFeedback(`Action ${params.action} completed.`);
      await loadRecords();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to update review status.");
    }
  }

  const pending = useMemo(
    () => records.filter((entry) => entry.status.toUpperCase() === "PENDING_REVIEW"),
    [records],
  );
  const approved = useMemo(
    () => records.filter((entry) => entry.status.toUpperCase() === "APPROVED"),
    [records],
  );
  const published = useMemo(
    () => records.filter((entry) => entry.status.toUpperCase() === "PUBLISHED"),
    [records],
  );

  return (
    <div className="mx-auto max-w-[1680px] space-y-8 p-6 sm:p-8 pb-24">
      <section className="rounded-[24px] border-[4px] border-dark bg-white p-6 shadow-[8px_8px_0px_#060E1C]">
        <h1 className="text-3xl font-black tracking-tight text-dark">Super Admin AI Control Center</h1>
        <p className="mt-2 text-sm font-bold text-dark/70">
          Review all tutor-generated drafts, improve quality, approve, reject, request changes, and publish.
        </p>
      </section>

      {feedback ? (
        <section className="rounded-xl border-[3px] border-dark bg-blue-100 p-4 text-sm font-black text-dark shadow-[3px_3px_0px_#060E1C]">
          {feedback}
        </section>
      ) : null}

      <AIContentGeneratorForm disabled={isGenerating} onGenerate={onGenerate} />

      {previewContent ? (
        <AIContentPreview content={previewContent} title="AI Content Preview (Selected)" />
      ) : null}

      <PendingReviewList
        title="Pending AI Content Review"
        records={pending}
        superAdminMode
        onReviewAction={onReviewAction}
        onImproveWithAI={onImproveWithAI}
        onPreview={setPreviewContent}
      />
      <PendingReviewList
        title="Approved Content"
        records={approved}
        superAdminMode
        onReviewAction={onReviewAction}
        onImproveWithAI={onImproveWithAI}
        onPreview={setPreviewContent}
      />
      <PendingReviewList
        title="Published Content"
        records={published}
        onPreview={setPreviewContent}
      />
    </div>
  );
}
