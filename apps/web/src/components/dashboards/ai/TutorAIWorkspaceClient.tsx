"use client";

import { useEffect, useState } from "react";
import AIContentGeneratorForm, {
  type GeneratorPayload,
} from "./AIContentGeneratorForm";
import AIContentPreview from "./AIContentPreview";
import PendingReviewList from "./PendingReviewList";
import {
  generateEdvouraContent,
  usesLocalBlueprintEngine,
} from "@/lib/ai/contentGenerationService";
import {
  listDashboardAiContent,
  submitForReview,
  deleteDraft,
  publishDirectly,
} from "@/lib/ai/aiContentRepository";
import AIStatusBadge from "./AIStatusBadge";
import { Button } from "@/components/ui/button";
import { getPuterUserIfSignedIn, signInToPuter } from "@/lib/ai/puterClient";
import { EDVOURA_TASK_TYPE_LABELS, type EdvouraTaskType } from "@/lib/ai/edvouraPromptBuilder";

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
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState<string | null>(null);
  const [puterUserLabel, setPuterUserLabel] = useState<string | null>(null);
  const [isConnectingPuter, setIsConnectingPuter] = useState(false);

  async function loadRecords() {
    const data = await listDashboardAiContent("TUTOR");
    setRecords(data.records as TutorRecord[]);
  }

  async function refreshPuterSession() {
    try {
      const user = await getPuterUserIfSignedIn();
      const label =
        user && typeof user === "object" && "username" in user && typeof user.username === "string"
          ? user.username
          : user && typeof user === "object" && "email" in user && typeof user.email === "string"
            ? user.email
            : null;
      setPuterUserLabel(label);
    } catch {
      setPuterUserLabel(null);
    }
  }

  async function connectPuter() {
    setIsConnectingPuter(true);
    setFeedback("Opening Puter sign-in...");
    try {
      const user = await signInToPuter();
      const label =
        user && typeof user === "object" && "username" in user && typeof user.username === "string"
          ? user.username
          : user && typeof user === "object" && "email" in user && typeof user.email === "string"
            ? user.email
            : "connected user";
      setPuterUserLabel(label);
      setFeedback(`Puter connected as ${label}.`);
      return label;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to sign in to Puter.";
      setFeedback(message);
      throw new Error(message);
    } finally {
      setIsConnectingPuter(false);
    }
  }

  useEffect(() => {
    void loadRecords();
    void refreshPuterSession();
  }, []);

  async function onGenerate(payload: GeneratorPayload) {
    setIsGenerating(true);
    setFeedback(
      usesLocalBlueprintEngine(payload.taskType)
        ? "Generating content with the Edvoura lesson blueprint engine..."
        : "Generating content with Edvoura AI...",
    );
    try {
      if (!usesLocalBlueprintEngine(payload.taskType) && !puterUserLabel) {
        await connectPuter();
      }
      const generated = await generateEdvouraContent({
        userRole: "tutor",
        ...payload,
      });
      setPreviewContent(generated.content);
      setFeedback(
        usesLocalBlueprintEngine(payload.taskType)
          ? "Draft generated from the Edvoura lesson blueprint engine and saved."
          : "Draft generated and saved. Submit it for super admin review.",
      );
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

  async function onDeleteDraft(contentId: string) {
    if (!confirm("Are you sure you want to delete this draft?")) return;
    setIsDeleting(contentId);
    try {
      await deleteDraft(contentId);
      setFeedback("Draft deleted successfully.");
      setPreviewContent(null);
      await loadRecords();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to delete draft.");
    } finally {
      setIsDeleting(null);
    }
  }

  async function onPublishDirectly(contentId: string) {
    if (!confirm("Are you sure you want to publish this directly to the student dashboard?")) return;
    setIsPublishing(contentId);
    try {
      await publishDirectly(contentId);
      setFeedback("Content published directly to the student dashboard.");
      await loadRecords();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to publish directly.");
    } finally {
      setIsPublishing(null);
    }
  }

  async function onRegenerate(record: TutorRecord) {
    setIsGenerating(true);
    setFeedback("Regenerating a fresh draft...");
    try {
      if (!puterUserLabel) {
        await connectPuter();
      }
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
      if (!puterUserLabel) {
        await connectPuter();
      }
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
    <div className="mx-auto w-full min-w-0 max-w-[1680px] space-y-6 p-4 pb-24 sm:space-y-8 sm:p-8">
      <section className="rounded-[24px] border-[4px] border-dark bg-white p-4 shadow-[8px_8px_0px_#060E1C] sm:p-6">
        <h1 className="text-2xl font-black tracking-tight text-dark sm:text-3xl">Tutor AI Content Generator</h1>
        <p className="mt-2 text-sm font-bold text-dark/70">
          Generate teacher-facing lesson plans, student-facing lesson notes, quizzes, spelling content,
          and adaptive draft content. Tutors can publish directly or submit for super admin review.
        </p>
        <div className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="rounded-xl border-[2px] border-dark bg-off-white px-3 py-2 text-xs font-black text-dark">
            Puter Session: {puterUserLabel ? `Connected as ${puterUserLabel}` : "Not connected"}
          </div>
          <Button
            type="button"
            onClick={() => void connectPuter()}
            disabled={isConnectingPuter}
            className="bg-white border-[2px] border-dark text-dark px-4 py-2 text-xs font-black"
          >
            {isConnectingPuter
              ? "Connecting..."
              : puterUserLabel
                ? "Reconnect Puter"
                : "Connect Puter"}
          </Button>
        </div>
      </section>

      {feedback ? (
        <section className="rounded-xl border-[3px] border-dark bg-blue-100 p-4 text-sm font-black text-dark shadow-[3px_3px_0px_#060E1C]">
          {feedback}
        </section>
      ) : null}

      <AIContentGeneratorForm disabled={isGenerating} onGenerate={onGenerate} />

      {previewContent ? <AIContentPreview content={previewContent} /> : null}

      <section className="rounded-2xl border-[3px] border-dark bg-white p-4 shadow-[4px_4px_0px_#060E1C] sm:p-5">
        <h2 className="mb-4 text-lg font-black text-dark sm:text-xl">Drafts Ready For Submission</h2>
        <div className="space-y-3">
          {draftRecords.length === 0 ? (
            <div className="rounded-xl border-[2px] border-dark bg-off-white p-4 text-sm font-semibold text-dark/70">
              No drafts yet.
            </div>
          ) : null}
          {draftRecords.map((record) => (
            <article key={record.id} className="rounded-xl border-[2px] border-dark bg-off-white p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-black text-dark break-words">{record.title}</p>
                <AIStatusBadge status={record.status} />
              </div>
              <p className="mt-1 text-xs font-bold text-dark/70">
                {record.subject} | {record.topic} | {record.grade} | {EDVOURA_TASK_TYPE_LABELS[record.task_type as EdvouraTaskType] ?? record.task_type}
              </p>

              <div className="mt-3 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
                <Button
                  type="button"
                  onClick={() => setPreviewContent(record.content_json)}
                  className="border-[2px] border-dark bg-white px-3 py-2 text-xs font-black text-dark"
                >
                  Preview
                </Button>
                <Button
                  type="button"
                  onClick={() => void onImprove(record)}
                  disabled={isGenerating}
                  className="border-[2px] border-dark bg-blue-200 px-3 py-2 text-xs font-black text-dark"
                >
                  Improve with AI
                </Button>
                <Button
                  type="button"
                  onClick={() => void onRegenerate(record)}
                  disabled={isGenerating}
                  className="border-[2px] border-dark bg-amber-200 px-3 py-2 text-xs font-black text-dark"
                >
                  Regenerate
                </Button>
                <Button
                  type="button"
                  onClick={() => void onSubmitForReview(record.id)}
                  disabled={isSubmitting === record.id}
                  className="border-[2px] border-dark bg-yellow px-3 py-2 text-xs font-black text-dark"
                >
                  {isSubmitting === record.id ? "Submitting..." : "Submit for Review"}
                </Button>
                <Button
                  type="button"
                  onClick={() => void onPublishDirectly(record.id)}
                  disabled={isPublishing === record.id}
                  className="border-[2px] border-dark bg-green-400 px-3 py-2 text-xs font-black text-dark"
                >
                  {isPublishing === record.id ? "Publishing..." : "Publish to Student"}
                </Button>
                <Button
                  type="button"
                  onClick={() => void onDeleteDraft(record.id)}
                  disabled={isDeleting === record.id}
                  className="border-[2px] border-dark bg-red-400 px-3 py-2 text-xs font-black text-dark sm:ml-auto"
                >
                  {isDeleting === record.id ? "Deleting..." : "Delete"}
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
        onPublishDirectly={onPublishDirectly}
      />
    </div>
  );
}
