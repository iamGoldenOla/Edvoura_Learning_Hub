"use client";

import { useEffect, useState } from "react";
import AIContentGeneratorForm, {
  type GeneratorPayload,
} from "./AIContentGeneratorForm";
import AIContentPreview from "./AIContentPreview";
import PendingReviewList from "./PendingReviewList";
import { generateEdvouraContent } from "@/lib/ai/contentGenerationService";
import {
  listDashboardAiContent,
  submitForReview,
} from "@/lib/ai/aiContentRepository";
import AIStatusBadge from "./AIStatusBadge";
import { Button } from "@/components/ui/button";

type TutorRecord = {
  id: string;
  title: string;
  subject: string;
  topic: string;
  grade: string;
  skill_type: string;
  task_type: string;
  status: string;
  content_json: unknown;
  review_note: string | null;
  created_at: string;
};

export default function TutorAIWorkspaceClient() {
  const [records, setRecords] = useState<TutorRecord[]>([]);
  const [previewContent, setPreviewContent] = useState<unknown>(null);
  const [feedback, setFeedback] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

  async function loadRecords() {
    const data = await listDashboardAiContent("TUTOR");
    setRecords(data.records as TutorRecord[]);
  }

  useEffect(() => {
    void loadRecords();
  }, []);

  async function onGenerate(payload: GeneratorPayload) {
    setIsGenerating(true);
    setFeedback("Generating content with Edvoura AI...");
    try {
      const generated = await generateEdvouraContent({
        userRole: "tutor",
        ...payload,
      });
      setPreviewContent(generated.content);
      setFeedback("Draft generated and saved. Submit it for super admin review.");
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

  async function onSubmitForReview(contentId: string) {
    setIsSubmitting(contentId);
    try {
      await submitForReview(contentId);
      setFeedback("Content submitted for super admin review.");
      await loadRecords();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to submit for review.");
    } finally {
      setIsSubmitting(null);
    }
  }

  async function onRegenerate(record: TutorRecord) {
    setIsGenerating(true);
    setFeedback("Regenerating a fresh draft...");
    try {
      const generated = await generateEdvouraContent({
        userRole: "tutor",
        taskType: "REGENERATE_CONTENT",
        subject: record.subject,
        topic: record.topic,
        grade: record.grade,
        skillType: record.skill_type,
        existingContent: JSON.stringify(record.content_json),
        extraInstruction:
          "Regenerate with new examples and non-repetitive question structure while preserving topic coverage.",
      });
      setPreviewContent(generated.content);
      setFeedback("Regenerated draft saved.");
      await loadRecords();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to regenerate content.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function onImprove(record: TutorRecord) {
    setIsGenerating(true);
    setFeedback("Improving draft with Edvoura AI...");
    try {
      const generated = await generateEdvouraContent({
        userRole: "tutor",
        taskType: "IMPROVE_CONTENT",
        subject: record.subject,
        topic: record.topic,
        grade: record.grade,
        skillType: record.skill_type,
        existingContent: JSON.stringify(record.content_json),
        extraInstruction:
          "Improve clarity, flow, and pedagogical quality without changing grade appropriateness.",
      });
      setPreviewContent(generated.content);
      setFeedback("Improved draft saved.");
      await loadRecords();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to improve content.");
    } finally {
      setIsGenerating(false);
    }
  }

  const draftRecords = records.filter((entry) => entry.status.toUpperCase() === "DRAFT");
  const reviewRecords = records.filter((entry) =>
    ["PENDING_REVIEW", "APPROVED", "REJECTED", "PUBLISHED"].includes(entry.status.toUpperCase()),
  );

  return (
    <div className="mx-auto max-w-[1680px] space-y-8 p-6 sm:p-8 pb-24">
      <section className="rounded-[24px] border-[4px] border-dark bg-white p-6 shadow-[8px_8px_0px_#060E1C]">
        <h1 className="text-3xl font-black tracking-tight text-dark">Tutor AI Content Generator</h1>
        <p className="mt-2 text-sm font-bold text-dark/70">
          Generate lessons, quizzes, spelling, financial literacy, and communication skill drafts.
          Human review stays mandatory before student publishing.
        </p>
      </section>

      {feedback ? (
        <section className="rounded-xl border-[3px] border-dark bg-blue-100 p-4 text-sm font-black text-dark shadow-[3px_3px_0px_#060E1C]">
          {feedback}
        </section>
      ) : null}

      <AIContentGeneratorForm disabled={isGenerating} onGenerate={onGenerate} />

      {previewContent ? <AIContentPreview content={previewContent} /> : null}

      <section className="rounded-2xl border-[3px] border-dark bg-white p-5 shadow-[4px_4px_0px_#060E1C]">
        <h2 className="mb-4 text-xl font-black text-dark">Drafts Ready For Submission</h2>
        <div className="space-y-3">
          {draftRecords.length === 0 ? (
            <div className="rounded-xl border-[2px] border-dark bg-off-white p-4 text-sm font-semibold text-dark/70">
              No drafts yet.
            </div>
          ) : null}
          {draftRecords.map((record) => (
            <article key={record.id} className="rounded-xl border-[2px] border-dark bg-off-white p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-black text-dark">{record.title}</p>
                <AIStatusBadge status={record.status} />
              </div>
              <p className="mt-1 text-xs font-bold text-dark/70">
                {record.subject} | {record.topic} | {record.grade} | {record.task_type}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={() => setPreviewContent(record.content_json)}
                  className="bg-white border-[2px] border-dark text-dark px-3 py-2 text-xs font-black"
                >
                  Preview
                </Button>
                <Button
                  type="button"
                  onClick={() => void onImprove(record)}
                  disabled={isGenerating}
                  className="bg-blue-200 border-[2px] border-dark text-dark px-3 py-2 text-xs font-black"
                >
                  Improve with AI
                </Button>
                <Button
                  type="button"
                  onClick={() => void onRegenerate(record)}
                  disabled={isGenerating}
                  className="bg-amber-200 border-[2px] border-dark text-dark px-3 py-2 text-xs font-black"
                >
                  Regenerate
                </Button>
                <Button
                  type="button"
                  onClick={() => void onSubmitForReview(record.id)}
                  disabled={isSubmitting === record.id}
                  className="bg-yellow border-[2px] border-dark text-dark px-3 py-2 text-xs font-black"
                >
                  {isSubmitting === record.id ? "Submitting..." : "Submit for Review"}
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <PendingReviewList
        title="Submitted and Reviewed Content"
        records={reviewRecords}
        onPreview={(content) => setPreviewContent(content)}
      />
    </div>
  );
}
